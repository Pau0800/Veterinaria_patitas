"use client";

import React, { useMemo } from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import { Menu, Bell, Database, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/context/AppContext";

export function Navbar({ onMenuToggle, isSidebarOpen = false }) {
  const { currentRole = "Invitado", isSupabaseConfigured = false } = useApp() || {};

  // Memoria del cálculo del avatar e información de usuario
  const { avatarInitial, userName, isClient } = useMemo(() => {
    const safeRole = currentRole || "Invitado";
    return {
      avatarInitial: safeRole.charAt(0).toUpperCase(),
      userName: safeRole === "Cliente" ? "María Fernández" : `Usuario ${safeRole}`,
      isClient: safeRole === "Cliente",
    };
  }, [currentRole]);

  return (
    <header className="sticky top-0 z-20 h-16 w-full bg-white/95 backdrop-blur-md border-b border-autumn-200 px-4 lg:px-8 flex items-center justify-between shadow-xs transition-colors duration-200">
      {/* Sección Izquierda: Botón Hamburguesa y Título del Sistema */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label={isSidebarOpen ? "Cerrar menú principal" : "Abrir menú principal"}
          aria-expanded={isSidebarOpen}
          aria-controls="main-sidebar"
          className="p-2 rounded-xl text-autumn-800 hover:bg-autumn-100/80 active:bg-autumn-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-autumn-500 transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </button>

        <div>
          <h1 className="text-base lg:text-lg font-extrabold text-autumn-900 leading-tight tracking-tight">
            Gestión Veterinaria Integrada
          </h1>
          <p className="text-xs text-autumn-800/70 hidden sm:block font-medium">
            Panel interactivo para {currentRole}
          </p>
        </div>
      </div>

      {/* Sección Derecha: Estado DB, Acciones Rápidas, Notificaciones y Perfil */}
      <div className="flex items-center space-x-3 lg:space-x-4">
        {/* Indicador de Estado de Supabase */}
        <div
          tabIndex={0}
          role="status"
          aria-label={
            isSupabaseConfigured
              ? "Base de datos conectada a Supabase PostgreSQL"
              : "Modo Simulación / Mock activado"
          }
          className={`hidden md:flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 select-none ${
            isSupabaseConfigured
              ? "bg-sage-50 text-sage-800 border-sage-500/30 hover:bg-sage-100"
              : "bg-amberGold-50 text-amberGold-700 border-amberGold-500/30 hover:bg-amberGold-100"
          }`}
          title={
            isSupabaseConfigured
              ? "Conectado a Supabase PostgreSQL"
              : "Modo Simulación / Mock (Configure .env.local para Supabase real)"
          }
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isSupabaseConfigured ? "bg-sage-400" : "bg-amberGold-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isSupabaseConfigured ? "bg-sage-500" : "bg-amberGold-500"
              }`}
            />
          </span>
          <Database className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{isSupabaseConfigured ? "Supabase Vivo" : "Modo Demo Activo"}</span>
        </div>

        {/* Botón de Acción Rápida */}
        <Link href="/turnos" passHref legacyBehavior>
          <Button
            size="sm"
            variant={isClient ? "primary" : "sage"}
            className="flex items-center space-x-1.5 shadow-xs hover:shadow-md transition-shadow"
          >
            <PlusCircle className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline font-semibold">
              {isClient ? "Solicitar Turno" : "Nuevo Turno"}
            </span>
          </Button>
        </Link>

        {/* Botón de Notificaciones */}
        <button
          type="button"
          aria-label="Ver notificaciones no leídas"
          className="relative p-2 rounded-xl text-autumn-800 hover:bg-autumn-100/80 active:bg-autumn-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-autumn-500 transition-colors"
        >
          <Bell className="w-5 h-5" aria-hidden="true" />
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-autumn-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-autumn-500 border border-white" />
          </span>
        </button>

        {/* Avatar y Datos del Usuario */}
        <div className="flex items-center space-x-3 pl-3 border-l border-autumn-200">
          <div
            className="w-9 h-9 rounded-full bg-autumn-100 border-2 border-autumn-300 flex items-center justify-center text-autumn-900 font-extrabold text-sm shadow-xs select-none transition-transform hover:scale-105"
            aria-hidden="true"
          >
            {avatarInitial}
          </div>
          <div className="hidden xl:block text-left text-xs leading-tight">
            <div className="font-bold text-autumn-900 tracking-tight">{userName}</div>
            <div className="text-autumn-800/60 font-medium">{currentRole}</div>
          </div>
        </div>
      </div>
    </header>
  );
}

Navbar.propTypes = {
  onMenuToggle: PropTypes.func.isRequired,
  isSidebarOpen: PropTypes.bool,
};