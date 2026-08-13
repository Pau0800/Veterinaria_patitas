"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { Shield, Stethoscope, UserCheck, HeartHandshake } from "lucide-react";
import { cn } from "@/lib/utils";

export function RoleBanner() {
  const { currentRole, setCurrentRole } = useApp();

  const roles = [
    { id: "Administrador", label: "Administrador", icon: Shield, color: "bg-autumn-500 text-white" },
    { id: "Veterinario", label: "Veterinario", icon: Stethoscope, color: "bg-sage-500 text-white" },
    { id: "Recepcionista", label: "Recepcionista", icon: UserCheck, color: "bg-amberGold-500 text-white" },
    { id: "Cliente", label: "Cliente (Dueño)", icon: HeartHandshake, color: "bg-amber-600 text-white" },
  ];

  return (
    <div className="bg-autumn-900 text-autumn-100 text-xs px-4 py-2 flex flex-wrap items-center justify-between border-b border-autumn-800 shadow-sm z-30">
      <div className="flex items-center space-x-2 font-medium">
        <span className="inline-block w-2 h-2 rounded-full bg-sage-500 animate-pulse"></span>
        <span className="text-autumn-300">Simulador de Rol Activo:</span>
        <span className="font-bold text-white uppercase tracking-wider">{currentRole}</span>
      </div>

      <div className="flex items-center space-x-1.5 mt-1 sm:mt-0">
        <span className="text-autumn-300 mr-1 hidden md:inline">Cambiar rol:</span>
        {roles.map((r) => {
          const Icon = r.icon;
          const isActive = currentRole === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setCurrentRole(r.id)}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all duration-200 flex items-center space-x-1 font-medium cursor-pointer",
                isActive
                  ? r.color + " shadow-md ring-1 ring-white/30"
                  : "bg-autumn-800 text-autumn-300 hover:bg-autumn-700 hover:text-white"
              )}
              title={`Simular interfaz como ${r.label}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{r.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
