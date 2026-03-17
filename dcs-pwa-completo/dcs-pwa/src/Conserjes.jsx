import { PHS } from "./constants.js";

import { useApp } from "./AppContext";
import { useData } from "./DataContext";

export default function Conserjes({ crearConserje, navTo, addToast, actualizarReporte }) {
  const { T, s } = useApp();
  const { conserjes, setConserjes, reportes, formCons, setFormCons, selCons, setSelCons, notaCons, setNotaCons } = useData();
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>

      {/* Columna izquierda */}
      <div style={{ flex: "1 1 340px", minWidth: 300, display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Formulario crear */}
        <div style={s.card}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, marginBottom: 20 }}>Crear nuevo conserje</div>
          {[
            { l: "Nombre completo", k: "nombre", p: "Nombre del conserje",    tp: "text" },
            { l: "Correo",          k: "correo", p: "correo@empresa.com",      tp: "email" },
            { l: "Contraseña",      k: "pass",   p: "Contraseña de acceso",    tp: "password" },
          ].map(f => (
            <div key={f.k} style={{ marginBottom: 14 }}>
              <label style={s.label}>{f.l}</label>
              <input type={f.tp} value={formCons[f.k]} onChange={e => setFormCons({ ...formCons, [f.k]: e.target.value })} placeholder={f.p} style={s.input} />
            </div>
          ))}
          <div style={{ marginBottom: 18 }}>
            <label style={s.label}>PH asignado</label>
            <select value={formCons.ph} onChange={e => setFormCons({ ...formCons, ph: e.target.value })} style={s.select}>
              {PHS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <button onClick={crearConserje} style={{ ...s.btnPrimary, width: "100%", padding: 12 }}>◎ Crear Conserje</button>
        </div>

        {/* Lista de conserjes */}
        <div style={s.card}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 14 }}>
            Conserjes registrados ({conserjes.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {conserjes.map(c => {
              const isSelected = selCons?.id === c.id;
              const misReps = reportes.filter(r => r.conserje === c.nombre);
              const novedades = misReps.filter(r => r.novedad).length;
              return (
                <div key={c.id}
                  onClick={() => {
                    if (isSelected) { setSelCons(null); setNotaCons(""); }
                    else { setSelCons(c); setNotaCons(c.nota || ""); }
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px", borderRadius: 8, cursor: "pointer",
                    border: `1.5px solid ${isSelected ? T.accentBase : T.borderDefault}`,
                    background: isSelected ? T.accentMuted : T.surfaceSecond,
                    transition: "all .15s",
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                    background: isSelected ? T.accentBase : `linear-gradient(135deg,${T.surfaceThird},${T.borderStrong})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 15, fontWeight: 700,
                    color: isSelected ? "#fff" : T.textSecondary,
                    border: `2px solid ${isSelected ? T.accentBase : T.borderDefault}`,
                  }}>
                    {c.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? T.accentText : T.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {c.nombre}
                    </div>
                    <div style={{ fontSize: 11, color: T.textTertiary, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      🏢 {c.ph}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, color: T.textTertiary }}>{misReps.length} rep.</span>
                    {novedades > 0 && <span style={{ fontSize: 10, background: T.dangerMuted, color: T.dangerText, padding: "1px 6px", borderRadius: 3, fontWeight: 700 }}>⚠ {novedades}</span>}
                  </div>
                  <span style={{ color: isSelected ? T.accentText : T.textTertiary, fontSize: 14, flexShrink: 0 }}>{isSelected ? "▾" : "›"}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Panel derecho: detalle */}
      {selCons && (() => {
        const c = conserjes.find(x => x.id === selCons.id) || selCons;
        const misReps = reportes.filter(r => r.conserje === c.nombre);
        const ultRep  = misReps[0];
        const novedades = misReps.filter(r => r.novedad);
        return (
          <div style={{ flex: "1 1 320px", minWidth: 280, display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Header */}
            <div style={{ ...s.card, border: `1px solid ${T.accentBorder}`, background: `linear-gradient(135deg,${T.accentBase}14,${T.surfacePrimary})` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
                  background: T.accentBase, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 22, fontWeight: 700, color: "#fff",
                  border: `3px solid ${T.accentBorder}`,
                }}>
                  {c.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary }}>{c.nombre}</div>
                  <div style={{ fontSize: 11, color: T.textTertiary, marginTop: 2 }}>◎ Conserje · {c.ph}</div>
                  <div style={{ fontSize: 11, color: T.textTertiary, fontFamily: "'IBM Plex Mono',monospace" }}>{c.correo}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { label: "Reportes",  val: misReps.length,                                              bg: T.accentMuted,  text: T.accentText },
                  { label: "Novedades", val: novedades.length,                                            bg: T.dangerMuted,  text: T.dangerText },
                  { label: "Urgentes",  val: misReps.filter(r => r.urgencia === "Urgente").length,         bg: T.warningMuted, text: T.warningText },
                ].map(k => (
                  <div key={k.label} style={{ flex: 1, background: k.bg, borderRadius: 6, padding: "8px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: k.text, lineHeight: 1 }}>{k.val}</div>
                    <div style={{ fontSize: 9, color: k.text, marginTop: 2, opacity: 0.8, fontWeight: 600 }}>{k.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nota */}
            <div style={{ ...s.card, border: `1px solid ${T.borderDefault}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>
                ✏ Nota interna
              </div>
              <textarea
                value={notaCons}
                onChange={e => setNotaCons(e.target.value)}
                rows={5}
                placeholder={`Escribe una nota sobre ${c.nombre.split(" ")[0]}...`}
                style={{ ...s.textarea, resize: "vertical" }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button
                  onClick={() => {
                    setConserjes(p => p.map(x => x.id === c.id ? { ...x, nota: notaCons } : x));
                    setSelCons(p => ({ ...p, nota: notaCons }));
                    addToast(`Nota guardada para ${c.nombre.split(" ")[0]}`);
                  }}
                  style={{ ...s.btnPrimary, flex: 1, padding: "9px 12px", fontSize: 12 }}
                >
                  💾 Guardar nota
                </button>
                {notaCons && (
                  <button
                    onClick={() => { setNotaCons(""); setConserjes(p => p.map(x => x.id === c.id ? { ...x, nota: "" } : x)); addToast("Nota eliminada", "warning"); }}
                    style={{ ...s.btnSecondary, padding: "9px 12px", fontSize: 12 }}
                  >✕</button>
                )}
              </div>
              {c.nota && (
                <div style={{ marginTop: 10, fontSize: 11, color: T.accentText, background: T.accentMuted, border: `1px solid ${T.accentBorder}`, borderRadius: 4, padding: "6px 10px" }}>
                  💬 Nota guardada: {c.nota}
                </div>
              )}
            </div>

            {/* Último reporte */}
            {ultRep && (
              <div style={s.card}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>
                  📋 Último reporte
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary, marginBottom: 4 }}>📍 {ultRep.area}</div>
                <div style={{ fontSize: 11, color: T.textTertiary, marginBottom: 6, fontFamily: "'IBM Plex Mono',monospace" }}>{ultRep.fecha} {ultRep.hora}</div>
                <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.7, marginBottom: 8 }}>{ultRep.observacion}</div>
                {ultRep.novedad && (
                  <span style={{ fontSize: 10, background: T.dangerMuted, color: T.dangerText, padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>⚠ Novedad registrada</span>
                )}
              </div>
            )}

            <button onClick={() => navTo("reportesConserje")} style={{ ...s.btnSecondary, padding: "10px 16px", fontSize: 12, textAlign: "center" }}>
              ◉ Ver todos los reportes de {c.nombre.split(" ")[0]}
            </button>

          </div>
        );
      })()}
    </div>
  );
}
