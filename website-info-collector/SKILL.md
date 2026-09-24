---
name: website-info-collector
description: Crawl a whole website page by page with a real browser (agent-browser CLI or Playwright MCP) and save a structured Markdown picture of it into `.website-info-collector/` — every page's sections, headings, text, CTAs, links, images/media, forms, navigation, footer, SEO metadata and JSON-LD — so another agent can understand, recreate, migrate or redesign the site without revisiting it. Use when the user gives a URL and asks to crawl, scrape, collect, capture, map, inventory or "understand" a website, or to snapshot a site's content before a rebuild. Not for a single-page lookup or an SEO audit.
---

# Website Information Collector

Crawl with a browser, extract each page with one in-page snippet, queue same-site links,
never visit a page twice, write Markdown. No custom crawler code.

**Browser:** prefer `agent-browser` (Bash). Fall back to Playwright MCP
(`browser_navigate` + `browser_evaluate`) if it's unavailable.
**Extractor:** [references/extract.js](references/extract.js) — returns JSON with `meta`,
`headings`, `navs`, `footer`, `breadcrumbs`, `content` (ordered blocks), `links`, `srcs`,
`forms`, `jsonld`, `contact`. `$SKILL_DIR` = the folder holding this SKILL.md.

## 1. Setup

- Normalize start URL (`example.com` → `https://example.com/`). **Site** = its host, `www.` ignored.
- Limits: max **200 pages** unless user says otherwise. Ask before going past 500.
- Create `.website-info-collector/` (and `raw/tmp/`) in the current directory.
- Fetch `/robots.txt` (curl). Note `Disallow:` rules for `User-agent: *` — never crawl those.
- Seed the queue: start URL + every `<loc>` in `/sitemap.xml` (follow `<sitemapindex>` one level)
  and sitemaps listed in robots.txt.

## 2. Queue — no page repeats

Keep `.website-info-collector/queue.json`: `{ "queue": [], "seen": [], "done": {}, "failed": {} }`.
Update it after every page so the crawl can resume.

Before adding any URL, **normalize** it, then add only if not in `seen`:
- absolute; drop `#fragment`; lowercase host; drop trailing `/` (except root)
- drop query string, except pagination (`page`, `p`, `paged`)
- same site only; skip `mailto:`, `tel:`, `javascript:`
- skip files (`.pdf .jpg .png .svg .webp .zip .mp4 .css .js .xml …`) — record them as assets
- skip robots-disallowed paths, logout/cart/login-action URLs

Sources of new URLs on each page: every `links[].href` (header, footer, body, pagination) and
same-site `srcs[].src` that are pages (e.g. iframes pointing to internal pages).

## 3. Per-page loop

For each URL taken from `queue`:

```bash
agent-browser open "<url>"
agent-browser wait 1500                      # let JS/lazy content settle
agent-browser eval --stdin < "$SKILL_DIR/references/extract.js" \
  > .website-info-collector/raw/tmp/page-<session>.json
```

`<session>` is `main` for a single crawler, or the subagent's `--session` name when batching, so
parallel crawlers never overwrite each other's page JSON. Delete `raw/tmp/` when the crawl ends.

- Final `url` differs (redirect) → mark the requested URL done, normalize the final one; if
  already `seen`, skip writing.
- `status` ≥ 400 or navigation error → put in `failed` with reason, **continue**.
- `meta.canonical` points to another same-site page → treat as duplicate of it; queue canonical.
- `words` tiny and `content` empty → `agent-browser scroll down 3000`, wait, re-run eval once.
- Add new links to `queue`/`seen`, then write the page file (below).

Batch: for more than ~30 pages, split the queue into chunks and hand chunks to parallel
subagents (each with its own `--session <name>`), all sharing the same normalization rules
and dedupe against `seen`.

## 4. Page file

Path mirrors the URL: `/` → `pages/home.md`, `/services/web-dev` → `pages/services/web-dev.md`,
`/blog?page=2` → `pages/blog__page-2.md`. Lowercase; replace unsafe chars with `-`.

Write from the JSON, semantically — not a dump:

```markdown
# <H1 or title>
URL · Title · Meta description · Canonical · Page type (home/about/service/product/pricing/blog/article/docs/contact/legal/other)

## Sections
### <each H1/H2 in `content` starts a section; name it: Hero / Features / Pricing / FAQ / Testimonials / CTA / …>
Heading, paragraphs, lists, cards (repeated H3 + text), quotes, tables, code
**Actions:** [text](url) for every `action` block
Images inline: ![alt](src)

## Header / Navigation   (only on home, or if different from the site-wide one)
## Footer                 (same rule)
## Heading outline        (from `headings`, indented)
## Links                  internal | external tables
## Images & media         URL, alt, size, caption, where
## Forms                  per field: label, type, required, placeholder, options; submit text
## FAQs / Pricing / Testimonials / Contact   (only if present)
## SEO                    title length, description, canonical, robots, H1 count, missing alts, OG, Twitter
## Structured data        @types + key fields; raw JSON-LD → raw/json/<same path>.json
```

## 5. Site files (after queue is empty or limit hit)

| File | Contents |
|---|---|
| `README.md` | URL, date, pages done / failed / skipped, limits hit, robots-blocked URLs |
| `site.md` | What the site is, main sections, page tree, primary CTAs, contact, social, tech hints |
| `sitemap.md` | Nested page tree linking to `pages/*.md`; duplicates and redirects |
| `navigation.md` | Main nav (with dropdowns), footer groups, sidebars, breadcrumbs |
| `links.md` | Internal / external links: text, URL, source page; broken links |
| `assets.md` | Images, videos, embeds, PDFs/docs, fonts, icons (from `srcs` + file links) |
| `forms.md` | Every distinct form with fields and the pages it appears on |
| `metadata.md` | Site name, lang, favicon, robots.txt, OG/Twitter defaults, JSON-LD types, per-page title/description table |
| `errors.md` | Failed URLs with status and reason |

## Rules

- Read only. Never fill, click submit, log in, or accept cookie walls beyond closing them.
- One page at a time per session; ~1 s between pages. Don't hammer sites you don't own.
- Never re-open a URL already in `seen` / `done`. Resume from `queue.json` if interrupted.
- Don't print page JSON to chat; write files, then report counts + where things are.
- Finish with: pages written, failed/skipped and why, output path.
