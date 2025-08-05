// VoltageChart.tsx - Fixed
"use client";
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface VoltageData {
  time: string;
  VR: number;
  VS: number;
  VT: number;
}

interface VoltageChartProps {
  data: VoltageData[];
}

const VoltageChart: React.FC<VoltageChartProps> = ({ data }) => {
  return (
    <div className="dashboard-card h-[400px] mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Voltage Monitor (R, S, T)</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
            <span className="text-sm text-muted-foreground">VR</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
            <span className="text-sm text-muted-foreground">VS</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
            <span className="text-sm text-muted-foreground">VT</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12, fill: "#888" }}
            axisLine={{ stroke: "#e0e0e0" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#888" }}
            axisLine={{ stroke: "#e0e0e0" }}
            label={{ value: "Voltage (V)", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              border: "none",
            }}
            formatter={(value: number, name: string) => [
              `${value?.toFixed(2) || 0}V`,
              name,
            ]}
          />
          <Line
            type="monotone"
            dataKey="VR"
            stroke="#ef4444"
            strokeWidth={2.5}
            dot={{ fill: "#ef4444", r: 3 }}
            activeDot={{ r: 5, fill: "#ef4444" }}
          />
          <Line
            type="monotone"
            dataKey="VS"
            stroke="#eab308"
            strokeWidth={2.5}
            dot={{ fill: "#eab308", r: 3 }}
            activeDot={{ r: 5, fill: "#eab308" }}
          />
          <Line
            type="monotone"
            dataKey="VT"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={{ fill: "#3b82f6", r: 3 }}
            activeDot={{ r: 5, fill: "#3b82f6" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VoltageChart;
