import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  canAccessRoute,
  getRoleLabel,
  normalizeRole,
} from "@/lib/permissions";

/**
 * Obtiene el usuario autenticado mediante supabase.auth.getUser() (nunca getSession())
 * y lee su perfil/rol desde public.profiles.
 * Retorna null si no hay sesión válida o si el perfil está inactivo/inexistente.
 */
export async function getAuthenticatedProfile() {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      if (authError && authError.name !== "AuthSessionMissingError") {
        console.error("[AUTH GET_USER ERROR]:", {
          name: authError.name,
          status: authError.status,
          message: authError.message,
        });
      }
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, user_id, full_name, email, role, status, created_at")
      .or(`user_id.eq.${user.id},id.eq.${user.id}`)
      .maybeSingle();

    if (profileError) {
      console.error("[AUTH PROFILE QUERY ERROR]:", {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
      });
      return null;
    }

    if (!profile || profile.status === "inactivo") {
      return null;
    }

    const normalizedRole = normalizeRole(profile.role);
    if (!normalizedRole) {
      return null;
    }

    return {
      id: profile.id,
      authUserId: user.id,
      full_name: profile.full_name || user.email?.split("@")[0] || "Usuario",
      email: profile.email || user.email,
      role: normalizedRole,
      roleLabel: getRoleLabel(normalizedRole),
      status: profile.status || "activo",
    };
  } catch (err) {
    if (err?.digest !== "DYNAMIC_SERVER_USAGE") {
      console.error("[AUTH PROFILE EXCEPTION]:", {
        name: err?.name,
        message: err?.message,
        cause: err?.cause,
      });
    }
    return null;
  }
}

/**
 * Garantiza que exista una sesión autenticada en Server Components / Server Actions.
 * Redirige a /login en caso contrario.
 */
export async function requireAuth() {
  const profile = await getAuthenticatedProfile();
  if (!profile) {
    redirect("/login");
  }
  return profile;
}

/**
 * Garantiza sesión autenticada y permiso del rol para una ruta específica.
 * Si el rol no tiene permiso, redirige al dashboard ("/").
 */
export async function requireRouteAccess(pathname) {
  const profile = await requireAuth();
  if (!canAccessRoute(profile.role, pathname)) {
    redirect("/");
  }
  return profile;
}
