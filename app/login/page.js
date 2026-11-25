"use client";

import React, { useState } from "react";
import { z } from "zod";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Stethoscope,
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  Shield,
  UserCheck,
  LogIn,
  Sparkles,
} from "lucide-react";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Ingresá tu email.")
    .email("Ingresá un email válido."),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres."),
});

const IS_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

// Tarjetas de acceso rápido visibles únicamente cuando NEXT_PUBLIC_DEMO_MODE=true.
// Contraseñas solo para entorno demo (coinciden con scripts/seed-users.mjs).
const DEMO_ACCOUNTS = IS_DEMO_MODE
  ? [
      {
        role: "Administrador",
        description: "Acceso total + lista de usuarios",
        email: "admin@vetotono.com",
        password: "DemoAdmin2026!",
        icon: Shield,
        badgeClass: "bg-autumn-100 text-autumn-800 border-autumn-300",
      },
      {
        role: "Veterinario",
        description: "Clínica, internaciones y farmacia",
        email: "vet@vetotono.com",
        password: "DemoVet2026!",
        icon: Stethoscope,
        badgeClass: "bg-sage-100 text-sage-800 border-sage-500/30",
      },
      {
        role: "Recepcionista",
        description: "Clientes, mascotas, turnos y vacunas",
        email: "recepcion@vetotono.com",
        password: "DemoRecep2026!",
        icon: UserCheck,
        badgeClass: "bg-amberGold-100 text-amberGold-600 border-amberGold-500/30",
      },
    ]
  : [];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFillDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setFieldErrors({});
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setServerError("");

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const nextErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    if (!isSupabaseConfigured()) {
      setServerError(
        "Supabase no está configurado. Verificá las variables de entorno."
      );
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (error || !data?.user) {
        setServerError("Credenciales inválidas. Verificá tu email y contraseña.");
        setIsLoading(false);
        return;
      }

      // Verificar que exista perfil activo antes de redirigir
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, status")
        .or(`user_id.eq.${data.user.id},id.eq.${data.user.id}`)
        .maybeSingle();

      if (profileError || !profile || profile.status === "inactivo") {
        await supabase.auth.signOut();
        setServerError(
          "Tu cuenta no tiene un perfil activo habilitado. Contactá al administrador."
        );
        setIsLoading(false);
        return;
      }

      window.location.replace("/");
    } catch {
      setServerError("Ocurrió un error al iniciar sesión. Intentá nuevamente.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-autumn-50 via-autumn-100/70 to-sage-50 px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        {/* Identidad VetOtoño */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-autumn-500 via-amberGold-500 to-amber-600 flex items-center justify-center text-white shadow-autumn-md">
            <Stethoscope className="w-7 h-7" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-autumn-900">
              Vet<span className="text-autumn-500">Otoño</span>
            </h1>
            <p className="text-sm text-autumn-800/75 mt-1 font-medium">
              Sistema Integral de Gestión Veterinaria
            </p>
          </div>
        </div>

        {/* Tarjeta de Login */}
        <div className="bg-white rounded-2xl border border-autumn-200 shadow-autumn-lg p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-autumn-900">Iniciar sesión</h2>
            <p className="text-xs text-autumn-800/70">
              Ingresá con tus credenciales institucionales para acceder al panel.
            </p>
          </div>

          {serverError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              label="Correo electrónico"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="usuario@vetotono.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors.email}
              disabled={isLoading}
            />

            <Input
              label="Contraseña"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              disabled={isLoading}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full font-bold shadow-sm mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Validando acceso...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" aria-hidden="true" />
                  <span>Ingresar</span>
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Tarjetas de acceso rápido demo (solo si NEXT_PUBLIC_DEMO_MODE=true) */}
        {IS_DEMO_MODE && DEMO_ACCOUNTS.length > 0 && (
          <section
            aria-label="Acceso rápido demo"
            className="bg-white/85 backdrop-blur-xs rounded-2xl border border-autumn-200 p-4 sm:p-5 shadow-autumn-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-autumn-900 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-autumn-500" />
                <span>Acceso rápido demo</span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sage-100 text-sage-700 border border-sage-500/20">
                1 clic para rellenar
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {DEMO_ACCOUNTS.map((account) => {
                const Icon = account.icon;
                return (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => handleFillDemo(account)}
                    disabled={isLoading}
                    className="w-full text-left p-3 rounded-xl border border-autumn-200 bg-autumn-50/60 hover:bg-autumn-100/80 hover:border-autumn-300 transition-all flex items-center justify-between gap-3 group focus:outline-none focus:ring-2 focus:ring-autumn-500 disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-lg border shrink-0 ${account.badgeClass}`}
                      >
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-autumn-900">
                          {account.role}
                        </div>
                        <div className="text-[11px] text-autumn-800/70 truncate">
                          {account.email} · {account.description}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-autumn-600 group-hover:text-autumn-800 shrink-0">
                      Usar
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
