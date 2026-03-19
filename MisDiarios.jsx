import { PHS } from "./constants.js";

const COLORES = ["#2563EB","#7C3AED","#0891B2","#059669","#D97706","#DC2626","#9333EA","#0D9488"];

import { useApp } from "./AppContext";
import { useData } from "./DataContext";

export default function MisDiarios({ navTo, addToast, LOGO_B64 }) {
  const { T, s, usuario } = useApp();
  const { diarios, diarFD, setDiarFD, diarFH, setDiarFH, diarPHF, setDiarPHF, setFormDiario, setDiarioEditId, setDiarioPreview } = useData();
  const exportarDiarioPDF = (d) => {
    const hoy = new Date().toLocaleDateString("es", { year: "numeric", month: "long", day: "numeric" });
    const fechaDisplay = new Date(d.fecha + "T00:00:00").toLocaleDateString("es", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const bloquesHTML = d.bloques.map((b, idx) => {
      const color = COLORES[idx % COLORES.length];
      const fotosHTML = (b.fotos || []).length > 0 ? `
        <div style="margin-top:12px">
          <div style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">📷 Registro fotográfico (${b.fotos.length} foto${b.fotos.length !== 1 ? "s" : ""})</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px">
            ${b.fotos.map((f, i) => `<div><img src="${f.data || f}" style="width:100%;height:140px;object-fit:cover;border-radius:4px;border:1px solid #ddd"/><div style="font-size:9px;color:#9ca3af;text-align:center;margin-top:3px">Foto ${i + 1}</div></div>`).join("")}
          </div>
        </div>` : "";
      return `<div style="margin-bottom:24px;border-radius:6px;overflow:hidden;border:1px solid #e5e7eb">
        <div style="background:#0D1726;color:#fff;padding:12px 20px;display:flex;align-items:center;justify-content:space-between">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:32px;height:32px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:#fff">${idx + 1}</div>
            <div><div style="font-size:14px;font-weight:700">${b.ph}</div>${b.hora ? `<div style="font-size:10px;opacity:.7">⏰ ${b.hora}</div>` : ""}</div>
          </div>
        </div>
        <div style="padding:16px 20px;background:#fff">
          ${b.ordenes ? `<div style="margin-bottom:10px"><div style="font-size:10px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">📋 Órdenes atendidas</div><div style="font-size:12px;color:#374151;line-height:1.7">${b.ordenes}</div></div>` : ""}
          ${b.hallazgos ? `<div style="margin-bottom:10px"><div style="font-size:10px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">🔍 Hallazgos</div><div style="font-size:12px;color:#374151;line-height:1.7">${b.hallazgos}</div></div>` : ""}
          ${b.accionesTomadas ? `<div style="margin-bottom:10px"><div style="font-size:10px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">⚙ Acciones tomadas</div><div style="font-size:12px;color:#374151;line-height:1.7">${b.accionesTomadas}</div></div>` : ""}
          ${b.recomendaciones ? `<div style="margin-bottom:10px"><div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:4px;padding:10px 14px"><div style="font-size:10px;font-weight:700;color:#1D4ED8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">💡 Recomendaciones</div><div style="font-size:12px;color:#1e40af;line-height:1.7">${b.recomendaciones}</div></div></div>` : ""}
          ${fotosHTML}
        </div>
      </div>`;
    }).join("");

    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/>
    <title>Diario de Campo — ${d.fecha}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700;800&display=swap');
      *{box-sizing:border-box;margin:0;padding:0} body{font-family:'IBM Plex Sans',Arial,sans-serif;color:#111;background:#fff;font-size:13px}
      .page{max-width:860px;margin:0 auto;padding:36px 44px}
      .header{display:flex;align-items:center;justify-content:space-between;padding-bottom:18px;border-bottom:3px solid #0D1726;margin-bottom:28px}
      .kpi-row{display:flex;gap:10px;margin-bottom:28px;flex-wrap:wrap}
      .kpi{flex:1;min-width:100px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px 14px;text-align:center}
      .kpi-val{font-size:24px;font-weight:800;color:#0D1726;line-height:1}
      .kpi-lbl{font-size:10px;color:#6b7280;margin-top:4px;font-weight:600;text-transform:uppercase;letter-spacing:.5px}
      .sec-label{font-size:11px;font-weight:700;color:#fff;background:#374151;padding:6px 14px;border-radius:3px;text-transform:uppercase;letter-spacing:.8px;margin:24px 0 12px;display:inline-block}
      .resumen-box{background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:16px 20px;font-size:13px;line-height:1.8;color:#374151;margin-bottom:24px;white-space:pre-wrap}
      .alerta-box{background:#FFF7ED;border:1px solid #FED7AA;border-left:4px solid #F97316;border-radius:6px;padding:14px 18px;margin-bottom:16px;font-size:12px;color:#C2410C;line-height:1.7}
      .pendiente-box{background:#F0FDF4;border:1px solid #BBF7D0;border-left:4px solid #22C55E;border-radius:6px;padding:14px 18px;margin-bottom:24px;font-size:12px;color:#15803D;line-height:1.7}
      @media print{.no-print{display:none!important}body{font-size:12px}.page{padding:20px 28px}}
    </style></head><body><div class="page">
    <div class="no-print" style="text-align:right;margin-bottom:20px">
      <button onclick="window.print()" style="background:#0D1726;color:#fff;border:none;padding:10px 28px;border-radius:6px;cursor:pointer;font-family:'IBM Plex Sans',sans-serif;font-size:13px;font-weight:600">🖨 Imprimir / Guardar PDF</button>
    </div>
    <div class="header">
      <div style="display:flex;align-items:center;gap:16px">
        <img src="${LOGO_B64}" alt="Logo" style="width:60px;height:60px;object-fit:contain"/>
        <div>
          <div style="font-size:16px;font-weight:800;color:#0D1726">Fundación Buenaventura</div>
          <div style="font-size:10px;color:#6b7280;font-family:monospace;margin-top:2px">DC&amp;S · Sistema de Gestión Integral</div>
        </div>
      </div>
      <div style="text-align:right">
        <div style="font-size:20px;font-weight:800;color:#0D1726">DIARIO DE CAMPO</div>
        <div style="font-size:13px;color:#2563EB;font-weight:600;margin-top:4px;text-transform:capitalize">${fechaDisplay}</div>
        <div style="font-size:11px;color:#6b7280;margin-top:3px">${d.autor}${d.horaInicio ? ` · ${d.horaInicio}${d.horaFin ? " — " + d.horaFin : ""}` : ""}</div>
      </div>
    </div>
    <div class="kpi-row">
      <div class="kpi"><div class="kpi-val">${d.bloques.length}</div><div class="kpi-lbl">PHs visitados</div></div>
      <div class="kpi"><div class="kpi-val">${d.bloques.filter(b => b.ordenes).length}</div><div class="kpi-lbl">Con órdenes</div></div>
      <div class="kpi"><div class="kpi-val">${d.bloques.reduce((a, b) => (b.fotos || []).length + a, 0)}</div><div class="kpi-lbl">Fotos totales</div></div>
      <div class="kpi"><div class="kpi-val">${d.bloques.filter(b => b.recomendaciones).length}</div><div class="kpi-lbl">Con recomend.</div></div>
    </div>
    <div class="sec-label">📝 Resumen del día</div>
    <div class="resumen-box">${d.resumen}</div>
    <div class="sec-label">🏢 PHs visitados (${d.bloques.length})</div>
    <div style="margin-top:16px">${bloquesHTML}</div>
    ${d.alertas ? `<div class="sec-label">🚨 Alertas</div><div class="alerta-box">${d.alertas}</div>` : ""}
    ${d.pendientes ? `<div class="sec-label">📌 Pendientes</div><div class="pendiente-box">${d.pendientes}</div>` : ""}
    <div style="text-align:right;margin-top:52px">
      <div style="display:inline-block;text-align:center">
        <div style="font-size:11px;color:#6b7280">Preparado y firmado por,</div>
        <div style="width:220px;border-top:1.5px solid #374151;margin:56px auto 8px"></div>
        <div style="font-size:14px;font-weight:700;color:#0D1726">${d.autor}</div>
        <div style="font-size:11px;color:#6b7280;margin-top:3px">Ingeniera · DC&amp;S · Fundación Buenaventura</div>
      </div>
    </div>
    <div style="margin-top:36px;padding-top:12px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;font-size:10px;color:#9ca3af">
      <span>DC&amp;S · Fundación Buenaventura · Diario de Campo</span><span>Generado el ${hoy}</span>
    </div>
    </div></body></html>`;

    const w = window.open("", "_blank", "width=900,height=700");
    w.document.write(html);
    w.document.close();
    w.onload = () => { w.focus(); w.print(); };
    addToast("Se abrió la vista de impresión — elige 'Guardar como PDF'");
  };

  const editarDiario = (d) => {
    setFormDiario({
      fecha: d.fecha, horaInicio: d.horaInicio || "", horaFin: d.horaFin || "",
      resumen: d.resumen || "", pendientes: d.pendientes || "", alertas: d.alertas || "",
      bloques: d.bloques || [],
    });
    setDiarioEditId(d.id);
    navTo("diarioCampo");
    addToast("Diario cargado para editar ✏");
  };

  const diariosFiltrados = diarios.filter(d => {
    if (diarFD && d.fecha < diarFD) return false;
    if (diarFH && d.fecha > diarFH) return false;
    if (diarPHF !== "Todos" && !(d.bloques || []).some(b => b.ph === diarPHF)) return false;
    return true;
  });

  return (
    <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <div style={{ ...s.card, background: `linear-gradient(135deg,${T.accentBase}12,${T.surfacePrimary})`, border: `1px solid ${T.accentBorder}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>📚</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary }}>Diarios de Campo</div>
              <div style={{ fontSize: 11, color: T.textTertiary, marginTop: 1 }}>
                {diarios.length} diario{diarios.length !== 1 ? "s" : ""} guardado{diarios.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
          {usuario.rol === "ingeniera" && (
            <button onClick={() => navTo("diarioCampo")} style={{ ...s.btnPrimary, padding: "9px 16px", fontSize: 12 }}>
              📓 Nuevo Diario
            </button>
          )}
        </div>
      </div>

      {/* Vacío */}
      {diarios.length === 0 && (
        <div style={{ ...s.card, textAlign: "center", padding: "52px 24px" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📓</div>
          <div style={{ fontSize: 13, color: T.textTertiary, marginBottom: 16 }}>No hay diarios guardados aún.</div>
          {usuario.rol === "ingeniera" && (
            <button onClick={() => navTo("diarioCampo")} style={{ ...s.btnPrimary, padding: "10px 20px", fontSize: 13 }}>Crear primer diario</button>
          )}
        </div>
      )}

      {/* Filtros */}
      <div style={{ ...s.card, padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary }}>Filtrar:</span>
          <select value={diarPHF} onChange={e => setDiarPHF(e.target.value)} style={{ ...s.input, padding: "5px 8px", fontSize: 12, flex: "1 1 140px", minWidth: 100 }}>
            <option value="Todos">Todos los PH</option>
            {PHS.map(ph => <option key={ph} value={ph}>{ph}</option>)}
          </select>
          <input type="date" value={diarFD} onChange={e => setDiarFD(e.target.value)} style={{ ...s.input, padding: "5px 8px", fontSize: 12, flex: "1 1 130px" }} title="Desde" />
          <input type="date" value={diarFH} onChange={e => setDiarFH(e.target.value)} style={{ ...s.input, padding: "5px 8px", fontSize: 12, flex: "1 1 130px" }} title="Hasta" />
          {(diarFD || diarFH || diarPHF !== "Todos") && (
            <button onClick={() => { setDiarFD(""); setDiarFH(""); setDiarPHF("Todos"); }} style={{ ...s.btnSecondary, padding: "5px 10px", fontSize: 11 }}>✕ Limpiar</button>
          )}
        </div>
      </div>

      {/* Lista de diarios */}
      {diariosFiltrados.map(d => {
        const fechaDisplay = new Date(d.fecha + "T00:00:00").toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
        return (
          <div key={d.id} style={{ ...s.card, borderLeft: `4px solid ${T.accentBase}` }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, textTransform: "capitalize", marginBottom: 4 }}>📓 {fechaDisplay}</div>
                <div style={{ fontSize: 11, color: T.textTertiary, fontFamily: "'IBM Plex Mono',monospace" }}>
                  {d.autor}{d.horaInicio ? ` · ${d.horaInicio}${d.horaFin ? " — " + d.horaFin : ""}` : ""} · {d.creadoEn}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                {d.alertas && <span style={{ fontSize: 10, background: T.dangerMuted, color: T.dangerText, border: `1px solid ${T.dangerBase}44`, padding: "4px 10px", borderRadius: 20, fontWeight: 700, cursor: "pointer" }} onClick={() => setDiarioPreview(d)}>🚨 Alerta</span>}
                <button onClick={() => setDiarioPreview(d)} style={{ ...s.btnSecondary, padding: "7px 12px", fontSize: 12 }}>👁 Ver</button>
                {usuario.rol === "ingeniera" && (
                  <button onClick={() => editarDiario(d)} style={{ ...s.btnSecondary, padding: "7px 12px", fontSize: 12 }}>✏ Editar</button>
                )}
                <button onClick={() => exportarDiarioPDF(d)} style={{ ...s.btnPrimary, padding: "7px 14px", fontSize: 12 }}>⬇ PDF</button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              {[
                { label: `${d.bloques.length} PH${d.bloques.length !== 1 ? "s" : ""} visitados`, color: T.accentBase, bg: T.accentMuted },
                { label: `${d.bloques.reduce((a, b) => (b.fotos || []).length + a, 0)} fotos`, color: "#7C3AED", bg: "#F5F3FF" },
                { label: `${d.bloques.filter(b => b.recomendaciones).length} recomend.`, color: T.successBase, bg: T.successMuted },
              ].map(k => (
                <span key={k.label} style={{ fontSize: 11, fontWeight: 600, background: k.bg, color: k.color, padding: "3px 10px", borderRadius: 4, border: `1px solid ${k.color}33` }}>{k.label}</span>
              ))}
            </div>

            <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.7, marginBottom: 12 }}>{d.resumen}</div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {d.bloques.map((b, i) => (
                <span key={i} style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 4, background: `${COLORES[i % COLORES.length]}14`, color: COLORES[i % COLORES.length], border: `1px solid ${COLORES[i % COLORES.length]}33` }}>
                  🏢 {b.ph}{b.hora ? ` · ${b.hora}` : ""}
                </span>
              ))}
            </div>

            {d.alertas && <div style={{ marginTop: 10, fontSize: 11, background: T.dangerMuted, border: `1px solid ${T.dangerBase}33`, borderRadius: 4, padding: "6px 10px", color: T.dangerText }}>🚨 <b>Alerta:</b> {d.alertas.slice(0, 120)}{d.alertas.length > 120 ? "…" : ""}</div>}
            {d.pendientes && <div style={{ marginTop: 6, fontSize: 11, background: T.successMuted, border: `1px solid ${T.successBase}33`, borderRadius: 4, padding: "6px 10px", color: T.successText }}>📌 <b>Pendiente:</b> {d.pendientes.slice(0, 120)}{d.pendientes.length > 120 ? "…" : ""}</div>}
          </div>
        );
      })}
    </div>
  );
}
