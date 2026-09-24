---
name: the-designer-team
description: Universal multi-specialist design orchestrator — a design team, not a single designer. Discovers every design skill installed right now, seats the relevant ones as an independent panel (UX, visual, brand, typography, motion, design system, accessibility, responsive, frontend), has them explore competing directions grounded in the real material, cross-critiques every idea blind, and has a Design Director synthesize only the strongest into one coherent, production-ready design; then produces it, re-reviews with the panel and polishes. Works on anything designed — a single component, a page, a whole website or app, a dashboard, a mobile screen, a PDF or document, a deck, a poster or social graphic, an email, a design system, a Figma file. Multi-agent and token-heavy — use only when the user explicitly says "the-designer-team" or asks for a multi-agent design panel/team. Otherwise the single-agent the-designer skill is the default. Also for feedback on its own output ("I don't like it", "more premium").
---

# The Designer Team

A design team inside Claude: **Design Director + panel of expert designers + final critic.**
It is an orchestrator, not a design methodology. It owns no aesthetic rules of its own — the
specialists come from whatever design skills are installed at run time, loaded live and used
independently. Never copy another skill's instructions into this skill or its files.

It is **universal**: the same process designs a button, a landing page, a 40-page PDF report, a
deck, a dashboard or a full product. Panel size scales with the task. It is self-contained: it
gathers its own evidence and does not depend on any other workflow skill. Callers (e.g. a site
redesign pipeline) may hand it an evidence pack; it uses that instead of re-collecting.

Multi-agent by design and token-heavy. The single-agent version is the-designer (default); this
skill runs only when explicitly requested.

> The objective is not to use the **most** design ideas. It is to use the **best** ones.

```
DISCOVER → EVIDENCE → SEAT PANEL → INDEPENDENT EXPLORATION → CROSS-CRITIQUE (blind)
→ DESIGN DIRECTOR → ONE COHERENT DESIGN → PRODUCE → PANEL REVIEW → REFINE → POLISH → DELIVER
```

## Hard rules

- **Discover every run.** Never assume a roster; skills get installed and removed.
- **Specialists work independently** — separate subagents, no shared drafts — until critique.
- **Evidence or it doesn't count.** Every recommendation cites the real material: a file, a page,
  a screenshot, real content, a brand asset, a constraint. Generic advice is rejected in critique.
- **No routine design questions.** Colors, style, fonts, layout, motion — decide. Ask only when
  truly blocked (no access to the target, missing credentials, contradictory hard requirements).
- **Critique is blind.** Critics see anonymized directions and idea IDs, never which skill made them.
- **The Director synthesizes, never votes.** Output has one visual language, one UX strategy,
  one interaction language, one design system.
- **Redesign ≠ demolition.** Keep what works — structure, real content, functionality,
  integrations, SEO — unless evidence shows it is the problem. No fabricated content, stats,
  testimonials or features.
- **Producible.** Fits the target medium and, for code, the existing framework and architecture.
  Performance and accessibility are design constraints, not afterthoughts.
- **Never stop at the first acceptable result.** At least one review → refine round with real
  changes before delivery.

## Modes

