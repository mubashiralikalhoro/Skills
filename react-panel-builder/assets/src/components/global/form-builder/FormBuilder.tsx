import * as Yup from "yup";
import { Formik, FormikHelpers } from "formik";
import ImageCropInput from "./components/ImageCropInput";
import InputField from "./components/InputField";
import SelectInput from "./components/SelectInput";
import SwitchComponent from "./components/SwitchComponent";
import EnumInput from "./components/EnumInput";
import { printLog } from "../../../utils";
import { useEffect } from "react";

type InputType =
  | "text"
  | "number"
  | "email"
  | "password"
  | "textarea"
  | "image"
  | "radio"
  | "checkbox"
  | "datetime-local"
  | "date"
  | "select"
  | "switch"
  | "view"
  | "gap"
  | "enum";

export interface FormItem {
  fieldName: string;
  inputType: InputType;
  label: string;
  placeholder?: string;
  options?: { value: any; label: string }[];
  onChange?: (e: any, setValues: (newValues: any) => any, values: any) => void;
  imageAspectRatio?: number;
  className?: string;
  yupSchema?: Yup.Schema<any>;
  loadValue?: (values: any) => any;
  onSelectSearchChange?: (text: any, setValues: (newValues: any) => any, values: any) => void;
  selectSearchValue?: string;
  hidden?: (values: any) => boolean;
  containerClassName?: string;
  customView?: (values: any) => React.ReactNode;
  props?: { [key: string]: any };
  required?: boolean;
}

export type FormikSubmitOptions = FormikHelpers<any>;

export interface FormBuilderProps {
  value: any;
  className?: string;
  onSubmit: (values: { [key: string]: any }, otherOptions?: FormikSubmitOptions) => void;
  SubmitButton?: ({
    isValid,
    handleSubmit,
  }: {
    isValid: boolean;
    handleSubmit: () => void;
  }) => React.ReactNode;
  design: FormItem[];
  getValues?: (values: any) => any;
  showSubmitButton?: boolean;
  validationSchema?: Yup.Schema<any>;
  onChange?: (values: any) => void;
}

const FormBuilder = ({
  value,
  design,
  className,
  onSubmit,
  SubmitButton,
  getValues,
  showSubmitButton = true,
  validationSchema,
  onChange,
}: FormBuilderProps) => {
  const getSchema = (design: FormBuilderProps["design"]) => {
    if (validationSchema) {
      return validationSchema;
    }

    const obj: any = {};
    design.forEach((item) => {
      if (item.yupSchema) {
        obj[item.fieldName] = item.yupSchema;
      }
    });

    return Yup.object().shape(obj);
  };

  return (
    <div>
      <Formik
        initialValues={value}
        onSubmit={(values, otherOptions) => {
          onSubmit(values, otherOptions);
        }}
        validationSchema={getSchema(design)}
        validateOnMount
        enableReinitialize
      >
        {({
          values,
          setValues,
          errors,
          setErrors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isValid,
        }) => {
          useEffect(() => {
            onChange && onChange(values);
          }, [values]);

          getValues && getValues(values);
          printLog("FormErrors", errors);
          return (
            <form className={`grid py-2 ${className}`}>
              {design.map((item, index) => {
                if (item.hidden && item.hidden(values)) {
                  return;
                }
                switch (item.inputType) {
                  case "gap":
                    return <div key={index} />;

                  case "view":
                    return (
                      <div key={index} className={item.className}>
                        {item.customView ? item.customView(values) : null}
                      </div>
                    );

                  case "image":
                    return (
                      <ImageCropInput
                        key={index}
                        name={item.fieldName}
                        aspectRatio={item.imageAspectRatio || 1}
                        className={item.className}
                        value={item.loadValue ? item.loadValue(values) : values[item.fieldName]}
                        //  @ts-ignore
                        error={errors[item.fieldName]}
                        placeHolder={item.placeholder}
                        onChange={(base64) => {
                          if (item.onChange) {
                            item.onChange(base64, setValues as any, values);
                          } else {
                            setValues({ ...values, [item.fieldName]: base64 });
                          }
                        }}
                        {...item.props}
                      />
                    );

                  case "select":
                    return (
                      <SelectInput
                        required={item.required}
                        containerClassName={item.containerClassName}
                        onChange={(selectedValue) => {
                          if (item.onChange) {
                            item.onChange(selectedValue, setValues as any, values);
                          } else {
                            setValues({ ...values, [item.fieldName]: selectedValue });
                          }
                        }}
                        label={item.label}
                        options={item.options!}
                        searchValue={item.selectSearchValue}
                        className={item.className}
                        name={item.fieldName}
                        placeholder={item.placeholder}
                        onSearchChange={(text) => {
                          if (item.onSelectSearchChange) {
                            item.onSelectSearchChange(text, setValues as any, values);
                          }
                        }}
                        error={touched.hasOwnProperty(item.fieldName) && errors[item.fieldName]}
                        handleBlur={handleBlur}
                        value={item.loadValue ? item.loadValue(values) : values[item.fieldName]}
                        key={index}
                        {...item.props}
                      />
                    );

                  case "enum":
                    return (
                      <EnumInput
                        required={item.required}
                        placeholder={item.placeholder}
                        label={item.label}
                        error={touched.hasOwnProperty(item.fieldName) && errors[item.fieldName]}
                        className={item.className}
                        containerClassName={item.containerClassName}
                        onChange={(selectedValue) => {
                          if (item.onChange) {
                            item.onChange(selectedValue, setValues as any, values);
                          } else {
                            setValues({ ...values, [item.fieldName]: selectedValue });
                          }
                        }}
                        options={item.options!}
                        value={item.loadValue ? item.loadValue(values) : values[item.fieldName]}
                        key={index}
                        {...item.props}
                      />
                    );

                  case "switch":
                    return (
                      <SwitchComponent
                        containerClassName={item.containerClassName}
                        onChange={(v) => {
                          setValues({ ...values, [item.fieldName]: v });
                        }}
                        label={item.label}
                        name={item.fieldName}
                        key={index}
                        value={item.loadValue ? item.loadValue(values) : values[item.fieldName]}
                        className={item.className}
                        {...item.props}
                      />
                    );

                  default:
                    return (
                      <InputField
                        required={item.required}
                        containerClassName={item.containerClassName}
                        onChange={(e) => {
                          if (item.onChange) {
                            item.onChange(e, setValues as any, values);
                          } else {
                            handleChange(e);
                          }
                        }}
                        label={item.label}
                        value={item.loadValue ? item.loadValue(values) : values[item.fieldName]}
                        className={item.className}
                        //   @ts-ignore
                        error={touched.hasOwnProperty(item.fieldName) && errors[item.fieldName]}
                        key={index}
                        multiline={item.inputType === "textarea"}
                        name={item.fieldName}
                        onBlur={handleBlur}
                        placeholder={item.placeholder}
                        type={item.inputType}
                        {...item.props}
                      />
                    );
                }
              })}

              {showSubmitButton && SubmitButton && (
                <SubmitButton isValid={isValid} handleSubmit={handleSubmit} />
              )}
            </form>
          );
        }}
      </Formik>
    </div>
  );
};

export default FormBuilder;
