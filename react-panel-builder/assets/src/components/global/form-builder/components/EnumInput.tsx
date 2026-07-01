import React, { useState } from "react";
import DropDown from "../../DropDown";
import classNames from "classnames";
import { useOutsideClick } from "../../../../hooks/useOutsideClick";
import { IoMdArrowDropdown } from "react-icons/io";

type Props = {
  placeholder?: string;
  value: any;
  onChange: (value: any) => void;
  options: { label: string; value: any }[];
  bgColor?: string;
  containerClassName?: string;
  className?: string;
  error?: any;
  label?: string;
  required?: boolean;
};

const myInput = "text-black text-sm rounded-lg  focus:outline-none block w-full p-3";

const EnumInput = ({
  placeholder = "Select...",
  value,
  onChange,
  options,
  containerClassName,
  bgColor = "bg-[var(--light-white)]",
  className,
  error,
  label,
  required,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const showValue = options.find((item) => item.value == value)?.label;

  const ref = useOutsideClick(() => {
    setIsOpen(false);
  });

  return (
    <div ref={ref} className={classNames("relative mt-3 w-full", containerClassName)}>
      {error && (
        <div className="text-[12px] text-red-500 absolute -top-2 right-2 px-2 bg-white rounded-md border-[1px] border-red-500">
          {error}
        </div>
      )}

      {label && (
        <div className="text-[12px] text-sidebarColor absolute -top-2 left-2 px-2 bg-white rounded-md border-[0.5px] border-slate-200">
          {label} {required && <span className="text-red-500">*</span>}
        </div>
      )}
      <div
        className={classNames(
          myInput,
          bgColor,
          className,
          { "border-red-500 border": error },
          { "border-slate-200 border": !error }
        )}
        onClick={() => {
          setIsOpen((p) => !p);
        }}
      >
        <div className={classNames(`${showValue ? "text-black" : "text-gray-500"}`)}>
          {showValue || placeholder}
          <span
            className={classNames("text-gray-500 absolute right-3 top-3 duration-300 ", {
              "rotate-180": isOpen,
            })}
          >
            <IoMdArrowDropdown className="text-xl" />
          </span>
        </div>
      </div>
      <div>
        <DropDown
          className="absolute w-full"
          isOpen={isOpen}
          sections={[
            [
              {
                content: "Select...",
                onClick: () => {
                  onChange(null);
                  setIsOpen(false);
                },
              },
              ...options.map((item) => ({
                content: item.label,
                onClick: () => {
                  onChange(item.value);
                  setIsOpen(false);
                },
              })),
            ],
          ]}
        />
      </div>
    </div>
  );
};

export default EnumInput;
