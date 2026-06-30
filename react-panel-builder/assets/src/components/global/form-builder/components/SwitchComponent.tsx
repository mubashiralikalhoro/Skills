import { cn } from "../../../../utils";
import React from "react";

interface Props {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  name?: string;
  containerClassName?: string;
  className?: string;
}

const SwitchComponent = ({
  value,
  onChange = () => {},
  label = "",
  name,
  containerClassName,
  className,
}: Props) => {
  const toggleEnable = () => {
    onChange(!value);
  };

  return (
    <div className={cn("flex items-center", containerClassName)}>
      <span className="mr-2 text-sm">{label}</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input name={name} type="checkbox" className="sr-only" checked={value} onChange={toggleEnable} />
        <div
          className={cn(
            `w-10 h-6 rounded-full ${value ? "bg-primary" : "bg-slate-200"} transition-colors`,
            className
          )}
        ></div>
        <span
          className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${
            value ? "transform translate-x-4" : ""
          }`}
        ></span>
      </label>
    </div>
  );
};

export default SwitchComponent;
