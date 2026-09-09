# Skills

Collection of Claude Code / Claude agent skills. Each top-level folder is one skill: a `SKILL.md`
(name + description frontmatter, then the workflow) plus optional `references/` docs and
`assets/` files that ship verbatim.

## Install

Copy (or symlink) a skill folder into your skills directory:

```bash
# personal, all projects
ln -s "$PWD/<skill-name>" ~/.claude/skills/<skill-name>

# or per project
ln -s "$PWD/<skill-name>" <project>/.claude/skills/<skill-name>
```

Claude picks a skill up automatically from its `description`, or you invoke it by name.

## Skills

| Skill | What it does |
|---|---|
| [autoloop](#autoloop) | Autonomous improvement loop for any system, judged against a frozen rubric |
| [dotnet-builder](#dotnet-builder) | Scaffold/edit ASP.NET Core Web API backends in one fixed layered structure |
| [react-panel-builder](#react-panel-builder) | Build React admin panels from a fixed Vite + TS + Tailwind template |
| [software-engineer](#software-engineer) | Turn a vague product/feature idea into an implementation-ready Build Specification |
| [system-tester](#system-tester) | Two-stage QA (plan test cases → execute with evidence) for systems **with** source code |
| [system-qa](#system-qa) | Black-box QA for live systems with **no** source code, driven by a persistent knowledge base |

---

### autoloop

Generic self-improvement harness. Repeatedly mutates a target, observes the result, judges it, and
keeps the change only if it genuinely improved things.

```
mutate → observe → judge → keep-or-revert → repeat   (until converged or budget hit)
```

- **Stage 1 — setup interview** writes a frozen *experiment contract* (`autoloop/contract.md`):
  target, rubric criteria + weights, observe step, experiment unit, domain, budget, convergence `k`,
  checkpoint mode. Never starts the loop without explicit approval of the contract.
- **Stage 2 — the loop** picks the weakest rubric criterion, applies one mutation, observes, then
  judges with **blind** subagents (they see only before/after artifacts, never the proposer's claim).
- A change is **kept** only if all three hold: weighted total rose, no single criterion regressed,
  and a **senior-expert gate** says STABLE. Otherwise revert. Stability outranks score.
- Git (or a snapshot dir) is memory: keep = commit, revert = reset. Every iteration logged to
  `journal.md` + `results.tsv`. Always budget-capped.

Works on code, websites, marketing flows, docs, workflows — anything with an observable result.

**Use when:** "improve this until it has no downsides", "keep iterating on X", "auto-improve my
landing page", "find weak spots and fix them in a loop".

Inspired by `karpathy/autoresearch`, but with target and metric made pluggable.

---

### dotnet-builder

Builds and edits ASP.NET Core Web API backends so every project comes out identical.

Fixed structure — `Src/{Controllers,Services,Middlewares,Settings,Utils,Models}`,
`Models/{Entities,Api,Api/Dtos}` — fully blueprinted in `references/structure.md` (folder tree,
namespaces, `Program.cs` pipeline order, request lifecycle, scaffold checklist).

Non-negotiable conventions:

- Thin controllers, all logic in services; primary-constructor injection in both.
- Errors **thrown** as `ApiException.Create(status, msg)`; middleware converts to the envelope.
- Every response wrapped in `Response<T>.CreateSuccess(...)`; lists use `PagedResult<T>`.
- List/filter params bind as **one** query object (`<Resource>PaginatedQuery : PaginationQuery`),
  never loose `[FromQuery]` scalars.
- Async everywhere with `...Async` suffix; entity → DTO via static `FromEntity` — never return entities.
- EF Core + PostgreSQL: enums as strings, `CreatedAt` via `NOW()`, `UpdatedAt` on writes; never edit
  an old migration, always add a new one.
- JWT auth via `JwtHandler` / `AuthUser`; routes at `v1/api/<resource>`; admin controllers gated by role.
- No hardcoded package versions — `dotnet add package` resolves them.

Handles three task types: new project (scaffold checklist), adding to an existing project
(entity → DbContext → migration → service → DTOs → controller), and fixing/refactoring inside the
correct layer. Matches an existing codebase's style rather than fighting it.

---

### react-panel-builder

Builds React admin panels / dashboards / CRUD back-offices from one battle-tested template:
Vite + React 19 + TypeScript, Tailwind v4, axios api wrapper, Formik + Yup, react-router v7 with
token auth, react-toastify.

Two modes, decided by whether the project already has `src/hooks/useListingApi.ts` and
`src/utils/api.ts`:

- **init mode** — scaffold a fresh project: create Vite app, install the exact dep set, copy
  `assets/config/*` and `assets/src/*` in. Result: working panel with auth, layout, dashboard, and a
  sample `listing` CRUD.
- **add mode** — add pieces to an existing panel by following the matching recipe in `references/`
  (full CRUD resource, listing + pagination, table, form, filters, routing, api layer).

Fixed building blocks: `api.get/post/put/delete` + `getAuthHeader`, `useListingApi` for every
listing, `DynamicTable` with a `tableStructure[]`, `FormBuilder` with `design: FormItem[]` + Yup,
`FilterBuilder` pushing into `setExtraParams`, `notify` for all feedback, `useUserContext()` for the
token, `PrivateRoute`-wrapped routes at `/res` and `/res/:id` (`id === "create"` means create).

Ships the stable infra verbatim in `assets/` (~50 components, hooks, contexts, pages, utils) — the
point is to follow the template, not redesign it.

---

### software-engineer

Acts as senior PM + business analyst + solutions architect for **requirements discovery only** — no
code. Input: a vague idea or a vague feature request. Output: a Build Specification complete enough
that another engineer or coding agent can implement it without asking what you meant.

Two modes, picked at intake:

- **Product mode** — new product, multiple apps/services, or no spec for the system as a whole.
  `IDEA → UNDERSTAND → IDENTIFY SYSTEMS → DECOMPOSE → CLARIFY EACH COMPONENT → FLOWS → RULES → DATA
  → APIs → EDGE CASES → SECURITY → NFRs → ACs → VALIDATE → STACK → PACKAGE`
- **Feature mode** — one feature/change inside an existing project.
  `REQUEST → READ THE CODE → SCOPE THE CHANGE → ONE P0 ROUND → FEATURE BRIEF → MINI AUDIT`

Working notes live in `.software-engineer/` (product, per-component files, assumptions with reasons
and status, open questions prioritized P0–P2, an ID registry, chosen stack). The hand-off package is
written to `final-product/`: `product.md`, `stack.md`, the 22-section `spec.md`, `data-model.md`,
per-component briefs, `features/<slug>.md`, `build-order.md`, `CHANGELOG.md`.

`references/` carries the discovery guide, spec and component templates, a tech-stack guide, a
completeness check, and per-component-type guides (web app, mobile app, backend API, admin panel,
worker, data pipeline, CLI/SDK, integrations).

**Not for:** writing code, bug fixes, or anything that already has an agreed spec.

---

### system-tester

Two-stage QA workflow for an application you **have the source of**. Output goes to
`.system-tester/<timestamp>/`.

- **Step 0 — pre-flight gate:** scope, environment (prod vs test), access. Production turns on
  **safe mode** for the whole run. Nothing proceeds until scope + environment are known.
- **Step 0.5 — detect system type(s)** via `references/system-types.md`. A system is usually a mix
  (web UI + REST API + DB + a cron job); the detected types drive coverage, tooling, and evidence
  form. Never defaults to "web app" — a CLI, library, API-only service, ETL job, or queue consumer
  has no browser surface.
- **Stage 1 — plan:** writes `TEST_CASES.md` (positive, negative, edge, security, API, DB,
  regression), `TEST_SUMMARY.md` (coverage, risk, readiness), `RELEASE_CHECKLIST.md` (Go/No-Go).
- **Stage 2 — execute** (gated behind explicit confirmation): runs the cases, captures evidence into
  `evidence/`, files bugs, and produces a GO / NO-GO release recommendation.

Hard rules: only test what exists in the codebase or what the user named (out-of-scope is marked "not
covered"); in production never create artifacts, mutate data, or run load/stress — those cases are
marked `SKIPPED (prod-safe)`; and **evidence or it didn't happen** — no `PASS` without a real
execution and captured evidence.

---

### system-qa

Black-box sibling of `system-tester`, for live systems where **no source code is available** — just
a website URL, a mobile app, or an API endpoint plus what the user knows.

Everything comes from two sources: the **live system**, explored with real tooling (browser, device
or emulator, HTTP client), and the **user**, interviewed for business rules, roles, and expected
behavior that can't be observed from outside. Both feed one persistent knowledge base,
**`.system-qa/system-info.md`**, maintained across runs and the source of truth for all planning.
Per-run docs land in `.system-qa/runs/<timestamp>/`.

Flow: pre-flight gate (target, environment, access, scope) → load or build `system-info.md`
(if it exists, ask what changed and spot-check recorded flows against the live system) → generate
test cases from it → after explicit confirmation, execute with evidence and report.

Hard rules on top of the usual ones: **no code, no guessing** — anything unobserved and unconfirmed
goes under *Open questions* and its test cases are tagged `ASSUMPTION`; every test case traces back
to a fact in `system-info.md`; a live app with no code access is *usually* production, so confirm
rather than assume a test env; bug reports are **observation-only** — exact repro, expected vs
actual, evidence, and any cause is labeled a hypothesis.

`references/` covers the interview guide, surface types, the `system-info.md` template, and test
planning/execution.
