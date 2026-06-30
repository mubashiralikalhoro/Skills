# System-Type Detection & Adaptation

The skill is not web-only. Before planning or executing, **detect the system type(s)** and
adapt strategy, tooling, evidence, and coverage. Most real systems are a *mix* (e.g. a web UI
+ REST API + Postgres + a nightly ETL job) — detect every part in scope and apply each row.

This guide refines (does not override) the Hard rules: scope discipline, prod safe-mode, and
evidence-or-it-didn't-happen apply to **every** system type. "Evidence" just takes a
different shape per type (a screenshot for UI, a captured exit code + stderr for CLI).

## Detect the system type(s)

Cheap signals, in rough order — stop once the in-scope surfaces are identified:

1. **Manifests / build files** — `package.json` (scripts, `bin`, `main`, `electron`, `react-native`),
   `pyproject.toml`/`setup.py` (`console_scripts`, library), `go.mod`, `Cargo.toml` (`[[bin]]` vs `[lib]`),
   `pom.xml`, `*.csproj`, `Dockerfile`, `docker-compose.yml`, `platformio.ini`/`*.ino` (embedded).
2. **Interface contracts** — `openapi/swagger` (REST), `*.proto` (gRPC), `*.graphql`/schema (GraphQL),
   WebSocket/`socket.io` handlers, queue bindings (`@*.listener`, Kafka/RabbitMQ/SQS consumers).
3. **Entry points** — `if __name__=='__main__'`, `argparse`/`click`/`cobra`/`commander` (CLI);
   `main()` serving HTTP (API); `cron`/scheduler/`@Scheduled`/Airflow DAG (batch/scheduled);
   `BrowserWindow`/`app.whenReady` (Electron); exported package surface only (library/SDK).
4. **Run/UI evidence** — a served HTML/SPA route (web), a published package (library), a device
   target (mobile/embedded), no UI at all (API/CLI/job/queue).
5. **Ask** only if signals are ambiguous — never assume "web app" by default.

Record the detected type(s) in `TEST_SUMMARY.md` and let it drive Phase 1 Discovery and Tool selection.

## Adaptation matrix

