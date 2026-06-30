import React, { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  change?: string;
  isPositive?: boolean;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, change, isPositive, className = "" }) => {
  return (
    <div className={`bg-white rounded-lg flex p-4 ${className}`}>
      <div className="flex justify-between my-auto  w-full items-start">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          {change && (
            <div className="flex items-center mt-2">
              <span className={`text-xs font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}>
                {change}
              </span>
              <span className="text-gray-400 text-xs ml-1">vs last week</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-full bg-gray-100">{icon}</div>
      </div>
    </div>
  );
};

export default StatsCard;
