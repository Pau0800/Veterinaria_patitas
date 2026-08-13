import React from "react";
import { cn } from "@/lib/utils";

export function Table({ children, className }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-autumn-200 shadow-autumn-sm bg-white">
      <table className={cn("w-full text-left text-sm text-autumn-900 border-collapse", className)}>
        {children}
      </table>
    </div>
  );
}

export function Thead({ children, className }) {
  return (
    <thead className={cn("bg-autumn-50 border-b border-autumn-200 text-xs uppercase tracking-wider text-autumn-800/80 font-semibold", className)}>
      {children}
    </thead>
  );
}

export function Tbody({ children, className }) {
  return <tbody className={cn("divide-y divide-autumn-100 bg-white", className)}>{children}</tbody>;
}

export function Tr({ children, className }) {
  return (
    <tr className={cn("hover:bg-autumn-50/60 transition-colors group", className)}>
      {children}
    </tr>
  );
}

export function Th({ children, className }) {
  return <th className={cn("px-5 py-3.5 font-bold", className)}>{children}</th>;
}

export function Td({ children, className }) {
  return <td className={cn("px-5 py-4 whitespace-nowrap text-autumn-800", className)}>{children}</td>;
}
