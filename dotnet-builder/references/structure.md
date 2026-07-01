# .NET Backend Structure Blueprint

Architecture spec for ASP.NET Core Web API projects. Follow these conventions exactly — for a new project scaffold the whole tree; for an existing project match whatever already exists here and extend in the same style.

Replace `dotnet_myapp_backend` / `dotnet-myapp-backend` with the actual project name everywhere. Do not pin package versions — install the latest stable compatible with the target SDK.

---

## 1. Stack

- **ASP.NET Core** Web API (`Microsoft.NET.Sdk.Web`), C# with `Nullable` + `ImplicitUsings` enabled.
- **PostgreSQL** via EF Core (`Npgsql.EntityFrameworkCore.PostgreSQL`), code-first migrations.
- **JWT bearer** auth (`Microsoft.AspNetCore.Authentication.JwtBearer`).
- **Redis** cache (`StackExchange.Redis`) — optional, degrades gracefully when down.
- Optional integrations added per-project (S3, email, AI, etc.).
- `global.json` pins the SDK with `rollForward: latestMajor`.

### `.csproj`

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net<VERSION>.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <RootNamespace>dotnet_myapp_backend</RootNamespace>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design">
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
      <PrivateAssets>all</PrivateAssets>
    </PackageReference>
    <PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" />
    <PackageReference Include="System.IdentityModel.Tokens.Jwt" />
    <PackageReference Include="Microsoft.IdentityModel.Tokens" />
    <!-- add integration packages as needed -->
  </ItemGroup>
  <ItemGroup>
    <Folder Include="Migrations\" />
  </ItemGroup>
</Project>
```

Let `dotnet add package <name>` resolve versions. Never hardcode a version unless a specific one is required.

---

## 2. Folder structure

```
ProjectRoot/
├── global.json                        # SDK pin, rollForward latestMajor
├── <project>.sln
├── <project>/
│   ├── Program.cs                     # composition root: DI, auth, middleware pipeline
│   ├── appsettings.json               # dev config (conn string, JWT, integrations)
│   ├── appsettings.Staging.json       # env override (ASPNETCORE_ENVIRONMENT=Staging)
│   ├── <project>.csproj
│   ├── Properties/launchSettings.json
│   ├── Migrations/                     # EF Core generated — do not hand-edit
│   └── Src/
│       ├── Controllers/                # thin HTTP layer, route prefix v1/api/...
│       │   └── Admin/                  # admin-only controllers, role-gated
│       ├── Services/                   # business logic, one per domain concern
│       ├── Middlewares/                # exception handler, auth result handler, filter attrs
│       ├── Settings/                   # POCO options bound from config sections
│       ├── Utils/                      # AppDbContext, AuthUser, JwtHandler, Constants, Helpers
│       └── Models/
│           ├── Entities/               # EF entities (one file per table)
│           └── Api/
│               ├── Response.cs         # response envelope
│               ├── PagedResult.cs      # pagination envelope
│               └── Dtos/               # request + response DTOs (grouped by domain)
```

### Namespace convention

`RootNamespace` = `dotnet_myapp_backend`. Folders map to sub-namespaces (folder `Src/` is stripped):

| Folder | Namespace |
|---|---|
| `Src/Controllers/` | `dotnet_myapp_backend.Controllers` |
| `Src/Controllers/Admin/` | `dotnet_myapp_backend.Controllers.Admin` |
| `Src/Services/` | `dotnet_myapp_backend.Services` |
| `Src/Middlewares/` | `dotnet_myapp_backend.Middlewares` |
| `Src/Settings/` | `dotnet_myapp_backend.Settings` |
| `Src/Utils/` | `dotnet_myapp_backend.Utils` |
| `Src/Models/Entities/` | `dotnet_myapp_backend.Models.Entities` |
| `Src/Models/Api/` | `dotnet_myapp_backend.Models.Api` |
| `Src/Models/Api/Dtos/` | `dotnet_myapp_backend.Models.Api.Dtos` |

Use **file-scoped namespaces** (`namespace X;`) everywhere.

---

## 3. Program.cs — composition root

Order matters. Full pipeline pattern:

```csharp
var builder = WebApplication.CreateBuilder(args);

