# Discovery Guide — root discovery, component identification, question bank

Goal of Stage 1: understand the **product landscape** — what is being built, why, for whom,
and which components make it up — before any component is detailed.

## 1. Candidate component identification

Read the idea and list every component that *might* be needed. Use this catalogue; include
only what the idea plausibly implies and mark confidence:

| Category | Candidates |
|----------|-----------|
| Applications / interfaces | customer mobile app, customer web app, public website, admin web panel, partner/vendor portal, staff/driver app, internal dashboard, kiosk, browser extension, CLI, SDK |
| Backend systems | API, authentication service, background workers / schedulers, notification service, search service, reporting/analytics |
| Data | primary database, file/object storage, cache, search index, data warehouse |
| Integrations | payments, email, SMS/OTP, push, maps/geo, identity providers (Google/Apple), accounting, CRM, shipping, external APIs the user already uses |
| Infrastructure | hosting, CI/CD, monitoring, logging (only note; no decisions here) |

Confidence labels: **likely required** (the idea cannot work without it), **possibly
required** (common for this kind of product), **unclear** (ask).

Example — "customers book appointments, businesses manage them":

```
Customer Mobile App     likely     customers search + book
Business Web Panel      likely     businesses manage availability + bookings
Admin Panel             possibly   platform operator oversight
Backend API             likely
Notification Service    possibly   reminders, confirmations
Payment Integration     unclear    is payment in-app or at the venue?
```

## 2. Product boundary questions

Answer these in `product.md` — from the user, not from imagination:

- What is the product, in one sentence?
- What problem does it solve, and for whom?
- Who are the actors (all of them, including internal staff and external systems)?
- What is the primary workflow end-to-end (happy path, in the user's words)?
- What is the expected outcome / success measure?
- What is inside the system, what is outside?
- Existing systems it must integrate with or replace?
- Hard constraints: deadline, mandatory platforms, regulation (payments, health data,
  minors), languages/regions, offline needs.

## 3. Question priority

- **P0 — Blocking**: without the answer the system cannot be correctly defined
  (who the actors are, which components exist, the primary workflow, money/regulated flows).
- **P1 — Important**: system can be defined, but implementation decisions depend on it
  (cancellation rules, notification channels, search scope, roles granularity).
- **P2 — Optional**: can be decided later without changing architecture (sort orders, copy,
  minor filters, theme).

Ask P0s first as one batch. Then P1 batch. P2s can be deferred and listed in
`open-questions.md` as *decide later*.

## 4. Question quality rules

Every question must be **specific, understandable, relevant, actionable, necessary**.

- ✗ "Tell me more about the app." / "What features do you want?"
- ✓ "Can a customer cancel a confirmed booking? If yes, until how long before the slot?"
- ✓ "Who can create a partner account?" — Admin only / Partner self-registers / Both / Other
- ✗ "Should we use PostgreSQL?" (tech, not behavior)
- ✓ "Do customers need to search their past orders, and how far back?"

Rules:
- Use the question tool; offer reasonable options **plus Other**. Never force predefined
  assumptions.
- One concern per question. Split compound questions — "is payment in-app, who collects it, and
  what are the refund rules?" is three questions and will get one vague answer.
- **Questions in one batch must be independent.** If A's answer changes whether B applies, ask A
  alone first and derive B. Batching "is this a marketplace?" with "which components exist?"
  invites contradictory answers.
- **The question tool takes at most 4 questions per call.** A round of 9 P0s is three calls, not
  one. Order them so the determining questions come first.
- Ask about **behavior**, never implementation, unless the user opened the topic.
- Prefer deriving from the user's own words: quote their phrase and ask what it means
  concretely ("you said *businesses manage bookings* — does that include rescheduling on the
  customer's behalf?").
- Do not ask what was already answered. Re-read `product.md` / `open-questions.md` first.

## 5. Round 1 — P0 question bank (root discovery)

Pick and adapt. Ask the determining questions (1-3) first, then the rest — max 4 per tool call:

1. Problem & outcome — "What does a successful day using this product look like for
   [actor]?"
2. Actors — list the candidates you inferred; ask which exist, which are missing.
3. Components — show the candidate list with confidence; ask which are in the first version.
4. Primary workflow — "Walk me through the main flow from [start] to [end] in your words."
5. Money — ask these as **separate** questions, not one compound one; a marketplace has several
   money flows and a single question gets a single partial answer:
   a. Does the customer pay in the product, or offline?
   b. Does the platform take a commission or fee, from whom, and how is it calculated?
   c. Are there payouts to third parties (vendors, drivers, partners) — who initiates them, on
      what schedule?
   d. Refunds and cancellations: who can trigger one, and who bears the cost?
6. Existing systems — anything already built or mandated (ERP, POS, auth provider, website)?
7. Platforms — iOS / Android / web / all? Which first?
8. Constraints — deadline, regulation, regions/languages, offline use.
9. Explicit non-goals — "What are you deliberately NOT building in this version?"

## 6. Round 2 — P1 question bank (after components confirmed)

Per actor: what they can see / create / modify / delete; what is restricted.
Per primary workflow: alternative flows, cancellation, retries, timeouts, expiry.
Cross-cutting: notification channels, languages, admin oversight needs, reporting needs,
data retention, moderation/abuse.

Component-specific banks live in `components/<type>.md`.

## 7. Recording answers

- Record answers in the relevant file immediately, tagged `[user YYYY-MM-DD]`.
- Vague answer ("it should work like Uber") → record the reference as context, then ask the
  concrete behaviors it implies; unknowns → `open-questions.md`.
- Contradiction with an earlier answer → surface it, ask which holds, record the resolution.
  **While the contradiction is open, neither reading may appear** in Scope, the data model, or
  any requirement — write `BLOCKED BY OQ-nnn` in place. Adopting the tidier reading and tagging
  it `[user]` is exactly the silent assumption this skill exists to prevent.
- "I don't know / you decide" → make an explicit `A-xxx` assumption with reason, status
  *pending*, keep the question open at its priority, and follow the "you decide" row in
  SKILL.md Stage 0.5: turn it into a one-batch decision list rather than leaving it hanging.
- **One assumption per decision.** Never bundle a whole component list or several unrelated
  rules into a single `A-xxx` — the user then cannot confirm half of it.
