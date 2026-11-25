import { requireRouteAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HistoriasLayout({ children }) {
  await requireRouteAccess("/historias-clinicas");
  return children;
}
