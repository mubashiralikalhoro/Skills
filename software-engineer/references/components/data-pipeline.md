# Component guide: Data pipeline / reporting / analytics / ML component

## P0 — blocking
- **Question being answered.** A report exists to change a decision — which decision, whose?
- **Sources**: which systems, which tables/events, who owns them, can they be read directly.
- **Freshness**: real-time, hourly, daily, monthly? "Real-time" is expensive — confirm it is real.
- **Grain and definitions**: what one row means, and the exact definition of every metric
  ("active member" = ? "completed order" = ?). Undefined metrics are the top cause of rework.
- For ML: what is predicted, from what features, what a wrong prediction costs, and what the
  system does with a low-confidence result. Is a human in the loop?

## P1
- Historical scope and backfill: how far back, and whether history is restated when logic changes.
- Late-arriving and corrected data: does yesterday's number change tomorrow?
- Access control: who may see which rows; is any of it PII or regulated.
- Delivery: dashboard, scheduled export, API, email. Who is the audience.
- Reconciliation: which number is authoritative when the report and the app disagree.
- For ML: training data source, retraining cadence, drift detection, evaluation metric and the
  threshold that makes it acceptable, fallback when the model is unavailable.

## P2
- Self-serve exploration, saved segments, alerting on metric thresholds, data catalog/lineage.

## Do not ask
Warehouse, orchestration tool, or model architecture — Stage 3.5.
