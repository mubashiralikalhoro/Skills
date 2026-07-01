import React, { useEffect, useState } from "react";
import InputField from "./InputField";
import { IoIosClose, IoMdArrowDropdown } from "react-icons/io";
import LoaderIcon from "../../LoaderIcon";
import DropDown from "../../DropDown";
import { useOutsideClick } from "../../../../hooks/useOutsideClick";
import classNames from "classnames";

interface Props {
  value?: any;
  name?: string;
  handleBlur?: any;
  error?: any;
  onSearchChange: (text: string) => any;
  searchValue: any;
  onChange: (v: any) => any;
  placeholder?: string;
  className?: string;
  label?: string;
  options: { value: any; label: string }[];
  containerClassName?: string;
  bgColor?: string;
  loading?: boolean;
  showText?: boolean;
  required?: boolean;
}

const SelectInput = ({
  value,
  placeholder,
  handleBlur,
  options,
  className,
  error,
  name,
  searchValue,
  label,
  onSearchChange,
  onChange,
  containerClassName,
  bgColor,
  loading,
  showText = false,
  required = false,
}: Props) => {
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const getLabel = () => {
    return value ? options.find((option) => option.value === value)?.label : "";
  };
  const [showLabelText, setShowLabelText] = useState(getLabel());

  useEffect(() => {
    if (showText) {
      const label = getLabel();
      if (label) {
        setShowLabelText(label);
      }
    }
  }, [options]);

  const getOptions = () => {
    if (loading) {
      return [
        {
          content: <LoaderIcon className="mx-auto" />,
          clickable: false,
        },
      ];
    }

    if (options.length === 0) {
      return [
        {
          content: <div className="text-gray-500 text-sm">No options found</div>,
          clickable: false,
        },
      ];
    }

    return options.map((option) => ({
      content: option.label,
      onClick: () => {
        setShowLabelText(option.label);
        onChange(option.value);
      },
    }));
  };

  const ref = useOutsideClick(() => {
    setIsDropDownOpen(false);
  });

  const showValue = showText ? showLabelText || value : value;

  return (
    <div ref={ref} className={containerClassName}>
      <InputField
        required={required}
        bgColor={bgColor}
        onChange={(e) => onSearchChange(e.target.value)}
        endView={
          <span
            className={classNames("text-gray-500 absolute right-3 top-3 duration-300 ", {
              "rotate-180": isDropDownOpen,
            })}
          >
            <IoMdArrowDropdown className="text-xl" />
          </span>
        }
        startView={
          showValue && (
            <div
              className="bg-white border border-zinc-200 text-black mr-2 text-xs rounded-md px-1 pr-2 items-center flex justify-center gap-1"
              onClick={() => {
                setShowLabelText("");
                onChange(null);
              }}
            >
              <IoIosClose className="hover:scale-80 cursor-pointer text-lg  bg-zinc-200 rounded-md scale-75" />
              {showValue}
            </div>
          )
        }
        label={label}
        value={searchValue}
        className={className}
        //   @ts-ignore
        error={error}
        name={name}
        onBlur={(e) => {
          handleBlur && handleBlur(e);
          setTimeout(() => {
            setIsDropDownOpen((p) => false);
          }, 300);
        }}
        onFocus={() => {
          setIsDropDownOpen((p) => true);
        }}
        placeholder={placeholder}
        type="text"
      />

      <div className="relative w-full">
        <DropDown className="absolute w-full" isOpen={isDropDownOpen} sections={[getOptions()]} />
      </div>
    </div>
  );
};

export default SelectInput;
