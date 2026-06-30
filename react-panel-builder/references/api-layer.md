# API layer

All HTTP goes through `src/utils/api.ts`. Never call axios/fetch directly in a page or component.

## The wrapper

`api` exposes `get / post / put / delete`, each generic over the response type and returning a normalized `IResponse<T>`:

```ts
interface IResponse<T> {
  data?: T | null;
  message: string;
  success: boolean;
  failed: boolean;
  statusCode: number;
  fullResponse?: any;
}
```

Signatures:
```ts
api.get<T>(url, config?)
api.post<T>(url, data, config?)
api.put<T>(url, data, config?)
api.delete<T>(url, config?)
```

Base URL comes from `constants/apiEndPoints.ts` (`env.VITE_API_URL`). In dev, every call is logged to console.

## Auth header

```ts
import api, { getAuthHeader } from "../../utils/api";
import { useUserContext } from "../../context/user-context";

const { token } = useUserContext();
const res = await api.get<UserType>("/users/123", getAuthHeader(token));
```

`getAuthHeader(token)` → `{ headers: { Authorization: \`Bearer ${token}\` } }`.

## Mandatory error pattern

Always branch on `res.failed` and surface via `notify`. The wrapper never throws — it returns `failed: true`.

```ts
import notify from "../../utils/notify";

const res = await api.post<{ id: number }>("/users", values, getAuthHeader(token));
if (res.failed) {
  notify.error(res.message);
  return;
}
notify.success("Saved");
// use res.data
```

## Query strings
For GET list params use `getQueryFromObject(obj)` from `utils` (skips null values). The `useListingApi` hook already builds page/pageSize/search/sort/extraParams query strings — prefer it for any list endpoint (see `listing-and-pagination.md`).

## Do / Don't
- ✅ `api.get<T>(url, getAuthHeader(token))` then check `res.failed`.
- ❌ `import axios` in a page.
- ❌ `try/catch` around `api.*` for control flow — use `res.failed`.
- ❌ Building auth headers by hand — use `getAuthHeader`.
