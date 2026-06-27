# Test Planning & Test Case Generation

Act as a Senior QA Lead, Product Analyst, and Software Tester. Goal: produce an exhaustive,
production-grade set of test cases for the **agreed scope** of the system.

## Scope binding (read first)

- Only analyze and write cases for the modules / features / flows / endpoints in scope.
- Verify each thing exists in the codebase or running system before writing cases for it.
  Never invent features. If a phase below has nothing in scope, write "N/A — out of scope".
- List anything adjacent-but-excluded under an explicit "Out of scope / not covered" heading.
- If the environment is **production**, still PLAN destructive/data-creating cases, but tag
  them `prod-safe: skip` so the execution stage knows not to run them.

## Phase 1 — Discovery

Review the in-scope parts of the codebase: architecture, business logic, data/schema, APIs,
roles & permissions, integrations & third-party services, background/scheduled jobs,
validation rules, error handling, security controls, config & environment variables.

For each in-scope module capture: purpose, business requirement, user goal, dependencies,
inputs, outputs, success criteria, failure scenarios.

## Phase 2 — Feature & flow mapping

Inventory in-scope flows: happy paths, alternate paths, exception paths, recovery paths.
Inventory use cases: primary, secondary, administrative, system-generated. Add a short
text flow description for each major process.

## Phase 3 — Risk assessment

Classify in-scope areas:
- **High**: auth, authorization, payments, data modification, data deletion, file uploads,
  API endpoints, external integrations.
- **Medium**: reporting, search, filtering, notifications, preferences.
- **Low**: static/informational content.

Prioritize by business impact × likelihood of failure.

## Phase 4 — Test case format

For every case record: ID, Module, Feature, Priority (Critical/High/Medium/Low), Severity,
Preconditions, Test Data, Steps (numbered), Expected Result (per step), Post-conditions.
Tag prod-unsafe cases with `prod-safe: skip`.

## Phases 5–12 — Coverage (write cases for each, scoped)

- **5 Positive** — valid inputs, standard workflows, expected business scenarios, success API responses.
- **6 Negative** — invalid/empty inputs, boundary violations, unauthorized access, bad permissions, invalid/duplicate payloads, expired sessions, network/third-party failures, concurrent ops.
- **7 Edge** — boundary/min/max values, large datasets, special & unicode chars, race conditions, duplicate requests, slow responses, timezone/date/leap-year, data-corruption scenarios.
- **8 Security** — auth bypass, authz checks, privilege escalation, session & token handling, password policy, input sanitization, SQLi, XSS, CSRF, file-upload abuse, sensitive-data exposure, API security.
- **9 API** — per endpoint: success, validation errors, authn failure, authz failure, invalid payloads, missing fields, rate limiting, error handling, response consistency.
- **10 Database** — CRUD, constraints, foreign keys, transactions, integrity, cascades, migration impact.
- **11 Performance** — identify load, stress, scalability, large-dataset, concurrent-user scenarios (planning only; tag `prod-safe: skip`).
- **12 Regression** — critical workflows, core business functions, previously affected areas, integration points.

## Phase 13 — Launch readiness

Build a release-readiness checklist: critical paths tested, no open critical defects,
security reviewed, performance validated, logging present, monitoring configured, backup &
rollback strategies verified, production config validated. Pair each with Go/No-Go criteria.

## Deliverables (written by SKILL.md into the run folder)

- **TEST_CASES.md** — feature inventory + all cases (positive, negative, edge, security, API, DB, regression) + out-of-scope list.
- **TEST_SUMMARY.md** — coverage summary, risk assessment, critical findings, recommendations, launch-readiness status.
- **RELEASE_CHECKLIST.md** — production launch checklist + Go/No-Go criteria.

Be exhaustive within scope; leave no in-scope flow, validation, role, integration, or error
path untested. Do not pad the docs with out-of-scope material.
