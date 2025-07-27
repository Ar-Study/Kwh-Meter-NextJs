import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ArusData {
  time: string;
  IR: number | null;
  IS: number | null;
  IT: number | null;
}

interface ArusChartProps {
  data: ArusData[];
}

const RevenueChart: React.FC<ArusChartProps> = ({ data }) => {
  return (
    <div className="dashboard-card h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">
          Current Monitor (R, S, T) - Enhanced
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
            <span className="text-sm text-muted-foreground">IR</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
            <span className="text-sm text-muted-foreground">IS</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-orange-500 mr-2"></span>
            <span className="text-sm text-muted-foreground">IT</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <LineChart
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
            label={{ value: "Current (A)", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              border: "none",
            }}
            formatter={(value: number) => [`${value}A`, ""]}
          />
          <Line
            type="monotone"
            dataKey="IR"
            stroke="#8b5cf6"
            strokeWidth={2.5}
            dot={{ fill: "#8b5cf6", r: 4 }}
            activeDot={{ r: 6, fill: "#8b5cf6" }}
          />
          <Line
            type="monotone"
            dataKey="IS"
            stroke="#10b981"
            strokeWidth={2.5}
            dot={{ fill: "#10b981", r: 4 }}
            activeDot={{ r: 6, fill: "#10b981" }}
          />
          <Line
            type="monotone"
            dataKey="IT"
            stroke="#f97316"
            strokeWidth={2.5}
            dot={{ fill: "#f97316", r: 4 }}
            activeDot={{ r: 6, fill: "#f97316" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
