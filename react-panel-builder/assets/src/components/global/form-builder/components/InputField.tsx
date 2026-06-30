import classNames from "classnames";
import React from "react";

const myInput = " text-black text-sm rounded-lg  focus:outline-none block w-full p-3";

type Props = {
  name?: string;
  className?: string;
  placeholder?: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string | undefined | null | boolean;
  type?: string;
  multiline?: boolean;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  [key: string]: any;
  suggestions?: string[];
  label?: string;
  onFocus?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  startView?: React.ReactNode;
  containerClassName?: string;
  bgColor?: string;
  required?: boolean;
  endView?: React.ReactNode;
};

const InputField = ({
  name,
  className,
  placeholder,
  value,
  onChange,
  type,
  error,
  label,
  multiline,
  onBlur,
  suggestions,
  onFocus,
  startView,
  containerClassName,
  bgColor = "bg-[var(--light-white)]",
  required,
  endView,
  ...props
}: Props) => {
  return (
    <div className={classNames("relative mt-3 w-full", containerClassName)}>
      <div
        className={`${myInput} ${bgColor} w-full flex border-[1px] ${
          error ? " border-red-500" : "border-[var(--light-white)]"
        }`}
      >
        {startView}
        {multiline ? (
          <textarea
            name={name}
            className={`h-32  flex-1 focus:outline-none bg-transparent  ${className}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            {...props}
          />
        ) : (
          <input
            name={name}
            className={`focus:outline-none flex-1 bg-transparent ${bgColor}  ${className} ${
              type === "date" || type === "datetime-local" ? "min-h-5 text-start" : ""
            }`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            type={type}
            onFocus={onFocus}
            onBlur={onBlur}
            {...props}
            list="suggest"
          />
        )}
        {endView}
      </div>
      <datalist id="suggest">
        {suggestions?.map((item, index) => (
          <option key={index} value={item} />
        ))}
      </datalist>

      {error && (
        <div className="text-[12px] text-red-500 absolute  -top-2 right-2 px-2 bg-white rounded-md border-[1px] border-red-500">
          {error}
        </div>
      )}

      {label && (
        <div className="text-[12px] text-sidebarColor absolute  -top-2 left-2 px-2 bg-white rounded-md border-[0.5px] border-slate-200">
          {label} {required && <span className="text-red-500">*</span>}
        </div>
      )}
    </div>
  );
};

export default InputField;
