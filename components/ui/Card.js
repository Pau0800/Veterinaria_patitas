import React from "react";
import { cn } from "@/lib/utils";

export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-autumn-200 shadow-autumn-sm hover:shadow-autumn-md transition-shadow duration-200 overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn("p-5 border-b border-autumn-100 flex items-center justify-between", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }) {
  return <h3 className={cn("text-lg font-bold text-autumn-900", className)}>{children}</h3>;
}

export function CardDescription({ children, className }) {
  return <p className={cn("text-xs text-autumn-800/70 mt-1", className)}>{children}</p>;
}

export function CardContent({ children, className }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

export function CardFooter({ children, className }) {
  return (
    <div className={cn("p-4 bg-autumn-50/50 border-t border-autumn-100 flex items-center justify-between", className)}>
      {children}
    </div>
  );
}
