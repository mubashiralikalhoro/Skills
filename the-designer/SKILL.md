---
name: the-designer
description: Universal single-agent designer — looks at every design skill installed right now, picks the best ones for the current task (often several at once) and loads them to do the design. Owns no design rules of its own. No subagents, no panel — low token cost. Works on anything designed — a component, a page, a whole website or app, a dashboard, a mobile screen, a PDF or document, a deck, a poster or social graphic, an email, a design system, a Figma file. Use when the user says "the-designer", asks to use the best/all design skills, or wants the best possible design or redesign of something. Also for feedback on its output ("I don't like it", "more premium"). For the multi-agent panel version the user must explicitly ask for the-designer-team.
---

# The Designer

A simple router. It owns **no design rules**. Every run it sees which design skills are installed,
picks the best ones for this task, loads them — several at once when they complement each other —
and designs by following them. Never copy another skill's content into this skill.

**Single agent.** Never spawn subagents, Agent tasks or workflows. The multi-agent panel version is
`the-designer-team` — only when the user asks for it.

```
INTAKE → EVIDENCE → DISCOVER → PICK & LOAD SKILLS → DESIGN (DIRECTION.md) → PRODUCE → CHECK → DELIVER
```

## Rules (process only)

- **Discover every run.** Never assume which skills exist.
- **Best fit, not all.** Load only skills that fit this task; skip the rest.
- **Loaded skills lead.** Design decisions come from the loaded skills. When two disagree, follow the
  one whose main domain it is, or the one that fits the evidence better; note the call in `log.md`.
- **Evidence first.** Design from the real material: code, content, brand assets, constraints.
- **No routine design questions.** Decide. Where a loaded skill says to ask the user, decide from
  evidence and note the assumption. Ask only when truly blocked (no access, missing credentials).
- **Integrity.** Keep what exists and works (content, routes, functionality, SEO). Never fabricate
  content, stats, testimonials, logos or features.

## Modes

| Mode | When | Steps |
|---|---|---|
| **produce** (default) | make or redesign the thing | all |
| **direction** | concept only, or a caller will build it | 0–4, one key-screen prototype, 6–7 |
| **review** | critique and fix an existing design (incl. a caller's final pass) | 0–3, 6–7 |

## Run folder

`.the-designer/<YYYYMMDD-HHMM>/` (add `.the-designer/` to `.gitignore` if missing):
`evidence/brief.md`, `evidence/shots/`, `DIRECTION.md`, `log.md` (skills picked and why, decisions).

## Workflow

### 0. Intake
Decide without asking: artifact type (component, page, website, app, dashboard, mobile, document/PDF,
deck, graphic, email, design system, Figma), mode, and 1–3 key screens that represent the whole.

### 1. Evidence → `evidence/brief.md`
Caller-supplied pack (crawl, brief) → read it, don't re-collect. Otherwise: the existing code/file/URL,
baseline captures of the key screens (390 and 1440 px, or page/slide renders), brand (logo, colors,
fonts, voice), audience, goal, constraints, a must-preserve list and known problems.

### 2. Discover
```bash
python3 <this-skill-dir>/scripts/discover_design_skills.py --project .
```
Compact list with buckets: `design`, `media` (PDF/deck/document/graphic renderers), `adjacent`
(framework aids), `tools` (browser/screenshots), `excluded` (never load). Flags: `legacy`,
`needs-image-gen`, `platform-bound`, `static-art`.

### 3. Pick & load
From the descriptions, pick the best skills for **this** task:
- Skip `legacy` (successor present), `platform-bound` (unless target is that platform),
  `needs-image-gen` (unless image generation is available), `static-art` (for interface work) and
  anything not about this artifact type.
- Usually one skill that sets the look (whichever best fits the brand and artifact) plus the
  domain skills the task needs (UX, accessibility, motion, typography, polish, redesign/audit…).
  Several at once is fine; more than needed is waste.
- Load each with the Skill tool (fallback: Read its SKILL.md). Read a skill's references only when
  its SKILL.md points to them for something in scope.
- Also pick the `media` renderer and `adjacent` aids for production.

Write the picks and one-line reasons (including skipped ones) to `log.md`.

### 4. Design → `DIRECTION.md`
Following the loaded skills, decide one coherent direction and fill
[templates/design-direction.md](templates/design-direction.md) — values, not adjectives.

### 5. Produce
Code: tokens → primitives → components → screens, in the project's framework; reuse existing
components; lint, typecheck, build. Documents/decks/graphics: the `media` skill renders the file.
Figma: an available Figma tool; else DIRECTION.md + a coded reference. Keep every must-preserve item.

### 6. Check → fix
Capture key screens (390 and 1440 px, key states) or renders. Check them against the loaded skills'
own review/checklist guidance, DIRECTION.md and the must-preserve list. Fix blockers and majors,
re-capture. Max 2 rounds.

### 7. Deliver
Brief: direction and why, which skills were used for what, files changed, before/after captures,
how to run it, assumptions. Point to DIRECTION.md. Called by another skill → return the run folder
and DIRECTION.md paths.

## Feedback
No questionnaire. Note works / doesn't / improve / keep in `log.md`. Pick the skills that speak to the
feedback (reuse the run's picks; add one if needed), update DIRECTION.md, produce, re-check what
changed. Never regress content, functionality, accessibility or performance.

## Red flags

| Thought | Reality |
|---|---|
| "I know which design skills exist" | Run discovery. |
| "Load every design skill" | Only the best fits for this task. |
| "Spawn a subagent" | Single agent. Panel version is the-designer-team. |
| "I'll add my own design rule" | Follow the loaded skills. |
| "Ask which style they prefer" | Decide from evidence. |
