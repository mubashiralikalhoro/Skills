# Specialist roles and panel seating

Contents: 1. Two kinds of specialist · 2. Role catalog · 3. Seating by artifact type ·
4. Panel size · 5. Mapping discovered skills to roles · 6. Filters · 7. Direction territories ·
8. roster.md format

## 1. Two kinds of specialist

- **Direction specialist** — proposes a complete, committed design direction (visual language,
  type, color, layout, motion) plus a key-screen prototype. Seat a skill here when its description
  shows it produces a whole look: typically tags `visual` + `frontend`/`typography`, or a skill
  built around one aesthetic. Each takes a different territory; count per section 4.
- **Lens specialist** — analyzes one domain deeply against the evidence and proposes idea cards for
  that domain only (e.g. navigation structure, focus handling, type scale, motion hierarchy). Seat a
  skill here when its strength is a domain rather than a full look (`ux`, `accessibility`, `polish`,
  `design-system`, `motion`), or when a direction-capable skill is better used for its depth in one
  domain.

One skill = one seat, one role. A skill strong in many areas (a router/generalist skill) takes the
role where the panel is thinnest. Lens specialists return in step 9 as reviewers of their domain;
direction specialists return as reviewers of overall visual/brand quality.

## 2. Role catalog

Each role's mandate is what the specialist must analyze and propose. Always from the evidence.

| Role | Analyzes | Typical tags |
|---|---|---|
| UX Director | information architecture, user journeys, navigation, hierarchy, conversion paths, usability, content organization | ux, redesign |
| Visual Design Director | composition, color, typography, layout, imagery, contrast, visual hierarchy — as a full direction | visual, frontend |
| Brand Designer | brand personality, positioning, visual identity, emotional tone, differentiation from competitors | brand |
| Typography Specialist | font pairing, scale, rhythm, measure, readability, editorial composition | typography |
| Motion Designer | page transitions, scroll behavior, micro-interactions, animation hierarchy, feedback, reduced motion | motion |
| Interaction Designer | states (hover/focus/active/disabled/loading/empty/error), affordances, gestures, feedback | interaction |
| Design Systems Architect | tokens, components, variants, consistency, scalability, naming | design-system |
| Responsive Specialist | recomposition per breakpoint (390/768/1024/1440/1920), touch targets, content priority on small screens | responsive |
| Accessibility Specialist | WCAG 2.2 AA, keyboard paths, focus order/visibility, contrast, semantics/landmarks, forms, reduced motion | accessibility |
| Frontend Design Engineer | feasibility in the actual stack, component architecture, performance (LCP/CLS/INP, bundle, fonts, images), animation cost, maintainability | frontend |
| Creative / Experimental Designer | one bold, brand-plausible reach idea (signature interaction, visual device, generative element) | creative |
| Product Designer | product flows end-to-end, onboarding, empty states, feature discoverability | ux, frontend |
| Data-Viz Specialist | chart choice, density, scanability, comparisons, dashboard layout, number formatting | dataviz |
| Mobile Platform Specialist | platform conventions (HIG / Material), navigation patterns, gestures, safe areas | mobile |
| Figma Specialist | frames, auto-layout, components/variants, styles/variables, handoff | figma |
| Detail Polisher | micro-polish: borders, radius, shadows, optical alignment, tabular numbers, icon weight, state transitions | polish |
| Editorial / Document Designer | page grid, margins, hierarchy across pages, reading flow, print vs screen, tables and figures | typography, visual |
| Presentation Designer | one idea per slide, visual hierarchy at distance, data slides, pacing, speaker-friendly structure | visual, typography |

## 3. Seating by artifact type

**M** = mandatory (seat a skill, else a house specialist). **P** = seat if a relevant skill exists.
**—** = skip unless the brief makes it relevant.

| Role | Website redesign | UI / SaaS redesign | Landing page | Dashboard | Mobile app | Design system | Figma | Motion work | Brand modernization |
|---|---|---|---|---|---|---|---|---|---|
| UX Director | M | M | M | M | M | P | M | P | P |
| Visual Design Director (directions) | M | M | M | M | M | P | M | P | M |
| Brand Designer | M | P | M | — | P | P | P | — | M |
| Typography Specialist | M | P | M | P | P | M | P | — | M |
| Motion Designer | P | P | M | — | M | P | — | M | P |
| Interaction Designer | P | M | P | M | M | M | P | M | — |
| Design Systems Architect | M | M | P | M | M | M | M | P | P |
| Responsive Specialist | M | M | M | M | — | P | P | P | P |
| Accessibility Specialist | M | M | M | M | M | M | P | M | P |
| Frontend Design Engineer | M | M | M | M | M | M | — | M | P |
| Creative / Experimental | P | — | P | — | — | — | — | P | P |
| Product Designer | — | M | — | P | M | — | P | — | — |
| Data-Viz Specialist | — | P | — | M | — | — | — | — | — |
| Mobile Platform Specialist | — | — | — | — | M | — | P | — | — |
| Figma Specialist | — | — | — | — | — | P | M | — | — |
| Detail Polisher | P | P | P | P | P | P | P | P | P |

