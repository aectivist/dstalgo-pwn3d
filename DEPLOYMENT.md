# Deploying DSTALGO PWN3D to the public internet

This covers putting the app on a Linux server you control, pointing your own
domain at it via DNS, and serving it over HTTPS. It assumes a fresh Ubuntu/
Debian-style VPS (DigitalOcean, Linode, Hetzner, a home server, etc. --
adjust package manager commands if you're on something else), and that
you've already got a domain registered somewhere.

## ⚠️ Read this before you expose it publicly

This app was built for **you** to run **your own code**, not as a
multi-tenant public judge. The C# execution model is:

- Submitted code is compiled and run in-process by `judge-host` via Roslyn
  scripting, with **full access to the .NET base class library** -- file
  I/O, process spawning, network calls, reflection, all of it are available
  to submitted code, exactly like any other C# program.
- The *only* protection against a submission behaving badly is a wall-clock
  timeout enforced by the Node parent process (kill the child if it doesn't
  respond in time). That stops infinite loops. It does **not** stop a
  submission from reading files, making outbound network requests, or
  otherwise doing something you wouldn't want a stranger's code doing on
  your machine.

If you put this on the public internet and let anyone register an account,
anyone with an account can run arbitrary C# on your server. Pick one of
these before you do that:

1. **Don't open registration to the public.** Simplest option: keep the site
   reachable only to people you trust (register accounts for them yourself,
   or put it behind a VPN/Tailscale instead of the open internet). This
   sidesteps the problem entirely and is what's recommended if you just
   want to share it with classmates or friends.
2. **Run the whole app inside one locked-down container**, so even a
   malicious submission is contained to a throwaway sandbox with no network
   and no access to anything outside it. See the Docker section below for a
   concrete `docker run` command with the right flags. This is a real
   mitigation, not a full guarantee -- container escapes exist, just less
   likely than "no isolation at all."
3. **Accept the risk deliberately**, understanding what it means, if this is
   a low-stakes personal server you're fine re-provisioning from scratch.

None of these are "solved" security -- there's no config flag that turns
this into a hardened public judge. If you want that, the real fix is
running each submission in its own short-lived, network-disabled,
resource-limited container/VM (gVisor, Firecracker, nsjail, etc.), which is
a significantly bigger project than this app.

## 1. Server prerequisites

SSH into your server, then:

```bash
# Node.js (LTS) -- via NodeSource
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs git

# .NET SDK (for building/running judge-host)
sudo apt-get install -y dotnet-sdk-9.0   # or use Microsoft's install script
                                          # (learn.microsoft.com/dotnet/core/install/linux)
dotnet --version
```

## 2. Get the code onto the server and set it up

```bash
git clone https://github.com/<your-username>/<your-repo>.git dstalgo-pwn3d
cd dstalgo-pwn3d

cd judge-host && dotnet build -c Release && cd ..

npm install
npm run seed
```

Sanity-check it runs: `npm start`, then from another terminal
`curl http://localhost:3000/api/problems` should return JSON. Ctrl+C it --
the next section runs it properly as a background service.

## 3. Run it as a persistent service (systemd)

Create a dedicated, unprivileged user to run it as (don't run it as root):

```bash
sudo useradd --system --create-home --shell /usr/sbin/nologin dstalgo
sudo chown -R dstalgo:dstalgo /path/to/dstalgo-pwn3d
```

Create `/etc/systemd/system/dstalgo.service`:

```ini
[Unit]
Description=DSTALGO PWN3D
After=network.target

[Service]
Type=simple
User=dstalgo
WorkingDirectory=/path/to/dstalgo-pwn3d
ExecStart=/usr/bin/node server/index.js
Environment=PORT=3000
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now dstalgo
sudo systemctl status dstalgo     # should show "active (running)"
journalctl -u dstalgo -f          # tail its logs
```

The app now restarts automatically on crash and on server reboot, and
listens on `127.0.0.1:3000` (not yet reachable from the internet -- that's
the reverse proxy's job, next).

## 4. Point your domain at the server (DNS)

In your domain registrar's or DNS provider's dashboard, add an **A record**:

| Type | Host                      | Value             | TTL   |
|------|---------------------------|--------------------|-------|
| A    | `@` (or a subdomain, e.g. `judge`) | your server's public IPv4 address | 3600 (or "Auto") |

If your server has an IPv6 address too, add a matching **AAAA record**
pointing at it. DNS changes can take anywhere from a few minutes to a few
hours to propagate; `dig +short yourdomain.com` (from your own machine)
tells you what's currently resolving.

You don't need any special DNS provider for this -- whatever registrar or
DNS host you already use (Cloudflare, Namecheap, Google Domains successor,
your registrar's built-in DNS, etc.) works the same way: it's just an A
record.

## 5. Reverse proxy + automatic HTTPS

You need something in front of Node to terminate HTTPS on port 443 and
proxy to `127.0.0.1:3000`. **Caddy** is the easiest way to get this right --
it gets a free Let's Encrypt certificate and renews it automatically, with
about 5 lines of config.

```bash
sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt-get update && sudo apt-get install -y caddy
```

Edit `/etc/caddy/Caddyfile`:

```
yourdomain.com {
    reverse_proxy 127.0.0.1:3000
}
```

```bash
sudo systemctl reload caddy
```

That's it -- Caddy handles the certificate request/renewal for
`yourdomain.com` automatically the first time it starts, as long as your DNS
A record (step 4) is already pointing at this server and ports 80/443 are
reachable.

<details>
<summary>Prefer Nginx + certbot instead?</summary>

```bash
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

`/etc/nginx/sites-available/dstalgo`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/dstalgo /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com   # gets the cert and rewrites the config for HTTPS
```
</details>

## 6. Firewall

Only ports 22 (SSH), 80, and 443 need to be open to the world -- 3000
should stay bound to `127.0.0.1` only (which it already is, since Node
listens on all interfaces by default but nothing routes to it externally
unless you've opened that port; to be explicit about it):

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 7. (Optional) Running it in a locked-down container instead

If you're leaning toward opening this up more broadly, run the whole thing
in Docker with the network disabled and hard resource caps, rather than
directly on the host:

```bash
docker run -d \
  --name dstalgo \
  --network none \
  --read-only \
  --tmpfs /tmp \
  --memory=512m --cpus=1 \
  --pids-limit=256 \
  --user 1000:1000 \
  -v dstalgo-data:/app/data \
  -p 127.0.0.1:3000:3000 \
  your-built-image
```

You'd still put Caddy/Nginx in front of it the same way as above. Note
`--network none` means the container (and therefore judge-host) can't make
outbound network calls at all -- the strongest single change you can make
here. You'll need to build your own image (a `Dockerfile` isn't included in
this repo, since the base setup above covers the common case); it needs
both the Node runtime and the .NET runtime, plus judge-host already built.

## 8. Updating the app later

```bash
cd /path/to/dstalgo-pwn3d
git pull
npm install
cd judge-host && dotnet build -c Release && cd ..
npm run seed              # safe to re-run -- upserts by slug, never wipes progress
sudo systemctl restart dstalgo
```

## 9. Backing up user data

Everything (accounts, submissions, XP) lives in one file:
`data/app.db` (a SQLite database). Back it up like any other file --
e.g. a nightly cron job copying it somewhere else:

```bash
mkdir -p ~/backups
cp /path/to/dstalgo-pwn3d/data/app.db ~/backups/app-$(date +%F).db
```
