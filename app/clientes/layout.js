import { requireRouteAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ClientesLayout({ children }) {
  await requireRouteAccess("/clientes");
  return children;
}
