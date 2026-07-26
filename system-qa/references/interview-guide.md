# User Interview Guide

With no code access, the user replaces the codebase as the source of business knowledge.
Goal: extract enough facts to fill `system-info.md` for the agreed scope — no more.

## How to interview

- **Batch questions** (use the question tool with multiple questions / multi-select where it
  fits). Never drip one question per message.
- **Interview only for the agreed scope.** Don't ask about modules the user excluded.
- **Prefer observation over questions** — if the live system can answer it (does the form
  have a phone field?), explore instead of asking. Ask the user only what is NOT observable:
  business rules, intended behavior, roles, integrations, history.
- **Echo back**: after the interview, show the drafted `system-info.md` summary and let the
  user correct it. Corrections are facts too.
- **Record answers verbatim-ish** into `system-info.md` with `[user <date>]` tags. Unanswered
  or vague answers go to Open questions.

## Question bank (pick per scope, adapt wording)

### Round 1 — orientation (always)
1. What does the system do and who are its users? What's the single most business-critical flow?
2. Which platforms matter: web, Android, iOS, API? Which browsers/devices do your users actually use?
3. Is the target production or a test environment? Is there a staging copy we could test instead?
4. What roles exist, and can I get a test account for each?
5. What must I absolutely NOT do (real payments, emails/SMS to real people, deleting records, load)?

### Round 2 — per in-scope feature
For each feature the live exploration mapped:
1. Walk me through how this is *supposed* to work — what does success look like?
2. What are the rules I can't see? (limits, required formats, pricing/discount logic, who is
   allowed, what triggers emails/SMS/notifications, state transitions e.g. order lifecycle)
3. What should happen on failure — wrong input, expired session, payment declined?
4. Does this feature talk to anything external (payment gateway, OTP provider, maps, CRM)?
   Sandbox/test mode available for it?
5. Any part of this recently changed or historically buggy?

### Round 3 — verification hooks (how do I check results?)
1. When a user submits X, where can the result be verified from outside — a confirmation
   screen, an email, an admin panel I have access to?
2. Is there any read-only admin/back-office view I can use to confirm data landed correctly?
3. How can test notifications (email/SMS/push) be received — a test inbox, my own device?
4. How do I clean up test data I create (if non-prod), or should I avoid creating any?

### Round 4 — release context (before Stage 1 summary)
1. What's the deadline/occasion for this QA round — new release, launch, regression after a fix?
2. What keeps you up at night about this system? (their fear list = high-priority cases)
3. What would make this a NO-GO for you personally?

## Red flags in answers

- "It should just work like any normal app" → no rule captured; write the standard expectation
  as `[assumed]` + Open question.
- Contradicts what you observed live → record both, flag it; likely a bug or stale knowledge.
- User doesn't know → Open question; the affected cases get `ASSUMPTION` tag, and say so in
  TEST_SUMMARY.md coverage risks.
