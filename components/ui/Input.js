import React, { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Componente Base de Encabezado y Pie para Campos de Formulario (Label, Error, HelperText)
 */
const FieldWrapper = ({ id, label, error, helperText, children, containerClassName }) => {
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  return (
    <div className={cn("w-full flex flex-col space-y-1.5", containerClassName)}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-autumn-900 tracking-wide uppercase cursor-pointer select-none"
        >
          {label}
        </label>
      )}

      {children({ errorId, helperId })}

      {/* Mensaje de Ayuda */}
      {helperText && !error && (
        <p id={helperId} className="text-xs text-autumn-800/60 leading-normal">
          {helperText}
        </p>
      )}

      {/* Mensaje de Error */}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-600 font-medium leading-normal animate-in fade-in-50 duration-150">
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * Componente Input Optimizado y Accesible
 */
export const Input = React.forwardRef(function Input(
  {
    label,
    error,
    helperText,
    className,
    containerClassName,
    icon: Icon,
    endIcon: EndIcon,
    onEndIconClick,
    id: customId,
    disabled,
    required,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const inputId = customId || generatedId;

  return (
    <FieldWrapper
      id={inputId}
      label={label}
      error={error}
      helperText={helperText}
      containerClassName={containerClassName}
    >
      {({ errorId, helperId }) => {
        const describedBy = [
          error ? errorId : null,
          helperText ? helperId : null,
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <div className="relative flex items-center w-full">
            {Icon && (
              <div className="absolute left-3 text-autumn-800/50 pointer-events-none flex items-center justify-center">
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              </div>
            )}

            <input
              ref={ref}
              id={inputId}
              disabled={disabled}
              required={required}
              aria-invalid={Boolean(error)}
              aria-describedby={describedBy || undefined}
              className={cn(
                "w-full px-3.5 py-2 text-sm bg-white border border-autumn-300 rounded-lg text-autumn-900 placeholder:text-autumn-800/40 transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-autumn-500 focus:border-transparent",
                "disabled:bg-autumn-50 disabled:text-autumn-800/50 disabled:border-autumn-200 disabled:cursor-not-allowed",
                Icon && "pl-10",
                EndIcon && "pr-10",
                error && "border-red-500 focus:ring-red-500",
                className
              )}
              {...props}
            />

            {EndIcon && (
              <div
                className={cn(
                  "absolute right-3 text-autumn-800/50 flex items-center justify-center",
                  onEndIconClick ? "cursor-pointer hover:text-autumn-900 transition-colors" : "pointer-events-none"
                )}
                onClick={onEndIconClick}
                role={onEndIconClick ? "button" : undefined}
                tabIndex={onEndIconClick ? 0 : undefined}
              >
                <EndIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
              </div>
            )}
          </div>
        );
      }}
    </FieldWrapper>
  );
});

Input.displayName = "Input";

/**
 * Componente Textarea Optimizado y Accesible
 */
export const Textarea = React.forwardRef(function Textarea(
  {
    label,
    error,
    helperText,
    className,
    containerClassName,
    id: customId,
    disabled,
    required,
    rows = 4,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const textareaId = customId || generatedId;

  return (
    <FieldWrapper
      id={textareaId}
      label={label}
      error={error}
      helperText={helperText}
      containerClassName={containerClassName}
    >
      {({ errorId, helperId }) => {
        const describedBy = [
          error ? errorId : null,
          helperText ? helperId : null,
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <textarea
            ref={ref}
            id={textareaId}
            rows={rows}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy || undefined}
            className={cn(
              "w-full px-3.5 py-2 text-sm bg-white border border-autumn-300 rounded-lg text-autumn-900 placeholder:text-autumn-800/40 transition-all duration-200 resize-y min-h-[80px]",
              "focus:outline-none focus:ring-2 focus:ring-autumn-500 focus:border-transparent",
              "disabled:bg-autumn-50 disabled:text-autumn-800/50 disabled:border-autumn-200 disabled:cursor-not-allowed",
              error && "border-red-500 focus:ring-red-500",
              className
            )}
            {...props}
          />
        );
      }}
    </FieldWrapper>
  );
});

Textarea.displayName = "Textarea";