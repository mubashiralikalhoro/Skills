# Verification report

Use these sections in this order. Keep each finding to the fields below.

## Compatibility verdict

One of, the worst finding wins:

| Verdict | Meaning |
|---|---|
| **SAFE** | No meaningful backward-compatibility concern |
| **SAFE WITH CONDITIONS** | Compatible only with a specific deployment order or migration step |
| **WARNING** | Possible risk a human must confirm |
| **BREAKING** | Old services or clients can fail |
| **CRITICAL** | Data corruption or loss, irreversible migration, outage, auth failure, or v1 unusable |

Then one line: the deployment model assumed (e.g. "assumed v1 and v2 share the database and
Redis; nothing in the repo shows otherwise").

## What was verified

One line per area, with what was found or "no change": git state, database, migrations, ORM,
API, data meaning, config / env, auth, cache / Redis, queues / events, external integrations,
clients and flows (name each flow walked and which client versions it assumed), deployment order,
rollback.

## Findings

Most severe first. A finding that breaks a rule is at least BREAKING; never list it lower.

```text
Severity:              SAFE | SAFE WITH CONDITIONS | WARNING | BREAKING | CRITICAL
Rule broken:           rule number(s) from SKILL.md, or none
Area:
File:                  path:line
Change:
Problem:
Affected old version:  what v1 or the old client does that fails
Affected new version:  what v2 does that fails, if anything
Why it matters:
Recommended fix:       the smallest change that makes it compatible now, plus the later contract step
```

## Mixed-version test

```text
Old service → database:  PASS | FAIL | NOT VERIFIED
New service → database:  PASS | FAIL | NOT VERIFIED
Old writes → new reads:  PASS | FAIL | NOT VERIFIED
New writes → old reads:  PASS | FAIL | NOT VERIFIED
Old clients → new API:   PASS | FAIL | NOT VERIFIED   (contract and behavior, per flow walked)
Rollback compatibility:  PASS | FAIL | NOT VERIFIED
```

Each line gets a short reason. PASS needs evidence you read. "Found no problem" without having
checked is NOT VERIFIED.

## Deployment recommendation

One of:

- **Safe:** "The changes appear backward-compatible with the existing service and shared
  database. They can be deployed incrementally."
- **Conditional:** "The changes are compatible only if the deployment follows this order:" then a
  numbered list.
- **Unsafe:** "Do not deploy this change while the old service is running. The primary
  incompatibility is: ..." then the smallest practical remediation, phased as expand now /
  contract later.
