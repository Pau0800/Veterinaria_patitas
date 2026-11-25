import React from "react";
import { requireRouteAccess } from "@/lib/auth";
import { MiRegistroClient } from "@/components/mi-registro/MiRegistroClient";

export const dynamic = "force-dynamic";

export default async function MiRegistroPage() {
  const currentProfile = await requireRouteAccess("/mi-registro");
  return <MiRegistroClient currentProfile={currentProfile} />;
}
