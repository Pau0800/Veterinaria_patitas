"use client";

import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { ROLES, getRoleLabel, normalizeRole } from "@/lib/permissions";
import { useApp } from "@/context/AppContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import {
  UserCog,
  UserPlus,
  Mail,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  User,
} from "lucide-react";

const ROLE_BADGE_VARIANTS = {
  administrador: "danger",
  veterinario: "success",
  recepcionista: "warning",
  cliente: "default",
};

const STAFF_ROLE_OPTIONS = [
  { value: ROLES.VET, label: "Veterinario" },
  { value: ROLES.RECEPTIONIST, label: "Recepcionista" },
];

const createStaffSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Ingresá el nombre completo (mínimo 2 caracteres).")
    .max(150),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Ingresá un correo electrónico válido.")
    .max(150),
  password: z
    .string()
    .min(6, "La contraseña inicial debe tener al menos 6 caracteres.")
    .max(128),
  role: z.enum([ROLES.VET, ROLES.RECEPTIONIST], {
    errorMap: () => ({
      message: "Seleccioná un rol válido (Veterinario o Recepcionista).",
    }),
  }),
});

const INITIAL_FORM = {
  full_name: "",
  email: "",
  password: "",
  role: ROLES.VET,
};

function formatDateEs(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function UsuariosClient({
  initialUsers = [],
  fetchError = null,
  currentUserRole = null,
}) {
  const router = useRouter();
  const { refreshVeterinarians } = useApp() || {};
  const isAdmin = normalizeRole(currentUserRole) === ROLES.ADMIN;

  const [users, setUsers] = useState(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [successBanner, setSuccessBanner] = useState("");

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const handleOpenModal = useCallback(() => {
    if (!isAdmin) return;
    setFormData(INITIAL_FORM);
    setFieldErrors({});
    setServerError("");
    setShowPassword(false);
    setCopiedPassword(false);
    setIsModalOpen(true);
  }, [isAdmin]);

  const handleCloseModal = useCallback(() => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setFieldErrors({});
    setServerError("");
  }, [isSubmitting]);

  const handleFieldChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setServerError("");
  }, []);

  const handleCopyPassword = useCallback(async () => {
    if (!formData.password) return;
    try {
      await navigator.clipboard.writeText(formData.password);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    } catch {
      // Ignorar si clipboard no está disponible
    }
  }, [formData.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    setFieldErrors({});
    setServerError("");

    const parsed = createStaffSchema.safeParse(formData);
    if (!parsed.success) {
      const nextErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key && !nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (Array.isArray(data?.issues)) {
          const apiErrors = {};
          data.issues.forEach((issue) => {
            if (issue.field && !apiErrors[issue.field]) {
              apiErrors[issue.field] = issue.message;
            }
          });
          setFieldErrors(apiErrors);
        }
        setServerError(
          data?.error || "No se pudo registrar al nuevo integrante."
        );
        return;
      }

      if (data?.user) {
        setUsers((prev) => [
          data.user,
          ...prev.filter((u) => u.id !== data.user.id && u.email !== data.user.email),
        ]);
      }

      setSuccessBanner(
        `Cuenta creada para ${parsed.data.full_name} (${getRoleLabel(
          parsed.data.role
        )}). Ya puede iniciar sesión con ${parsed.data.email}.`
      );
      setIsModalOpen(false);
      refreshVeterinarians?.();
      router.refresh();
    } catch {
      setServerError("Error de red al intentar crear el usuario.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-2 sm:p-4 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-autumn-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-autumn-900 tracking-tight flex items-center gap-2.5">
            <UserCog className="w-7 h-7 text-autumn-600" />
            <span>Usuarios del Sistema</span>
          </h1>
          <p className="text-xs sm:text-sm text-autumn-800/75 mt-1">
            Gestión de personal veterinario, recepción y roles de acceso en VetOtoño.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-autumn-100 text-autumn-900 text-xs font-semibold border border-autumn-200">
            <ShieldCheck className="w-4 h-4 text-autumn-600" />
            <span>{users.length} perfil(es)</span>
          </div>

          {isAdmin && (
            <Button
              type="button"
              variant="primary"
              onClick={handleOpenModal}
              className="shadow-sm font-semibold"
            >
              <UserPlus className="w-4 h-4" aria-hidden="true" />
              <span>+ Agregar Nuevo Personal</span>
            </Button>
          )}
        </div>
      </header>

      {successBanner && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 p-4 rounded-xl bg-sage-50 border border-sage-500/30 text-sage-800 text-xs sm:text-sm font-medium"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-sage-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessBanner("")}
            className="text-xs font-bold text-sage-700 hover:underline shrink-0"
          >
            Ocultar
          </button>
        </div>
      )}

      {fetchError ? (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm"
        >
          No se pudieron cargar los usuarios desde Supabase: {fetchError}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-autumn-200 shadow-autumn-sm overflow-hidden">
          <Table>
            <Thead className="bg-autumn-100/50">
              <Tr>
                <Th>Nombre</Th>
                <Th>Email</Th>
                <Th>Rol</Th>
                <Th>Acceso Login</Th>
                <Th>Estado</Th>
                <Th>Fecha de Alta</Th>
              </Tr>
            </Thead>
            <Tbody className="divide-y divide-autumn-100/60">
              {users.length === 0 ? (
                <Tr>
                  <Td
                    colSpan={6}
                    className="text-center py-10 text-autumn-800/70 text-sm"
                  >
                    No hay perfiles registrados en la base de datos.
                  </Td>
                </Tr>
              ) : (
                users.map((profile) => {
                  const normalizedRole = normalizeRole(profile.role);
                  const badgeVariant =
                    ROLE_BADGE_VARIANTS[normalizedRole] || "default";
                  const hasAuth = Boolean(profile.user_id);

                  return (
                    <Tr
                      key={profile.id}
                      className="hover:bg-autumn-50/60 transition-colors"
                    >
                      <Td className="font-bold text-autumn-900">
                        {profile.full_name || "Sin nombre"}
                      </Td>
                      <Td className="text-autumn-800">
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <Mail className="w-3.5 h-3.5 text-autumn-500 shrink-0" />
                          <span>{profile.email}</span>
                        </span>
                      </Td>
                      <Td>
                        <Badge variant={badgeVariant}>
                          {getRoleLabel(normalizedRole)}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge variant={hasAuth ? "success" : "default"}>
                          {hasAuth ? "Cuenta Auth activa" : "Ficha sin login"}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge
                          variant={
                            profile.status === "inactivo" ? "danger" : "success"
                          }
                        >
                          {profile.status === "inactivo" ? "Inactivo" : "Activo"}
                        </Badge>
                      </Td>
                      <Td className="text-xs text-autumn-800/80">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-autumn-500 shrink-0" />
                          <span>{formatDateEs(profile.created_at)}</span>
                        </span>
                      </Td>
                    </Tr>
                  );
                })
              )}
            </Tbody>
          </Table>
        </div>
      )}

      {/* Modal de Alta de Nuevo Personal (solo Administrador) */}
      {isAdmin && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-autumn-600" aria-hidden="true" />
              <span>Agregar Nuevo Personal</span>
            </div>
          }
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSubmit} noValidate className="space-y-4 py-1">
            {serverError && (
              <div
                role="alert"
                className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium"
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            <Input
              label="Nombre completo *"
              placeholder="Ej. Dr. Juan Pérez"
              icon={User}
              value={formData.full_name}
              onChange={(e) => handleFieldChange("full_name", e.target.value)}
              error={fieldErrors.full_name}
              disabled={isSubmitting}
              required
            />

            <Input
              label="Correo electrónico *"
              type="email"
              placeholder="juan.perez@vetotono.com"
              icon={Mail}
              value={formData.email}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              error={fieldErrors.email}
              disabled={isSubmitting}
              required
            />

            <div className="space-y-1.5">
              <Input
                label="Contraseña inicial *"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                icon={Lock}
                endIcon={showPassword ? EyeOff : Eye}
                onEndIconClick={() => setShowPassword((prev) => !prev)}
                value={formData.password}
                onChange={(e) => handleFieldChange("password", e.target.value)}
                error={fieldErrors.password}
                helperText="Mínimo 6 caracteres. Podés mostrarla y copiarla para entregársela al empleado."
                disabled={isSubmitting}
                required
              />
              {formData.password && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-autumn-700 hover:text-autumn-900 px-2 py-0.5 rounded hover:bg-autumn-100 transition-colors"
                  >
                    {copiedPassword ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-sage-600" />
                        <span>Contraseña copiada</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar contraseña</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <Select
              label="Rol del personal *"
              options={STAFF_ROLE_OPTIONS}
              value={formData.role}
              onChange={(e) => handleFieldChange("role", e.target.value)}
              error={fieldErrors.role}
              disabled={isSubmitting}
              required
            />

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-autumn-100">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="min-w-[170px] font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Creando cuenta...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                    <span>Crear Personal</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

UsuariosClient.propTypes = {
  initialUsers: PropTypes.array,
  fetchError: PropTypes.string,
  currentUserRole: PropTypes.string,
};
