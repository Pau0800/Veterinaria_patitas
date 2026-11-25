import React from "react";
import { requireRouteAccess } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getRoleLabel, normalizeRole } from "@/lib/permissions";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { UserCog, ShieldCheck, Mail, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

const ROLE_BADGE_VARIANTS = {
  administrador: "danger",
  veterinario: "success",
  recepcionista: "warning",
  cliente: "default",
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

export default async function UsuariosPage() {
  await requireRouteAccess("/usuarios");

  const supabase = createClient();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, user_id, full_name, email, role, status, created_at")
    .order("created_at", { ascending: false });

  const usersList = Array.isArray(profiles) ? profiles : [];

  return (
    <div className="space-y-6 p-2 sm:p-4 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-autumn-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-autumn-900 tracking-tight flex items-center gap-2.5">
            <UserCog className="w-7 h-7 text-autumn-600" />
            <span>Usuarios del Sistema</span>
          </h1>
          <p className="text-xs sm:text-sm text-autumn-800/75 mt-1">
            Listado de solo lectura de perfiles y roles registrados en VetOtoño.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-autumn-100 text-autumn-900 text-xs font-semibold border border-autumn-200 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-autumn-600" />
          <span>Solo lectura · {usersList.length} perfil(es)</span>
        </div>
      </header>

      {error ? (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm"
        >
          No se pudieron cargar los usuarios desde Supabase: {error.message}
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
              {usersList.length === 0 ? (
                <Tr>
                  <Td
                    colSpan={6}
                    className="text-center py-10 text-autumn-800/70 text-sm"
                  >
                    No hay perfiles registrados en la base de datos.
                  </Td>
                </Tr>
              ) : (
                usersList.map((profile) => {
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
    </div>
  );
}
