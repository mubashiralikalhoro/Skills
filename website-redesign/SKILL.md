---
name: website-redesign
description: Autonomously redesign an existing live website into a complete, modern, brand-specific new site. A pipeline over two skills — website-info-collector crawls the original (pages, content, routes, forms, SEO, assets), the-designer decides the design (the multi-agent the-designer-team only when the user explicitly asks for it) — while this skill owns the build - rebuild EVERY page (same routes, same real content) with SEO, forms, accessibility and performance, full-site QA and a final design review. Zero design questions. Use when the user gives a website URL and asks to redesign, rebuild, modernize, reimagine, refresh, "make premium/futuristic", or "bring into the future" a site — optionally naming a framework (Next.js, Astro, Vue, Nuxt, Svelte). Also for feedback on a redesign built with this skill ("I don't like it", "homepage is boring", "animations are too much").
---

# Website Redesign — Autonomous pipeline

Input: a URL (optionally a framework). Output: a **complete, working, redesigned website** — same
company, same information, same routes and journeys, experienced as if it launched today.

> Keep the original's information, pages, business meaning and core journeys.
> Completely reinvent how users experience them.

This skill is the **producer**. It does not make design decisions itself. Two skills do the
specialist work, each staying independent:

| Skill | Owns |
|---|---|
| **website-info-collector** | Crawling the original site into `.website-info-collector/` |
| **the-designer** (or **the-designer-team** if explicitly requested) | Every design decision: direction, design system, key templates, design review |
| **website-redesign** (this) | Brief, stack, content pipeline, every route, SEO, forms, a11y/perf engineering, full-site QA, README, delivery |

Both skills are required. If either is not installed, stop and tell the user which one to install —
do not substitute an improvised crawler or improvised design.

**Which designer.** Use **the-designer** (single agent, low token cost) by default. Use
**the-designer-team** (multi-agent panel) only when the user explicitly asks for it. Both have the same
modes and the same `DIRECTION.md` contract; the team's run folder is `.the-designer-team/`. Use the
chosen one for steps 5, 10 and design feedback — "the-designer" below means whichever was chosen.

## Prime directive — do the work first, ask later

**Never ask design questions** (colors, fonts, style, dark mode, layout, hero, animation, library).
Don't present options or pause for approval. Ask only when blocked on something that cannot be
inferred (credentials for an existing backend, a crawl that is fully blocked). The only question at
the end: **"What would you like me to improve?"**

## Workflow

```
URL → 1 Collect → 2 Read all → 3 Brief → 4 Stack & scaffold → 5 Design (the-designer)
→ 6 Roll out every page → 7 SEO/forms/a11y/perf → 8 Build & fix → 9 Site QA
→ 10 Design review (the-designer) → 11 README → 12 Deliver + ask one question
```

Track each step as a todo. Never skip 1, 5, 9 or 10.

### 1. Collect the original site

Invoke the **website-info-collector** skill on the URL from the project root (raise its page limit
for large sites). Its output `.website-info-collector/` is the **source of truth** for the original
site — never delete it. Crawl failed or thin → check its `errors.md`, retry per that skill's
guidance; never design from an empty snapshot.

### 2. Read everything

Actually read the output: `README.md`, `site.md`, `sitemap.md`, `navigation.md`, `metadata.md`,
`assets.md`, `forms.md`, `links.md`, `errors.md`, every `pages/**/*.md`, and the JSON-LD in
`raw/json/`. Large sites: read every top-level and template page; for repetitive collections (blog
posts, products) read a sample and generate the rest from the page files.

### 3. Write the redesign brief (no approval)

Write `.website-info-collector/REDESIGN-BRIEF.md` from
[references/redesign-brief.md](references/redesign-brief.md): brand analysis, current UX/visual/
technical problems, full route map, per-page content inventory, forms and integrations, must-preserve
list, assumptions. It holds **facts and content, not visual direction** — the-designer decides that.

### 4. Choose the stack and scaffold

Per [references/implementation.md](references/implementation.md): pick the framework, scaffold,
build the content pipeline (`content/` from the page files), create **every route** with its real
content in plain semantic markup, and fetch the brand assets worth reusing (URLs in `assets.md`)
into `public/`. This gives the-designer a real project with real content to design in.

