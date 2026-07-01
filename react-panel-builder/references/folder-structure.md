# Folder structure — where things go

```
src/
├── assets/                 # static images (react.svg); branding is text-only via Logo
├── components/
│   ├── app/                # LoaderScreen
│   ├── auth/               # AuthLayout
│   ├── dashboard/          # StatsCard, BarChartCard, PieChartCard, RecentActivity
│   ├── global/             # REUSABLE BUILDERS — use these, don't reinvent
│   │   ├── form-builder/   # FormBuilder.tsx + components/ (InputField, SelectInput,
│   │   │                   #   EnumInput, SwitchComponent, ImageCropInput)
│   │   ├── DynamicTable.tsx
│   │   ├── Pagination.tsx
│   │   ├── FilterBuilder.tsx
│   │   ├── DateRangeFilter.tsx
│   │   ├── CenterModal.tsx
│   │   ├── FormButtons.tsx
│   │   ├── ViewToggle.tsx, DropDown.tsx, BackButton.tsx, Container.tsx, LoaderIcon.tsx
│   │   ├── Logo.tsx          # text wordmark from VITE_APP_NAME — edit to use a real logo
│   ├── layout/             # DashboardLayout (sidebar + header + <Outlet/>)
│   └── profile/
├── context/                # app-context, user-context (auth/token)
├── constants/              # index.ts (env, isDevelopment, APP_NAME), apiEndPoints.ts (BASE_URL)
├── hooks/                  # useListingApi, useDebouncedSearch, useWindowSize,
│                           #   usePersistedState, useOutsideClick, useScrollController
├── pages/
│   ├── routes.tsx          # ALL routes + PrivateRoute/AuthRoute guards
│   ├── auth/               # login, signup, forget-password, reset-password
│   ├── dashboard/
│   ├── <resource>/         # one folder per resource: index.tsx (list) + create.tsx (create/edit)
│   ├── profile/
│   └── _404.tsx
├── styles/index.css        # tailwind import + CSS theme vars
├── types/index.ts          # shared TS types
├── utils/
│   ├── api.ts              # axios wrapper (api.get/post/put/delete, getAuthHeader)
│   ├── notify.ts           # toast wrapper
│   └── index.tsx           # cn, getQueryFromObject, formatDate, convertToOptions, ...
├── App.tsx                 # providers + routes + ToastContainer
└── main.tsx
```

## Rules
- **New resource** → new folder under `src/pages/<resource>/` with `index.tsx` (list) and `create.tsx` (create+edit).
- **New shared widget** → `src/components/global/`.
- **New util** → `src/utils/index.tsx`. **New hook** → `src/hooks/`.
- **Never** put api calls, pagination state, or raw tables/forms in a page when a `components/global/` builder + hook exists for it.
