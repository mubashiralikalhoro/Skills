# <Brand> — Website Redesign

## Original website
- URL: <original URL>
- Snapshot: `.website-info-collector/` (crawled <date>, <n> pages) — source of truth for original content
- Brief: `.website-info-collector/REDESIGN-BRIEF.md`
- Design direction: `.the-designer/<run>/DIRECTION.md` (or `.the-designer-team/<run>/` when the team version was used)

## Redesign direction
<Brand concept from DIRECTION.md>.
<2–4 sentences on why this direction fits the brand, from DIRECTION.md's decision section.>

## Framework
<Framework + version>, <TypeScript>, <styling>, <animation libraries>. Rendering: <SSG/SSR/ISR>.

## Design system
- Typography: <display font> / <body font>; scale Display → Caption
- Colors: <role → value table or link to tokens file>
- Spacing: <scale>
- Grid: <max width, columns, gutters>
- Radius / elevation: <rules>
- Tokens live in `<path>`

## Routes
| Route | Source (original URL) | Notes |
|---|---|---|

Redirects: <list or "none">. Intentionally not rebuilt: <list + reason>.

## Architecture
<Folder overview: layout, ui, motion, sections, content, lib.>

## Animation system
<Libraries, motion tokens, key interactions, reduced-motion behavior.>

## Forms & integrations
| Form / integration | Status (connected to <endpoint> / UI only — TODO connect) |
|---|---|

## Installation
```bash
<install command>
```

## Development
```bash
<dev command>
```

## Production build
```bash
<build + start commands>
```

## Assumptions
- <every assumption made during the redesign>
