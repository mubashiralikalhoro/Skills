# Site QA — completeness, function, rendering

Design quality is judged by the-designer's review (step 10). This file covers what the producer
owns: every route present, content intact, nothing broken, every breakpoint rendering.

## Capture matrix

For **every route** (collections: index + at least 2 detail pages):

| Width | Represents |
|---|---|
| 375 | Mobile |
| 768 | Tablet |
| 1280 | Laptop |
| 1920 | Desktop / large |

Full-page screenshots (scroll through first so reveals fire). Also: mobile menu open, hover/focus
on primary buttons, a form in error and success/not-connected states, 404, reduced-motion
emulation of home. Store in `.website-redesign-qa/<route>/` and hand them to the-designer's review.

## Completeness against the original

1. Run **website-info-collector** against the local dev server into a separate folder (e.g.
   `.website-info-collector-local/`).
2. Diff route lists: every meaningful original route must exist or redirect. List intentional
   skips (tag/feed/pagination duplicates, login/admin, search URLs) under README Assumptions.
3. Spot-diff content per template: headings, key paragraphs, CTAs, contact details, legal text.
4. Diff metadata: title, description, canonical, OG, JSON-LD types per route.
5. Forms: same fields, labels, required rules; endpoint kept or honest "not connected" state.

## Defects to hunt and fix

Horizontal overflow · broken or overlapping layouts · content hidden behind an animation that never
fires · images stretched, blurry or badly cropped · broken internal links · console errors · failed
network requests · CLS on load · missing alt text · headings out of order · focus not visible ·
keyboard traps · touch targets under 44px · text unreadable over imagery.

Fix → re-shoot affected routes → confirm. Design-level issues found here (hierarchy, typography,
visual consistency) go into the list handed to the-designer in step 10, not patched ad hoc.

## Exit criteria

Every original meaningful route exists · real content intact · forms present with honest states ·
SEO metadata per route · clean build · no console errors · no defect from the list above open.
