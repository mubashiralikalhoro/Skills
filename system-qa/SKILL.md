---
name: system-qa
description: Black-box QA workflow for live systems where NO source code is available — only a website URL, mobile app, or API endpoint plus the user's knowledge. Builds and maintains a persistent system-info.md knowledge base by interviewing the user and exploring the live system, then generates test cases from it and (after explicit confirmation) executes them with real evidence, files bugs, and gives a GO / NO-GO recommendation. Use when the user asks to QA or test a deployed/live app, website, or mobile app without code access — "test this website", "QA this app link", "black-box test", "we only have the live version", "test my app on the phone".
---

# System QA (black-box)

A QA workflow for systems you can only observe from the outside: a live website, a mobile app, an API — **no source code**. Everything the tests are based on comes from two sources:

1. **The live system itself** — explored with real tooling (browser, mobile device/emulator, HTTP client).
2. **The user** — interviewed to capture business rules, roles, expected behavior, and anything not observable from the outside.

Both are captured into a single persistent knowledge base, **`system-info.md`**, which is the source of truth for all test planning and is maintained across runs.

## Workspace layout

All output lives under `.system-qa/` in the current working directory:

```
.system-qa/
  system-info.md          # persistent knowledge base — maintained across runs
  runs/<timestamp>/       # per-run folder
    TEST_CASES.md
    TEST_SUMMARY.md
    RELEASE_CHECKLIST.md
    TEST_EXECUTION_REPORT.md   (stage 2)
    BUG_REPORT.md              (stage 2)
    SECURITY_REPORT.md         (stage 2)
    PERFORMANCE_REPORT.md      (stage 2)
    RELEASE_RECOMMENDATION.md  (stage 2)
    evidence/
```

## Hard rules (apply to every step)

- **No code, no guessing** — you cannot read the implementation, so never assume business rules, validation limits, roles, or hidden behavior. Anything not observed live or confirmed by the user goes in `system-info.md` under **Open questions**, and test cases derived from it are tagged `ASSUMPTION` until confirmed.
- **system-info.md is the source of truth** — every test case must trace back to a fact in it (observed or user-confirmed). Update it whenever anything new is learned — during interview, exploration, or execution. Never let it drift from reality.
- **Scope discipline** — only test features recorded in `system-info.md` and inside the agreed scope. Anything out of scope is explicitly marked "not covered".
- **Environment safety** — in **production**: never create junk artifacts (test orders, signup users), never mutate/destroy data, never run load/stress. Mark such cases `SKIPPED (prod-safe)`. Prefer read-only validation. Live apps with no code access are *usually* production — confirm, don't assume test env.
- **Evidence or it didn't happen** — in Stage 2, never mark `PASS` without actually executing and capturing evidence (screenshots, responses, recordings). Never assume functionality works.
- **Bug reports are observation-only** — no code access means no root-cause file references. Report exact repro steps, expected vs actual, and evidence; hypotheses about cause are labeled as hypotheses.

---

## Step 0 — Pre-flight gate (ask BEFORE doing anything)

Ask the user (use the question tool; skip a question only if already answered):

1. **Target** — the URL / app (store link, APK/IPA, installed app on device) / API base URL + docs. How do I reach it?
2. **Environment** — production or staging/test? If unclear, treat as **production** and enable safe mode.
3. **Access** — test accounts & credentials per role, anything off-limits (real payments, emails to real users, admin areas), rate limits to respect.
4. **Scope** — which features / flows / screens to cover this run? Do not default to "whole app" silently.

Do not proceed until target + environment + scope are known.

---

## Step 0.5 — Load or build `system-info.md`

- **Exists** → read it, then ask the user: *"Anything changed since last update — new features, removed flows, changed rules?"* Apply updates. Cross-check quickly against the live system (spot-check 2–3 recorded flows still exist).
- **Missing** → build it now:
  1. Read `references/interview-guide.md` and run the interview for the in-scope areas. Batch questions; don't interrogate one-by-one.
  2. Explore the live system with the right tooling (see `references/surface-types.md`) to map what is actually there: screens, nav, forms, roles, visible integrations.
  3. Write `system-info.md` using `references/system-info-template.md`. Mark every unconfirmed fact under **Open questions**.
  4. Show the user a short summary and ask them to correct anything wrong before planning.

Exploration in this step is **read-only reconnaissance** — no destructive actions, no mass data creation, respect prod safe mode.

---

## Stage 1 — Plan & generate test cases

1. Read `references/test-planning.md` and follow it, bounded to the agreed scope and grounded **only** in `system-info.md`.
2. Create the run folder:
   ```bash
   RUN=".system-qa/runs/$(date +%Y-%m-%d_%H-%M-%S)"
   mkdir -p "$RUN/evidence"
   ```
3. Write into `$RUN/`:
   - `TEST_CASES.md` — full scoped case inventory (positive, negative, edge, security, cross-device/browser, regression), each case referencing its `system-info.md` fact; `ASSUMPTION`-tagged cases listed separately.
   - `TEST_SUMMARY.md` — coverage summary, risk assessment, open questions blocking coverage, launch-readiness status.
   - `RELEASE_CHECKLIST.md` — launch checklist + Go/No-Go criteria (black-box verifiable items only).
4. Tell the user where the docs are, give a short coverage summary, and list open questions whose answers would unlock more coverage.

---

## Confirmation gate

Ask explicitly: **"Run these test cases now?"** (Yes / No).

- **No** → stop. Docs and `system-info.md` remain for later.
- **Yes** → Stage 2, same `$RUN` folder, same scope and environment mode.

---

## Stage 2 — Execute & validate

1. Read `references/test-execution.md` and follow it.
2. Pick tooling per surface (see `references/surface-types.md`): browser automation for web, mobile MCP / device for mobile apps, curl/HTTP client for APIs. If the needed tooling doesn't exist (e.g. no mobile device access), mark those cases `BLOCKED` — never fake results.
3. Respect **prod safe-mode**: skip mutating/destructive/data-creating cases, mark `SKIPPED (prod-safe)`.
4. Save evidence (screenshots, recordings, response dumps) under `$RUN/evidence/`.
5. **Maintain `system-info.md`**: anything learned during execution — an undocumented validation rule, a hidden screen, a corrected assumption — gets written back immediately. Resolve Open questions as answers appear.
6. Write into `$RUN/`: `TEST_EXECUTION_REPORT.md`, `BUG_REPORT.md`, `SECURITY_REPORT.md`, `PERFORMANCE_REPORT.md`, `RELEASE_RECOMMENDATION.md` (**GO** / **GO WITH RISKS** / **NO GO** with justification).
7. Summarize results + recommendation, and note what changed in `system-info.md`.
