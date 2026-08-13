"use client";

import React, { useState } from "react";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { RoleBanner } from "@/components/layout/RoleBanner";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";

export default function RootLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <html lang="es">
      <head>
        <title>VetOtoño - Sistema Integral de Gestión Veterinaria</title>
        <meta
          name="description"
          content="Plataforma saas integral para administración de clínicas veterinarias, historias clínicas, turnos, vacunas e inventario de farmacia."
        />
        <meta name="viewport" content="width=device-[#width], initial-scale=1.0" />
      </head>
      <body className="min-h-screen bg-autumn-50 text-autumn-900 flex flex-col antialiased">
        <AppProvider>
          {/* Top Banner Simulator */}
          <RoleBanner />

          {/* Main App Frame */}
          <div className="flex flex-1 min-h-[calc(100vh-36px)] overflow-hidden">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Content Column */}
            <div className="flex-1 flex flex-col min-w-0 bg-autumn-50 overflow-y-auto">
              <Navbar onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

              <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
                {children}
              </main>
            </div>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
