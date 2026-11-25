import React from "react";
import { requireRouteAccess } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { UsuariosClient } from "@/components/usuarios/UsuariosClient";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const currentProfile = await requireRouteAccess("/usuarios");

  const supabase = createClient();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, user_id, full_name, email, role, status, created_at")
    .order("created_at", { ascending: false });

  const usersList = Array.isArray(profiles) ? profiles : [];

  return (
    <UsuariosClient
      initialUsers={usersList}
      fetchError={error?.message || null}
      currentUserRole={currentProfile.role}
    />
  );
}
