# Experiment Contract Template

Copy this into `autoloop/contract.md` and fill from the setup interview. Once written and
approved, it is **frozen** — do not change the rubric mid-run.

```markdown
# autoloop contract — <project name>

**Created:** <YYYY-MM-DD>
**Status:** FROZEN

## Target
<what is being improved — paths / repo / URL / doc / workflow>

## Goal
<one paragraph: what success looks like in plain words>

## Rubric (frozen)
| # | Criterion        | Weight | "Good" means                          |
|---|------------------|--------|---------------------------------------|
| 1 | <name>           | 0.30   | <one-line definition>                 |
| 2 | <name>           | 0.25   | <one-line definition>                 |
| 3 | <name>           | 0.25   | <one-line definition>                 |
| 4 | <name>           | 0.20   | <one-line definition>                 |
<!-- weights must sum to 1.0 -->

## Observe step
**Type:** command | mcp | url-fetch | agent-inspect
**How:** <exact command / MCP call / URL / what the inspecting agent reads>
**Produces:** <the raw result artifact each iteration, e.g. run.log, a screenshot, page text>

## Experiment unit
<what one mutation may change — scope of a single iteration's edit>

## Domain (senior persona)
<senior engineer | senior marketer | senior designer | senior copywriter | ...>

## Budget
**Max iterations:** <N>
**Token/time cap:** <e.g. 500k tokens / 2h>

## Convergence
**k (no-gain iterations to stop):** <default 3>

## Checkpoint mode
git | snapshot
```

## Worked example — marketing workflow

```markdown
# autoloop contract — Car-rental WhatsApp flow

## Target
campaigns/car-rental.md + conversations flow in CLAUDE.md

## Goal
Maximize booked 15-min meetings per conversation without sounding pushy or robotic.

## Rubric (frozen)
| # | Criterion       | Weight | "Good" means                                        |
|---|-----------------|--------|-----------------------------------------------------|
| 1 | Warmth/human    | 0.25   | reads like a helpful person, not a bot              |
| 2 | Qualifies fast  | 0.20   | identifies need + campaign in <=2 turns             |
| 3 | Steers to meet  | 0.30   | offers 2 concrete slots once interest shown         |
| 4 | No pushiness    | 0.15   | never double-texts, never repeats pitch             |
| 5 | On-facts        | 0.10   | only uses campaign-file facts, invents nothing      |

## Observe step
Type: agent-inspect
How: simulate 5 customer personas against the flow; capture the transcripts.
Produces: autoloop/run-transcripts.md

## Experiment unit
Edit greeting/qualifying/pitch wording or stage logic in the flow docs.

## Domain
senior marketer

## Budget
Max iterations: 15 ; cap: 400k tokens

## Convergence
k = 3

## Checkpoint mode
git
```
