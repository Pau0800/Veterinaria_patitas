import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ROLES } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const reassignSchema = z.object({
  newVeterinarianId: z.string().uuid("ID de veterinario destino inválido."),
});

function isUuid(value) {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value
    )
  );
}

export async function PATCH(request, { params }) {
  try {
    const profile = await getAuthenticatedProfile();
    if (!profile) {
      return NextResponse.json(
        { error: "No autorizado. Debes iniciar sesión." },
        { status: 401 }
      );
    }

    if (profile.role !== ROLES.VET && profile.role !== ROLES.ADMIN) {
      return NextResponse.json(
        {
          error:
            "Prohibido. Solo veterinarios asignados o administradores pueden derivar turnos.",
        },
        { status: 403 }
      );
    }

    const appointmentId = params?.id;
    if (!appointmentId || !isUuid(appointmentId)) {
      return NextResponse.json(
        { error: "El turno indicado no tiene un ID válido de base de datos." },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = reassignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            "Datos inválidos para reasignar el turno.",
        },
        { status: 400 }
      );
    }

    const { newVeterinarianId } = parsed.data;
    const supabase = createClient();

    // 1. Verificar turno actual
    const { data: existingAppt, error: apptFetchError } = await supabase
      .from("appointments")
      .select("id, vet_id, veterinarian_id, status")
      .eq("id", appointmentId)
      .maybeSingle();

    if (apptFetchError) {
      console.error("[REASIGNAR FETCH APPT ERROR]:", apptFetchError);
      return NextResponse.json(
        { error: "No se pudo consultar el turno." },
        { status: 500 }
      );
    }

    if (!existingAppt) {
      return NextResponse.json(
        { error: "Turno no encontrado." },
        { status: 404 }
      );
    }

    const currentAssignedId =
      existingAppt.veterinarian_id || existingAppt.vet_id;

    if (
      profile.role === ROLES.VET &&
      currentAssignedId !== profile.id &&
      currentAssignedId !== profile.authUserId
    ) {
      return NextResponse.json(
        { error: "Solo podés derivar turnos asignados a tu propio registro." },
        { status: 403 }
      );
    }

    if (currentAssignedId === newVeterinarianId) {
      return NextResponse.json(
        { error: "Seleccioná un veterinario distinto al actual." },
        { status: 400 }
      );
    }

    // 2. Verificar que el veterinario destino exista y esté activo
    const { data: targetVet, error: vetError } = await supabase
      .from("profiles")
      .select("id, full_name, role, status")
      .eq("id", newVeterinarianId)
      .eq("role", ROLES.VET)
      .eq("status", "activo")
      .maybeSingle();

    if (vetError || !targetVet) {
      return NextResponse.json(
        { error: "El veterinario seleccionado no existe o está inactivo." },
        { status: 404 }
      );
    }

    // 3. Actualizar asignación en public.appointments
    const { data: updatedAppt, error: updateError } = await supabase
      .from("appointments")
      .update({
        vet_id: targetVet.id,
        veterinarian_id: targetVet.id,
        vet_name: targetVet.full_name,
      })
      .eq("id", appointmentId)
      .select("*")
      .single();

    if (updateError) {
      console.error("[REASIGNAR UPDATE ERROR]:", updateError);
      return NextResponse.json(
        { error: "No se pudo reasignar el turno en Supabase." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        appointment: updatedAppt,
        message: `Turno derivado correctamente a ${targetVet.full_name}.`,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[REASIGNAR EXCEPTION]:", err);
    return NextResponse.json(
      { error: "Error interno del servidor al derivar el turno." },
      { status: 500 }
    );
  }
}
