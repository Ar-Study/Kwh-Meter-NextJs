import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface KWHData {
  time: string;
  IR: number | null;
  IS: number | null;
  IT: number | null;
}

const KwhChart = () => {
  // Transform enhanced MQTT data for KWH chart
  const kwhData = realtimeData
    .map((data, index) => ({
      time: new Date(data.timestamp).toLocaleTimeString(),
      KWH: data.KWH,
    }))
    .slice(-20); // Show last 20 data points

  return (
    <div className="dashboard-card h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">
          Power Consumption (kWh) - Enhanced
        </h2>
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></span>
          <span className="text-sm text-muted-foreground">kWh (Database)</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <AreaChart
          data={kwhData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12, fill: "#888" }}
            axisLine={{ stroke: "#e0e0e0" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#888" }}
            axisLine={{ stroke: "#e0e0e0" }}
            label={{ value: "Power (kWh)", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              border: "none",
            }}
            formatter={(value: number) => [`${value} kWh`, "Power Consumption"]}
          />
          <Area
            type="monotone"
            dataKey="KWH"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default KwhChart;
