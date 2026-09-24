# Critique framework — blind cross-critique and panel review

Contents: 1. The pool · 2. Critic lineup · 3. Cross-critique prompt · 4. Idea tags ·
5. Direction scoring · 6. AI-slop patterns · 7. Panel review prompt (step 9) · 8. Severity

## 1. The pool (`critique/pool.md`)

What critics see — nothing else about provenance.

```markdown
# Pool
Evidence: evidence/brief.md

## Direction A — <territory label only>
Summary · tokens (type, color roles, spacing, radius, motion) · key moves · captures:
critique/shots/A-390.png, critique/shots/A-1440.png (or A-page-1.png … for documents/decks)
· prototype: critique/proto/A/

## Ideas
- I-01 [domain: navigation] <title> — <one-paragraph idea> — evidence: <cited> — cost: S/M/L
- I-02 [domain: typography] …
```

Shuffle direction order; mix lens ideas into one numbered list grouped by domain. Remove skill
names, specialist names and self-praise. Copy prototypes into anonymized folders
(`critique/proto/A/`) if their paths would reveal the skill.

## 2. Critic lineup

Four by default; small artifacts use the Slop Hunter + the most relevant one or two
(specialist-roles.md §4). Each is a separate parallel subagent. Where a seated lens skill
fits a critic seat, the critic loads that skill for its criteria; otherwise it is a house critic.

| Critic | Judges | Loads skill? |
|---|---|---|
| UX critic | journeys, IA, hierarchy, conversion, usability, content fidelity | the seated UX skill if any |
| Visual & Brand critic | composition, type, color, brand fit, distinctiveness | none — house critic (every direction skill is a contestant) |
| Engineering critic | feasibility in the actual stack, performance, accessibility, maintainability | the seated frontend/a11y skill if any |
| Slop Hunter (adversary) | generic, overused, AI-looking, decorative-only, committee bloat | none — uses section 6 |
| Motion critic (optional) | only if motion is in scope | the seated motion skill if any |

A critic whose skill also produced a direction must not know which direction is its own; the
anonymized pool guarantees that.

## 3. Cross-critique prompt

```
You are the <CRITIC> on a design review panel. Evidence of the real project: <brief path>.
The pool of anonymized directions and ideas: <pool path>. Screenshots: <shots dir>.
<If a skill is assigned: Load the skill "<invoke>" (Skill tool; fallback: Read <path>) and use its
criteria as your review lens. Do not produce designs — only critique.>

For EVERY idea (I-xx): tag it (tags below), give a verdict keep | fix-then-keep | reject, and one
line of evidence (quote the brief, point at a screenshot region, or cite a stack constraint).
For EVERY direction: score 0–10 on each criterion below with a one-line reason, list its top 3
strengths and top 3 risks.
Then list CONFLICTS: pairs of ideas/directions that cannot coexist, and why.
Be specific. Reward what fits THIS project, not what is fashionable. Do not invent evidence.

Answer: which ideas are genuinely strong / generic / conflicting / improve UX / improve brand
differentiation / technically unrealistic / hurt performance / hurt accessibility / unnecessary
decoration / likely to look AI-generated / overused / create a distinctive identity.

Write to critique/<critic-slug>.md. Return a 5-line summary.
```

## 4. Idea tags

`STRONG` · `DISTINCTIVE` · `UX+` · `BRAND+` · `GENERIC` · `OVERUSED` · `AI-LOOK` · `DECORATION`
(adds nothing to comprehension, brand or action) · `UNREALISTIC` (stack, budget, content) ·
`PERF-RISK` · `A11Y-RISK` · `CONFLICTS:<id>` · `NO-EVIDENCE` (not grounded in the project).

Any idea tagged `NO-EVIDENCE` by two critics is rejected unless the Director can ground it.

## 5. Direction scoring criteria

Same ten the Director uses (weights live in synthesis-framework.md): brand fit · UX value ·
visual quality · distinctiveness · technical feasibility · performance · accessibility ·
consistency · scalability · implementation cost (10 = cheap).

## 6. AI-slop patterns (Slop Hunter's checklist)

Flag unless the brand evidence genuinely calls for it:

- Huge gradient hero + three glass cards + purple/blue glow + rounded pill buttons + floating blobs
- Hero → logo strip → 3 feature cards → testimonial carousel → 3-tier pricing → FAQ → CTA band,
  in that order, regardless of the business
- Same safe sans everywhere at timid sizes; no typographic idea
- Gradient text on headings; neon-on-black "futuristic" by default
- Icon-in-rounded-square grids; emoji as icons; generic 3D blob illustrations; stock "team" photos
- Everything fades up on scroll; parallax for its own sake; cursor followers without purpose
- Bento grid used as decoration rather than to express content relationships
- Invented stats, testimonials, logos, badges ("Trusted by 10,000+ teams")
- Glassmorphism/noise/grain layered without a reason
- Uniform section rhythm (same padding, same centered heading + subcopy, every section)
- Dark mode chosen because it "looks premium", not because of the product or audience

Also flag committee bloat: more than one signature idea competing for the same moment, several
accent colors, mixed radius/shadow languages, animation on every element.

## 7. Panel review prompt (step 9)

```
You are the <ROLE> reviewing an implemented design. Source of truth: DIRECTION.md.
Evidence: evidence/brief.md. Captures: <dir> (UI: 390/768/1440 + states; documents/decks: page or
slide renders). Changed files: <list>.
<Load skill "<invoke>" (fallback: Read <path>) and apply its review criteria to your domain.>
Review only. Do NOT edit files.

Look for, in your domain: UX problems, visual inconsistencies, brand inconsistencies, weak
hierarchy, poor typography, poor spacing, animation problems, accessibility problems, responsive
problems, performance problems, generic patterns, unnecessary complexity, drift from DIRECTION.md,
regressions against the must-preserve list.

Each finding: id, severity (blocker/major/minor), location (screen + breakpoint, or file:line),
evidence, what it violates (DIRECTION.md section or principle), proposed fix.
Also list what works and must not be touched.
Write to review/round-<n>/<role-slug>.md. Return counts by severity.
```

## 8. Severity

- **Blocker** — broken layout or function, lost content/route/page, fabricated content, WCAG AA
  failure on a core path, unreadable print/export output, direction fundamentally violated.
- **Major** — clearly visible inconsistency, weak hierarchy on a key screen, generic/slop pattern
  on a key screen, janky or excessive motion, poor mobile composition, measurable perf risk.
- **Minor** — polish-level details.

Step 9 exits when a round reports no blocker and no major findings (after Director triage).
