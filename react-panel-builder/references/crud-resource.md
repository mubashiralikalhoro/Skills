# Full CRUD resource recipe

The daily workhorse. Adds a complete resource: list (table + search + filters + pagination) and create/edit form, wired into routing and nav. Mirrors the sample at `src/pages/listing/`.

Read alongside: `listing-and-pagination.md`, `table.md`, `form.md`, `filter.md`, `routing.md`, `api-layer.md`.

## Checklist

1. `src/pages/<resource>/index.tsx` — list page.
2. `src/pages/<resource>/create.tsx` — create + edit page (one file, `:id` decides mode).
3. Register both routes in `src/pages/routes.tsx` (inside `PrivateRoute` group).
4. Add sidebar link in `DashboardLayout.tsx`.
5. (Optional) Add a row type to `src/types/index.ts`.

Endpoints assumed: `GET /<res>` (list), `GET /<res>/:id`, `POST /<res>`, `PUT /<res>/:id`, `DELETE /<res>/:id`. Adjust to the real API.

## 1. List page — `index.tsx`

```tsx
import { Link } from "react-router";
import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useUserContext } from "../../context/user-context";
import { useListingApi } from "../../hooks/useListingApi";
import api, { getAuthHeader } from "../../utils/api";
import notify from "../../utils/notify";
import DynamicTable, { TableStructure } from "../../components/global/DynamicTable";
import Pagination from "../../components/global/Pagination";
import FilterBuilder from "../../components/global/FilterBuilder";

export default function UsersPage() {
  const { token } = useUserContext();
  const [filters, setFilters] = useState<Record<string, any>>({});

  const {
    data, loading, page, pageSize, totalCount,
    setPage, search, setSearch, setExtraParams,
    sortColumn, setSortColumn, sortDirection, setSortDirection, remove,
  } = useListingApi<User>("/users", token, {
    transformData: (res) => ({ data: res.users, totalCount: res.totalCount }),
    idExtractor: (u) => u.UserID,
  });

  useEffect(() => { setExtraParams(filters); }, [filters]);

  const handleDelete = async (id: number) => {
    const res = await api.delete(`/users/${id}`, getAuthHeader(token));
    if (res.failed) return notify.error(res.message);
    notify.success("Deleted");
    remove(id);
  };

  const tableStructure: TableStructure[] = [
    { heading: "Name", sortField: "name",
      loadItem: (u) => <span className="text-sm font-medium text-gray-900">{u.FirstName} {u.LastName}</span> },
    { heading: "Email", loadItem: (u) => <span className="text-sm text-gray-600">{u.Email}</span> },
    { heading: "Actions", loadItem: (u) => (
      <div className="flex space-x-3">
        <Link to={`/users/${u.UserID}`}><FaEdit /></Link>
        <button onClick={() => handleDelete(u.UserID)}><FaTrash className="text-red-500" /></button>
      </div>
    ) },
  ];

  return (
    <div className="p-2">
      <div className="flex justify-between items-center gap-4 mb-4">
        <input
          className="border rounded-lg px-3 py-2 w-64"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Link to="/users/create" className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg">Add User</Link>
      </div>

      <FilterBuilder
        filters={filters}
        setFilters={setFilters}
        className="mb-4"
        design={[
          { fieldName: "statusId", inputType: "select", label: "Status",
            options: [{ value: 1, label: "Active" }, { value: 0, label: "Inactive" }] },
        ]}
      />

      <DynamicTable
        data={data}
        loading={loading}
        tableStructure={tableStructure}
        sortColumn={sortColumn} setSortColumn={setSortColumn}
        sortDirection={sortDirection} setSortDirection={setSortDirection}
        thClassName="px-6 py-3" tdClassName="px-6 py-4"
        tableClassName="min-w-full divide-y divide-gray-200"
      />

      <Pagination page={page} pageSize={pageSize} totalCount={totalCount} setPage={setPage} />
    </div>
  );
}
```

## 2. Create/Edit page — `create.tsx`

```tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import * as Yup from "yup";
import { useUserContext } from "../../context/user-context";
import api, { getAuthHeader } from "../../utils/api";
import notify from "../../utils/notify";
import FormBuilder from "../../components/global/form-builder/FormBuilder";
import FormButtons from "../../components/global/FormButtons";

export default function CreateUserPage() {
  const { id } = useParams();                 // "create" or a real id
  const isCreate = id === "create";
  const { token } = useUserContext();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initial, setInitial] = useState({ FirstName: "", LastName: "", Email: "" });

  useEffect(() => {
    if (isCreate) return;
    (async () => {
      const res = await api.get<User>(`/users/${id}`, getAuthHeader(token));
      if (res.failed) return notify.error(res.message);
      setInitial({ FirstName: res.data!.FirstName, LastName: res.data!.LastName, Email: res.data!.Email });
    })();
  }, [id]);

  const validationSchema = Yup.object().shape({
    FirstName: Yup.string().min(2).required("First name is required"),
    Email: Yup.string().email("Invalid email").required("Email is required"),
  });

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    const res = isCreate
      ? await api.post("/users", values, getAuthHeader(token))
      : await api.put(`/users/${id}`, values, getAuthHeader(token));
    setIsSubmitting(false);
    if (res.failed) return notify.error(res.message);
    notify.success(isCreate ? "Created" : "Updated");
    navigate("/users");
  };

  return (
    <div className="p-2">
      <h1 className="text-xl font-semibold mb-4">{isCreate ? "Create User" : "Edit User"}</h1>
      <FormBuilder
        className="gap-6 grid grid-cols-1 md:grid-cols-2"
        value={initial}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        SubmitButton={({ isValid, handleSubmit }) => (
          <FormButtons
            className="col-span-full"
            isValid={isValid}
            isLoading={isSubmitting}
            handleSubmit={handleSubmit}
            handleCancel={() => navigate("/users")}
            createButtonText={isCreate ? "Create" : "Update"}
          />
        )}
        design={[
          { fieldName: "FirstName", inputType: "text", label: "First Name", placeholder: "Enter first name", className: "col-span-1" },
          { fieldName: "LastName", inputType: "text", label: "Last Name", placeholder: "Enter last name", className: "col-span-1" },
          { fieldName: "Email", inputType: "email", label: "Email", placeholder: "Enter email", className: "col-span-1" },
        ]}
      />
    </div>
  );
}
```

## 3. Routes (`routes.tsx`, inside PrivateRoute group)
```tsx
<Route path="/users" element={<UsersPage />} />
<Route path="/users/:id" element={<CreateUserPage />} />
```

## 4. Sidebar (`DashboardLayout.tsx`)
```tsx
{ name: "Users", path: "/users", icon: <FaUsers className="w-5 h-5" /> },
```

## Verify
- List loads, paginates, searches, filters, sorts.
- "Add" → `/users/create` (create mode). Edit icon → `/users/:id` (prefilled).
- Submit success → toast + back to list. Delete → toast + row removed.
- Adjust field names / endpoints / `transformData` to the real API response shape.
