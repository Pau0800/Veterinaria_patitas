import { requireRouteAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function FarmaciaLayout({ children }) {
  await requireRouteAccess("/farmacia");
  return children;
}
