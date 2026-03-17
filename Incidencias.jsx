import { CALLES, TIPOS_INCIDENCIA, URGENCIAS } from "./constants.js";
import { SUPA_URL, SUPA_KEY } from "./supabase.js";
import SelectConOtro from "./SelectConOtro.jsx";

export default function Incidencias({
  incidencias, formInc, setFormInc,
  incCalleOtro, setIncCalleOtro,
  incTipoOtro, setIncTipoOtro,
  crearIncidencia, setSelInc, navTo,
  dbOnline, addToast,
  usuario, T, s,
}) {
  const esGestor = usuario.rol === "admin" || usuario.rol === "ingeniera";
  const lista = esGestor ? incidencias : incidencias.filter(i => i.autor === usuario.nombre);

  return (
    <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Formulario nueva incidencia */}
      <div style={s.card}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>⚑</span> Reportar nueva incidencia
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <SelectConOtro
            label="Calle / Ubicación *"
            opciones={CALLES}
            valor={formInc.calle}
            otroValor={incCalleOtro}
            onChange={v => setFormInc({ ...formInc, calle: v })}
            onOtroChange={v => setIncCalleOtro(v)}
            inputPlaceholder="Escribe la ubicación específica..."
            s={s} T={T}
          />
          <SelectConOtro
            label="Tipo de incidencia *"
            opciones={TIPOS_INCIDENCIA}
            valor={formInc.tipo}
            otroValor={incTipoOtro}
            onChange={v => setFormInc({ ...formInc, tipo: v })}
            onOtroChange={v => setIncTipoOtro(v)}
            inputPlaceholder="Describe el tipo de incidencia..."
            s={s} T={T}
          />
        </div>

        {/* Urgencia */}
        <div style={{ marginBottom: 14 }}>
          <label style={s.label}>Nivel de urgencia *</label>
          <div style={{ display: "flex", gap: 8 }}>
            {URGENCIAS.map(u => {
              const cfg = {
                Normal:     { bg: T.successMuted, border: T.successBase, text: T.successText, icon: "🟢" },
                Urgente:    { bg: T.warningMuted, border: T.warningBase, text: T.warningText, icon: "🟡" },
                Emergencia: { bg: T.dangerMuted,  border: T.dangerBase,  text: T.dangerText,  icon: "🔴" },
              }[u];
              const active = formInc.urgencia === u;
              return (
                <button key={u} onClick={() => setFormInc({ ...formInc, urgencia: u })} style={{
                  flex: 1, padding: "9px 6px", borderRadius: 6, cursor: "pointer",
                  border: `1.5px solid ${active ? cfg.border : T.borderDefault}`,
                  background: active ? cfg.bg : T.surfaceSecond,
                  color: active ? cfg.text : T.textTertiary,
                  fontSize: 11, fontWeight: active ? 700 : 500,
                  fontFamily: "'IBM Plex Sans',sans-serif", transition: "all .15s",
                }}>{cfg.icon} {u}</button>
              );
            })}
          </div>
        </div>

        {/* Descripción */}
        <div style={{ marginBottom: 14 }}>
          <label style={s.label}>Descripción *</label>
          <textarea
            value={formInc.descripcion}
            onChange={e => setFormInc({ ...formInc, descripcion: e.target.value })}
            rows={3}
            placeholder={`Describe lo que viste en ${formInc.calle}...`}
            style={s.textarea}
          />
        </div>

        {/* Foto */}
        <div style={{ marginBottom: 16 }}>
          <label style={s.label}>Foto (opcional)</label>
          {!formInc.foto ? (
            <label style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 8, padding: "16px", borderRadius: 8, cursor: "pointer",
              border: `2px dashed ${T.borderDefault}`, background: T.surfaceSecond,
              fontSize: 12, color: T.textTertiary,
            }}>
              <span style={{ fontSize: 24 }}>📷</span>
              <span>Adjuntar foto</span>
              <input type="file" accept="image/*" capture="environment" style={{ display: "none" }}
                onChange={async e => {
                  const file = e.target.files[0]; if (!file) return;
                  const reader = new FileReader();
                  reader.onload = ev => setFormInc(p => ({ ...p, foto: ev.target.result }));
                  reader.readAsDataURL(file);
                  if (dbOnline) {
                    try {
                      addToast("Subiendo foto...", "info");
                      const ext = file.name.split(".").pop() || "jpg";
                      const path = `incidencias/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
                      const res = await fetch(`${SUPA_URL}/storage/v1/object/fotos-incidencias/${path}`, {
                        method: "POST",
                        headers: { "Authorization": `Bearer ${SUPA_KEY}`, "Content-Type": file.type, "x-upsert": "true" },
                        body: file,
                      });
                      if (res.ok) {
                        const url = `${SUPA_URL}/storage/v1/object/public/fotos-incidencias/${path}`;
                        setFormInc(p => ({ ...p, foto: url }));
                        addToast("Foto guardada en la nube ✓", "success");
                      }
                    } catch (err) { console.error(err); }
                  }
                }} />
            </label>
          ) : (
            <div style={{ position: "relative" }}>
              <img src={formInc.foto} alt="" style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 8, border: `1px solid ${T.borderDefault}` }} />
              <button onClick={() => setFormInc(p => ({ ...p, foto: null }))} style={{
                position: "absolute", top: 8, right: 8,
                background: "rgba(0,0,0,0.6)", color: "#fff", border: "none",
                borderRadius: "50%", width: 28, height: 28, cursor: "pointer", fontSize: 14,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>×</button>
            </div>
          )}
        </div>

        <button onClick={crearIncidencia} style={{
          ...s.btnPrimary, width: "100%", padding: 12,
          background: formInc.urgencia === "Emergencia" ? T.dangerBase : formInc.urgencia === "Urgente" ? T.warningBase : T.accentBase,
        }}>
          {formInc.urgencia === "Emergencia" ? "🚨 Reportar Emergencia" : formInc.urgencia === "Urgente" ? "⚠️ Reportar Urgente" : "⚑ Reportar Incidencia"}
        </button>
      </div>

      {/* Lista de incidencias */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>
          {esGestor
            ? `${lista.length} incidencia${lista.length !== 1 ? "s" : ""} registrada${lista.length !== 1 ? "s" : ""} — todas`
            : `${lista.length} incidencia${lista.length !== 1 ? "s" : ""} — mis reportes`}
        </div>
        {lista.length === 0 && (
          <div style={{ textAlign: "center", color: T.textTertiary, padding: "32px 0", fontSize: 12 }}>
            {esGestor ? "No hay incidencias registradas." : "Aún no has reportado incidencias."}
          </div>
        )}
        {lista.map(inc => {
          const urgCfg = {
            Normal:     { bg: T.successMuted, border: T.successBase, text: T.successText, icon: "🟢" },
            Urgente:    { bg: T.warningMuted, border: T.warningBase, text: T.warningText, icon: "🟡" },
            Emergencia: { bg: T.dangerMuted,  border: T.dangerBase,  text: T.dangerText,  icon: "🔴" },
          }[inc.urgencia || "Normal"];
          const estadoCfg = {
            "Pendiente":   { bg: T.warningMuted,  text: T.warningText,  dot: "#F97316" },
            "En revisión": { bg: T.accentMuted,   text: T.accentText,   dot: T.accentBase },
            "Resuelto":    { bg: T.successMuted,  text: T.successText,  dot: T.successBase },
            "No procede":  { bg: T.surfaceSecond, text: T.textTertiary, dot: T.borderStrong },
          }[inc.estado] || { bg: T.surfaceSecond, text: T.textTertiary, dot: T.borderStrong };

          return (
            <div key={inc.id}
              onClick={() => { setSelInc(inc); navTo("detalleIncidencia"); }}
              style={{
                ...s.card, marginBottom: 10, cursor: "pointer",
                border: `1px solid ${inc.urgencia === "Emergencia" ? `${T.dangerBase}66` : inc.urgencia === "Urgente" ? `${T.warningBase}44` : T.borderDefault}`,
                transition: "border-color .15s",
              }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>📍 {inc.calle}</span>
                    <span style={{ background: urgCfg.bg, color: urgCfg.text, border: `1px solid ${urgCfg.border}33`, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>
                      {urgCfg.icon} {inc.urgencia}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: T.textTertiary, marginBottom: 6 }}>
                    <span style={{ background: T.surfaceThird, border: `1px solid ${T.borderSubtle}`, padding: "2px 8px", borderRadius: 4, marginRight: 6, fontSize: 10 }}>{inc.tipo}</span>
                    {inc.autor} · {inc.fecha} {inc.hora}
                  </div>
                  <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.6 }}>{inc.descripcion}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "3px 10px", borderRadius: 4, fontSize: 10, fontWeight: 600,
                    background: estadoCfg.bg, color: estadoCfg.text, border: `1px solid ${estadoCfg.dot}33`,
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: estadoCfg.dot, flexShrink: 0 }} />
                    {inc.estado}
                  </span>
                  <span style={{ color: T.textTertiary, fontSize: 14 }}>›</span>
                </div>
              </div>
              {inc.foto && <img src={inc.foto} alt="" style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 6, border: `1px solid ${T.borderDefault}`, marginBottom: 4 }} />}
              {inc.comentarioAdmin && (
                <div style={{ marginTop: 6, fontSize: 11, color: T.accentText, background: T.accentMuted, border: `1px solid ${T.accentBorder}`, borderRadius: 4, padding: "5px 10px" }}>
                  💬 {inc.comentarioAdmin}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
