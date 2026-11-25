import { requireRouteAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TurnosLayout({ children }) {
  await requireRouteAccess("/turnos");
  return children;
}
