# Forms — FormBuilder

Config-driven forms on Formik + Yup. Never hand-build form state or raw inputs.

## Field config

```ts
type InputType =
  | "text" | "number" | "email" | "password" | "textarea"
  | "date" | "datetime-local" | "select" | "enum"
  | "switch" | "checkbox" | "radio" | "image" | "view" | "gap";

interface FormItem {
  fieldName: string;
  inputType: InputType;
  label: string;
  placeholder?: string;
  options?: { value: any; label: string }[];   // select/enum/radio
  required?: boolean;
  className?: string;            // grid span e.g. "col-span-1" / "col-span-full"
  containerClassName?: string;
  yupSchema?: Yup.Schema<any>;
  hidden?: (values: any) => boolean;            // conditional visibility
  onChange?: (e, setValues, values) => void;    // cascading selects
  loadValue?: (values: any) => any;
  customView?: (values: any) => React.ReactNode; // inputType "view"
  imageAspectRatio?: number;                      // inputType "image"
  onSelectSearchChange?: (text, setValues, values) => void;
  selectSearchValue?: string;
  props?: { [key: string]: any };                // passthrough e.g. { rows: 3 }
}
```

## Builder props

```ts
interface FormBuilderProps {
  value: any;                        // initial values
  design: FormItem[];                // fields
  onSubmit: (values, opts?) => void;
  validationSchema?: Yup.Schema<any>;
  SubmitButton?: ({ isValid, handleSubmit }) => React.ReactNode;
  showSubmitButton?: boolean;
  onChange?: (values: any) => void;  // fires every change
  className?: string;                // grid wrapper
}
```

## Standard create/edit form

```tsx
const validationSchema = Yup.object().shape({
  FirstName: Yup.string().min(2).required("First name is required"),
  Email: Yup.string().email("Invalid email").required("Email is required"),
  GenderID: Yup.number().nullable().required("Gender is required"),
});

<FormBuilder
  className="gap-6 grid grid-cols-1 md:grid-cols-2"
  value={{ FirstName: "", LastName: "", Email: "", GenderID: null }}
  validationSchema={validationSchema}
  onSubmit={handleSubmit}
  SubmitButton={({ isValid, handleSubmit }) => (
    <FormButtons
      className="col-span-full"
      isValid={isValid}
      isLoading={isSubmitting}
      handleSubmit={handleSubmit}
      handleCancel={() => navigate("/users")}
      createButtonText={id === "create" ? "Create" : "Update"}
    />
  )}
  design={[
    { fieldName: "FirstName", inputType: "text", label: "First Name", placeholder: "Enter first name", className: "col-span-1" },
    { fieldName: "Email", inputType: "email", label: "Email", placeholder: "Enter email", className: "col-span-1" },
    { fieldName: "GenderID", inputType: "select", label: "Gender", placeholder: "Select gender",
      options: genders.map(g => ({ value: g.GenderID, label: g.GenderName })), className: "col-span-1" },
    { fieldName: "Address", inputType: "textarea", label: "Address", containerClassName: "col-span-full", props: { rows: 3 } },
  ]}
/>
```

## Patterns
- **Layout** via grid: `className` on FormBuilder = grid; per-field `className="col-span-1|col-span-full"`.
- **Cascading selects:** field `onChange` updates local state that recomputes another field's `options`; hide dependents with `hidden: (v) => !v.CountryID`.
- **Submit:** use `FormButtons` (Cancel + Submit, loading spinner, disabled when `!isValid`).
- **Validation:** Yup only — global `validationSchema` or per-field `yupSchema`.
- **Field components** live in `components/global/form-builder/components/`; extend there if a new input type is truly needed (rare).
