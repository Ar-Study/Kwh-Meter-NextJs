"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Users,
  ChevronLeft,
  LogOut,
} from "lucide-react";

interface DashboardSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  isCollapsed,
  onToggle,
}) => {
  const { data: session } = useSession();

  // Menu selain logout
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/", role: "user" },
    { icon: FileText, label: "Laporan", href: "/laporan", role: "user" },
    { icon: Users, label: "Management", href: "/management", role: "admin" },
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
          type="button"
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
        {menuItems
          .filter((item) => session?.user?.role === item.role)
          .map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 text-gray-700"
            >
              <item.icon size={18} />
              {!isCollapsed && <span>{item.label}</span>}
            </a>
          ))}

        {/* Logout Button */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 text-gray-700 w-full text-left"
          type="button"
        >
          <LogOut size={18} />
          {!isCollapsed && <span>Keluar</span>}
        </button>
      </div>

      {/* User Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
            <div>
              <div className="text-sm font-medium">{session?.user?.name}</div>
              <div className="text-xs text-gray-500">{session?.user?.role}</div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardSidebar;
