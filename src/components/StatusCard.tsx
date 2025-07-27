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
    <div className={cn("dashboard-card", className)}>
      <div className="flex justify-between items-start bordered ">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className="flex items-baseline gap-1 mt-1">
            <p className="text-2xl font-bold">{value}</p>
            {unit && (
              <span className="text-sm text-muted-foreground">{unit}</span>
            )}
          </div>

          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}

          {delta && (
            <div
              className={`flex items-center text-sm mt-2 ${
                delta.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {delta.isPositive ? "↑" : "↓"}
              <span className="ml-1">{delta.value}</span>
            </div>
          )}
        </div>

        {icon && <div className="text-primary ml-4">{icon}</div>}
      </div>
    </div>
  );
};

export default EnhancedStatCard;
