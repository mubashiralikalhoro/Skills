# Spec Templates — working files (`.software-engineer/`) and the `final-product/` package

## product.md (Stage 1)

```markdown
# Product: <name>
Last updated: <date>

## Overview
One paragraph: what it is, for whom, problem solved. [user]

## Goals & success outcome
## Actors
| Actor | Description | Primary component |
## Primary workflow
Numbered happy path in the user's words.
## Component tree
PRODUCT
├── Applications: …
├── Backend: …
├── Data: …
├── Integrations: …
└── Infrastructure: (noted only)
Each with status: confirmed / rejected / unclear.
## Existing systems & constraints
## Scope
### In scope   ### Out of scope   ### Future
```

## assumptions.md

```markdown
| ID (A-001…) | Assumption | Reason | Component | Status (pending/confirmed/rejected) | Date |
```

## open-questions.md

```markdown
| ID (OQ-001…) | Priority | Question | Component | Impact | Status (open/answered → where recorded) |
```

## spec.md — Build Specification (Stage 4, written into `final-product/`)

Assemble from `product.md` + `components/*.md`. Keep IDs and wording. Structure:

```markdown
# Product Specification — <name>
Version · Date · Status (READY / NOT READY — n open P0)

## 1. Product Overview
## 2. Goals
## 3. Users & Roles
## 4. System Components            (tree + one-line responsibility each)
## 5. Scope
### In Scope  ### Out of Scope  ### Future
## 6. Application Requirements     (one subsection per UI component)
### <Application>
#### Purpose  #### Users  #### Navigation  #### Screens  #### Features
#### User Flows  #### Validation  #### Error States
## 7. Backend Requirements
### Services  ### APIs  ### Authentication  ### Authorization
### Business Logic  ### Background Jobs  ### Integrations
## 8. Data Requirements
### Entities  ### Relationships  ### Fields  ### Constraints  ### Audit Requirements
## 9. Business Rules               (all BR-*)
## 10. State Machines / Workflows
## 11. Security Requirements
## 12. Non-Functional Requirements
## 13. Integrations
## 14. Notifications               (channel · trigger · recipient · content owner)
## 15. Error Handling
## 16. Edge Cases
## 17. Acceptance Criteria         (all AC-*)
## 18. Assumptions                 (from assumptions.md, with status)
## 19. Open Questions              (from open-questions.md, by priority)
## 20. Implementation Constraints  (mandated tech, existing systems, deadlines, regulation)
## 21. Requirement Traceability
| Business need | Feature ID | Flow | UI/API | Data | Rules | AC |
## 22. Definition of Done          (see completeness-check.md)
```


---

# `final-product/` package (Stage 4 deliverable)

Self-contained hand-off. A coding agent given ONLY this folder must be able to build the system.
No links out to `.software-engineer/`, no "see above", no unresolved placeholders outside
§Open Questions.

```
final-product/
  product.md        components/<name>.md
  stack.md          data-model.md
  spec.md           build-order.md
  features/<slug>.md   (Feature-mode briefs — template in feature-mode.md)
```

## final-product/product.md
```markdown
# <Product name>
Spec status: READY | NOT READY (n open P0)
Date · Version

## What we are building        (one paragraph, plain words)
## Why / goals & success measures
## Users & roles               (table: role → what they can do)
## Components                  (tree + one-line responsibility each + link to components/<f>.md)
## Primary workflows           (numbered happy paths, end to end)
## Scope
### In scope   ### Out of scope   ### Future
## Constraints                 (deadline, regions, compliance, existing systems)
## How to use this package     (read order: product → stack → data-model → components → build-order)
```

## final-product/stack.md
The authoritative stack file (template in `tech-stack-guide.md`): stack table with versions and
rationale, deployment & production plan, open technology decisions, cost estimate. Moved here
from `.software-engineer/`, not duplicated.

## final-product/data-model.md
```markdown
# Data Model
## Entities
### <Entity>  (owner component)
| Field | Type | Required | Unique | Default | Notes / enum values |
Relationships · lifecycle states · audit & soft-delete · retention
## Relationship diagram (text or mermaid)
## Shared enums
```
Entities are defined ONCE here. Component files reference them by name, never redefine them.

