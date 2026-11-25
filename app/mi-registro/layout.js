import { requireRouteAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function MiRegistroLayout({ children }) {
  await requireRouteAccess("/mi-registro");
  return children;
}
