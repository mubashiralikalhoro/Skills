# Audit checklist

Language-agnostic. Each category lists what to look for and search hints. The hints are starting
points for `grep`, not findings — open and read every hit. Stack-specific traps are in
`stack-hotspots.md`.

## 1. Correctness and business logic

- Logic that contradicts the README, docs, names, comments, or tests.
- Off-by-one, wrong comparison (`<` vs `<=`), inverted conditions, wrong operator precedence.
- Integer overflow, float used for money, rounding and currency errors, division by zero.
- Time: timezone mixing, local vs UTC, DST, date parsing without a format, expiry checks.
- Null/undefined/None/empty collections not handled; optional values unwrapped blindly.
- Wrong default values; fallthrough in switch/match; unreachable branches.
- State machines that allow invalid transitions (order paid twice, refund after cancel).
- Idempotency: retried requests, double-clicks, re-delivered messages creating duplicates.
- Copy-paste bugs: a duplicated block where one variable was not renamed.

## 2. Security

- **Injection:** SQL/NoSQL built from strings, shell commands with user input, template injection,
  LDAP/XPath, header injection, log injection. Hints: string concatenation or interpolation near
  `query`, `execute`, `raw`, `exec`, `system`, `spawn`, `eval`, `$where`.
- **XSS:** unescaped output, `innerHTML`, `dangerouslySetInnerHTML`, `v-html`, `|safe`,
  `html_safe`, markdown rendered without sanitising.
- **SSRF / path traversal / open redirect:** user-controlled URLs fetched server-side, file paths
  joined from input, redirect targets from query params.
- **Deserialisation:** `pickle`, `yaml.load`, Java/.NET binary deserialisers, `unserialize` on
  untrusted data.
- **Crypto:** weak hashes for passwords (MD5/SHA1/unsalted), hard-coded keys/IVs, `Math.random`
  or non-CSPRNG for tokens, disabled TLS verification, homemade crypto, timing-unsafe compares.
- **Secrets:** keys, tokens, passwords, connection strings in code, config, tests, Docker images,
  CI files, or git history (`git log -p -S <pattern>` is read-only).
- **Web settings:** CORS `*` with credentials, missing CSRF protection on cookie auth, cookies
  without `HttpOnly`/`Secure`/`SameSite`, missing security headers, verbose errors/stack traces to
  clients, debug mode on in production config.
- **Uploads:** no size/type limits, stored in web root, original filename trusted, no scanning.
- **Rate limiting / brute force** missing on login, OTP, password reset, expensive endpoints.
- **Mass assignment:** request body bound straight to a model (role, isAdmin, ownerId settable).
- **Sensitive data exposure:** API returns password hashes, tokens, internal fields, other users'
  PII; PII in logs, URLs, or analytics.

## 3. Authentication and authorisation

- Endpoints/handlers/screens/commands reachable without an auth check. List every route and
  compare against where auth is enforced.
- **IDOR:** object fetched by ID without checking it belongs to the caller or their tenant.
- Role checks done only in the UI, not on the server.
- Multi-tenant isolation: queries missing the tenant filter.
- Tokens: no expiry, not verified (signature, `alg: none`, audience, issuer), not revoked on
  logout/password change, stored in `localStorage` when XSS is possible, long-lived refresh tokens.
- Password reset/verification tokens: guessable, reusable, never expiring, leaked via referrer.
- Session fixation, missing re-auth for sensitive actions, OAuth `state`/PKCE missing.

## 4. Input validation and edge cases

- Validation missing at trust boundaries, or done on the client only.
- No length/size/count limits (strings, arrays, pagination `limit`, file size, JSON depth).
- Type coercion surprises (`"0"`, `[]`, `NaN`, negative numbers, very large numbers).
- Unicode, emoji, RTL, normalisation, case-insensitive uniqueness (emails).
- Empty, whitespace-only, duplicate, and out-of-order input.

## 5. Data, database and schema

- Missing constraints: unique, foreign key, not-null, check — enforced only in code.
- Missing indexes on columns used in filters, joins, sorts, and foreign keys.
- N+1 queries; queries inside loops; `SELECT *` on wide tables; unbounded queries with no limit.
- Multi-step writes without a transaction; wrong isolation level; partial failure leaving
  inconsistent data.
- Migrations: destructive without backup path, not reversible, locking large tables, out of sync
  with models, data migrations mixed with schema changes.
- Soft delete ignored by some queries; cascades that delete too much or too little.
- Connection handling: pool exhaustion, connections not released, no timeouts.
- Cache: stale data after writes, no invalidation, cache keys missing the user/tenant, stampedes.

## 6. API design and error handling

