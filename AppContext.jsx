import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { DARK, LIGHT } from "./theme.js";
import { lsGet, lsSet } from "./storage.js";

// ── Crear contexto ─────────────────────────────────────────────────────────
const AppContext = createContext(null);

// ── Hook para usarlo en cualquier componente ───────────────────────────────
export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp debe usarse dentro de <AppProvider>");
  return ctx;
};

// ── Provider ───────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [dark, setDark] = useState(() => lsGet("dcs_dark", true));
  const T = dark ? DARK : LIGHT;

  const [usuario, setUsuario] = useState(() => lsGet("dcs_session", null));
  const [vista, setVista] = useState(() => {
    const u = lsGet("dcs_session", null);
    if (!u) return "dashboard";

    // Rutas permitidas por rol — evita que localStorage manipulado dé acceso indebido
    const RUTAS_ROL = {
      admin:     ["dashboard","calendario","phs","ordenes","nueva","conserjes","tecnicos","reportesConserje",
                  "incidencias","reporteCalle","diarioCampo","misDiarios","reporteMensual",
                  "seguimiento","detalle","detalleReporte","detalleIncidencia","reportes","reporteSemanal","reporteJunta"],
      ingeniera: ["dashboard","calendario","phs","ordenes","nueva","conserjes","tecnicos","reportesConserje",
                  "incidencias","reporteCalle","diarioCampo","misDiarios","reporteMensual",
                  "seguimiento","detalle","detalleReporte","detalleIncidencia","reportes","reporteSemanal","reporteJunta"],
      tecnico:   ["misOrdenes","asignacionesTerminadas","incidencias","detalle","detalleIncidencia"],
      conserje:  ["nuevoReporte","reportesConserje","incidencias","misNotificaciones",
                  "detalleReporte","detalleIncidencia"],
    };
    const VISTA_INICIO = {
      admin: "dashboard", ingeniera: "dashboard",
      tecnico: "misOrdenes", conserje: "nuevoReporte",
    };

    const sv = lsGet("dcs_vista", "");
    const permitidas = RUTAS_ROL[u.rol] || [];

    // Si la vista guardada es válida para este rol, usarla
    if (sv && permitidas.includes(sv)) return sv;

    // Si no, arrancar en la vista de inicio del rol
    return VISTA_INICIO[u.rol] || "dashboard";
  });

  const [sidebarOpen, setSidebar]   = useState(true);
  const [isMobile, setIsMobile]     = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchQ, setSearchQ]       = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [toasts, setToasts]         = useState([]);
  const [showIdleWarning, setShowIdleWarning] = useState(false);
  const [dbOnline, setDbOnline]     = useState(false);
  const [dbLoading, setDbLoading]   = useState(false);
  const [fotoModal, setFotoModal]   = useState(null);

  // Detectar cambio de tamaño
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", check);
    if (window.innerWidth < 768) setSidebar(false);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Persistir dark mode
  useEffect(() => { lsSet("dcs_dark", dark); }, [dark]);

  // Persistir vista activa
  useEffect(() => { if (vista) lsSet("dcs_vista", vista); }, [vista]);

  // ── Estilos globales (dependen de T) ──────────────────────────────────────
  const s = useMemo(() => ({
    card: {
      background: T.surfacePrimary,
      borderRadius: 8,
      border: `1px solid ${T.borderDefault}`,
      padding: 24,
    },
    cardFlush: {
      background: T.surfacePrimary,
      borderRadius: 8,
      border: `1px solid ${T.borderDefault}`,
      overflow: "hidden",
    },
    input: {
      width:"100%",
      border:`1px solid ${T.borderDefault}`,
      borderRadius:6, padding:"9px 12px",
      fontSize:13, fontFamily:"'IBM Plex Sans', sans-serif",
      color:T.textPrimary, outline:"none",
      background:T.surfaceSecond,
      transition:"border-color .15s",
    },
    select: {
      width:"100%",
      border:`1px solid ${T.borderDefault}`,
      borderRadius:6, padding:"9px 12px",
      fontSize:13, fontFamily:"'IBM Plex Sans', sans-serif",
      color:T.textPrimary, outline:"none",
      background:T.surfaceSecond,
      appearance:"none", cursor:"pointer",
    },
    textarea: {
      width:"100%",
      border:`1px solid ${T.borderDefault}`,
      borderRadius:6, padding:"9px 12px",
      fontSize:13, fontFamily:"'IBM Plex Sans', sans-serif",
      color:T.textPrimary, outline:"none",
      background:T.surfaceSecond,
      resize:"none", lineHeight:1.6,
    },
    label: {
      fontSize:11, fontWeight:600,
      color:T.textTertiary,
      textTransform:"uppercase", letterSpacing:"0.8px",
      display:"block", marginBottom:6,
    },
    secTitle: {
      fontSize:11, fontWeight:700,
      color:T.textSecondary,
      textTransform:"uppercase", letterSpacing:"0.7px",
      marginBottom:16,
    },
    btnPrimary: {
      background:T.accentBase,
      color:"#FFFFFF",
      border:"none", borderRadius:6,
      padding:"10px 18px", fontSize:13,
      fontWeight:600, fontFamily:"'IBM Plex Sans', sans-serif",
      cursor:"pointer", letterSpacing:"0.3px",
    },
    btnSecondary: {
      background:"transparent",
      color:T.textSecondary,
      border:`1px solid ${T.borderDefault}`,
      borderRadius:6, padding:"9px 16px",
      fontSize:13, fontWeight:500,
      fontFamily:"'IBM Plex Sans', sans-serif",
      cursor:"pointer",
    },
    th: {
      padding:"9px 16px", textAlign:"left",
      fontSize:10, fontWeight:700,
      color:T.textTertiary,
      textTransform:"uppercase", letterSpacing:"0.8px",
      background:T.surfaceSecond,
      borderBottom:`1px solid ${T.borderDefault}`,
    },
    td: {
      padding:"12px 16px",
      borderBottom:`1px solid ${T.borderSubtle}`,
      verticalAlign:"middle",
    },
  }), [T]);

  return (
    <AppContext.Provider value={{
      // Tema
      dark, setDark, T, s,
      // Usuario y navegación
      usuario, setUsuario,
      vista, setVista,
      // Layout
      sidebarOpen, setSidebar,
      isMobile,
      // UI global
      showNotifs, setShowNotifs,
      searchQ, setSearchQ,
      showSearch, setShowSearch,
      toasts, setToasts,
      showIdleWarning, setShowIdleWarning,
      fotoModal, setFotoModal,
      // Conexión DB
      dbOnline, setDbOnline,
      dbLoading, setDbLoading,
    }}>
      {children}
    </AppContext.Provider>
  );
}
