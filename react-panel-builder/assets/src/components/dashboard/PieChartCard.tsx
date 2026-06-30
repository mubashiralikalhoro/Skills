import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  TooltipItem,
} from "chart.js";

// Register required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface ChartDataItem {
  label: string;
  value: number;
  color: string;
}

interface PieChartCardProps {
  title: string;
  data: ChartDataItem[];
  className?: string;
}

const PieChartCard: React.FC<PieChartCardProps> = ({ title, data, className = "" }) => {
  // Calculate total for percentages in the legend
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Prepare data for Chart.js
  const chartData: ChartData<"pie"> = {
    labels: data.map((item) => `${item.label} (${item.value})`),
    datasets: [
      {
        data: data.map((item) => (item.value > 0 ? item.value : 0.001)), // Use a tiny value instead of 0 to show in chart
        backgroundColor: data.map((item) => item.color),
        borderColor: Array(data.length).fill("#ffffff"),
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide built-in legend, we'll use custom one
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<"pie">) => {
            const label = context.label || "";
            const value = context.raw as number;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
            return `${label}: ${percentage}%`;
          },
        },
      },
    },
  };

  return (
    <div className={`bg-white rounded-lg p-6 ${className}`}>
      <h2 className="text-xl font-semibold mb-6">{title}</h2>

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Chart.js Pie Chart */}
        <div className="relative h-64 w-64">
          <Pie data={chartData} options={chartOptions} />
        </div>

        {/* Custom Legend */}
        <div className="flex flex-col gap-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="w-4 h-4 rounded-sm mr-2" style={{ backgroundColor: item.color }}></div>
              <span className="text-sm">
                {item.label}: {item.value} ({total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PieChartCard;
