"use client";

import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import GeminiChat from "@/components/ia/GeminiChat";

export function ClientLayoutWrapper({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  // Cierra automáticamente el sidebar cuando la pantalla escala a vistas desktop (≥ 1024px)
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const handleMediaChange = (e) => {
      if (e.matches) {
        closeSidebar();
      }
    };

    if (mediaQuery.matches && isSidebarOpen) {
      closeSidebar();
    }

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, [isSidebarOpen, closeSidebar]);

  // Manejo de scroll en el body únicamente en dispositivos móviles cuando el sidebar está abierto
  useEffect(() => {
    const isMobile = window.innerWidth < 1024;

    if (isSidebarOpen && isMobile) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isSidebarOpen]);

  // Accesibilidad por teclado: atajo tecla Escape
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isSidebarOpen) {
        closeSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSidebarOpen, closeSidebar]);

  return (
    <div className="flex flex-1 min-h-screen w-full relative bg-autumn-50/50 text-gray-900 antialiased selection:bg-autumn-200 selection:text-autumn-900">
      {/* Botón Accesible "Saltar al contenido principal" */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-autumn-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-autumn-500 transition-all"
      >
        Saltar al contenido principal
      </a>

      {/* Backdrop para dispositivos móviles con animación de opacidad */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden transition-opacity duration-300 ease-in-out"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Componente Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Contenedor principal de la aplicación */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        <Navbar onMenuToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        
        {/* Asistente virtual flotante */}
        <GeminiChat />

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 focus:outline-none transition-all duration-200"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

ClientLayoutWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};