"use client";

import React, { useMemo, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  LayoutDashboard,
  Users,
  Dog,
  CalendarCheck,
  FileSpreadsheet,
  Syringe,
  BedDouble,
  Pill,
  X,
  Stethoscope,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Configuración inmutable de la navegación lateral.
 * Declarada fuera del componente para evitar reasignaciones en memoria durante cada renderizado.
 */
const NAVIGATION_ITEMS = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    roles: ["Administrador", "Veterinario", "Recepcionista", "Cliente"],
  },
  {
    name: "Clientes",
    href: "/clientes",
    icon: Users,
    roles: ["Administrador", "Recepcionista"],
  },
  {
    name: "Mascotas",
    href: "/mascotas",
    icon: Dog,
    roles: ["Administrador", "Veterinario", "Recepcionista", "Cliente"],
  },
  {
    name: "Turnos",
    href: "/turnos",
    icon: CalendarCheck,
    roles: ["Administrador", "Veterinario", "Recepcionista", "Cliente"],
  },
  {
    name: "Historias Clínicas",
    href: "/historias-clinicas",
    icon: FileSpreadsheet,
    roles: ["Administrador", "Veterinario", "Recepcionista", "Cliente"],
  },
  {
    name: "Vacunas",
    href: "/vacunas",
    icon: Syringe,
    roles: ["Administrador", "Veterinario", "Recepcionista", "Cliente"],
  },
  {
    name: "Internaciones",
    href: "/internaciones",
    icon: BedDouble,
    roles: ["Administrador", "Veterinario"],
  },
  {
    name: "Farmacia & Stock",
    href: "/farmacia",
    icon: Pill,
    roles: ["Administrador", "Veterinario"],
  },
];

export function Sidebar({ isOpen = false, onClose = () => {} }) {
  const pathname = usePathname();
  const { currentRole = "Invitado" } = useApp() || {};

  // Cierre del menú mediante tecla Escape para mejorar accesibilidad por teclado
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  // Filtrado de opciones según el rol del usuario autenticado
  const filteredNavItems = useMemo(() => {
    return NAVIGATION_ITEMS.filter((item) => item.roles.includes(currentRole));
  }, [currentRole]);

  // Determina si una ruta coincide exactamente o si es una subruta anidada activa
  const isItemActive = (href) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Backdrop responsivo para dispositivos móviles */}
      {isOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Cerrar panel de navegación lateral"
          className="fixed inset-0 z-40 bg-autumn-950/70 backdrop-blur-xs transition-opacity duration-300 lg:hidden"
          onClick={onClose}
          onKeyDown={(e) => e.key === "Enter" && onClose()}
        />
      )}

      {/* Estructura Principal del Sidebar */}
      <aside
        id="main-sidebar"
        aria-label="Navegación principal"
        className={cn(
          "fixed top-0 left-0 bottom-0 z-40 w-64 bg-autumn-900 text-autumn-100 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 border-r border-autumn-800/80 shadow-2xl lg:shadow-none select-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Cabecera / Identidad de Marca */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-autumn-800/80 bg-autumn-950/60 shrink-0">
          <Link
            href="/"
            className="flex items-center space-x-3 group outline-none focus-visible:ring-2 focus-visible:ring-autumn-400 rounded-lg p-1"
            onClick={onClose}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-autumn-500 via-amberGold-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-autumn-950/50 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-200">
              <Stethoscope className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block leading-none">
                Vet<span className="text-autumn-400">Otoño</span>
              </span>
              <span className="text-[9px] text-autumn-300/80 block font-semibold tracking-wider uppercase mt-1">
                Clínica Veterinaria
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar panel lateral"
            className="p-1.5 rounded-lg text-autumn-300 hover:text-white hover:bg-autumn-800/80 active:bg-autumn-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-autumn-400 transition-colors lg:hidden"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Menú de Navegación */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-autumn-400 uppercase tracking-wider">
              Menú {currentRole}
            </span>
            <span className="h-px flex-1 bg-autumn-800/60 ml-2" />
          </div>

          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group relative outline-none focus-visible:ring-2 focus-visible:ring-autumn-400",
                  active
                    ? "bg-autumn-500 text-white font-semibold shadow-md shadow-autumn-950/30"
                    : "text-autumn-200 hover:bg-autumn-800/70 hover:text-white"
                )}
              >
                {/* Indicador visual de selección lateral */}
                {active && (
                  <span
                    className="absolute left-0 top-2 bottom-2 w-1 bg-white rounded-r-full"
                    aria-hidden="true"
                  />
                )}

                <Icon
                  className={cn(
                    "w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                    active
                      ? "text-white"
                      : "text-autumn-400 group-hover:text-autumn-200"
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Pie de Página / Información del Sistema */}
        <div className="p-3 m-3 rounded-xl bg-autumn-950/40 border border-autumn-800/60 text-xs text-autumn-300 space-y-1.5 shrink-0">
          <div className="flex items-center space-x-2 font-semibold text-white">
            <ShieldCheck className="w-4 h-4 text-sage-400 shrink-0" aria-hidden="true" />
            <span className="truncate">Sistema 100% Vercel Ready</span>
          </div>
          <p className="text-[11px] text-autumn-300/70 leading-relaxed font-normal">
            Next.js App Router + Supabase DB
          </p>
        </div>
      </aside>
    </>
  );
}

Sidebar.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};