# Technology Stack & Delivery Guide (Stage 3.5)

Runs after requirements are clarified. Purpose: turn a build-ready spec into a build-ready
**stack + deployment plan**, chosen *with* the user, never *for* them.

## Rules

- **Every layer gets: options → your recommendation + one-line reason → "Other / I'll specify".**
  Never present a single choice. Never decide silently.
- **Every recommendation traces to a requirement or constraint** listed in step 1 of Stage 3.5.
  "It's popular" is not a reason. "Waitlist promotion must reach the member within seconds →
  push + a realtime channel" is.
- **Skip layers the product does not need.** A CRUD admin panel with no media needs no object
  storage question.
- **Team skills the user *stated* are a valid reason. Things you merely found are not.**
  "Our two devs work in .NET and React" is a constraint you may recommend from. A repo you read,
  or a builder skill installed on the machine (e.g. `dotnet-builder`, `react-panel-builder`), is
  **one option among the alternatives** — name it as such, never as the driving constraint, and
  never before the user has approved it.
- **Team skill beats theoretical fit.** Ask what the team already ships in. A perfect stack the
  team cannot maintain is the wrong stack.
- **Pin versions.** Record the latest stable major the user agrees to, not "latest".
- **Unanswered = UNKNOWN.** Defer is allowed; silence is not. Deferred layer → open question P1
  with impact. A recommendation the user never confirmed is `A-xxx` pending, not a decision.

## Constraint checklist (derive first, show before recommending)

Offline use · realtime/live updates · background jobs & schedules · file/media handling ·
geo/maps/tracking · payments & payouts · multi-tenancy · expected load & peak bursts ·
data volume & retention · compliance (PII, payments, health, minors) · languages/regions ·
device/OS targets · team size & existing skills · deadline · budget · existing systems to
integrate · who operates it after launch.

## Layer option banks

Present the relevant ones. Mark your recommendation; always append **Other / I'll specify**.

