import React from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export function StatsCard({ title, value, icon: Icon, description, trend, variant = "primary" }) {
  const iconVariants = {
    primary: "bg-autumn-100 text-autumn-600 border-autumn-300",
    amber: "bg-amberGold-100 text-amberGold-600 border-amberGold-300",
    sage: "bg-sage-100 text-sage-600 border-sage-300",
    danger: "bg-red-100 text-red-600 border-red-300",
  };

  return (
    <Card className="hover:-translate-y-0.5 transition-transform duration-200">
      <div className="p-5 flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-autumn-800/70 tracking-wide uppercase">
            {title}
          </span>
          <div className="text-2xl lg:text-3xl font-extrabold text-autumn-900 tracking-tight">
            {value}
          </div>
          {description && (
            <p className="text-xs text-autumn-800/60 font-medium pt-1">{description}</p>
          )}
        </div>

        <div
          className={cn(
            "p-3 rounded-xl border flex items-center justify-center shadow-autumn-sm",
            iconVariants[variant]
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
}
