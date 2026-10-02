"use client";

import React from "react";
import PropTypes from "prop-types";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/**
 * Variantes de color predefinidas con soporte para Light Mode y Dark Mode.
 */
const VARIANT_STYLES = {
  primary: {
    container: "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900",
    icon: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800/50",
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  },
  amber: {
    container: "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900",
    icon: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/50",
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  },
  sage: {
    container: "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900",
    icon: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/50",
    badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
  danger: {
    container: "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900",
    icon: "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800/50",
    badge: "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
  },
  autumn: {
    container: "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900",
    icon: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-800/50",
    badge: "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
  },
};

/**
 * Componente Skeleton para renderizar mientras los datos están cargando.
 */
function StatsCardSkeleton() {
  return (
    <Card className="p-5 animate-pulse border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div className="space-y-3 w-full">
          <div className="h-3.5 w-24 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-8 w-32 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 w-40 rounded bg-slate-100 dark:bg-slate-800/60" />
        </div>
        <div className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
      </div>
    </Card>
  );
}

/**
 * Tarjeta de Estadísticas de Alta Calidad para Dashboards Profesionales.
 */
export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  variant = "primary",
  loading = false,
  onClick,
  className,
  ariaLabel,
}) {
  if (loading) {
    return <StatsCardSkeleton />;
  }

  // Garantizar que siempre se use un estilo válido incluso si la variante no existe
  const selectedVariant = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;
  const isClickable = typeof onClick === "function";

  // Determinación de ícono y estilo de tendencia
  const isPositiveTrend = trend?.value > 0;
  const isNegativeTrend = trend?.value < 0;
  const TrendIcon = isPositiveTrend ? TrendingUp : isNegativeTrend ? TrendingDown : Minus;

  return (
    <Card
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={ariaLabel || `${title}: ${value}`}
      className={cn(
        "relative overflow-hidden p-5 transition-all duration-200 select-none",
        selectedVariant.container,
        isClickable && [
          "cursor-pointer hover:-translate-y-1 hover:shadow-lg active:translate-y-0",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        ],
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Contenido Principal */}
        <div className="space-y-1 min-w-0 flex-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
            {title}
          </h3>

          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 lg:text-3xl">
              {value}
            </span>

            {/* Renderizado de Tendencia (Trend) */}
            {trend && (
              <div
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
                  isPositiveTrend && "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
                  isNegativeTrend && "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400",
                  !isPositiveTrend && !isNegativeTrend && "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                )}
                title={trend.label || "Tendencia respecto al período anterior"}
              >
                <TrendIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>

          {/* Descripción secundaria o etiqueta de tendencia */}
          {(description || trend?.label) && (
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 pt-0.5 truncate">
              {description || trend?.label}
            </p>
          )}
        </div>

        {/* Contenedor del Icono */}
        {Icon && (
          <div
            className={cn(
              "p-3 rounded-xl border flex items-center justify-center shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105",
              selectedVariant.icon
            )}
            aria-hidden="true"
          >
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </Card>
  );
}

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType,
  description: PropTypes.string,
  trend: PropTypes.shape({
    value: PropTypes.number.isRequired,
    label: PropTypes.string,
  }),
  variant: PropTypes.oneOf(["primary", "amber", "sage", "danger", "autumn"]),
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
};