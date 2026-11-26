"use client";

import React from "react";
import PropTypes from "prop-types";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/**
 * Variantes de color otoñales cálidas (mantiene verdes y rojos semánticos).
 */
const VARIANT_STYLES = {
  primary: {
    container: "border-[#E6D8C3] bg-[#FFFDF9]",
    icon: "bg-[#F5EFE4] text-[#B84A14] border-[#E6D8C3]",
    badge: "bg-[#F5EFE4] text-[#A03813]",
  },
  amber: {
    container: "border-[#E6D8C3] bg-[#FFFDF9]",
    icon: "bg-[#F9EEDB] text-[#C4832B] border-[#D48A1C]/40",
    badge: "bg-[#F9EEDB] text-[#AD5D1E]",
  },
  sage: {
    container: "border-[#E6D8C3] bg-[#FFFDF9]",
    icon: "bg-emerald-50 text-emerald-600 border-emerald-200",
    badge: "bg-emerald-50 text-emerald-700",
  },
  danger: {
    container: "border-[#E6D8C3] bg-[#FFFDF9]",
    icon: "bg-rose-50 text-rose-600 border-rose-200",
    badge: "bg-rose-50 text-rose-700",
  },
  autumn: {
    container: "border-[#E6D8C3] bg-[#FFFDF9]",
    icon: "bg-[#F5EFE4] text-[#AD5D1E] border-[#E6D8C3]",
    badge: "bg-[#F5EFE4] text-[#A03813]",
  },
};

function StatsCardSkeleton() {
  return (
    <Card className="p-5 animate-pulse border-[#E6D8C3] bg-[#FFFDF9]">
      <div className="flex items-start justify-between">
        <div className="space-y-3 w-full">
          <div className="h-3.5 w-24 rounded bg-[#E6D8C3]" />
          <div className="h-8 w-32 rounded bg-[#E6D8C3]" />
          <div className="h-3 w-40 rounded bg-[#F5EFE4]" />
        </div>
        <div className="h-12 w-12 rounded-xl bg-[#E6D8C3] shrink-0" />
      </div>
    </Card>
  );
}

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

  const selectedVariant = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;
  const isClickable = typeof onClick === "function";

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
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84A14] focus-visible:ring-offset-2",
        ],
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0 flex-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#6E4B2A] truncate">
            {title}
          </h3>

          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl font-extrabold tracking-tight text-[#2C2115] lg:text-3xl">
              {value}
            </span>

            {trend && (
              <div
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
                  isPositiveTrend && "bg-emerald-50 text-emerald-700",
                  isNegativeTrend && "bg-rose-50 text-rose-700",
                  !isPositiveTrend && !isNegativeTrend && "bg-[#F5EFE4] text-[#4B4118]"
                )}
                title={trend.label || "Tendencia respecto al período anterior"}
              >
                <TrendIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>

          {(description || trend?.label) && (
            <p className="text-xs font-medium text-[#6E4B2A] pt-0.5 truncate">
              {description || trend?.label}
            </p>
          )}
        </div>

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
