import { requireRouteAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function UsuariosLayout({ children }) {
  await requireRouteAccess("/usuarios");
  return children;
}
