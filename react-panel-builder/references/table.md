# Data table — DynamicTable

Responsive table (auto desktop table / mobile cards), sortable, loading skeletons. Never write a raw `<table>`.

## Props

```ts
interface TableStructure {
  heading: any;
  loadItem: (rowData: any, index: number) => any;  // render the cell
  sortField?: string;                              // enables clickable sort on this column
}

interface Props {
  tableStructure: TableStructure[];
  data: any[];
  loading?: boolean;
  sortColumn?: string;
  setSortColumn?: (field: string) => void;
  sortDirection?: "asc" | "desc";
  setSortDirection?: (order: "asc" | "desc") => void;
  // class overrides: tableClassName, containerClassName, thClassName, tdClassName,
  //   trClassName, tbodyClassName, pageSize
}
```

## Define columns as data

```tsx
const tableStructure: TableStructure[] = [
  {
    heading: "User ID",
    sortField: "userid",
    loadItem: (u) => <span className="text-sm font-medium text-gray-900">{u.UserID}</span>,
  },
  {
    heading: "Name",
    sortField: "name",
    loadItem: (u) => (
      <div className="text-sm font-medium text-gray-900">{u.FirstName} {u.LastName}</div>
    ),
  },
  {
    heading: "Actions",
    loadItem: (u) => (
      <div className="flex space-x-3">
        <Link to={`/users/${u.UserID}`}><FaEdit /></Link>
        <button onClick={() => handleDelete(u.UserID)}><FaTrash /></button>
      </div>
    ),
  },
];
```

## Render (wired to useListingApi)

```tsx
<DynamicTable
  data={data}
  tableStructure={tableStructure}
  loading={loading}
  sortColumn={sortColumn}
  setSortColumn={setSortColumn}
  sortDirection={sortDirection}
  setSortDirection={setSortDirection}
  thClassName="px-6 py-3"
  tdClassName="px-6 py-4"
  tableClassName="min-w-full divide-y divide-gray-200"
/>
```

## Rules
- Columns are config (`tableStructure`), not JSX `<th>/<td>`.
- `sortField` must match what the API expects in `sortColumn`; wire sort props from `useListingApi`.
- Put row actions (view/edit/delete) in a final `Actions` column via `loadItem`.
- Edit links go to `/<resource>/:id`; delete calls `api.delete` then `remove(id)`.
