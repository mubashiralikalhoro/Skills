import React from "react";

interface BarChartItem {
  label: string;
  value: number;
  color: string;
}

interface BarChartCardProps {
  title: string;
  data: BarChartItem[];
  className?: string;
}

const BarChartCard: React.FC<BarChartCardProps> = ({ title, data, className = "" }) => {
  // Find the maximum value for scaling the bars properly
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className={`bg-white rounded-lg  p-6 ${className}`}>
      <h2 className="text-xl font-semibold mb-6">{title}</h2>

      <div className="flex flex-col gap-3">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">{item.label}</span>
              <span className="text-sm font-medium">{item.value}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="h-4 rounded-full"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color,
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChartCard;
