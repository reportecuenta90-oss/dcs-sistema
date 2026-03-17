import { useApp } from "./AppContext";
import { useData } from "./DataContext";

export default function Seguimiento({ actualizarReporte, actualizarOrden, addToast }) {
  const { T, s, usuario } = useApp();
  const { reportes, ordenes } = useData();

  const itemsSeg = [
    ...reportes.filter(r => r.estadoRep === "Requiere seguimiento"),
    ...ordenes.filter(o => o.estadoSeguimiento === "Requiere seguimiento"),
  ];
  const pendientes = itemsSeg.filter(i => !i.atendido);
  const atendidos  = itemsSeg.filter(i => i.atendido);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 680 }}>
      <div style={{ ...s.card, background: `linear-gradient(135deg,${T.warningBase}10,${T.surfacePrimary})`, border: `1px solid ${T.warningBase}44` }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: T.textPrimary, marginBottom: 4 }}>⚠️ Seguimiento</div>
        <div style={{ fontSize: 12, color: T.textTertiary }}>{pendientes.length} pendiente{pendientes.length !== 1 ? "s" : ""} · {atendidos.length} atendido{atendidos.length !== 1 ? "s" : ""}</div>
      </div>
      {pendientes.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 0", color: T.textTertiary, fontSize: 13 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>✅</div>
          Sin pendientes de seguimiento
        </div>
      )}
      {pendientes.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.warningText, textTransform: "uppercase", letterSpacing: ".7px", padding: "0 4px" }}>PENDIENTES ({pendientes.length})</div>
          {pendientes.map((item, idx) => {
            const esReporte = !!item.conserje;
            return (
              <div key={item.id || idx} style={{ ...s.card, border: `1px solid ${T.warningBase}44`, borderLeft: `4px solid ${T.warningBase}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 700, background: T.warningMuted, color: T.warningText, padding: "2px 7px", borderRadius: 4, marginRight: 6 }}>{esReporte ? "📋 Bitácora Conserje" : "🔧 Orden"}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{esReporte ? item.conserje : item.tipo}</span>
                  </div>
                  <span style={{ fontSize: 11, color: T.textTertiary, fontFamily: "'IBM Plex Mono',monospace" }}>{item.fecha}</span>
                </div>
                <div style={{ fontSize: 12, color: T.textSecondary, marginBottom: 6 }}>📍 {item.ph}</div>
                {esReporte && item.observacion && (<div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.5, marginBottom: 8, background: T.surfaceSecond, padding: "6px 10px", borderRadius: 4 }}>{item.observacion.slice(0, 150)}{item.observacion.length > 150 ? "…" : ""}</div>)}
                {!esReporte && item.notas && (<div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.5, marginBottom: 8, background: T.surfaceSecond, padding: "6px 10px", borderRadius: 4 }}>{item.notas.slice(0, 150)}{item.notas.length > 150 ? "…" : ""}</div>)}
                {esReporte && item.foto && (<img src={item.foto} alt="" style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 6, border: `1px solid ${T.borderDefault}`, marginBottom: 8 }} />)}
                {item.comentarioIng && (<div style={{ fontSize: 11, color: T.accentText, background: T.accentMuted, border: `1px solid ${T.accentBorder}`, borderRadius: 4, padding: "5px 8px", marginBottom: 8 }}>💬 {item.comentarioIng}</div>)}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    const fechaAtendido = new Date().toLocaleString("es", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
                    if (esReporte) { actualizarReporte(item.id, { atendido: true, estadoRep: "Atendido", fechaAtendido }); }
                    else { actualizarOrden(item.id, { atendido: true, estadoSeguimiento: "Atendido" }, `Seguimiento atendido por ${usuario.nombre}`); }
                    addToast("Marcado como Atendido ✅", "success");
                  }}
                  style={{ width: "100%", padding: "10px 0", borderRadius: 6, fontSize: 12, fontWeight: 700, fontFamily: "'IBM Plex Sans',sans-serif", border: "none", cursor: "pointer", background: `linear-gradient(135deg,${T.successBase},#15803d)`, color: "#fff", boxShadow: `0 2px 8px ${T.successBase}44` }}
                >✅ Marcar como Atendido</button>
              </div>
            );
          })}
        </div>
      )}
      {atendidos.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.successText, textTransform: "uppercase", letterSpacing: ".7px", padding: "0 4px", marginTop: 8 }}>ATENDIDOS ({atendidos.length})</div>
          {atendidos.map((item, idx) => {
            const esReporte = !!item.conserje;
            return (
              <div key={item.id || idx} style={{ ...s.card, border: `1px solid ${T.successBase}33`, borderLeft: `4px solid ${T.successBase}`, opacity: 0.85 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 700, background: T.successMuted, color: T.successText, padding: "2px 7px", borderRadius: 4, marginRight: 6 }}>✅ Atendido</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{esReporte ? item.conserje : item.tipo}</span>
                  </div>
                  <span style={{ fontSize: 11, color: T.textTertiary }}>{item.ph}</span>
                </div>
                {item.fechaAtendido && <div style={{ fontSize: 10, color: T.textTertiary, marginTop: 4 }}>{item.fechaAtendido}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
