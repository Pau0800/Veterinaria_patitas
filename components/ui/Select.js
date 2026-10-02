"use client";

import React, { useId, forwardRef } from "react";
import { ChevronDown, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Componente Select Profesional y Accesible
 * 
 * Sombra de diseño con paleta de colores personalizada, soporte completo para React Hook Form,
 * vinculación accessible ARIA, soporte para placeholders, grupos de opciones y estados visuales avanzados.
 */
export const Select = forwardRef(function Select(
  {
    label,
    options = [],
    error,
    helperText,
    placeholder,
    required = false,
    disabled = false,
    className,
    containerClassName,
    id: customId,
    children,
    ...props
  },
  ref
) {
  // Generación de ID único y estacional para SSR y accesibilidad
  const autoId = useId();
  const selectId = customId || autoId;
  const errorId = `${selectId}-error`;
  const helperId = `${selectId}-helper`;

  // Construcción dinámica de aria-describedby para asociar descripciones y errores
  const describedBy = [
    error ? errorId : null,
    helperText ? helperId : null,
  ]
    .filter(Boolean)
    .join(" ");

  /**
   * Normaliza la renderización de las opciones permitiendo:
   * 1. Hijos directos (<option>, <optgroup>)
   * 2. Formato simple: ['Opción 1', 'Opción 2']
   * 3. Formato objeto: [{ value: '1', label: 'Opción 1', disabled: false }]
   */
  const renderOptions = () => {
    if (children) return children;

    return options.map((opt, index) => {
      if (typeof opt === "string" || typeof opt === "number") {
        return (
          <option key={`${opt}-${index}`} value={opt}>
            {opt}
          </option>
        );
      }

      return (
        <option
          key={opt.value ?? index}
          value={opt.value}
          disabled={opt.disabled}
        >
          {opt.label ?? opt.value}
        </option>
      );
    });
  };

  return (
    <div className={cn("w-full flex flex-col space-y-1.5", containerClassName)}>
      {/* Label Semántico */}
      {label && (
        <label
          htmlFor={selectId}
          className={cn(
            "text-xs font-semibold text-autumn-900 tracking-wide uppercase flex items-center justify-between select-none",
            disabled && "opacity-60 cursor-not-allowed"
          )}
        >
          <span>
            {label}
            {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
          </span>
        </label>
      )}

      {/* Contenedor relativo para posicionamiento del ícono nativo */}
      <div className="relative flex items-center w-full">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          className={cn(
            // Reset de apariencia nativa y estilos base
            "appearance-none w-full px-3.5 py-2.5 pr-10 text-sm bg-white border border-autumn-300 rounded-lg text-autumn-900",
            "shadow-sm transition-all duration-150 ease-in-out cursor-pointer",
            // Focus state con anillo de accesibilidad
            "focus:outline-none focus:ring-2 focus:ring-autumn-500/20 focus:border-autumn-500",
            // Disabled state
            "disabled:bg-autumn-50 disabled:text-autumn-400 disabled:border-autumn-200 disabled:cursor-not-allowed disabled:shadow-none",
            // Hover state (cuando no está deshabilitado)
            "hover:border-autumn-400 disabled:hover:border-autumn-200",
            // Modificador de error
            error && "border-red-500 focus:ring-red-500/20 focus:border-red-500 hover:border-red-600 text-red-950",
            className
          )}
          {...props}
        >
          {/* Option por defecto (Placeholder) */}
          {placeholder && (
            <option value="" disabled className="text-autumn-400">
              {placeholder}
            </option>
          )}

          {renderOptions()}
        </select>

        {/* Flecha personalizada con animación sutil */}
        <div className="absolute right-3 pointer-events-none flex items-center justify-center text-autumn-500 peer-disabled:text-autumn-300">
          <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", disabled && "text-autumn-300")} />
        </div>
      </div>

      {/* Texto de Ayuda Informativo */}
      {helperText && !error && (
        <span id={helperId} className="text-xs text-autumn-800/70">
          {helperText}
        </span>
      )}

      {/* Mensaje de Error Accesible con Ícono */}
      {error && (
        <div id={errorId} className="flex items-center gap-1.5 text-xs text-red-600 font-medium mt-0.5 animate-in fade-in-50 duration-150">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});

Select.displayName = "Select";

export default Select;