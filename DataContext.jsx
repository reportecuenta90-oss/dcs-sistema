import { createContext, useContext, useState } from "react";
import { lsGet } from "./storage.js";
import {
  PHS, TIPOS, TIPOS_REP_ING, AREAS_EDIFICIO,
  CALLES, TIPOS_INCIDENCIA,
  initOrdenes, initReportes, initRepIng, initIncidencias, initRecordatorios
} from "./constants.js";

// ── Crear contexto ─────────────────────────────────────────────────────────
const DataContext = createContext(null);

// ── Hook para usarlo en cualquier componente ───────────────────────────────
export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData debe usarse dentro de <DataProvider>");
  return ctx;
};

// ── Provider ───────────────────────────────────────────────────────────────
export function DataProvider({ children }) {

  // ── Datos principales ───────────────────────────────────────────────────
  const [ordenes, setOrdenes]     = useState(() => lsGet("dcs_ordenes", initOrdenes));
  const [reportes, setReportes]   = useState(() => lsGet("dcs_reportes", initReportes));
  const [repIng, setRepIng]       = useState(() => lsGet("dcs_repIng", initRepIng));
  const [fotos, setFotos]         = useState(() => lsGet("dcs_fotos", {}));
  const [conserjes, setConserjes] = useState(() => lsGet("dcs_conserjes", []));
  const [tecnicos, setTecnicos]   = useState(() => lsGet("dcs_tecnicos", []));
  const [mensajes, setMensajes]   = useState(() => lsGet("dcs_mensajes", []));
  const [incidencias, setIncidencias] = useState(() => lsGet("dcs_incidencias", initIncidencias));
  const [recordatorios, setRecordatorios] = useState(() => lsGet("dcs_recordatorios", initRecordatorios));
  const [diarios, setDiarios]     = useState(() => lsGet("dcs_diarios", []));
  const [notifs, setNotifs]       = useState(() => lsGet("dcs_notifs", [
    { id: 1, msg: "Nueva orden pendiente en PH Vista Verde", time: "hace 5 min", icon: "📋", read: false },
    { id: 2, msg: "Pedro Conserje reportó una novedad urgente", time: "hace 12 min", icon: "⚠️", read: false },
    { id: 3, msg: "Orden #1 lista para aprobación", time: "hace 1 hora", icon: "✓", read: true },
  ]));

  // ── Selecciones activas ─────────────────────────────────────────────────
  const [selOrden, setSelOrden]     = useState(null);
  const [selReporte, setSelReporte] = useState(null);
  const [selInc, setSelInc]         = useState(null);
  const [selCons, setSelCons]       = useState(null);
  const [selChat, setSelChat]       = useState(null);
  const [diarioActivo, setDiarioActivo] = useState(null);
  const [diarioPreview, setDiarioPreview] = useState(null);
  const [showDiarioPreview, setShowDiarioPreview] = useState(false);
  const [diarioEditId, setDiarioEditId] = useState(null);

  // ── Filtros ─────────────────────────────────────────────────────────────
  const [phFiltro, setPhFiltro]       = useState("Todos");
  const [estadoFiltro, setEstado]     = useState("Todos");
  const [tipoFiltro, setTipo]         = useState("Todos");
  const [tecFiltro, setTecFiltro]     = useState("Todos");
  const [fechaDesde, setFechaDesde]   = useState("");
  const [fechaHasta, setFechaHasta]   = useState("");
  const [calleRep, setCalleRep]       = useState("Todas");
  const [urgRep, setUrgRep]           = useState("Todos");
  const [estRep, setEstRep]           = useState("Todos");
  const [fdRep, setFdRep]             = useState("");
  const [fhRep, setFhRep]             = useState("");
  const [rGenPH, setRGenPH]           = useState("Todos");
  const [rGenFD, setRGenFD]           = useState("");
  const [rGenFH, setRGenFH]           = useState("");
  const [filtrosRep, setFiltrosRep]   = useState({ urgencia: "Todos", fecha: "" });
  const [diarFD, setDiarFD]           = useState("");
  const [diarFH, setDiarFH]           = useState("");
  const [diarPHF, setDiarPHF]         = useState("Todos");

  // ── Formularios ─────────────────────────────────────────────────────────
  const [loginForm, setLoginForm]     = useState({ correo: "", pass: "" });
  const [loginError, setLoginError]   = useState("");
  const [formOrden, setFormOrden]     = useState({ tipo: TIPOS[0], ph: PHS[0], ubicacion: "", fecha: "", notas: "", asignadoA: "" });
  const [formRep, setFormRep]         = useState({ observacion: "", novedad: false, foto: null, area: AREAS_EDIFICIO[0], urgencia: "Normal" });
  const [novedadesHora, setNovedadesHora] = useState([]);
  const [nuevaNovedad, setNuevaNovedad]   = useState({ hora: "", texto: "" });
  const [formRepIng, setFormRepIng]   = useState({ tipo: TIPOS_REP_ING[0], ph: PHS[0], descripcion: "", hallazgos: "", recomendaciones: "", accionesTomadas: "", estado: "Pendiente", fotos: [], materiales: [] });
  const [formCons, setFormCons]       = useState({ nombre: "", ph: PHS[0], pass: "", correo: "" });
  const [formTec, setFormTec]         = useState({ nombre: "", correo: "", pass: "", telefono: "", especialidad: "Eléctrico" });
  const [selTec, setSelTec]           = useState(null);
  const [notaCons, setNotaCons]       = useState("");
  const [firmaCanvas, setFirmaCanvas] = useState(null);
  const [firmaDrawing, setFirmaDrawing] = useState(false);
  const [formInc, setFormInc]         = useState({ calle: CALLES[0], tipo: TIPOS_INCIDENCIA[0], descripcion: "", urgencia: "Normal", foto: null });
  const [incCalleOtro, setIncCalleOtro] = useState("");
  const [incTipoOtro, setIncTipoOtro]   = useState("");
  const [ordenTipoOtro, setOrdenTipoOtro] = useState("");
  const [formMsg, setFormMsg]         = useState({ para: "todos", texto: "" });
  const [msgBusq, setMsgBusq]         = useState("");
  const [textoNuevo, setTextoNuevo]   = useState("");
  const [msgBusqCons, setMsgBusqCons] = useState("");
  const [respAbiertas, setRespAbiertas] = useState({});
  const [textosResp, setTextosResp]   = useState({});
  const [matForm, setMatForm]         = useState({ material: "", cantidad: "", unidad: "", area: "", obs: "" });
  const [matFormIng, setMatFormIng]   = useState({ material: "", cantidad: "", unidad: "", area: "", obs: "" });
  const [mesRM, setMesRM]             = useState(() => new Date().getMonth());
  const [anioRM, setAnioRM]           = useState(() => new Date().getFullYear());
  const [notaRM, setNotaRM]           = useState("");
  const [generando, setGenerando]     = useState(false);
  const [formRec, setFormRec]         = useState({ titulo: "", fecha: "", frecuencia: "Única", ph: PHS[0], nota: "" });
  const [showFormRec, setShowFormRec] = useState(false);
  const [formDiario, setFormDiario]   = useState({
    fecha: new Date().toISOString().split("T")[0],
    horaInicio: "", horaFin: "",
    resumen: "", pendientes: "", alertas: "",
    bloques: []
  });
  const [formBloque, setFormBloque]   = useState({ ph: PHS[0], hora: "", ordenes: "", hallazgos: "", accionesTomadas: "", recomendaciones: "", fotos: [] });
  const [calMes, setCalMes]           = useState(() => { const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() }; });
  const [calFiltroTipo, setCalFiltroTipo] = useState("Todos");
  const [calFiltroPH, setCalFiltroPH]   = useState("Todos");
  const [calSelDia, setCalSelDia]       = useState(null);

  return (
    <DataContext.Provider value={{
      ordenes, setOrdenes,
      reportes, setReportes,
      repIng, setRepIng,
      fotos, setFotos,
      conserjes, setConserjes,
      tecnicos, setTecnicos,
      mensajes, setMensajes,
      incidencias, setIncidencias,
      recordatorios, setRecordatorios,
      diarios, setDiarios,
      notifs, setNotifs,
      selOrden, setSelOrden,
      selReporte, setSelReporte,
      selInc, setSelInc,
      selCons, setSelCons,
      selChat, setSelChat,
      diarioActivo, setDiarioActivo,
      diarioPreview, setDiarioPreview,
      showDiarioPreview, setShowDiarioPreview,
      diarioEditId, setDiarioEditId,
      phFiltro, setPhFiltro,
      estadoFiltro, setEstado,
      tipoFiltro, setTipo,
      tecFiltro, setTecFiltro,
      fechaDesde, setFechaDesde,
      fechaHasta, setFechaHasta,
      calleRep, setCalleRep,
      urgRep, setUrgRep,
      estRep, setEstRep,
      fdRep, setFdRep,
      fhRep, setFhRep,
      rGenPH, setRGenPH,
      rGenFD, setRGenFD,
      rGenFH, setRGenFH,
      filtrosRep, setFiltrosRep,
      diarFD, setDiarFD,
      diarFH, setDiarFH,
      diarPHF, setDiarPHF,
      loginForm, setLoginForm,
      loginError, setLoginError,
      formOrden, setFormOrden,
      formRep, setFormRep,
      novedadesHora, setNovedadesHora,
      nuevaNovedad, setNuevaNovedad,
      formRepIng, setFormRepIng,
      formCons, setFormCons,
      formTec, setFormTec,
      selTec, setSelTec,
      notaCons, setNotaCons,
      firmaCanvas, setFirmaCanvas,
      firmaDrawing, setFirmaDrawing,
      formInc, setFormInc,
      incCalleOtro, setIncCalleOtro,
      incTipoOtro, setIncTipoOtro,
      ordenTipoOtro, setOrdenTipoOtro,
      formMsg, setFormMsg,
      msgBusq, setMsgBusq,
      textoNuevo, setTextoNuevo,
      msgBusqCons, setMsgBusqCons,
      respAbiertas, setRespAbiertas,
      textosResp, setTextosResp,
      matForm, setMatForm,
      matFormIng, setMatFormIng,
      mesRM, setMesRM,
      anioRM, setAnioRM,
      notaRM, setNotaRM,
      generando, setGenerando,
      formRec, setFormRec,
      showFormRec, setShowFormRec,
      formDiario, setFormDiario,
      formBloque, setFormBloque,
      calMes, setCalMes,
      calFiltroTipo, setCalFiltroTipo,
      calFiltroPH, setCalFiltroPH,
      calSelDia, setCalSelDia,
    }}>
      {children}
    </DataContext.Provider>
  );
}
