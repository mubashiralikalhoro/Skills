# Test Planning & Case Generation (black-box)

Act as a Senior QA Lead and Product Analyst. Produce an exhaustive, production-grade set of
test cases for the **agreed scope**, grounded **only** in `system-info.md`.

## Grounding rule (read first)

- Every test case must trace to a fact in `system-info.md`. Cite it (e.g. "per §3 Checkout").
- A fact tagged `[assumed]` → its cases are tagged **`ASSUMPTION`** and listed separately;
  they need user confirmation or live discovery before counting as coverage.
- **No code = no white-box cases.** Do not write cases for internal DB constraints, source
  functions, or hidden endpoints you can't reach. Test the observable contract only.
- Production target → still PLAN destructive/data-creating cases, tag `prod-safe: skip`.

## Phase 1 — Map scope from system-info.md

List every in-scope feature and its recorded flows, rules, roles, integrations, and the
surfaces they live on (web/mobile/API). If a feature has too many Open questions to test
meaningfully, note it as a **coverage gap** rather than inventing behavior.

## Phase 2 — Flow & role mapping

For each feature inventory: happy path, alternate paths, error/recovery paths — as recorded
live or described by the user. Map which roles exercise each flow (test each role's view).

## Phase 3 — Risk assessment

- **High**: auth/login, payments, data creation/modification/deletion, uploads, anything the
  user named in their "fear list" (interview Round 4).
- **Medium**: search, filtering, reporting, notifications, preferences.
- **Low**: static/informational content.

Prioritize by business impact × likelihood, weighting the user's stated fears up.

## Phase 4 — Case format

For every case: ID, Feature (+ system-info.md ref), Surface (web/mobile/API), Role,
Priority (Critical/High/Medium/Low), Preconditions, Test Data, Steps (numbered),
Expected Result (per step, from the recorded rule), Post-conditions. Tag prod-unsafe cases
`prod-safe: skip`; tag assumption-based cases `ASSUMPTION`.

## Phases 5–11 — Coverage (scoped)

- **5 Positive** — valid inputs, standard workflows per recorded happy paths, each role.
- **6 Negative** — invalid/empty inputs, boundary violations, unauthorized access, wrong-role
  access, expired sessions, declined payments, external-service failures, duplicate submits.
- **7 Edge** — min/max/boundary values, large inputs, special & unicode chars, slow network,
  double-tap/double-submit, back-button mid-flow, timezone/date, interrupted flows.
- **8 Security (black-box only)** — auth bypass attempts, authz/role escalation via direct
  URL/endpoint access, session & token behavior, reflected XSS in inputs, obvious injection in
  form fields, sensitive data exposed in responses/URLs, insecure direct object reference
  (changing an id in URL/API). No source review — observed behavior only.
- **9 Cross-surface / compatibility** — same flow across the browsers/devices/OS in §4;
  responsive layout; web vs mobile-app parity where both in scope; API called directly vs via UI.
- **10 Notifications & integrations** — verify email/SMS/push and external results via the
  hooks from interview Round 3; mark `NOT TESTABLE` where no hook exists.
- **11 Regression** — critical workflows + the regression hotspots recorded in §5.

## Phase 12 — Launch readiness

Black-box-verifiable checklist: critical paths pass, no open critical defects, auth/authz
holds, key notifications deliver, works on the target browsers/devices, no sensitive data
leaked in responses/URLs. Pair each with Go/No-Go criteria. Items you cannot verify without
code/infra access (backups, monitoring, DB integrity) are listed as **"user must confirm"**,
not silently passed.

## Deliverables (written by SKILL.md into $RUN/)

- **TEST_CASES.md** — feature inventory + all cases + separate `ASSUMPTION` list + out-of-scope list.
- **TEST_SUMMARY.md** — coverage summary, risk assessment, **coverage gaps from Open questions**, launch-readiness status.
- **RELEASE_CHECKLIST.md** — launch checklist + Go/No-Go + "user must confirm" items.

Be exhaustive within scope; leave no recorded flow, role, validation, or integration untested.
Do not pad with features absent from system-info.md.
