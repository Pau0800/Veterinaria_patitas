"use client";

import React, { useMemo, useState, useCallback } from "react";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import {
  Stethoscope,
  Activity,
  Pill,
  ShieldAlert,
  FileText,
  UserCheck,
  Calendar,
  Filter,
  Syringe,
  Microscope,
  TrendingUp,
} from "lucide-react";

// ----------------------------------------------------------------------
// Mapa de Configuración por Tipo de Registro (Estilos, Íconos y Variantes)
// ----------------------------------------------------------------------
const TYPE_CONFIG = {
  Cirugía: {
    icon: ShieldAlert,
    badgeVariant: "danger",
    iconBg: "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-900/40",
    dotBorder: "border-red-500",
  },
  Diagnóstico: {
    icon: Activity,
    badgeVariant: "warning",
    iconBg: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
    borderColor: "border-amber-200 dark:border-amber-900/40",
    dotBorder: "border-amber-500",
  },
  Medicación: {
    icon: Pill,
    badgeVariant: "info",
    iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-900/40",
    dotBorder: "border-blue-500",
  },
  Tratamiento: {
    icon: Syringe,
    badgeVariant: "success",
    iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
    borderColor: "border-emerald-200 dark:border-emerald-900/40",
    dotBorder: "border-emerald-500",
  },
  Estudios: {
    icon: Microscope,
    badgeVariant: "secondary",
    iconBg: "bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400",
    borderColor: "border-purple-200 dark:border-purple-900/40",
    dotBorder: "border-purple-500",
  },
  Evolución: {
    icon: TrendingUp,
    badgeVariant: "neutral",
    iconBg: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    borderColor: "border-slate-200 dark:border-slate-700",
    dotBorder: "border-slate-500",
  },
  DEFAULT: {
    icon: Stethoscope,
    badgeVariant: "primary",
    iconBg: "bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400",
    borderColor: "border-teal-200 dark:border-teal-900/40",
    dotBorder: "border-teal-500",
  },
};

// Obtiene la configuración de un tipo con fallback seguro
const getTypeConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.DEFAULT;

