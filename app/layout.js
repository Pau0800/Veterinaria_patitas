import { Inter } from "next/font/google";
import "./globals.css";

import { AppProvider } from "@/context/AppContext";
import { RoleBanner } from "@/components/layout/RoleBanner";
import { ClientLayoutWrapper } from "@/components/layout/ClientLayoutWrapper";

// Optimización de tipografía nativa con Next.js Font Optimization
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Metadatos nativos para SEO (Next.js App Router)
export const metadata = {
  title: {
    default: "VetOtoño | Sistema Integral de Gestión Veterinaria",
    template: "%s | VetOtoño",
  },
  description:
    "Plataforma SaaS profesional para la administración de clínicas veterinarias, historias clínicas, turnos, vacunas e inventario de farmacia.",
  keywords: [
    "veterinaria",
    "gestión clínica",
    "historias clínicas",
    "turnos médicos",
    "inventario veterinario",
    "SaaS veterinario",
  ],
  authors: [{ name: "VetOtoño" }],
  robots: "index, follow",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#fdf8f6",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${inter.variable} h-full scroll-smooth`}>
      <body className="min-h-full bg-autumn-50 text-autumn-900 font-sans flex flex-col antialiased selection:bg-autumn-200 selection:text-autumn-900">
        {/* Accesibilidad: Enlace directo al contenido para teclados/lectores de pantalla (WCAG 2.1) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-autumn-600 text-white rounded-md shadow-lg outline-none focus:ring-2 focus:ring-autumn-400 font-medium text-sm transition-transform"
        >
          Saltar al contenido principal
        </a>

        <AppProvider>
          {/* Banner de simulación de roles */}
          <RoleBanner />

          {/* Wrapper interactivo de cliente para Navbar, Sidebar y GeminiChat */}
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </AppProvider>
      </body>
    </html>
  );
}