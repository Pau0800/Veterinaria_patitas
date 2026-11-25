/**
 * Mapa centralizado de roles, rutas permitidas y helpers de autorización.
 * Fuente única de verdad para Middleware, Server Components y Sidebar.
 */

export const ROLES = {
  ADMIN: "administrador",
  VET: "veterinario",
  RECEPTIONIST: "recepcionista",
  CLIENT: "cliente", // Reservado para futura habilitación sin migraciones destructivas
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: "Administrador",
  [ROLES.VET]: "Veterinario",
  [ROLES.RECEPTIONIST]: "Recepcionista",
  [ROLES.CLIENT]: "Cliente",
};

/**
 * Normaliza un rol proveniente de la base de datos o metadatos a su clave canónica.
 */
export function normalizeRole(role) {
  if (!role || typeof role !== "string") return null;
  const normalized = role.trim().toLowerCase();
  if (Object.values(ROLES).includes(normalized)) {
    return normalized;
  }
  return null;
}

/**
 * Retorna la etiqueta legible (capitalizada) para UI y compatibilidad con vistas existentes.
 */
export function getRoleLabel(role) {
  const normalized = normalizeRole(role);
  return normalized ? ROLE_LABELS[normalized] : "Invitado";
}

/**
 * Mapa rol -> rutas permitidas (rutas reales de app/).
 * El dashboard principal vive en "/".
 */
export const ROLE_ALLOWED_ROUTES = {
  [ROLES.ADMIN]: [
    "/",
    "/clientes",
    "/mascotas",
    "/turnos",
    "/historias-clinicas",
    "/vacunas",
    "/internaciones",
    "/farmacia",
    "/mi-registro",
    "/usuarios",
  ],
  [ROLES.VET]: [
    "/",
    "/mascotas",
    "/turnos",
    "/historias-clinicas",
    "/vacunas",
    "/internaciones",
    "/farmacia",
    "/mi-registro",
  ],
  [ROLES.RECEPTIONIST]: [
    "/",
    "/clientes",
    "/mascotas",
    "/turnos",
    "/historias-clinicas",
    "/vacunas",
  ],
  // Preparado para futura incorporación del rol cliente:
  [ROLES.CLIENT]: [
    "/",
    "/mascotas",
    "/turnos",
    "/historias-clinicas",
    "/vacunas",
  ],
};

/**
 * Verifica si un rol tiene permiso para acceder a una ruta dada.
 */
export function canAccessRoute(role, pathname) {
  const normalizedRole = normalizeRole(role);
  if (!normalizedRole) return false;

  const allowedRoutes = ROLE_ALLOWED_ROUTES[normalizedRole] || [];
  const cleanPath = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");

  return allowedRoutes.some((route) => {
    if (route === "/") return cleanPath === "/";
    return cleanPath === route || cleanPath.startsWith(`${route}/`);
  });
}

/**
 * Definición declarativa de los ítems del menú lateral.
 */
export const SIDEBAR_ITEMS = [
  { name: "Dashboard", href: "/", iconKey: "LayoutDashboard" },
  { name: "Clientes", href: "/clientes", iconKey: "Users" },
  { name: "Mascotas", href: "/mascotas", iconKey: "Dog" },
  { name: "Turnos", href: "/turnos", iconKey: "CalendarCheck" },
  { name: "Historias Clínicas", href: "/historias-clinicas", iconKey: "FileSpreadsheet" },
  { name: "Vacunas", href: "/vacunas", iconKey: "Syringe" },
  { name: "Internaciones", href: "/internaciones", iconKey: "BedDouble" },
  { name: "Farmacia & Stock", href: "/farmacia", iconKey: "Pill" },
  { name: "Mi Registro", href: "/mi-registro", iconKey: "ClipboardList" },
  { name: "Usuarios", href: "/usuarios", iconKey: "UserCog" },
];

export function getAllowedSidebarItems(role) {
  return SIDEBAR_ITEMS.filter((item) => canAccessRoute(role, item.href));
}