// Custom 401/403 body shaping
builder.Services.AddSingleton<IAuthorizationMiddlewareResultHandler, CustomAuthResultHandler>();

// CORS — AllowAll for dev
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

// EF Core / Postgres
builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT bearer
var jwtSettings = builder.Configuration.GetSection("JWTSettings");
var key = Encoding.ASCII.GetBytes(jwtSettings["securityKey"]!);
builder.Services.AddAuthentication(opt =>
{
    opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true, ValidateAudience = true, ValidateLifetime = true,
        ValidIssuer = jwtSettings["validIssuer"],
        ValidAudience = jwtSettings["validAudience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

// DI registrations — lifetimes below
builder.Services.AddScoped<PasswordHasher<User>>();
builder.Services.AddScoped<JwtHandler>();
builder.Services.AddScoped<AuthUser>();
builder.Services.AddScoped<UserService>();          // ...one per service
builder.Services.AddSingleton<EmailService>();       // stateless / in-memory state → singleton

// Options binding
builder.Services.Configure<CacheSettings>(builder.Configuration.GetSection("Cache"));

// Options-as-singleton pattern (bind then resolve .Value as the singleton)
builder.Services.Configure<SomeIntegrationSettings>(builder.Configuration.GetSection("SomeIntegration"));
builder.Services.AddSingleton<SomeIntegrationSettings>(sp =>
    sp.GetRequiredService<IOptions<SomeIntegrationSettings>>().Value);

builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor();           // required by AuthUser

var app = builder.Build();
app.UseCors("AllowAll");
app.UseMiddleware<ExceptionHandlerMiddleware>();     // BEFORE auth, so thrown ApiExceptions become JSON
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();                                 // if rate limiting used
app.MapControllers();
app.MapGet("/v1/api/health", () => new { Status = "Running", Message = "Backend is up!" });
app.Run();
```

### DI lifetime rules

| Lifetime | When |
|---|---|
| `AddScoped` | Anything touching `AppDbContext` or per-request state (services, `AuthUser`, `JwtHandler`, `PasswordHasher`). Default choice. |
| `AddSingleton` | Stateless helpers, in-memory state stores, config-derived singletons, Redis multiplexer. |
| `AddHttpClient<T>` | Typed HTTP clients to external services; configure `BaseAddress`/`Timeout` from bound options. |

**Options-as-singleton**: for a config POCO to inject directly (not wrapped in `IOptions<>`), `Configure<T>` then `AddSingleton<T>(sp => sp.GetRequiredService<IOptions<T>>().Value)`.

---

## 4. Response envelope

Every controller returns `Response<T>`. Client parses `{ data, message, success, statusCode }`.

```csharp
// Src/Models/Api/Response.cs
namespace dotnet_myapp_backend.Models.Api;

public class Response<T>
{
    public T? Data { get; set; }
    public string? Message { get; set; }
    public bool Success { get; set; }
    public int StatusCode { get; set; }

    public static Response<T> CreateSuccess(T data, string? message = null, int statusCode = 200)
        => new() { Data = data, Message = message, Success = true, StatusCode = statusCode };
}
```

```csharp
// Src/Models/Api/PagedResult.cs
public class PagedResult<T>
{
    public required List<T> Items { get; set; }
    public required int Page { get; set; }
    public required int PageSize { get; set; }
    public required int Total { get; set; }
    public required bool HasMore { get; set; }
}
```

Usage in controllers:
```csharp
return Ok(Response<List<CourseDto>>.CreateSuccess(data));
return StatusCode(201, Response<AuthResponseDto>.CreateSuccess(data, "Created.", 201));
```

---

## 5. Error handling

**Throw, don't return errors.** Business code throws `ApiException.Create(status, msg)`; middleware converts to the envelope.

```csharp
// Src/Middlewares/CustomExceptionHandler.cs
public class ExceptionHandlerMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try { await next(context); }
        catch (Exception ex)
        {
            var statusCode = ex is ApiException apiEx ? apiEx.StatusCode : 500;
            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/json";
            var body = new Response<object> { StatusCode = statusCode, Message = ex.Message, Success = false };
            var opts = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            await context.Response.WriteAsync(JsonSerializer.Serialize(body, opts));
        }
    }
}

public class ApiException(string message) : Exception(message)
{
    public int StatusCode { get; set; }
    public static ApiException Create(int statusCode, string message)
        => new(message) { StatusCode = statusCode };
}
```

Throw anywhere in services/controllers:
```csharp
if (course == null) throw ApiException.Create(404, "Course not found.");
throw ApiException.Create(401, "Invalid email or password.");
```

**Auth failures** (401/403 from the auth pipeline, not thrown) get shaped by `CustomAuthResultHandler : IAuthorizationMiddlewareResultHandler` — checks `authorizeResult.Forbidden` / `.Challenged` and writes the same `Response<object>` envelope (camelCase). Same JSON shape as thrown errors, so the client has one parser.

---

## 6. Controllers

Thin. Constructor-inject services (primary constructor syntax). No business logic — delegate to services. Convention: private services named `_service`.

```csharp
[ApiController]
[Authorize]
[Route("v1/api/courses")]
public class CourseController(
    DomainService _domainService,
    AuthUser _authUser,
    CacheService _cache) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetCoursesAsync()
    {
        var domainId = _authUser.GetDomainId();
        var data = await _domainService.GetCoursesByDomainAsync(domainId);
        return Ok(Response<List<CourseDto>>.CreateSuccess(data.Select(CourseDto.FromEntity).ToList()));
    }

    [HttpGet("{courseId:int}/chapters")]
    public async Task<IActionResult> GetChaptersAsync(int courseId) { /* ... */ }
}
```

Rules:
- Return `Task<IActionResult>`, async, method names end `Async`.
- Route prefix `v1/api/<resource>`. Route constraints inline: `{id:int}`.
- `[Authorize]` at class level; `[AllowAnonymous]` per-method for public endpoints (or omit `[Authorize]` on public controllers like auth).
- Bind bodies with `[FromBody] SomeDto dto`. Bind **all list/filter params as one query object**: `[FromQuery] <Resource>PaginatedQuery query` — never a long list of loose `[FromQuery]` scalars. See "Query params & pagination" below.
- Map entities → DTOs at the boundary. Never return entities.

### Query params & pagination (non-negotiable)

One base `PaginationQuery` class holds the shared page/search fields. Each resource that needs filters **extends it** and adds its own optional filter props. Controllers bind the whole thing with a single `[FromQuery] <Resource>PaginatedQuery query` param; the service applies search + each non-null filter, then paginates into the envelope.

```csharp
// Src/Models/Api/Dtos/RequestDtos.cs
public class PaginationQuery
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Search { get; set; } = "";
}

