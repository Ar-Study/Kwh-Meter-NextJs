// KwhChart.tsx - Fixed
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

interface KwhData {
  time: string;
  KWH: number;
}

interface KwhProps {
  data: KwhData[];
}

const KwhChart: React.FC<KwhProps> = ({ data }) => {
  return (
    <div className="dashboard-card h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">
          Power Consumption (kWh) - Real-time
        </h2>
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></span>
          <span className="text-sm text-muted-foreground">kWh (Real-time)</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart
          data={data}
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
            formatter={(value: number) => [
              `${value?.toFixed(3) || 0} kWh`,
              "Power Consumption",
            ]}
          />
          <Area
            type="monotone"
            dataKey="KWH"
            stroke="#6366f1"
            fill="url(#colorKWH)"
            fillOpacity={0.6}
            strokeWidth={2}
          />
          <defs>
            <linearGradient id="colorKWH" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default KwhChart;
