# Component guide: Mobile app (customer / staff / driver)

## P0 — blocking
- Platforms: iOS, Android, or both — and which ships first. Minimum OS versions if known.
- Which actor uses it, and their primary workflow end to end.
- **Device capabilities required**: location (foreground vs background), camera, push, offline
  use, biometrics, bluetooth, file access. Background location and offline are architecture-level
  answers, not details.
- Auth behavior: identifier, verification (OTP?), session lifetime, multi-device, logout policy.
- Does the app work with no connectivity, and if so, what exactly still works?

## P1
- Screen inventory and navigation shape (tabs, stack, drawer).
- Push notification events, deep links, what happens when the app is killed vs backgrounded.
- Offline behavior and sync conflict resolution (last-write-wins? queue and replay?).
- Permission prompts: when each is requested and what happens if denied.
- Store requirements: account deletion path, privacy disclosures, payment policy compliance.
- Forced-update policy and minimum-supported-version behavior.

## P2
- Localization, accessibility, analytics, in-app rating prompts, tablet layouts.

## Do not ask
Native vs cross-platform framework — Stage 3.5, unless the user mandates it.