| Layer | Common options | Pick it when |
|-------|----------------|--------------|
| **Mobile app** | React Native (Expo), Flutter, native Swift + Kotlin, PWA/responsive web, Capacitor wrapper | Expo: one JS team, standard UI, fast ship. Flutter: heavy custom UI, one team, both stores. Native: deep OS integration, background location, strict store performance. PWA: no store needed, cheapest. |
| **Web frontend** | Next.js, React + Vite, Nuxt/Vue, SvelteKit, Astro, server-rendered templates | Next.js: SEO/public pages, SSR. React+Vite: authenticated SPA. Astro: content-heavy marketing. |
| **Admin panel** | React + Vite + Tailwind (user's `react-panel-builder` template), Next.js, Refine, Filament/Django admin | Panel template: fastest for CRUD-heavy back-office. Framework admin: when backend is Laravel/Django and speed beats polish. |
| **Backend framework** | ASP.NET Core (user's `dotnet-builder`), NestJS, Express/Fastify, Django/FastAPI, Laravel, Spring Boot, Go (Echo/Fiber) | Match team skill first; then ecosystem fit (payments, jobs, realtime). |
| **Database** | PostgreSQL, MySQL/MariaDB, SQL Server, MongoDB, SQLite | Postgres: default for relational + JSON + geo (PostGIS). Mongo only when the data is genuinely document-shaped and joins are rare. |
| **Cache / sessions** | Redis, in-memory, none | Add only when a measured need exists (hot reads, rate limits, queues, sessions). |
| **Search** | Postgres full-text, Meilisearch, Typesense, Elasticsearch/OpenSearch, Algolia | Start with Postgres FTS unless the spec demands typo tolerance/facets at scale. |
| **File / object storage** | S3, Cloudflare R2, Azure Blob, Supabase Storage, local disk + backup | Any user uploads → object storage + signed URLs, never app-server disk in production. |
| **Authentication** | Own JWT (e.g. `dotnet-builder` AuthUser/JwtHandler), Auth0, Clerk, Supabase Auth, Firebase Auth, Keycloak | Own: full control, no vendor cost, more work (reset, MFA, sessions). Hosted: OTP/social/MFA out of the box, per-MAU cost. |
| **Realtime** | SignalR, native WebSocket, Pusher/Ably, Supabase Realtime, SSE, polling | Polling is a legitimate answer for low-frequency updates — say so instead of over-engineering. |
| **Background jobs / queue** | Hangfire, Quartz, BullMQ, Celery, Sidekiq, cloud queue (SQS/Service Bus), cron | Anything retried, scheduled, or slow (emails, payouts, reports, waitlist promotion). |
| **Push notifications** | FCM (+ APNs), OneSignal, Expo Push, native APNs/FCM direct | |
| **Email** | Resend, SendGrid, SES, Postmark, SMTP | Transactional vs marketing are different needs — ask which. |
| **SMS / OTP** | Twilio, Vonage, local aggregator, WhatsApp Business API | Local aggregators usually win on price/deliverability in-market. Ask about the market. |
| **Payments** | Stripe, PayPal, Adyen, local gateway/PSP, cash-on-delivery only | Payouts to third parties (marketplaces) need explicit split/payout support — check before choosing. |
| **Maps / geo** | Google Maps, Mapbox, OpenStreetMap + Leaflet, HERE | Distinguish display vs geocoding vs routing vs live tracking; pricing differs sharply. |
| **Analytics / product** | PostHog, Plausible, GA4, Mixpanel | |
| **Error tracking** | Sentry, Rollbar, Application Insights | Non-optional for anything with users. |

## Deployment & production plan (discuss every line)

| Topic | Decide |
|-------|--------|
| Environments | dev / staging / production — which exist, who accesses each, is staging data real or seeded |
| Hosting per component | VPS + Docker, Railway/Render/Fly, Vercel/Netlify, AWS (ECS/EC2/Amplify), Azure App Service, GCP, on-prem |
| Containerization | Docker? Compose vs orchestrated. Image registry |
| CI/CD | GitHub Actions / GitLab CI / other; what runs on PR vs on merge; who can deploy to prod; manual approval gate |
| Migrations | tool (EF Core, Prisma, Alembic, Flyway), applied automatically on deploy or manually, rollback approach |
| Backups | frequency, retention, where stored, **restore actually tested** — a backup never restored is not a backup |
| Secrets | where they live (cloud secret manager, CI secrets, .env on server), who rotates them, never in git |
| Domains & SSL | domains per environment, DNS owner, certificate issuance/renewal |
| Monitoring & alerting | uptime checks, metrics, who gets paged, on which channel |
| Logging | destination, retention, PII scrubbing |
| Error tracking | tool, release tagging, alert thresholds |
| Scaling plan | first bottleneck expected, vertical vs horizontal, what triggers action |
| Cost | rough monthly at launch and at 10× — flag anything surprising early |
| Mobile release | Apple + Google developer accounts (who owns them), review lead time, TestFlight/internal track, forced-update policy |
| Rollback | how a bad deploy is reverted, and how far the database can be rolled back |
| Seed / demo data | what production starts with; how staging gets realistic data |
| Launch checklist | named owner per item; go/no-go criteria |

## `stack.md` template

```markdown
# Technology Stack & Delivery Plan — <product>
Status: <approved by user YYYY-MM-DD | partial — n open decisions>

## Constraints driving these choices
- <constraint> → affects <layer>

## Stack
| Layer | Component | Choice | Version | Why (constraint) | Alternatives rejected | Decided by |
|-------|-----------|--------|---------|------------------|----------------------|------------|

## Deployment & production
| Topic | Decision | Owner | Notes |
|-------|----------|-------|-------|

## Open technology decisions
| ID | Priority | Question | Impact | Default if unanswered (A-xxx, pending) |

## Cost estimate (rough)
| Item | Monthly at launch | At 10× |
```
