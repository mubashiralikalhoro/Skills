# Stack detection and hotspots

## Detect

Look at manifests and entry points, not a single file. A repo is often several stacks at once.

| Signal | Stack |
|---|---|
| `package.json` (check `dependencies` for the framework), `tsconfig.json`, `deno.json`, `bun.lockb` | JavaScript / TypeScript (Node, Deno, Bun; React, Next, Vue, Nuxt, Svelte, Angular, Express, Nest, Fastify…) |
| `pyproject.toml`, `requirements*.txt`, `setup.py`, `Pipfile`, `manage.py` | Python (Django, Flask, FastAPI, Celery, data/ML) |
| `go.mod` | Go |
| `Cargo.toml` | Rust |
| `pom.xml`, `build.gradle(.kts)` | Java / Kotlin (Spring, Android) |
| `*.csproj`, `*.sln`, `global.json` | C# / .NET |
| `composer.json`, `artisan` | PHP (Laravel, Symfony, WordPress) |
| `Gemfile`, `config/routes.rb` | Ruby (Rails) |
| `pubspec.yaml` | Dart / Flutter |
| `Package.swift`, `*.xcodeproj`, `Podfile` | Swift / iOS |
| `CMakeLists.txt`, `Makefile`, `*.c`/`*.cpp`/`*.h` | C / C++ (systems, embedded) |
| `mix.exs` | Elixir |
| `*.sol`, `hardhat.config.*`, `foundry.toml` | Solidity smart contracts |
| `*.tf`, `Pulumi.*`, `cdk.json`, `serverless.yml`, `template.yaml` | Infrastructure as code |
| `Dockerfile`, `docker-compose*.yml`, `k8s/`, `helm/`, `.github/workflows/`, `.gitlab-ci.yml` | Containers, orchestration, CI/CD |
| `*.ipynb`, `dags/`, `dbt_project.yml` | Notebooks, pipelines, analytics |
| `schema.prisma`, `migrations/`, `*.sql`, `alembic/`, `db/schema.rb` | Database schema |

## Hotspots by stack

Extra traps to check on top of `checklist.md`. Use only the rows for stacks that are present.

**JavaScript / TypeScript**
- Unawaited promises, `async` callbacks in `forEach`/`map` without `Promise.all`, unhandled
  rejections, `catch` that returns `undefined` silently.
- Prototype pollution via deep merge of user JSON; `eval`/`new Function`; regex DoS.
- `any`, `as` casts, `!` non-null assertions, `@ts-ignore`; `strict` off in `tsconfig`.
- React/Vue: missing effect cleanup, wrong dependency arrays, keys by index, state in refs,
  secrets in `NEXT_PUBLIC_`/`VITE_` env vars, server actions without auth checks.
- Node: sync fs/crypto on request path, event emitters without error handlers, unbounded body size.

**Python**
- Mutable default arguments; bare `except:`; `except Exception: pass`.
- `pickle`/`yaml.load`/`eval`/`subprocess(..., shell=True)` on untrusted input; f-strings in SQL.
- Django: `raw()`/`extra()`, missing `@login_required`/permission classes, `DEBUG=True`,
  `ALLOWED_HOSTS=['*']`, N+1 without `select_related`/`prefetch_related`.
- FastAPI/Flask: blocking calls in `async def`, missing dependency-injected auth, no response
  model (leaking fields).
- Celery: tasks not idempotent, no `acks_late`/retry policy thought through, large args.

**Go**
- Ignored `err` values; `defer` inside loops; goroutine leaks (no cancel, blocked channels).
- Data races on maps/slices (no mutex); missing `context` timeouts; `http.Client` with no timeout.
- Nil pointer/nil map writes; closing channels twice; loop-variable capture (pre-1.22).

**Rust**
- `unwrap`/`expect`/indexing that can panic on input; `unsafe` blocks and their invariants.
- Blocking in async runtimes; `Mutex` held across `.await`; unbounded channels.

**Java / Kotlin**
- Unclosed resources (no try-with-resources/`use`); `@Transactional` on private/self-called
  methods; lazy-loading outside a session; thread-unsafe singletons/static state.
- Spring Security matchers ordering, `permitAll` too broad; Jackson default typing.
- Android: leaked `Context`, work on main thread, exported components, insecure WebView settings.

**C# / .NET**
- `async void`, `.Result`/`.Wait()` deadlocks, `HttpClient` created per call, `IDisposable` not
  disposed, missing `[Authorize]`, EF Core N+1 or client-side evaluation, over-posting.

**PHP**
- String-built SQL, `unserialize`, `include` with user input, missing CSRF tokens, mass
  assignment (`$fillable`/`$guarded`), `APP_DEBUG=true`, WordPress nonces and capability checks.

**Ruby / Rails**
- `params.permit!`, string interpolation in `where`, `html_safe`/`raw`, missing
  `before_action` auth, callbacks with side effects, N+1 without `includes`.

**Mobile (Swift, Kotlin, Flutter, React Native)**
- Secrets/API keys shipped in the app binary; tokens in plain storage instead of Keychain/Keystore.
- Main-thread network/disk work; retain cycles; lifecycle (background/foreground) bugs.
- Deep links and intents not validated; certificate pinning claims vs reality; offline/sync conflicts.

**C / C++ / embedded**
- Buffer overflows, unchecked `memcpy`/`strcpy`/`sprintf`, format strings, integer overflow in
  size math, use-after-free, double free, uninitialised memory, missing bounds checks.
- ISR races and `volatile`, stack size, watchdog handling, blocking in interrupt context.

**Solidity / smart contracts**
- Reentrancy, missing access control on privileged functions, unchecked external calls, integer
  math assumptions, oracle manipulation, front-running, `tx.origin` auth, upgradeable proxy storage
  collisions, unbounded loops (gas DoS).

**Data / ML pipelines and notebooks**
- Non-idempotent jobs (reruns duplicate data), no schema validation on ingest, silent row drops,
  train/test leakage, hard-coded paths and credentials in notebooks, results that depend on
  execution order of cells.

**Infrastructure as code / containers / CI**
- Public storage, `0.0.0.0/0` ingress, wildcard IAM actions/resources, no encryption, no state
  locking, secrets in `tfvars`/plain env, root containers, unpinned images and actions,
  `pull_request_target` with checkout of untrusted code.

**Database schema (any engine)**
- Missing indexes on foreign keys, missing unique constraints backing "unique" business rules,
  wrong types (money as float, timestamps without timezone), nullable columns that should not be.
