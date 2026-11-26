"use client";

import React, { useMemo, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { getAllowedSidebarItems } from "@/lib/permissions";
import {
  LayoutDashboard,
  Users,
  Dog,
  CalendarCheck,
  FileSpreadsheet,
  Syringe,
  BedDouble,
  Pill,
  ClipboardList,
  UserCog,
  X,
  Stethoscope,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP = {
  LayoutDashboard,
  Users,
  Dog,
  CalendarCheck,
  FileSpreadsheet,
  Syringe,
  BedDouble,
  Pill,
  ClipboardList,
  UserCog,
};

export function Sidebar({ isOpen = false, onClose = () => {} }) {
  const pathname = usePathname();
  const { userRole = null, currentRole = "Invitado" } = useApp() || {};

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

  // Filtrado dinámico de opciones desde lib/permissions.js según el rol autenticado
  const filteredNavItems = useMemo(() => {
    return getAllowedSidebarItems(userRole);
  }, [userRole]);

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
          "fixed top-0 left-0 bottom-0 z-40 w-64 bg-[#2C2115] text-[#FAF6EF] flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 border-r border-[#473621] shadow-2xl lg:shadow-none select-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Cabecera / Identidad de Marca */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#473621] bg-[#1F170E]/70 shrink-0">
          <Link
            href="/"
            className="flex items-center space-x-3 group outline-none focus-visible:ring-2 focus-visible:ring-[#D48A1C] rounded-lg p-1"
            onClick={onClose}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B84A14] via-[#D48A1C] to-[#AD5D1E] flex items-center justify-center text-white shadow-md shadow-[#1F170E]/60 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-200">
              <Stethoscope className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block leading-none">
                Vet<span className="text-[#D48A1C]">Otoño</span>
              </span>
              <span className="text-[9px] text-[#E6D8C3]/80 block font-semibold tracking-wider uppercase mt-1">
                Clínica Veterinaria
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar panel lateral"
            className="p-1.5 rounded-lg text-[#E6D8C3] hover:text-white hover:bg-[#473621] active:bg-[#6E4B2A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D48A1C] transition-colors lg:hidden"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Menú de Navegación */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-[#D48A1C] uppercase tracking-wider">
              Menú {currentRole || "Sistema"}
            </span>
            <span className="h-px flex-1 bg-[#473621] ml-2" />
          </div>

          {filteredNavItems.map((item) => {
            const Icon = ICON_MAP[item.iconKey] || LayoutDashboard;
            const active = isItemActive(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group relative outline-none focus-visible:ring-2 focus-visible:ring-[#D48A1C]",
                  active
                    ? "bg-[#B84A14] text-white font-semibold shadow-md shadow-[#1F170E]/40"
                    : "text-[#F5EFE4]/90 hover:bg-[#473621] hover:text-white"
                )}
              >
                {/* Indicador visual de selección lateral */}
                {active && (
                  <span
                    className="absolute left-0 top-2 bottom-2 w-1 bg-[#D48A1C] rounded-r-full"
                    aria-hidden="true"
                  />
                )}

                <Icon
                  className={cn(
                    "w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                    active
                      ? "text-white"
                      : "text-[#D48A1C] group-hover:text-[#FAF6EF]"
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Pie de Página / Información del Sistema */}
        <div className="p-3 m-3 rounded-xl bg-[#473621]/50 border border-[#6E4B2A]/40 text-xs text-[#E6D8C3] space-y-1.5 shrink-0">
          <div className="flex items-center space-x-2 font-semibold text-white">
            <ShieldCheck className="w-4 h-4 text-sage-400 shrink-0" aria-hidden="true" />
            <span className="truncate">Acceso Protegido</span>
          </div>
          <p className="text-[11px] text-[#E6D8C3]/75 leading-relaxed font-normal">
            Supabase Auth + Control por Rol
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