// Extend per resource — add only that resource's filters
public class EntityPaginatedQuery : PaginationQuery
{
    public int? Status { get; set; }
    public int? OwnerId { get; set; }
    public int? CategoryId { get; set; }
}

public class PaginatedResponse<T>
{
    public List<T> Items { get; set; }
    public int Page { get; set; }
    public int TotalCount { get; set; }
}
```

Controller — bind the query object, delegate, wrap:
```csharp
[HttpGet]
public async Task<ActionResult<Response<PaginatedResponse<EntityDto>>>> GetAll(
    [FromQuery] EntityPaginatedQuery query)
    => Ok(Response<PaginatedResponse<EntityDto>>.CreateSuccess(await _entityService.GetAllAsync(query)));
```

Service — build `IQueryable`, apply search, then **each filter only when non-null**, count, page:
```csharp
public async Task<PaginatedResponse<EntityDto>> GetAllAsync(EntityPaginatedQuery query)
{
    var queryable = dbContext.Entities.OrderBy(e => e.Id).AsQueryable();

    var search = query.Search?.ToLower();
    if (!string.IsNullOrEmpty(search))
        queryable = queryable.Where(e => e.Name.ToLower().Contains(search));

    if (query.Status != null)     queryable = queryable.Where(e => e.Status == query.Status);
    if (query.OwnerId != null)    queryable = queryable.Where(e => e.OwnerId == query.OwnerId);
    if (query.CategoryId != null) queryable = queryable.Where(e => e.CategoryId == query.CategoryId);

    var totalCount = await queryable.CountAsync();
    var items = await queryable
        .Skip((query.Page - 1) * query.PageSize)
        .Take(query.PageSize)
        .Select(e => EntityDto.FromEntity(e))   // or inline projection
        .ToListAsync();

    return new PaginatedResponse<EntityDto> { Items = items, Page = query.Page, TotalCount = totalCount };
}
```

Rules:
- **Never** take pagination/filters as loose scalar `[FromQuery]` params. One query object per list endpoint.
- Base `PaginationQuery` = shared fields only. Filters live on the extending subclass, named `<Resource>PaginatedQuery`.
- Nullable filter props (`int?`), applied conditionally (`if (x != null)`) so absent = no filter.
- List endpoints return a pagination envelope (Items + Page + total). `PaginatedResponse<T>` (Items/Page/TotalCount) and `PagedResult<T>` above are the same role — pick **one** per project and stay consistent; match whichever an existing codebase already uses.

### Admin controllers

Live in `Src/Controllers/Admin/`, namespace `...Controllers.Admin`, role-gated:

```csharp
[ApiController]
[Authorize(Roles = UserRolesString.AdminRoles)]   // "SuperAdmin,Admin"
[Route("v1/api/admin/courses")]
public class AdminCoursesController(AppDbContext db, CacheService cache) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> ListAsync([FromQuery] AdminCoursePaginatedQuery query)
    {
        var page = query.Page < 1 ? 1 : query.Page;
        var pageSize = query.PageSize is < 1 or > 100 ? 20 : query.PageSize;
        var q = db.Courses.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(query.Search))
            q = q.Where(c => EF.Functions.ILike(c.Name, $"%{query.Search}%"));
        // sort switch, project, paginate → PagedResult<T>
    }
}
```

Admin-list convention: bind a `<Resource>PaginatedQuery` (extends `PaginationQuery`, adds `SortBy`/`SortDirection` if needed), clamp `Page`/`PageSize`, `AsNoTracking()`, `EF.Functions.ILike` for search, `SortBy`/`SortDirection` switch, return `PagedResult<T>`.

---

## 7. Services

One class per domain concern (`UserService`, `CourseService`, ...). Primary constructor injects `AppDbContext` and other services. Business logic + data access live here. Throw `ApiException` for domain errors.

```csharp
public class DomainService(AppDbContext db)
{
    public async Task<List<Course>> GetCoursesByDomainAsync(int domainId)
        => await db.Courses.Where(c => c.Domains.Any(d => d.Id == domainId)).ToListAsync();

