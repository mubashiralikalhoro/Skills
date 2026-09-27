---
name: code-audit
description: Read-only, whole-codebase audit for any language, framework or kind of project (backend, frontend, mobile, CLI, library, data/ML pipeline, infrastructure-as-code, embedded, smart contracts, monorepos). Maps the architecture, traces the important flows end-to-end, and reports every bug, security hole, auth gap, data/DB problem, race condition, performance or resource issue, error-handling gap, type problem, dead code, config/dependency/deployment risk and maintainability issue with severity, exact location, production failure scenario and recommended fix — plus what is already done right. Never modifies files. Use when the user asks to audit, review the whole codebase, do a full code review, find all bugs, do a security/health/production-readiness check of the code, "go through the entire project", or says "code-audit". Not for reviewing a single diff or PR (use a code-review skill for that).
---

# Code Audit

A deep, read-only audit of an entire codebase. Output is one evidence-backed report; nothing in
the project is changed.

## Hard rules

- **Read-only.** Never edit, create, delete, format, or move a file in the project. No installs,
  builds, migrations, code generators, formatters, or `git` commands that change state (checkout,
  stash, commit, reset). Test suites and linters often write caches or artifacts; run one only if
  the user agrees, and say what it writes. Read-only commands (`ls`, `cat`, `grep`, `find`,
  `git log`, `git blame`, `git ls-files`, and tools like `npm audit` / `pip-audit` /
  `cargo audit` that write nothing) are fine.
- **No live systems.** Never connect to a database, API, cloud account, or production host found in
  the config, and never use credentials found in the code.
- **Secrets are redacted.** When a secret is found, report its file and line and type
  (`AWS access key`, `JWT signing secret`), never its value. Saying it looks like a placeholder
  or a published example value is fine.
- **Evidence or it is not a finding.** Every finding points to a real file and line that you read.
  Do not report a problem from a file name, a guess about a framework, or a pattern match you did
  not open and check. A framework or library default (e.g. a cookie flag, a thread model) may be
  cited when the dependency is not vendored — name the framework, the version constraint found in
  the manifest (or "unpinned"), and mark the finding `Likely`.
- **Understand before judging.** Do not report a finding until you have seen the code around it:
  who calls it, what the inputs can be, and whether something upstream (middleware, a framework
  default, a validator, a DB constraint) already handles it.

## Phase 0 — Scope

The default scope is the whole repository. If the user named a folder, service, or concern (for
example "security only"), audit that and say what was left out. Ask a question only if the repo
holds several unrelated projects and the request does not say which.

Get the size before starting. Run commands against the target path, which may not be the
current directory:

```bash
git -C <path> ls-files | wc -l             # no git: find <path> -type f -not -path '*/.git/*' | wc -l
git -C <path> ls-files | sed 's/.*\.//' | sort | uniq -c | sort -rn | head -20   # languages by file count
```

**Scale the effort to the size.** Under ~30 source files: read every file in full and fold
Phase 2 into Phase 3. Roughly 300+ source files or several services: split by component (see the
end of Phase 1).

Skip generated and vendored code (`node_modules/`, `vendor/`, `dist/`, `build/`, `.next/`,
`target/`, lockfiles, minified files, generated clients, migrations snapshots) except to note
problems with how they are managed.

## Phase 1 — Map the system

Read `references/stack-hotspots.md` and detect every stack present — a repo is often several
(a web frontend, an API, a worker, Terraform, a Dockerfile). Then build a short architecture map:

1. **Entry points** — `main`, servers, route/controller registration, CLI commands, job and queue
   consumers, cron schedules, serverless handlers, exported library API, UI routes/screens.
2. **Components and boundaries** — modules/services, what talks to what, sync vs async, shared
   state, external integrations (payments, email, storage, third-party APIs, LLMs).
3. **Data** — schemas, models, migrations, ORMs/raw queries, caches, files, queues; who reads and
   writes each store.
4. **Trust boundaries** — where untrusted input enters (HTTP, CLI args, files, env, messages,
   webhooks, user uploads, DB rows written by users) and where privileged actions happen.
