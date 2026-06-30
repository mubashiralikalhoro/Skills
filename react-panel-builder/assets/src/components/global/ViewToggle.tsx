import React from "react";
import { FaTable, FaChartPie } from "react-icons/fa";

type ViewType = "table" | "chart";

interface ViewToggleProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  className?: string;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ activeView, onViewChange, className = "" }) => {
  return (
    <div className={`inline-flex rounded-md  ${className}`}>
      <button
        type="button"
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-l-md 
          ${
            activeView === "table"
              ? "bg-[var(--primary)] text-white"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }
          border border-gray-300`}
        onClick={() => onViewChange("table")}
      >
        <FaTable />
        Table
      </button>
      <button
        type="button"
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-r-md 
          ${
            activeView === "chart"
              ? "bg-[var(--primary)] text-white"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }
          border border-gray-300 border-l-0`}
        onClick={() => onViewChange("chart")}
      >
        <FaChartPie />
        Chart
      </button>
    </div>
  );
};

export default ViewToggle;
