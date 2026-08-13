import React from "react";
import { cn } from "@/lib/utils";

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  disabled,
  type = "button",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95";

  const variants = {
    primary:
      "bg-autumn-500 hover:bg-autumn-600 text-white focus:ring-autumn-500 shadow-autumn-sm hover:shadow-autumn-md",
    secondary:
      "bg-autumn-100 hover:bg-autumn-200 text-autumn-900 focus:ring-autumn-300 border border-autumn-200",
    amber:
      "bg-amberGold-500 hover:bg-amberGold-600 text-white focus:ring-amberGold-500 shadow-autumn-sm",
    sage:
      "bg-sage-500 hover:bg-sage-600 text-white focus:ring-sage-500 shadow-autumn-sm",
    outline:
      "border border-autumn-300 text-autumn-800 hover:bg-autumn-100 focus:ring-autumn-400",
    ghost:
      "text-autumn-800 hover:bg-autumn-100 focus:ring-autumn-300",
    danger:
      "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-autumn-sm",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs font-semibold gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