5. **Configuration and deployment** — env vars and their defaults, config files, Docker/compose,
   CI/CD, IaC, feature flags, how secrets are supplied.
6. **Tests** — what exists, what is covered, what the critical paths lack.

Read the README, docs, and manifests first; they say what the code is meant to do, which is how
incorrect logic is recognised.

For a large codebase (roughly 300+ source files, or several services), split the audit by
component and dispatch read-only subagents in parallel, one per component. Give each one the
architecture map, its component, the hard rules above, `references/checklist.md`, and the finding
format in `references/report-format.md`. Cross-component flows stay with you (Phase 2).

## Phase 2 — Trace critical flows end-to-end

List the 5–15 flows that matter most for this system and follow each one from entry to storage
and back, across every file it touches. Typical flows, by project kind:

- **Web/API/mobile:** sign-up, login, session/token refresh, password reset, permission checks on
  each role, the core create/update/delete of the main domain object, payments/checkout, file
  upload, webhooks, background jobs, admin actions.
- **CLI/library:** the main commands or public functions, argument/input parsing, file and
  network I/O, error propagation to the caller, exit codes.
- **Data/ML pipeline:** ingest → validate → transform → store → serve; reruns, partial failure,
  backfills.
- **Infra/IaC:** how a change reaches production, what is publicly reachable, how secrets and
  permissions are granted.
- **Embedded/systems:** boot, interrupt paths, buffer handling, resource lifetime, failure and
  recovery.

At each step ask: what if this input is missing, empty, huge, malformed, duplicated, concurrent,
or hostile? What if this call fails, times out, or is retried? Who is allowed to reach this, and
where is that enforced? Is the state left consistent if the flow stops half-way?

## Phase 3 — Sweep every category

Go through `references/checklist.md` category by category over the whole scope, not only the
traced flows. Search for the patterns it lists, then open and read each hit. Mark categories that
do not apply to this project (for example "frontend" in a CLI tool) as N/A in the report.

## Phase 4 — Verify each finding

Before a finding goes in the report:

1. Re-read the code and its callers. Confirm no guard exists elsewhere (middleware, decorator,
   framework default, schema validation, DB constraint, type system, reverse proxy).
2. Write the concrete failure scenario: which input or sequence of events, in which environment,
   produces which wrong result.
3. Set a **confidence**: `Confirmed` (traced and certain), `Likely` (strong evidence, one
   assumption unverified — state it), or `Needs verification` (depends on runtime config or
   deployment you cannot see — state what to check).
4. Set a **severity** from the rubric in `references/report-format.md`. Severity reflects impact
   times likelihood in production, not how ugly the code is.
5. Merge duplicates: one root cause repeated in 20 places is one finding listing all locations.

Drop anything that fails step 1 or 2. Fewer true findings beat many false alarms.

## Phase 5 — Report

Write the report in the format in `references/report-format.md`, in the conversation. It
includes the architecture summary, every finding in the required fields, what is already done
right, the grouped summaries, and fixes in priority order. Save it to a file only if the user asks,
and only at the path they give.

In an interactive session, end by asking whether the user wants any of the fixes applied. When
running as a subagent or non-interactively, end with the report. Never apply fixes in the same run.

## Common mistakes

| Mistake | Instead |
|---|---|
| Reviewing files one by one in isolation | Trace flows across files; most serious bugs live between components |
| Reporting "no input validation" when a framework or schema layer validates | Check the whole request path before reporting |
| Flagging every `TODO` or style nit as a finding | Report issues with a production consequence; group minor quality notes |
| Inflating severity to look thorough | Use the rubric; Critical is reserved for real, reachable, serious harm |
| Assuming the stack from one file | Detect all stacks from manifests and entry points |
| Stopping after the first few serious bugs | Finish every checklist category; mark N/A explicitly |
| Printing a found secret | Report location and type only |
| "Fixing" small things along the way | Read-only. Fixes happen only after the user asks |
