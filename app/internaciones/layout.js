import { requireRouteAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function InternacionesLayout({ children }) {
  await requireRouteAccess("/internaciones");
  return children;
}
