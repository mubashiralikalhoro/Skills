# init mode — scaffold a new panel

Use when no panel project exists yet. Produces a full working admin panel matching the template (auth + dashboard layout + sample `listing` CRUD).

## Steps

1. **Scaffold Vite + React + TS**
   ```bash
   npm create vite@latest <app-name> -- --template react-ts
   cd <app-name>
   ```

2. **Install deps.** Exact runtime + dev set (mirrors `assets/config/package.template.json`). Note `clsx` is required — `utils/index.tsx` imports it.
   ```bash
   npm i axios formik yup react-router react-toastify react-icons \
     clsx classnames tailwind-merge tailwindcss @tailwindcss/vite \
     date-fns moment react-modal react-advanced-cropper \
     chart.js react-chartjs-2 react-big-calendar
   npm i -D @types/react-modal @types/react-big-calendar
   ```
   (React 19 + typescript/eslint come from the Vite template.)

3. **Copy template config over generated defaults** (from this skill's `assets/config/`):
   - `vite.config.ts` (uses `@tailwindcss/vite` plugin — no postcss/tailwind.config needed)
   - `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
   - `eslint.config.js`
   - `index.html`
   - `.env.example`

4. **Copy infra source.** Replace generated `src/` with this skill's `assets/src/`:
   ```bash
   rm -rf src && cp -R <skill>/assets/src ./src
   ```
   Brings api layer, hooks, all `components/global/` builders, contexts, layout, auth pages, dashboard, and sample `listing` CRUD.

5. **Env.** Copy `.env.example` → `.env` and set:
   ```
   VITE_APP_NAME="<your app name>"
   VITE_NODE_ENV="development"
   VITE_FRONTEND_URL="http://localhost:5173"
   VITE_API_URL="<backend base url>"
   VITE_API_VERSION="v1"
   ```
   `VITE_APP_NAME` drives the `Logo` wordmark (`components/global/Logo.tsx`) shown in auth pages, sidebar, and loader. No image assets — branding is text-only. Drop a real logo by editing that one component.

6. **Run.** `npm run dev`. Build: `npm run build` (`tsc -b && vite build`).

## Tailwind v4 note
No `tailwind.config.js`/postcss. Tailwind enabled via the Vite plugin in `vite.config.ts` + `@import "tailwindcss";` in `src/styles/index.css`. CSS theme vars live in `:root` of that file (`--primary`, `--light-white`, `--light-text`).

## App wiring (already in assets)
`main.tsx` → `App.tsx` wraps: `AppContextProvider` › `UserContextProvider` › `AppRoutes` + `ToastContainer`. Don't change this order.

## After scaffold
Rename/extend the sample `listing` resource, or add new resources via `crud-resource.md`. The sample at `src/pages/listing/` is the canonical reference — keep it until the real resources exist.
