import { useApp } from "./AppContext";
import { useData } from "./DataContext";

export default function DetalleIncidencia({ actualizarIncidencia, addToast }) {
  const { T, s, usuario } = useApp();
  const { selInc, setSelInc, incidencias } = useData();
  const urgCfg = {
    Normal:     { bg: T.successMuted, text: T.successText, border: `${T.successBase}33`, icon: "🟢" },
    Urgente:    { bg: T.warningMuted, text: T.warningText, border: `${T.warningBase}33`, icon: "🟡" },
    Emergencia: { bg: T.dangerMuted,  text: T.dangerText,  border: `${T.dangerBase}33`,  icon: "🔴" },
  }[selInc.urgencia || "Normal"];

  const inc = incidencias.find(i => i.id === selInc.id) || selInc;

  return (
    <div style={{ maxWidth: 600, display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Header */}
      <div style={s.card}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.8px", background: T.surfaceSecond, border: `1px solid ${T.borderDefault}`, padding: "3px 8px", borderRadius: 4, marginBottom: 10, display: "inline-block" }}>
              ⚑ Incidencia de Calle
            </div>
            <div style={{ fontSize: 17, fontWeight: 600, color: T.textPrimary, marginBottom: 4 }}>📍 {inc.calle}</div>
            <div style={{ fontSize: 11, color: T.textTertiary, fontFamily: "'IBM Plex Mono',monospace" }}>{inc.autor} · {inc.fecha} {inc.hora}</div>
          </div>
          <span style={{ background: urgCfg.bg, color: urgCfg.text, border: `1px solid ${urgCfg.border}`, fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 4, flexShrink: 0 }}>
            {urgCfg.icon} {inc.urgencia}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ background: T.surfaceThird, color: T.textSecondary, border: `1px solid ${T.borderDefault}`, fontSize: 11, padding: "3px 10px", borderRadius: 4 }}>
            {inc.tipo}
          </span>
          {(() => {
            const cfg = {
              "Pendiente":    { bg: T.warningMuted, text: T.warningText, dot: "#F97316" },
              "En revisión":  { bg: T.accentMuted,  text: T.accentText,  dot: T.accentBase },
              "Resuelto":     { bg: T.successMuted, text: T.successText, dot: T.successBase },
              "No procede":   { bg: T.surfaceSecond, text: T.textTertiary, dot: T.borderStrong },
            }[inc.estado] || { bg: T.surfaceSecond, text: T.textTertiary, dot: T.borderStrong };
            return (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.dot}33`, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot }} />{inc.estado}
              </span>
            );
          })()}
        </div>
      </div>

      {/* Descripción */}
      <div style={s.card}>
        <div style={s.secTitle}>📝 Descripción</div>
        <div style={{ fontSize: 13, color: T.textPrimary, lineHeight: 1.8 }}>{inc.descripcion}</div>
      </div>

      {/* Foto */}
      <div style={s.card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: inc.foto ? 12 : 0 }}>
          <div style={s.secTitle}>📷 Foto</div>
          {(usuario.rol === "admin" || usuario.rol === "ingeniera") && (
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, color: T.accentText, cursor: "pointer", padding: "4px 10px", background: T.accentMuted, border: `1px solid ${T.accentBorder}`, borderRadius: 4 }}>
              {inc.foto ? "🔄 Reemplazar" : "📎 Subir foto"}
              <input type="file" accept="image/*" style={{ display: "none" }}
                onChange={e => {
                  const file = e.target.files[0]; if (!file) return;
                  const reader = new FileReader();
                  reader.onload = ev => {
                    actualizarIncidencia(inc.id, { foto: ev.target.result });
                    setSelInc(p => ({ ...p, foto: ev.target.result }));
                    addToast("Foto actualizada");
                  };
                  reader.readAsDataURL(file);
                }} />
            </label>
          )}
        </div>
        {inc.foto ? (
          <div style={{ position: "relative" }}>
            <img src={inc.foto} alt="" style={{ width: "100%", maxHeight: 320, objectFit: "cover", borderRadius: 6, border: `1px solid ${T.borderDefault}` }} />
            {(usuario.rol === "admin" || usuario.rol === "ingeniera") && (
              <button onClick={() => { actualizarIncidencia(inc.id, { foto: null }); setSelInc(p => ({ ...p, foto: null })); }}
                style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            )}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "24px 0", color: T.textTertiary, fontSize: 12, border: `1px dashed ${T.borderDefault}`, borderRadius: 6, background: T.surfaceSecond }}>
            {usuario.rol === "admin" || usuario.rol === "ingeniera" ? "Sin foto — usa el botón para subir una" : "No se adjuntó foto"}
          </div>
        )}
      </div>

      {/* Panel gestión */}
      {(usuario.rol === "admin" || usuario.rol === "ingeniera") && (
        <div style={{ ...s.card, border: `1px solid ${T.accentBorder}` }}>
          <div style={{ ...s.secTitle, color: T.accentText }}>⚙ Gestión</div>
          <div style={{ marginBottom: 14 }}>
            <label style={s.label}>Estado</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Pendiente", "En revisión", "Resuelto", "No procede"].map(est => (
                <button key={est}
                  onClick={() => { actualizarIncidencia(inc.id, { estado: est }); setSelInc(p => ({ ...p, estado: est })); }}
                  style={{
                    padding: "7px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                    border: `1px solid ${inc.estado === est ? T.accentBase : T.borderDefault}`,
                    background: inc.estado === est ? T.accentBase : T.surfaceSecond,
                    color: inc.estado === est ? "#fff" : T.textSecondary,
                    cursor: "pointer", fontFamily: "'IBM Plex Sans',sans-serif", transition: "all .1s",
                  }}>{est}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={s.label}>Nota de seguimiento</label>
            <textarea
              key={inc.id + "nota"}
              defaultValue={inc.comentarioAdmin || ""}
              onBlur={e => { actualizarIncidencia(inc.id, { comentarioAdmin: e.target.value }); setSelInc(p => ({ ...p, comentarioAdmin: e.target.value })); }}
              rows={3}
              placeholder="Observaciones, acciones tomadas, instrucciones..."
              style={s.textarea}
            />
          </div>
        </div>
      )}
    </div>
  );
}
