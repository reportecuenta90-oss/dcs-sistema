import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { PHS, ESTADOS, ESTADO_CONFIG } from "./constants.js";
import EstadoBadge from "./EstadoBadge.jsx";

export default function Dashboard({
  ordenes, reportes, diarios, usuario,
  grafData, isMobile, abrirOrden, generarPDF,
  generarReporteGeneral, exportarExcelOrdenes,
  rGenPH, setRGenPH, rGenFD, setRGenFD, rGenFH, setRGenFH,
  setVista, T, s,
}) {
  const emergencias = reportes.filter(r => r.urgencia === "Emergencia" && !r.aprobadoPorIng);
  const pendsDiario = diarios.filter(d => d.pendientes && d.autor === usuario?.nombre);
  const ordenesUrg  = ordenes.filter(o => o.estado === "Pendiente");

  return (
    <div>
      {/* Alert banners */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: emergencias.length || pendsDiario.length || ordenesUrg.length ? 16 : 0 }}>
        {emergencias.length > 0 && (
          <div onClick={() => setVista("reportesConserje")} style={{ background: "#FEE2E2", borderLeft: "4px solid #DC2626", borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", border: "1px solid #FECACA" }}>
            <span style={{ fontSize: 22 }}>🚨</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#991B1B" }}>{emergencias.length} Emergencia{emergencias.length > 1 ? "s" : ""} activa{emergencias.length > 1 ? "s" : ""}</div>
              <div style={{ fontSize: 11, color: "#B91C1C", marginTop: 2 }}>{emergencias[0].ph} · {emergencias[0].conserje}</div>
            </div>
            <span style={{ background: "#DC2626", color: "#fff", borderRadius: 6, padding: "5px 12px", fontSize: 11, fontWeight: 700 }}>Ver →</span>
          </div>
        )}
        {ordenesUrg.length > 0 && (
          <div onClick={() => setVista("ordenes")} style={{ background: "#FEF3C7", borderLeft: "4px solid #D97706", borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", border: "1px solid #FDE68A" }}>
            <span style={{ fontSize: 22 }}>⏳</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#92400E" }}>{ordenesUrg.length} Orden{ordenesUrg.length > 1 ? "es" : ""} pendiente{ordenesUrg.length > 1 ? "s" : ""}</div>
              <div style={{ fontSize: 11, color: "#B45309", marginTop: 2 }}>Sin atender · requieren asignación</div>
            </div>
            <span style={{ background: "#D97706", color: "#fff", borderRadius: 6, padding: "5px 12px", fontSize: 11, fontWeight: 700 }}>Ver →</span>
          </div>
        )}
        {pendsDiario.length > 0 && (
          <div onClick={() => setVista("misDiarios")} style={{ background: "#EFF6FF", borderLeft: "4px solid #2563EB", borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", border: "1px solid #BFDBFE" }}>
            <span style={{ fontSize: 22 }}>📌</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1E40AF" }}>{pendsDiario.length} Pendiente{pendsDiario.length > 1 ? "s" : ""} del diario</div>
              <div style={{ fontSize: 11, color: "#1D4ED8", marginTop: 2 }}>Tareas anotadas por revisar</div>
            </div>
            <span style={{ background: "#2563EB", color: "#fff", borderRadius: 6, padding: "5px 12px", fontSize: 11, fontWeight: 700 }}>Ver →</span>
          </div>
        )}
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: isMobile ? 8 : 14, marginBottom: 20 }}>
        {[
          { label: "Proyectos PH",      val: PHS.length,                                                            sub: "registrados",      color: T.accentBase,  bg: T.accentMuted,  border: T.accentBorder },
          { label: "Órdenes Activas",   val: ordenes.filter(o => o.estado !== "Cerrado").length,                    sub: "en seguimiento",   color: T.accentBase,  bg: T.accentMuted,  border: T.accentBorder },
          { label: "Pend. Aprobación",  val: ordenes.filter(o => o.estado === "Resuelto" && !o.aprobado).length,    sub: "por Ing. Mitche",  color: T.warningBase, bg: T.warningMuted, border: `${T.warningBase}33` },
          { label: "Novedades",         val: reportes.filter(r => r.novedad).length,                                sub: "de conserjes",     color: T.dangerBase,  bg: T.dangerMuted,  border: `${T.dangerBase}33` },
        ].map(c => (
          <div key={c.label} style={{ ...s.card, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: c.color, opacity: 0.6 }} />
            <div style={{ fontSize: 10, fontWeight: 700, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>{c.label}</div>
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-1px", lineHeight: 1, marginBottom: 6, color: T.textPrimary }}>{c.val}</div>
            <div style={{ fontSize: 11, color: T.textTertiary }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Chart + Estado */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: 14, marginBottom: 20 }}>
        <div style={s.card}>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary, marginBottom: 20 }}>Órdenes por mes</div>
          <ResponsiveContainer width="100%" height={isMobile ? 200 : 160}>
            <LineChart data={grafData}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.chartGrid} />
              <XAxis dataKey="mes" tick={{ fontSize: 10, fill: T.textTertiary }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: T.textTertiary }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 6, border: `1px solid ${T.borderDefault}`, fontSize: 11, background: T.surfacePrimary, color: T.textPrimary }} />
              <Line type="monotone" dataKey="ordenes" stroke={T.accentBase} strokeWidth={2} dot={{ r: 3, fill: T.accentBase, strokeWidth: 0 }} name="Creadas" />
              <Line type="monotone" dataKey="cerradas" stroke={T.successBase} strokeWidth={2} dot={{ r: 3, fill: T.successBase, strokeWidth: 0 }} name="Cerradas" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={s.card}>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary, marginBottom: 20 }}>Estado actual</div>
          {ESTADOS.map(e => {
            const cnt = ordenes.filter(o => o.estado === e).length;
            const pct = Math.round((cnt / ordenes.length) * 100) || 0;
            const cfg = ESTADO_CONFIG[e];
            return (
              <div key={e} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: T.textSecondary }}>{e}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: T.textPrimary, fontFamily: "'IBM Plex Mono',monospace" }}>{cnt}</span>
                </div>
                <div style={{ height: 4, background: T.borderSubtle, borderRadius: 2 }}>
                  <div style={{ height: 4, borderRadius: 2, background: cfg.dot, width: `${pct}%`, transition: "width .3s" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pendientes aprobación */}
      {ordenes.filter(o => o.estado === "Resuelto" && !o.aprobado).length > 0 && (
        <div style={{ ...s.card, border: `1px solid ${T.accentBorder}`, marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.accentText, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 14 }}>Pendientes de aprobación</div>
          {ordenes.filter(o => o.estado === "Resuelto" && !o.aprobado).map(o => (
            <div key={o.id} onClick={() => abrirOrden(o)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 12px", background: T.accentMuted, border: `1px solid ${T.accentBorder}`, borderRadius: 6, cursor: "pointer", marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{o.ph}</div>
                <div style={{ fontSize: 11, color: T.textSecondary, marginTop: 2 }}>{o.tipo} · {o.fecha}</div>
              </div>
              <span style={{ color: T.accentText, fontSize: 14 }}>›</span>
            </div>
          ))}
        </div>
      )}

      {/* Tabla reciente */}
      <div style={{ ...s.cardFlush, marginBottom: 20 }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.borderDefault}` }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary }}>Órdenes recientes</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>{["PH", "Tipo", "Fecha", "Estado", ...((usuario.rol === "admin" || usuario.rol === "ingeniera") ? ["PDF"] : [])].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {ordenes.slice(0, 5).map(o => (
              <tr key={o.id} style={{ cursor: "pointer" }} onClick={() => abrirOrden(o)}>
                <td style={s.td}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary }}>{o.ph}</div>
                  <div style={{ fontSize: 11, color: T.textTertiary, marginTop: 2 }}>{o.ubicacion}</div>
                </td>
                <td style={s.td}><div style={{ fontSize: 12, color: T.textSecondary }}>{o.tipo}</div></td>
                <td style={s.td}><div style={{ fontSize: 11, color: T.textTertiary, fontFamily: "'IBM Plex Mono',monospace" }}>{o.fecha}</div></td>
                <td style={s.td}><EstadoBadge estado={o.estado} /></td>
                {(usuario.rol === "admin" || usuario.rol === "ingeniera") && (
                  <td style={{ ...s.td, textAlign: "center" }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => generarPDF(o)} style={{ background: T.accentMuted, border: `1px solid ${T.accentBorder}`, borderRadius: 5, padding: "4px 10px", fontSize: 11, fontWeight: 600, color: T.accentText, cursor: "pointer", fontFamily: "'IBM Plex Sans',sans-serif" }}>📄 PDF</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Últimos reportes conserjes */}
      {(usuario.rol === "admin" || usuario.rol === "ingeniera") && (
        <div style={s.card}>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary, marginBottom: 16 }}>Últimos reportes de conserjes</div>
          {reportes.slice(0, 3).map(r => (
            <div key={r.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 12px", background: r.novedad ? T.dangerMuted : T.surfaceSecond, border: `1px solid ${r.novedad ? `${T.dangerBase}22` : T.borderSubtle}`, borderRadius: 6, marginBottom: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: 6, background: T.surfaceThird, color: T.textSecondary, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{r.conserje[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary }}>{r.ph}</span>
                  {r.novedad && <span style={{ background: T.dangerMuted, color: T.dangerText, border: `1px solid ${T.dangerBase}33`, fontSize: 10, fontWeight: 600, padding: "1px 8px", borderRadius: 4 }}>Novedad</span>}
                </div>
                <div style={{ fontSize: 12, color: T.textSecondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.observacion}</div>
                <div style={{ fontSize: 10, color: T.textTertiary, marginTop: 2 }}>{r.conserje} · {r.fecha}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exportar reporte general */}
      {(usuario.rol === "admin" || usuario.rol === "ingeniera") && (
        <div style={{ ...s.card, marginTop: 20, border: `1px solid ${T.accentBorder}`, background: `linear-gradient(135deg,${T.accentBase}0a,${T.surfacePrimary})` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 20 }}>📄</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>Exportar Reporte General</div>
              <div style={{ fontSize: 11, color: T.textTertiary, marginTop: 1 }}>PDF con órdenes, reportes e incidencias del período seleccionado</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10, marginBottom: 14 }}>
            <div>
              <label style={s.label}>PH</label>
              <select value={rGenPH} onChange={e => setRGenPH(e.target.value)} style={s.select}>
                <option value="Todos">Todos los PH</option>
                {PHS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>Desde</label>
              <input type="date" value={rGenFD} onChange={e => setRGenFD(e.target.value)} style={s.input} />
            </div>
            <div>
              <label style={s.label}>Hasta</label>
              <input type="date" value={rGenFH} onChange={e => setRGenFH(e.target.value)} style={s.input} />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button onClick={() => { setRGenPH("Todos"); setRGenFD(""); setRGenFH(""); }} style={{ ...s.btnSecondary, width: "100%", padding: "8px 10px", fontSize: 11 }}>✕ Limpiar</button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => generarReporteGeneral({ phFiltro: rGenPH, fechaDesde: rGenFD, fechaHasta: rGenFH })} style={{ ...s.btnPrimary, padding: "11px 20px", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
              📄 Generar PDF — {rGenPH === "Todos" ? "Todos los PH" : rGenPH}{rGenFD || rGenFH ? ` · ${rGenFD || "inicio"} a ${rGenFH || "hoy"}` : " · Todo el período"}
            </button>
            <button onClick={() => exportarExcelOrdenes(ordenes.filter(o => {
              if (rGenPH !== "Todos" && o.ph !== rGenPH) return false;
              if (rGenFD && o.fecha < rGenFD) return false;
              if (rGenFH && o.fecha > rGenFH) return false;
              return true;
            }))} style={{ ...s.btnSecondary, padding: "11px 20px", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
              📊 Exportar Excel (CSV)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
