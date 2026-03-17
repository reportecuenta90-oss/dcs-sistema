import { PHS, TIPOS, URGENCIAS } from "./constants.js";
import SelectConOtro from "./SelectConOtro.jsx";
import { useApp } from "./AppContext";
import { useData } from "./DataContext";

export default function NuevaOrden({ crearOrden }) {
  const { T, s } = useApp();
  const { tecnicos, formOrden, setFormOrden, ordenTipoOtro, setOrdenTipoOtro } = useData();

  return (
    <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ ...s.card, background: `linear-gradient(135deg,${T.accentBase}10,${T.surfacePrimary})`, border: `1px solid ${T.accentBorder}` }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: T.textPrimary }}>+ Nueva Asignación</div>
        <div style={{ fontSize: 11, color: T.textTertiary, marginTop: 2 }}>Completa todos los campos para crear la asignación</div>
      </div>
      <div style={s.card}>
        <div style={{ marginBottom: 18 }}>
          <label style={s.label}>PH</label>
          <select value={formOrden.ph} onChange={e => setFormOrden({ ...formOrden, ph: e.target.value })} style={s.select}>
            {PHS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 18 }}>
          <SelectConOtro label="Tipo de servicio" opciones={TIPOS} valor={formOrden.tipo} otroValor={ordenTipoOtro}
            onChange={v => setFormOrden({ ...formOrden, tipo: v })} onOtroChange={v => setOrdenTipoOtro(v)}
            inputPlaceholder="Describe el tipo de servicio..." s={s} T={T} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={s.label}>Urgencia</label>
          <div style={{ display: "flex", gap: 8 }}>
            {URGENCIAS.map(u => {
              const cfg = {
                Normal:     { bg: T.successMuted, border: T.successBase, text: T.successText, icon: "🟢" },
                Urgente:    { bg: T.warningMuted, border: T.warningBase, text: T.warningText, icon: "🟡" },
                Emergencia: { bg: T.dangerMuted,  border: T.dangerBase,  text: T.dangerText,  icon: "🔴" },
              }[u];
              const active = (formOrden.urgencia || "Normal") === u;
              return (
                <button key={u} onClick={() => setFormOrden({ ...formOrden, urgencia: u })} style={{ flex: 1, padding: "9px 4px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontFamily: "'IBM Plex Sans',sans-serif", fontWeight: active ? 700 : 500, border: `1.5px solid ${active ? cfg.border : T.borderDefault}`, background: active ? cfg.bg : "transparent", color: active ? cfg.text : T.textTertiary, transition: "all .15s" }}>
                  {cfg.icon} {u}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={s.label}>Descripción del problema *</label>
          <textarea value={formOrden.descripcion || ""} onChange={e => setFormOrden({ ...formOrden, descripcion: e.target.value })} rows={3} placeholder="Describe el problema o trabajo a realizar..." style={s.textarea} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={s.label}>Ubicación *</label>
          <input value={formOrden.ubicacion} onChange={e => setFormOrden({ ...formOrden, ubicacion: e.target.value })} placeholder="Ej: Tablero principal · Piso 3" style={s.input} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={s.label}>Fecha *</label>
          <input type="date" value={formOrden.fecha} onChange={e => setFormOrden({ ...formOrden, fecha: e.target.value })} style={s.input} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={s.label}>Asignar técnico</label>
          <select value={formOrden.asignadoA} onChange={e => setFormOrden({ ...formOrden, asignadoA: e.target.value })} style={s.select}>
            <option value="">Sin asignar</option>
            {tecnicos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={s.label}>Foto del daño <span style={{ fontWeight: 400, color: T.textTertiary }}>(opcional)</span></label>
          {formOrden.fotoDano ? (
            <div style={{ position: "relative", marginTop: 6 }}>
              <img src={formOrden.fotoDano} alt="" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8, border: `1px solid ${T.borderDefault}` }} />
              <button onClick={() => setFormOrden({ ...formOrden, fotoDano: null })} style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: 26, height: 26, cursor: "pointer", fontSize: 13 }}>×</button>
            </div>
          ) : (
            <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", border: `2px dashed ${T.borderDefault}`, borderRadius: 8, cursor: "pointer", background: T.surfaceSecond, marginTop: 6 }}>
              <span style={{ fontSize: 20 }}>📷</span>
              <span style={{ fontSize: 12, color: T.textTertiary }}>Toca para subir foto del daño</span>
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = ev => setFormOrden({ ...formOrden, fotoDano: ev.target.result }); reader.readAsDataURL(file); }} />
            </label>
          )}
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={s.label}>Notas adicionales</label>
          <textarea value={formOrden.notas} onChange={e => setFormOrden({ ...formOrden, notas: e.target.value })} rows={2} placeholder="Observaciones adicionales..." style={s.textarea} />
        </div>
        <button onClick={crearOrden} style={{ ...s.btnPrimary, width: "100%", padding: 13, fontSize: 14 }}>+ Crear Asignación</button>
      </div>
    </div>
  );
}
