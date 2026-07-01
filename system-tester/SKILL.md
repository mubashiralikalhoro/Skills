---
name: system-tester
description: Two-stage QA workflow for any application — first generate exhaustive, scoped test cases as markdown docs, then (after explicit user confirmation) execute and validate them against the live system with real evidence, file bugs, and give a GO / NO-GO release recommendation. Use when the user asks to QA, test, validate, write test cases, do a release-readiness or launch-readiness check, audit quality, or verify a system is production-ready. Triggers include "test this app", "QA my project", "write test cases", "is this ready to ship", "run the test cases", "system test".
---

# System Tester

A two-stage QA workflow. **Stage 1** plans and writes exhaustive test cases. **Stage 2**, gated behind explicit user confirmation, actually executes them and reports evidence-based results.

All output goes into a per-run timestamped folder inside the project being tested:
`.system-tester/<timestamp>/`.

## Hard rules (apply to both stages)

- **Scope discipline** — only test parts that exist in the codebase or that the user named. Never invent or assume features. Anything out of scope is explicitly marked "not covered".
- **Environment safety** — in **production**, never create artifacts (test orders, signup users, junk records), never run mutating/destructive operations, never run load/stress that could degrade service. Mark such cases `SKIPPED (prod-safe)`. Prefer read-only validation.
- **Evidence or it didn't happen** — in Stage 2, never mark a test `PASS` without actually executing it and capturing evidence. Never assume functionality works. Investigate every failure.

---

## Step 0 — Pre-flight gate (ask BEFORE doing anything)

Ask the user (use the question tool; skip a question only if already answered in their request):

1. **Scope** — which module / feature / flow / endpoint(s) to cover? If the user already named a target, use it. Otherwise ask. Do not default to "whole system" silently.
2. **Environment** — is the target **production** or **test/dev**? Get the base URL / how to reach it.
3. **Access** — needed credentials, test accounts, allowed actions, anything off-limits.

If **production** → enable **safe mode** for the whole run (see Hard rules). State plainly that destructive/data-creating cases will be planned but not executed.

Do not proceed past this gate until scope + environment are known.

---

## Step 0.5 — Detect the system type(s)

Read `references/system-types.md` and run its detection procedure on the in-scope surfaces.
A system is often a **mix** (web UI + REST API + DB + a scheduled job) — identify every type
in scope. The detected type(s) drive Stage 1 discovery/coverage and Stage 2 tool selection,
evidence form, and which generic phases are N/A. **Do not default to "web app"**: a CLI,
library/SDK, API-only service, ETL job, or message-queue consumer has no browser surface, so
never reach for (or ask the user to install) browser automation for it.

---

## Stage 1 — Plan & generate test cases

1. Read `references/test-planning.md` and follow it, **bounded to the agreed scope**.
2. Create the run folder:
   ```bash
   RUN=".system-tester/$(date +%Y-%m-%d_%H-%M-%S)"
   mkdir -p "$RUN/evidence"
   ```
3. Write into `$RUN/`:
   - `TEST_CASES.md` — full scoped case inventory (positive, negative, edge, security, API, DB, regression).
   - `TEST_SUMMARY.md` — coverage summary, risk assessment, recommendations, launch-readiness status.
   - `RELEASE_CHECKLIST.md` — production launch checklist + Go/No-Go criteria.
4. Tell the user where the docs are and give a short coverage summary.

---

## Confirmation gate

Ask the user explicitly: **"Run these test cases now?"** (Yes / No).

- **No** → stop. The planning docs remain for later.
- **Yes** → proceed to Stage 2, reusing the **same** `$RUN` folder, scope, and environment mode.

---

## Stage 2 — Execute & validate

1. Read `references/test-execution.md` and follow it.
2. Discover available tooling and pick **per the detected system type(s)** (see `references/system-types.md` and the tool order in `test-execution.md`): browser MCP → Playwright → Chrome → Puppeteer → Selenium for web UI; curl/HTTP for API; terminal + exit-code/stdio capture for CLI; unit harness for libraries; grpcurl/wscat for gRPC/WebSocket; mobile/Appium MCP for mobile; broker/emulator for queue/embedded. Only ask the user to install browser automation when a **web/Electron** surface is in scope and none exists — never for a non-UI system. Do not fake results for any type.
3. Respect **prod safe-mode**: skip mutating/destructive/data-creating cases, mark them `SKIPPED (prod-safe)`.
4. Save evidence (screenshots, response dumps, logs, query output) under `$RUN/evidence/`.
5. Write into `$RUN/`:
   - `TEST_EXECUTION_REPORT.md` — totals: executed / passed / failed / blocked / not-testable + coverage %.
   - `BUG_REPORT.md` — every defect found (id, severity, priority, repro, expected vs actual, evidence, root cause if code access, fix recommendation).
   - `SECURITY_REPORT.md` — security findings.
   - `PERFORMANCE_REPORT.md` — performance findings/measurements (omit or note if not in scope / prod-safe).
   - `RELEASE_RECOMMENDATION.md` — one of **GO** / **GO WITH RISKS** / **NO GO**, with justification.
6. Summarize results and the release recommendation to the user.
