import React from "react";
import { cn } from "@/lib/utils";

export function Badge({ children, variant = "default", className }) {
  const variants = {
    default: "bg-autumn-100 text-autumn-800 border-autumn-300",
    success: "bg-sage-100 text-sage-700 border-sage-500/30",
    warning: "bg-amberGold-100 text-amberGold-600 border-amberGold-500/30",
    danger: "bg-red-100 text-red-700 border-red-300",
    primary: "bg-autumn-500 text-white border-autumn-600",
    info: "bg-amber-100 text-amber-800 border-amber-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
