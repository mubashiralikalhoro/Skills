import React, { useEffect, useState } from "react";
import {
  FaUserInjured,
  FaCalendarAlt,
  FaClipboardCheck,
  FaPhone,
  FaPhoneVolume,
  FaClock,
  FaHourglass,
  FaChartPie,
} from "react-icons/fa";
import StatsCard from "../../components/dashboard/StatsCard";
import DateRangeFilter from "../../components/global/DateRangeFilter";
import PieChartCard from "../../components/dashboard/PieChartCard";
import BarChartCard from "../../components/dashboard/BarChartCard";

import { useUserContext } from "../../context/user-context";
import LoaderIcon from "../../components/global/LoaderIcon";

// Mock data for template
const mockDashboardData = {
  callSummary: {
    TotalCalls: 1250,
    AnsweredCalls: 980,
    MissedCalls: 180,
    AbandonedCalls: 90,
  },
  callAveragePickupSummary: {
    AveragePickUpTime: "00:02:15",
  },
  callAverageDurationSummary: {
    AverageCallDurations: "00:08:45",
  },
  appointmentSummary: {
    TotalAppointments: 158,
    Confirmed: 95,
    Completed: 78,
    Cancelled: 12,
  },
  upcomingAppointments: [
    {
      id: 1,
      patientName: "John Doe",
      date: "2024-01-15",
      time: "10:00 AM",
      status: "Confirmed",
      type: "Follow-up",
    },
    {
      id: 2,
      patientName: "Jane Smith",
      date: "2024-01-15",
      time: "11:30 AM",
      status: "Confirmed",
      type: "New Patient",
    },
    {
      id: 3,
      patientName: "Mike Johnson",
      date: "2024-01-16",
      time: "09:00 AM",
      status: "Confirmed",
      type: "Consultation",
    },
    {
      id: 4,
      patientName: "Sarah Wilson",
      date: "2024-01-16",
      time: "02:00 PM",
      status: "Confirmed",
      type: "Follow-up",
    },
  ],
};

