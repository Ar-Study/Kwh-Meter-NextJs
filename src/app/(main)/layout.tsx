"use client";

import React, { useState } from "react";
import SimpleSidebar from "@/components/DashboardSideBar";
import { DashboardHeader } from "@/components/ClientHeader";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // SINGLE STATE - NO COMPLEX LOGIC
  // const [collapsed, setCollapsed] = useState(false);
  const isAdmin = true; // Simulating admin state, replace with actual logic
  // SIMPLE TOGGLE FUNCTION - NO ASYNC, NO SIDE EFFECTS

  // console.log("Layout render, collapsed:", collapsed);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isConnected = true; // Simulating connection state, replace with actual logic
  const [calibrationOpen, setCalibrationOpen] = useState(false);
  const [hideCostWithoutBooster, setHideCostWithoutBooster] = useState(false);
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      {/* Simple Sidebar */}
      <SimpleSidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      {/* Simple Header */}{" "}
      <div
        className={`flex-1 p-6 overflow-y-auto  ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <DashboardHeader
          isAdmin={isAdmin}
          isConnected={isConnected}
          hideCostWithoutBooster={hideCostWithoutBooster}
          onToggleHideCost={() =>
            setHideCostWithoutBooster(!hideCostWithoutBooster)
          }
          onOpenCalibration={() => setCalibrationOpen(true)}
          onToggleSidebar={toggleSidebar}
        />
        <main style={{ padding: "24px" }}>{children}</main>
      </div>
      {/* Main Content */}
    </div>
  );
}
