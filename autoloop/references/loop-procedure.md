# Loop Procedure (detailed)

Run only after the contract in `autoloop/contract.md` is FROZEN and user-approved.

## One-time before the loop

1. Confirm checkpoint mode:
   - **git:** `git checkout -b autoloop/<tag>` (tag from date). Working tree must be clean.
   - **snapshot:** create `autoloop/snapshots/`; snapshot the target now as `iter0/`.
2. Establish the **baseline**: run the contract's observe step on the current target, run the
   judges (see `judging.md`) to get the baseline weighted score. Record as iteration 0.
3. Create `autoloop/journal.md` and `autoloop/results.tsv` (header:
   `iter\tcriterion_scores\ttotal\tsenior\tverdict\tnote`).
4. Init counters: `no_gain = 0`, `best_score = baseline`, `best_ref = <commit/snapshot>`.

## Per iteration

1. **Find weakest spot.** An agent reads the contract + current target + the last journal
   entries, identifies the lowest-scoring criterion, and proposes ONE concrete experiment that
   targets it. One change per iteration — keep it isolated and comparable.
2. **Apply.** Make the edit / take the action. Stay inside the contract's experiment-unit scope.
3. **Observe.** Run the contract's observe step exactly as written → save the raw result
   artifact for this iteration (e.g. `autoloop/iters/<n>/result.*`).
4. **Judge.** Fan out blind judges + adversary per `judging.md`. Collect per-criterion before/
   after scores and the adversary's regression list.
5. **Senior gate.** Run the domain senior-expert review per `judging.md` → STABLE or FLIMSY.
6. **Decide.**
   - Compute `total_after` = weighted sum of after-scores.
   - **KEEP** iff: `total_after > best_score` AND no criterion's after-score < its before-score
     (regression gate) AND senior verdict == STABLE.
   - **KEEP** → checkpoint: git `commit` (or copy to `snapshots/iter<n>/`). Update
     `best_score`, `best_ref`. Reset `no_gain = 0`.
   - **REVERT** → restore previous checkpoint: git `reset --hard <best_ref>` (or restore
     `best_ref` snapshot over the target). `no_gain += 1`.
7. **Log.** Append the row to `results.tsv` and a short note to `journal.md` (experiment tried,
   per-criterion deltas, senior verdict, kept/reverted, one-line why).
8. **Stop check.** Stop if `no_gain >= k` (converged) OR budget cap reached. Otherwise loop.

## On stop

1. Restore `best_ref` so the best version is live.
2. Write the **final report** to `journal.md`: total iterations, kept count, final score,
   and a list of remaining weak spots (lowest criteria the loop could not safely raise).
3. Tell the user where the best version lives and summarize.

## Notes

- **Isolation matters.** One experiment per iteration. If a change bundles several edits, you
  can't attribute the score move — split it.
- **Determinism of observe.** If the observe step is noisy (e.g. live site, model sampling),
  run it 2–3× and average, or the regression gate will flag noise as regressions.
- **No silent caps.** If you stop early for any reason other than convergence/budget, log why.
