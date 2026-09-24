# Synthesis framework — the Design Director

Contents: 1. Stance · 2. Choose the spine · 3. Best-of-each selection · 4. Compatibility test ·
5. Anti-committee budgets · 6. Quality bar · 7. Redesign preservation · 8. Rejection log ·
9. Feedback iterations

## 1. Stance

The Director is one senior design lead turning a panel's work into a design that looks like it was
made by **one excellent team**. Critic scores and tags are inputs, not the decision. Never average
directions. Never include an idea because a specialist suggested it — only because it makes this
design better for this project.

## 2. Choose the spine

The spine is the one direction whose visual language the final design speaks.

1. Per direction, combine critic scores (mean per criterion) with your own reading of the
   screenshots and evidence. Weighted total:

   | Criterion | Weight |
   |---|---|
   | Brand fit | 0.15 |
   | UX value | 0.15 |
   | Visual quality | 0.12 |
   | Distinctiveness | 0.12 |
   | Accessibility | 0.10 |
   | Technical feasibility | 0.10 |
   | Performance | 0.08 |
   | Consistency | 0.06 |
   | Scalability | 0.06 |
   | Implementation cost | 0.06 |

2. Disqualify as spine any direction with an unfixable blocker (fabricated content, core
   accessibility failure baked into the concept, infeasible in the stack).
3. Top two within ~0.3: pick the one with higher brand fit, then UX value. Write down why.
4. Two directions may share the spine only if they already speak the same language (same type
   logic, compatible palettes, same motion temperament). Otherwise: one spine, others are donors.

## 3. Best-of-each selection

For each domain, pick the strongest applicable contribution from **any** specialist or direction:

| Domain | Pick |
|---|---|
| UX | best navigation structure, journey, CTA placement |
| Visual | best composition and layout grammar (usually the spine's) |
| Brand | best identity expression and signature device |
| Typography | best font system and scale |
| Motion | best interaction language and motion hierarchy |
| Design system | best token and component architecture |
| Accessibility | best accessible patterns (focus, keyboard, semantics, forms) |
| Responsive | best small-screen recomposition |
| Frontend | best implementation strategy for the actual stack |

Candidates: ideas with `keep` from most critics, or `fix-then-keep` with a known fix, or an idea you
can defend with evidence that critics under-rated (write the defense). A domain may keep the
spine's own answer — that is often right. Leaving a specialist with nothing adopted is fine.

## 4. Compatibility test (every adopted idea)

- Does it speak the spine's language after re-expression in its tokens? If it needs its own font,
  color, radius or easing to work, reject or re-express.
- Does it compete with another adopted idea for the same moment or attention?
- Does it serve a user goal or brand expression visible in the evidence?
- Can the stack deliver it at acceptable performance and full accessibility?
- Would removing it make the design worse? If not, remove it.

## 5. Anti-committee budgets

Hard limits unless the evidence justifies an exception (write the justification in DIRECTION.md):

- **Type:** one display + one text family (a mono only if the product needs it). One scale.
- **Color:** a neutral ramp + one primary accent + at most one secondary accent + semantic colors.
- **Shape:** at most 3 radii, one border language, at most 3 elevation levels.
- **Spacing:** one scale; section rhythm deliberately varied, not uniform.
- **Motion:** one easing family, at most 3 durations, at most 2 signature moments per page; everything
  else subtle state feedback. `prefers-reduced-motion` fully supported.
- **Components:** reuse and extend before adding; every new component names the screens using it.
- **Sections:** each section earns its place with real content and a job; one hero idea per page.

Guards against: feature bloat, too many animations, too many colors, conflicting styles, excess
components, inconsistent spacing, competing design languages, unnecessary complexity.

## 6. Quality bar

Before writing DIRECTION.md, the synthesis must be: premium · distinctive · modern · highly usable
· brand-specific · responsive · accessible (WCAG 2.2 AA) · fast · technically realistic ·
production-ready — and pass the Slop Hunter checklist (critique-framework.md §6).

## 7. Redesign preservation

- Keep information architecture that works; change it only where evidence (analytics, journeys,
  crawl, known problems) shows it fails — and say so.
- Keep every route (or redirect it), every piece of real content, every working form and
  integration, and all SEO value (titles, meta, headings, structured data, canonical URLs).
- Keep recognizable brand anchors (logo, core hue) unless the task is a rebrand.
- No fake functionality, no invented content. Missing content → design the slot honestly.

## 8. Rejection log

In `log.md`, for every idea not adopted: id, one-line reason (generic, conflicts with spine,
perf/a11y risk, no evidence, budget exceeded, duplicate of better idea). The log keeps the Director
honest and answers "why didn't you use X" later.

## 9. Feedback iterations

**Ledger first.** Before changing anything, write in `log.md`:

| Works (keep) | Doesn't work | Improve | Unchanged by this feedback |
|---|---|---|---|

**"I don't like it" (no specifics):** run the Slop Hunter + UX + Visual & Brand critics on the
current screenshots, rank the likely weaknesses, fix the top ones, then report what changed and why.

**Translate feedback into constraints** (always relative to the brand):

| Feedback | Usually means |
|---|---|
| "More premium" | more restraint and space, sharper type hierarchy, fewer and better colors, higher-quality imagery treatment, slower and subtler motion, tighter detail polish |
| "Too much animation" | cut to the signature moments, shorten durations, remove scroll-reveals on body content, keep state feedback |
| "Feels generic" | revisit identity, composition, typography, layout and interaction; find a brand-specific signature device; break uniform section rhythm |
| "Too busy / cluttered" | fewer sections and elements, stronger hierarchy, more whitespace, one CTA per view |
| "Boring" | stronger typographic idea, bolder composition, one memorable interaction, richer imagery |
| "Doesn't feel like us" | back to brand evidence: voice, existing assets, audience; re-weight brand fit |
| "Bad on mobile" | recompose for small screens (priority, order, type scale, touch targets), don't just stack |

Re-seat only the specialists the feedback touches, re-run the Director on the affected
DIRECTION.md sections, implement, and re-review the touched screens (step 9). Preserve everything in
the Works column.
