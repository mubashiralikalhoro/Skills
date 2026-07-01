import React, { ReactNode } from "react";

interface ActivityItem {
  icon: ReactNode;
  title: string;
  time: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  title?: string;
  className?: string;
}

const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  title = "Recent Activities",
  className = "",
}) => {
  return (
    <div className={`bg-white rounded-lg  p-6 ${className}`}>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center py-2 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
              {activity.icon}
            </div>
            <div className="flex-1">
              <p className="font-medium">{activity.title}</p>
              <p className="text-sm text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <div className="text-center py-4 text-gray-500">No recent activities</div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
