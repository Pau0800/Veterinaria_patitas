"use client";

import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import { Menu, Bell, Database, PlusCircle, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/context/AppContext";

export function Navbar({ onMenuToggle, isSidebarOpen = false }) {
  const {
    user = null,
    currentRole = "Invitado",
    signOut,
    isSupabaseConfigured = false,
  } = useApp() || {};

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { avatarInitial, userName, roleLabel, isClient } = useMemo(() => {
    const safeRole = currentRole || "Invitado";
    const displayName = user?.full_name || user?.email || `Usuario ${safeRole}`;
    return {
      avatarInitial: displayName.charAt(0).toUpperCase(),
      userName: displayName,
      roleLabel: safeRole,
      isClient: safeRole === "Cliente",
    };
  }, [user, currentRole]);

  const handleLogout = async () => {
    if (isLoggingOut || typeof signOut !== "function") return;
    setIsLoggingOut(true);
    await signOut();
  };

  return (
    <header className="sticky top-0 z-20 h-16 w-full bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#E6D8C3] px-4 lg:px-8 flex items-center justify-between shadow-xs transition-colors duration-200">
      {/* Sección Izquierda: Botón Hamburguesa y Título del Sistema */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label={isSidebarOpen ? "Cerrar menú principal" : "Abrir menú principal"}
          aria-expanded={isSidebarOpen}
          aria-controls="main-sidebar"
          className="p-2 rounded-xl text-[#473621] hover:bg-[#F5EFE4] active:bg-[#E6D8C3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B84A14] transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </button>

        <div>
          <h1 className="text-base lg:text-lg font-extrabold text-[#2C2115] leading-tight tracking-tight">
            Gestión Veterinaria Integrada
          </h1>
          <p className="text-xs text-[#6E4B2A] hidden sm:block font-medium">
            Panel de {roleLabel}
          </p>
        </div>
      </div>

      {/* Sección Derecha: Estado DB, Acciones Rápidas, Usuario Real y Cerrar Sesión */}
      <div className="flex items-center space-x-2.5 lg:space-x-4">
        {/* Indicador de Estado de Supabase */}
        <div
          tabIndex={0}
          role="status"
          aria-label={
            isSupabaseConfigured
              ? "Base de datos conectada a Supabase PostgreSQL"
              : "Supabase no configurado"
          }
          className={`hidden md:flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 select-none ${
            isSupabaseConfigured
              ? "bg-sage-50 text-sage-800 border-sage-500/30 hover:bg-sage-100"
              : "bg-amberGold-50 text-amberGold-700 border-amberGold-500/30 hover:bg-amberGold-100"
          }`}
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
          <span>{isSupabaseConfigured ? "Supabase Vivo" : "Sin Conexión"}</span>
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
          className="hidden sm:inline-flex relative p-2 rounded-xl text-autumn-800 hover:bg-autumn-100/80 active:bg-autumn-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-autumn-500 transition-colors"
        >
          <Bell className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Avatar, Datos del Usuario Autenticado y Botón Cerrar Sesión */}
        <div className="flex items-center space-x-2.5 pl-2.5 sm:pl-3 border-l border-autumn-200">
          <div
            className="w-9 h-9 rounded-full bg-autumn-100 border-2 border-autumn-300 flex items-center justify-center text-autumn-900 font-extrabold text-sm shadow-xs select-none"
            aria-hidden="true"
          >
            {avatarInitial}
          </div>
          <div className="hidden md:block text-left text-xs leading-tight max-w-[160px]">
            <div className="font-bold text-autumn-900 tracking-tight truncate">
              {userName}
            </div>
            <div className="text-autumn-700 font-semibold">{roleLabel}</div>
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-label="Cerrar sesión"
            className="border-autumn-300 text-autumn-800 hover:bg-red-50 hover:text-red-700 hover:border-red-300 flex items-center gap-1.5"
          >
            {isLoggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <LogOut className="w-4 h-4" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">Cerrar sesión</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

Navbar.propTypes = {
  onMenuToggle: PropTypes.func.isRequired,
  isSidebarOpen: PropTypes.bool,
};
