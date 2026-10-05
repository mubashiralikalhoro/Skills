# Compatibility checklist

Hints for what to look at, by area. Not every area applies, and no list is complete. For each
changed thing, answer both directions:

```text
v1 writes → v2 reads        v2 writes → v1 reads
old client → v2 API         v2 → rollback → v1 on the changed database
```

A missing area in the diff is not a pass. If the repo cannot answer a question, the answer is
NOT VERIFIED.

## 1. Database schema

Classify each change: additive, destructive, rename, type change, constraint change, default
change, enum change, index, data transform, relation or cascade change.

- **Drop column / table.** Does v1 still select, insert or update it? Grep v1's code (HEAD or the
  deployed commit), not v2's.
- **Rename.** Treat as drop + add. v1 queries the old name the moment the migration runs.
- **Type change** (int ↔ string, timestamp → date, precision, length). Can v1's ORM and v1's
  inserts still read and write the new type?
- **NOT NULL, unique, FK, check, length.** Do v1's inserts and updates always satisfy it? Does
  existing data satisfy it, or will the migration fail halfway?
- **New column NOT NULL.** A default that is dropped right after (`ADD ... DEFAULT 0` then
  `DROP DEFAULT`) still breaks v1's inserts, and the backfilled value (0, '') may be fake data.
- **Default change.** v1 relies on the old default for rows it inserts; the new default silently
  changes v1's behavior.
- **Enum add.** v1 must read rows with the new value. Prisma's generated client throws on unknown
  enum values; strict deserializers in clients do too. Postgres enum values cannot be removed, and
  before Postgres 12 `ADD VALUE` cannot run inside a transaction.
- **Enum remove.** v1 may still write the removed value.
- **Cascade / delete behavior.** Does v2's change delete or orphan rows v1 still uses?

## 2. Migration mechanics

1. Reversible? Not by a reverse script — can v1 run on the result as is?
2. Does it lock or rewrite a large table (type change, `ADD COLUMN` with a volatile default,
   `CREATE INDEX` without `CONCURRENTLY`, MySQL table copy)? Safe under live traffic?
3. Can v1 keep querying, inserting and updating during and after it?
4. Could partial execution leave an inconsistent state? Is it idempotent and safe to re-run?
5. Does the deploy apply every file in the migrations folder automatically (`prisma migrate
   deploy`, `migrate`, EF `Database.Migrate()`, Django `migrate`)? Then a contract step must not
   sit in that folder yet.
6. ORM-generated SQL: a field rename in Prisma's schema generates DROP + ADD (data loss) unless
   hand-edited; removing a field generates DROP COLUMN.

## 3. ORM and generated code

Prisma, TypeORM, Sequelize, Drizzle, EF Core, Hibernate, Django ORM, SQLAlchemy, generated API
clients, GraphQL schema, OpenAPI models. A migration can succeed while v1's generated client is
incompatible. Follow the chain: schema → ORM model → queries → serialization → API response.
Check whether v1 selects `*` or every mapped column (Prisma, EF and most ORMs select every mapped
column, so a dropped or renamed column breaks every query on the table, not only the ones that use
it).

## 4. API contract

For every changed endpoint: method, path, query params, headers, request body, required fields,
auth, response wrapper and field names, types, nullability, status codes, error format,
pagination, sorting, filtering.

- Old clients must still be accepted (no new required input) and must still find every field they
  read in the response.
- New shape → new endpoint or version; additive fields on the old one.
- Check every endpoint, including ones the diff touched only partly (a list endpoint left on the
  old shape while others moved is a contract change too).

## 5. Data meaning

Same field, different meaning is worse than a schema error, because nothing fails loudly. Check
status values, boolean semantics, amounts and currency units, timestamps and time zones, IDs,
JSON structure, case normalization (lowercasing emails on write only splits duplicates against a
case-sensitive unique index), rounding, config stored in the database.

## 6. Writes and reads across versions

