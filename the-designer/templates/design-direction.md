# DIRECTION.md template

Copy into `<run>/DIRECTION.md` and fill. Values, not adjectives. Omit sections the artifact does
not use (e.g. Component strategy for a poster, Page strategy for a single component).

```markdown
# Design Direction — <project> (<artifact type>)

## 0. Decision
Spine: Direction <letter> — <territory>. Why: <2–3 lines tied to evidence and scores>.
Runner-up and why not: <1–2 lines>.

## 1. Design direction
- **Brand concept:** <one sentence the whole design serves>
- **Visual language:** <composition principles, imagery treatment, signature device>
- **Typography:** display <family, weights>, text <family, weights>, scale <steps in px/rem>,
  line-heights, measure, numeric style
- **Color:** roles → hex (bg, surface, text, muted, border, accent, accent-contrast, semantic),
  contrast ratios for text pairs
- **Layout:** grid (columns, gutters, max width — or page size, margins, columns for print/slides),
  spacing scale, section rhythm
- **Shape & depth:** radii, borders, elevation levels
- **Interaction:** state language (hover, focus, active, disabled, loading, empty, error)
- **Motion:** easing, durations, the ≤2 signature moments per page, reduced-motion behavior

## 2. Page / screen / slide strategy
| Page, screen or slide | Purpose | Structure (sections in order) | UX notes | Visual treatment | Interactions |
|---|---|---|---|---|---|

## 3. Component strategy
| Component | Variants | States | Responsive behavior | New / reused / extended |
|---|---|---|---|---|

## 4. Implementation guidance
- Medium & tooling: framework and where tokens live (CSS variables / Tailwind theme / theme file),
  or the renderer for documents/decks/graphics and export settings
- Animation technology and why (CSS, WAAPI, Motion, GSAP…) + performance rules
- Component architecture (files, composition, reuse of existing components)
- Performance: fonts, images, LCP element, CLS risks, bundle impact
- Accessibility: landmarks, heading map, focus order, keyboard paths, forms, contrast, reduced motion
- Build order (tokens → primitives → components → screens)

## 5. Provenance
| Adopted idea | From (reveal after critique) | Adapted how |
|---|---|---|

## 6. Budget exceptions
<any anti-committee budget exceeded, with evidence-based justification — or "none">

## 7. Must-preserve checklist
- [ ] content · [ ] structure/IA that works · [ ] functionality/integrations · [ ] routes & SEO (web)
```
