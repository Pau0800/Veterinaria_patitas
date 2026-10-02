import React from "react";
import { cn } from "@/lib/utils";

// Variantes estilizadas con Tailwind CSS
const VARIANTS = {
  primary:
    "bg-autumn-500 text-white hover:bg-autumn-600 focus-visible:ring-autumn-500 shadow-sm hover:shadow-md",
  secondary:
    "bg-autumn-100 text-autumn-900 hover:bg-autumn-200 focus-visible:ring-autumn-300 border border-autumn-200/80",
  amber:
    "bg-amberGold-500 text-white hover:bg-amberGold-600 focus-visible:ring-amberGold-500 shadow-sm hover:shadow-md",
  sage:
    "bg-sage-500 text-white hover:bg-sage-600 focus-visible:ring-sage-500 shadow-sm hover:shadow-md",
  outline:
    "border border-autumn-300 text-autumn-800 hover:bg-autumn-100/70 focus-visible:ring-autumn-400 bg-transparent",
  ghost:
    "text-autumn-800 hover:bg-autumn-100/70 focus-visible:ring-autumn-300 bg-transparent",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm hover:shadow-md",
};

// Tamaños configurados para mantener la consistencia vertical y horizontal
const SIZES = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-md",
  md: "h-10 px-4 py-2 text-sm gap-2 rounded-lg",
  lg: "h-12 px-6 text-base gap-2.5 rounded-xl",
  icon: "h-10 w-10 p-0 justify-center rounded-lg", // Tamaño ideal para botones que solo contienen un ícono
};

export const Button = React.forwardRef(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    fullWidth = false,
    isLoading = false,
    className,
    disabled,
    type = "button",
    ...props
  },
  ref
) {
  // Estilos base: Transición suave, accesibilidad de foco por teclado y prevención de eventos al deshabilitar
  const baseStyles =
    "inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:enabled:scale-[0.98]";

  // Fallbacks de seguridad en caso de recibir una variante o tamaño no existente
  const selectedVariant = VARIANTS[variant] || VARIANTS.primary;
  const selectedSize = SIZES[size] || SIZES.md;
  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading}
      className={cn(
        baseStyles,
        selectedVariant,
        selectedSize,
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4 text-current shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
});

Button.displayName = "Button";