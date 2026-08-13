import React from "react";
import { cn } from "@/lib/utils";

export function Select({ label, options = [], error, className, ...props }) {
  return (
    <div className="w-full flex flex-col space-y-1.5">
      {label && (
        <label className="text-xs font-semibold text-autumn-900 tracking-wide uppercase">
          {label}
        </label>
      )}
      <select
        className={cn(
          "w-full px-3.5 py-2 text-sm bg-white border border-autumn-300 rounded-lg text-autumn-900 focus:outline-none focus:ring-2 focus:ring-autumn-500 focus:border-transparent transition-all cursor-pointer",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-600 font-medium">{error}</span>}
    </div>
  );
}