    public async Task<List<Chapter>> GetChaptersByCourseAsync(int courseId, int domainId)
    {
        var course = await db.Courses.Include(c => c.Chapters)
            .FirstOrDefaultAsync(c => c.Id == courseId && c.Domains.Any(d => d.Id == domainId));
        if (course == null) throw ApiException.Create(404, "Course not found.");
        return course.Chapters.OrderBy(ch => ch.No).ToList();
    }
}
```

Rules:
- Methods async, `...Async` suffix.
- `Include`/`ThenInclude` for eager loading; `AsNoTracking()` for read-only queries.
- Set `UpdatedAt = DateTime.UtcNow` on mutations; `SaveChangesAsync()` after writes.
- Upsert pattern: `FirstOrDefaultAsync` → if null `AddAsync(new ...)` else mutate → `SaveChangesAsync`.
- Register in `Program.cs` (`AddScoped` default).

---

## 8. Entities

`Src/Models/Entities/`, one file per table. Plain POCOs. **Put table name and indexes as data annotations on the entity class itself** (`[Table]`, `[Index]`) — not in `AppDbContext`.

```csharp
[Table("courses")]
[Index(nameof(TenantId), nameof(Code), IsUnique = true)]
public class Course
{
    public int Id { get; set; }                         // PK by convention
    public int TenantId { get; set; }
    [MaxLength(255)] public required string Name { get; set; }
    [MaxLength(50)]  public required string Code { get; set; }
    [MaxLength(2000)] public string? Description { get; set; }   // nullable = optional column
    public ICollection<Domain> Domains { get; set; } = [];       // many-to-many nav
    public DateTime CreatedAt { get; set; }              // DB default NOW() (set in OnModelCreating)
    public DateTime? UpdatedAt { get; set; }
    public ICollection<Chapter> Chapters { get; set; } = [];     // one-to-many nav
}
```

Rules:
- `int Id` primary key.
- **`[Table("name")]`** on the class to set the DB table name (annotation, not fluent config).
- **`[Index(nameof(A), nameof(B), IsUnique = true)]`** on the class for indexes / unique constraints (composite or single). Multiple `[Index]` attributes allowed. Filtered/partial indexes that annotations can't express stay in `OnModelCreating`.
- `required` for non-null required columns; `?` nullable for optional.
- `[MaxLength(n)]` on strings to size the DB column.
- Enum properties typed as the enum (persisted as string — see DbContext).
- Nav collections init `= []`; nav refs nullable.
- No C# default on `CreatedAt` — DB sets it via `HasDefaultValueSql("NOW()")`.

---

## 9. AppDbContext

`Src/Utils/AppDbContext.cs`. Expose `DbSet` per entity, configure **relationships and conversions** in `OnModelCreating`. Table names and plain/unique indexes live as `[Table]`/`[Index]` annotations on the entity — keep them out of here. Only filtered/partial indexes annotations can't express stay in `OnModelCreating`.

```csharp
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Course> Courses => Set<Course>();
    // ...one per entity

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            // Plain/unique indexes → [Index] on the entity. Only filtered indexes here:
            entity.HasIndex(u => u.GoogleId).IsUnique().HasFilter("\"GoogleId\" IS NOT NULL");

            // Enums persisted as strings (not ints) — readable, migration-stable
            entity.Property(u => u.Role).HasConversion<string>();
            entity.Property(u => u.Status).HasConversion<string>();

            entity.Property(u => u.CreatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(u => u.Domain).WithMany()
                .HasForeignKey(u => u.DomainId)
                .OnDelete(DeleteBehavior.SetNull);       // parent delete nulls FK
        });

        // Many-to-many with explicit join table
        modelBuilder.Entity<Course>(entity =>
        {
            entity.HasMany(c => c.Domains).WithMany(d => d.Courses)
                .UsingEntity<Dictionary<string, object>>("CourseDomains",
                    j => j.HasOne<Domain>().WithMany().HasForeignKey("DomainId").OnDelete(DeleteBehavior.Cascade),
                    j => j.HasOne<Course>().WithMany().HasForeignKey("CourseId").OnDelete(DeleteBehavior.Cascade),
                    j => j.HasKey("CourseId", "DomainId"));
        });
        // Seed data here via entity.HasData(...) — changing seeds requires a new migration
    }
}
```

Conventions:
- **Enums → strings**: `entity.Property(x => x.Enum).HasConversion<string>()`.
- **Timestamps**: `HasDefaultValueSql("NOW()")` for `CreatedAt`.
- **Delete behavior**: `Cascade` for owned children, `SetNull` for optional FKs.
- **Indexes / table name**: as `[Index]`/`[Table]` annotations on the entity. Only filtered/partial indexes (`.HasFilter(...)`) that annotations can't express go here via `HasIndex`.
- Seed data via `HasData` in `OnModelCreating` — **any seed change needs a new migration**.

---

## 10. DTOs

`Src/Models/Api/Dtos/`, grouped by domain (`CourseDtos.cs`, `AuthDtos.cs`, ...). Split request vs response by intent. Response DTOs carry a static `FromEntity` mapper.

```csharp
// Request DTO — required props, [Required]/data-annotation validation
public class CreateCourseDto
{
    public required string CourseName { get; set; }
    public required string Code { get; set; }
    public required List<int> DomainIds { get; set; } = new();
}

