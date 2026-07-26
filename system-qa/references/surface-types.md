# Surface Types & Tooling (black-box)

No code, no manifests — the surface type comes from **what the user hands you** plus what the
live system exposes. Identify every surface in scope; a system is often a mix (website +
mobile app + the API behind both).

## Identify the surface(s)

| User gives you | Surface | Also check |
|---|---|---|
| Website URL | Web UI | Open devtools/network during exploration — the XHR/fetch calls reveal the API surface; responsive mode reveals mobile-web |
| App store link / APK / IPA / app installed on device | Mobile app | Does the user also want the same flows on web? Network capture (if permitted) reveals API |
| API base URL + docs (OpenAPI/Postman) | API | Docs are facts for system-info.md `[user]`; live responses are `[observed]` |
| Desktop installer / Electron app | Desktop | Web-like automation may work (Electron); otherwise OS-level automation |

Never invent a surface: if the user gave only a website, the API observed in devtools is
recorded in system-info.md but tested **only** if the user puts it in scope.

## Tooling per surface

| Surface | Tooling order | Evidence | Notes |
|---|---|---|---|
| **Web UI** | browser MCP → Playwright → Chrome automation → any real browser automation | screenshots, console logs, network captures | If web is in scope and no browser automation exists, ask the user to install one. Never claim UI results without a real browser. |
| **Mobile app** | mobile MCP (device/emulator) → Appium → physical device with screen recording (user-assisted) | device screenshots/recordings, crash behavior observed | No device/emulator access → those cases are `BLOCKED`, or run **user-assisted**: user executes on their phone following your exact steps and sends screenshots — mark such results `PASS (user-executed)`. |
| **API** | curl / HTTP client | saved request + response (headers + body) + status codes | Only endpoints documented by user or observed live. Respect rate limits from system-info.md. |
| **Notifications (email/SMS/push)** | test inbox / user's own device per interview Round 3 | screenshot/forward of received message | If no verification hook exists, case is `NOT TESTABLE` — say so, don't assume delivery. |
| **Desktop/Electron** | agent-browser (Electron) → OS automation | window screenshots | |

## Black-box constraints (all surfaces)

- **No DB access, no logs, no server shell.** Verification is limited to what the outside
  shows: UI state, API responses, notifications, admin/back-office views the user granted.
  A write is verified by reading it back through an outside surface — if no surface can read
  it back, the case is `NOT TESTABLE (no verification hook)`.
- **Cross-browser / cross-device matters more** than in white-box QA: with no code to inspect,
  device/browser coverage from system-info.md §4 is a first-class test dimension.
- **Network observation is evidence, not scope** — devtools captures explain failures
  (500 vs validation error) and belong in bug reports, but don't turn an unscoped API into a
  test target.
- **Safe-mode mapping**: prod-unsafe = any state mutation — signups, orders, uploads, messages
  to real people, mass requests. All `SKIPPED (prod-safe)` unless the user explicitly allows a
  specific action ("one test order is fine, we refund it").
