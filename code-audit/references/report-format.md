# Report format

## Severity rubric

| Severity | Meaning | Examples |
|---|---|---|
| **Critical** | Reachable now, serious harm: data breach, account takeover, remote code execution, money loss, data loss/corruption, or the system going down under normal use. Fix before the next deploy. | SQL injection on a public endpoint; auth bypass; IDOR exposing other users' data; secret key committed and used in prod; payment charged twice on retry |
| **High** | Serious harm that needs a plausible condition (a specific input, load, or timing), or a broken core flow. Fix this sprint. | Race condition double-spending under concurrent requests; missing rate limit on login; unhandled error crashing a worker; N+1 that times out at real data volumes |
| **Medium** | Real defect with limited impact or unlikely trigger; degraded behaviour, not disaster. | Missing validation producing bad records; memory growth over days; missing index on a medium table; inconsistent error responses |
| **Low** | Minor defect, hardening, or maintainability issue with small direct impact. | Dead code; duplicated helper; missing type; noisy logs; outdated dependency with no known exploit |

Rate on impact × likelihood in production. When unsure between two levels because of the code
itself, choose the lower one and explain the condition that would raise it.

When the severity hinges on something outside the repo that you are not allowed to check (is this
committed key live? is this port public?), rate the **worst realistic case**, set confidence to
`Needs verification`, and state the check and the downgrade: "Critical if the key is live; Low if
it is a placeholder." A leaked secret is always treated as live until someone confirms otherwise.

## Finding format

Number findings by severity: `C1, C2…`, `H1…`, `M1…`, `L1…`. Every finding has all fields:

```markdown
### H3 — Order total can be modified by the client

- **Severity:** High · **Confidence:** Confirmed · **Category:** Security / Business logic
- **Location:** `src/orders/controller.ts:88-104` (`createOrder`), also `src/cart/checkout.ts:41`
- **What is wrong:** The order total is read from the request body and saved as-is; item prices
  are never recalculated on the server.
- **Why it is a problem:** Price is a server-side fact. Trusting the client lets anyone set it.
- **How it happens in production:** A user edits the checkout request in devtools and sends
  `"total": 1`. The order is created and the payment intent is made for $0.01.
- **Recommended fix:** Recompute the total from product IDs and DB prices inside the same
  transaction that creates the order; ignore any client-sent total.
```

Rules:
- **Location** is a real path and line range you read, plus the function/class name. List every
  location when one root cause repeats.
- **Confidence** is `Confirmed`, `Likely` (state the unverified assumption), or
  `Needs verification` (state exactly what to check — a config value, deployment setting, etc.).
- **Recommended fix** is specific to this code, not generic advice. Include a short code sketch
  when the fix is not obvious. Mention the test that should cover it.

## Report structure

```markdown
# Code Audit — <project name>

**Date:** <date> · **Scope:** <what was audited; what was excluded and why>
**Method:** read-only static review; flows traced: <list>. Commands run: <list, or "none">.

## 1. Architecture overview
Stacks, components, entry points, data stores, integrations, trust boundaries, deployment —
short, with a diagram in text if it helps.

## 2. Summary
Counts by severity. Three to five sentences on overall health and the biggest risks.

## 3. Findings
### Critical
### High
### Medium
### Low
(Full finding format for each. Low findings that are minor quality notes may be grouped in a
table: ID · location · issue · fix.)

## 4. What is already done well
Specific things to keep, with locations — so they are not changed by mistake.
(e.g. "Parameterised queries everywhere in `src/db/` — keep"; "Password hashing uses argon2 with
sane params in `auth/hash.py:12`".)

## 5. Grouped views
- **Critical issues:** IDs + one line each
- **High-priority issues:** IDs + one line each
- **Medium / low-priority issues:** IDs + one line each
- **Security findings:** IDs
- **Performance findings:** IDs
- **Architecture concerns:** structural issues that are not single bugs (coupling, missing
  layers, scaling limits, single points of failure), with the IDs they relate to

## 6. Recommended fixes in priority order
Numbered list. Order by severity, then by how cheap the fix is and what it unblocks. Group fixes
that touch the same code. Mark quick wins.

## 7. Coverage and limits
Checklist categories that were N/A and why; areas not reviewed; findings marked
`Needs verification` and what would confirm them; commands that could not be run.
```
