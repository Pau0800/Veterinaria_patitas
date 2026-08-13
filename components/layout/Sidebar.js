"use client";

import React from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { currentRole } = useApp();

  const allNavItems = [
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

  const filteredNavItems = allNavItems.filter((item) => item.roles.includes(currentRole));

  return (
    <>
      {/* Backdrop mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-autumn-900/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 z-40 w-64 bg-autumn-900 text-autumn-100 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 border-r border-autumn-800 shadow-xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-autumn-800 bg-autumn-950/50">
          <Link href="/" className="flex items-center space-x-3 group" onClick={onClose}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-autumn-500 to-amberGold-500 flex items-center justify-center text-white shadow-autumn-md group-hover:scale-105 transition-transform">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white block">
                Vet<span className="text-autumn-400">Otoño</span>
              </span>
              <span className="text-[10px] text-autumn-300 block -mt-1 font-medium tracking-wide">
                CLÍNICA VETERINARIA
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-autumn-300 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 mb-2 text-[10px] font-bold text-autumn-400 uppercase tracking-wider">
            Menú {currentRole}
          </div>

          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group",
                  isActive
                    ? "bg-autumn-500 text-white shadow-autumn-sm font-semibold"
                    : "text-autumn-200 hover:bg-autumn-800/80 hover:text-white"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-transform group-hover:scale-110",
                    isActive ? "text-white" : "text-autumn-400 group-hover:text-autumn-200"
                  )}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 m-3 rounded-xl bg-autumn-800/50 border border-autumn-700/50 text-xs text-autumn-300 space-y-1">
          <div className="font-semibold text-white">Sistema 100% Vercel Ready</div>
          <div className="text-[11px] text-autumn-300/80">Next.js App Router + Supabase</div>
        </div>
      </aside>
    </>
  );
}
