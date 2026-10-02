import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Table Root Component
 * Incluye scroll responsive accesible por teclado y etiquetas ARIA opcionales.
 */
const Table = React.forwardRef(
  ({ className, containerClassName, ariaLabel = "Tabla de datos", ...props }, ref) => (
    <div
      role="region"
      aria-label={ariaLabel}
      tabIndex={0}
      className={cn(
        "relative w-full overflow-x-auto rounded-xl border border-autumn-200 shadow-autumn-sm bg-white focus:outline-none focus:ring-2 focus:ring-autumn-400 focus:ring-offset-1 transition-shadow",
        containerClassName
      )}
    >
      <table
        ref={ref}
        className={cn("w-full text-left text-sm text-autumn-900 border-collapse align-middle", className)}
        {...props}
      />
    </div>
  )
);
Table.displayName = "Table";

/**
 * Table Header Container (thead)
 */
const Thead = React.forwardRef(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      "bg-autumn-50 border-b border-autumn-200 text-xs uppercase tracking-wider text-autumn-800/80 font-semibold sticky top-0 z-10",
      className
    )}
    {...props}
  />
));
Thead.displayName = "Thead";

/**
 * Table Body Container (tbody)
 */
const Tbody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("divide-y divide-autumn-100 bg-white [&_tr:last-child]:border-0", className)}
    {...props}
  />
));
Tbody.displayName = "Tbody";

/**
 * Table Footer Container (tfoot)
 */
const Tfoot = React.forwardRef(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t border-autumn-200 bg-autumn-50/50 font-medium text-autumn-800 [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
));
Tfoot.displayName = "Tfoot";

/**
 * Table Row (tr)
 */
const Tr = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-autumn-100/80 transition-colors hover:bg-autumn-50/60 data-[state=selected]:bg-autumn-100/50 group",
      className
    )}
    {...props}
  />
));
Tr.displayName = "Tr";

/**
 * Table Header Cell (th)
 */
const Th = React.forwardRef(({ className, scope = "col", ...props }, ref) => (
  <th
    ref={ref}
    scope={scope}
    className={cn(
      "px-5 py-3.5 align-middle font-bold text-autumn-900 aria-[sort=ascending]:bg-autumn-100/50 aria-[sort=descending]:bg-autumn-100/50",
      className
    )}
    {...props}
  />
));
Th.displayName = "Th";

/**
 * Table Data Cell (td)
 */
const Td = React.forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "px-5 py-4 align-middle text-autumn-800 [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
));
Td.displayName = "Td";

/**
 * Table Caption (caption)
 */
const TableCaption = React.forwardRef(({ className, srOnly = false, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn(
      "mt-4 text-xs text-autumn-500 text-center",
      srOnly && "sr-only",
      className
    )}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

// Asignación de Namespaces para soporte de ambas syntaxes:
// <Table.Header /> o <Thead />
Table.Header = Thead;
Table.Body = Tbody;
Table.Footer = Tfoot;
Table.Row = Tr;
Table.Head = Th;
Table.Cell = Td;
Table.Caption = TableCaption;

export {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption
};