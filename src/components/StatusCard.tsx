// EnhancedStatCard.tsx - Fixed
import React from "react";
import { cn } from "@/lib/utils";

type EnhancedStatCardProps = {
  title: string;
  value: string;
  unit?: string;
  delta?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
  subtitle?: string;
};

const EnhancedStatCard = ({
  title,
  value,
  unit,
  delta,
  icon,
  className,
  subtitle,
}: EnhancedStatCardProps) => {
  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200",
        className
      )}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
          <div className="flex items-baseline gap-1 mb-1">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {unit && (
              <span className="text-sm text-gray-500 font-medium">{unit}</span>
            )}
          </div>
          {subtitle && <p className="text-xs text-gray-500 mb-2">{subtitle}</p>}
          {delta && (
            <div
              className={cn(
                "flex items-center text-sm font-medium",
                delta.isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              <span className="mr-1">{delta.isPositive ? "↗" : "↘"}</span>
              <span>{delta.value}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-blue-600 opacity-80 flex-shrink-0 ml-4">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedStatCard;
