import React from "react";
// import RevenueChart from "./RevenueCharts";
// import VoltageChart from "./VoltageCharts";
// import KwhChart from "./KwhCharts";

const DashboardCharts: React.FC = () => {
  return (
    <>
      {/* Charts - 2 in first row */}
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 animate-fade-in"
        style={{ animationDelay: "0.3s" }}
      >
        {/* <VoltageChart data={} />
        <RevenueChart data={} /> */}
      </div>

      {/* Charts - 1 in second row */}
      <div
        className="grid grid-cols-1 gap-6 mb-6 animate-fade-in"
        style={{ animationDelay: "0.4s" }}
      >
        {/* <KwhChart data={} /> */}
      </div>
    </>
  );
};

export default DashboardCharts;
