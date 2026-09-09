# Component guide: Backend API / services

What to collect before writing `components/<backend>.md`. This component owns the canonical
**data model** and every **API contract** — other components reference them, never redefine them.

## P0 — blocking
- **Consumers**: which components call this API, and how each authenticates (member app, staff
  panel, partner portal, webhooks from providers, internal jobs).
- **Business operations** in the user's words ("member books a slot", "staff cancels an
  occurrence"). Collect operations first; endpoint shapes are derived from them, not invented.
- **Entities owned here** with fields, types, required/unique, enum values. Every piece of state
  any feature reads or writes must exist as a named field — including tokens, attempt counters,
  lock-until timestamps, rolling-window counters, idempotency keys, audit rows.
- **Lifecycle entities** → state machine each: states, who transitions, trigger, validations,
  notifications, what becomes available/unavailable.
- **Money flows** if any: who pays whom, when captured, refunds, payouts, commission,
  reconciliation, who is liable on failure.
- **Authorization model**: role-based, ownership-based, or both. Who may act on whose records.

## P1
- Background jobs: what runs, on what schedule or trigger, idempotency, retry policy, backfill,
  who is alerted on repeated failure.
- Events emitted → notification channel → recipient → content owner.
- Listings: which need pagination, filtering, sorting, and by what.
- Audit log: which actions, retained how long, visible to whom.
- Soft delete vs hard delete per entity; data retention windows.
- Concurrency: which operations can race (double booking, double redeem) and what wins.

## P2
- Rate limits per endpoint class, API versioning policy, bulk/import operations, export formats,
  webhooks published to third parties.

## Contract output (required in the build brief)
Per operation: method · path · auth · authorization rule · request body · success response ·
**every** error (HTTP status + machine code + what triggers it) · paging/sort · idempotency key.
Derive errors from the business rules: each rule that can block an operation is an error row.

## Do not ask
Framework, database engine, ORM, hosting — those are Stage 3.5, after behavior is settled.
