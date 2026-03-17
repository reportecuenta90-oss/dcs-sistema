// ─────────────────────────────────────────────────────────────────────────────
// DATOS ESTÁTICOS — PHs, tipos, estados, menús, calles, etc.
// ─────────────────────────────────────────────────────────────────────────────

export const PHS = [
  "PH Los Portales",
  "PH Bristol Villas Buenaventura",
  "PH Buenaventura No.1",
  "Cuotas Lotes Unifamiliares",
  "Lotes frente al mar calle 4ta",
  "Lotes frente al mar calle 1ra",
  "The Bristol Residences",
  "Haciendas del Lago",
  "Del Mar Riviera del Mar",
  "Lote Luz Blanca",
  "PH Club Estates",
  "PH Fairways",
  "PH Hoyo 14",
  "PH Laguna",
  "PH Loft - Locales Comerciales",
  "PH Marina Village",
  "PH Ocean Lake Villas",
  "PH Paseo de Las Casas",
  "PH Paseo del Mar",
  "PH Península",
  "PH Peninsula Sur",
  "PH Puntarena",
  "PH Riverside",
  "PH Sur De Los Portales",
  "PH Velamar",
  "PH Velamar Village",
  "PH Lakeshore",
];

export const TIPOS = [
  "Prueba de Pararrayos",
  "Inspección Eléctrica",
  "Plomería",
  "Termografía",
  "Aire Acondicionado",
  "Mantenimiento General",
  "Seguridad",
  "Piscinas",
  "Ascensores",
  "Otro",
];

export const TIPOS_REP_ING = [
  "Inspección General",
  "Reporte Técnico",
  "Reporte de Aprobación",
  "Reporte de Rechazo",
  "Reporte de Mantenimiento",
  "Reporte de Seguridad",
];

export const ESTADOS = ["Pendiente", "En proceso", "En revisión", "Resuelto", "Cerrado"];

export const ESTADOS_REP = ["Pendiente", "En revisión", "Aprobado", "Rechazado"];

export const AREAS_EDIFICIO = [
  "Lobby / Recepción",
  "Parqueo",
  "Piscina / Área recreativa",
  "Gimnasio",
  "Salón comunal",
  "Cuarto de máquinas",
  "Azotea / Techo",
  "Jardines",
  "Pasillos / Escaleras",
  "Ascensor",
  "Área de basura",
  "Generador",
  "Otro",
];

export const URGENCIAS = ["Normal", "Urgente", "Emergencia"];

export const CALLES = [
  "Calle 1ra (frente al mar)",
  "Calle 2da",
  "Calle 3ra",
  "Calle 4ta (frente al mar)",
  "Calle 5ta",
  "Avenida Principal Buenaventura",
  "Acceso Haciendas del Lago",
  "Acceso Marina Village",
  "Acceso Bristol Residences",
  "Paseo del Mar",
  "Paseo de Las Casas",
  "Área del Club / Fairways",
  "Zona de lotes",
  "Entrada principal",
  "Otra ubicación",
];

export const TIPOS_INCIDENCIA = [
  "Daño en calzada / bache",
  "Iluminación deficiente o dañada",
  "Acumulación de basura",
  "Árbol caído / ramas peligrosas",
  "Inundación / charco",
  "Vandalismo",
  "Vehículo abandonado",
  "Animal suelto",
  "Accidente de tránsito",
  "Persona sospechosa",
  "Fuga de agua",
  "Cable eléctrico suelto",
  "Obra sin señalización",
  "Otro",
];

export const MENU = {
  admin: [
    { id: "dashboard",        icon: "▦",  label: "Dashboard" },
    { id: "calendario",       icon: "📅", label: "Calendario" },
    { id: "phs",              icon: "◈",  label: "PHs" },
    { id: "ordenes",          icon: "≡",  label: "Asignaciones" },
    { id: "nueva",            icon: "+",  label: "Nueva Asignación" },
    { id: "conserjes",        icon: "◎",  label: "Conserjes" },
    { id: "reportesConserje", icon: "◉",  label: "Bitácora de los Conserjes" },
    { id: "incidencias",      icon: "⚑",  label: "Incidencias Calle" },
    { id: "reporteCalle",     icon: "🛣",  label: "Reporte de Calle" },
    { id: "diarioCampo",      icon: "📓", label: "Nuevo Diario" },
    { id: "misDiarios",       icon: "📚", label: "Mis Diarios" },
    { id: "reportes",         icon: "📊", label: "Reportes" },
    { id: "seguimiento",      icon: "⚠️", label: "Seguimiento" },
  ],
  tecnico: [
    { id: "misOrdenes",             icon: "≡",  label: "Asignaciones" },
    { id: "asignacionesTerminadas", icon: "✅", label: "Asignaciones Terminadas" },
    { id: "incidencias",            icon: "⚑",  label: "Incidencias Calle" },
  ],
  ingeniera: [
    { id: "dashboard",        icon: "▦",  label: "Dashboard" },
    { id: "calendario",       icon: "📅", label: "Calendario" },
    { id: "phs",              icon: "◈",  label: "PHs" },
    { id: "ordenes",          icon: "≡",  label: "Asignaciones" },
    { id: "nueva",            icon: "+",  label: "Nueva Asignación" },
    { id: "conserjes",        icon: "◎",  label: "Conserjes" },
    { id: "reportesConserje", icon: "◉",  label: "Bitácora de los Conserjes" },
    { id: "incidencias",      icon: "⚑",  label: "Incidencias Calle" },
    { id: "reporteCalle",     icon: "🛣",  label: "Reporte de Calle" },
    { id: "diarioCampo",      icon: "📓", label: "Nuevo Diario" },
    { id: "misDiarios",       icon: "📚", label: "Mis Diarios" },
    { id: "reportes",         icon: "📊", label: "Reportes" },
    { id: "seguimiento",      icon: "⚠️", label: "Seguimiento" },
  ],
  conserje: [
    { id: "nuevoReporte",     icon: "📝", label: "Nueva Entrada" },
    { id: "reportesConserje", icon: "📋", label: "Bitácora" },
    { id: "incidencias",      icon: "⚑",  label: "Incidencias Calle" },
  ],
};

// Paleta semántica de estados — independiente del tema
export const ESTADO_CONFIG = {
  "Pendiente":  { bg: "#FFF7ED", text: "#C2410C", dot: "#F97316", border: "#FED7AA" },
  "En proceso": { bg: "#EFF6FF", text: "#1D4ED8", dot: "#3B82F6", border: "#BFDBFE" },
  "Resuelto":   { bg: "#F0FDF4", text: "#15803D", dot: "#16A34A", border: "#BBF7D0" },
  "En revisión":{ bg: "#FFF7F0", text: "#C2410C", dot: "#F97316", border: "#FED7AA" },
  "Cerrado":    { bg: "#F0FDF4", text: "#15803D", dot: "#22C55E", border: "#BBF7D0" },
};

// Estados iniciales vacíos
export const initOrdenes   = [];
export const initReportes  = [];
export const initRepIng    = [];
export const initIncidencias = [];
