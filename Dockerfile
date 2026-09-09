# Multi-stage build: judge-host (compiled) + the Node app, packaged into one
# image so the Node parent process can spawn `dotnet JudgeHost.dll` as it
# does outside Docker (see server/csharpJudge.js).
#
# judge-host now actually compiles each submission with `dotnet build`
# (see judge-host/Program.cs) instead of using Roslyn scripting, so the
# final image needs the full .NET SDK, not just the runtime -- and since
# the running container has no network access at all (see the isolation
# notes in DEPLOYMENT.md's Docker section), the submission project template
# is restored once here, at image-build time, and baked into the image so
# every real submission builds with `--no-restore` and never touches the
# network.

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS judge-build
WORKDIR /src/judge-host
COPY judge-host/ .
RUN dotnet build -c Release

FROM node:20-bookworm-slim
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates wget \
 && wget -q https://dot.net/v1/dotnet-install.sh -O /tmp/dotnet-install.sh \
 && chmod +x /tmp/dotnet-install.sh \
 && /tmp/dotnet-install.sh --channel 9.0 --install-dir /usr/share/dotnet \
 && ln -s /usr/share/dotnet/dotnet /usr/bin/dotnet \
 && apt-get purge -y wget \
 && rm -rf /var/lib/apt/lists/* /tmp/dotnet-install.sh

ENV DOTNET_NOLOGO=1 \
    DOTNET_CLI_TELEMETRY_OPTOUT=1 \
    DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1 \
    JUDGE_TEMPLATE_DIR=/opt/judge-template \
    DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1

# Restore + build the submission template once, with network available at
# image-build time, so every real submission's `dotnet build --no-restore`
# at request time is 100% local -- no NuGet, no network, matching the
# container's runtime network isolation.
COPY submission-template/ /tmp/judge-template-src/
RUN dotnet build /tmp/judge-template-src/Submission.csproj -c Release -o /tmp/judge-template-src/out \
 && mkdir -p /opt/judge-template \
 && cp /tmp/judge-template-src/Submission.csproj /opt/judge-template/ \
 && cp -r /tmp/judge-template-src/obj /opt/judge-template/obj \
 && rm -rf /tmp/judge-template-src

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server/ server/
COPY public/ public/
COPY --from=judge-build /src/judge-host/bin/Release/net9.0 judge-host/bin/Release/net9.0

RUN mkdir -p data \
 && chown -R node:node /app /opt/judge-template
USER node

# HOME must be writable (the SDK/NuGet occasionally touch $HOME-relative
# paths, e.g. first-run sentinels) -- the container filesystem is
# read-only except /tmp (tmpfs) and /app/data (volume), so point HOME at
# the writable tmpfs rather than the image's baked-in /home/node.
ENV HOME=/tmp/home
ENV PORT=3000
EXPOSE 3000

CMD ["sh", "-c", "mkdir -p \"$HOME\" && node server/seed.js && node server/index.js"]
