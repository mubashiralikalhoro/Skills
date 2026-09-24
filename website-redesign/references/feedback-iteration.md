# Feedback & Iteration

Never answer feedback with "what exactly do you mean?". Interpret, route, implement, show.

## Route the feedback

| Kind | Examples | Who handles it |
|---|---|---|
| Design | "I don't like it", "more premium", "more futuristic", "homepage is boring", "animations are too much / feel cheap", "colors are off", "font feels off", "too dark", "doesn't feel like us", "the hero image", "the nav" | **the-designer** — its feedback iteration on the existing run (pass the feedback verbatim, the run folder and DIRECTION.md) |
| Content | "wrong phone number", "add the new service", "keep the old tagline" | this skill — edit `content/`, never invent copy |
| Routes / structure | "missing the careers page", "merge these two pages" | this skill — route map, redirects, nav data |
| Functionality | "form doesn't submit", "booking link broken" | this skill — implementation.md §6 |

Mixed feedback: split it and do both.

## Loop per feedback message

```
route the feedback → (design) the-designer iterates DIRECTION.md + key templates
→ roll the change out to every affected route → build → site QA on touched routes
→ deliver + ask again
```

Record each iteration under "Iterations" in `REDESIGN-BRIEF.md`: feedback, who handled it, what
changed, routes touched.

## Never regress

Each iteration keeps: all pages and routes · all real content · working functionality and
integrations · SEO metadata · responsive behavior · accessibility · reduced-motion support.
Verify with a build and site QA on affected routes before reporting. End with
**"What would you like me to improve?"**
