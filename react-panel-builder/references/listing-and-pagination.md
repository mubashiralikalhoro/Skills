# Listing & pagination — useListingApi

The backbone of every list page. Handles fetch, pagination, search (debounced 500ms), sort, filters, and optimistic list mutation. Never hand-roll this state.

## Signature

```ts
const listing = useListingApi<RowType>(url, token, {
  page?: number;                 // default 1
  pageSize?: number;             // default 10
  search?: string;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  extraParams?: Record<string, any>;   // filters
  transformData: (res) => ({ data: RowType[], totalCount: number });  // REQUIRED
  idExtractor?: (row: RowType) => any;  // REQUIRED for add/update/remove
});
```

It auto-builds: `url?page=&pageSize=&search=&sortColumn=&sortDirection=&...extraParams` and refetches whenever page / pageSize / sort / extraParams / recall change.

`transformData` is **required** (throws if missing) — it maps your API's response shape to `{ data, totalCount }`.

## Returns

State: `data, page, pageSize, totalCount, loading, search, sortColumn, sortDirection, extraParams`
Setters (trigger refetch): `setPage, setPageSize, setSearch, setSortColumn, setSortDirection, setExtraParams, setData`
Ops: `recall()` (refetch), `add(row)` (prepend), `update(id, row => newRow)`, `remove(id)`

## Standard usage

```tsx
const { token } = useUserContext();
const {
  data, loading, page, pageSize, totalCount,
  setPage, setPageSize, search, setSearch,
  sortColumn, setSortColumn, sortDirection, setSortDirection,
  setExtraParams, remove,
} = useListingApi<User>("/users", token, {
  transformData: (res) => ({ data: res.users, totalCount: res.totalCount }),
  idExtractor: (u) => u.UserID,
});
```

Then render `DynamicTable` (see `table.md`) + `Pagination`:

```tsx
<Pagination page={page} pageSize={pageSize} totalCount={totalCount} setPage={setPage} />
```

## Search & filters
- Bind a search input to `value={search} onChange={e => setSearch(e.target.value)}` — debounced internally.
- For filters, render a `FilterBuilder` (see `filter.md`) and feed its values into `setExtraParams(filterValues)`.

## Optimistic mutations (need idExtractor)
```ts
await api.delete(`/users/${id}`, getAuthHeader(token));
remove(id);                       // drop from list, decrement total
add(newUserFromApi);              // prepend
update(id, (u) => ({ ...u, IsActive: false }));
```
After create/edit on a separate page, just navigate back — list refetches via `recall()` if you call it, or on mount.
