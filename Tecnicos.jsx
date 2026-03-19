import { useApp } from "./AppContext";
import { useData } from "./DataContext";

const ESPECIALIDADES = [
  "Eléctrico",
  "Plomería",
  "Aire acondicionado",
  "Mantenimiento general",
  "Ascensores",
  "Piscinas",
  "Seguridad",
  "Otro",
];

export default function Tecnicos({ crearTecnico }) {
  const { T, s } = useApp();
  const { tecnicos, setTecnicos, ordenes, formTec, setFormTec, selTec, setSelTec } = useData();

  const ordenesDelTec = (id) => ordenes.filter(o => o.asignadoA === id || o.tecnico === tecnicos.find(t => t.id === id)?.nombre);

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>

      {/* Columna izquierda — formulario + lista */}
      <div style={{ flex: "1 1 340px", minWidth: 300, display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Formulario */}
        <div style={s.card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, marginBottom: 20 }}>Crear nuevo técnico</div>
          {[
            { l: "Nombre completo", k: "nombre",   p: "Nombre del técnico",   tp: "text" },
            { l: "Correo",          k: "correo",   p: "correo@empresa.com",   tp: "email" },
            { l: "Contraseña",      k: "pass",     p: "Mínimo 6 caracteres",  tp: "password" },
            { l: "Teléfono",        k: "telefono", p: "+507 6000-0000",       tp: "tel" },
          ].map(f => (
            <div key={f.k} style={{ marginBottom: 14 }}>
              <label style={s.label}>{f.l}</label>
              <input
                type={f.tp}
                value={formTec[f.k]}
                onChange={e => setFormTec({ ...formTec, [f.k]: e.target.value })}
                placeholder={f.p}
                style={s.input}
              />
            </div>
          ))}
          <div style={{ marginBottom: 18 }}>
            <label style={s.label}>Especialidad</label>
            <select value={formTec.especialidad} onChange={e => setFormTec({ ...formTec, especialidad: e.target.value })} style={s.select}>
              {ESPECIALIDADES.map(e => <option key={e}>{e}</option>)}
            </select>
          </div>
          <button onClick={crearTecnico} style={{ ...s.btnPrimary, width: "100%", padding: 12 }}>
            👷 Crear Técnico
          </button>
        </div>

        {/* Lista */}
        <div style={s.card}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 14 }}>
            Técnicos registrados ({tecnicos.length})
          </div>
          {tecnicos.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: T.textTertiary, fontSize: 12 }}>
              No hay técnicos registrados aún.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {tecnicos.map(t => {
                const isSelected = selTec?.id === t.id;
                const ords = ordenesDelTec(t.id);
                const completadas = ords.filter(o => o.estado === "Resuelto" || o.estado === "Cerrado").length;
                return (
                  <div key={t.id}
                    onClick={() => setSelTec(isSelected ? null : t)}
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
                      {t.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? T.accentText : T.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {t.nombre}
                      </div>
                      <div style={{ fontSize: 11, color: T.textTertiary, marginTop: 1 }}>
                        🔧 {t.especialidad || "General"}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
                      <span style={{ fontSize: 10, color: T.textTertiary }}>{ords.length} órd.</span>
                      {completadas > 0 && (
                        <span style={{ fontSize: 10, background: T.successMuted, color: T.successText, padding: "1px 6px", borderRadius: 3, fontWeight: 700 }}>✓ {completadas}</span>
                      )}
                    </div>
                    <span style={{ color: isSelected ? T.accentText : T.textTertiary, fontSize: 14, flexShrink: 0 }}>{isSelected ? "▾" : "›"}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Panel derecho — detalle */}
      {selTec && (() => {
        const t = tecnicos.find(x => x.id === selTec.id) || selTec;
        const ords = ordenesDelTec(t.id);
        const completadas = ords.filter(o => o.estado === "Resuelto" || o.estado === "Cerrado").length;
        const enProceso   = ords.filter(o => o.estado === "En proceso" || o.estado === "En revisión").length;
        const pendientes  = ords.filter(o => o.estado === "Pendiente").length;
        const tasa = ords.length > 0 ? Math.round((completadas / ords.length) * 100) : 0;
        return (
          <div style={{ flex: "1 1 320px", minWidth: 280, display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Header técnico */}
            <div style={{ ...s.card, border: `1.5px solid ${T.accentBorder}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%",
                    background: `linear-gradient(135deg,${T.accentBase},${T.accentBase}88)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, fontWeight: 800, color: "#fff",
                    border: `2px solid ${T.accentBase}`,
                  }}>
                    {t.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: T.textPrimary }}>{t.nombre}</div>
                    <div style={{ fontSize: 11, color: T.textTertiary, marginTop: 2 }}>🔧 {t.especialidad || "General"}</div>
                    {t.correo && <div style={{ fontSize: 11, color: T.accentText, marginTop: 2 }}>{t.correo}</div>}
                    {t.telefono && <div style={{ fontSize: 11, color: T.textTertiary, marginTop: 2 }}>📞 {t.telefono}</div>}
                  </div>
                </div>
                <button onClick={() => setSelTec(null)} style={{ background: "none", border: "none", cursor: "pointer", color: T.textTertiary, fontSize: 18 }}>✕</button>
              </div>

              {/* KPIs */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                {[
                  { val: ords.length,  lbl: "Total",     color: T.accentBase,   bg: T.accentMuted },
                  { val: completadas,  lbl: "Completadas", color: T.successBase, bg: T.successMuted },
                  { val: enProceso,    lbl: "En proceso", color: T.warningBase,  bg: T.warningMuted },
                  { val: `${tasa}%`,   lbl: "Eficiencia", color: tasa >= 80 ? T.successBase : T.warningBase, bg: tasa >= 80 ? T.successMuted : T.warningMuted },
                ].map((k, i) => (
                  <div key={i} style={{ background: k.bg, borderRadius: 6, padding: "10px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.val}</div>
                    <div style={{ fontSize: 9, color: k.color, opacity: .7, marginTop: 3, textTransform: "uppercase", letterSpacing: ".4px" }}>{k.lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Órdenes recientes */}
            {ords.length > 0 && (
              <div style={s.card}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>
                  Órdenes recientes
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {ords.slice(0, 5).map(o => (
                    <div key={o.id} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 10px", borderRadius: 6,
                      background: T.surfaceSecond,
                      border: `1px solid ${T.borderSubtle}`,
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary }}>{o.tipo || "General"}</div>
                        <div style={{ fontSize: 11, color: T.textTertiary }}>{o.ph || "—"}</div>
                      </div>
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                        background: o.estado === "Resuelto" || o.estado === "Cerrado" ? T.successMuted : o.estado === "En proceso" ? T.accentMuted : T.warningMuted,
                        color: o.estado === "Resuelto" || o.estado === "Cerrado" ? T.successText : o.estado === "En proceso" ? T.accentText : T.warningText,
                      }}>{o.estado}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        );
      })()}

    </div>
  );
}