// Componente individual de Tarjeta de Registro
const TimelineCard = React.memo(({ record }) => {
  const {
    id,
    type,
    title,
    description,
    diagnosis,
    treatment,
    medication_prescribed,
    record_date,
    vet_name,
  } = record;

  const config = getTypeConfig(type);
  const IconComponent = config.icon;

  const formattedDate = useMemo(() => {
    if (!record_date) return "Fecha no especificada";
    try {
      return formatDate(record_date);
    } catch {
      return record_date;
    }
  }, [record_date]);

  return (
    <li className="relative pl-8 md:pl-10 group list-none">
      {/* Nodo / Conector de la línea de tiempo */}
      <div
        className={`absolute left-0 top-1.5 -translate-x-1/2 w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 ${config.dotBorder} shadow-sm flex items-center justify-center transition-transform duration-200 group-hover:scale-110 z-10`}
        aria-hidden="true"
      >
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${config.iconBg}`}>
          <IconComponent className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Contenedor principal de la tarjeta */}
      <article
        className={`bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border ${config.borderColor} shadow-sm hover:shadow-md transition-all duration-200 space-y-3.5`}
      >
        {/* Cabecera */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5 flex-wrap">
            <Badge variant={config.badgeVariant}>{type || "Consulta"}</Badge>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {title || "Sin título"}
            </h3>
          </div>

          <time
            dateTime={record_date}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-full w-fit shrink-0"
          >
            <Calendar className="w-3 h-3 text-slate-400" />
            {formattedDate}
          </time>
        </header>

        {/* Descripción principal */}
        {description && (
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {description}
          </p>
        )}

        {/* Secciones complementarias (Diagnóstico / Tratamiento / Medicación) */}
        {(diagnosis || treatment || medication_prescribed) && (
          <div className="grid grid-cols-1 gap-2.5 pt-1">
            {diagnosis && (
              <div className="bg-amber-50/80 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200/70 dark:border-amber-900/40 text-xs">
                <span className="font-bold text-amber-900 dark:text-amber-300 block mb-0.5">
                  Diagnóstico Presuntivo / Definitivo
                </span>
                <p className="text-amber-800 dark:text-amber-200/90 leading-snug">
                  {diagnosis}
                </p>
              </div>
            )}

            {treatment && (
              <div className="bg-emerald-50/80 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200/70 dark:border-emerald-900/40 text-xs">
                <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-0.5">
                  Tratamiento Indicado
                </span>
                <p className="text-emerald-800 dark:text-emerald-200/90 leading-snug">
                  {treatment}
                </p>
              </div>
            )}

            {medication_prescribed && (
              <div className="bg-blue-50/80 dark:bg-blue-950/30 p-3 rounded-xl border border-blue-200/70 dark:border-blue-900/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-blue-900 dark:text-blue-300 block mb-0.5">
                    Receta / Medicación
                  </span>
                  <p className="text-blue-800 dark:text-blue-200/90 leading-snug">
                    {medication_prescribed}
                  </p>
                </div>
                <Badge variant="info" className="w-fit self-start sm:self-center shrink-0">
                  Prescrito
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Pie de la tarjeta */}
        <footer className="text-[11px] text-slate-500 dark:text-slate-400 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 truncate">
            <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              Atendido por:{" "}
              <strong className="text-slate-700 dark:text-slate-200 font-semibold">
                {vet_name || "Dr. No Especificado"}
              </strong>
            </span>
          </div>
          {id && (
            <span className="font-mono text-[10px] text-slate-400 shrink-0">
              Ref: #{id}
            </span>
          )}
        </footer>
      </article>
    </li>
  );
});

TimelineCard.displayName = "TimelineCard";

// Componente Principal
export function MedicalTimeline({ records = [], onAddNew }) {
  const [selectedFilter, setSelectedFilter] = useState("Todos");

  // 1. Memoización y ordenamiento seguro (más recientes primero)
  const sortedRecords = useMemo(() => {
    if (!Array.isArray(records)) return [];
    return [...records].sort((a, b) => {
      const dateA = new Date(a.record_date || 0).getTime();
      const dateB = new Date(b.record_date || 0).getTime();
      return dateB - dateA; // Orden descendente
    });
  }, [records]);

  // 2. Extraer los tipos disponibles para la barra de filtrado
  const availableTypes = useMemo(() => {
    const types = new Set(sortedRecords.map((r) => r.type).filter(Boolean));
    return ["Todos", ...Array.from(types)];
  }, [sortedRecords]);

  // 3. Filtrar registros según selección activa
  const filteredRecords = useMemo(() => {
    if (selectedFilter === "Todos") return sortedRecords;
    return sortedRecords.filter((r) => r.type === selectedFilter);
  }, [sortedRecords, selectedFilter]);

  const handleFilterChange = useCallback((type) => {
    setSelectedFilter(type);
  }, []);

  // Estado Vacío (Sin registros en absoluto)
  if (!records || records.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-slate-50/80 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 transition-all">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
          No hay historial clínico registrado aún
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
          Los registros de atenciones, diagnósticos y tratamientos aparecerán aquí ordenados cronológicamente.
        </p>
        {onAddNew && (
          <button
            onClick={onAddNew}
            className="inline-flex items-center justify-center text-xs font-medium text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 px-4 py-2 rounded-xl transition-colors border border-teal-200 dark:border-teal-800"
          >
            + Agregar Primer Registro
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra de Filtros Rápidos (Aparece solo si hay 2 o más tipos diferentes) */}
      {availableTypes.length > 2 && (
        <nav
          aria-label="Filtro de tipos de registro"
          className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs"
        >
          <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500 font-medium mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            Filtrar:
          </span>
          {availableTypes.map((type) => {
            const isActive = selectedFilter === type;
            return (
              <button
                key={type}
                onClick={() => handleFilterChange(type)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {type}
              </button>
            );
          })}
        </nav>
      )}

      {/* Lista de Registros o Estado Vacío de Filtro */}
      {filteredRecords.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-slate-200/60 dark:border-slate-800">
          No existen registros categorizados como &quot;<strong>{selectedFilter}</strong>&quot;.
        </div>
      ) : (
        <ol className="relative ml-4 md:ml-5 border-l-2 border-slate-200 dark:border-slate-800 space-y-6">
          {filteredRecords.map((record) => (
            <TimelineCard key={record.id || `${record.record_date}-${record.title}`} record={record} />
          ))}
        </ol>
      )}
    </div>
  );
}