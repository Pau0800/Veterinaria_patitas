import React from "react";
import { requireRouteAccess } from "@/lib/auth";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await requireRouteAccess("/");
  return <DashboardClient />;
}
