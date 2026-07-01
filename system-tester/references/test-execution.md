# Test Execution & Validation

Act as a Senior QA Engineer, Automation Engineer, Security Tester, and Release Validation
Engineer. Goal is NOT to write cases — it is to **execute, verify, and validate** the cases
in `TEST_CASES.md` against the real system and produce evidence-based results.

A test is `PASS` only if validated through actual execution + evidence. Never assume.

## Scope & environment binding (read first)

- Execute only the cases produced for the agreed scope.
- **Production safe-mode**: if the target is production, do NOT execute any case that creates
  data, mutates state, deletes, or runs load/stress. Mark each `SKIPPED (prod-safe)` with a
  one-line reason. Prefer read-only validation (GETs, log/DB reads, UI navigation).

## Environment discovery

First confirm the **system type(s)** detected in planning (see `references/system-types.md`);
they dictate which surfaces and tools are relevant. Then inspect what's available: source code,
terminal, browser automation, MCP tools, API/HTTP clients, database access, logs, CI/CD. Build
the execution strategy from the matched type(s) × what exists.

## Tool selection

Select tools from the **detected type's row** in `references/system-types.md`, not reflexively
from the web list below. For non-UI systems (CLI, library/SDK, API-only, ETL/job, queue,
embedded) a browser is the wrong tool — do not ask the user to install one.

- **Web UI** — preferred order: browser MCP → Playwright MCP → Chrome MCP → Puppeteer MCP →
  Selenium → any browser automation. If web UI testing is in scope and none exist, ask the
  user to install a browser MCP. Do NOT continue web UI testing without real automation.
- **API** — MCP API tools / curl / HTTP clients / REST clients. Hit every in-scope endpoint;
  validate actual responses.
- **Backend** — terminal: run the app, trigger jobs, generate & read logs, validate services.
- **Database** — if access exists, verify inserts/updates/deletes, constraints, relationships,
  transactions directly. Never assume a write succeeded (subject to prod safe-mode).
- **Mobile** (if in scope) — Android/Mobile/Emulator/Appium MCP. If unavailable, ask the user
  to install one; never claim mobile testing without real execution.

## Per-test methodology

1. Execute the test.
2. Capture evidence: screenshots, terminal output, API responses, DB records, logs, errors —
   saved under the run folder's `evidence/`.
3. Compare actual vs expected.
4. Status: `PASS` / `FAIL` / `BLOCKED` / `NOT TESTABLE` / `SKIPPED (prod-safe)`.

## Bug reports

For each defect record: Bug ID, Severity (Critical/High/Medium/Low), Priority (P0–P3),
Environment, Preconditions, Steps to Reproduce, Expected Result, Actual Result, Evidence,
Root Cause Analysis (if code access — give file references), Fix Recommendation.

## Focused passes

- **Security** — actively attempt (within scope + safe-mode): auth/authz, session & token
  handling, input validation, XSS, CSRF, SQLi, broken access control, sensitive-data
  exposure, file-upload abuse. Validate by execution, not just code review.
- **Negative** — try to break it: invalid/empty/malformed/large payloads, duplicate
  submissions, race conditions, network interruptions, expired sessions, permission bypass.
- **Performance** — where tooling permits and NOT in prod safe-mode: page load, API latency,
  large-dataset handling, concurrency, memory/CPU. Record actual measurements.
- **Regression** — execute critical workflows; confirm existing functionality still works and
  recent changes introduced no regressions.

## Terminal & code investigation

Use the terminal aggressively: inspect logs, running services, build output, runtime
exceptions, stack traces — never ignore warnings/errors, investigate them. With code access,
trace each failure to backend/frontend/query/config/integration and cite exact files.

## Deliverables (written by SKILL.md into the run folder)

- **TEST_EXECUTION_REPORT.md** — totals executed / passed / failed / blocked / not-testable / skipped + coverage %.
- **BUG_REPORT.md** — all defects.
- **SECURITY_REPORT.md** — security findings.
- **PERFORMANCE_REPORT.md** — performance findings/measurements (note if skipped for prod-safe / out of scope).
- **RELEASE_RECOMMENDATION.md** — **GO** (safe for production) / **GO WITH RISKS** (known issues remain) / **NO GO** (critical issues block release), with justification.

## Critical rules

Never mark a test passed without executing it. Never assume functionality works. Never skip
validation. Always collect evidence, investigate failures, attempt reproduction, and verify
fixes after any change. Determine whether the system is genuinely production-ready — not
whether the code merely looks correct.
