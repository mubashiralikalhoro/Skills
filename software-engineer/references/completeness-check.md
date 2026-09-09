# Stage 4 Audit — the single completeness check

This is the **only** completeness audit. Do not also write a separate self-review, a second
integrity table, and a Definition-of-Done paragraph — four overlapping audits of the same package
is ceremony, and in a real run they contradicted each other.

## How to run it

Reproduce the table below **item by item**, each with `PASS` / `PARTIAL` / `FAIL` and the
evidence for that verdict. Rules:

- **A prose summary is not an audit.** "Everything else is complete" has already been written
  once while eight features had no acceptance criteria.
- **Never self-confirm a gate.** If the user did not confirm something, it is `FAIL` or
  `PARTIAL` — never "PASS (self-confirmed)".
- **Number the list; never add up.** Enumerate as `1.`, `2.`, `3.` … and let the last ordinal be
  the total. Where the list is present, state no total at all. Where a count must appear away
  from its list, copy that last ordinal. **This applies to every number in the audit and in the
  package** — defect counts, row counts, topic counts, and money. Once the ID totals were fixed
  mechanically, the same error simply moved into prose ("three defects" beside seven) and into a
  cost table whose total excluded a different row at each end. Enumeration was never the failure;
  arithmetic was.
- **Any FAIL** is fixed now, or recorded in Open Questions and the package stamped NOT READY.

## The audit

| # | Item | How to verify |
|---|------|---------------|
| 1 | Product purpose, goals, success measures defined | present in product.md |
| 2 | Users / actors identified, incl. staff and external systems | list them |
| 3 | Components confirmed **by the user** | user confirmation exists, else PARTIAL |
| 4 | Each component has responsibilities AND non-responsibilities | one line each |
| 5 | Features identified per component, each with a stable ID | list IDs, then count |
| 6 | Main + alternative flows written out per feature | no "see spec.md" |
| 7 | Permissions defined per actor per component | table present |
| 8 | Business rules explicit (BR-*) | list IDs |
| 9 | States and transitions defined for every lifecycle entity | who/trigger/validation/notify |
| 10 | Data requirements: entities, fields, types, required, unique, enums | in data-model.md |
| 11 | **State coverage**: walk every feature and rule; each piece of state it reads or writes exists as a named field — tokens, OTP codes, attempt counters, lock-until timestamps, rolling-window counters, idempotency keys, audit rows | name the field per rule |
| 12 | **Every operation has a full API contract**: method, path, auth, authorization, request, success response, enumerated errors (status + machine code + trigger), paging, idempotency | "TBD"/"lock in implementation"/verb list = FAIL |
| 13 | **One machine error code = one HTTP status**, everywhere | grep each code |
| 14 | Integrations defined: provider, trigger, failure, retry, timeout, fallback | per integration |
| 15 | Error behavior defined per feature | |
| 16 | Edge-case checklist answered for important workflows | |
| 17 | Security requirements defined, justified by the product | |
| 18 | Non-functional requirements defined | load, availability, compatibility |
| 19 | Scope In / Out / Future present; no FUTURE item referenced by an in-scope feature | |
| 20 | Assumptions documented; every artifact built on a *pending* A-xxx tagged `[A-xxx pending]` inline; product.md opens with the list | |
| 21 | Open questions: zero P0 open (else NOT READY); P1/P2 listed with impact | |
| 22 | **Every feature has at least one acceptance criterion physically written out** | list features, list ACs, compare — no assertion |
| 23 | **ID preservation**: every AC-*, BR-*, feature and entity ID defined anywhere in the working notes is present in `final-product/`. Any ID in one and not the other = FAIL | diff the ID sets |
| 24 | **Cross-references resolve**: open each target and confirm the content is physically there. A reference whose target is itself a reference = FAIL | |
| 25 | No content duplicated across package files; one home per fact | |
| 26 | Technology chosen per needed layer, versions pinned, each traced to a constraint | |
| 27 | Every stack choice made or approved **by the user** | unapproved = PARTIAL + A-xxx |
| 28 | Deployment & production plan covered | environments, hosting, CI/CD, migrations, backups, secrets, domains/SSL, monitoring, error tracking, rollback, launch checklist |
| 29 | `final-product/` self-contained: no link out to `.software-engineer/`, no placeholder outside §Open Questions | grep for the working-notes path |
| 30 | Traceability filled: business need → feature → flow → UI/API → data → rules → AC | |
| 31 | **Cross-file agreement**: the same fact stated in two package files agrees | **Paste both values side by side with their file names** — `spec.md: 20 · build-order.md: 20`. A bare PASS is not evidence and is not accepted |
| 32 | No claim in this audit cites a count, size or coverage figure its own artifact contradicts | For each figure cited above — **including numbers written in prose and any money total** — paste the source list's last ordinal, or the summed rows, next to the figure. Three successive audits marked this PASS while failing it; a bare PASS here is not accepted |

## Definition of Done

The requirements phase is done when every item above is `PASS`, or every non-PASS item appears in
Open Questions and the package is stamped **NOT READY (n open P0)**. The end state to test
against: *a coding agent handed only `final-product/` builds the system end to end without
asking what the product is or which technology to use.*
