import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { getAuthenticatedProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ROLES } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const profile = await getAuthenticatedProfile();
    if (!profile) {
      return NextResponse.json(
        { error: "No autorizado. Debes iniciar sesión." },
        { status: 401 }
      );
    }

    if (
      ![ROLES.ADMIN, ROLES.VET, ROLES.RECEPTIONIST].includes(profile.role)
    ) {
      return NextResponse.json(
        { error: "Acceso denegado." },
        { status: 403 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

    // Si existe service_role en servidor, lee solo campos públicos seguros de veterinarios activos
    // (evita bloqueos si la migración 03_vet_assignments.sql aún no actualizó profiles_select_policy).
    const client =
      supabaseUrl && serviceRoleKey
        ? createSupabaseAdmin(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false },
          })
        : createClient();

    const { data, error } = await client
      .from("profiles")
      .select("id, user_id, full_name, role, status")
      .eq("role", ROLES.VET)
      .eq("status", "activo")
      .order("full_name", { ascending: true });

    if (error) {
      console.error("[API VETERINARIOS ERROR]:", error);
      return NextResponse.json(
        { error: "No se pudieron obtener los veterinarios activos." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { veterinarians: Array.isArray(data) ? data : [] },
      { status: 200 }
    );
  } catch (err) {
    console.error("[API VETERINARIOS EXCEPTION]:", err);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
