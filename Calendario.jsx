import { PHS, TIPOS } from "./constants.js";

const MESES_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DIAS_ES  = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const COLORES_ESTADO = {
  "Pendiente":  { bg: "#FEF3C7", text: "#92400E", border: "#F59E0B" },
  "En proceso": { bg: "#EFF6FF", text: "#1E40AF", border: "#3B82F6" },
  "Resuelto":   { bg: "#F0FDF4", text: "#166534", border: "#22C55E" },
  "Cerrado":    { bg: "#F3F4F6", text: "#374151", border: "#9CA3AF" },
};

export default function Calendario({
  ordenes, tecnicos, usuario,
  calMes, setCalMes,
  calFiltroTipo, setCalFiltroTipo,
  calFiltroPH, setCalFiltroPH,
  calSelDia, setCalSelDia,
  setSelOrden, navTo, setFormOrden,
  T, s,
}) {
  const { year, month } = calMes;
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonth   = () => setCalMes(m => m.month === 0 ? { year: m.year - 1, month: 11 } : { year: m.year, month: m.month - 1 });
  const nextMonth   = () => setCalMes(m => m.month === 11 ? { year: m.year + 1, month: 0 } : { year: m.year, month: m.month + 1 });
  const hoy = new Date();
  const esHoy = (d) => d === hoy.getDate() && month === hoy.getMonth() && year === hoy.getFullYear();

  const ordenesFiltradas = ordenes.filter(o => {
    if (calFiltroTipo !== "Todos" && o.tipo !== calFiltroTipo) return false;
    if (calFiltroPH !== "Todos" && o.ph !== calFiltroPH) return false;
    return true;
  });

  const ordenesDelMes = {};
  ordenesFiltradas.forEach(o => {
    if (!o.fecha) return;
    const fd = new Date(o.fecha + "T00:00:00");
    if (fd.getFullYear() === year && fd.getMonth() === month) {
      const d = fd.getDate();
      if (!ordenesDelMes[d]) ordenesDelMes[d] = [];
      ordenesDelMes[d].push(o);
    }
  });

  const totalMes = Object.values(ordenesDelMes).flat().length;
  const pendMes  = Object.values(ordenesDelMes).flat().filter(o => o.estado === "Pendiente").length;
  const resMes   = Object.values(ordenesDelMes).flat().filter(o => o.estado === "Resuelto" || o.estado === "Cerrado").length;
  const diasSelDia = calSelDia ? (ordenesDelMes[calSelDia] || []) : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 960 }}>

      {/* Header */}
      <div style={{ ...s.card, background: `linear-gradient(135deg,${T.accentBase}12,${T.surfacePrimary})`, border: `1px solid ${T.accentBorder}`, padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>📅</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary }}>Calendario de Órdenes</div>
              <div style={{ fontSize: 11, color: T.textTertiary }}>Visualización mensual de trabajos programados</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={prevMonth} style={{ ...s.btnSecondary, padding: "6px 12px", fontSize: 14 }}>‹</button>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, minWidth: 160, textAlign: "center" }}>{MESES_ES[month]} {year}</div>
            <button onClick={nextMonth} style={{ ...s.btnSecondary, padding: "6px 12px", fontSize: 14 }}>›</button>
            <button onClick={() => setCalMes({ year: hoy.getFullYear(), month: hoy.getMonth() })} style={{ ...s.btnSecondary, padding: "6px 10px", fontSize: 11 }}>Hoy</button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {[
          { label: "Órdenes en el mes",    val: totalMes, icon: "📋", color: T.accentBase,   bg: T.accentMuted },
          { label: "Pendientes",            val: pendMes,  icon: "⏳", color: T.warningBase,  bg: T.warningMuted },
          { label: "Resueltas / Cerradas",  val: resMes,   icon: "✅", color: T.successBase,  bg: T.successMuted },
        ].map(k => (
          <div key={k.label} style={{ ...s.card, padding: "12px 16px", border: `1px solid ${k.color}22`, background: k.bg }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>{k.icon}</span>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: k.color }}>{k.val}</div>
                <div style={{ fontSize: 10, color: T.textTertiary, marginTop: 1 }}>{k.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ ...s.card, padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary }}>Filtrar:</span>
          <select value={calFiltroPH} onChange={e => setCalFiltroPH(e.target.value)} style={{ ...s.input, padding: "5px 8px", fontSize: 12, flex: "1 1 140px" }}>
            <option value="Todos">Todos los PH</option>
            {PHS.map(p => <option key={p}>{p}</option>)}
          </select>
          <select value={calFiltroTipo} onChange={e => setCalFiltroTipo(e.target.value)} style={{ ...s.input, padding: "5px 8px", fontSize: 12, flex: "1 1 160px" }}>
            <option value="Todos">Todos los tipos</option>
            {TIPOS.map(t => <option key={t}>{t}</option>)}
          </select>
          {(calFiltroPH !== "Todos" || calFiltroTipo !== "Todos") && (
            <button onClick={() => { setCalFiltroPH("Todos"); setCalFiltroTipo("Todos"); }} style={{ ...s.btnSecondary, padding: "5px 10px", fontSize: 11 }}>✕ Limpiar</button>
          )}
        </div>
      </div>

      {/* Grid calendario */}
      <div style={{ ...s.card, padding: 0, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: `1px solid ${T.borderDefault}` }}>
          {DIAS_ES.map(d => (
            <div key={d} style={{ padding: "10px 4px", textAlign: "center", fontSize: 11, fontWeight: 700, color: T.textTertiary, background: T.surfaceSecond, borderRight: `1px solid ${T.borderDefault}` }}>{d}</div>
          ))}
        </div>
        {Array.from({ length: Math.ceil((firstDay + daysInMonth) / 7) }).map((_, wi) => (
          <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: wi < Math.ceil((firstDay + daysInMonth) / 7) - 1 ? `1px solid ${T.borderDefault}` : "none" }}>
            {Array.from({ length: 7 }).map((_, di) => {
              const dayNum = wi * 7 + di - firstDay + 1;
              const valid = dayNum >= 1 && dayNum <= daysInMonth;
              const ords = valid ? (ordenesDelMes[dayNum] || []) : [];
              const selected = calSelDia === dayNum && valid;
              const today = valid && esHoy(dayNum);
              return (
                <div key={di}
                  onClick={() => valid && setCalSelDia(selected ? null : dayNum)}
                  style={{
                    minHeight: 90, padding: "6px 6px 4px",
                    borderRight: di < 6 ? `1px solid ${T.borderDefault}` : "none",
                    background: selected ? `${T.accentBase}18` : today ? `${T.accentBase}08` : T.surfacePrimary,
                    cursor: valid ? "pointer" : "default",
                    transition: "background 0.15s", opacity: valid ? 1 : 0.3,
                  }}>
                  {valid && (
                    <>
                      <div style={{
                        fontSize: 12, fontWeight: today ? 800 : 500,
                        color: today ? T.accentBase : T.textSecondary, marginBottom: 4,
                        width: 22, height: 22, borderRadius: "50%",
                        background: today ? `${T.accentBase}22` : "none",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>{dayNum}</div>
                      {ords.slice(0, 3).map((o, i) => {
                        const cfg = COLORES_ESTADO[o.estado] || COLORES_ESTADO["Pendiente"];
                        return (
                          <div key={i} title={`${o.tipo} — ${o.ph}`} style={{
                            fontSize: 9, fontWeight: 600,
                            background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}66`,
                            borderRadius: 3, padding: "2px 4px", marginBottom: 2,
                            overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", cursor: "pointer",
                          }} onClick={e => { e.stopPropagation(); navTo("detalle"); setSelOrden(o); }}>
                            {o.tipo.length > 16 ? o.tipo.slice(0, 15) + "…" : o.tipo}
                          </div>
                        );
                      })}
                      {ords.length > 3 && <div style={{ fontSize: 9, color: T.accentBase, fontWeight: 700, paddingLeft: 2 }}>+{ords.length - 3} más</div>}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Panel día seleccionado */}
      {calSelDia && (
        <div style={{ ...s.card, border: `1px solid ${T.accentBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>
              📋 {diasSelDia.length} orden{diasSelDia.length !== 1 ? "es" : ""} — {calSelDia} de {MESES_ES[month]}
            </div>
            <button onClick={() => setCalSelDia(null)} style={{ background: "none", border: "none", cursor: "pointer", color: T.textTertiary, fontSize: 16 }}>✕</button>
          </div>
          {diasSelDia.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: T.textTertiary, fontSize: 12 }}>Sin órdenes programadas este día.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {diasSelDia.map(o => {
                const cfg = COLORES_ESTADO[o.estado] || COLORES_ESTADO["Pendiente"];
                const tec = tecnicos.find(t => t.id === o.asignadoA);
                return (
                  <div key={o.id}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 6, background: cfg.bg, border: `1px solid ${cfg.border}44`, cursor: "pointer" }}
                    onClick={() => { navTo("detalle"); setSelOrden(o); }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: cfg.text, marginBottom: 2 }}>{o.tipo}</div>
                      <div style={{ fontSize: 11, color: T.textTertiary }}>{o.ph}{o.ubicacion ? ` · ${o.ubicacion}` : ""}</div>
                      {tec && <div style={{ fontSize: 10, color: T.textTertiary, marginTop: 2 }}>👤 {tec.nombre}</div>}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`, padding: "3px 8px", borderRadius: 4 }}>{o.estado}</span>
                  </div>
                );
              })}
            </div>
          )}
          {usuario.rol === "admin" && (
            <button onClick={() => {
              const pad = n => String(n).padStart(2, "0");
              const fecha = `${year}-${pad(month + 1)}-${pad(calSelDia)}`;
              setFormOrden(f => ({ ...f, fecha }));
              navTo("nueva");
            }} style={{ ...s.btnSecondary, width: "100%", marginTop: 12, padding: 10, fontSize: 12 }}>
              + Nueva orden para el {calSelDia} de {MESES_ES[month]}
            </button>
          )}
        </div>
      )}

      {/* Leyenda */}
      <div style={{ ...s.card, padding: "12px 16px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: T.textTertiary, marginBottom: 8 }}>Leyenda de estados:</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {Object.entries(COLORES_ESTADO).map(([estado, cfg]) => (
            <div key={estado} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: cfg.bg, border: `1.5px solid ${cfg.border}` }} />
              <span style={{ fontSize: 11, color: T.textSecondary }}>{estado}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
