export default function ReportesConserje({
  misReportes, filtrosRep, setFiltrosRep,
  usuario, fmtHora, setSelReporte, navTo,
  T, s,
}) {
  const filtros = filtrosRep;
  const reportesFiltrados = misReportes.filter(r => {
    if (filtros.urgencia !== "Todos" && r.urgencia !== filtros.urgencia) return false;
    if (filtros.fecha && r.fecha !== filtros.fecha) return false;
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 680 }}>

      {/* Header con stats */}
      <div style={{ ...s.card, background: `linear-gradient(135deg,${T.accentBase}10,${T.surfacePrimary})`, border: `1px solid ${T.accentBorder}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>
              {usuario.rol === "conserje" ? `Bitácora — ${usuario.ph}` : "Bitácora del Conserje"}
            </div>
            <div style={{ fontSize: 11, color: T.textTertiary, marginTop: 2 }}>
              {misReportes.length} reporte{misReportes.length !== 1 ? "s" : ""} en total
              {misReportes.filter(r => r.urgencia === "Emergencia").length > 0 &&
                <span style={{ color: T.dangerText, fontWeight: 700 }}> · 🔴 {misReportes.filter(r => r.urgencia === "Emergencia").length} emergencia{misReportes.filter(r => r.urgencia === "Emergencia").length !== 1 ? "s" : ""}</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { label: "Normal",     val: misReportes.filter(r => (r.urgencia || "Normal") === "Normal").length,   color: T.successText, bg: T.successMuted },
              { label: "Urgente",    val: misReportes.filter(r => r.urgencia === "Urgente").length,                color: T.warningText, bg: T.warningMuted },
              { label: "Emergencia", val: misReportes.filter(r => r.urgencia === "Emergencia").length,             color: T.dangerText,  bg: T.dangerMuted },
            ].map(k => (
              <div key={k.label}
                style={{ textAlign: "center", background: k.bg, border: `1px solid ${k.color}33`, borderRadius: 6, padding: "6px 10px", minWidth: 54, cursor: "pointer" }}
                onClick={() => setFiltrosRep(p => ({ ...p, urgencia: p.urgencia === k.label ? "Todos" : k.label }))}>
                <div style={{ fontSize: 16, fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.val}</div>
                <div style={{ fontSize: 9, color: k.color, fontWeight: 600, marginTop: 2 }}>{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <select value={filtros.urgencia} onChange={e => setFiltrosRep(p => ({ ...p, urgencia: e.target.value }))} style={{ ...s.select, flex: 1, minWidth: 120, fontSize: 12 }}>
          <option value="Todos">Todas las urgencias</option>
          <option>Normal</option><option>Urgente</option><option>Emergencia</option>
        </select>
        <input type="date" value={filtros.fecha} onChange={e => setFiltrosRep(p => ({ ...p, fecha: e.target.value }))} style={{ ...s.input, flex: 1, minWidth: 140, fontSize: 12 }} />
        {(filtros.urgencia !== "Todos" || filtros.fecha) &&
          <button onClick={() => setFiltrosRep({ urgencia: "Todos", fecha: "" })} style={{ ...s.btnSecondary, padding: "7px 12px", fontSize: 11 }}>✕ Limpiar</button>}
      </div>

      {/* Lista vacía */}
      {reportesFiltrados.length === 0 && (
        <div style={{ textAlign: "center", color: T.textTertiary, padding: "40px 0", fontSize: 12 }}>
          {misReportes.length === 0
            ? usuario.rol === "conserje" ? "Aún no has enviado reportes. Usa '+ Nuevo Reporte'." : "No hay reportes aún."
            : "No hay reportes con estos filtros."}
        </div>
      )}

      {/* Tarjetas */}
      {reportesFiltrados.map(r => {
        const urgCfg = {
          Normal:     { bg: T.successMuted, border: T.successBase, text: T.successText, icon: "🟢" },
          Urgente:    { bg: T.warningMuted, border: T.warningBase, text: T.warningText, icon: "🟡" },
          Emergencia: { bg: T.dangerMuted,  border: T.dangerBase,  text: T.dangerText,  icon: "🔴" },
        }[r.urgencia || "Normal"];

        return (
          <div key={r.id}
            onClick={() => { setSelReporte(r); navTo("detalleReporte"); }}
            style={{
              ...s.card, cursor: "pointer",
              borderLeft: `4px solid ${r.urgencia === "Emergencia" ? T.dangerBase : r.urgencia === "Urgente" ? T.warningBase : T.successBase}`,
              border: `1px solid ${r.urgencia === "Emergencia" ? `${T.dangerBase}55` : r.urgencia === "Urgente" ? `${T.warningBase}44` : T.borderDefault}`,
              transition: "box-shadow .15s",
            }}>

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: T.textPrimary, marginBottom: 2 }}>📋 Reporte Conserje</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, fontFamily: "'IBM Plex Mono',monospace" }}>
                  {usuario.rol !== "conserje" && <span style={{ fontWeight: 700, color: T.textPrimary }}>{r.conserje} · </span>}
                  {r.fecha}{r.hora ? ` · ${fmtHora(r.hora)}` : ""}{r.turno ? ` · ${r.turno}` : ""}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                <span style={{ background: urgCfg.bg, color: urgCfg.text, border: `1px solid ${urgCfg.border}55`, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 4 }}>
                  {urgCfg.icon} {r.urgencia || "Normal"}
                </span>
                {r.estadoRep && r.estadoRep !== "Pendiente" && (
                  <span style={{
                    background: r.estadoRep === "Revisado" ? T.successMuted : r.estadoRep === "Requiere seguimiento" ? T.warningMuted : T.surfaceSecond,
                    color: r.estadoRep === "Revisado" ? T.successText : r.estadoRep === "Requiere seguimiento" ? T.warningText : T.textTertiary,
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                  }}>{r.estadoRep === "Revisado" ? "✅ Revisado" : "⚠️ Seguimiento"}</span>
                )}
              </div>
            </div>

            {(r.novedadesHora?.length > 0 || r.observacion) && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.textTertiary, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 4 }}>Novedades del turno</div>
                {r.novedadesHora?.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 4 }}>
                    {r.novedadesHora.slice(0, 3).map((n, i) => (
                      <div key={i} style={{ display: "flex", gap: 6, fontSize: 11 }}>
                        <span style={{ fontWeight: 700, color: T.accentBase, background: T.accentMuted, padding: "1px 5px", borderRadius: 3, flexShrink: 0 }}>{fmtHora(n.hora)}</span>
                        <span style={{ color: T.textSecondary }}>{n.texto?.slice(0, 80)}{n.texto?.length > 80 ? "…" : ""}</span>
                      </div>
                    ))}
                    {r.novedadesHora.length > 3 && <div style={{ fontSize: 10, color: T.textTertiary }}>+{r.novedadesHora.length - 3} más...</div>}
                  </div>
                )}
                {r.observacion && (
                  <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 600, color: T.textTertiary }}>Resumen: </span>
                    {r.observacion.slice(0, 100)}{r.observacion.length > 100 ? "…" : ""}
                  </div>
                )}
              </div>
            )}

            {r.huboIncidente && (
              <div style={{ background: T.dangerMuted, border: `1px solid ${T.dangerBase}33`, borderRadius: 6, padding: "6px 10px", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12 }}>⚠️</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.dangerText }}>Incidente reportado</span>
                {r.area && <span style={{ fontSize: 10, color: T.dangerText, opacity: 0.8 }}>· {r.area}</span>}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              {r.foto ? <img src={r.foto} alt="" style={{ width: 64, height: 48, objectFit: "cover", borderRadius: 4, border: `1px solid ${T.borderDefault}` }} /> : <div />}
              <span style={{ color: T.textTertiary, fontSize: 16 }}>›</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
