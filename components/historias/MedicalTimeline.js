"use client";

import React, { useMemo, useState, useCallback } from "react";
import { Badge } from "@/components/ui/Badge";
import { PetAvatar } from "@/components/mascotas/PetAvatar";
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

// Mapa de Configuración por Tipo de Registro (mantiene rojo Cirugía y verde Tratamiento)
const TYPE_CONFIG = {
  Cirugía: {
    icon: ShieldAlert,
    badgeVariant: "danger",
    iconBg: "bg-red-100 text-red-600",
    borderColor: "border-red-200",
    dotBorder: "border-red-500",
  },
  Diagnóstico: {
    icon: Activity,
    badgeVariant: "warning",
    iconBg: "bg-[#F9EEDB] text-[#C4832B]",
    borderColor: "border-[#D48A1C]/40",
    dotBorder: "border-[#D48A1C]",
  },
  Medicación: {
    icon: Pill,
    badgeVariant: "info",
    iconBg: "bg-[#F5EFE4] text-[#AD5D1E]",
    borderColor: "border-[#C4832B]/40",
    dotBorder: "border-[#AD5D1E]",
  },
  Tratamiento: {
    icon: Syringe,
    badgeVariant: "success",
    iconBg: "bg-emerald-100 text-emerald-600",
    borderColor: "border-emerald-200",
    dotBorder: "border-emerald-500",
  },
  Estudios: {
    icon: Microscope,
    badgeVariant: "secondary",
    iconBg: "bg-[#F5EFE4] text-[#4B4118]",
    borderColor: "border-[#E6D8C3]",
    dotBorder: "border-[#4B4118]",
  },
  Evolución: {
    icon: TrendingUp,
    badgeVariant: "default",
    iconBg: "bg-[#F5EFE4] text-[#6E4B2A]",
    borderColor: "border-[#E6D8C3]",
    dotBorder: "border-[#6E4B2A]",
  },
  DEFAULT: {
    icon: Stethoscope,
    badgeVariant: "primary",
    iconBg: "bg-[#F5EFE4] text-[#B84A14]",
    borderColor: "border-[#E6D8C3]",
    dotBorder: "border-[#B84A14]",
  },
};

const getTypeConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.DEFAULT;

