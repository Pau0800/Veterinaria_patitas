import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { z } from "zod";
import { getAuthenticatedProfile } from "@/lib/auth";
import { ROLES } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const createStaffSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Ingresá el nombre completo (mínimo 2 caracteres).")
    .max(150, "El nombre no puede superar los 150 caracteres."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Ingresá un correo electrónico válido.")
    .max(150, "El correo no puede superar los 150 caracteres."),
  password: z
    .string()
    .min(6, "La contraseña inicial debe tener al menos 6 caracteres.")
    .max(128, "La contraseña no puede superar los 128 caracteres."),
  role: z.enum([ROLES.VET, ROLES.RECEPTIONIST], {
    errorMap: () => ({
      message: "El rol permitido debe ser 'veterinario' o 'recepcionista'.",
    }),
  }),
});

export async function POST(request) {
  try {
    // 1. Verificar sesión autenticada y rol administrador exclusivo
    const currentProfile = await getAuthenticatedProfile();
    if (!currentProfile) {
      return NextResponse.json(
        { error: "No autorizado. Debes iniciar sesión." },
        { status: 401 }
      );
    }

    if (currentProfile.role !== ROLES.ADMIN) {
      return NextResponse.json(
        {
          error:
            "Acceso denegado. Solo un administrador puede crear cuentas de personal.",
        },
        { status: 403 }
      );
    }

    // 2. Validar Content-Type y JSON
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type inválido. Se requiere application/json." },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Formato JSON inválido." },
        { status: 400 }
      );
    }

    // 3. Validar payload con Zod (solo veterinario o recepcionista)
    const parsed = createStaffSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        {
          error: firstIssue?.message || "Datos inválidos.",
          issues: parsed.error.issues.map((i) => ({
            field: i.path[0],
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const { full_name, email, password, role } = parsed.data;

    // 4. Crear cliente servidor con SUPABASE_SERVICE_ROLE_KEY (sin afectar cookies de sesión)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

    if (!supabaseUrl || !serviceRoleKey) {
      console.error(
        "[USUARIOS API ERROR] Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY."
      );
      return NextResponse.json(
        {
          error:
            "Falta configurar SUPABASE_SERVICE_ROLE_KEY en el servidor para crear usuarios.",
        },
        { status: 500 }
      );
    }

    const adminClient = createSupabaseAdmin(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 5. Verificar si ya existe un perfil con ese correo
    const { data: existingProfile, error: lookupError } = await adminClient
      .from("profiles")
      .select("id, user_id")
      .eq("email", email)
      .maybeSingle();

    if (lookupError) {
      console.error("[USUARIOS API LOOKUP ERROR]:", lookupError);
      return NextResponse.json(
        { error: "No se pudo verificar si el correo ya existe." },
        { status: 500 }
      );
    }

    if (existingProfile?.user_id) {
      return NextResponse.json(
        { error: "Ya existe un usuario registrado con ese correo electrónico." },
        { status: 409 }
      );
    }

    // 6. Crear cuenta en Supabase Auth con email confirmado
    const { data: createdAuthData, error: createAuthError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name,
          role,
        },
      });

    if (createAuthError || !createdAuthData?.user) {
      const msg = createAuthError?.message || "";
      const isDuplicate =
        msg.toLowerCase().includes("already") ||
        msg.toLowerCase().includes("registered") ||
        createAuthError?.status === 422;

      console.error("[USUARIOS API AUTH CREATE ERROR]:", {
        status: createAuthError?.status,
        message: msg,
      });

      return NextResponse.json(
        {
          error: isDuplicate
            ? "Ya existe una cuenta registrada con ese correo electrónico."
            : "No se pudo crear la cuenta en Supabase Auth.",
        },
        { status: isDuplicate ? 409 : 500 }
      );
    }

    const authUserId = createdAuthData.user.id;

    // 7. Sincronizar perfil en public.profiles (respetando 01_auth_profiles_rls.sql)
    const { data: upsertedProfile, error: upsertError } = await adminClient
      .from("profiles")
      .upsert(
        {
          id: existingProfile?.id || authUserId,
          user_id: authUserId,
          full_name,
          email,
          role,
          status: "activo",
        },
        { onConflict: "email" }
      )
      .select("id, user_id, full_name, email, role, status, created_at")
      .single();

    if (upsertError) {
      console.error("[USUARIOS API PROFILE UPSERT ERROR]:", upsertError);
      // Rollback del usuario Auth recién creado para evitar cuentas huérfanas
      await adminClient.auth.admin.deleteUser(authUserId).catch(() => {});
      return NextResponse.json(
        { error: "No se pudo guardar el perfil del nuevo personal." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        user: upsertedProfile,
        message: "Personal creado correctamente.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[USUARIOS API UNEXPECTED ERROR]:", {
      message: err?.message,
      cause: err?.cause,
    });
    return NextResponse.json(
      { error: "Error interno del servidor al crear el usuario." },
      { status: 500 }
    );
  }
}