| Mode | When | Runs steps |
|---|---|---|
| **produce** (default) | make or redesign the thing | all |
| **direction** | user wants a concept/plan, or the caller will build it | 0–6, then 9 on the key-screen prototype |
| **review** | critique and fix an existing design ("review my page", a caller's final pass) | 0–2, seat reviewers, 8–10 |

## Run folder

Everything lives in `.the-designer-team/<YYYYMMDD-HHMM>/` in the working directory (keep it out of
commits; add `.the-designer-team/` to `.gitignore` if the project uses git and it is missing):

```
evidence/brief.md        evidence pack every specialist receives (identical for all)
evidence/shots/          baseline captures
roster.md                seated specialists, roles, mandates, direction territories
specialists/<slug>.md    each specialist's independent contribution
prototypes/<slug>/       key-screen / sample prototypes from direction specialists
critique/pool.md         anonymized directions + idea cards (what critics see)
critique/<critic>.md     cross-critiques
DIRECTION.md             Director's final design direction (templates/design-direction.md)
review/round-<n>/        panel review findings on the produced result
log.md                   decisions, rejections, anonymization key (critics never read this)
```

## Workflow

Track each step as a todo. In produce mode steps 1, 2, 5, 6 and 9 are never skipped.

### 0. Intake

Decide three things, without asking:
- **Artifact type:** component · page / landing page · website · web app / SaaS UI · dashboard ·
  mobile app · document / PDF / report · deck · graphic (poster, social, banner) · email ·
  design system · Figma file · motion/animation work · brand refresh.
- **Mode:** produce, direction or review (table above).
- **Scope:** the key screens/sections/pages the panel explores — 1–3 that represent the whole (a
  component: its main states; a site: home + one core template; a PDF: cover + one content spread;
  a deck: title + two content slides). The Director rolls the result out to everything else.

### 1. Gather evidence

Design from what exists, never from guesses. Build `evidence/brief.md`:

- **Caller-supplied pack** (a folder of crawl output, a spec, a brief): read it fully; it is the
  source of truth. Don't re-collect what it covers.
- **Existing thing:** the code (framework, components, tokens/theme, CSS approach, animation
  libraries, content sources, build commands), the document/deck/file (content, structure, page
  size, fonts, brand usage), or the live URL (look at the relevant pages with a browser tool).
- **Baseline captures:** screenshots of the key screens (390, 768, 1440 px for UI; page/slide
  renders for documents) with any tool from discovery's `tools` bucket or a browser MCP. With
  agent-browser, scroll first so reveals fire: `set viewport W H` → `open URL` → `eval` a
  scroll-through → `screenshot --full <path>`.
- **Brand & purpose:** logo, colors, fonts, voice, audience, goal of the artifact, conversions,
  constraints (medium, size, print vs screen, platform, stack).
- **Must preserve** list and **known problems** list (with evidence).

New design with nothing existing: the evidence is the request, the audience, the content provided
and any brand material — write that down and state assumptions.

### 2. Discover design skills

```bash
python3 <this-skill-dir>/scripts/discover_design_skills.py --project . --format json
```

Scans project skills, user skills and enabled plugins; tags each skill from its own description.
Buckets: `design` (candidate specialists), `media` (renderers for an output format — PDF, deck,
document, graphic), `adjacent` (framework/component aids), `tools` (browser/screenshot capture),
`excluded` (skills that invoke this one — never seat them). Flags: `legacy`, `needs-image-gen`,
`platform-bound`, `static-art`. Tags are hints — read each candidate's description (and the top of
its SKILL.md when unclear) before seating it.

### 3. Seat the panel

