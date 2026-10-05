---
name: dot-deploy-creator
description: Create a `.deploy.sh` for a project, the VPS deploy script that is run as `bash .deploy.sh` from the project folder on the server (git restore + pull, install, Prisma, build, restart via pm2 / systemd / docker / copy to /var/www). Detects every app in the repo (Node.js/Express/NestJS/Strapi API, Next.js, React/Vite static SPA, ASP.NET Core / .NET, Python in Docker or systemd, fullstack and multi-app monorepos) and how Prisma is used, then composes the script from fixed per-stack blocks. Use when the user asks to create, write, generate, add or update a deploy script, `.deploy.sh`, "deploy file", "VPS deploy script", or says "dot-deploy-creator".
---

# dot-deploy-creator

Writes `.deploy.sh` files that follow the exact conventions of the user's VPS
(`/root/deployments/<project>/.deploy.sh`). Every script is assembled from the blocks in
`references/stacks.md` and nothing else. Do not invent extra steps such as health checks,
rollbacks, locks, logging or backups unless the user asks for them.

## How the scripts are used on the server

- The script sits at the project root on the server, e.g. `/root/deployments/<project>/.deploy.sh`.
  For a multi-app repo it sits in each app folder plus the repo root.
- It is run as `bash .deploy.sh` from its own folder. There is no shebang requirement and no
  arguments. Paths are relative to that folder.
- The file is **untracked** on the server (gitignored), so `git restore .` / `git pull` never
  rewrites it mid-run. Server-only files (`.env`, the deploy script) are never committed.
- Server: Ubuntu, user `root`, `node` / `yarn` / `pm2` on the PATH, nginx serving static sites
  from `/var/www/<site>`,
  .NET apps as systemd services published into `/var/www/<service>`.

## Workflow

1. **Detect the apps.** Look at the repo root and every first-level folder. For each one, find the
   stack using the detection table in `references/stacks.md`. Also check for Prisma (see below).
   Note the package manager from the lockfile (`yarn.lock` → yarn, `package-lock.json` → npm).
2. **Pick the layout:**
   - one app at the root → a **single-app** script.
   - backend + frontend folders deployed together → one **fullstack** script at the root.
   - several independent apps that each have their own `.deploy.sh` → a **monorepo parent**
     script plus one script per app folder.
3. **Fill the values.** Infer each value from the repo first: `package.json` `name`, folder name,
   `.csproj` name, `docker-compose.yml` service name, the `PORT` in `.env.example`, or the
   `VITE_API_URL` / domain in config. Ask the user only for values that can't be inferred, in
   **one** question. Values needed:
   - pm2 process name (per Node app). Defaults: `<project>-api`, `<project>-web`,
     `<project>-landing`.
   - `PORT` (Next.js / any pm2 app whose port is not set in its `.env`).
   - `/var/www/<site>` folder (per static SPA). Default: `/var/www/<project>-<role>`.
   - systemd service name and `/var/www` folder (.NET, systemd Python).
   - `ASPNETCORE_ENVIRONMENT` (.NET). `Prod` for production, `Staging` for staging.
4. **Compose** the script: the header, then the common start, then one block per app in deploy
   order (backend first, then frontends), then the tail. Use the blocks in `references/stacks.md`
   verbatim and only substitute the `<placeholders>`.
5. **Write** `.deploy.sh` at the right path(s). Make sure `.deploy.sh` is listed in the repo's
   `.gitignore` (add it if missing). Run `bash -n .deploy.sh` to check the syntax. Never run the
   script and never SSH to the server unless the user asks.
6. **Report** in a few lines: the path(s) written, the values you inferred and the ones you
   assumed, and the one-time server setup the script expects (see "First deploy" in
   `references/stacks.md`).

## Global rules (every script)

- Start with `set -e` (the fullstack template uses `set -euo pipefail`).
- Steps always run in this order:
  `git restore .` → `git pull` → install → Prisma generate → DB migrate/push → build → go live.
- Call `pm2`, `node`, `yarn`, `npm` straight from the PATH. Never add nvm lines
  (`export NVM_DIR=...`, `source .../nvm.sh`, `nvm use`) or a hardcoded pm2 path
  (`PM2=/root/.nvm/...`).
- pm2 apps restart, or start if the process doesn't exist yet, then save:
  `pm2 restart <name> --update-env || pm2 start <npm|yarn> --name "<name>" -- start` and then
  `pm2 save`. Put `PORT=<port>` before the start when the port isn't in `.env`.
- Use the package manager the lockfile says, and only that one: yarn → `yarn install` /
  `yarn build`; npm → `npm ci` / `npm run build`.
- Clean the old build output before building: `rm -rf dist` for Node APIs, `rm -rf .next` for
  Next.js. Vite SPAs are built with `--mode production`.
- `.env` files are untracked and already exist on the server. Never create, read or print them.
  List the keys each app needs in the header comment.
- Comment sections with `# ---------- <Section> ----------` in multi-app scripts. Single-app
  scripts don't need comments.
- In a fullstack script, `git restore .` / `git pull` run **once** at the root, and each app
  section `cd`s into its folder (`cd ../<next-app>` between sections).

## Prisma rules

Detect Prisma by a `prisma` dependency in `package.json` or a `prisma/schema.prisma` file. When it
is used, it always runs **after install and before build**, in this order:

1. `npx prisma generate`, always (the build needs the generated client).
2. Then exactly one DB step:
   | Repo state | Command |
   |---|---|
   | `package.json` has a migrate script (`migrate`, `db:deploy`, `prisma:migrate`…) | that script: `npm run migrate` / `yarn db:deploy` |
   | `prisma/migrations/` exists | `npx prisma migrate deploy` |
   | no migrations folder (schema-only project) | `npx prisma db push` |
3. `npx prisma db seed` only when `package.json` has `prisma.seed` (or `prisma.config.ts` has a
   seed) **and** the seed is idempotent (upserts). Put it after build. Add the comment:
   `# Idempotent: every write is an upsert, so this is a no-op on an already seeded database.`

Never use `prisma migrate dev` or `prisma migrate reset` in a deploy script. In a Next.js app
with Prisma, the same order applies (generate → migrate → `rm -rf .next` already done → build).

## Reference

`references/stacks.md` has the detection table, the header template, every per-stack block (Node
API, Next.js, React/Vite static, .NET, Python Docker, Python systemd, plain docker compose),
the fullstack and monorepo-parent templates, and the first-deploy notes.
