import { requireRouteAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function MascotasLayout({ children }) {
  await requireRouteAccess("/mascotas");
  return children;
}
