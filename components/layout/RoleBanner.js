"use client";

import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Shield, Stethoscope, UserCheck, HeartHandshake } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

// Configuración de roles extraída fuera del render para evitar recreaciones de memoria
const ROLES_CONFIG = [
  {
    id: "Administrador",
    label: "Administrador",
    shortLabel: "Admin",
    icon: Shield,
    activeColor: "bg-autumn-500 text-white ring-autumn-400/50",
  },
  {
    id: "Veterinario",
    label: "Veterinario",
    shortLabel: "Vet",
    icon: Stethoscope,
    activeColor: "bg-sage-600 text-white ring-sage-400/50",
  },
  {
    id: "Recepcionista",
    label: "Recepcionista",
    shortLabel: "Recep",
    icon: UserCheck,
    activeColor: "bg-amberGold-600 text-white ring-amberGold-400/50",
  },
  {
    id: "Cliente",
    label: "Cliente (Dueño)",
    shortLabel: "Cliente",
    icon: HeartHandshake,
    activeColor: "bg-amber-600 text-white ring-amber-400/50",
  },
];

export function RoleBanner({ className = "" }) {
  const { currentRole = "Administrador", setCurrentRole = () => {} } = useApp() || {};

  // Memoriza el objeto del rol activo para evitar comparaciones repetidas en el render
  const activeRoleConfig = useMemo(() => {
    return ROLES_CONFIG.find((r) => r.id === currentRole) || ROLES_CONFIG[0];
  }, [currentRole]);

  return (
    <aside
      aria-label="Barra de simulación de rol de usuario"
      className={cn(
        "bg-autumn-950 text-autumn-100 text-xs px-3 sm:px-6 py-2 flex flex-col sm:flex-row items-center justify-between border-b border-autumn-800/80 shadow-xs z-30 transition-colors duration-200 gap-2 sm:gap-0 select-none",
        className
      )}
    >
      {/* Indicador de Estado y Rol Activo */}
      <div className="flex items-center space-x-2 font-medium w-full sm:w-auto justify-between sm:justify-start">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sage-500" />
          </span>
          <span className="text-autumn-300/90 text-[11px] sm:text-xs">
            Simulador de Rol Activo:
          </span>
        </div>
        <span className="font-extrabold text-white tracking-wide uppercase px-2 py-0.5 rounded bg-autumn-900 border border-autumn-800 text-[11px]">
          {activeRoleConfig.label}
        </span>
      </div>

      {/* Selector de Roles con accesibilidad ARIA */}
      <div
        role="toolbar"
        aria-label="Seleccionar rol para simular interfaz"
        className="flex items-center space-x-1 sm:space-x-1.5 w-full sm:w-auto justify-center sm:justify-end overflow-x-auto py-0.5"
      >
        <span className="text-autumn-400 text-[11px] mr-1 hidden lg:inline font-medium">
          Cambiar a:
        </span>

        {ROLES_CONFIG.map((role) => {
          const Icon = role.icon;
          const isActive = currentRole === role.id;

          return (
            <button
              key={role.id}
              type="button"
              role="button"
              aria-pressed={isActive}
              aria-label={`Simular interfaz como ${role.label}`}
              onClick={() => setCurrentRole(role.id)}
              className={cn(
                "px-2.5 py-1.5 sm:py-1 rounded-lg transition-all duration-200 flex items-center space-x-1.5 text-[11px] font-semibold cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/80 active:scale-95 touch-manipulation",
                isActive
                  ? `${role.activeColor} shadow-sm ring-1 scale-105 z-10`
                  : "bg-autumn-900/90 text-autumn-300 hover:bg-autumn-800 hover:text-white border border-autumn-800/50"
              )}
              title={`Simular interfaz como ${role.label}`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="hidden xs:inline sm:hidden md:inline">
                {role.shortLabel}
              </span>
              <span className="inline xs:hidden sm:inline md:hidden">
                {role.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

RoleBanner.propTypes = {
  className: PropTypes.string,
};