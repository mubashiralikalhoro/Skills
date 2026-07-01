import React from "react";
import FormBuilder, { FormItem } from "./form-builder/FormBuilder";
import { cn } from "../../utils";

interface FilterBuilderProps {
  filters: any;
  setFilters: any;
  design: FormItem[];
  className?: string;
  isVisible?: boolean;
}

const FilterBuilder = ({ filters, setFilters, design, className, isVisible = true }: FilterBuilderProps) => {
  return (
    <div
      className={cn("bg-white rounded-lg p-4 border border-zinc-200 ", className, {
        "hidden ": !isVisible,
        "flex w-full flex-col": isVisible,
      })}
    >
      <FormBuilder
        value={filters}
        onSubmit={() => {}}
        design={design}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 -mt-1"
        onChange={setFilters}
      />
    </div>
  );
};

export default FilterBuilder;
