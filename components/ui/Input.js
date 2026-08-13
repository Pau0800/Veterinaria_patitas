import React from "react";
import { cn } from "@/lib/utils";

export function Input({ label, error, className, icon: Icon, ...props }) {
  return (
    <div className="w-full flex flex-col space-y-1.5">
      {label && (
        <label className="text-xs font-semibold text-autumn-900 tracking-wide uppercase">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-autumn-800/60 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          className={cn(
            "w-full px-3.5 py-2 text-sm bg-white border border-autumn-300 rounded-lg text-autumn-900 placeholder:text-autumn-800/40 focus:outline-none focus:ring-2 focus:ring-autumn-500 focus:border-transparent transition-all",
            Icon && "pl-10",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-red-600 font-medium">{error}</span>}
    </div>
  );
}

export function Textarea({ label, error, className, ...props }) {
  return (
    <div className="w-full flex flex-col space-y-1.5">
      {label && (
        <label className="text-xs font-semibold text-autumn-900 tracking-wide uppercase">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          "w-full px-3.5 py-2 text-sm bg-white border border-autumn-300 rounded-lg text-autumn-900 placeholder:text-autumn-800/40 focus:outline-none focus:ring-2 focus:ring-autumn-500 focus:border-transparent transition-all min-h-[100px]",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-600 font-medium">{error}</span>}
    </div>
  );
}