- **v2 writes → v1 reads.** New enum or status values, new JSON shapes, nulls where v1 expects a
  value, new relation structures, new serialized formats, new auth states.
- **v1 writes → v2 reads.** v2 must handle rows v1 keeps creating during the whole overlap: nulls
  in new columns, old JSON shapes, missing related rows. A one-time backfill does not cover rows v1
  writes after it.

## 7. Config and environment

New env vars that v2 requires but some environment lacks; startup code that throws on a missing
var (crash loop after the migration already ran); renamed vars; changed meaning of a shared var;
feature flags; service URLs, ports, database or Redis URLs; secrets.

## 8. Auth

JWT claims and their names, session structure, refresh tokens, API keys, OAuth, passkeys / FIDO,
device registration, roles and permissions, password hashing, token lifetime, signing keys. A
change must not log users out, invalidate tokens, or change who can access what unless the user
intends it. Tokens issued by v2 must work on v1 during overlap and after rollback, and vice versa.

## 9. Cache and Redis

Key names and prefixes, value shape, serialization, TTLs, pub/sub channels, distributed locks.
v1 and v2 read and write the same keys during overlap and after rollback. A new shape needs a new
key. Check the reader too: does it validate the shape or trust it?

## 10. Queues, events, jobs

BullMQ, RabbitMQ, Kafka, SQS, Redis queues, webhooks, event buses, cron and scheduled jobs.
Old producer → new consumer and new producer → old consumer both happen. Jobs already queued with
the old payload are processed by v2. Renamed job names or queues orphan jobs in flight.

## 11. External integrations

Payment, SMS, email, OAuth providers, passkeys, storage, third-party APIs, outgoing and incoming
webhooks, other internal services. Did a request or response contract, callback URL, signature
or credential change?

## 12. Clients and end-to-end flows

Old app → v2 backend always happens. New app → v1 backend happens after a rollback or during a
staged rollout. Prompts, not a full list:

- Which client versions are still in use, and can they be forced to update? If not, the oldest
  one is a permanent caller of every endpoint it uses.
- For each flow that touches the change, follow one request from an old client all the way:
  route → auth → validation → business logic → DB / cache / queue → response → how the client
  handles that response. Flows worth walking: sign-up, login, token refresh, logout, profile,
  create / edit / delete, list with pagination, search, filters, upload, payments, notifications,
  deep links, offline sync and retries.
- Contract: removed or renamed fields, new required fields, changed types or nullability, removed
  endpoints, changed status codes, changed pagination.
- Behavior with the same contract: stricter validation, new error codes or messages the client
  parses or shows, new enum or status values it switches on (strict decoders crash on unknown
  values or unknown keys), values that are now null or empty, changed ordering or defaults, new
  permission checks, rate limits, side effects moved to another step.
- Runtime server data the client depends on: remote config, feature flags, server-driven UI,
  option lists, app-version checks.
- Web: users keep an old bundle open for hours or days after a deploy; it calls v2.
- Client code not in the repo: reason from the API contract and ask about anything that decides
  the verdict.

## 13. Hidden behavior

Defaults, filtering, authorization, transaction boundaries, cascades, deletion, uniqueness, case
sensitivity, date and time zone handling, rounding, pagination, sorting, retries, idempotency,
concurrency. None of these show up as a schema change.

## 14. Deployment order

Write the order the change is only safe in, for example:

```text
1. Database expand
2. Deploy v2 (reads old + new)
3. Deploy clients / other services
4. Backfill data
5. Retire v1 and old clients
6. Database contract
```

If the user's planned order (including the deploy script's own order, e.g. migrate before
restart) is unsafe, say why.

## 15. Rollback

```text
v1 → deploy v2 (migration runs, v2 writes data) → roll back → v1
```

Can v1 run on that database with no manual step? Consider the schema v2 left, the data v2 wrote
(new enum values, new shapes, nulls), cache entries v2 wrote, tokens v2 issued, jobs v2 queued.
If not, the deployment is not safe, even if v2 works.