const TimelineCard = React.memo(({ record, pet }) => {
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
    pet_name,
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
        className={`absolute left-0 top-1.5 -translate-x-1/2 w-8 h-8 rounded-full bg-[#FFFDF9] border-2 ${config.dotBorder} shadow-sm flex items-center justify-center transition-transform duration-200 group-hover:scale-110 z-10`}
        aria-hidden="true"
      >
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${config.iconBg}`}>
          <IconComponent className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Contenedor principal de la tarjeta */}
      <article
        className={`bg-[#FFFDF9] p-4 sm:p-5 rounded-2xl border ${config.borderColor} shadow-sm hover:shadow-md transition-all duration-200 space-y-3.5`}
      >
        {/* Cabecera */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-[#E6D8C3]/70">
          <div className="flex items-center gap-2.5 flex-wrap">
            {(pet || pet_name) && (
              <div className="flex items-center gap-2 mr-1">
                <PetAvatar
                  src={pet?.photo_url}
                  name={pet?.name || pet_name || "Mascota"}
                  species={pet?.species}
                  size="xs"
                />
                <span className="text-xs font-bold text-[#473621]">
                  {pet?.name || pet_name}
                </span>
              </div>
            )}
            <Badge variant={config.badgeVariant}>{type || "Consulta"}</Badge>
            <h3 className="text-base font-bold text-[#2C2115] tracking-tight">
              {title || "Sin título"}
            </h3>
          </div>

          <time
            dateTime={record_date}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6E4B2A] bg-[#F5EFE4] px-2.5 py-1 rounded-full w-fit shrink-0 border border-[#E6D8C3]"
          >
            <Calendar className="w-3 h-3 text-[#AD5D1E]" />
            {formattedDate}
          </time>
        </header>

        {/* Descripción principal */}
        {description && (
          <p className="text-sm text-[#473621] leading-relaxed whitespace-pre-line">
            {description}
          </p>
        )}

        {/* Secciones complementarias (Diagnóstico / Tratamiento / Medicación) */}
        {(diagnosis || treatment || medication_prescribed) && (
          <div className="grid grid-cols-1 gap-2.5 pt-1">
            {diagnosis && (
              <div className="bg-[#FFFBF2] p-3 rounded-xl border border-[#D48A1C]/40 text-xs">
                <span className="font-bold text-[#6E4B2A] block mb-0.5">
                  Diagnóstico Presuntivo / Definitivo
                </span>
                <p className="text-[#473621] leading-snug">{diagnosis}</p>
              </div>
            )}

            {treatment && (
              <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200/70 text-xs">
                <span className="font-bold text-emerald-900 block mb-0.5">
                  Tratamiento Indicado
                </span>
                <p className="text-emerald-800 leading-snug">{treatment}</p>
              </div>
            )}

            {medication_prescribed && (
              <div className="bg-[#F5EFE4]/80 p-3 rounded-xl border border-[#E6D8C3] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-[#A03813] block mb-0.5">
                    Receta / Medicación
                  </span>
                  <p className="text-[#473621] leading-snug">
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
        <footer className="text-[11px] text-[#6E4B2A] pt-2.5 border-t border-[#E6D8C3]/70 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 truncate">
            <UserCheck className="w-3.5 h-3.5 text-[#AD5D1E] shrink-0" />
            <span className="truncate">
              Atendido por:{" "}
              <strong className="text-[#2C2115] font-semibold">
                {vet_name || "Dr. No Especificado"}
              </strong>
            </span>
          </div>
          {id && (
            <span className="font-mono text-[10px] text-[#6E4B2A]/80 shrink-0">
              Ref: #{id}
            </span>
          )}
        </footer>
      </article>
    </li>
  );
});

TimelineCard.displayName = "TimelineCard";

export function MedicalTimeline({ records = [], pets = [], onAddNew }) {
  const [selectedFilter, setSelectedFilter] = useState("Todos");

  const petsById = useMemo(() => {
    const map = new Map();
    if (Array.isArray(pets)) {
      pets.forEach((p) => {
        if (p?.id) map.set(p.id, p);
      });
    }
    return map;
  }, [pets]);

  const sortedRecords = useMemo(() => {
    if (!Array.isArray(records)) return [];
    return [...records].sort((a, b) => {
      const dateA = new Date(a.record_date || 0).getTime();
      const dateB = new Date(b.record_date || 0).getTime();
      return dateB - dateA;
    });
  }, [records]);

  const availableTypes = useMemo(() => {
    const types = new Set(sortedRecords.map((r) => r.type).filter(Boolean));
    return ["Todos", ...Array.from(types)];
  }, [sortedRecords]);

  const filteredRecords = useMemo(() => {
    if (selectedFilter === "Todos") return sortedRecords;
    return sortedRecords.filter((r) => r.type === selectedFilter);
  }, [sortedRecords, selectedFilter]);

  const handleFilterChange = useCallback((type) => {
    setSelectedFilter(type);
  }, []);

  if (!records || records.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-[#FAF6EF] rounded-2xl border border-dashed border-[#E6D8C3] transition-all">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#F5EFE4] flex items-center justify-center text-[#AD5D1E]">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-[#2C2115] mb-1">
          No hay historial clínico registrado aún
        </h3>
        <p className="text-xs text-[#6E4B2A] max-w-sm mx-auto mb-4">
          Los registros de atenciones, diagnósticos y tratamientos aparecerán aquí ordenados cronológicamente.
        </p>
        {onAddNew && (
          <button
            onClick={onAddNew}
            className="inline-flex items-center justify-center text-xs font-semibold text-white bg-[#B84A14] hover:bg-[#8A2E0E] px-4 py-2 rounded-xl transition-colors shadow-sm"
          >
            + Agregar Primer Registro
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {availableTypes.length > 2 && (
        <nav
          aria-label="Filtro de tipos de registro"
          className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs"
        >
          <span className="flex items-center gap-1 text-[#6E4B2A] font-medium mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            Filtrar:
          </span>
          {availableTypes.map((type) => {
            const isActive = selectedFilter === type;
            return (
              <button
                key={type}
                onClick={() => handleFilterChange(type)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? "bg-[#2C2115] text-white shadow-sm"
                    : "bg-[#F5EFE4] text-[#473621] hover:bg-[#E6D8C3]"
                }`}
              >
                {type}
              </button>
            );
          })}
        </nav>
      )}

      {filteredRecords.length === 0 ? (
        <div className="text-center py-8 text-xs text-[#6E4B2A] bg-[#FAF6EF] rounded-xl border border-[#E6D8C3]">
          No existen registros categorizados como &quot;<strong>{selectedFilter}</strong>&quot;.
        </div>
      ) : (
        <ol className="relative ml-4 md:ml-5 border-l-2 border-[#E6D8C3] space-y-6">
          {filteredRecords.map((record) => (
            <TimelineCard
              key={record.id || `${record.record_date}-${record.title}`}
              record={record}
              pet={petsById.get(record.pet_id)}
            />
          ))}
        </ol>
      )}
    </div>
  );
}