// Response DTO — static FromEntity mapper, nested DTOs composed
public class CourseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    public static CourseDto FromEntity(Course course) => new()
    {
        Id = course.Id, Name = course.Name, Description = course.Description
    };
}
```

Rules:
- Request DTOs: `required` props, `[Required]`/`[MaxLength]` annotations, sensible defaults.
- Response DTOs: `static FromEntity(entity)` returning `new()`; overloads may take resolvers/TTL for computed fields.
- Compose nested DTOs via their own `FromEntity`, null-guarded.
- Map list: `entities.Select(Dto.FromEntity).ToList()`.

---

## 11. Auth

### JwtHandler (`Src/Utils/`)
Generates tokens. Standard claims: `NameIdentifier` (user id), `Name`, `Email`, `Role`. Add custom claims only when the domain needs them.

```csharp
public string GenerateToken(User user)
{
    var claims = new List<Claim>
    {
        new(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new(ClaimTypes.Name, user.FullName),
        new(ClaimTypes.Email, user.Email),
        new(ClaimTypes.Role, user.Role.ToString())
    };
    // Add project-specific custom claims here if needed (e.g. tenant/org id).
    // build SecurityTokenDescriptor with Issuer/Audience/Expires/HmacSha256, write token
}
```

### AuthUser (`Src/Utils/`, scoped)
Reads the current user from `IHttpContextAccessor`. Central place to pull `userId`, load the `User`, or read custom claims. Throws `ApiException(401/403)` on missing.

```csharp
public class AuthUser(IHttpContextAccessor _http, UserService _userService)
{
    public int? GetUserId()
    {
        var id = _http.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return id != null ? int.Parse(id) : null;
    }
    public async Task<User> GetUserAsync()
    {
        var id = GetUserId() ?? throw ApiException.Create(401, "Unauthorized");
        return await _userService.GetByIdAsync(id) ?? throw ApiException.Create(401, "User not found!");
    }
}
```

Password hashing: inject `PasswordHasher<User>`, use `HashPassword` / `VerifyHashedPassword`.

### Custom authorization filters (`Src/Middlewares/`)
For entitlement/feature gates beyond roles, implement `IAsyncAuthorizationFilter` as an attribute. Resolve services from `context.HttpContext.RequestServices`, set `context.Result` to a `Response<object>` `ObjectResult` on failure.

```csharp
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class RequiresProAttribute : Attribute, IAsyncAuthorizationFilter
{
    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var auth = context.HttpContext.RequestServices.GetRequiredService<AuthUser>();
        var user = await auth.GetUserAsync();
        // check entitlement; on fail:
        context.Result = new ObjectResult(new Response<object>
        { Success = false, StatusCode = 402, Message = "Subscription required" }) { StatusCode = 402 };
    }
}
```

---

## 12. Constants & enums

`Src/Utils/Constants.cs` — central enums + string-constant helpers.

```csharp
public enum UserRoles { SuperAdmin = 0, Admin = 1, User = 2 }

