# autoloop contract — system-tester skill

**Created:** 2026-06-30
**Status:** FROZEN

## Target

The `system-tester` skill in this repo (git-tracked):
- `SKILL.md`
- `references/test-planning.md`
- `references/test-execution.md`

(Installed mirror at `~/.claude/skills/system-tester/` is re-synced from here after the run; not edited during the loop.)

## Goal

Make `system-tester` a senior-SQA-grade skill that takes ANY system to production-ready with
fully automated, evidence-based testing — positive, negative, edge, security, API, DB,
performance, regression — across many system types (web, REST/GraphQL API, mobile, CLI,
desktop, data pipeline, background jobs, embedded, etc.), eliminating manual testing wherever
real tooling exists. It must behave like a seasoned SQA lead: pick the right tools per system
type, never fake a PASS, never invent features, stay prod-safe, and end with a defensible
GO / NO-GO call.

## Rubric (frozen)

| # | Criterion                     | Weight | "Good" means                                                                                  |
|---|-------------------------------|--------|-----------------------------------------------------------------------------------------------|
| 1 | System-type adaptivity        | 0.30   | Detects the system type(s) and adapts strategy + tooling correctly (web/API/mobile/CLI/desktop/data-pipeline/jobs/embedded); no web-only tunnel vision. |
| 2 | Coverage completeness         | 0.22   | Every test class exhaustively handled within scope: positive, negative, edge, security, API, DB, performance, regression — nothing in-scope left untested. |
| 3 | Automation depth / no manual  | 0.20   | Drives real tools end-to-end; eliminates manual steps where automation exists; concrete tool-selection per system type, not vague "test it". |
| 4 | Evidence rigor / no false PASS| 0.16   | Never PASS without real captured evidence; investigates every failure; root-cause with file refs when code access exists. |
| 5 | Scope & prod-safety + deliverables | 0.12 | Scope-bound, no invented features, prod safe-mode enforced; deliverables (bugs, security, GO/NO-GO) are clear and actionable. |
<!-- weights sum to 1.00 -->

## Observe step

**Type:** agent-inspect + sim (both)
**How:** each iteration, a subagent does TWO things on the *current* skill files:
  1. **Sim** — pretends to follow the skill as a testing agent against 3 fixed representative
     mock targets and writes what it would actually do:
       - a web app (React SPA + REST backend + Postgres)
       - a standalone REST API service (no UI)
       - a CLI tool (no web, no DB)
     For each: what system type it detects, which tools it picks, which test classes/cases it
     generates, where it would get stuck or fake a result.
  2. **Inspect** — audits SKILL.md + references/* for gaps, contradictions, vague instructions,
     missing system types, missing tool guidance, false-PASS loopholes.
**Produces:** `autoloop/observe/iter-<n>.md` — the combined sim transcripts + audit findings
(the raw before/after artifact judges score against the frozen rubric).

## Experiment unit

One focused edit to SKILL.md or one references file targeting the lowest-scoring rubric
criterion — e.g. add a system-type detection matrix, add a per-system-type tool table, tighten
a vague phase, close a false-PASS loophole. One mutation per iteration; keep the skill coherent
and not bloated.

## Domain (senior persona)

Senior SQA / QA Lead (test strategy, automation, release validation).

## Budget

**Max iterations:** 15
**Token/time cap:** 600k tokens

## Convergence

**k (no-gain iterations to stop):** 3

## Checkpoint mode

git (commit on KEEP, `git reset --hard` on REVERT)