Single artifacts and other media:

| Role | Component | Single page | Document / PDF | Deck | Graphic / poster / social | Email |
|---|---|---|---|---|---|---|
| UX Director | P | M | P | P | — | M |
| Visual Design Director (directions) | M | M | M | M | M | M |
| Brand Designer | — | P | P | P | M | P |
| Typography Specialist | P | M | M | M | M | P |
| Motion Designer | P | P | — | P | P | — |
| Interaction Designer | M | P | — | — | — | P |
| Design Systems Architect | M | P | P | P | — | P |
| Responsive Specialist | M | M | — | — | P | M |
| Accessibility Specialist | M | M | M | P | P | M |
| Frontend Design Engineer | M | M | — | — | — | M |
| Creative / Experimental | — | P | — | P | M | — |
| Editorial / Document Designer | — | — | M | P | P | — |
| Presentation Designer | — | — | — | M | — | — |
| Detail Polisher | M | P | P | P | P | P |

Mixed tasks (e.g. a SaaS marketing site + app dashboard): union the columns, then trim roles the
key screens do not exercise.

## 4. Panel size

Scale to the artifact; relevance, not count, is the limit.

| Artifact | Direction specialists | Lens specialists | Critics | Review rounds (max) |
|---|---|---|---|---|
| Component, email, single graphic | 2–3 | mandatory roles only | Slop Hunter + 1 | 2 |
| Single page, deck, document | 3–4 | mandatory + relevant P | Slop Hunter + 2 | 3 |
| Website, app, dashboard, design system | every distinct relevant skill (typically 4–8) | all mandatory + relevant P | all four | 3 |

"Quick" requested → the smallest row for that artifact.

## 5. Mapping discovered skills to roles

1. Take the `design` bucket. Drop anything the filters (section 6) exclude; note the reason.
2. For each remaining skill, read its description (and SKILL.md head if unclear) and decide:
   direction-capable or lens-best? What is its strongest domain?
3. Seat direction-capable skills as Visual Design Directors, one territory each (section 7).
   If more direction-capable skills exist than distinct plausible territories, seat the ones whose
   descriptions differ most; move the rest to the lens role matching their strongest tag.
4. Fill the remaining mandatory roles from lens-best skills by strongest matching tag.
5. Any mandatory role still empty → **house specialist** (no skill; the role's mandate row and the
   evidence only). House specialists are normal panel members; they are never skipped.
6. `polish`-tagged skills also serve in step 10 even if seated elsewhere.
7. A new, unknown design skill is judged exactly like known ones — by its own description.

## 6. Filters

| Flag / situation | Rule |
|---|---|
| `legacy` | Skip when a successor with the same purpose is seated. |
| `platform-bound` | Seat only if the target is on that platform or brand (e.g. a Shopify admin app, an Anthropic-branded page). Otherwise skip. A skill that only *outputs* in a platform's format (e.g. a DESIGN.md meant for a design tool) may still be seated for its design thinking. |
| `needs-image-gen` | Seat only if an image-generation tool is actually available in this session. |
| `static-art` | Relevant for graphics, posters, covers and illustration; skip for interface work unless such a visual is in scope. Many UI skills mention posters in passing; judge by the main purpose. |
| `excluded` bucket | Never seat. These skills invoke the-designer themselves (e.g. a full-site pipeline). |
| Workflow skill that builds a whole product end-to-end | Not a panelist; it is a caller, not a specialist. |
| Non-design skill that slipped through | Skip with reason. |
| `media` bucket | Not panelists. Renderers for step 7 (PDF, deck, document, graphic). |
| `adjacent` bucket | Not panelists. Framework/component skills are aids for step 7. |
| `tools` bucket | Capture for review (browser, screenshots). |

## 7. Direction territories

Directions must differ in kind, not in accent color. Before dispatch, give each direction
specialist a **territory** — a one-line creative position derived from the brand evidence:

- Minimal luxury editorial · Architectural / futuristic · Immersive cinematic ·
  Technical precision · Organic premium · Warm human craft · Bold graphic / Swiss ·
  Playful tactile · Quiet utility · Data-forward instrument
- Invent brand-specific ones ("Field-journal cartography" for an outdoor brand) — better than
  generic labels.

Rules:
- If the skill is built around one aesthetic, its territory is that aesthetic; do not fight it.
- Every territory must be plausible for this brand and audience. At most one "reach" territory.
- If a hard brand constraint exists (logo colors, mandated typeface), every territory works within it.
- Specialists commit fully to their territory — no hedging toward the middle. Convergence happens
  in the Director stage, never in exploration.

## 8. roster.md format

```markdown
# Panel roster — <artifact type>, <mode>, <key screens / sections>

| Seat | Kind | Role | Skill (invoke) | Territory / mandate focus |
|---|---|---|---|---|
| S1 | direction | Visual Design Director | <invoke> | <territory> |
| S2 | lens | UX Director | <invoke> | <focus> |
| S3 | lens | Accessibility Specialist | house | WCAG 2.2 AA mandate |

## Not seated
- <invoke> — <reason>
```
