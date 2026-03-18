import { PHS, TIPOS, FRECUENCIAS, COLOR_RECORDATORIO } from "./constants.js";
import { useApp } from "./AppContext";
import { useData } from "./DataContext";
import { lsSet } from "./storage.js";

const MESES_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DIAS_ES  = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const COLORES_ESTADO = {
  "Pendiente":  { bg: "#FEF3C7", text: "#92400E", border: "#F59E0B" },
  "En proceso": { bg: "#EFF6FF", text: "#1E40AF", border: "#3B82F6" },
  "Resuelto":   { bg: "#F0FDF4", text: "#166534", border: "#22C55E" },
  "Cerrado":    { bg: "#F3F4F6", text: "#374151", border: "#9CA3AF" },
};

export default function Calendario({ navTo }) {
  const { T, s, usuario, isMobile } = useApp();
  const {
    ordenes, tecnicos,
    calMes, setCalMes, calFiltroTipo, setCalFiltroTipo, calFiltroPH, setCalFiltroPH, calSelDia, setCalSelDia,
    setSelOrden, setFormOrden,
    recordatorios, setRecordatorios,
    formRec, setFormRec, showFormRec, setShowFormRec,
  } = useData();

  const { year, month } = calMes;
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonth   = () => setCalMes(m => m.month === 0 ? { year: m.year - 1, month: 11 } : { year: m.year, month: m.month - 1 });
  const nextMonth   = () => setCalMes(m => m.month === 11 ? { year: m.year + 1, month: 0 } : { year: m.year, month: m.month + 1 });
  const hoy = new Date();
  const esHoy = (d) => d === hoy.getDate() && month === hoy.getMonth() && year === hoy.getFullYear();

  // ── Órdenes filtradas ──────────────────────────────────────────────────────
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

  // ── Recordatorios del mes ──────────────────────────────────────────────────
  const recsDelMes = {};
  recordatorios.forEach(r => {
    if (!r.fecha) return;
    const fd = new Date(r.fecha + "T00:00:00");

    const agregarDia = (d, m2, y2) => {
      if (m2 === month && y2 === year) {
        if (!recsDelMes[d]) recsDelMes[d] = [];
        recsDelMes[d].push(r);
      }
    };

    if (r.frecuencia === "Única") {
      if (fd.getFullYear() === year && fd.getMonth() === month)
        agregarDia(fd.getDate(), month, year);

    } else if (r.frecuencia === "Semanal") {
      // repetir cada 7 días dentro del mes visible
      const inicio = new Date(year, month, 1);
      const fin    = new Date(year, month + 1, 0);
      let cur = new Date(fd);
      // retroceder al primer día de ocurrencia dentro o antes del mes
      while (cur > fin) cur.setDate(cur.getDate() - 7);
      while (cur < inicio) cur.setDate(cur.getDate() + 7);
      while (cur <= fin) {
        agregarDia(cur.getDate(), cur.getMonth(), cur.getFullYear());
        cur.setDate(cur.getDate() + 7);
      }

    } else if (r.frecuencia === "Mensual") {
      // mismo día cada mes
      const dia = fd.getDate();
      if (dia <= daysInMonth) agregarDia(dia, month, year);
    }
  });

  // ── KPIs ───────────────────────────────────────────────────────────────────
  const totalMes   = Object.values(ordenesDelMes).flat().length;
  const pendMes    = Object.values(ordenesDelMes).flat().filter(o => o.estado === "Pendiente").length;
  const resMes     = Object.values(ordenesDelMes).flat().filter(o => o.estado === "Resuelto" || o.estado === "Cerrado").length;
  const totalRecs  = Object.values(recsDelMes).flat().length;

  const diasSelOrden = calSelDia ? (ordenesDelMes[calSelDia] || []) : [];
  const diasSelRecs  = calSelDia ? (recsDelMes[calSelDia]    || []) : [];

  // ── Guardar recordatorio ───────────────────────────────────────────────────
  const guardarRec = () => {
    if (!formRec.titulo.trim() || !formRec.fecha) return;
    const nuevo = { ...formRec, id: Date.now(), creadoPor: usuario?.nombre || "—", creadoAt: new Date().toISOString() };
    const nuevos = [...recordatorios, nuevo];
    setRecordatorios(nuevos);
    lsSet("dcs_recordatorios", nuevos);
    setFormRec({ titulo: "", fecha: "", frecuencia: "Única", ph: PHS[0], nota: "" });
    setShowFormRec(false);
  };

  const eliminarRec = (id) => {
    const nuevos = recordatorios.filter(r => r.id !== id);
    setRecordatorios(nuevos);
    lsSet("dcs_recordatorios", nuevos);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 960 }}>

      {/* Header */}
      <div style={{ ...s.card, background: `linear-gradient(135deg,${T.accentBase}12,${T.surfacePrimary})`, border: `1px solid ${T.accentBorder}`, padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>📅</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary }}>Calendario de Órdenes</div>
              <div style={{ fontSize: 11, color: T.textTertiary }}>Visualización mensual de trabajos y recordatorios</div>
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
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 10 }}>
        {[
          { label: "Órdenes en el mes",   val: totalMes,  icon: "📋", color: T.accentBase,  bg: T.accentMuted },
          { label: "Pendientes",           val: pendMes,   icon: "⏳", color: T.warningBase, bg: T.warningMuted },
          { label: "Resueltas/Cerradas",   val: resMes,    icon: "✅", color: T.successBase, bg: T.successMuted },
          { label: "Recordatorios",        val: totalRecs, icon: "🔔", color: "#6366F1",     bg: "#F0F4FF" },
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

      {/* Filtros + botón nuevo recordatorio */}
      <div style={{ ...s.card, padding: "12px 16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
          <button
            onClick={() => setShowFormRec(true)}
            style={{ ...s.btnPrimary, padding: "10px 14px", fontSize: 13, background: "#6366F1", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", borderRadius: 8 }}
          >
            🔔 Nuevo recordatorio
          </button>
        </div>
      </div>

      {/* Formulario nuevo recordatorio */}
      {showFormRec && (
        <div style={{ ...s.card, border: `1px solid #6366F1`, background: "#F0F4FF" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#3730A3" }}>🔔 Nuevo Recordatorio</div>
            <button onClick={() => setShowFormRec(false)} style={{ background: "none", border: "none", cursor: "pointer", color: T.textTertiary, fontSize: 18 }}>✕</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={s.label}>Título del recordatorio *</label>
              <input
                value={formRec.titulo}
                onChange={e => setFormRec(f => ({ ...f, titulo: e.target.value }))}
                placeholder="Ej: Chequeo semanal PH Velamar"
                style={{ ...s.input }}
              />
            </div>
            <div>
              <label style={s.label}>Fecha *</label>
              <input
                type="date"
                value={formRec.fecha}
                onChange={e => setFormRec(f => ({ ...f, fecha: e.target.value }))}
                style={{ ...s.input }}
              />
            </div>
            <div>
              <label style={s.label}>Frecuencia</label>
              <select value={formRec.frecuencia} onChange={e => setFormRec(f => ({ ...f, frecuencia: e.target.value }))} style={{ ...s.select }}>
                {FRECUENCIAS.map(fr => <option key={fr}>{fr}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>PH asociado</label>
              <select value={formRec.ph} onChange={e => setFormRec(f => ({ ...f, ph: e.target.value }))} style={{ ...s.select }}>
                {PHS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>Nota adicional</label>
              <input
                value={formRec.nota}
                onChange={e => setFormRec(f => ({ ...f, nota: e.target.value }))}
                placeholder="Opcional..."
                style={{ ...s.input }}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={guardarRec}
              disabled={!formRec.titulo.trim() || !formRec.fecha}
              style={{ ...s.btnPrimary, background: "#6366F1", opacity: (!formRec.titulo.trim() || !formRec.fecha) ? 0.5 : 1, flex: 1, padding: "10px" }}
            >
              ✅ Guardar recordatorio
            </button>
            <button onClick={() => setShowFormRec(false)} style={{ ...s.btnSecondary, padding: "10px 16px" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Grid calendario */}
      <div style={{ ...s.card, padding: 0, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: `1px solid ${T.borderDefault}` }}>
          {DIAS_ES.map(d => (
            <div key={d} style={{ padding: isMobile ? "8px 2px" : "10px 4px", textAlign: "center", fontSize: isMobile ? 9 : 11, fontWeight: 700, color: T.textTertiary, background: T.surfaceSecond, borderRight: `1px solid ${T.borderDefault}` }}>{d}</div>
          ))}
        </div>
        {Array.from({ length: Math.ceil((firstDay + daysInMonth) / 7) }).map((_, wi) => (
          <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: wi < Math.ceil((firstDay + daysInMonth) / 7) - 1 ? `1px solid ${T.borderDefault}` : "none" }}>
            {Array.from({ length: 7 }).map((_, di) => {
              const dayNum = wi * 7 + di - firstDay + 1;
              const valid  = dayNum >= 1 && dayNum <= daysInMonth;
              const ords   = valid ? (ordenesDelMes[dayNum] || []) : [];
              const recs   = valid ? (recsDelMes[dayNum]    || []) : [];
              const selected = calSelDia === dayNum && valid;
              const today    = valid && esHoy(dayNum);
              return (
                <div key={di}
                  onClick={() => valid && setCalSelDia(selected ? null : dayNum)}
                  style={{
                    minHeight: isMobile ? 60 : 90, padding: isMobile ? "4px 2px" : "6px 6px 4px",
                    borderRight: di < 6 ? `1px solid ${T.borderDefault}` : "none",
                    background: selected ? `${T.accentBase}18` : today ? `${T.accentBase}08` : T.surfacePrimary,
                    cursor: valid ? "pointer" : "default",
                    transition: "background 0.15s", opacity: valid ? 1 : 0.3,
                  }}>
                  {valid && (
                    <>
                      <div style={{
                        fontSize: isMobile ? 10 : 12, fontWeight: today ? 800 : 500,
                        color: today ? T.accentBase : T.textSecondary, marginBottom: 2,
                        width: isMobile ? 18 : 22, height: isMobile ? 18 : 22, borderRadius: "50%",
                        background: today ? `${T.accentBase}22` : "none",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>{dayNum}</div>

                      {/* Órdenes — en móvil solo punto de color */}
                      {isMobile ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 2, marginTop: 2 }}>
                          {ords.slice(0, 2).map((o, i) => {
                            const cfg = COLORES_ESTADO[o.estado] || COLORES_ESTADO["Pendiente"];
                            return <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.border }} />;
                          })}
                          {recs.slice(0, 2).map((r, i) => (
                            <div key={`r${i}`} style={{ width: 6, height: 6, borderRadius: "50%", background: COLOR_RECORDATORIO.border }} />
                          ))}
                          {(ords.length + recs.length) > 4 && <div style={{ fontSize: 8, color: T.accentBase, fontWeight: 700 }}>+</div>}
                        </div>
                      ) : (
                        <>
                          {ords.slice(0, 2).map((o, i) => {
                            const cfg = COLORES_ESTADO[o.estado] || COLORES_ESTADO["Pendiente"];
                            return (
                              <div key={i} title={`${o.tipo} — ${o.ph}`} style={{
                                fontSize: 9, fontWeight: 600,
                                background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}66`,
                                borderRadius: 3, padding: "2px 4px", marginBottom: 2,
                                overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", cursor: "pointer",
                              }} onClick={e => { e.stopPropagation(); navTo("detalle"); setSelOrden(o); }}>
                                {o.tipo.length > 14 ? o.tipo.slice(0, 13) + "…" : o.tipo}
                              </div>
                            );
                          })}
                          {recs.slice(0, 2).map((r, i) => (
                            <div key={`r${i}`} title={`🔔 ${r.titulo} — ${r.ph}`} style={{
                              fontSize: 9, fontWeight: 600,
                              background: COLOR_RECORDATORIO.bg, color: COLOR_RECORDATORIO.text,
                              border: `1px solid ${COLOR_RECORDATORIO.border}66`,
                              borderRadius: 3, padding: "2px 4px", marginBottom: 2,
                              overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
                            }}>
                              🔔 {r.titulo.length > 12 ? r.titulo.slice(0, 11) + "…" : r.titulo}
                            </div>
                          ))}
                          {(ords.length + recs.length) > 4 && (
                            <div style={{ fontSize: 9, color: T.accentBase, fontWeight: 700, paddingLeft: 2 }}>+{(ords.length + recs.length) - 4} más</div>
                          )}
                        </>
                      )}
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
              {calSelDia} de {MESES_ES[month]} — {diasSelOrden.length} orden{diasSelOrden.length !== 1 ? "es" : ""} · {diasSelRecs.length} recordatorio{diasSelRecs.length !== 1 ? "s" : ""}
            </div>
            <button onClick={() => setCalSelDia(null)} style={{ background: "none", border: "none", cursor: "pointer", color: T.textTertiary, fontSize: 16 }}>✕</button>
          </div>

          {/* Recordatorios del día */}
          {diasSelRecs.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#3730A3", textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 8 }}>🔔 Recordatorios</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {diasSelRecs.map(r => (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 6, background: COLOR_RECORDATORIO.bg, border: `1px solid ${COLOR_RECORDATORIO.border}44` }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: COLOR_RECORDATORIO.text, marginBottom: 2 }}>{r.titulo}</div>
                      <div style={{ fontSize: 11, color: T.textTertiary }}>{r.ph} · {r.frecuencia}</div>
                      {r.nota && <div style={{ fontSize: 11, color: T.textTertiary, marginTop: 2 }}>📝 {r.nota}</div>}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, background: COLOR_RECORDATORIO.bg, color: COLOR_RECORDATORIO.text, border: `1px solid ${COLOR_RECORDATORIO.border}`, padding: "3px 8px", borderRadius: 4 }}>{r.frecuencia}</span>
                    {(usuario?.rol === "admin" || usuario?.rol === "ingeniera") && (
                      <button onClick={() => eliminarRec(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 14, padding: "2px 6px" }}>🗑</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Órdenes del día */}
          {diasSelOrden.length === 0 && diasSelRecs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: T.textTertiary, fontSize: 12 }}>Sin órdenes ni recordatorios este día.</div>
          ) : diasSelOrden.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.textSecondary, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 8 }}>📋 Órdenes</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {diasSelOrden.map(o => {
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
            </div>
          )}

          {usuario?.rol === "admin" && (
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
        <div style={{ fontSize: 11, fontWeight: 600, color: T.textTertiary, marginBottom: 8 }}>Leyenda:</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {Object.entries(COLORES_ESTADO).map(([estado, cfg]) => (
            <div key={estado} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: cfg.bg, border: `1.5px solid ${cfg.border}` }} />
              <span style={{ fontSize: 11, color: T.textSecondary }}>{estado}</span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: COLOR_RECORDATORIO.bg, border: `1.5px solid ${COLOR_RECORDATORIO.border}` }} />
            <span style={{ fontSize: 11, color: T.textSecondary }}>Recordatorio</span>
          </div>
        </div>
      </div>

    </div>
  );
}
