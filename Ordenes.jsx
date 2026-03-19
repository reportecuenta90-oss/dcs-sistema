import { ESTADOS, TIPOS } from "./constants.js";
import EstadoBadge from "./EstadoBadge.jsx";
import { useApp } from "./AppContext";
import { useData } from "./DataContext";
import { useMemo } from "react";

export default function Ordenes({ abrirOrden }) {
  const { T, s, isMobile } = useApp();
  const { ordenes, tecnicos, estadoFiltro, setEstado, phFiltro, setPhFiltro, tipoFiltro, setTipo, tecFiltro, setTecFiltro, fechaDesde, setFechaDesde, fechaHasta, setFechaHasta } = useData();

  const hasAdv = tipoFiltro !== "Todos" || tecFiltro !== "Todos" || fechaDesde || fechaHasta;
  const ordenesFiltradas = useMemo(() => ordenes
    .filter(o => estadoFiltro === "Todos" || o.estado === estadoFiltro)
    .filter(o => phFiltro === "Todos" || o.ph === phFiltro)
    .filter(o => tipoFiltro === "Todos" || o.tipo === tipoFiltro)
    .filter(o => tecFiltro === "Todos" || (tecFiltro === "null" ? !o.asignadoA : String(o.asignadoA) === tecFiltro))
    .filter(o => !fechaDesde || o.fecha >= fechaDesde)
    .filter(o => !fechaHasta || o.fecha <= fechaHasta),
  [ordenes, estadoFiltro, phFiltro, tipoFiltro, tecFiltro, fechaDesde, fechaHasta]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {["Todos", ...ESTADOS].map(e => {
          const active = estadoFiltro === e;
          return (<button key={e} onClick={() => setEstado(e)} style={{ padding: "5px 12px", borderRadius: 4, fontSize: 11, fontWeight: 500, border: `1px solid ${active ? T.accentBase : T.borderDefault}`, background: active ? T.accentBase : T.surfacePrimary, color: active ? "#fff" : T.textSecondary, cursor: "pointer", fontFamily: "'IBM Plex Sans',sans-serif", transition: "all .1s" }}>{e}</button>);
        })}
        {phFiltro !== "Todos" && (<span style={{ padding: "5px 12px", borderRadius: 4, fontSize: 11, fontWeight: 500, background: T.accentMuted, color: T.accentText, border: `1px solid ${T.accentBorder}`, display: "flex", alignItems: "center", gap: 6 }}>{phFiltro}<button onClick={() => setPhFiltro("Todos")} style={{ background: "none", border: "none", cursor: "pointer", color: T.accentText, fontSize: 14, lineHeight: 1 }}>×</button></span>)}
      </div>
      <div style={{ ...s.card, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "10px 16px", marginBottom: 12 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.8px", whiteSpace: "nowrap" }}>Filtrar:</span>
        <select value={tipoFiltro} onChange={e => setTipo(e.target.value)} style={{ ...s.select, width: "auto", padding: "5px 9px", fontSize: 11 }}>
          <option value="Todos">Todos los tipos</option>
          {TIPOS.map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={tecFiltro} onChange={e => setTecFiltro(e.target.value)} style={{ ...s.select, width: "auto", padding: "5px 9px", fontSize: 11 }}>
          <option value="Todos">Todos los técnicos</option>
          <option value="null">Sin asignar</option>
          {tecnicos.map(t => <option key={t.id} value={String(t.id)}>{t.nombre}</option>)}
        </select>
        <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} style={{ ...s.input, width: "auto", padding: "5px 9px", fontSize: 11 }} />
        <span style={{ fontSize: 11, color: T.textTertiary }}>—</span>
        <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} style={{ ...s.input, width: "auto", padding: "5px 9px", fontSize: 11 }} />
        {hasAdv && (<button onClick={() => { setTipo("Todos"); setTecFiltro("Todos"); setFechaDesde(""); setFechaHasta(""); }} style={{ fontSize: 11, color: T.textTertiary, background: "none", border: "none", cursor: "pointer" }}>Limpiar</button>)}
        <span style={{ marginLeft: "auto", fontSize: 11, color: T.textTertiary }}>{ordenesFiltradas.length} resultado{ordenesFiltradas.length !== 1 ? "s" : ""}</span>
      </div>
      {isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ordenesFiltradas.length === 0 && (<div style={{ textAlign: "center", padding: 40, color: T.textTertiary, fontSize: 12 }}>No hay órdenes.</div>)}
          {ordenesFiltradas.map(o => {
            const tec = tecnicos.find(t => t.id === o.asignadoA);
            return (
              <div key={o.id} onClick={() => abrirOrden(o)} style={{ background: T.surfacePrimary, borderRadius: 8, padding: "12px 14px", border: `1px solid ${T.borderDefault}`, cursor: "pointer", display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{o.ph}</div>
                  <EstadoBadge estado={o.estado} />
                </div>
                <div style={{ fontSize: 11, color: T.textTertiary }}>{o.ubicacion}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 2 }}>
                  <span style={{ fontSize: 11, color: T.textSecondary, background: T.surfaceSecond, padding: "2px 8px", borderRadius: 4 }}>{o.tipo}</span>
                  <span style={{ fontSize: 11, color: T.textSecondary }}>👷 {tec ? tec.nombre : "Sin asignar"}</span>
                  <span style={{ fontSize: 11, color: T.textTertiary }}>{o.fecha}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={s.cardFlush}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{["PH / Proyecto", "Tipo", "Técnico", "Estado", ""].map((h, i) => <th key={i} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {ordenesFiltradas.length === 0 && (<tr><td colSpan={5} style={{ textAlign: "center", padding: 40, color: T.textTertiary, fontSize: 12 }}>No hay órdenes.</td></tr>)}
              {ordenesFiltradas.map(o => {
                const tec = tecnicos.find(t => t.id === o.asignadoA);
                return (
                  <tr key={o.id} style={{ cursor: "pointer" }} onClick={() => abrirOrden(o)}>
                    <td style={s.td}><div style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary }}>{o.ph}</div><div style={{ fontSize: 11, color: T.textTertiary, marginTop: 2 }}>{o.ubicacion}</div></td>
                    <td style={s.td}><div style={{ fontSize: 12, color: T.textSecondary }}>{o.tipo}</div></td>
                    <td style={s.td}>{tec ? <div style={{ fontSize: 12, color: T.textSecondary }}>{tec.nombre}</div> : <span style={{ fontSize: 11, color: T.textTertiary, fontStyle: "italic" }}>Sin asignar</span>}</td>
                    <td style={s.td}><EstadoBadge estado={o.estado} /></td>
                    <td style={{ ...s.td, fontSize: 14, color: T.textTertiary, textAlign: "right" }}>›</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
