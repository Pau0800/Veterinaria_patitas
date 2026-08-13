"use client";

import React from "react";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dog, Cpu, User, Calendar, Weight, FileText, Edit, Trash2 } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function PetCard({ pet, onEdit, onDelete, onViewHistory }) {
  const { currentRole } = useApp();
  const isReadOnly = currentRole === "Cliente";

  return (
    <Card className="flex flex-col h-full hover:border-autumn-400 group">
      {/* Header Image & Badge */}
      <div className="relative h-48 w-full bg-autumn-100 overflow-hidden">
        {pet.photo_url ? (
          <Image
            src={pet.photo_url}
            alt={pet.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-autumn-200 text-autumn-500">
            <Dog className="w-16 h-16 opacity-40" />
          </div>
        )}
        <div className="absolute top-3 right-3 flex flex-col items-end space-y-1">
          <Badge variant={pet.species === "Perro" ? "primary" : "warning"}>
            {pet.species}
          </Badge>
          {pet.microchip && (
            <Badge variant="success" className="text-[10px]">
              <Cpu className="w-3 h-3 mr-1" /> {pet.microchip}
            </Badge>
          )}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-autumn-900">{pet.name}</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-autumn-100 text-autumn-800">
              {pet.sex}
            </span>
          </div>
          <p className="text-xs text-autumn-600 font-medium">{pet.breed || "Mestizo"}</p>

          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-autumn-100 text-xs text-autumn-800">
            <div className="flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-autumn-500" />
              <span className="truncate">{pet.owner_name}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Weight className="w-3.5 h-3.5 text-autumn-500" />
              <span>{pet.weight_kg} kg</span>
            </div>
            <div className="flex items-center space-x-1.5 col-span-2">
              <Calendar className="w-3.5 h-3.5 text-autumn-500" />
              <span>Nac: {pet.birth_date || "Desconocida"} ({pet.age_years || 0} años)</span>
            </div>
          </div>

          {pet.notes && (
            <p className="text-xs text-autumn-800/70 bg-autumn-50 p-2.5 rounded-lg border border-autumn-200/60 mt-3 line-clamp-2 italic">
              &quot;{pet.notes}&quot;
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-autumn-100 flex items-center justify-between gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewHistory(pet)}
            className="flex-1 text-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Historial Clínico</span>
          </Button>

          {!isReadOnly && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => onEdit(pet)}
                className="p-2 text-autumn-700 hover:bg-autumn-100 rounded-lg transition-colors"
                title="Editar"
              >
                <Edit className="w-4 h-4" />
              </button>
              {currentRole === "Administrador" && (
                <button
                  onClick={() => onDelete(pet.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Dar de baja lógica"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
