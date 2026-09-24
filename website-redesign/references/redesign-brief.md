# REDESIGN-BRIEF.md Template

Write to `.website-info-collector/REDESIGN-BRIEF.md`. Evidence-based, concise, no approval needed.
It records **facts, content and constraints** from the crawl. It contains no visual direction,
design system or layout concepts — those are the-designer's `DIRECTION.md`. the-designer receives
this brief as part of its evidence pack.

```markdown
# Redesign Brief — <Brand> (<original URL>)

## 1. Brand analysis
- What they do:
- Audience (primary / secondary):
- Value proposition:
- Products / services:
- Personality & tone (quote evidence from copy):
- Existing identity to keep (logo, core hue, marks, fonts if distinctive):
- Trust signals present on the site (real only):
- Differentiators:
- Primary conversion: | Secondary:

## 2. Current site problems (with evidence: page, screenshot, errors.md)
- UX (nav, hierarchy, CTAs, mobile, forms):
- Visual (type, spacing, layout, imagery, consistency):
- Technical (speed, SEO gaps, a11y, errors):

## 3. Information architecture
| Original route | New route | Template type | Notes (redirect? merged nav?) |

Navigation data (main nav with dropdowns, footer groups) from navigation.md, and any proposed
regrouping with the reason.

## 4. Page inventory
### <Page> (`/route`) — template: <type>
- Purpose / primary user / primary CTA (real text):
- Content blocks in order, with the real content each carries (headings, copy, lists, media, CTAs):
- Forms / embeds on the page:

(repeat per page; collections: one entry per template + item count)

## 5. Assets
Logo files, imagery worth reusing (URL → local path), video/embeds, icons. Mark each: reuse /
needs better crop / low quality.

## 6. Integrations & forms
| Form or integration | Pages | Endpoint / provider | Keep as-is / UI-only with honest state |

## 7. Must preserve
Routes, content, forms, integrations, SEO metadata, JSON-LD, anything users rely on.

## 8. Constraints
Framework (user's choice or chosen), hosting hints, locales, legal text that must stay verbatim.

## 9. Assumptions

## 10. Iterations
(appended per feedback round)
```
