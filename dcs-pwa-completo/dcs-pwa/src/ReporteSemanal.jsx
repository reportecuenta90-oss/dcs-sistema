import { useState } from "react";
import { useApp } from "./AppContext";
import { useData } from "./DataContext";

export default function ReporteSemanal({ addToast, LOGO_B64 }) {
  const { T, s, usuario } = useApp();
  const { ordenes, reportes, incidencias, tecnicos, generando, setGenerando } = useData();

  const [offset, setOffset] = useState(0);

  // ── Calcular inicio y fin de semana seleccionada ──────────────────────────
  const hoy = new Date();
  const lunesActual = new Date(hoy);
  lunesActual.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
  lunesActual.setHours(0, 0, 0, 0);

  const lunes = new Date(lunesActual);
  lunes.setDate(lunesActual.getDate() + offset * 7);
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);
  domingo.setHours(23, 59, 59, 999);

  const enSemana = (fecha) => {
    if (!fecha) return false;
    const d = new Date(fecha);
    return d >= lunes && d <= domingo;
  };

  const fmtFecha = (d) => d.toLocaleDateString("es", { weekday: "short", day: "numeric", month: "short" });

  // ── Datos de la semana ────────────────────────────────────────────────────
  const ordenesSemana    = ordenes.filter(o => enSemana(o.fecha_creacion || o.created_at || o.fecha));
  const reportesSemana   = reportes.filter(r => enSemana(r.created_at || r.fecha));
  const incidenciasSemana = incidencias.filter(i => enSemana(i.created_at || i.fecha));

  const resueltas  = ordenesSemana.filter(o => o.estado === "Resuelto" || o.estado === "Cerrado");
  const enProceso  = ordenesSemana.filter(o => o.estado === "En proceso" || o.estado === "En revisión");
  const pendientes = ordenesSemana.filter(o => o.estado === "Pendiente");
  const emergencias = [...reportesSemana.filter(r => r.urgencia === "Emergencia"), ...incidenciasSemana.filter(i => i.urgencia === "Emergencia")];

  const tasaRes = ordenesSemana.length > 0 ? Math.round((resueltas.length / ordenesSemana.length) * 100) : 0;

  // Actividad por técnico
  const porTecnico = {};
  ordenesSemana.forEach(o => {
    const tec = o.tecnico || tecnicos.find(t => t.id === o.asignadoA)?.nombre || "Sin asignar";
    if (!porTecnico[tec]) porTecnico[tec] = { total: 0, resueltas: 0 };
    porTecnico[tec].total++;
    if (o.estado === "Resuelto" || o.estado === "Cerrado") porTecnico[tec].resueltas++;
  });

  // Novedades urgentes de conserjes
  const novedadesUrgentes = reportesSemana.filter(r => r.urgencia === "Urgente" || r.urgencia === "Emergencia");

  // ── Generar PDF ───────────────────────────────────────────────────────────
  const generarPDF = async () => {
    setGenerando(true);
    await new Promise(r => setTimeout(r, 300));
    try {
      const ahora = new Date();
      const fechaGen = ahora.toLocaleDateString("es", { year: "numeric", month: "long", day: "numeric" });
      const horaGen  = ahora.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
      const periodoStr = `${fmtFecha(lunes)} — ${fmtFecha(domingo)}`;

      const rowsOrdenes = ordenesSemana.slice(0, 50).map(o => `
        <tr>
          <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:11px;font-weight:600">${o.ph || "—"}</td>
          <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:11px">${o.tipo || "General"}</td>
          <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:11px">${(o.descripcion || "").slice(0, 50)}${(o.descripcion || "").length > 50 ? "…" : ""}</td>
          <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:10px">
            <span style="padding:2px 8px;border-radius:10px;font-weight:700;background:${o.estado === "Resuelto" || o.estado === "Cerrado" ? "#dcfce7" : o.estado === "En proceso" ? "#dbeafe" : "#fef9c3"};color:${o.estado === "Resuelto" || o.estado === "Cerrado" ? "#166534" : o.estado === "En proceso" ? "#1e40af" : "#854d0e"}">${o.estado || "Pendiente"}</span>
          </td>
          <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:11px;color:#64748b">${o.tecnico || tecnicos.find(t => t.id === o.asignadoA)?.nombre || "—"}</td>
        </tr>`).join("");

      const rowsNovedades = novedadesUrgentes.length > 0
        ? novedadesUrgentes.map(r => `
        <tr>
          <td style="padding:7px 10px;border-bottom:1px solid #fee2e2;font-size:11px;font-weight:700;color:${r.urgencia === "Emergencia" ? "#dc2626" : "#d97706"}">${r.urgencia === "Emergencia" ? "🚨" : "⚠️"} ${r.urgencia}</td>
          <td style="padding:7px 10px;border-bottom:1px solid #fee2e2;font-size:11px;font-weight:600">${r.conserje || r.autor || "—"}</td>
          <td style="padding:7px 10px;border-bottom:1px solid #fee2e2;font-size:11px">${(r.observacion || r.descripcion || "").slice(0, 80)}</td>
          <td style="padding:7px 10px;border-bottom:1px solid #fee2e2;font-size:11px;color:#64748b">${r.fecha || "—"}</td>
        </tr>`).join("")
        : `<tr><td colspan="4" style="padding:12px;text-align:center;color:#94a3b8;font-size:12px">Sin novedades urgentes esta semana ✓</td></tr>`;

      const rowsIncidencias = incidenciasSemana.length > 0
        ? incidenciasSemana.map(i => `
        <tr>
          <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:11px;font-weight:600">${i.calle || i.ubicacion || "—"}</td>
          <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:11px">${i.tipo || "—"}</td>
          <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:11px">${(i.descripcion || "").slice(0, 55)}</td>
          <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:10px">
            <span style="padding:2px 8px;border-radius:10px;font-weight:700;background:${i.estado === "Resuelto" ? "#dcfce7" : "#fee2e2"};color:${i.estado === "Resuelto" ? "#166534" : "#991b1b"}">${i.estado || "Activa"}</span>
          </td>
        </tr>`).join("")
        : `<tr><td colspan="4" style="padding:12px;text-align:center;color:#94a3b8;font-size:12px">Sin incidencias esta semana ✓</td></tr>`;

      const rowsTecnicos = Object.entries(porTecnico).sort((a, b) => b[1].total - a[1].total).map(([tec, d]) => {
        const tasa = d.total > 0 ? Math.round((d.resueltas / d.total) * 100) : 0;
        return `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-weight:600">${tec}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:center;font-weight:700;color:#2563eb">${d.total}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:center;color:#16a34a;font-weight:600">${d.resueltas}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:center">
            <span style="background:${tasa >= 80 ? "#f0fdf4" : "#fffbeb"};color:${tasa >= 80 ? "#15803d" : "#b45309"};padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700">${tasa}%</span>
          </td>
        </tr>`;
      }).join("");

      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
      <title>Reporte Semanal — ${periodoStr}</title>
      <style>
        body{font-family:'Segoe UI',Arial,sans-serif;margin:0;padding:0;color:#0f172a;background:#fff}
        .page{max-width:900px;margin:0 auto;padding:32px 28px}
        h2{font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.8px;margin:28px 0 12px;border-bottom:2px solid #f1f5f9;padding-bottom:6px}
        table{width:100%;border-collapse:collapse;margin-bottom:8px}
        th{padding:9px 12px;text-align:left;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.6px;background:#f8fafc;border-bottom:2px solid #e2e8f0}
        .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0}
        .kpi{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;text-align:center}
        .kpi-val{font-size:28px;font-weight:800;line-height:1}
        .kpi-lbl{font-size:10px;color:#64748b;margin-top:4px;text-transform:uppercase;letter-spacing:.5px}
        @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
      </style></head><body><div class="page">

        <!-- Encabezado -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;padding-bottom:20px;border-bottom:3px solid #0f172a">
          <div style="display:flex;align-items:center;gap:16px">
            ${LOGO_B64 ? `<img src="${LOGO_B64}" style="width:52px;height:52px;object-fit:contain" />` : ""}
            <div>
              <div style="font-size:22px;font-weight:800;color:#0f172a">Reporte Semanal</div>
              <div style="font-size:13px;color:#2563eb;font-weight:600;margin-top:2px">${periodoStr}</div>
              <div style="font-size:11px;color:#64748b;margin-top:2px">Buenaventura · Sistema DCS</div>
            </div>
          </div>
          <div style="text-align:right">
            <div style="font-size:10px;color:#94a3b8">Generado por</div>
            <div style="font-size:12px;font-weight:700;color:#0f172a">${usuario?.nombre || "—"}</div>
            <div style="font-size:10px;color:#94a3b8;margin-top:2px">${fechaGen} · ${horaGen}</div>
          </div>
        </div>

        <!-- KPIs -->
        <div class="kpi-grid">
          <div class="kpi" style="border-color:#bfdbfe">
            <div class="kpi-val" style="color:#2563eb">${ordenesSemana.length}</div>
            <div class="kpi-lbl">Órdenes</div>
          </div>
          <div class="kpi" style="border-color:#bbf7d0">
            <div class="kpi-val" style="color:#16a34a">${resueltas.length}</div>
            <div class="kpi-lbl">Resueltas</div>
          </div>
          <div class="kpi" style="border-color:#fde68a">
            <div class="kpi-val" style="color:#d97706">${pendientes.length}</div>
            <div class="kpi-lbl">Pendientes</div>
          </div>
          <div class="kpi" style="border-color:${tasaRes >= 80 ? "#bbf7d0" : "#fde68a"}">
            <div class="kpi-val" style="color:${tasaRes >= 80 ? "#16a34a" : "#d97706"}">${tasaRes}%</div>
            <div class="kpi-lbl">Tasa Resolución</div>
          </div>
        </div>

        <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr)">
          <div class="kpi" style="border-color:#c7d2fe">
            <div class="kpi-val" style="color:#4f46e5">${reportesSemana.length}</div>
            <div class="kpi-lbl">Reportes Conserjes</div>
          </div>
          <div class="kpi" style="border-color:#fecaca">
            <div class="kpi-val" style="color:#dc2626">${incidenciasSemana.length}</div>
            <div class="kpi-lbl">Incidencias Calle</div>
          </div>
          <div class="kpi" style="border-color:${emergencias.length > 0 ? "#fecaca" : "#bbf7d0"}">
            <div class="kpi-val" style="color:${emergencias.length > 0 ? "#dc2626" : "#16a34a"}">${emergencias.length}</div>
            <div class="kpi-lbl">Emergencias</div>
          </div>
        </div>

        <!-- Órdenes -->
        <h2>📋 Órdenes de la Semana (${ordenesSemana.length})</h2>
        ${ordenesSemana.length > 0 ? `
        <table>
          <thead><tr><th>PH</th><th>Tipo</th><th>Descripción</th><th>Estado</th><th>Técnico</th></tr></thead>
          <tbody>${rowsOrdenes}</tbody>
        </table>` : `<p style="color:#94a3b8;font-size:12px;text-align:center;padding:16px">Sin órdenes esta semana</p>`}

        <!-- Novedades urgentes -->
        <h2>⚠️ Novedades Urgentes de Conserjes (${novedadesUrgentes.length})</h2>
        <table>
          <thead><tr><th>Urgencia</th><th>Conserje</th><th>Novedad</th><th>Fecha</th></tr></thead>
          <tbody>${rowsNovedades}</tbody>
        </table>

        <!-- Incidencias -->
        <h2>🛣 Incidencias de Calle (${incidenciasSemana.length})</h2>
        <table>
          <thead><tr><th>Ubicación</th><th>Tipo</th><th>Descripción</th><th>Estado</th></tr></thead>
          <tbody>${rowsIncidencias}</tbody>
        </table>

        <!-- Técnicos -->
        ${Object.keys(porTecnico).length > 0 ? `
        <h2>👷 Actividad por Técnico</h2>
        <table>
          <thead><tr><th>Técnico</th><th style="text-align:center">Asignadas</th><th style="text-align:center">Resueltas</th><th style="text-align:center">Eficiencia</th></tr></thead>
          <tbody>${rowsTecnicos}</tbody>
        </table>` : ""}

        <!-- Pie -->
        <div style="margin-top:40px;padding-top:16px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:10px;color:#94a3b8">
          <span>Sistema de Gestión DCS · Buenaventura</span>
          <span>Reporte generado el ${fechaGen} a las ${horaGen}</span>
        </div>

      </div></body></html>`;

      const w = window.open("", "_blank");
      w.document.write(html);
      w.document.close();
      w.onload = () => { w.focus(); w.print(); };
      addToast("✅ Reporte semanal generado", "success");
    } catch (e) {
      console.error(e);
      addToast("Error al generar el reporte", "error");
    }
    setGenerando(false);
  };

  return (
    <div style={{ maxWidth: 680, display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ ...s.card, background: `linear-gradient(135deg,${T.successBase}10,${T.surfacePrimary})`, border: `1px solid ${T.successBase}44` }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: T.textPrimary, marginBottom: 4 }}>📋 Reporte Semanal</div>
        <div style={{ fontSize: 12, color: T.textTertiary }}>Resumen de actividad semanal — órdenes, novedades e incidencias.</div>
      </div>

      {/* Selector de semana */}
      <div style={{ ...s.card, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button onClick={() => setOffset(o => o - 1)} style={{ ...s.btnSecondary, padding: "8px 14px" }}>← Anterior</button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{fmtFecha(lunes)} — {fmtFecha(domingo)}</div>
          <div style={{ fontSize: 11, color: T.textTertiary, marginTop: 2 }}>{offset === 0 ? "Semana actual" : offset === -1 ? "Semana pasada" : `Hace ${Math.abs(offset)} semanas`}</div>
        </div>
        <button onClick={() => setOffset(o => Math.min(o + 1, 0))} disabled={offset === 0} style={{ ...s.btnSecondary, padding: "8px 14px", opacity: offset === 0 ? 0.4 : 1 }}>Siguiente →</button>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {[
          { val: ordenesSemana.length, lbl: "Órdenes", color: T.accentBase, muted: T.accentMuted },
          { val: resueltas.length, lbl: "Resueltas", color: T.successBase, muted: T.successMuted },
          { val: pendientes.length, lbl: "Pendientes", color: T.warningBase, muted: T.warningMuted },
          { val: `${tasaRes}%`, lbl: "Resolución", color: tasaRes >= 80 ? T.successBase : T.warningBase, muted: tasaRes >= 80 ? T.successMuted : T.warningMuted },
          { val: reportesSemana.length, lbl: "Reportes", color: T.accentBase, muted: T.accentMuted },
          { val: incidenciasSemana.length, lbl: "Incidencias", color: T.dangerBase, muted: T.dangerMuted },
        ].map((k, i) => (
          <div key={i} style={{ background: k.muted, border: `1px solid ${k.color}33`, borderRadius: 8, padding: "14px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.val}</div>
            <div style={{ fontSize: 10, color: k.color, fontWeight: 600, marginTop: 4, textTransform: "uppercase", letterSpacing: ".5px" }}>{k.lbl}</div>
          </div>
        ))}
      </div>

      {/* Emergencias si hay */}
      {emergencias.length > 0 && (
        <div style={{ background: T.dangerMuted, border: `1px solid ${T.dangerBase}44`, borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🚨</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.dangerText }}>¡{emergencias.length} emergencia{emergencias.length > 1 ? "s" : ""} esta semana!</div>
            <div style={{ fontSize: 11, color: T.dangerText, opacity: 0.8 }}>Revisar el detalle en el reporte.</div>
          </div>
        </div>
      )}

      {/* Botón generar */}
      <button
        onClick={generarPDF}
        disabled={generando}
        style={{ ...s.btnPrimary, width: "100%", padding: 14, fontSize: 14, background: `linear-gradient(135deg,${T.successBase},#15803d)`, opacity: generando ? 0.7 : 1 }}
      >
        {generando ? "⏳ Generando PDF..." : "📥 Generar Reporte Semanal PDF"}
      </button>
    </div>
  );
}