public static class UserRolesString                       // for [Authorize(Roles = ...)]
{
    public const string SuperAdmin = "SuperAdmin";
    public const string Admin = "Admin";
    public const string User = "User";
    public const string AdminRoles = SuperAdmin + "," + Admin;
}

// Custom JWT claim keys, only if the project uses any (example — not required):
// public static class JwtClaims { public const string TenantId = "tenant_id"; }

public enum UserStatus { Active = 0, Inactive = 1, Suspended = 2 }
```

Enums persisted as strings in DB (via `HasConversion<string>()`). Keep role auth strings in a `...String` static class so `[Authorize(Roles = ...)]` and the enum stay in sync.

---

## 13. Settings POCOs

`Src/Settings/`, one per config section. Plain POCOs with sensible defaults, bound in `Program.cs` via `Configure<T>(config.GetSection("X"))`.

```csharp
public class CacheSettings
{
    public string ConnectionString { get; set; } = "localhost:6379";
    public string StartKey { get; set; } = "app-dev";
    public int DefaultTtlMinutes { get; set; } = 60;
    public bool Enabled { get; set; } = true;
}
```

Consume via `IOptions<CacheSettings>` (or the options-as-singleton pattern for direct injection).

---

## 14. Caching (optional)

`CacheService` (scoped) wraps Redis with graceful degradation: if Redis is down/disabled, falls through to the loader. Content-version namespacing lets you invalidate everything by bumping one key.

```csharp
var data = await _cache.GetOrSetAsync(
    $"courses:domain:{domainId}",
    async () => (await _domainService.GetCoursesByDomainAsync(domainId))
                 .Select(CourseDto.FromEntity).ToList(),
    TimeSpan.FromHours(6));
