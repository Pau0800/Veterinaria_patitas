import { NextResponse } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";
import { canAccessRoute, normalizeRole } from "@/lib/permissions";

const PUBLIC_PATHS = ["/login"];

function isPublicPath(pathname) {
  return PUBLIC_PATHS.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function copyCookies(sourceResponse, targetResponse) {
  sourceResponse.cookies.getAll().forEach((cookie) => {
    targetResponse.cookies.set(cookie);
  });
}

function applyNoCacheHeaders(res) {
  res.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  return res;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Las API routes validan autenticación en su propio Route Handler (retornando 401 JSON),
  // pero igual refrescamos las cookies de sesión si hay cliente configurado.
  const isApiRoute = pathname.startsWith("/api/");

  const { supabase, getResponse } = createMiddlewareClient(request);

  if (!supabase) {
    if (!isPublicPath(pathname) && !isApiRoute) {
      const loginUrl = new URL("/login", request.url);
      return applyNoCacheHeaders(NextResponse.redirect(loginUrl));
    }
    return getResponse();
  }

  // Refrescar sesión en cada request usando getUser() (validado contra Auth server)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const baseResponse = getResponse();

  if (isApiRoute) {
    return baseResponse;
  }

  let userRole = null;
  let isActiveProfile = false;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, status")
      .or(`user_id.eq.${user.id},id.eq.${user.id}`)
      .maybeSingle();

    if (profile && profile.status !== "inactivo") {
      userRole = normalizeRole(profile.role);
      isActiveProfile = Boolean(userRole);
    }
  }

  const isAuthenticated = Boolean(user && isActiveProfile);

  // Si ya hay sesión válida y entra a /login, redirigir al dashboard ("/")
  if (isPublicPath(pathname)) {
    if (isAuthenticated) {
      const homeUrl = new URL("/", request.url);
      const redirectResponse = NextResponse.redirect(homeUrl);
      copyCookies(baseResponse, redirectResponse);
      return applyNoCacheHeaders(redirectResponse);
    }
    return applyNoCacheHeaders(baseResponse);
  }

  // Cualquier ruta protegida sin sesión válida -> /login
  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    const redirectResponse = NextResponse.redirect(loginUrl);
    copyCookies(baseResponse, redirectResponse);
    return applyNoCacheHeaders(redirectResponse);
  }

  // Validar permisos según mapa rol -> rutas en lib/permissions.js
  if (!canAccessRoute(userRole, pathname)) {
    const homeUrl = new URL("/", request.url);
    const redirectResponse = NextResponse.redirect(homeUrl);
    copyCookies(baseResponse, redirectResponse);
    return applyNoCacheHeaders(redirectResponse);
  }

  return applyNoCacheHeaders(baseResponse);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
