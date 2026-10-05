---
name: nodejs-builder
description: >-
  Use when creating a new Node.js / Express / TypeScript backend, API or server, or when adding,
  changing or fixing controllers, routes, endpoints or error handling in one. Triggers on
  requests mentioning Node, Node.js, Express, express-typescript-app, a TypeScript REST API,
  a new backend project, or "add an endpoint/controller/route".
---

# nodejs-builder

Express + TypeScript backends in one fixed shape: the project comes from
`npx express-typescript-app`, each resource is one file in `src/routes/` holding its router and
its handlers, every route handler is wrapped in `createController`, every expected failure is a
thrown `ApiError`. There is no `src/controllers/` and no `src/models/`.

## 1. Project — scaffold only if missing

Existing project = `package.json` lists `express` **and** `src/app.ts` exists (cwd or the
target dir). Then go to step 2.

Otherwise:

```bash
npx -y express-typescript-app <app-name>   # kebab-case: the user's name, or derived from the request
cd <app-name>
```

Never clone the repo or hand-write the scaffold. The generator creates
`src/{app.ts,controllers,models,routes,utils,types}`, `public/`, `tsconfig.json`, and installs
express + typescript/nodemon/concurrently. `controllers/` and `models/` are removed in step 3 —
this skill doesn't use them.

Then patch `tsconfig.json`: it ships without `rootDir`, and TypeScript 6+ refuses to build
(`error TS5011: ... The 'rootDir' setting must be explicitly set`). Add
`"rootDir": "./src",` right after `"outDir": "./dist",` (skip if already present).

## 2. `src/utils/index.ts` — the helpers

| State of `src/utils/index.ts` | Action |
|---|---|
| missing / empty | copy `assets/src/utils/index.ts` from this skill verbatim |
| exists, no `createController` | append `ApiError`, `createController`, `createResponse` from the asset; merge the `express` import; keep existing exports |
| already has them | leave it alone |

Never rewrite or "improve" these helpers.

- `ApiError(message, status)` — throw for every expected failure.
- `createController(fn)` — returned value → `200 {data, message: "success", status: 200}`;
  thrown `ApiError` → its status + `{data: null, message, status}`; anything else → logged +
  `500 Internal server error`.
- `createResponse(data, message, status)` — the envelope; used by `createController`.

## 3. Routes — router + handlers in one file, always this pattern

**Freshly scaffolded project only** (you ran the generator in step 1): delete the
`controllers/` folder (holds only the sample weather controller) and the empty `models/` folder,
and serve a health check at `/` instead.

```bash
rm -rf src/controllers src/models
```

Replace `src/app.ts` with:

```ts
import express from "express";
import { createController } from "./utils";

// Initialize
const app = express();
const PORT = 3000;

// Middleware
app.use(express.static("public"));
app.use(express.json());

// Health
app.get("/", createController(() => "ok"));

// Routes

app.listen(PORT, () => {
  console.log("⚡️[server]: Server is running at http://localhost:" + PORT);
});
```

Existing project: don't touch its `app.ts` routes or handlers beyond the task.

One file per resource, `src/routes/<resource>-routes.ts`: the router **and** its handlers live
together in that file and it default-exports the express `Router`. No separate controller files,
no `src/controllers/`, no `src/models/` (data access comes from the ORM/DB client; shared types go in
`src/types/`). Logic too big for the route file goes in `src/services/<name>.ts`. Mount the router
in `src/app.ts` under `// Routes`:

```ts
import userRoutes from "./routes/user-routes";
app.use("/users", userRoutes);
```

Existing project that still has `src/controllers/` or `src/models/`: new resources still go in
`src/routes/`. Move the old ones over only when the user asks for it (move each
`controllers/<x>-controller.ts` to `routes/<x>-routes.ts`, fix imports in `app.ts`, delete the
emptied folders).

`src/routes/user-routes.ts`:

```ts
import { Router } from "express";
import { ApiError, createController } from "../utils";

const router = Router();

// The check lives here once; every handler that calls it gets the 404 for free.
const getUserOrThrow = async (id: number) => {
  const user = await db.user.findById(id);
  if (!user) throw new ApiError("User not found", 404);
  return user;
};

router.get("/:id", createController((req) => getUserOrThrow(Number(req.params.id))));

router.post(
  "/",
  createController(async (req) => {
    const { name } = req.body ?? {};
    if (!name) throw new ApiError("name is required", 400);
    return db.user.create({ name });
  })
);

export default router;
```

Rules:

- Every route handler is wrapped in `createController` and **returns** its data. No
  `res.send` / `res.json` / `res.status` inside it.
- Failures are `throw new ApiError(message, status)`. No `if (...) return res.status(4xx)...`,
  no try/catch in handlers — `createController` already catches.
- Check once, deep: helpers/services (`getXOrThrow`, `assertOwner`, ...) throw `ApiError`
  themselves so callers never repeat the null/permission check. Same `if (!x) throw` in two
  handlers → move it into a helper.
- Unexpected errors: let them throw (→ logged 500). Don't wrap them in `ApiError(..., 500)`.
- Express 5 leaves `req.body` `undefined` when no JSON body is sent — destructure from
  `req.body ?? {}` so missing input becomes your 400, not a 500 TypeError.
- Only exception: handlers that write the response themselves (`res.redirect`, `res.download`,
  `res.sendFile`, streams/SSE). Don't wrap those — `createController` would send a second
  response (`Cannot set headers after they are sent`).
- Existing handlers not using `createController`: leave them unless the task touches them;
  when you touch one, convert it.

## 4. Verify

```bash
npm run build                       # must be clean
node dist/app.js &                  # template listens on 3000
curl -s localhost:3000/             # health: {"data":"ok","message":"success","status":200}
curl -s localhost:3000/<resource>   # {"data":...,"message":"success","status":200}
```

Hit one failing path too — expect the `ApiError` status and message. Stop the server after.