### 5. Design — hand off to the-designer

Invoke the **the-designer** skill from the project root, in **produce** mode, with:
- artifact type: website redesign; target: the scaffolded project
- evidence pack: `.website-info-collector/` + `REDESIGN-BRIEF.md` (it must not re-crawl)
- key screens: home + one page per major template type (max 3 total, e.g. home, a service/product
  detail, an article)
- must preserve: every route, all real content, forms/integrations, SEO metadata
- constraint: no fabricated content or fake functionality

It returns its run folder with `DIRECTION.md` and has implemented the tokens, shared components and
key templates. `DIRECTION.md` is now the design contract for every remaining page.

### 6. Roll out every page

Apply DIRECTION.md and the designed components to **every** route and template — not just the key
screens. Whole site, not a homepage: content pages, service/product pages and detail routes, blog
index and posts, contact, legal, every other discovered route, plus 404. Style only through the
tokens and components the-designer created; a page that needs something new gets a section
component that follows DIRECTION.md. Non-negotiables:

- **Every meaningful original route exists** at the same path (or 301-redirects to it).
- **Real content only.** No lorem ipsum. Never invent claims, stats, testimonials, clients, awards,
  products or prices. Missing content → an honest slot, not fabrication.
- **No fake functionality.** No pretend login, checkout, search, booking or form success.

### 7. SEO, forms, accessibility, performance

Engineering rules in implementation.md: per-route metadata, canonical, OG, JSON-LD, sitemap/robots;
forms with real endpoints or honest "not connected" states; WCAG AA; Core Web Vitals; motion
implementation rules (reduced motion, transform/opacity only, never delay the LCP element).

### 8. Build and fix

Install, lint, typecheck, production build. Fix every error and warning you caused. Run the site
locally.

### 9. Site QA

Per [references/qa.md](references/qa.md): screenshot every route at 375, 768, 1280 and 1920 px plus
states; console and network errors; broken links; completeness against the original — re-run
**website-info-collector** against the local dev server and diff its route list and content
against the original snapshot. Fix everything, re-shoot.

### 10. Design review — the-designer again

Invoke **the-designer** in **review** mode on the whole built site, pointing it at its previous run
folder and DIRECTION.md, with the QA captures of every template. It runs its review → refine
loop and polish pass across all templates (not only the key screens). Re-run site QA on the routes
it touched.

### 11. README

Update the project README from [assets/README-template.md](assets/README-template.md): original URL,
the direction summary from DIRECTION.md, framework, where tokens live, routes, architecture,
animation approach, run/build commands, every assumption.

### 12. Deliver

Report briefly: direction and why (2–3 lines, from DIRECTION.md), routes built (count + list),
notable interactions, how to run it, assumptions, known limits (e.g. forms not wired to production).
Include 2–4 screenshots. End with exactly: **"What would you like me to improve?"**

## Feedback iterations

Feedback never triggers a questionnaire. Route it by kind — see
[references/feedback-iteration.md](references/feedback-iteration.md):
- **Design feedback** ("more premium", "boring", "too much animation", "colors are off") → the-designer's
  feedback iteration on its existing run; then roll the updated DIRECTION.md out to every affected route.
- **Content, route or functionality feedback** → handled here directly.

**Never regress:** every iteration keeps all pages, content, working functionality, SEO, responsive
behavior, accessibility and integrations. Re-run build + site QA on touched routes before reporting.

## Red flags

| Thought | Reality |
|---|---|
| "I'll pick the colors and fonts myself, faster" | Design decisions belong to the-designer. |
| "the-designer isn't installed, I'll wing the design" | Stop and ask the user to install it. |
| "Skip the crawl, I can see the site" | Collector output is the required source of truth. |
| "Homepage done, rest can follow" | First delivery = whole site. |
| "I'll add a testimonial section with sample quotes" | Fabrication. Use only real content. |
| "The contact form can just show success" | Fake functionality. Honest states only. |
| "Build passes, ship it" | Site QA and the-designer's review are mandatory. |
