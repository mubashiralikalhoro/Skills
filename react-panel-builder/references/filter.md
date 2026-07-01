# Filters — FilterBuilder

Real-time filter bar. Same `FormItem[]` config as FormBuilder, but no validation and no submit — values update live and feed the listing's `extraParams`.

## Props

```ts
interface FilterBuilderProps {
  filters: any;                 // current filter values
  setFilters: (v: any) => void; // update callback
  design: FormItem[];           // same shape as FormBuilder fields
  className?: string;
  isVisible?: boolean;
}
```

## Wire to useListingApi

```tsx
const [filters, setFilters] = useState<Record<string, any>>({});

const { data, loading, setExtraParams /* ...pagination */ } =
  useListingApi<User>("/users", token, {
    transformData: (res) => ({ data: res.users, totalCount: res.totalCount }),
    idExtractor: (u) => u.UserID,
  });

useEffect(() => { setExtraParams(filters); }, [filters]);

const filterDesign: FormItem[] = [
  { fieldName: "search", inputType: "text", label: "Search", placeholder: "Search by name..." },
  { fieldName: "statusId", inputType: "select", label: "Status",
    options: [{ value: 1, label: "Active" }, { value: 0, label: "Inactive" }] },
  { fieldName: "fromDate", inputType: "date", label: "From" },
];

<FilterBuilder filters={filters} setFilters={setFilters} design={filterDesign} className="mb-6" />
```

## Date ranges
For from/to date presets (Today, Last 7/30 days, This Month), use `DateRangeFilter` instead and push its result into `setExtraParams({ startDate, endDate })`.

## Rules
- Filter `fieldName`s must match the query params the API expects (they land in `extraParams` → query string).
- Don't validate filters. Don't add a submit button — `FilterBuilder` updates live.
- Free-text search can go through the listing's built-in debounced `search` OR a filter field — pick one, not both, per page.
