# system-info.md Template

`system-info.md` is the persistent black-box knowledge base for the system under test. It is
the ONLY ground truth for test planning — if a fact isn't here, no test case may rely on it.
Keep it current: update it during interviews, exploration, and test execution.

Every fact carries a **source tag**:

- `[user]` — stated by the user (date it: `[user 2026-07-26]`)
- `[observed]` — seen live on the system (date it)
- `[assumed]` — inferred, NOT confirmed → must also appear under Open questions

## Template

```markdown
# System Info — <system name>
Last updated: <date> · Maintained by system-qa skill

## 1. Overview
- What the system is / who uses it / core business purpose. [user]
- Platforms & entry points: web URL(s), mobile app (store link / package id), API base URL. [user/observed]
- Environments known: production / staging URLs, which one we test against. [user]

## 2. Access & accounts
- Roles that exist (e.g. guest, customer, admin) and what each can do. [user]
- Test accounts per role (credentials or how to get them). NEVER real-user credentials.
- Off-limits areas/actions (real payments, emails to real users, deletion, admin panels).

## 3. Feature inventory
One subsection per feature/module IN SCOPE. For each:
### <Feature name>
- Purpose & user goal. [user]
- Where it lives (URL/route, screen path in app). [observed]
- Flow: numbered happy-path steps as actually performed live. [observed]
- Business rules & validations (limits, formats, required fields, pricing rules,
  state transitions, notification triggers). [user] — the user is the only source
  for rules not visible in the UI.
- Known alternate/error paths. [user/observed]
- Dependencies & integrations visible from outside (payment gateway, OTP/SMS,
  email, maps, social login). [user/observed]

## 4. Cross-cutting facts
- Auth: login methods, session behavior (timeout? single device?), password rules. 
- Supported browsers / devices / OS versions the user cares about. [user]
- Localization, timezones, currencies. [user/observed]
- Notification channels (email/SMS/push) and how to verify them in tests. [user]

## 5. History & known issues
- Known bugs / flaky areas / recently changed features (regression hotspots). [user]
- Previous run summaries: date, scope, result (1 line each).

## 6. Open questions
Numbered list of unconfirmed facts and unknowns. Each blocks or weakens some coverage —
note which. Move to the right section (with source tag) once answered.

## 7. Out of scope
Features explicitly excluded and why.
```

## Maintenance rules

- Update immediately when new facts appear — do not batch for "later".
- Never delete a fact silently; if reality changed, replace it and note the change in §5.
- Contradiction between `[user]` and `[observed]`? Record both, flag to the user — it is
  either a bug or stale info; resolution decides which.
- Keep it factual and compact — no test cases, no speculation, no filler prose.
