# Judging — blind judges, adversary, senior gate, decision math

All judging runs as **separate subagents** (use the Workflow tool to fan out in parallel). They
receive only the **raw before/after result artifacts** and the **frozen rubric** — never the
proposing agent's claim that it improved. This is the anti-drift core.

## Default panel

- **2 scorers** — independently rate before and after on every rubric criterion.
- **1 adversary** — sole job: find what got WORSE. Lists regressions.
- **1 senior-expert gate** — domain reviewer (from contract `Domain`): stable vs rookie.

Scale the panel up for high-stakes runs (e.g. 3 scorers + 2 adversaries). Never below 1 scorer
+ 1 adversary + 1 senior.

## Scorer prompt (each scorer, blind)

```
You are an impartial judge. Below are two artifacts — BEFORE and AFTER — and a frozen rubric.
You do NOT know which change was made or who claims it improved. Judge only what you see.

For EACH rubric criterion, give BEFORE and AFTER a score 0–10 with a one-line justification
quoting the artifact. Do not reward change for its own sake. If AFTER is not clearly better on
a criterion, score it equal or lower.

Rubric: <criteria + weights + definitions>
BEFORE: <artifact>
AFTER:  <artifact>

Return JSON: { "<criterion>": {"before": n, "after": n, "why": "..."} , ... }
```

## Adversary prompt

```
You are a hostile reviewer. Your ONLY job is to find ways the AFTER artifact is WORSE than
BEFORE — regressions, new edge-case failures, removed value, subtle breakage, tone drift,
unsupported claims. Be specific and quote evidence. If you find nothing real, say so explicitly
— do not invent. Default to suspicion.

Rubric: <...>   BEFORE: <...>   AFTER: <...>
Return JSON: { "regressions": [ {"criterion": "...", "evidence": "...", "severity": "low|med|high"} ] }
```

## Senior-expert gate prompt

```
You are a <DOMAIN senior expert> with 15+ years of experience reviewing a junior's change
before it ships. Ignore the rubric score. Judge ONLY: is this stable, production-grade work, or
a rookie hack that looks good but is fragile?

Check: edge cases handled? maintainable? consistent with the rest of the system? any cut corner
that bites later? would you put your name on this?

Artifact (AFTER): <...>   Context: <target + contract goal>
Return JSON: { "verdict": "STABLE" | "FLIMSY", "reasons": ["..."], "must_fix": ["..."] }
```

## Decision math

1. **Aggregate scorers.** For each criterion, average the scorers' before and after.
2. **Weighted totals.** `total_before = Σ weight_i · avg_before_i`,
   `total_after = Σ weight_i · avg_after_i`.
3. **Regression gate.** REJECT if any criterion's `avg_after_i < avg_before_i`, OR the adversary
   reports any `severity = high` (or med) regression with real evidence.
4. **Senior gate.** REJECT if `verdict == FLIMSY`.
5. **KEEP** iff: `total_after > best_score` AND regression gate passes AND senior == STABLE.
   Otherwise REVERT.

A change must clear **all** gates. Score improvement alone is never enough — the regression gate
enforces "no downsides," and the senior gate enforces "stable, not rookie."

## Blindness checklist

- Judges must not see the journal, the proposing agent's reasoning, or the diff framed as "my
  improvement." Give them clean BEFORE/AFTER artifacts only.
- Randomize/withhold which is "new" where feasible, so a judge can't favor novelty.
- Run scorers in parallel and independent — do not let them see each other's scores.
