import React, { useMemo, useState } from "react";
import { FaCalendarAlt, FaFilter, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { formatDate } from "../../utils";

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onApplyFilter: (startDate: string, endDate: string) => void;
  className?: string;
}

type PresetRange = {
  label: string;
  startDate: () => string;
  endDate: () => string;
};

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApplyFilter,
  className = "",
}) => {
  // State to control filter expansion
  const [isExpanded, setIsExpanded] = useState(false);

  // Toggle expansion state
  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(-1);

  // Define preset date ranges
  const presetRanges: PresetRange[] = [
    {
      label: "Today",
      startDate: () => new Date().toISOString().split("T")[0],
      endDate: () => new Date().toISOString().split("T")[0],
    },
    {
      label: "Yesterday",
      startDate: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().split("T")[0];
      },
      endDate: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().split("T")[0];
      },
    },
    {
      label: "Last 7 Days",
      startDate: () => {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        return lastWeek.toISOString().split("T")[0];
      },
      endDate: () => new Date().toISOString().split("T")[0],
    },
    {
      label: "Last 30 Days",
      startDate: () => {
        const lastMonth = new Date();
        lastMonth.setDate(lastMonth.getDate() - 30);
        return lastMonth.toISOString().split("T")[0];
      },
      endDate: () => new Date().toISOString().split("T")[0],
    },
    {
      label: "This Month",
      startDate: () => {
        const thisMonth = new Date();
        thisMonth.setDate(1);
        return thisMonth.toISOString().split("T")[0];
      },
      endDate: () => new Date().toISOString().split("T")[0],
    },
  ];

  // Apply a preset range
  const applyPresetRange = (preset: PresetRange) => {
    const startDate = preset.startDate();
    const endDate = preset.endDate();
    onStartDateChange(startDate);
    onEndDateChange(endDate);
    onApplyFilter(startDate, endDate);
  };

  return (
    <div className={`bg-white rounded-lg  transition-all duration-300 ${className}`}>
      {/* Header - Always visible */}
      <div
        className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50/90 transition-colors rounded-lg"
        onClick={toggleExpansion}
      >
        <div className="flex items-center">
          <div className="bg-[var(--primary)]/10 p-2.5 rounded-full mr-3">
            <FaCalendarAlt className="text-[var(--primary)]" size={18} />
          </div>
          <div>
            <h2 className="font-medium text-gray-800">Date Range Filter</h2>
            <p className="text-sm text-gray-500">
              {formatDate(startDate)} - {formatDate(endDate)}
            </p>
          </div>
        </div>
        <button
          className="p-2 hover:bg-[var(--primary)]/10 rounded-full transition-colors text-gray-500 hover:text-[var(--primary)]"
          aria-label={isExpanded ? "Collapse filter" : "Expand filter"}
        >
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-0 border-t border-gray-100 animate-fadeIn">
          <div className="flex flex-col space-y-4">
            {/* Title and preset ranges */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center mb-3 md:mb-0">
                <FaCalendarAlt className="mr-2 text-[var(--primary)]" />
                Select Date Range
              </h2>
              <div className="flex flex-wrap gap-2">
                {presetRanges.map((preset, index) => (
                  <button
                    key={index}
                    className={`px-3 py-1.5 text-sm  font-medium rounded-md transition-colors ${
                      selectedPresetIndex === index
                        ? "bg-[var(--primary)] text-white"
                        : "bg-[var(--primary)]/10  text-[var(--primary)] hover:bg-[var(--primary)]/20"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPresetIndex(index);
                      applyPresetRange(preset);
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date inputs and apply button */}
            <div className="flex flex-col md:flex-row items-end gap-4">
              <div className="w-full md:w-auto">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaCalendarAlt className="text-gray-400" />
                  </div>
                  <input
                    id="startDate"
                    type="date"
                    className="w-full pl-10 p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                    value={startDate}
                    onChange={(e) => onStartDateChange(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              <div className="w-full md:w-auto">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaCalendarAlt className="text-gray-400" />
                  </div>
                  <input
                    id="endDate"
                    type="date"
                    className="w-full pl-10 p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                    value={endDate}
                    onChange={(e) => onEndDateChange(e.target.value)}
                    min={startDate}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              <button
                className="w-full md:w-auto bg-[var(--primary)] text-white px-5 py-2.5 rounded-md hover:bg-opacity-90 transition-all flex items-center justify-center space-x-2 "
                onClick={(e) => {
                  e.stopPropagation();
                  onApplyFilter(startDate, endDate);
                  setIsExpanded(false);
                }}
              >
                <FaFilter />
                <span>Apply Filter</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add this CSS to enable animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out forwards;
  }
`;
document.head.appendChild(styleSheet);

export default DateRangeFilter;
