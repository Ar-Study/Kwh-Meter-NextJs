"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { MenuIcon, Settings, EyeOff, Eye } from "lucide-react";

interface DashboardHeaderProps {
  isAdmin: boolean;
  isConnected: boolean;
  hideCostWithoutBooster: boolean;
  onToggleHideCost: () => void;
  onOpenCalibration: () => void;
  onToggleSidebar: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  isAdmin,
  isConnected,
  hideCostWithoutBooster,
  onToggleHideCost,
  onOpenCalibration,
  onToggleSidebar,
}) => {
  return (
    <header className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-2xl font-bold">Electricity Monitoring Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          {isAdmin
            ? "Monitor real-time electricity usage with live cost calculations and calibration."
            : "Track your electricity consumption with real-time cost estimates."}
        </p>
        {!isConnected && (
          <p className="text-red-500 text-sm mt-1">
            ⚠️ MQTT connection not established
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {isAdmin && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleHideCost}
              className="flex items-center gap-2"
            >
              {hideCostWithoutBooster ? (
                <Eye size={16} />
              ) : (
                <EyeOff size={16} />
              )}
              {hideCostWithoutBooster ? "Tampilkan" : "Sembunyikan"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenCalibration}
              className="flex items-center gap-2"
            >
              <Settings size={16} />
              Kalibrasi
            </Button>
          </>
        )}
        <button
          className="md:hidden p-2 rounded-md hover:bg-muted"
          onClick={onToggleSidebar}
        >
          <MenuIcon size={20} />
        </button>
      </div>
    </header>
  );
};
