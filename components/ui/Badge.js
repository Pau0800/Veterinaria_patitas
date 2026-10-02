import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import { cn } from "@/lib/utils";

/**
 * Mapa de variantes estilizadas con estados interactivos y contrastes WCAG AA.
 * Extraído fuera del componente para evitar reasignaciones de memoria por render.
 */
const VARIANTS = {
  default:
    "bg-autumn-100 text-autumn-800 border-autumn-300 dark:bg-autumn-900/40 dark:text-autumn-300 dark:border-autumn-700/50",
  primary:
    "bg-autumn-500 text-white border-autumn-600 shadow-xs dark:bg-autumn-600 dark:border-autumn-500",
  secondary:
    "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
  success:
    "bg-sage-100 text-sage-800 border-sage-300 dark:bg-sage-950/50 dark:text-sage-300 dark:border-sage-800",
  warning:
    "bg-amberGold-100 text-amberGold-900 border-amberGold-300 dark:bg-amberGold-950/50 dark:text-amberGold-300 dark:border-amberGold-800",
  danger:
    "bg-red-100 text-red-800 border-red-300 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
  info:
    "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
  outline:
    "bg-transparent text-slate-700 border-slate-300 dark:text-slate-300 dark:border-slate-600",
  ghost:
    "bg-transparent text-slate-600 border-transparent dark:text-slate-400",
};

/**
 * Tamaños estandarizados para jerarquía visual adecuada.
 */
const SIZES = {
  sm: "px-2 py-0.5 text-[10px] gap-1 leading-none",
  md: "px-2.5 py-0.5 text-xs gap-1.5 leading-4",
  lg: "px-3 py-1 text-sm gap-2 leading-5",
};

/**
 * Componente Badge multipropósito de alta calidad para sistemas de diseño.
 */
export const Badge = forwardRef(function Badge(
  {
    children,
    variant = "default",
    size = "md",
    dot = false,
    dotClassName,
    icon: Icon,
    onRemove,
    removeLabel = "Eliminar etiqueta",
    className,
    as: Component = "span",
    onClick,
    ...props
  },
  ref
) {
  // Garantiza fallback seguro si se pasa un variant o size inexistente
  const selectedVariant = VARIANTS[variant] || VARIANTS.default;
  const selectedSize = SIZES[size] || SIZES.md;
  const isInteractive = Boolean(onClick);

  return (
    <Component
      ref={ref}
      onClick={onClick}
      role={isInteractive && Component === "span" ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      className={cn(
        // Estilos base: Flexbox centrado, tipografía neutra, transición suave y bordes
        "inline-flex items-center justify-center font-semibold rounded-full border transition-all duration-150 ease-in-out select-none shrink-0 tracking-wide",
        // Variantes y Tamaños
        selectedVariant,
        selectedSize,
        // Feedback visual si el badge completo es un botón/interactivo
        isInteractive &&
          "cursor-pointer hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-autumn-500 focus-visible:ring-offset-1 active:scale-[0.97]",
        className
      )}
      {...props}
    >
      {/* Indicador de estado punto (Dot indicator) opcional */}
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0 bg-current opacity-80",
            dotClassName
          )}
          aria-hidden="true"
        />
      )}

      {/* Ícono dinámico pasable como componente Lucide o SVG */}
      {Icon && (
        <Icon
          className={cn(
            "shrink-0",
            size === "sm" ? "w-3 h-3" : size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"
          )}
          aria-hidden="true"
        />
      )}

      {/* Contenido principal con prevención de desbordamiento */}
      {children && <span className="truncate">{children}</span>}

      {/* Botón opcional de remoción/cierre accesible */}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(e);
          }}
          aria-label={removeLabel}
          className={cn(
            "inline-flex items-center justify-center rounded-full transition-colors opacity-70 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current",
            size === "sm" ? "w-3 h-3 -mr-0.5" : "w-3.5 h-3.5 -mr-1"
          )}
        >
          <svg
            className="w-2.5 h-2.5 fill-none stroke-current stroke-[2.5]"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </Component>
  );
});

Badge.displayName = "Badge";

Badge.propTypes = {
  /** Contenido interno del Badge */
  children: PropTypes.node,
  /** Estilo visual del Badge */
  variant: PropTypes.oneOf([
    "default",
    "primary",
    "secondary",
    "success",
    "warning",
    "danger",
    "info",
    "outline",
    "ghost",
  ]),
  /** Tamaño del componente */
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  /** Muestra un punto indicador de estado */
  dot: PropTypes.bool,
  /** Clases CSS adicionales para el punto indicador */
  dotClassName: PropTypes.string,
  /** Componente Ícono de Lucide u otro SVG */
  icon: PropTypes.elementType,
  /** Handler para convertirlo en un badge removible con botón 'X' */
  onRemove: PropTypes.func,
  /** Etiqueta ARIA para el botón de eliminación */
  removeLabel: PropTypes.string,
  /** Clases CSS personalizadas para extender estilos */
  className: PropTypes.string,
  /** Elemento HTML o componente React a renderizar (ej: 'div', 'a') */
  as: PropTypes.elementType,
  /** Callback opcional al hacer click en el badge */
  onClick: PropTypes.func,
};