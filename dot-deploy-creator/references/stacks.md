# Stack blocks for `.deploy.sh`

Copy these blocks verbatim and only replace `<placeholders>`. `<pm>` is `yarn` or `npm`, taken
from the lockfile.

## Detection

| Signal in the app folder | Stack | Block |
|---|---|---|
| `next` in `package.json` deps | Next.js | [Next.js](#nextjs-pm2) |
| `vite` in deps and no server entry (only `index.html` + `src/`) | React/Vite static SPA | [Static SPA](#reactvite-static-spa) |
| `express`, `@nestjs/core`, `fastify`, `hono`, `@strapi/strapi`, or a `start` script running `node dist/...` | Node API | [Node API](#nodejs-api-pm2) |
| `discord.js` or another long-running Node script with no build | Node worker | [Node API](#nodejs-api-pm2) without the `rm -rf dist` / build lines |
| `*.csproj` / `*.sln` | ASP.NET Core / .NET | [.NET](#aspnet-core--net-systemd) |
| `docker-compose.yml` / `compose.yml` | Docker | [Docker](#docker-compose) |
| `requirements.txt` / `pyproject.toml` with no compose file | Python on systemd | [Python systemd](#python-systemd) |
| `prisma` dep or `prisma/schema.prisma` | adds Prisma to the Node/Next block | see Prisma rules in SKILL.md |
| `migrations` / `Migrations` folder in a .NET project | adds `dotnet ef database update` | included in the .NET block |

## Header

Use this header for fullstack and monorepo-parent scripts, and for any script whose app needs
`.env` keys. Short single-app scripts can skip it.

```bash
#!/usr/bin/env bash
# <Project name> — VPS deploy. Lives at /root/deployments/<project>/.deploy.sh
#
# Copy this file to .deploy.sh on the server (it is gitignored there, so a
# `git pull` never rewrites the script while it is running) and run it from the
# repo root:  bash .deploy.sh
#
#   API   → pm2 process `<api-name>` on 127.0.0.1:<port> → <api-domain>
#   Panel → static build in /var/www/<site> → <panel-domain>
#
# .env files are untracked and live on the server:
#   <backend-folder>/.env     DATABASE_URL, JWT secrets, CORS_ORIGINS, ...
#   <frontend-folder>/.env    VITE_API_URL (baked into the bundle at build time)
```

## Common start (every Node / Next / Vite script)

```bash
set -e
git restore .
git pull
```

The same start is used by .NET, Docker and Python scripts.

## Node.js API (pm2)

Express, NestJS, Strapi, Fastify, Hono. These have a `build` that outputs `dist/` and a `start`
script.

```bash
<pm> install                 # npm: npm ci
<prisma lines, if Prisma>    # npx prisma generate / migrate step
rm -rf dist
<pm> build                   # npm: npm run build
<seed line, if any>
pm2 restart <name> --update-env || pm2 start <pm> --name "<name>" -- start
pm2 save
```

Strapi builds into `dist/` and `build/`, so use `rm -rf dist build`.

## Next.js (pm2)

```bash
rm -rf .next
<pm> install
<prisma lines, if Prisma>
<pm> build
pm2 restart <name> --update-env || PORT=<port> pm2 start <pm> --name "<name>" -- start
pm2 save
```

`PORT` is always passed on the first start because `next start` defaults to 3000.

## React/Vite static SPA

nginx serves `/var/www/<site>` directly, so no restart is needed for a frontend-only deploy.

```bash
<pm> install
<pm> build --mode production         # npm: npm run build -- --mode production

mkdir -p /var/www/<site>
rm -rf /var/www/<site>/*
cp -r dist/* /var/www/<site>/
```

`VITE_*` values come from the app's `.env` on the server at build time.

## ASP.NET Core / .NET (systemd)

The app is published into `/var/www/<service>` and run by `<service>.service`.

```bash
set -e
export PATH="$PATH:$HOME/.dotnet/tools"
git restore .
git pull
export ASPNETCORE_ENVIRONMENT=<Prod|Staging>

# ---------- Migrations ----------
cd <ProjectWithDbContext>
dotnet restore
dotnet ef database update
cd ..

# ---------- Publish ----------
dotnet publish -c Release -o ./publish
rm -f /var/www/<service>/<MainAssembly>.dll /var/www/<service>/<MainAssembly>.deps.json /var/www/<service>/<MainAssembly>.runtimeconfig.json
cp -r publish/* /var/www/<service>
sudo systemctl restart <service>.service
```

- `<ProjectWithDbContext>` is the folder of the `.csproj` that holds the `DbContext` and
  `Migrations/`. Leave out the Migrations section when the project has no EF Core migrations.
- `<MainAssembly>` is the `.csproj` name of the web project. Its old `.dll`, `.deps.json` and
  `.runtimeconfig.json` are removed before the copy. If a project was renamed, also remove the old
  name's files (`rm -f /var/www/<service>/<OldName>.*`).
- Migrations always run before the publish and restart.

## Docker compose

Whole stack:

```bash
set -e
git restore .
git pull
docker compose down
docker compose build --no-cache
docker compose up -d
```

One service in a shared compose file (e.g. a Python chatbot next to other services):

```bash
set -e
git restore .
git pull
docker compose build --no-cache <service>
docker compose up -d --force-recreate <service>
```

If the images don't need a rebuild (prebuilt images only), use just `docker compose down` and
`docker compose up -d`.

## Python (systemd)

The service's unit file points to the venv in the repo.

```bash
set -e
git restore .
git pull
<if requirements changed often: ./venv/bin/pip install -r requirements.txt>
systemctl restart <service>
```

## Fullstack (backend + frontend in one repo, one script)

Pull once, then each section `cd`s into its app. Backend first, then frontend, then nginx.

```bash
<header>

set -euo pipefail

git restore .
git pull

# ---------- Backend ----------
cd <backend-folder>

<pm> install
npx prisma generate
npx prisma migrate deploy
<pm> build

pm2 restart <api-name> --update-env || pm2 start <pm> --name <api-name> -- start
pm2 save

# ---------- Admin panel ----------
cd ../<frontend-folder>

<pm> install
<pm> build --mode production

mkdir -p /var/www/<site>
rm -rf /var/www/<site>/*
cp -r dist/* /var/www/<site>/

# ---------- Nginx ----------
systemctl reload nginx

echo "Deployed: https://<panel-domain> and https://<api-domain>"
```

Add one `# ---------- <Name> ----------` section per extra frontend. Each app may use a different
package manager, so check each folder's lockfile.

## Monorepo parent (each app has its own `.deploy.sh`)

Use this when the apps are deployed independently but should also be deployable all at once. The
parent pulls once and runs each child. Every child still has its full script (including its own
`git restore .` / `git pull`) so it can be deployed alone.

```bash
set -e
cd "$(dirname "$0")"

# Monorepo: one checkout for all apps, so pull once here.
git restore .
git pull

for dir in <backend> <frontend-1> <frontend-2> <landing>; do
  echo "==> Deploying $dir"
  cd "$dir"
  bash .deploy.sh
  cd ..
done
```

List every app folder that has a `.deploy.sh`, backend first.

## First deploy (put in the report, not in the script)

What the server must already have before `bash .deploy.sh` works:

- the repo cloned at `/root/deployments/<project>` with `git pull` access (deploy key)
- each app's `.env` in place
- Node: `node`, `yarn`/`npm` and `pm2` on the PATH. The pm2 process is created by the
  `|| pm2 start` fallback on the first run.
- Static SPA: an nginx site whose `root` is `/var/www/<site>` with `try_files $uri /index.html`
- pm2 / Next.js apps: an nginx `proxy_pass http://127.0.0.1:<port>` site
- .NET: `dotnet-ef` installed as a global tool and `/etc/systemd/system/<service>.service` running
  `dotnet /var/www/<service>/<MainAssembly>.dll`
- Python systemd: the unit file and venv
- Docker: docker + compose plugin installed
