"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { Menu, Bell, User, Database, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function Navbar({ onMenuToggle }) {
  const { currentRole, isSupabaseConfigured } = useApp();

  return (
    <header className="h-16 bg-white border-b border-autumn-200 px-4 lg:px-8 flex items-center justify-between shadow-autumn-sm z-20">
      {/* Left side: Hamburger & Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-autumn-800 hover:bg-autumn-100 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base lg:text-lg font-bold text-autumn-900 leading-tight">
            Gestión Veterinaria Integrada
          </h1>
          <p className="text-xs text-autumn-800/60 hidden sm:block">
            Panel interactivo para {currentRole}
          </p>
        </div>
      </div>

      {/* Right side: Database Badge, Quick Actions, User profile */}
      <div className="flex items-center space-x-3 lg:space-x-4">
        {/* Supabase Status Indicator */}
        <div
          className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
            isSupabaseConfigured
              ? "bg-sage-50 text-sage-700 border-sage-500/30"
              : "bg-amberGold-50 text-amberGold-600 border-amberGold-500/30"
          }`}
          title={
            isSupabaseConfigured
              ? "Conectado a Supabase PostgreSQL"
              : "Modo Simulación / Mock (Configure .env.local para Supabase real)"
          }
        >
          <Database className="w-3.5 h-3.5" />
          <span>{isSupabaseConfigured ? "Supabase Vivo" : "Modo Demo Active"}</span>
        </div>

        {/* Quick Action Button */}
        {currentRole === "Cliente" ? (
          <Link href="/turnos">
            <Button size="sm" variant="primary">
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Solicitar Turno</span>
            </Button>
          </Link>
        ) : (
          <Link href="/turnos">
            <Button size="sm" variant="sage">
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Turno</span>
            </Button>
          </Link>
        )}

        {/* Notifications Icon */}
        <button className="p-2 rounded-lg text-autumn-800 hover:bg-autumn-100 relative transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-autumn-500 rounded-full"></span>
        </button>

        {/* Profile Avatar */}
        <div className="flex items-center space-x-2 pl-2 border-l border-autumn-200">
          <div className="w-9 h-9 rounded-full bg-autumn-200 border-2 border-autumn-400 flex items-center justify-center text-autumn-900 font-bold text-sm shadow-autumn-sm">
            {currentRole[0]}
          </div>
          <div className="hidden xl:block text-left text-xs">
            <div className="font-bold text-autumn-900">
              {currentRole === "Cliente" ? "María Fernández" : "Usuario " + currentRole}
            </div>
            <div className="text-autumn-800/60 font-medium">{currentRole}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
