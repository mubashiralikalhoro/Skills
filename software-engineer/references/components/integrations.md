# Component guide: Third-party integrations

Payments, email, SMS/OTP, push, maps, identity providers, accounting, ERP, external APIs.

## Per integration — collect
- Provider (chosen / to choose / UNKNOWN) and purpose.
- Trigger: which feature or event calls it; direction (outbound call, inbound webhook, both).
- Data exchanged, including PII and money amounts. Who is the data controller.
- Authentication method required (API key, OAuth, mTLS, signed webhook).
- **Failure behavior**: what the user sees, what the system does, whether the business
  transaction still completes.
- Retry policy, idempotency, timeout, and the fallback / degraded mode.
- Webhook handling: signature verification, replay protection, out-of-order delivery.
- Sandbox / test mode availability — this determines whether it can be tested at all.
- Cost model, rate limits, and what happens at the limit.

## P0 examples by type
- **Payments**: capture timing (auth vs capture), refunds (partial?), payouts to third parties,
  currencies, receipts, chargebacks, who reconciles, what happens if the webhook never arrives.
- **OTP / SMS**: code length, expiry, resend limit, attempt limit and lockout, fallback channel,
  cost per message, deliverability in the target market.
- **Maps / geo**: display vs geocoding vs routing vs live tracking — sharply different pricing
  and accuracy needs. How often is a position updated, and what drains battery.
- **Identity providers**: which providers, account linking rules, what happens when the same
  email arrives from two providers.
- **Accounting / ERP**: sync direction, frequency, conflict handling, source of truth.

## Do not ask
SDK or library choice.