```

Pattern: `GetOrSetAsync(keyTail, loader, ttl?)`; `BumpContentVersionAsync()` to invalidate a whole namespace; `GetRawAsync`/`SetRawAsync`/`RemoveRawAsync` for version-independent keys. Every Redis call is try/caught and logs a warning, never throws.

---

## 15. Config (`appsettings.json`)

```json
{
  "ConnectionStrings": { "DefaultConnection": "Host=...;Database=...;Username=...;Password=..." },
  "JWTSettings": {
    "securityKey": "<long-random-secret>",
    "validIssuer": "app-api",
    "validAudience": "app-client",
    "ExpiresInMinutes": "43200"
  },
  "Cache": { "Enabled": true, "ConnectionString": "localhost:6379", "StartKey": "app-dev", "DefaultTtlMinutes": 60 }
}
```

`appsettings.Staging.json` overrides per-env (`ASPNETCORE_ENVIRONMENT=Staging`). Never commit real prod secrets — prefer user-secrets / env vars.

---

## 16. Commands (from project dir)

```bash
dotnet run                              # ASPNETCORE_ENVIRONMENT=Staging to use Staging config
dotnet build
dotnet ef migrations add <Name>         # after entity/DbContext/seed changes
dotnet ef database update
# health: GET /v1/api/health
```

---

## 17. Request lifecycle (end to end)

1. Request hits `v1/api/...` → CORS → `ExceptionHandlerMiddleware` → `UseAuthentication` (JWT validated) → `UseAuthorization` (`[Authorize]` / roles / filter attrs).
2. Controller action runs, injects services, reads current user via `AuthUser`.
3. Service does business logic + EF Core data access; throws `ApiException` on domain errors.
4. Controller maps entity → DTO (`FromEntity`), wraps in `Response<T>.CreateSuccess`, returns `Ok(...)`.
5. Any thrown `ApiException` → middleware → `{ data:null, message, success:false, statusCode }` JSON.
6. Auth-pipeline 401/403 → `CustomAuthResultHandler` → same envelope shape.

**Client contract:** every response is `{ data, message, success, statusCode }` in camelCase. Build clients to branch on `success`.

---

## Checklist to scaffold a new project

- [ ] `global.json` + `.csproj` (Nullable, ImplicitUsings, packages — versions unpinned)
- [ ] `Src/` tree with the 6 subfolders + `Models/{Entities,Api,Api/Dtos}`
- [ ] `Response.cs` + `PagedResult.cs` envelopes
- [ ] `ExceptionHandlerMiddleware` + `ApiException` + `CustomAuthResultHandler`
- [ ] `AppDbContext` with DbSets + `OnModelCreating` (enum conversions, indexes, delete behavior, seeds)
- [ ] `JwtHandler` + `AuthUser` + `Constants` (roles, claims, enums)
- [ ] Settings POCOs bound in `Program.cs`
- [ ] `Program.cs` pipeline in the exact order above
- [ ] Entities → Services → DTOs → Controllers per domain
- [ ] First migration: `dotnet ef migrations add Init`
```

