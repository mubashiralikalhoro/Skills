---
name: incremental-changes
description: Use when writing or reviewing a change that an older running version may still depend on - database schema or migrations (Prisma, TypeORM, Sequelize, Drizzle, EF Core, Django, SQLAlchemy, raw SQL), column renames, NOT NULL, enums, API request/response shapes, env vars or config, JWT/session/auth claims, Redis or cache keys, queue/event/webhook payloads, backend logic or validation behind an existing endpoint, APIs used by mobile apps or web clients still on an old version that cannot be force-updated. Also when the user asks if changes are backward compatible, safe to deploy incrementally, safe for beta next to production, rolling or zero-downtime safe, safe to roll back, "will the old service still work", "check my unpushed changes before deploy", expand and contract, or says "incremental-changes".
---

# Incremental Changes

**New code must not break old code that is still running**, at any layer: database, backend
logic, API, workers, web frontend, mobile apps, other services and integrations. The schema is one
part of it, not the whole job. Every change ships so the old version (v1) and the new version (v2)
can run at the same time against the same database, cache, queues and clients, and so v1 still
works if v2 is rolled back.

The question that drives everything: *if v1 and every old client stay alive while v2 is deployed,
can all of them keep working without corrupting data, breaking a flow, invalidating auth or
making rollback impossible?*

## Default deployment model

Assume all of these unless the repo or the user proves otherwise:

- v1 and v2 run at once against the **same** database, Redis and queues (rolling deploy, pm2
  reload, several instances, k8s rollout, blue-green, beta next to production).
- Migrations run **before** v2 is live, so v1 runs against v2's schema.
- Old clients keep calling v2, and some never update.
- Rollback means v1 running against whatever v2 changed and wrote. No hand-written reverse SQL.

Proof that versions do not overlap is the user saying so, or config you actually read (a separate
database URL for beta, a documented stop-migrate-start deploy with downtime). A README that does
not mention sharing is not proof. The word "beta" is not proof. If unproven, assume shared and say
so in the output.

## Rules

Each rule is binding; the hints under it are examples to look for, not the full list. In Build
mode, do not write code that breaks a rule. In Verify mode, a broken rule is at least
**BREAKING** (CRITICAL when data is lost or corrupted, users are locked out, or rollback is
impossible) — do not downgrade it on a guess about how clients behave.

1. **Know the callers.** Find who calls or reads what changed, and which of their versions are
   still in use. Old clients stay forever unless an enforced force-update is confirmed. Unknown →
   ask, or mark NOT VERIFIED.
   *Hints:* installed mobile builds, web tabs on an old bundle, admin panels, other services,
   workers, cron, webhooks, partners, scripts; client code that is not in the repo; what clients
   read from the server at runtime (remote config, flags, option lists).
2. **Walk the flows.** Follow each affected flow end to end — oldest client → new backend, and new
   client → old backend — and name the flows walked in the output.
   *Hints:* sign-up, login, token refresh, profile, create / edit / delete, lists, search,
   uploads, payments, notifications, offline sync; route → auth → validation → logic → DB /
   cache / queue → response → what the client does with it.
3. **Existing contracts only grow.** Whatever an old caller sends or reads keeps working as it
   does today. New things go beside the old, optional, or on a new version.
   *Hints:* removed or renamed fields, new required inputs, changed wrappers, types, case,
   formats, enum or status values, status codes, error bodies, endpoint / queue / job names.
4. **Existing behavior stays for old callers.** Same request from an old caller, same outcome.
   *Hints:* stricter validation, changed defaults, pagination, sorting, filtering, new auth
   requirements, invalidated tokens or sessions, moved side effects (emails, charges, webhooks).
5. **Shared state stays readable both ways.** v1 must read and write what v2 leaves in the
   database, cache, queues and config, and the reverse. Expand now, contract after v1 is gone.
   *Hints:* drop, rename, type change, `NOT NULL`, tighter constraints, an enum value written
   before v1 understands it, a new shape under an old cache key, an env var required at startup.
6. **Rollback needs no manual step,** and a contract step never goes where the next deploy applies
   it automatically (the migrations folder). It goes in a follow-up note.
7. **Only the user waives a rule** — for a specific change, explicitly. Then say which rule and who
   breaks. Never waive one on your own judgment, or because the request was worded as a breaking
   change.

## Pick the mode

| The user... | Mode |
|---|---|
| asks you to implement, add, change, migrate, rename, refactor | **Build** — write the change incrementally, then verify your own diff |
| asks to check, verify, review, "can I deploy", "is this backward compatible" | **Verify** — read-only audit and verdict |

## Build mode

1. **Find the callers and flows** (rules 1–2): grep for the column, field, route, key, env var,
   claim. If a caller outside the repo is likely, ask.
2. **Split into phases** with expand → migrate → contract. Implement only the phase that is safe
   while v1 and old clients run; [references/patterns.md](references/patterns.md) has example
   sequences. Later phases go in a follow-up note in your reply.
3. **The user's wording is the outcome, not the method.** "Rename the column" or "make it required"
   gets the compatible version now plus the follow-up, and one line saying what you did
   differently and why.
4. **Before reporting, run Verify mode on your own diff** and include the mixed-version table.

## Verify mode

Read-only. Never reset, stash, checkout, commit, push, install, build, migrate, or connect to a
database or service. If the user asked about a specific change, focus there but follow what it
touches; a small diff is not proof of isolation.

1. **Git state:** `git status`, `git diff`, `git diff --cached`, untracked files (read new
   migrations in full), `git branch -vv`, unpushed commits `git log @{u}..HEAD` and
   `git diff @{u}...HEAD` (no upstream → compare with the default branch).
2. **Deployment model:** read deploy scripts, CI, docker-compose, pm2 ecosystem, k8s manifests,
   env examples and README for how migrations run and whether versions overlap. Apply the default
   model where they are silent.
3. **Callers and flows** (rules 1–2) through the changed code.
4. **Check every change against the rules,** then use
   [references/checklist.md](references/checklist.md) as hints for what else to look at.
5. **Report** in the format in [references/report-format.md](references/report-format.md).
   PASS only with evidence you read; otherwise FAIL or NOT VERIFIED.

## Rationalizations

| Thought | Reality |
|---|---|
| "Fine for beta" / "short outage between migrate and restart" | Beta often shares production's database, and that window is v1 on v2's schema. Only fine when isolation is proven. |
| "Take a backup and fix forward" / "run the reverse SQL" | Restores lose writes; reversing breaks v2 while it runs. Rollback = v1 on the new state, no steps. |
| "Schema and code match" | That checks v2 against itself. Check v1 and old clients against v2. |
| "Users will update" / "ship the app update with it" | Some never do. Rule 1. |
| "The response shape didn't change" / "only the backend changed" | Behavior breaks clients too. Rules 2 and 4. |
| "It only breaks a little, call it a WARNING" | A broken rule is BREAKING. |
| "The user asked for the rename" | They asked for the outcome. Rule 7. |
