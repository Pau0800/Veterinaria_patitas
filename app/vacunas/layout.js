import { requireRouteAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function VacunasLayout({ children }) {
  await requireRouteAccess("/vacunas");
  return children;
}