- Wrong status codes (200 on error, 500 on bad input), inconsistent error shapes.
- Errors swallowed (empty `catch`/`except: pass`, ignored return values, `_ = err`).
- Errors that leak internals; errors that lose the cause (re-thrown without context).
- No timeouts or retries on outbound calls; retries without backoff or without idempotency.
- Webhooks: signature not verified, not idempotent, slow work done inline.
- Pagination, filtering, sorting inconsistent or unbounded; breaking changes without versioning.
- Contract drift between client and server types, OpenAPI/GraphQL schema and implementation.

## 7. Concurrency and async

- Check-then-act races (read balance → write balance; "if not exists then insert").
- Shared mutable state across requests, threads, goroutines, workers.
- Promises/futures not awaited, fire-and-forget without error handling, `async` in `forEach`,
  unhandled rejections, blocking calls inside async code / event loop.
- Deadlocks, lock ordering, locks held across I/O, missing locks.
- Distributed: jobs that run twice across instances, cron on every replica, missing
  distributed locks or leases, out-of-order message processing, at-least-once delivery ignored.

## 8. Performance and scalability

- Hot paths with O(n²) work, repeated parsing, repeated I/O, sync I/O on request path.
- Loading whole tables/files into memory; no streaming for large payloads.
- Missing pagination, caching, batching, or compression where volume is large.
- Chatty service calls; sequential calls that could be parallel.
- Frontend: large bundles, no code splitting, unoptimised images, re-render storms, layout thrash.
- In-memory state (sessions, rate limits, caches) that breaks with more than one instance.

## 9. Resource and memory leaks

- Files, sockets, DB connections, streams, cursors not closed on every path (including errors).
- Timers, intervals, listeners, subscriptions, observers never removed.
- Unbounded caches, maps, queues, and log buffers; goroutine/thread/task leaks.
- Temp files never deleted; child processes never reaped.

## 10. State management (client and server)

- Stale closures, derived state duplicated and drifting, state mutated in place.
- Optimistic updates without rollback; race between responses arriving out of order.
- Global singletons holding per-user data.
- Cache/store not cleared on logout or user switch.

## 11. Frontend and user flows

- Broken flows: dead buttons, forms that can submit twice, missing loading/empty/error states,
  navigation that loses data, back button issues.
- Client-side-only security or validation.
- Accessibility: missing labels, keyboard traps, no focus management, colour-only signals.
- Hydration mismatches, SSR/CSR differences, env vars/secrets bundled into client code.

## 12. Types and contracts

- `any` / `object` / `interface{}` / unchecked casts hiding real types.
- Types that disagree with runtime data (API returns `null` but type says string).
- Duplicate type definitions for the same entity drifting apart.
- Nullable handling suppressed (`!`, `!!`, `unwrap`, `.Value`) without a guarantee.

## 13. Dead, duplicated and unnecessary code

- Unused exports, files, routes, feature flags, env vars, dependencies.
- Duplicated logic that has already diverged (a bug fixed in one copy only).
- Commented-out code, unreachable code, abandoned experiments.

## 14. Configuration and environment

- Required env vars with no validation at startup; unsafe defaults (debug on, auth off).
- Dev settings reachable in production; different behaviour per environment not documented.
- `.env` committed; `.env.example` missing or out of date.
- Config read at import time making tests and reloading hard.

## 15. Dependencies

- Known vulnerable versions (use a read-only audit tool if available; otherwise note versions).
- Unpinned or wildcard versions; missing lockfile; lockfile out of sync with manifest.
- Abandoned, duplicate, or unnecessary heavy packages; dependencies used for one tiny function.
- Licence conflicts for distributed software.

## 16. Build, Docker and deployment

- Images running as root, `latest` tags, huge images, secrets in layers or build args,
  no `.dockerignore`, dev dependencies shipped.
- No health/readiness checks, no graceful shutdown (SIGTERM ignored, in-flight work lost).
- CI/CD: secrets exposed to forks/PRs, unpinned third-party actions, no tests gating deploy.
- IaC: public buckets/ports, over-broad IAM, no encryption at rest, no backups.
- Migrations run on every replica at startup; no rollback path.

## 17. Logging and observability

- Errors not logged, or logged without context (request id, user id, input shape).
- Secrets, tokens, passwords, PII written to logs.
- No structured logs, metrics, tracing, or alerts on critical paths; noisy logs hiding signal.
- `print`/`console.log` debugging left in production code.

## 18. Production failure modes

- What happens when each dependency (DB, cache, queue, third-party API) is slow or down?
- Unbounded retries, retry storms, missing circuit breakers, no timeouts.
- Startup that crashes on a missing optional service; single points of failure.
- Disk filling up (logs, uploads, temp files); clock skew; large inputs.

## 19. Code quality and maintainability

- God files/classes/functions; tangled dependencies; circular imports.
- Business logic in controllers/views/components; missing layering where the project uses it.
- Inconsistent patterns for the same problem across the codebase.
- Missing tests on critical paths; tests that assert nothing or are skipped.
- Misleading names and comments.