| System type | Detect by | Primary test surfaces | Tooling | Type-specific test classes | Evidence | N/A generic phases |
|---|---|---|---|---|---|---|
| **Web UI** | served HTML/SPA routes, `react`/`vue`/`svelte` | rendered DOM, forms, auth flows, responsiveness, console/network | browser MCP → Playwright → Chrome → Puppeteer → Selenium | rendering, client validation, a11y, XSS reflected in DOM, broken links, state across nav | screenshots, console logs, network HARs | — |
| **REST API** | OpenAPI, HTTP routes, `main()` serving HTTP | each endpoint × method, status, schema, headers | curl / HTTP client / REST MCP | status codes, schema/contract conformance, authn/authz per route, content negotiation, pagination, rate-limit, idempotency of PUT/DELETE | saved request+response (headers+body), status codes | UI rendering, a11y |
| **GraphQL** | `*.graphql`, `/graphql`, Apollo | queries, mutations, subscriptions, schema | curl/GraphQL client, introspection | query depth/complexity limits, field-level authz, N+1, partial errors in `errors[]`, introspection-disabled in prod, persisted queries | query + JSON response, error array | REST-status semantics, UI |
| **gRPC** | `*.proto`, gRPC server | each RPC (unary/stream) | `grpcurl`, generated client, `grpc_cli` | proto contract, status codes (`OK`/`INVALID_ARGUMENT`/…), deadlines, streaming back-pressure, metadata/auth, message-size limits, backward-compat of proto | `grpcurl` invocation + response, status code | UI, REST verbs |
| **WebSocket / realtime** | `ws`/`socket.io`, upgrade handlers | connect, message frames, rooms/topics | `wscat`, Playwright (in-page), socket client | handshake/upgrade, auth-on-connect, message ordering, reconnect/resume, heartbeat/timeout, broadcast isolation, backpressure | captured frame transcripts, timing logs | static page rendering |
| **Mobile (iOS/Android)** | `react-native`, `flutter`, `*.xcodeproj`, `build.gradle`, APK/IPA | screens, gestures, permissions, lifecycle | Mobile/Appium/Emulator/Simulator MCP | install/launch/permissions, rotation, background/resume, offline mode, deep links, push, crash logs, low-memory | device screenshots/recordings, crash logs | desktop-browser DOM |
| **CLI tool** | `bin` field, `argparse`/`click`/`cobra`, `console_scripts` | argv parsing, stdio, exit codes | terminal: run binary, capture `$?`, stdout, stderr | **exit codes** (0 vs non-zero per failure), **stdout/stderr separation**, flag/arg parsing & `--help`, config precedence (flag > env > file > default), stdin/pipe handling, `--version`, signal handling (SIGINT/SIGTERM), idempotency & re-run safety, output formats (`--json`), non-TTY/quiet mode | captured command + exit code + stdout + stderr (verbatim) | UI, DOM, a11y |
| **Library / SDK** | package `main`/exports, no entry point, public API | exported functions/classes, types, errors | unit harness in host lang (pytest/jest/go test), REPL, type-checker | public API contract, return/throw semantics, input validation, immutability/side-effects, thread-safety, error types, semver/back-compat, docs-vs-behavior, dependency surface | test run output, assertion logs, type-check output | UI, network, DB (unless lib does I/O) |
| **Desktop / Electron** | `electron`, `tauri`, `BrowserWindow`, `*.app`/`.exe` | windows, IPC, native menus, file/OS access | agent-browser (Electron), Playwright-electron, OS automation | window lifecycle, main↔renderer IPC, auto-update, file dialogs, deep links/protocol handlers, offline, native menu/tray, multi-window state | window screenshots, IPC/main-process logs | server-side DB unless app embeds one |
| **Data pipeline / ETL** | Airflow/dbt/Spark, batch scripts, source→sink | input contract, transforms, output, idempotency | run job on **sample/fixture** data; query source+sink; row counts | schema validation in/out, row-count reconciliation, dedup, null/type handling, transform correctness vs spec, idempotent re-run, late/out-of-order data, partial-failure recovery, watermark/incremental logic | input vs output samples, row counts, checksums, run logs | UI; never run against prod sink in safe-mode |
| **Background / scheduled job** | cron, `@Scheduled`, worker loop | trigger, work performed, schedule | trigger manually; inspect side-effects + logs | fires on schedule, does correct work, **idempotency**, overlap/concurrent-run guard, missed-run/catch-up, timeout & retry, poison handling, observability/alerting | trigger record, before/after side-effect state, logs | UI; safe-mode forbids triggering prod jobs |
| **Message queue / event-driven** | Kafka/RabbitMQ/SQS/NATS consumers, `*.listener` | produce→consume, topics, DLQ | publish test message to **test** broker; assert consumer effect | at-least/at-most/exactly-once semantics, ordering/partitioning, **idempotent consumers**, DLQ routing, redelivery/retry, poison messages, schema-registry compat, consumer-lag/backpressure | produced + consumed payloads, offsets, DLQ contents, lag metrics | UI; safe-mode forbids publishing to prod topics |
| **Embedded / IoT** | `platformio.ini`, `*.ino`, RTOS, HAL, firmware | firmware behavior, GPIO/peripherals, protocols | emulator (QEMU/Renode), HIL rig, serial console, logic analyzer | boot/init, peripheral I/O, timing/real-time constraints, power/sleep modes, watchdog/reset recovery, OTA update & rollback, comms protocol (I2C/SPI/UART/BLE), memory/flash limits | serial logs, scope/analyzer captures, photos of device state | browser tooling; usually requires hardware/emulator |

## Cross-cutting

- **Pick tools from the matched row, never reflexively reach for a browser.** For a CLI, library,
  API-only, job, or queue system with no UI, a browser MCP is the *wrong* tool — do not ask the
  user to install one. Asking to install automation tooling is correct only for the type whose
  primary surface needs it (browser→Web/Electron, device→Mobile, broker/emulator→queue/embedded).
- **Mixed systems**: apply one row per in-scope surface; integration cases live at the seams
  (e.g. API write → queue event → consumer → DB row → job picks it up).
- **Generic coverage still applies**: positive/negative/edge/security/regression from
  test-planning.md map onto every type — only the *surface and evidence* change.
- **Safe-mode mapping**: prod-unsafe means *any* state mutation for the matched type — publishing
  to a prod topic, triggering a prod job, writing to a prod sink, or running firmware that drives
  real actuators are all `SKIPPED (prod-safe)`, exactly like creating a test order via UI.
