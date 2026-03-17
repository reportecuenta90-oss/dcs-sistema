import { CALLES, URGENCIAS } from "./constants.js";

import { useApp } from "./AppContext";
import { useData } from "./DataContext";

export default function ReporteCalle({ navTo }) {
  const { T, s } = useApp();
  const { incidencias, calleRep, setCalleRep, urgRep, setUrgRep, estRep, setEstRep, fdRep, setFdRep, fhRep, setFhRep, setSelInc } = useData();
  const lista = incidencias.filter(i => {
    if (calleRep !== "Todas" && i.calle !== calleRep) return false;
    if (urgRep !== "Todos" && i.urgencia !== urgRep) return false;
    if (estRep !== "Todos" && i.estado !== estRep) return false;
    if (fdRep && i.fecha < fdRep) return false;
    if (fhRep && i.fecha > fhRep) return false;
    return true;
  });

  const totalPend     = lista.filter(i => i.estado === "Pendiente").length;
  const totalRevision = lista.filter(i => i.estado === "En revisión").length;
  const totalResuelto = lista.filter(i => i.estado === "Resuelto").length;
  const totalEmerg    = lista.filter(i => i.urgencia === "Emergencia").length;

  return (
    <div style={{ maxWidth: 860, display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header banner */}
      <div style={{ ...s.card, background: `linear-gradient(135deg,${T.accentBase}18,${T.surfacePrimary})`, border: `1px solid ${T.accentBorder}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.accentText, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>🛣 Reporte General</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.textPrimary }}>Incidencias de Calle</div>
            <div style={{ fontSize: 12, color: T.textTertiary, marginTop: 2 }}>Vista consolidada de todos los reportes de calle registrados</div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { label: "Pendientes",  val: totalPend,     bg: T.warningMuted, text: T.warningText, dot: "#F97316" },
              { label: "En revisión", val: totalRevision, bg: T.accentMuted,  text: T.accentText,  dot: T.accentBase },
              { label: "Resueltos",   val: totalResuelto, bg: T.successMuted, text: T.successText, dot: T.successBase },
              { label: "Emergencias", val: totalEmerg,    bg: T.dangerMuted,  text: T.dangerText,  dot: T.dangerBase },
            ].map(k => (
              <div key={k.label} style={{ background: k.bg, border: `1px solid ${k.dot}33`, borderRadius: 8, padding: "10px 16px", textAlign: "center", minWidth: 80 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: k.text, lineHeight: 1 }}>{k.val}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: k.text, marginTop: 3, opacity: 0.8 }}>{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ ...s.card, padding: "14px 18px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>Filtros</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10 }}>
          <div>
            <label style={s.label}>Calle</label>
            <select value={calleRep} onChange={e => setCalleRep(e.target.value)} style={s.select}>
              <option value="Todas">Todas</option>
              {CALLES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={s.label}>Urgencia</label>
            <select value={urgRep} onChange={e => setUrgRep(e.target.value)} style={s.select}>
              <option value="Todos">Todos</option>
              {URGENCIAS.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label style={s.label}>Estado</label>
            <select value={estRep} onChange={e => setEstRep(e.target.value)} style={s.select}>
              {["Todos", "Pendiente", "En revisión", "Resuelto", "No procede"].map(e => <option key={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label style={s.label}>Desde</label>
            <input type="date" value={fdRep} onChange={e => setFdRep(e.target.value)} style={s.input} />
          </div>
          <div>
            <label style={s.label}>Hasta</label>
            <input type="date" value={fhRep} onChange={e => setFhRep(e.target.value)} style={s.input} />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button onClick={() => { setCalleRep("Todas"); setUrgRep("Todos"); setEstRep("Todos"); setFdRep(""); setFhRep(""); }}
              style={{ ...s.btnSecondary, width: "100%", padding: "8px 12px", fontSize: 11 }}>
              ✕ Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Contador */}
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.8px", paddingLeft: 2 }}>
        {lista.length} resultado{lista.length !== 1 ? "s" : ""} encontrado{lista.length !== 1 ? "s" : ""}
      </div>

      {/* Lista */}
      {lista.length === 0 ? (
        <div style={{ ...s.card, textAlign: "center", padding: "48px 24px", color: T.textTertiary, fontSize: 13 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🛣</div>
          No hay incidencias que coincidan con los filtros.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {lista.map(inc => {
            const urgCfg = {
              Normal:     { bg: T.successMuted, border: T.successBase, text: T.successText, icon: "🟢" },
              Urgente:    { bg: T.warningMuted, border: T.warningBase, text: T.warningText, icon: "🟡" },
              Emergencia: { bg: T.dangerMuted,  border: T.dangerBase,  text: T.dangerText,  icon: "🔴" },
            }[inc.urgencia || "Normal"];
            const estCfg = {
              "Pendiente":   { bg: T.warningMuted,  text: T.warningText,  dot: "#F97316" },
              "En revisión": { bg: T.accentMuted,   text: T.accentText,   dot: T.accentBase },
              "Resuelto":    { bg: T.successMuted,  text: T.successText,  dot: T.successBase },
              "No procede":  { bg: T.surfaceSecond, text: T.textTertiary, dot: T.borderStrong },
            }[inc.estado] || { bg: T.surfaceSecond, text: T.textTertiary, dot: T.borderStrong };

            return (
              <div key={inc.id}
                style={{ ...s.card, cursor: "pointer", borderLeft: `4px solid ${inc.urgencia === "Emergencia" ? T.dangerBase : inc.urgencia === "Urgente" ? T.warningBase : T.borderDefault}`, transition: "box-shadow .15s" }}
                onClick={() => { setSelInc(inc); navTo("detalleIncidencia"); }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>📍 {inc.calle}</span>
                      <span style={{ background: urgCfg.bg, color: urgCfg.text, border: `1px solid ${urgCfg.border}33`, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>{urgCfg.icon} {inc.urgencia}</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: estCfg.bg, color: estCfg.text, border: `1px solid ${estCfg.dot}33`, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4 }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: estCfg.dot, flexShrink: 0 }} />{inc.estado}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ background: T.surfaceThird, color: T.textSecondary, border: `1px solid ${T.borderSubtle}`, fontSize: 10, padding: "2px 8px", borderRadius: 4 }}>{inc.tipo}</span>
                      <span style={{ fontSize: 11, color: T.textTertiary, fontFamily: "'IBM Plex Mono',monospace" }}>{inc.autor} · {inc.fecha} {inc.hora}</span>
                    </div>
                    <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.7, maxWidth: 520 }}>{inc.descripcion}</div>
                    {inc.comentarioAdmin && (
                      <div style={{ marginTop: 8, fontSize: 11, color: T.accentText, background: T.accentMuted, border: `1px solid ${T.accentBorder}`, borderRadius: 4, padding: "5px 10px" }}>
                        💬 <b>Nota:</b> {inc.comentarioAdmin}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                    {inc.foto
                      ? <img src={inc.foto} alt="" style={{ width: 100, height: 72, objectFit: "cover", borderRadius: 6, border: `1px solid ${T.borderDefault}` }} />
                      : <div style={{ width: 100, height: 72, borderRadius: 6, border: `1px dashed ${T.borderDefault}`, background: T.surfaceSecond, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: T.textTertiary }}>📷</div>
                    }
                    <span style={{ fontSize: 11, color: T.accentText, fontWeight: 600 }}>Ver detalle ›</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resumen por calle */}
      {incidencias.length > 0 && (
        <div style={s.card}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 14 }}>📊 Resumen por calle</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {CALLES.map(calle => {
              const total  = incidencias.filter(i => i.calle === calle).length;
              if (total === 0) return null;
              const pend   = incidencias.filter(i => i.calle === calle && i.estado === "Pendiente").length;
              const emerg  = incidencias.filter(i => i.calle === calle && i.urgencia === "Emergencia").length;
              const resuel = incidencias.filter(i => i.calle === calle && i.estado === "Resuelto").length;
              const pct    = Math.round((resuel / total) * 100);
              return (
                <div key={calle} style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary, minWidth: 200, flex: 1 }}>📍 {calle}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: T.textTertiary }}>{total} total</span>
                    {pend > 0 && <span style={{ fontSize: 10, background: T.warningMuted, color: T.warningText, padding: "1px 6px", borderRadius: 3, fontWeight: 600 }}>{pend} pend.</span>}
                    {emerg > 0 && <span style={{ fontSize: 10, background: T.dangerMuted, color: T.dangerText, padding: "1px 6px", borderRadius: 3, fontWeight: 600 }}>🚨 {emerg} emerg.</span>}
                    {resuel > 0 && <span style={{ fontSize: 10, background: T.successMuted, color: T.successText, padding: "1px 6px", borderRadius: 3, fontWeight: 600 }}>{resuel} resuel.</span>}
                  </div>
                  <div style={{ width: 100, height: 5, borderRadius: 4, background: T.borderDefault, overflow: "hidden", flexShrink: 0 }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: T.successBase, borderRadius: 4, transition: "width .4s" }} />
                  </div>
                  <span style={{ fontSize: 10, color: T.textTertiary, minWidth: 28 }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
