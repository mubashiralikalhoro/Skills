# Implementation Rules

## Contents
1. Stack selection
2. Project structure & components
3. Routing
4. Content pipeline
5. SEO
6. Forms & integrations (no fake functionality)
7. Accessibility checklist
8. Performance checklist
9. Motion implementation rules

## 1. Stack selection

1. User named a framework → use it (Next.js, React, Vue, Nuxt, Svelte/SvelteKit, Astro, …).
2. Current directory is an existing project with a suitable architecture → keep it, don't migrate.
3. Otherwise → Next.js (App Router) + React + TypeScript + Tailwind CSS + Motion, static generation
   by default. (A content-heavy site with little interactivity may justify Astro; state why.)

Use non-interactive scaffolding (`--yes`, `--ts`, etc.). Build in the current directory if it is
empty or the project; otherwise in a new folder named after the domain. Pin reasonable versions;
add dependencies only when used.

## 2. Project structure & components

```
app/ (or src/pages, routes/ …per framework)
components/
  layout/      Header, Footer, Navigation, MobileMenu, SkipLink
  ui/          Button, Link, Badge, Card, Input, Field, Modal, Tabs, Accordion, Section
  motion/      motion primitives DIRECTION.md calls for (all reduced-motion aware)
  sections/    section components per DIRECTION.md's page strategy
content/       typed data extracted from the crawl (pages, services, posts, nav, contact)
lib/           seo helpers, utils
public/        reused/optimized brand assets
styles/        tokens (CSS variables) from DIRECTION.md, globals
.website-info-collector/   original snapshot — keep
.the-designer/             design run (DIRECTION.md) — keep out of commits
```

No giant page files; no copy-pasted UI. One source for nav + footer data. Component names and
folders above are the default skeleton; the-designer may reshape components in step 5 — follow
DIRECTION.md's component strategy.

## 3. Routing

- Build the route map from `sitemap.md` and the `pages/` tree. Every meaningful original path
  gets a route at the **same path**. If you must change a path, add a permanent redirect.
- Collections (blog, products, services, case studies, locations) → dynamic route + static params
  generated from content data; every original item still resolves.
- Skip only junk: tag/feed/pagination duplicates, login/admin, search-result URLs — list what you
  skipped under Assumptions in the README.
- Required: custom 404; internal links all resolve; back/forward works; active nav state.

## 4. Content pipeline

Extract real copy from `pages/**/*.md` into `content/` (TS/JSON/MDX). Keep headings, body, lists,
CTAs, contact info, legal text verbatim or lightly edited (meaning preserved). Long legal/policy
pages: keep full text. JSON-LD lives in `raw/json/<page path>.json`. The collector records asset
URLs only (`assets.md`): download the ones worth reusing into `public/`, convert to modern formats
and correct sizes. Keep the original alt text when good; write accurate alt text when missing.

Never add: invented stats, testimonials, customer logos, awards, certifications, team members,
prices, products, or claims not on the original site.

## 5. SEO (preserve, then improve)

- Per-route title + meta description from `metadata.md` (improve only if missing/broken).
- Canonical URLs, Open Graph + Twitter/X cards (reuse original OG images where decent), favicon/icons.
- Structured data: carry over original JSON-LD; add appropriate schema (Organization,
  LocalBusiness, BreadcrumbList, Article, Product, FAQ) only with real data.
- `sitemap.xml`, `robots.txt`, semantic landmarks, one H1 per page, logical heading order,
  `lang` attribute, hreflang if the original had locales.

## 6. Forms & integrations — no fake functionality

- Recreate every meaningful form from `forms.md`: same fields, labels, required rules, purpose.
- Add client validation, inline errors, loading, success and error states, accessible labels.
- **Submission:** if the original posts to a third-party endpoint (Formspree, HubSpot, Mailchimp,
  Netlify, etc.) keep that exact endpoint. Otherwise build a clean handler stub (server action or
  API route) that is clearly marked `TODO: connect` and returns an honest "not yet connected" state
  in development — never a fake success. Never submit to real production endpoints during testing.
- Login, checkout, payments, search, booking, dashboards: preserve real embeds/links (e.g. external
  booking widget, store URL). If none exist, don't invent them.
- Keep analytics/tag IDs only if the user asks; list them in the README either way.

## 7. Accessibility checklist (WCAG AA)

Semantic HTML & landmarks · skip link · full keyboard navigation (menus, modals, tabs, accordions,
carousels) · visible `:focus-visible` styles · focus trap + return in modals/mobile menu · ARIA only
where native semantics fall short · alt text · labelled form controls with error association ·
contrast ≥ 4.5:1 / 3:1 · touch targets ≥ 44px · reduced motion · no information by color alone ·
pause controls for any auto-moving content.

## 8. Performance checklist

Framework image component or responsive `srcset`, AVIF/WebP, explicit dimensions, lazy-load below
the fold, priority for LCP image · self-hosted subset fonts, preloaded primary face · static
generation wherever possible · code-split heavy interactive/3D sections, load on visibility ·
minimal client JS (server components by default in Next.js) · no layout shift from fonts, images or
animations · defer/remove third-party scripts · target good Core Web Vitals (LCP < 2.5 s,
INP < 200 ms, CLS < 0.1).

## 9. Motion implementation rules

What moves and how it feels is DIRECTION.md's call. How it is built is this skill's:

- Lightest tool that achieves DIRECTION.md: CSS transitions → IntersectionObserver / CSS
  scroll-driven animations → Motion (React) → GSAP only for timelines it genuinely needs. Never two
  libraries doing the same job.
- Animate `transform` and `opacity` (and `clip-path` sparingly) — no layout-thrashing properties.
- Never delay the LCP element: hero text/image paints immediately; animate from a visible state.
- Reveal once; no infinite decorative loops; never hijack native scroll on mobile.
- `prefers-reduced-motion: reduce` fully supported (Motion `MotionConfig reducedMotion="user"`, CSS
  wrapped in `@media (prefers-reduced-motion: no-preference)`); verify by emulation in QA.
- Heavy/3D sections: lazy-load on visibility with a static fallback.
