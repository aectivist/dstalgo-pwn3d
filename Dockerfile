# Multi-stage build: judge-host (compiled) + the Node app, packaged into one
# image so the Node parent process can spawn `dotnet JudgeHost.dll` as it
# does outside Docker (see server/csharpJudge.js).

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS judge-build
WORKDIR /src/judge-host
COPY judge-host/ .
RUN dotnet build -c Release

FROM node:20-bookworm-slim
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates wget \
 && wget -q https://dot.net/v1/dotnet-install.sh -O /tmp/dotnet-install.sh \
 && chmod +x /tmp/dotnet-install.sh \
 && /tmp/dotnet-install.sh --channel 9.0 --runtime dotnet --install-dir /usr/share/dotnet \
 && ln -s /usr/share/dotnet/dotnet /usr/bin/dotnet \
 && apt-get purge -y wget \
 && rm -rf /var/lib/apt/lists/* /tmp/dotnet-install.sh

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server/ server/
COPY public/ public/
COPY --from=judge-build /src/judge-host/bin/Release/net9.0 judge-host/bin/Release/net9.0

RUN mkdir -p data && chown -R node:node /app
USER node

ENV PORT=3000
EXPOSE 3000

CMD ["sh", "-c", "node server/seed.js && node server/index.js"]
