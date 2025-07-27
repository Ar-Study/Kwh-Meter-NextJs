"use client";

import React from "react";
import { LayoutDashboard, FileText, Users, ChevronLeft } from "lucide-react";

// ULTRA SIMPLE - NO STATE, NO CALLBACKS, NO COMPLEX LOGIC
interface DashboardSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  isCollapsed,
  onToggle,
}) => {
  // Static menu - no filtering, no dynamic logic
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: FileText, label: "Laporan", href: "/laporan" },
    { icon: Users, label: "Management", href: "/management" },
  ];

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
      style={{
        backgroundColor: "white",
        borderRight: "1px solid #e5e7eb",
        transition: "width 0.3s ease-in-out",
      }}
    >
      {/* Header with Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded text-white flex items-center justify-center font-bold">
              A
            </div>
            <span className="font-semibold">AHC</span>
          </div>
        )}

        <button
          onClick={onToggle}
          className="p-2 rounded hover:bg-gray-100"
          style={{
            padding: "8px",
            borderRadius: "4px",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          <ChevronLeft
            size={16}
            style={{
              transform: isCollapsed ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          />
        </button>
      </div>

      {/* Menu Items */}
      <div className="p-2 space-y-1">
        {menuItems.map((item, index) => (
          <a
            key={index}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 text-gray-700"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "8px 12px",
              borderRadius: "6px",
              textDecoration: "none",
              color: "#374151",
              transition: "background-color 0.15s ease",
            }}
          >
            <item.icon size={18} />
            {!isCollapsed && <span>{item.label}</span>}
          </a>
        ))}
      </div>

      {/* User Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              U
            </div>
            <div>
              <div className="text-sm font-medium">Test User</div>
              <div className="text-xs text-gray-500">Admin</div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              U
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardSidebar;
