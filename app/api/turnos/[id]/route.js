import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { getAuthenticatedProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ROLES } from "@/lib/permissions";

export const dynamic = "force-dynamic";

function isUuid(value) {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value
    )
  );
}

export async function DELETE(_request, { params }) {
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

    const appointmentId = params?.id;
    if (!appointmentId || !isUuid(appointmentId)) {
      return NextResponse.json(
        { error: "ID de turno inválido." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

    const dbClient =
      supabaseUrl && serviceRoleKey
        ? createSupabaseAdmin(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false },
          })
        : createClient();

    const { data: existing, error: fetchError } = await dbClient
      .from("appointments")
      .select("id, status")
      .eq("id", appointmentId)
      .maybeSingle();

    if (fetchError) {
      console.error("[DELETE TURNO FETCH ERROR]:", fetchError);
      return NextResponse.json(
        { error: "No se pudo verificar el turno en Supabase." },
        { status: 500 }
      );
    }

    if (!existing) {
      return NextResponse.json(
        { error: "El turno no existe o ya fue eliminado." },
        { status: 404 }
      );
    }

    if (existing.status !== "cancelado") {
      return NextResponse.json(
        { error: "Solo se pueden eliminar turnos en estado cancelado." },
        { status: 400 }
      );
    }

    const { error: deleteError } = await dbClient
      .from("appointments")
      .delete()
      .eq("id", appointmentId);

    if (deleteError) {
      console.error("[DELETE TURNO ERROR]:", deleteError);
      return NextResponse.json(
        { error: "No se pudo eliminar el turno de Supabase." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true, id: appointmentId, message: "Turno eliminado correctamente." },
      { status: 200 }
    );
  } catch (err) {
    console.error("[DELETE TURNO EXCEPTION]:", err);
    return NextResponse.json(
      { error: "Error interno del servidor al eliminar el turno." },
      { status: 500 }
    );
  }
}
