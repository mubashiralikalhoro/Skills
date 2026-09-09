# Feature Mode — one feature or change inside an existing project

Use when the system already exists (code, running product, or a `final-product/` package) and
the user wants **one** feature, change or "small thing" whose behavior is not yet pinned down.
Same hard rules as Product mode. Smaller loop, one output file.

## Step 1 — Read the code, record what is observed

Before asking anything, locate what the feature touches. Record each item as
`[observed — unconfirmed]` in `.software-engineer/features/<slug>.md`:

| What to find | Where to look | Why |
|--------------|---------------|-----|
| Components involved | repo layout, services, apps | which build briefs this feature extends |
| Entities + fields | models, migrations, schema, ORM | what data already exists vs must be added |
| Endpoints / operations | controllers, routes, API docs, OpenAPI | which contracts change, which are new |
| Screens / views | pages, components, navigation | where UI changes land |
| Roles / permissions | auth middleware, policies, role enums | who may use the feature |
| Existing conventions | error envelope, ID style, pagination, validation | the brief must match them, deviations are questions |
| Stack | package manifests, Dockerfiles, CI | recorded as observed, never re-chosen |

If an existing `final-product/` package exists, cite its IDs (`BOOK-012`, `AC-BOOK-012-2`)
instead of re-describing. If nothing is readable, say so and ask the user what exists.

## Step 2 — Scope paragraph (goes out with the questions)

One paragraph, plain words:
*After this change, <actor> can <do what> <when>. It changes <observed components>. It does not
change <what stays untouched>.* Tag every guess `[A-xxx pending]`. Stamp `NOT READY (n open P0)`.

## Step 3 — P0 question bank (pick what is still unknown, ≤ 4 per tool call, ≤ 2 rounds)

- **Actor & trigger**: who does this, from where, what starts it (button, schedule, event, API call).
- **Happy path**: numbered steps in the user's words, end state.
- **Existing behavior**: what changes for current users, what must stay exactly as is.
- **Data**: new fields/entities, changed meanings, migration of existing rows (backfill? default?).
- **Money / regulated**: if the feature touches payments, PII, minors, health — who is liable,
  what is logged.
- **Failure**: what the actor sees when it fails, is it retried, who is notified.
- **Out of scope**: what the user explicitly is *not* asking for this time.

P1 (ask only if a P0 answer opens it): permissions per role, pagination/filter/sort, audit,
notifications, rate limits, rollout (flag? all users?), backward compatibility of the API.

## Step 4 — Feature brief template → `final-product/features/<slug>.md`

```markdown
# Feature: <name>
Status: READY | NOT READY (n open P0)
Version · Date · Extends: <component briefs / spec IDs it modifies, or "standalone">

## Purpose                      (one paragraph, [user])
## Actors & permissions         (table: actor → may do; cite existing roles by name)
## Observed context             (components, entities, endpoints, screens touched — [observed — confirmed/unconfirmed])
## Scope
### In scope   ### Out of scope   ### Future

## Features
### <ID> <name>                 (IDs continue from ids.md; new registry → <SLUG>-001)
- Trigger · Preconditions
- Main flow (numbered) · Alternative flows (numbered, labeled)
- Success result · Failure result(s)
- Acceptance criteria: AC-<ID>-1 Given / When / Then …

## Business rules               (BR-*: who/when/conditions/limits/reversal)
## Data changes
| Entity | Field | Type | Required | Default | New / Changed / Unchanged | Migration note (backfill, default for existing rows) |
## API contract                 (every touched or new operation — full, never "as existing")
| Operation | Method · Path | Auth · Authz | Request | Success response | Errors (status · machine code · trigger) | Paging · Idempotency |
## UI changes                   (per screen: what is added/changed, fields + validation, loading/empty/error/success states)
## Edge cases                   (what happens if … — concurrency, partial failure, retry, permissions change mid-flow)
## Security                     (only what this feature adds or changes)
## Notifications & errors       (channel · trigger · recipient · message owner)
## Impact on existing requirements
| Existing ID | Change | Marked REVISED (was: …) |
## Stack (observed)             (language, framework, DB, conventions the builder must follow; new dependencies listed as A-xxx or OQ-nnn)
## Assumptions                  (A-xxx, text, status — written out here, never "see .software-engineer/")
## Open questions               (OQ-nnn, priority, question, impact — written out here, even at first draft)
## Hand-off                     (recommended next step: superpowers:writing-plans or builder skill)
```

## Step 5 — Mini audit (subset of the Stage 4 list; PASS / PARTIAL / FAIL + evidence each)

1. Actor, trigger and happy path confirmed **by the user** (else PARTIAL)
2. Every touched component, entity, endpoint and screen named — from the code, not guessed
3. Every feature ID has at least one AC physically written out
4. Every touched or new operation has a full API contract; "same as existing" = FAIL
5. One machine error code = one HTTP status, consistent with the existing codebase convention
6. Every field a rule reads or writes exists in Data changes, incl. migration note for existing rows
7. Existing requirements the feature alters are listed with `REVISED (was: …)`; IDs not reused
8. Scope In / Out / Future present; nothing from Future referenced by an in-scope flow
9. Assumptions labeled; artifacts built on pending ones tagged `[A-xxx pending]` inline
10. Zero open P0 (else NOT READY); P1/P2 listed with impact
11. Stack recorded as observed; any new dependency is an OQ or A-xxx, never a default
12. Brief is self-contained: no link out to `.software-engineer/`, no placeholder outside Open questions
13. Every count in the brief is the last ordinal of its list, not hand-summed

## Escalation triggers → switch to Product mode Stage 1 for this slice

- Feature requires a **new component** (new app, service, worker, integration).
- Feature touches **more than two** existing components.
- The "existing system" cannot be read and the user cannot describe it — there is no system
  to extend, only a product to discover.

Name the trigger that fired in your reply, then proceed with Stage 1 on the slice only.
