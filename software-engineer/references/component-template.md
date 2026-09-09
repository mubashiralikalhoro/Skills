# Component Requirement Template — Phase A–H loop

Every component gets its own file `.software-engineer/components/<name>.md`. Do not mix
components. Fill sections in order; each section lists what must be known. Unknowns → 
`open-questions.md`; guesses → `assumptions.md`. Assign IDs as facts are confirmed.

## ID scheme

- Prefix per domain/feature area, 3-digit sequence: `AUTH-001`, `USER-004`, `BOOK-012`,
  `PAY-002`, `ADMIN-007`, `NOTIF-003`, `API-015`, `DATA-009`.
- Acceptance criteria: `AC-<REQ-ID>-<n>` e.g. `AC-BOOK-012-2`.
- Business rules: `BR-<area>-<n>`. Open questions: `OQ-<n>`. Assumptions: `A-<n>`.
  States: named in caps (`PENDING`, `CONFIRMED`).
- IDs are never renumbered or reused. A dropped requirement is marked *REMOVED*, ID retained.

## File template

```markdown
# Component: <Name>
Type: mobile-app | web-app | admin-panel | backend-api | worker | integration
Status: draft | confirmed
Last updated: <date>

## A. Purpose
- Why it exists, who uses it, what problem it solves, its responsibilities. [user]
- What it explicitly does NOT do (belongs to another component / out of scope).

## B. Actors & permissions
| Actor | Can see | Can create | Can modify | Can delete | Restricted |
|-------|---------|------------|------------|------------|-----------|
Include anonymous/guest and external systems where relevant.

## C. Features
One block per feature:
### <FEATURE-ID> <Feature name>
- Purpose · Actor · Trigger · Preconditions
- Main flow (numbered)
- Alternative flows (numbered, labeled)
- Success result · Failure result(s)
- Permissions · Dependencies (other features/components/integrations by ID)
- Acceptance criteria: AC-<ID>-1 Given / When / Then …

## D. UI / Interface   (omit for headless components)
- Navigation map (screens and how they connect)
- Per screen: purpose · content/components · forms & fields (type, required, validation) ·
  actions · loading / empty / error / success states · confirmations & modals ·
  search / filter / sort / pagination · responsive behavior
- No visual design unless the user asks.

## E. Data (owned by this component, or referenced by ID from the backend component)
- Entities, fields (type, required, unique, enum values), relationships
- Statuses / lifecycle (link to state machine)
- Ownership, audit requirements, soft-delete, retention

## F. APIs / Communication   (backend-connected components)
- Business operations first ("customer places order"), then endpoint sketch:
  method · path · auth · authorization · request · response · validation · errors ·
  pagination/filter/sort · rate limit · idempotency
- Do not name endpoints before the operation is understood.

## G. Business rules
BR-<area>-<n>: who / when / conditions that prevent / effect on state / cancel-reverse /
limits / expiry / approval. Every important behavior explicit, never implied.

## H. Integrations
Per integration: provider · purpose · auth method · data exchanged · trigger ·
failure behavior · retry · webhooks · timeout · fallback.

## State machines
For each entity with a lifecycle:
  STATE → STATE  (who · trigger · validations · notifications · actions enabled/disabled)

## Edge cases
Answer for every important workflow (see list below).

## Open questions (this component)
| # | Priority | Question | Impact |

## Assumptions (this component)
| ID | Assumption | Reason | Status |
```

## Edge-case checklist ("what happens if…")

- the request fails · user closes the app mid-flow · network drops · user retries ·
  request is duplicated · referenced data no longer exists · another user changed the data
  concurrently · operation partially succeeds · external service unavailable · session
  expires · user lacks permission · input invalid · operation times out · clock/timezone
  differences · limits reached (quota, capacity, stock)

Answer each with expected behavior, or record `UNKNOWN` with priority.

## Gate summary format (shown to user after each component)

```
Component: <name>
Actors: …
Features: <ID> name · <ID> name …
Key rules: BR-… (1 line each)
States: entity: A → B → C
Open P0: n  (list)   Open P1: n   Assumptions pending: n
```
