/**
 * Script idempotente de seed de usuarios demo en Supabase Auth + public.profiles.
 * Uso (una sola vez en local): node scripts/seed-users.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIdx = line.indexOf("=");
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    let value = line.slice(eqIdx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.resolve(process.cwd(), ".env.local"));
loadEnvFile(path.resolve(process.cwd(), ".env"));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "[ERROR] Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local / entorno."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * ⚠️ IMPORTANTE: Contraseñas SOLO PARA DEMO.
 * CAMBIAR estas contraseñas desde Supabase Auth o este script antes de usar la app con datos reales.
 */
export const DEMO_USERS = [
  {
    email: "admin@vetotono.com",
    password: "DemoAdmin2026!", // ⚠️ Cambiar antes de usar con datos reales
    full_name: "Carlos Admin",
    role: "administrador",
  },
  {
    email: "vet@vetotono.com",
    password: "DemoVet2026!", // ⚠️ Cambiar antes de usar con datos reales
    full_name: "Dra. Sofía Méndez",
    role: "veterinario",
  },
  {
    email: "recepcion@vetotono.com",
    password: "DemoRecep2026!", // ⚠️ Cambiar antes de usar con datos reales
    full_name: "Laura Gómez",
    role: "recepcionista",
  },
];

async function findUserByEmail(email) {
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) throw error;

    const match = data.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );
    if (match) return match;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

async function upsertDemoUser(demoUser) {
  const existingUser = await findUserByEmail(demoUser.email);
  let authUserId;

  if (existingUser) {
    const { data, error } = await supabase.auth.admin.updateUserById(
      existingUser.id,
      {
        password: demoUser.password,
        email_confirm: true,
        user_metadata: {
          full_name: demoUser.full_name,
          role: demoUser.role,
        },
      }
    );
    if (error) throw error;
    authUserId = data.user.id;
    console.log(`[ACTUALIZADO] Auth user: ${demoUser.email} (${authUserId})`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: demoUser.email,
      password: demoUser.password,
      email_confirm: true,
      user_metadata: {
        full_name: demoUser.full_name,
        role: demoUser.role,
      },
    });
    if (error) throw error;
    authUserId = data.user.id;
    console.log(`[CREADO] Auth user: ${demoUser.email} (${authUserId})`);
  }

  // Sincronizar registro en public.profiles (Opción A: mantiene user_id y id vinculados)
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: authUserId,
      user_id: authUserId,
      full_name: demoUser.full_name,
      email: demoUser.email,
      role: demoUser.role,
      status: "activo",
    },
    { onConflict: "email" }
  );

  if (profileError) throw profileError;
  console.log(
    `[PERFIL OK] ${demoUser.email} -> rol: ${demoUser.role}`
  );
}

async function main() {
  console.log("Iniciando seed de usuarios demo para VetOtoño...");
  for (const user of DEMO_USERS) {
    await upsertDemoUser(user);
  }
  console.log("Seed completado correctamente.");
}

main().catch((err) => {
  console.error("[ERROR EN SEED]:", err);
  process.exit(1);
});