const DashboardPage: React.FC = () => {
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const { token, user } = useUserContext();
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchDashboardData = async (startDate: string, endDate: string) => {
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setDashboardData(mockDashboardData);
      setLoading(false);
    }, 1000);
  };

  // Sample data for secondary stats cards
  const secondaryStatsCards = [
    {
      title: "All Appointments",
      value: "158",
      icon: <FaCalendarAlt className="text-[var(--primary)]" size={24} />,
      change: "+4.5%",
      isPositive: true,
    },
    {
      title: "Existing Patients",
      value: "127",
      icon: <FaUserInjured className="text-[var(--primary)]" size={24} />,
      change: "+2.2%",
      isPositive: true,
    },
    {
      title: "New Patients",
      value: "24",
      icon: <FaUserInjured className="text-[var(--primary)]" size={24} />,
      change: "+15.1%",
      isPositive: true,
    },
    {
      title: "Retained Patients",
      value: "103",
      icon: <FaUserInjured className="text-[var(--primary)]" size={24} />,
      change: "+1.3%",
      isPositive: true,
    },
  ];

  // Sample data for appointment status chart
  const appointmentStatusData = [
    { label: "Confirmed", value: dashboardData?.appointmentSummary?.Confirmed || 0, color: "#60a5fa" },
    { label: "Completed", value: dashboardData?.appointmentSummary?.Completed || 0, color: "#4ade80" },
    { label: "Canceled", value: dashboardData?.appointmentSummary?.Cancelled || 0, color: "#f87171" },
  ];

  // Sample data for patient type chart
  const patientTypeData = [
    { label: "Existing Patients", value: 127, color: "#60a5fa" },
    { label: "New Patients", value: 24, color: "#4ade80" },
    { label: "Retained Patients", value: 103, color: "#a78bfa" },
  ];

  useEffect(() => {
    fetchDashboardData(startDate, endDate);
  }, []);

  return (
    <div className="w-full mx-auto pb-8 ">
      {/* Quick Actions Section */}

      <div className=" top-0 z-50 mb-8 bg-white p-4 rounded-lg ">
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onApplyFilter={fetchDashboardData as any}
          className="transition-colors duration-300"
        />
      </div>

      {/* Dashboard Content */}
      {loading ? (
        <div className="flex items-center justify-center h-[100px]">
          <LoaderIcon />
        </div>
      ) : (
        <div className="mt-4 space-y-8">
          {/* SECTION 1: STATISTICS */}
          <div>
            <div className="flex items-center mb-6">
              <FaChartPie className="text-[var(--primary)] mr-3" size={20} />
              <h1 className="text-2xl font-bold text-gray-800">Call Analytics</h1>
            </div>

            {/* Call Stats Cards */}
            <div className="mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    title: "Total Calls Placed",
                    value: dashboardData?.callSummary?.TotalCalls || 0,
                    icon: <FaPhone className="text-[var(--primary)]" size={24} />,
                  },
                  {
                    title: "Total Calls Received",
                    value: dashboardData?.callSummary?.AnsweredCalls || 0,
                    icon: <FaPhoneVolume className="text-[var(--primary)]" size={24} />,
                  },
                  {
                    title: "Avg. Time to Answer",
                    value:
                      formateShowTime(dashboardData?.callAveragePickupSummary?.AveragePickUpTime) || "N/A",
                    icon: <FaClock className="text-[var(--primary)]" size={24} />,
                  },
                  {
                    title: "Avg. Call Duration",
                    value:
                      formateShowTime(dashboardData?.callAverageDurationSummary?.AverageCallDurations) ||
                      "N/A",
                    icon: <FaHourglass className="text-[var(--primary)]" size={24} />,
                  },
                ].map((card, index) => (
                  <StatsCard key={index} title={card.title} icon={card.icon} value={card.value?.toString()} />
                ))}
              </div>
            </div>

            {/* Call Results Chart */}
            <div className="mb-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <PieChartCard
                    title="Call Results Distribution"
                    data={[
                      {
                        label: "Answered",
                        value: dashboardData?.callSummary?.AnsweredCalls || 0,
                        color: "#4ade80",
                      },

                      {
                        label: "Missed",
                        value: dashboardData?.callSummary?.MissedCalls || 0,
                        color: "#f87171",
                      },
                      {
                        label: "Abandoned",
                        value: dashboardData?.callSummary?.AbandonedCalls || 0,
                        color: "#fb923c",
                      },
                    ]}
                  />
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4">
                  <BarChartCard title="Appointment Status Distribution" data={appointmentStatusData} />
                </div>

                {/* <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">Call Performance Trends</h2>
                  <div className="flex items-center justify-center h-64 text-gray-400">
                    <p>Call performance trends visualization coming soon</p>
                  </div>
                </div> */}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-8"></div>

          {/* SECTION 2: APPOINTMENTS */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <FaCalendarAlt className="text-[var(--primary)] mr-3" size={20} />
              <h1 className="text-2xl font-bold text-gray-800">Appointments Overview</h1>
            </div>
            {/* Appointment Stats Row */}
            <div className="mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                  title={secondaryStatsCards[0].title}
                  value={dashboardData?.appointmentSummary?.TotalAppointments?.toString() || "0"}
                  icon={secondaryStatsCards[0].icon}
                  // change={secondaryStatsCards[0].change}
                  // isPositive={secondaryStatsCards[0].isPositive}
                />
                <StatsCard
                  title="Confirmed"
                  value={dashboardData?.appointmentSummary?.Confirmed?.toString() || "0"}
                  icon={<FaCalendarAlt className="text-[var(--primary)]" size={24} />}
                  // change="+5.2%"
                  // isPositive={true}
                />
                <StatsCard
                  title="Completed"
                  value={dashboardData?.appointmentSummary?.Completed?.toString() || "0"}
                  icon={<FaClipboardCheck className="text-[var(--primary)]" size={24} />}
                  // change="+3.8%"
                  // isPositive={true}
                />
                <StatsCard
                  title="Canceled"
                  value={dashboardData?.appointmentSummary?.Cancelled?.toString() || "0"}
                  icon={<FaCalendarAlt className="text-[var(--primary)]" size={24} />}
                  // change="-2.1%"
                  // isPositive={true}
                />
              </div>
            </div>

            {/* Appointment Charts */}
            <div className="mb-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* <div className="bg-white rounded-lg shadow-sm p-4">
                  <PieChartCard title="Patient Type Distribution" data={patientTypeData} />
                </div> */}
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Patient Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(dashboardData?.upcomingAppointments || []).map((appointment: any) => (
                          <tr key={appointment.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {appointment.patientName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {appointment.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {appointment.time}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                {appointment.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {appointment.type}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          {/* <div className="border-t border-gray-200 my-8"></div> */}
          {/* SECTION 3: PATIENT ANALYTICS */}
          {/* <div>
            <div className="flex items-center mb-6">
              <FaChartPie className="text-[var(--primary)] mr-3" size={20} />
              <h1 className="text-2xl font-bold text-gray-800">Patient Analytics</h1>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Patient Statistics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {secondaryStatsCards.slice(1).map((card, index) => (
                  <StatsCard
                    key={index}
                    title={card.title}
                    value={card.value}
                    icon={card.icon}
                    change={card.change}
                    isPositive={card.isPositive}
                  />
                ))}
              </div>
            </div>
          </div> */}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;

const formateShowTime = (time: any) => {
  if (!time) return "N/A";
  const [hours, minutes, seconds] = time.split(":");

  const formattedTime = [];

  if (Number(hours) > 0) {
    formattedTime.push(`${hours}h`);
  }

  if (Number(minutes) > 0) {
    formattedTime.push(`${minutes}m`);
  }

  if (Number(seconds) > 0) {
    formattedTime.push(`${seconds}s`);
  }

  return formattedTime.join(" ");
};