Follow [references/specialist-roles.md](references/specialist-roles.md): pick specialists relevant
to *this* artifact type, give each one role and mandate, split them into **direction
specialists** (each proposes a complete direction) and **lens specialists** (UX, accessibility,
typography, motion, design system, frontend, responsive…). Size the panel to the task. Drop
irrelevant skills with a one-line reason. Fill mandatory roles no skill covers with a **house
specialist** (no skill, the role's checklist only). Give direction specialists distinct
territories. Write `roster.md`.

### 4. Independent exploration (parallel)

Dispatch **every** seated specialist at once — one subagent each, all in a single message — using
[templates/specialist-brief.md](templates/specialist-brief.md). Each loads its skill live (Skill
tool with the `invoke` name; if unavailable, Read the SKILL.md `path` and follow it), works only
from `evidence/brief.md`, writes `specialists/<slug>.md` (direction specialists also build a
prototype in `prototypes/<slug>/`), and returns a short summary. Read their files, not their
chatter.

### 5. Blind cross-critique (parallel)

1. Build `critique/pool.md`: shuffle directions to letters (Direction A, B, …) and number every
   idea card (I-01, I-02, …); strip skill and specialist names. Record the key in `log.md`.
2. Capture each prototype (UI: 390 and 1440 px; documents/decks: page or slide renders) into
   `critique/shots/`.
3. Dispatch the critics from [references/critique-framework.md](references/critique-framework.md)
   in parallel (always including the Slop Hunter).

### 6. Design Director

Run the Director yourself, in the main context, per
[references/synthesis-framework.md](references/synthesis-framework.md): choose the spine direction,
take the best applicable idea per domain, re-express adopted ideas in the spine's language, enforce
the anti-committee budgets, log every rejection. Write `DIRECTION.md` from
[templates/design-direction.md](templates/design-direction.md). Direction mode: build one final
prototype from DIRECTION.md, run step 9 on it, deliver.

### 7. Produce

Build it in the target medium:
- **Code:** tokens → primitives → components → screens, in the project's framework and conventions;
  reuse existing components; use relevant `adjacent` skills as aids; run lint, typecheck, build.
- **Document / PDF / deck / graphic / email:** use the matching `media` skill to render the final
  file, applying DIRECTION.md's tokens and layout grammar.
- **Figma:** use an available Figma tool/skill; otherwise deliver DIRECTION.md + a coded reference.
Keep every must-preserve item intact.

### 8. Capture for review

UI: every key screen at 390, 768 and 1440 px plus interactive states (hover, focus, open menu,
error, empty/loading) and the console. Documents/decks/graphics: render pages/slides to images.
Compare against baseline.

### 9. Panel review → refine (loop, max 3 rounds)

Dispatch the seated specialists again as **reviewers** in parallel (review-only, no edits) plus the
Slop Hunter, with DIRECTION.md, the captures and the changed files — prompt in
critique-framework.md. Findings land in `review/round-<n>/`. As Director, triage each finding
(accept / reject with reason; DIRECTION.md settles conflicts), fix accepted ones, re-capture.
Stop when no blocker or major findings remain. Round 1 must produce real changes.

### 10. Polish

Run the `polish`-tagged specialists as a final detail pass (review-only → you apply): spacing
rhythm, borders, radius, shadows, optical alignment, tabular numbers, icon weight, focus rings,
state transitions, reduced motion. Re-verify and re-capture what changed.

### 11. Deliver

Report briefly: the direction and why (2–3 lines), provenance — which specialist each adopted idea
came from (reveal the key now), notable rejected ideas and why, files produced or changed,
before/after captures, how to run or open it, assumptions and known limits. Point to
`DIRECTION.md`. Invite feedback in one line. When called by another skill, return the run folder
path and DIRECTION.md path so the caller can continue.

## Feedback iterations

Feedback never triggers a questionnaire. "I don't like it" → critique the current result first
(Slop Hunter + the most relevant lens critics), name the likely weaknesses, then fix them. Specific
feedback becomes an added constraint. Build a keep/change ledger — **works / doesn't / improve /
keep unchanged** — re-seat only the specialists the feedback touches, re-run the Director on the
affected sections of DIRECTION.md, produce, and re-review what changed. Translation table and
ledger rules: synthesis-framework.md → *Feedback iterations*. Never regress content,
functionality, accessibility or performance.

## Red flags

| Thought | Reality |
|---|---|
| "I know which design skills exist" | Run discovery. The library changes. |
| "Let me paste the best rules from each skill into one prompt" | Duplication. Load each skill live inside its own specialist. |
| "It's just a button, skip the panel" | Scale the panel down, don't skip it. That's what this skill is for. |
| "Seat every design skill, relevance doesn't matter" | Irrelevant specialists add noise. Seat by artifact type. |
| "All directions came out similar" | Territories failed. Re-seed distinct territories, re-run the weakest. |
| "Most critics liked B, ship B" | The Director synthesizes; votes are input, not the decision. |
| "Every specialist should get something in" | Only ideas that strengthen the one design survive. |
| "Gradient hero, glass cards, purple glow — looks modern" | AI-slop default. Needs brand evidence to justify it. |
| "Ask which style they prefer" | Decide. The user wants autonomy. |
| "It renders, done" | Panel review and at least one refine round are mandatory. |
