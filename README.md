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

Install every skill in this repo at once (symlinks, so `git pull` updates them):

```bash
for d in */; do [ -f "$d/SKILL.md" ] && ln -sfn "$PWD/${d%/}" ~/.claude/skills/"${d%/}"; done
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
| [talk-to-me](#talk-to-me) | Speak replies aloud with a local offline TTS engine; latches on until turned off |
| [the-designer](#the-designer) | Single-agent designer: picks the best installed design skills for the task and loads them together (component, page, site, PDF, deck…) |
| [the-designer-team](#the-designer-team) | Multi-agent version: every installed design skill as a panel → blind critique → one Director-synthesized design. Token-heavy; explicit request only |
| [website-info-collector](#website-info-collector) | Crawl a whole site with a browser into structured Markdown under `.website-info-collector/` |
| [website-redesign](#website-redesign) | URL in, complete redesigned site out — collector + the-designer (or the-designer-team on request) + full build and QA |

### How the design skills fit together

Every skill stands alone. Only `website-redesign` composes others:

```
website-redesign ──uses──▶ website-info-collector   (crawl the original site)
                 └─uses──▶ the-designer             (every design decision + design review)
                           or the-designer-team     (only when the user explicitly asks)

website-info-collector   standalone: crawl any site, no design knowledge
the-designer             standalone, single agent: design anything, never crawls, never calls a pipeline
the-designer-team        standalone, multi-agent panel: same contract, far more tokens
```

Each designer's discovery excludes any skill that invokes it, so neither loads the other or
`website-redesign` (no recursion).

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

---

### website-info-collector

Crawls a website page by page with a real browser (`agent-browser`, or Playwright MCP as
fallback) and writes a structured Markdown picture of it to `.website-info-collector/`.

- One in-page extractor (`references/extract.js`) returns each page's metadata, headings,
  ordered content blocks, navs, footer, links, `src`s, forms, JSON-LD and contact links.
- Same-site links go into `queue.json`; URLs are normalized and checked against `seen`, so no
  page is visited twice. Seeds from `sitemap.xml`; respects robots.txt.
- Output: `pages/<url path>.md` per page plus `site.md`, `sitemap.md`, `navigation.md`,
  `links.md`, `assets.md`, `forms.md`, `metadata.md`, `errors.md`, `README.md`.
- Read-only: never submits forms or logs in.
- Standalone: it only collects. Parallel crawl sessions write to separate temp files.

---

### the-designer

Single-agent designer — a simple router with no design rules of its own. Every run it discovers the
design skills installed *right now*, picks the best ones for the current task (often several at
once: one that sets the look plus the domain skills the task needs) and loads them to do the
design. No subagents, so a fraction of the tokens of the team version.

```
intake → evidence → discover → pick & load skills → DIRECTION.md → produce → check → deliver
```

- Same discovery script as the team version (compact output by default).
- Same three modes (**produce**, **direction**, **review**) and the same `DIRECTION.md` contract, so
  `website-redesign` works with either. Run artifacts live in `.the-designer/<timestamp>/`.

---

### the-designer-team

Universal multi-specialist design orchestrator — a design **team**, not a single designer. It
carries no aesthetic rules of its own: every run it discovers the design skills installed *right
now* and uses them as an independent panel. Works on anything designed: a single component, a
page, a website or app, a dashboard, a mobile screen, a PDF or document, a deck, a poster or social
graphic, an email, a design system, a Figma file.

```
discover → evidence → seat panel → independent exploration → blind cross-critique
→ Design Director → produce → panel review → refine → polish → deliver
```

- **Dynamic discovery** — `scripts/discover_design_skills.py` scans project, user and
  enabled-plugin skills and tags each from its own description (no hardcoded names), so a newly
  installed design skill joins the next run. Buckets: design specialists, media renderers (PDF,
  deck, document, graphic), framework aids, capture tools, and excluded callers.
- **Panel** — relevant skills are seated per artifact type as *direction specialists* (each commits
  to a distinct territory and ships a prototype) or *lens specialists* (UX, a11y, typography,
  motion, design system, frontend, responsive). Panel size scales with the task; mandatory roles no
  skill covers get a house specialist.
- **Blind cross-critique** — anonymized directions and idea cards; critics including a Slop Hunter
  tag every idea (strong, generic, AI-look, perf/a11y risk, conflicts…).
- **Design Director** — picks one spine direction, takes the best idea per domain, re-expresses it
  in the spine's language, enforces anti-committee budgets, logs every rejection. Output:
  `DIRECTION.md` (direction, page/screen/slide strategy, component strategy, implementation guidance).
- Three modes: **produce** (default), **direction** (concept only), **review** (critique and fix an
  existing design). Produces in the target medium, then a parallel panel review → refine loop and
  a polish pass. Autonomous: no routine design questions; feedback becomes a constraint.

Evidence comes from the material itself (code, files, live pages, screenshots) or from an evidence
pack a caller hands it. Run artifacts live in `.the-designer-team/<timestamp>/`. Multi-agent and
token-heavy — used only when explicitly requested; `the-designer` is the default.

---

### talk-to-me

Speaks replies aloud through a resident local TTS daemon (Kokoro-82M on Apple Silicon) — fully
offline, no API keys.

- **Latching mode:** "talk to me" turns it on and every following reply is spoken until "stop
  talking". State is per session, stored under `~/.talk-to-me/modes/`, so it survives context loss.
- Spoken lines are the substance of the reply in natural, casual prose — no tables, code or paths.
- Shift interrupts all audio globally; the monitor is blocked as an output device.
- `scripts/setup.sh` wires the venv; engine notes in `references/engine.md`.

---

### website-redesign

Autonomous pipeline: a URL goes in, a complete redesigned website comes out — same company, same
routes, same real content, reinvented experience. It is the **producer**; it makes no design
decisions itself.

```
collect (website-info-collector) → read all → brief → stack & scaffold every route
→ design (the-designer, produce mode) → roll out every page → SEO/forms/a11y/perf
→ build → site QA → design review (the-designer, review mode) → README → deliver

(the-designer-team replaces the-designer in both steps only when the user explicitly asks)
```

- Owns: `REDESIGN-BRIEF.md` (facts and content, no visual direction), framework choice, content
  pipeline, every route at the same path, SEO, honest forms, accessibility and performance
  engineering, motion implementation rules, full-site QA and delivery.
- Hands the-designer the crawl + brief as an evidence pack; `DIRECTION.md` becomes the design
  contract rolled out to every page.
- QA re-runs the collector against the local dev server and diffs routes, content and metadata
  against the original snapshot.
- Hard rules: whole site on first delivery, real content only, no fake functionality, no design
  questions. Design feedback is routed to the-designer; content/route/function feedback is handled
  here. Requires website-info-collector and the-designer (the-designer-team only when the user
  explicitly asks for it).
