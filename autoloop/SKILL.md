---
name: autoloop
description: Autonomous iterative improvement harness — improves any system (code, website, marketing strategy, workflow, document) by repeatedly mutating it, observing results, judging with blind multi-agent review plus a senior-expert stability gate, and keeping only changes that improve a frozen rubric with no regressions, until it converges or hits a budget cap. Use when the user wants to auto-improve, optimize, harden, refine, or iteratively perfect something — "improve this until it has no downsides", "keep iterating on X", "make this the best it can be", "auto-improve my marketing flow / landing page / code", "find weak spots and fix them in a loop", "self-improving loop". Inspired by karpathy/autoresearch but generic and interview-driven.
---

# autoloop

Generic self-improvement loop. Inspired by `karpathy/autoresearch`, which hard-codes its
target (`train.py`) and metric (`val_bpb`). autoloop makes those two slots **pluggable** via a
setup interview, so the same loop improves any system.

Core pattern:
```
mutate → observe → judge → keep-or-revert → repeat  (until converged or budget hit)
```
Git/snapshot = memory. Keep = commit/snapshot. Revert = reset. Frozen rubric = fitness function.

## Hard rules

- **Never start the loop without a confirmed contract.** Run the setup interview first and show
  the contract back to the user for approval.
- **The rubric is frozen at setup.** Never edit scoring criteria mid-run. No moving goalposts.
- **Judges are blind and separate.** Judging subagents see only the raw before/after artifacts,
  never the proposing agent's claim that it improved.
- **A change is KEPT only if all three hold:** weighted total rose, no single criterion
  regressed, and the senior-expert verdict is STABLE. Otherwise revert.
- **Always run the senior-expert gate.** Rookie/flimsy work is rejected even when the rubric
  score rose. Stability outranks score.
- **Every run is budget-capped.** No unbounded loops. Stop on convergence OR budget, whichever first.
- **Log every iteration** to `autoloop/journal.md` and `autoloop/results.tsv` before continuing.

## Stage 1 — Setup interview (run once per project)

Interview the user and write the **experiment contract** to `autoloop/contract.md` (this is the
`program.md` equivalent). Ask one question at a time. Collect:

- **Target** — what to improve (files / repo / website / strategy doc / workflow).
- **Goal + requirements** — compile into a **frozen rubric**: criteria, each with a weight (0–1)
  and a one-line description of what "good" means for it.
- **Observe step** — how to *see results* each iteration (the `val_bpb` equivalent): a shell
  command, an MCP call (browser/WhatsApp/etc.), a URL fetch, or agent inspection of the target.
  Must produce a raw result artifact.
- **Experiment unit** — what one mutation looks like.
- **Domain** — selects the senior-expert persona (senior engineer / marketer / designer / …).
- **Budget** — max iterations + token/time cap.
- **Convergence** — `k` consecutive no-gain iterations to stop (default 3).
- **Checkpoint mode** — git if inside a repo, else a snapshot directory under `autoloop/snapshots/`.

Use `references/contract-template.md`. Show the filled contract back; get explicit approval
before Stage 2.

## Stage 2 — The loop

For each iteration (see `references/loop-procedure.md` for the full procedure):

```
1. Find weakest spot  → agent reads contract + current state, picks ONE experiment
                        targeting the lowest-scoring rubric criterion.
2. Apply              → make the change.
3. Observe            → run the contract's observe step → raw result artifact.
4. Judge (fan-out)    → blind parallel subagents on raw before/after:
                          - scorers (default 2): rate before & after vs frozen rubric
                          - adversary (default 1): hunt only for what got WORSE
5. Senior gate        → domain senior-expert reviews candidate → STABLE or FLIMSY.
6. Decide             → KEEP iff total rose AND no criterion regressed AND senior=STABLE;
                        KEEP → commit/snapshot, else revert to previous checkpoint.
7. Log                → row in results.tsv + note in journal.md.
8. Stop check         → k consecutive no-gain (converged) OR budget hit → stop. Else loop.
```

Use the **Workflow tool** to fan out judges + senior gate in parallel (see
`references/judging.md` for the exact judge/adversary/senior prompts and the decision math).
For long unattended runs, the user can pair this with `/loop`.

## Output (on stop)

- Best version of the target, live.
- `autoloop/journal.md` — every experiment, scores, verdicts, keep/revert reason.
- `autoloop/results.tsv` — machine-readable log.
- Final report — remaining weak spots the loop could not safely fix.

## Files this skill creates (inside the target project)

```
autoloop/
  contract.md        frozen experiment contract (from Stage 1)
  journal.md         human-readable run log
  results.tsv        machine-readable per-iteration scores
  snapshots/         checkpoint copies (only when not using git)
```

## References

- `references/contract-template.md` — the experiment-contract fields + example.
- `references/loop-procedure.md` — detailed per-iteration procedure + checkpoint/revert.
- `references/judging.md` — blind-judge, adversary, and senior-expert prompts + decision math.
