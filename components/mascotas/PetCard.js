"use client";

import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Dog,
  Cat,
  Bird,
  HelpCircle,
  Cpu,
  User,
  Calendar,
  Weight,
  FileText,
  Edit,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

/**
 * Mapeo genérico para obtener el ícono según la especie seleccionada
 */
const getSpeciesIcon = (species = "") => {
  const normalizedSpecies = species.toLowerCase().trim();
  switch (normalizedSpecies) {
    case "perro":
    case "canino":
      return Dog;
    case "gato":
    case "felino":
      return Cat;
    case "ave":
    case "pájaro":
      return Bird;
    default:
      return HelpCircle;
  }
};

/**
 * Formateador de fechas seguro y legible
 */
const formatDate = (dateString) => {
  if (!dateString) return "Desconocida";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
};

export function PetCard({
  pet = {},
  onEdit = () => {},
  onDelete = () => {},
  onViewHistory = () => {},
  className = "",
}) {
  const { currentRole = "Invitado" } = useApp() || {};
  const [imageError, setImageError] = useState(false);

  // Extracción con fallback defensivo
  const {
    id,
    name = "Sin nombre",
    species = "Desconocida",
    breed = "Mestizo",
    sex = "Macho",
    weight_kg = null,
    birth_date = null,
    age_years = 0,
    owner_name = "Propietario no asignado",
    microchip = null,
    photo_url = null,
    notes = "",
  } = pet || {};

  const isReadOnly = currentRole === "Cliente";
  const isAdmin = currentRole === "Administrador";
  const SpeciesIcon = useMemo(() => getSpeciesIcon(species), [species]);

  return (
    <Card
      className={cn(
        "flex flex-col h-full bg-white border border-autumn-200/80 rounded-2xl shadow-xs hover:shadow-xl hover:border-autumn-400 hover:-translate-y-1 transition-all duration-300 group overflow-hidden select-none",
        className
      )}
    >
      {/* Header Image & Badges Overlay */}
      <div className="relative h-52 w-full bg-gradient-to-br from-autumn-100 to-autumn-200/60 overflow-hidden shrink-0">
        {photo_url && !imageError ? (
          <Image
            src={photo_url}
            alt={`Fotografía de ${name}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={() => setImageError(true)}
            priority={false}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-autumn-400 space-y-1">
            <SpeciesIcon className="w-16 h-16 opacity-40 group-hover:scale-110 transition-transform duration-300" aria-hidden="true" />
            <span className="text-[11px] font-medium text-autumn-500/70">Sin fotografía</span>
          </div>
        )}

        {/* Gradiente protector de contraste */}
        <div className="absolute inset-0 bg-gradient-to-t from-autumn-950/60 via-transparent to-transparent opacity-60" />

        {/* Badges Flotantes */}
        <div className="absolute top-3 right-3 flex flex-col items-end space-y-1.5 z-10">
          <Badge
            variant={species.toLowerCase() === "perro" ? "primary" : "warning"}
            className="shadow-sm font-bold text-xs px-2.5 py-0.5 backdrop-blur-xs border border-white/20"
          >
            {species}
          </Badge>
          {microchip && (
            <Badge
              variant="success"
              className="text-[10px] font-semibold bg-sage-600/90 text-white shadow-sm border border-white/20 backdrop-blur-xs"
            >
              <Cpu className="w-3 h-3 mr-1 shrink-0" aria-hidden="true" />
              <span>{microchip}</span>
            </Badge>
          )}
        </div>

        {/* Identificador rápido de sexo sobre la imagen */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-autumn-950/70 text-white backdrop-blur-xs border border-white/10 shadow-xs">
            {sex}
          </span>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Título y Raza */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-xl font-extrabold text-autumn-900 tracking-tight leading-snug group-hover:text-autumn-600 transition-colors">
                {name}
              </h3>
              <p className="text-xs text-autumn-600 font-semibold mt-0.5">
                {breed}
              </p>
            </div>
          </div>

          {/* Grilla de Datos Clínicos */}
          <div className="grid grid-cols-2 gap-2.5 mt-4 pt-3.5 border-t border-autumn-100 text-xs text-autumn-800 font-medium">
            <div className="flex items-center space-x-2 bg-autumn-50/60 p-2 rounded-lg border border-autumn-100/80">
              <User className="w-3.5 h-3.5 text-autumn-500 shrink-0" aria-hidden="true" />
              <span className="truncate" title={`Dueño: ${owner_name}`}>
                {owner_name}
              </span>
            </div>

            <div className="flex items-center space-x-2 bg-autumn-50/60 p-2 rounded-lg border border-autumn-100/80">
              <Weight className="w-3.5 h-3.5 text-autumn-500 shrink-0" aria-hidden="true" />
              <span>{weight_kg !== null && weight_kg !== undefined ? `${weight_kg} kg` : "S/D"}</span>
            </div>

            <div className="flex items-center space-x-2 bg-autumn-50/60 p-2 rounded-lg border border-autumn-100/80 col-span-2">
              <Calendar className="w-3.5 h-3.5 text-autumn-500 shrink-0" aria-hidden="true" />
              <span className="truncate">
                Nac: {formatDate(birth_date)}{" "}
                <strong className="text-autumn-900">({age_years} {age_years === 1 ? "año" : "años"})</strong>
              </span>
            </div>
          </div>

          {/* Notas Clínicas / Observaciones */}
          {notes && (
            <div className="mt-3.5 bg-amberGold-50/60 p-2.5 rounded-xl border border-amberGold-200/60 flex items-start space-x-2">
              <AlertCircle className="w-3.5 h-3.5 text-amberGold-600 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs text-autumn-900/80 line-clamp-2 italic leading-relaxed">
                &quot;{notes}&quot;
              </p>
            </div>
          )}
        </div>

        {/* Acciones e Interacciones */}
        <div className="pt-3.5 border-t border-autumn-100 flex items-center justify-between gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewHistory(pet)}
            className="flex-1 text-xs font-semibold space-x-1.5 shadow-2xs hover:bg-autumn-50 focus-visible:ring-2 focus-visible:ring-autumn-400"
            aria-label={`Ver historial clínico de ${name}`}
          >
            <FileText className="w-3.5 h-3.5 text-autumn-600" aria-hidden="true" />
            <span>Historial Clínico</span>
          </Button>

          {!isReadOnly && (
            <div className="flex items-center space-x-1 shrink-0">
              <button
                type="button"
                onClick={() => onEdit(pet)}
                className="p-2 text-autumn-700 hover:text-autumn-900 hover:bg-autumn-100/80 active:bg-autumn-200 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-autumn-400"
                title={`Editar ficha de ${name}`}
                aria-label={`Editar ficha de ${name}`}
              >
                <Edit className="w-4 h-4" aria-hidden="true" />
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => id && onDelete(id)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 active:bg-red-100 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                  title={`Dar de baja lógica a ${name}`}
                  aria-label={`Dar de baja lógica a ${name}`}
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

PetCard.propTypes = {
  pet: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    species: PropTypes.string,
    breed: PropTypes.string,
    sex: PropTypes.string,
    weight_kg: PropTypes.number,
    birth_date: PropTypes.string,
    age_years: PropTypes.number,
    owner_name: PropTypes.string,
    microchip: PropTypes.string,
    photo_url: PropTypes.string,
    notes: PropTypes.string,
  }),
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onViewHistory: PropTypes.func,
  className: PropTypes.string,
};