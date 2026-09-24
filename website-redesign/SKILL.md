---
name: website-redesign
description: Autonomously redesign an existing live website into a complete, modern, brand-specific new site. Single-agent pipeline — website-info-collector crawls the original (pages, content, routes, forms, SEO, assets), the-designer decides the design (the multi-agent the-designer-team only when the user explicitly asks for it) — while this skill owns the build - rebuild EVERY page (same routes, same real content) with SEO, forms, accessibility and performance, then a quick load-and-look check (full QA is a separate skill). Zero design questions. Use when the user gives a website URL and asks to redesign, rebuild, modernize, reimagine, refresh, "make premium/futuristic", or "bring into the future" a site — optionally naming a framework (Next.js, Astro, Vue, Nuxt, Svelte). Also for feedback on a redesign built with this skill ("I don't like it", "homepage is boring", "animations are too much").
---

# Website Redesign

URL in (optionally a framework) → a **complete, working, redesigned website** out: same company,
same routes, same real content, experienced as if it launched today.

This skill is the **builder**. Two skills do the rest:

| Skill | Owns |
|---|---|
| **website-info-collector** | crawling the original into `.website-info-collector/` |
| **the-designer** | every design decision (`DIRECTION.md`) and the design check |
| this skill | brief, stack, every route, SEO, forms, a11y/perf, quick check, README, delivery |

If either skill is missing, stop and tell the user which one to install. Use **the-designer-team**
instead of the-designer only when the user explicitly asks for it (same `DIRECTION.md` contract;
its run folder is `.the-designer-team/`).

## Rules

- **Single agent.** Never spawn subagents or parallel workers — not here, not in the collector
  (tell it: single session, no batching).
- **No design questions.** Colors, fonts, style, layout, motion → the-designer decides. Ask only when
  blocked (credentials, a fully blocked crawl). The only question at the end:
  **"What would you like me to improve?"**
- **Whole site on first delivery.** Every meaningful original route, at the same path (or a 301).
- **Real content only.** No lorem, no invented stats, testimonials, clients, awards, prices or
  features. Missing content → honest slot.
- **No fake functionality.** No pretend login, checkout, search, booking or form success.
- **Read once.** Read each snapshot file once, when needed.
- **No QA pass.** Full QA/testing belongs to a separate skill; here only step 6's quick check.

## Workflow

Track as todos.

```
1 Collect → 2 Brief → 3 Scaffold → 4 Design → 5 Build every page → 6 Quick check → 7 README & deliver
```

### 1. Collect
Invoke **website-info-collector** on the URL from the project root — single session, no subagent
batching (raise its page limit for big sites). `.website-info-collector/` is the source of truth;
never delete it. Crawl failed or thin → check its `errors.md` and retry; never build from an empty
snapshot.

### 2. Brief
Read the overview files only: `README.md`, `site.md`, `sitemap.md`, `navigation.md`, `metadata.md`,
`forms.md`, `assets.md`, `errors.md`, plus `pages/home.md` and one page per template type. Write
`.website-info-collector/REDESIGN-BRIEF.md` from [references/redesign-brief.md](references/redesign-brief.md)
— facts and constraints, not visual direction. Don't copy page content into it; the page files are
the content.

### 3. Scaffold
Per [references/implementation.md](references/implementation.md) §1–4: pick the stack, scaffold,
create **every route** from `sitemap.md`, fill each with its real content from its `pages/*.md`
(read each page file once, when building its route) in plain semantic markup, and download the
reusable assets into `public/`. Collections → one dynamic route + data.

### 4. Design
Invoke **the-designer** in **produce** mode from the project root with:
- artifact: website redesign; target: this project
- evidence pack: `.website-info-collector/` + `REDESIGN-BRIEF.md` (no re-crawl)
- key screens: home + up to 2 other template types
- must preserve: every route, all real content, forms/integrations, SEO metadata

It returns `DIRECTION.md` and implements tokens, shared components and the key templates.
`DIRECTION.md` is now the design contract.

### 5. Build every page
Apply DIRECTION.md's tokens and components to **every** route and template, plus a 404 — style only
through them; a new need gets a section component that follows DIRECTION.md. Then implementation.md
§5–9: per-route SEO, JSON-LD, sitemap/robots, honest forms, accessibility, performance, motion
rules. Install, lint, typecheck, production build; fix every error and warning you caused.

### 6. Quick check
Run the site locally. Open home and one page per template at 390 and 1440 px: it loads, no console
errors, nothing broken or overflowing, looks as DIRECTION.md intends. Fix what's off. That's it — no
test suite, no per-route sweep.

### 7. README & deliver
Write the project README from [assets/README-template.md](assets/README-template.md). Report
briefly: direction and why (2–3 lines, from DIRECTION.md), routes built (count), how to run it,
assumptions, known limits (e.g. forms not wired). 2–4 screenshots. End with exactly:
**"What would you like me to improve?"**

## Feedback

No questionnaire. Split the feedback by kind:
- **Design** ("more premium", "boring", "too much animation", "colors are off", "the hero") → the-designer's
  feedback iteration on its existing run (pass the feedback verbatim + run folder), then roll the
  updated DIRECTION.md out to every affected route.
- **Content, routes, functionality** ("wrong phone number", "missing careers page", "form doesn't
  submit") → fix here; never invent copy.

Build, quick-check the touched pages (step 6), add a line under "Iterations" in REDESIGN-BRIEF.md,
report, ask again. Never regress pages, content, functionality, SEO, accessibility or performance.
