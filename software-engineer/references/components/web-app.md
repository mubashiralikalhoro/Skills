# Component guide: Customer-facing web app / public website

## P0 — blocking
- What an **anonymous** visitor can do vs what requires an account. Is browsing public?
- The primary workflow's screens, entry point to outcome, and what each screen must show and do.
- Auth **behavior**: identifier (email, phone, social), verification, session lifetime, multi-device,
  password reset or OTP. Not the library.
- Are there **public SEO pages** (marketing, listings, content) or is this app-only behind login?
  This changes rendering requirements, not just routing.
- Does an existing site or domain already serve some of this? What must stay untouched?

## P1
- Navigation map and full screen inventory.
- Per screen: content, actions, forms (field, type, required, validation message), and the
  loading / empty / error / success states. Empty and error states are requirements, not polish.
- Listings: search, filters, sort, pagination style, default ordering.
- Responsive expectations: which breakpoints actually matter, mobile-web parity with the app.
- Supported browsers and minimum versions the user actually cares about.
- Localization, currency, timezone and date-format handling.
- What the user sees when the backend is unreachable or an operation times out.

## P2
- Accessibility target, analytics events, theming/dark mode, print views, email templates styling.

## Do not ask
Framework, styling approach, component library, hosting.
