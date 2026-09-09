# Component guide: Background worker / scheduled job / queue consumer

Easy to forget, and the usual source of silent production failure.

## P0 — blocking
- **What triggers it**: schedule (exact cadence and timezone), queue message, event, or manual.
- **What it owns**: which entities it may write. Two writers on one entity needs a stated winner.
- **Idempotency**: can it safely run twice on the same input? What is the dedup key?
- **Failure behavior**: retry how many times, with what backoff, then what — dead-letter, alert,
  silent drop? Who is told, on which channel?
- **Ordering**: does processing order matter? Can messages arrive out of order or late?

## P1
- Backfill / catch-up after downtime: does it process the missed window or skip it?
- Concurrency: may several instances run at once? Locking strategy for the shared rows.
- Runtime budget: expected duration, timeout, what happens when it overruns the next tick.
- Observability: how a human confirms it ran and succeeded; what a stuck queue looks like.
- Partial success: a batch of 500 where 3 fail — commit the 497 or roll back all?

## P2
- Manual re-run/replay from the admin panel, historical run log, per-run metrics.

## Do not ask
Queue technology, scheduler library — Stage 3.5.
