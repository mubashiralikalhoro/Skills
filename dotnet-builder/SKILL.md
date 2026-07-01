---
name: dotnet-builder
description: >-
  Scaffold and modify ASP.NET Core (.NET) Web API backends following a fixed,
  proven layered structure — Src/{Controllers,Services,Middlewares,Settings,Utils,Models},
  a generic Response envelope, throw-based ApiException error handling, JWT auth with
  AuthUser/JwtHandler, EF Core + PostgreSQL entities/DbContext, and DTOs with static
  FromEntity mappers. Use for ANY .NET backend task: creating a new API project,
  adding a controller/service/entity/DTO/migration/middleware, or fixing/refactoring
  existing code. Triggers on requests mentioning .NET, dotnet, ASP.NET Core, C# Web API,
  EF Core, a new backend/API project, or adding/fixing endpoints, services, entities,
  auth, or migrations in a .NET backend.
---

# dotnet-builder

Build and edit ASP.NET Core Web API backends in one consistent structure. This skill defines the layout, conventions, and code patterns to follow so every .NET project looks the same.

## Golden rules

- **Always follow the structure** in `references/structure.md`. Read it before writing any code.
- **Never hardcode package versions.** Use `dotnet add package <name>` and let it resolve the latest compatible version. In `.csproj`, `<PackageReference>` without `Version` is fine.
- **Match, don't fight, an existing project.** When editing an existing codebase, mirror its current naming/namespaces/patterns even if they differ slightly from the reference; extend in the same style.

## Workflow

### 1. Read the reference
Open `references/structure.md`. It is the full blueprint: folder tree, namespace mapping, `Program.cs` pipeline order, response envelope, error handling, controllers, services, entities, `AppDbContext`, DTOs, auth, constants, settings, caching, config, request lifecycle, and a scaffold checklist.

### 2. Determine the task type

**New project** → work through the scaffold checklist at the bottom of `references/structure.md`:
1. `dotnet new webapi` + `global.json` + `.csproj` (Nullable, ImplicitUsings, `RootNamespace`).
2. `dotnet add package` for EF Core (Npgsql), JWT bearer, EF Design — no version pins.
3. Create the `Src/` tree + `Models/{Entities,Api,Api/Dtos}`.
4. Add `Response<T>`, `PagedResult<T>`, `ExceptionHandlerMiddleware`/`ApiException`, `CustomAuthResultHandler`, `AppDbContext`, `JwtHandler`, `AuthUser`, `Constants`, settings POCOs.
5. Wire `Program.cs` in the exact pipeline order.
6. Add entities → services → DTOs → controllers per domain.
7. `dotnet ef migrations add Init` → `dotnet ef database update`.

**Adding to an existing project** (new endpoint, feature, entity) → follow the layer order:
Entity (`Src/Models/Entities/`) → register `DbSet` + config in `AppDbContext` → migration → Service (`Src/Services/`, register in `Program.cs`) → DTOs (`Src/Models/Api/Dtos/` with `FromEntity`) → Controller (`Src/Controllers/`, thin, returns `Response<T>`).

**Fixing / refactoring** → keep the change inside the correct layer:
- HTTP/routing/binding issue → controller only.
- Business logic / data access → service.
- Cross-cutting (errors, auth, gates) → middleware.
- Schema change → entity + `AppDbContext` + a **new migration** (never edit old migrations; seed changes also need a new migration).

### 3. Apply the conventions (non-negotiable)
- Controllers are **thin**; all logic in **services**. Both use primary-constructor injection.
- **Throw** `ApiException.Create(status, msg)` for errors — never return ad-hoc error shapes. Middleware converts to the envelope.
- Every response wrapped in `Response<T>.CreateSuccess(...)`; paginated lists use `PagedResult<T>`.
- Async everywhere, `...Async` method suffix. `Task<IActionResult>` actions.
- Map entity → DTO at the boundary via static `FromEntity`; **never return entities**.
- Enums persisted as strings (`HasConversion<string>()`); `CreatedAt` via `HasDefaultValueSql("NOW()")`; set `UpdatedAt = DateTime.UtcNow` on writes.
- File-scoped namespaces; route prefix `v1/api/<resource>`; admin controllers in `Controllers/Admin/` gated with `[Authorize(Roles = ...)]`.

### 4. Verify
- `dotnet build` clean.
- If entities/DbContext/seeds changed: `dotnet ef migrations add <Name>` then `dotnet ef database update`.
- New services registered in `Program.cs`. New controllers under the right route prefix and namespace.

## Reference

`references/structure.md` — complete architecture blueprint with copy-ready code for every layer. Consult it for exact patterns; do not reinvent them.