## final-product/components/<name>.md
```markdown
# <Component> — build brief
Type · Stack (from stack.md, with versions) · Depends on (other components/integrations)

## Responsibility / not responsible for
## Actors & permissions
## Features            (IDs + FULL numbered main and alternative flows, success/failure,
                       permissions — written out here, never "see spec.md")
## Screens             (UI components: content, actions, forms+validation, states)  — or —
## APIs                (backend components — REQUIRED, one row per operation, no deferral)
## Data used           (entity names from data-model.md; what this component may write)
## Business rules      (BR-* relevant to this component)
## Integrations        (trigger, failure, retry, fallback)
## Acceptance criteria (AC-*, written out in full — every feature above has at least one)
## Open questions affecting this component
```

### The API contract table is mandatory

A backend or API-consuming component brief MUST carry this table, fully filled. "Lock the
contract during implementation", "shapes TBD", or a bare verb list is a **failed hand-off** —
two agents building either side will diverge, and it surfaces at integration, not at review.

| Operation | Method | Path | Auth | Authorization | Request body | Success response | Errors (status + code + when) | Paging/sort | Idempotency |
|-----------|--------|------|------|---------------|--------------|------------------|-------------------------------|-------------|-------------|
| Book a class slot | POST | /api/bookings | member JWT | member is active, not blocked | `{occurrenceId}` | `201 {bookingId, status}` | 400 INVALID_PAYLOAD · 403 MEMBER_BLOCKED · 404 OCCURRENCE_NOT_FOUND · 409 ALREADY_BOOKED · 409 CLASS_FULL (→ offer waitlist) | n/a | `X-Request-Id`, replay returns original |

Field names, status codes and machine-readable error codes are part of the requirement — they
are what makes the two sides fit. Enumerate every error a business rule can cause.

### Single authoritative copy

`.software-engineer/` files are **working notes**. `final-product/` is the **authoritative
deliverable**. Move content into it; do not maintain the same requirement in both places, and
never duplicate the same table three times inside the package.

Inside `final-product/`, each fact has exactly ONE home:

| Content | Lives in | Everywhere else |
|---------|----------|-----------------|
| Entities, fields, relationships, enums | `data-model.md` | referenced by entity/field name |
| Feature flows, screens, API contracts, ACs | `components/<name>.md` (written out IN FULL) | referenced by ID only |
| Stack + deployment | `stack.md` | referenced by layer name |
| Product overview, roles, scope, workflows | `product.md` | referenced by name |
| Cross-cutting rules, state machines, security, NFRs, edge cases, traceability | `spec.md` | — |

`spec.md` §6/§7/§8 are an **index**: one line per component/entity pointing to its home file,
plus anything genuinely cross-cutting.

**No reference chains.** A reference must land on the content itself. If component A's rules
point at component B's rules, which point at `spec.md` §9, a builder has followed three hops to
find nothing — that is a defect, not a style choice. Rule of thumb: content lives where the
table above says, and every other mention is a bare ID.

**Nothing is lost in the move.** Before declaring the package done, diff the set of IDs defined
in the working notes against the set present in `final-product/`. An ID in one and not the other
is a FAIL — a real run silently dropped four acceptance criteria in exactly this step.

### Assumption-tagged content

Anything derived from a `A-xxx` the user has not confirmed is written into the package **marked
inline at the field, operation or phase level**: `[A-003 pending — confirm before building]`.
`product.md` opens with a "This build rests on these unconfirmed assumptions" list. Building on
a pending assumption is allowed; hiding that you did is not.

## final-product/build-order.md
```markdown
# Build Order
## Dependency graph          (what blocks what)
## Phases
### Phase 1 — <name>
- Components/features to build, in order
- Done when: <observable criteria + AC IDs covered>
## Parallelizable tracks      (what two agents/devs can build simultaneously)
## Contracts to lock first    (API shapes both sides depend on)
## Recommended builder skill per component  (e.g. dotnet-builder, react-panel-builder)

Note: `build-order.md` **references** the API contract table; it never restates how many
operations there are. A count copied into a second file is a count that will drift — in a real
run this file claimed 18 operations against a 20-row table that two other files had right.
## Risks / sequencing traps
```
