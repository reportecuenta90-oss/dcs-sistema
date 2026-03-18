import React from "react";
import { useApp } from "./AppContext";
import { useData } from "./DataContext";

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

export default function ReporteJunta({ addToast, LOGO_B64 }) {
  const { T, s, usuario, isMobile } = useApp();
  const {
    ordenes, reportes, incidencias, repIng, tecnicos,
    mesRM, setMesRM, anioRM, setAnioRM,
    notaRM, setNotaRM, generando, setGenerando,
  } = useData();

  // ── Estados locales para financiero ────────────────────────────────────────
  const [finIngresos,  setFinIngresos]  = React.useState("");
  const [finEgresos,   setFinEgresos]   = React.useState("");
  const [finMorosidad, setFinMorosidad] = React.useState("");
  const [finBalance,   setFinBalance]   = React.useState("");
  const [finNota,      setFinNota]      = React.useState("");

  // ── Rango del mes ──────────────────────────────────────────────────────────
  const inicio = new Date(anioRM, mesRM, 1);
  const fin    = new Date(anioRM, mesRM + 1, 0, 23, 59, 59);
  const enMes  = (f) => { if (!f) return false; const d = new Date(f); return d >= inicio && d <= fin; };

  const inicioAnt = new Date(anioRM, mesRM - 1, 1);
  const finAnt    = new Date(anioRM, mesRM, 0, 23, 59, 59);
  const enMesAnt  = (f) => { if (!f) return false; const d = new Date(f); return d >= inicioAnt && d <= finAnt; };

  // ── Datos del mes ──────────────────────────────────────────────────────────
  const ordenesDelMes     = ordenes.filter(o => enMes(o.fecha_creacion || o.created_at));
  const ordenesAnt        = ordenes.filter(o => enMesAnt(o.fecha_creacion || o.created_at));
  const resueltas         = ordenesDelMes.filter(o => o.estado === "Resuelto" || o.estado === "Cerrado");
  const enProceso         = ordenesDelMes.filter(o => o.estado === "En proceso" || o.estado === "En revisión");
  const pendientes        = ordenesDelMes.filter(o => o.estado === "Pendiente");
  const reportesDelMes    = reportes.filter(r => enMes(r.created_at || r.fecha));
  const incidenciasDelMes = incidencias.filter(i => enMes(i.created_at || i.fecha));
  const reportesIngDelMes = repIng.filter(r => enMes(r.created_at || r.fecha));

  const tasaRes    = ordenesDelMes.length > 0 ? Math.round((resueltas.length / ordenesDelMes.length) * 100) : 0;
  const tasaResAnt = ordenesAnt.length > 0 ? Math.round((ordenesAnt.filter(o => o.estado === "Resuelto" || o.estado === "Cerrado").length / ordenesAnt.length) * 100) : 0;
  const diff       = tasaRes - tasaResAnt;

  const tiemposRes = resueltas.filter(o => o.fecha_creacion && o.updated_at).map(o => (new Date(o.updated_at) - new Date(o.fecha_creacion)) / (1000 * 60 * 60 * 24));
  const tiemProm   = tiemposRes.length > 0 ? (tiemposRes.reduce((a, b) => a + b, 0) / tiemposRes.length).toFixed(1) : "—";

  const porPH = {};
  ordenesDelMes.forEach(o => {
    const ph = o.ph || "Sin PH";
    if (!porPH[ph]) porPH[ph] = { total: 0, resueltas: 0, tipos: {} };
    porPH[ph].total++;
    if (o.estado === "Resuelto" || o.estado === "Cerrado") porPH[ph].resueltas++;
    const tipo = o.tipo || "General";
    porPH[ph].tipos[tipo] = (porPH[ph].tipos[tipo] || 0) + 1;
  });

  const porTecnico = {};
  ordenesDelMes.forEach(o => {
    const tec = o.tecnico || tecnicos.find(t => t.id === o.asignadoA)?.nombre || "Sin asignar";
    if (!porTecnico[tec]) porTecnico[tec] = { total: 0, resueltas: 0 };
    porTecnico[tec].total++;
    if (o.estado === "Resuelto" || o.estado === "Cerrado") porTecnico[tec].resueltas++;
  });

  const materialesUsados = [];
  reportesIngDelMes.forEach(r => {
    (r.materiales || []).forEach(m => {
      if (m.material) materialesUsados.push({ ...m, ph: r.ph || "", orden: r.orden_id || "" });
    });
  });

  const criticas = ordenesDelMes.filter(o =>
    o.urgencia === "Emergencia" || (o.estado === "Pendiente" && o.fecha_creacion && (new Date() - new Date(o.fecha_creacion)) > 7 * 24 * 60 * 60 * 1000)
  );

  // ── Generar PDF ────────────────────────────────────────────────────────────
  const generarPDF = async () => {
    setGenerando(true);
    await new Promise(r => setTimeout(r, 300));
    try {
      const ahora   = new Date();
      const fechaGen = ahora.toLocaleDateString("es", { year: "numeric", month: "long", day: "numeric" });
      const horaGen  = ahora.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
      const mesLabel = MESES[mesRM];

      // SVG barras
      const barData = [
        { lbl: "Resueltas", val: resueltas.length, color: "#16a34a" },
        { lbl: "En proceso", val: enProceso.length, color: "#2563eb" },
        { lbl: "Pendientes", val: pendientes.length, color: "#d97706" },
      ];
      const maxVal = Math.max(...barData.map(b => b.val), 1);
      const barSVG = `<svg width="320" height="120" xmlns="http://www.w3.org/2000/svg">
        ${barData.map((b, i) => {
          const barH = Math.round((b.val / maxVal) * 80);
          const x = 20 + i * 100;
          return `<rect x="${x}" y="${100 - barH}" width="60" height="${barH}" rx="4" fill="${b.color}" opacity="0.9"/>
          <text x="${x + 30}" y="115" text-anchor="middle" font-size="9" fill="#64748b" font-family="Arial">${b.lbl}</text>
          <text x="${x + 30}" y="${95 - barH}" text-anchor="middle" font-size="11" font-weight="700" fill="${b.color}" font-family="Arial">${b.val}</text>`;
        }).join("")}
      </svg>`;

      // SVG donut
      const pct = tasaRes / 100;
      const r2 = 40, cx = 50, cy = 50, circ = 2 * Math.PI * r2;
      const donutSVG = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${cx}" cy="${cy}" r="${r2}" fill="none" stroke="#e2e8f0" stroke-width="12"/>
        <circle cx="${cx}" cy="${cy}" r="${r2}" fill="none" stroke="${tasaRes >= 80 ? "#16a34a" : tasaRes >= 50 ? "#d97706" : "#dc2626"}" stroke-width="12"
          stroke-dasharray="${circ * pct} ${circ * (1 - pct)}" stroke-dashoffset="${circ * 0.25}" stroke-linecap="round"/>
        <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="14" font-weight="800" fill="#0f172a" font-family="Arial">${tasaRes}%</text>
      </svg>`;

      // Rows tablas
      const rowsPH = Object.entries(porPH).sort((a, b) => b[1].total - a[1].total).map(([ph, d]) => {
        const tasa = d.total > 0 ? Math.round((d.resueltas / d.total) * 100) : 0;
        return `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-weight:600;color:#0f172a">${ph}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:center;font-weight:700;color:#2563eb">${d.total}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:center;color:#16a34a;font-weight:600">${d.resueltas}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:center;color:#d97706;font-weight:600">${d.total - d.resueltas}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:center">
            <span style="background:${tasa >= 80 ? "#f0fdf4" : tasa >= 50 ? "#fffbeb" : "#fef2f2"};color:${tasa >= 80 ? "#15803d" : tasa >= 50 ? "#b45309" : "#b91c1c"};padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700">${tasa}%</span>
          </td>
        </tr>`;
      }).join("");

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

      const rowsCriticas = criticas.length > 0 ? criticas.map(o => `
        <tr>
          <td style="padding:7px 10px;border-bottom:1px solid #fee2e2;font-size:11px;font-weight:600;color:#dc2626">${o.urgencia === "Emergencia" ? "🚨" : "⏰"}</td>
          <td style="padding:7px 10px;border-bottom:1px solid #fee2e2;font-size:11px;font-weight:600">${o.ph || "—"}</td>
          <td style="padding:7px 10px;border-bottom:1px solid #fee2e2;font-size:11px">${o.tipo || "General"}</td>
          <td style="padding:7px 10px;border-bottom:1px solid #fee2e2;font-size:11px">${(o.descripcion || "").slice(0, 60)}</td>
          <td style="padding:7px 10px;border-bottom:1px solid #fee2e2;font-size:11px;color:#64748b">${o.estado}</td>
        </tr>`).join("")
        : `<tr><td colspan="5" style="padding:12px;text-align:center;color:#94a3b8;font-size:12px">Sin órdenes críticas este mes ✓</td></tr>`;

      const rowsEnProceso = enProceso.length > 0 ? enProceso.map(o => `
        <tr>
          <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:11px;font-weight:600">${o.ph || "—"}</td>
          <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:11px">${o.tipo || "General"}</td>
          <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:11px">${(o.descripcion || "").slice(0, 50)}</td>
          <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:11px;color:#64748b">${o.tecnico || tecnicos.find(t => t.id === o.asignadoA)?.nombre || "—"}</td>
          <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:10px">
            <span style="padding:2px 8px;border-radius:10px;font-weight:700;background:#dbeafe;color:#1e40af">${o.estado}</span>
          </td>
        </tr>`).join("")
        : `<tr><td colspan="5" style="padding:12px;text-align:center;color:#94a3b8;font-size:12px">Sin actividades en proceso este mes</td></tr>`;

      // Tipos de mantenimiento
      const porTipo = {};
      ordenesDelMes.forEach(o => {
        const tipo = o.tipo || "General";
        if (!porTipo[tipo]) porTipo[tipo] = { total: 0, resueltas: 0 };
        porTipo[tipo].total++;
        if (o.estado === "Resuelto" || o.estado === "Cerrado") porTipo[tipo].resueltas++;
      });
      const rowsTipos = Object.entries(porTipo).sort((a, b) => b[1].total - a[1].total).map(([tipo, d]) => {
        const tasa = d.total > 0 ? Math.round((d.resueltas / d.total) * 100) : 0;
        return `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-weight:600">${tipo}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:center;font-weight:700;color:#2563eb">${d.total}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:center;color:#16a34a;font-weight:600">${d.resueltas}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:center;color:#d97706;font-weight:600">${d.total - d.resueltas}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:center">
            <span style="background:${tasa >= 80 ? "#f0fdf4" : "#fffbeb"};color:${tasa >= 80 ? "#15803d" : "#b45309"};padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700">${tasa}%</span>
          </td>
        </tr>`;
      }).join("");

      const rowsMateriales = materialesUsados.length > 0 ? materialesUsados.map(m => `
        <tr>
          <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:11px;font-weight:600">${m.material}</td>
          <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:11px;text-align:center">${m.cantidad || "—"} ${m.unidad || ""}</td>
          <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:11px">${m.area || "—"}</td>
          <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:11px;color:#64748b">${m.ph}</td>
        </tr>`).join("")
        : `<tr><td colspan="4" style="padding:12px;text-align:center;color:#94a3b8;font-size:12px">Sin materiales registrados este mes</td></tr>`;

      // Secciones condicionales
      const secFinanciero = `
        <div class="section">
          <div class="sec-header">
            <div class="sec-icon" style="background:#f0fdf4">💰</div>
            <div>
              <div class="sec-title">Informe Financiero</div>
              <div class="sec-subtitle">${mesLabel} ${anioRM} · ${finIngresos || finEgresos ? "Datos ingresados por administración" : "Pendiente de integración con Munily"}</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-bottom:16px">
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:18px">
              <div style="font-size:10px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px">Ingresos del mes</div>
              <div style="font-size:26px;font-weight:800;color:#15803d">${finIngresos || "—"}</div>
              <div style="font-size:11px;color:#64748b;margin-top:4px">Cuotas y otros ingresos</div>
            </div>
            <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:18px">
              <div style="font-size:10px;font-weight:700;color:#b91c1c;text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px">Egresos del mes</div>
              <div style="font-size:26px;font-weight:800;color:#b91c1c">${finEgresos || "—"}</div>
              <div style="font-size:11px;color:#64748b;margin-top:4px">Operación · Mantenimiento · Personal</div>
            </div>
            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:18px">
              <div style="font-size:10px;font-weight:700;color:#1d4ed8;text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px">Balance del mes</div>
              <div style="font-size:26px;font-weight:800;color:#1d4ed8">${finBalance || "—"}</div>
              <div style="font-size:11px;color:#64748b;margin-top:4px">Resultado neto del período</div>
            </div>
            <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:18px">
              <div style="font-size:10px;font-weight:700;color:#b45309;text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px">Morosidad</div>
              <div style="font-size:26px;font-weight:800;color:#b45309">${finMorosidad || "—"}</div>
              <div style="font-size:11px;color:#64748b;margin-top:4px">Unidades con cuota pendiente</div>
            </div>
          </div>
          ${finNota ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px 20px">
            <div style="font-size:10px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px">Nota financiera</div>
            <div style="font-size:13px;color:#78350f;line-height:1.7;white-space:pre-wrap">${finNota}</div>
          </div>` : ""}
        </div>`;

      const secBitacora = reportesDelMes.length > 0 ? `
        <div class="section">
          <div class="sec-header"><div class="sec-icon" style="background:#fdf4ff">📋</div>
            <div><div class="sec-title">Bitácora de Conserjes</div>
            <div class="sec-subtitle">${reportesDelMes.length} entradas en ${mesLabel}</div></div>
          </div>
          <table><thead><tr><th>Conserje</th><th>PH</th><th>Fecha</th><th>Turno</th><th style="text-align:center">Incidente</th></tr></thead>
          <tbody>${reportesDelMes.map(r => `<tr>
            <td style="font-weight:600">${r.conserje || "—"}</td>
            <td>${r.ph}</td><td>${r.fecha}</td><td>${r.turno || "—"}</td>
            <td style="text-align:center">${r.huboIncidente || r.novedad
              ? '<span style="background:#fee2e2;color:#be123c;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700">⚠ Sí</span>'
              : '<span style="background:#dcfce7;color:#15803d;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700">No</span>'}</td>
          </tr>`).join("")}
          </tbody></table>
        </div>` : "";

      const secIncidencias = incidenciasDelMes.length > 0 ? `
        <div class="section">
          <div class="sec-header"><div class="sec-icon" style="background:#fff7ed">🚧</div>
            <div><div class="sec-title">Incidencias en Vía Pública</div>
            <div class="sec-subtitle">${incidenciasDelMes.length} reportada(s)</div></div>
          </div>
          ${incidenciasDelMes.map(i => `<div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid #f1f5f9">
            <div style="width:8px;height:8px;border-radius:50%;background:#C9A84C;margin-top:5px;flex-shrink:0"></div>
            <div style="flex:1">
              <div style="font-size:12px;font-weight:600">${i.tipo || i.descripcion || "Incidencia"}</div>
              <div style="font-size:11px;color:#64748b;margin-top:2px">${i.ph || ""} · ${i.fecha || ""}</div>
            </div>
            <span style="background:${i.estado === "Resuelto" ? "#dcfce7" : "#fef9c3"};color:${i.estado === "Resuelto" ? "#15803d" : "#92400e"};padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700">${i.estado || "Pendiente"}</span>
          </div>`).join("")}
        </div>` : "";

      const notasHTML = notaRM.trim() ? `
        <div style="margin-top:32px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:20px 24px">
          <div style="font-size:11px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px">📝 Observaciones adicionales</div>
          <div style="font-size:13px;color:#78350f;line-height:1.8;white-space:pre-wrap">${notaRM.trim()}</div>
        </div>` : "";

      const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<title>Reporte Junta Directiva — ${mesLabel} ${anioRM}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=IBM+Plex+Sans:wght@300;400;500;600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'IBM Plex Sans',Arial,sans-serif;color:#1a1a2e;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .page{max-width:900px;margin:0 auto}

  .cover{background:linear-gradient(160deg,#0D1726 0%,#162035 45%,#1a2d4a 100%);min-height:297mm;display:flex;flex-direction:column;justify-content:space-between;padding:60px 64px;position:relative;overflow:hidden;page-break-after:always}
  .cover::before{content:"";position:absolute;top:-80px;right:-80px;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(180,140,60,0.15) 0%,transparent 70%)}
  .cover-logo{width:80px;height:80px;object-fit:contain;background:rgba(255,255,255,0.06);border-radius:12px;padding:8px}
  .cover-brand-sub{font-size:12px;font-weight:300;opacity:.55;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;color:#fff}
  .cover-brand-name{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;line-height:1.1;color:#fff}
  .cover-brand-name span{color:#C9A84C}
  .cover-divider{width:80px;height:2px;background:linear-gradient(90deg,#C9A84C,transparent);margin:40px 0}
  .cover-title-label{font-size:11px;letter-spacing:3px;text-transform:uppercase;opacity:.5;font-weight:400;margin-bottom:12px;color:#fff}
  .cover-title-main{font-family:'Playfair Display',serif;font-size:48px;font-weight:800;line-height:1;margin-bottom:8px;color:#fff}
  .cover-title-main span{color:#C9A84C;display:block;font-size:52px}
  .cover-title-sub{font-size:16px;font-weight:300;opacity:.7;margin-top:8px;color:#fff}
  .cover-meta{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border-top:1px solid rgba(201,168,76,0.3);padding-top:32px;margin-top:40px}
  .cover-meta-label{font-size:9px;letter-spacing:2px;text-transform:uppercase;opacity:.4;margin-bottom:6px;color:#fff}
  .cover-meta-value{font-size:15px;font-weight:600;color:#fff}
  .cover-meta-value span{color:#C9A84C}
  .cover-confidential{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(201,168,76,0.6);border:1px solid rgba(201,168,76,0.2);padding:4px 12px;border-radius:3px}
  .cover-prepared{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.35)}

  .content{padding:48px 64px}
  .section{margin-bottom:40px;page-break-inside:avoid}
  .sec-header{display:flex;align-items:center;gap:14px;margin-bottom:20px;padding-bottom:12px;border-bottom:2px solid #f1f5f9}
  .sec-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
  .sec-title{font-size:17px;font-weight:700;color:#0D1726}
  .sec-subtitle{font-size:11px;color:#94a3b8;margin-top:2px}

  .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:16px}
  .kpi{border-radius:10px;padding:18px;border:1px solid #e2e8f0}
  .kpi-val{font-size:32px;font-weight:800;line-height:1;margin-bottom:4px}
  .kpi-lbl{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;opacity:.6}
  .kpi-sub{font-size:10px;margin-top:4px;opacity:.5}
  .kpi.gold{background:#fefce8;border-color:#fde68a}.kpi.gold .kpi-val{color:#92400e}
  .kpi.green{background:#f0fdf4;border-color:#bbf7d0}.kpi.green .kpi-val{color:#15803d}
  .kpi.blue{background:#eff6ff;border-color:#bfdbfe}.kpi.blue .kpi-val{color:#1d4ed8}
  .kpi.red{background:#fff1f2;border-color:#fecdd3}.kpi.red .kpi-val{color:#be123c}
  .kpi.purple{background:#faf5ff;border-color:#e9d5ff}.kpi.purple .kpi-val{color:#7c3aed}
  .kpi.slate{background:#f8fafc;border-color:#e2e8f0}.kpi.slate .kpi-val{color:#0f172a}

  .chart-area{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px;display:grid;grid-template-columns:1fr auto;gap:24px;align-items:center}

  table{width:100%;border-collapse:collapse;margin-top:12px;font-size:12px}
  th{background:#0D1726;color:#fff;padding:9px 12px;text-align:left;font-size:10px;font-weight:600;letter-spacing:.5px;text-transform:uppercase}
  th:first-child{border-radius:6px 0 0 6px}th:last-child{border-radius:0 6px 6px 0}
  td{padding:9px 12px;border-bottom:1px solid #f1f5f9}
  tr:last-child td{border-bottom:none}
  tr:nth-child(even) td{background:#f8fafc}

  .firma-section{margin-top:60px;padding-top:32px;border-top:1px solid #e2e8f0;display:grid;grid-template-columns:1fr 1fr;gap:40px}
  .firma-box{text-align:center}
  .firma-line{border-top:1.5px solid #0D1726;margin:48px auto 8px;width:200px}
  .firma-name{font-size:13px;font-weight:700;color:#0D1726}
  .firma-title{font-size:11px;color:#94a3b8;margin-top:3px}
  .doc-footer{margin-top:32px;padding:16px 20px;background:#f8fafc;border-radius:8px;display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#94a3b8}

  @media print{.cover{-webkit-print-color-adjust:exact;print-color-adjust:exact}.section{page-break-inside:avoid}}
</style>
</head>
<body>

<!-- PORTADA -->
<div class="cover">
  <div>
    <div style="display:flex;align-items:center;gap:20px">
      <img src="${LOGO_B64}" class="cover-logo" alt="Logo"/>
      <div>
        <div class="cover-brand-sub">Gestión de Propiedades</div>
        <div class="cover-brand-name">Fundación Administradora<br><span>BUENAVENTURA</span></div>
      </div>
    </div>
    <div class="cover-divider"></div>
    <div>
      <div class="cover-title-label">Informe Oficial</div>
      <div class="cover-title-main">Reporte<span>Junta Directiva</span></div>
      <div class="cover-title-sub">Financiero · Actividades · Proyectos en Proceso · Mantenimiento</div>
    </div>
  </div>
  <div>
    <div class="cover-meta">
      <div style="padding:0 24px 0 0">
        <div class="cover-meta-label">Período</div>
        <div class="cover-meta-value"><span>${mesLabel}</span> ${anioRM}</div>
      </div>
      <div style="padding:0 24px 0 0">
        <div class="cover-meta-label">Audiencia</div>
        <div class="cover-meta-value"><span>Junta Directiva</span> y Residentes</div>
      </div>
      <div>
        <div class="cover-meta-label">Generado el</div>
        <div class="cover-meta-value">${fechaGen}</div>
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:32px">
      <div class="cover-prepared">Preparado por: ${usuario.nombre} · DC&amp;S Sistema de Gestión</div>
      <div class="cover-confidential">Junta Directiva · Residentes</div>
    </div>
  </div>
</div>

<!-- CONTENIDO -->
<div class="content">

  <!-- 1. INFORME FINANCIERO -->
  ${secFinanciero}

  <!-- 2. RESUMEN EJECUTIVO -->
  <div class="section">
    <div class="sec-header">
      <div class="sec-icon" style="background:#fef9c3">📊</div>
      <div>
        <div class="sec-title">Reporte de Actividades</div>
        <div class="sec-subtitle">Indicadores clave — ${mesLabel} ${anioRM}</div>
      </div>
    </div>
    <div class="kpi-grid">
      <div class="kpi blue"><div class="kpi-val">${ordenesDelMes.length}</div><div class="kpi-lbl">Total Asignaciones</div><div class="kpi-sub">Durante el mes</div></div>
      <div class="kpi green"><div class="kpi-val">${resueltas.length}</div><div class="kpi-lbl">Completadas</div><div class="kpi-sub">Tasa: ${tasaRes}%</div></div>
      <div class="kpi gold"><div class="kpi-val">${enProceso.length + pendientes.length}</div><div class="kpi-lbl">En Gestión</div><div class="kpi-sub">${enProceso.length} proceso · ${pendientes.length} pend.</div></div>
      <div class="kpi red"><div class="kpi-val">${incidenciasDelMes.length}</div><div class="kpi-lbl">Incidencias</div><div class="kpi-sub">Reportadas en calle</div></div>
    </div>
    <div class="kpi-grid">
      <div class="kpi purple"><div class="kpi-val">${reportesDelMes.length}</div><div class="kpi-lbl">Bitácora Conserjes</div></div>
      <div class="kpi slate"><div class="kpi-val">${reportesIngDelMes.length}</div><div class="kpi-lbl">Visitas Técnicas</div></div>
      <div class="kpi slate"><div class="kpi-val">${materialesUsados.length}</div><div class="kpi-lbl">Materiales Usados</div></div>
      <div class="kpi slate"><div class="kpi-val">${tiemProm}</div><div class="kpi-lbl">Días Prom. Resolución</div></div>
    </div>
  </div>

  <!-- GRÁFICAS -->
  <div class="section">
    <div class="sec-header">
      <div class="sec-icon" style="background:#f0fdf4">📈</div>
      <div><div class="sec-title">Análisis de Desempeño</div><div class="sec-subtitle">Distribución de órdenes y tasa de resolución</div></div>
    </div>
    <div class="chart-area">
      <div>
        <div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.8px;margin-bottom:14px">Distribución por Estado</div>
        ${barSVG}
      </div>
      <div style="text-align:center">
        <div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px">Tasa de Resolución</div>
        ${donutSVG}
        <div style="font-size:12px;color:${diff >= 0 ? "#16a34a" : "#dc2626"};font-weight:700;margin-top:6px">${diff >= 0 ? "↑" : "↓"} ${Math.abs(diff)}% vs mes anterior</div>
      </div>
    </div>
  </div>

  <!-- ACTIVIDADES POR PH -->
  <div class="section">
    <div class="sec-header">
      <div class="sec-icon" style="background:#faf5ff">🏢</div>
      <div><div class="sec-title">Actividades por Proyecto</div><div class="sec-subtitle">Resumen por PH — ${mesLabel} ${anioRM}</div></div>
    </div>
    <table>
      <thead><tr><th>Proyecto PH</th><th style="text-align:center">Órdenes</th><th style="text-align:center">Resueltas</th><th style="text-align:center">Pendientes</th><th style="text-align:center">Resolución</th></tr></thead>
      <tbody>${rowsPH || `<tr><td colspan="5" style="padding:12px;text-align:center;color:#94a3b8;font-size:12px">Sin actividades este mes</td></tr>`}</tbody>
    </table>
  </div>

  <!-- ACTIVIDADES POR TÉCNICO -->
  <div class="section">
    <div class="sec-header">
      <div class="sec-icon" style="background:#eff6ff">👷</div>
      <div><div class="sec-title">Actividad por Técnico</div><div class="sec-subtitle">Desempeño del equipo — ${mesLabel} ${anioRM}</div></div>
    </div>
    <table>
      <thead><tr><th>Técnico</th><th style="text-align:center">Total</th><th style="text-align:center">Completadas</th><th style="text-align:center">Eficiencia</th></tr></thead>
      <tbody>${rowsTecnicos || `<tr><td colspan="4" style="padding:12px;text-align:center;color:#94a3b8;font-size:12px">Sin técnicos asignados</td></tr>`}</tbody>
    </table>
  </div>

  <!-- 3. ACTIVIDADES EN PROCESO -->
  <div class="section">
    <div class="sec-header">
      <div class="sec-icon" style="background:#fffbeb">⚙️</div>
      <div><div class="sec-title">Actividades en Proceso</div><div class="sec-subtitle">${enProceso.length} asignación(es) activa(s) actualmente</div></div>
    </div>
    <table>
      <thead><tr><th>Proyecto PH</th><th>Tipo</th><th>Descripción</th><th>Técnico</th><th style="text-align:center">Estado</th></tr></thead>
      <tbody>${rowsEnProceso}</tbody>
    </table>
  </div>

  <!-- ÓRDENES QUE REQUIEREN ATENCIÓN -->
  ${criticas.length > 0 ? `
  <div class="section">
    <div class="sec-header">
      <div class="sec-icon" style="background:#fff1f2">🚨</div>
      <div><div class="sec-title">Órdenes que Requieren Atención</div><div class="sec-subtitle">${criticas.length} elemento(s) crítico(s)</div></div>
    </div>
    <table>
      <thead><tr><th>Tipo</th><th>PH</th><th>Descripción</th><th>Descripción</th><th style="text-align:center">Estado</th></tr></thead>
      <tbody>${rowsCriticas}</tbody>
    </table>
  </div>` : ""}

  <!-- 4. PROYECTOS DE MANTENIMIENTO -->
  <div class="section">
    <div class="sec-header">
      <div class="sec-icon" style="background:#f0fdf4">🔧</div>
      <div><div class="sec-title">Proyectos de Mantenimiento y Reparación</div><div class="sec-subtitle">Resumen por tipo de trabajo — ${mesLabel} ${anioRM}</div></div>
    </div>
    <table>
      <thead><tr><th>Tipo de Trabajo</th><th style="text-align:center">Total</th><th style="text-align:center">Completados</th><th style="text-align:center">Pendientes</th><th style="text-align:center">Avance</th></tr></thead>
      <tbody>${rowsTipos || `<tr><td colspan="5" style="padding:12px;text-align:center;color:#94a3b8;font-size:12px">Sin proyectos este mes</td></tr>`}</tbody>
    </table>
  </div>

  <!-- MATERIALES -->
  ${materialesUsados.length > 0 ? `
  <div class="section">
    <div class="sec-header">
      <div class="sec-icon" style="background:#f0fdf4">📦</div>
      <div><div class="sec-title">Materiales e Insumos Utilizados</div></div>
    </div>
    <table>
      <thead><tr><th>Material</th><th style="text-align:center">Cantidad</th><th>Área</th><th>PH</th></tr></thead>
      <tbody>${rowsMateriales}</tbody>
    </table>
  </div>` : ""}

  <!-- BITÁCORA CONSERJES -->
  ${secBitacora}

  <!-- INCIDENCIAS -->
  ${secIncidencias}

  ${notasHTML}

  <!-- FIRMA -->
  <div class="firma-section">
    <div class="firma-box">
      <div class="firma-line"></div>
      <div class="firma-name">${usuario.nombre}</div>
      <div class="firma-title">${usuario.rol === "ingeniera" ? "Ingeniera · DC&S" : "Administración · DC&S"}</div>
      <div class="firma-title" style="margin-top:2px">Fundación Administradora Buenaventura</div>
    </div>
    <div class="firma-box">
      <div class="firma-line"></div>
      <div class="firma-name">Junta Directiva</div>
      <div class="firma-title">Fundación Administradora Buenaventura</div>
      <div class="firma-title" style="margin-top:2px">Visto Bueno · ${mesLabel} ${anioRM}</div>
    </div>
  </div>

  <div class="doc-footer">
    <div style="display:flex;align-items:center;gap:10px">
      <img src="${LOGO_B64}" style="width:22px;height:22px;object-fit:contain;opacity:.5"/>
      <span>Fundación Administradora Buenaventura · DC&amp;S Sistema de Gestión</span>
    </div>
    <span>Generado: ${fechaGen} a las ${horaGen}</span>
  </div>

</div>
</body></html>`;

      const w = window.open("", "_blank");
      w.document.write(html);
      w.document.close();
      w.onload = () => { w.focus(); w.print(); };
      addToast("✅ Reporte Junta Directiva generado", "success");
      setGenerando(false);
    } catch (e) {
      console.error(e);
      setGenerando(false);
    }
  };

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: isMobile ? "12px" : "24px", maxWidth: 720, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#0D1726,#1e3a5f)", borderRadius: 12, padding: isMobile ? "20px" : "28px", color: "#fff", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>🏛</span>
          <div>
            <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 800 }}>Reporte Junta Directiva y Residentes</div>
            <div style={{ fontSize: 12, opacity: .6, marginTop: 2 }}>Informe mensual oficial · Financiero, Actividades, Proyectos y Mantenimiento</div>
          </div>
        </div>
      </div>

      {/* Selector de mes */}
      <div style={{ ...s.card, marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.textSecondary, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 12 }}>📅 Período del reporte</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={s.label}>Mes</label>
            <select value={mesRM} onChange={e => setMesRM(+e.target.value)} style={{ ...s.select, width: "100%" }}>
              {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={s.label}>Año</label>
            <select value={anioRM} onChange={e => setAnioRM(+e.target.value)} style={{ ...s.select, width: "100%" }}>
              {[anioRM - 1, anioRM, anioRM + 1].map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Informe Financiero */}
      <div style={{ ...s.card, marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.textSecondary, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 4 }}>💰 Informe Financiero</div>
        <div style={{ fontSize: 11, color: T.textTertiary, marginBottom: 14 }}>Ingresa los datos manualmente · Cuando Munily active la API se llenará automático</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={s.label}>Ingresos del mes</label>
            <input value={finIngresos} onChange={e => setFinIngresos(e.target.value)} placeholder="Ej: $48,250.00" style={{ ...s.input }} />
          </div>
          <div>
            <label style={s.label}>Egresos del mes</label>
            <input value={finEgresos} onChange={e => setFinEgresos(e.target.value)} placeholder="Ej: $31,780.00" style={{ ...s.input }} />
          </div>
          <div>
            <label style={s.label}>Balance neto</label>
            <input value={finBalance} onChange={e => setFinBalance(e.target.value)} placeholder="Ej: $16,470.00" style={{ ...s.input }} />
          </div>
          <div>
            <label style={s.label}>Morosidad</label>
            <input value={finMorosidad} onChange={e => setFinMorosidad(e.target.value)} placeholder="Ej: 18% · 7 unidades" style={{ ...s.input }} />
          </div>
        </div>
        <label style={s.label}>Nota financiera (opcional)</label>
        <textarea value={finNota} onChange={e => setFinNota(e.target.value)} placeholder="Observaciones sobre el estado financiero del mes..." rows={2} style={{ ...s.input, resize: "vertical", lineHeight: 1.6 }} />
      </div>

      {/* Resumen en tiempo real */}
      <div style={{ ...s.card, marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.textSecondary, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 14 }}>📈 Resumen — {MESES[mesRM]} {anioRM}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 10 }}>
          {[
            { val: ordenesDelMes.length, lbl: "Órdenes", color: "#2563eb", bg: "#eff6ff" },
            { val: resueltas.length, lbl: "Resueltas", color: "#16a34a", bg: "#f0fdf4" },
            { val: enProceso.length, lbl: "En proceso", color: "#d97706", bg: "#fffbeb" },
            { val: pendientes.length, lbl: "Pendientes", color: "#dc2626", bg: "#fef2f2" },
            { val: reportesDelMes.length, lbl: "Conserjes", color: "#7c3aed", bg: "#f5f3ff" },
            { val: incidenciasDelMes.length, lbl: "Incidencias", color: "#0891b2", bg: "#ecfeff" },
          ].map((k, i) => (
            <div key={i} style={{ background: k.bg, borderRadius: 8, padding: "12px", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.val}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: k.color, opacity: .7, marginTop: 4, textTransform: "uppercase", letterSpacing: ".4px" }}>{k.lbl}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: tasaRes >= 80 ? T.successMuted : tasaRes >= 50 ? "#fffbeb" : T.dangerMuted, borderRadius: 8, padding: "10px 14px" }}>
          <span style={{ fontSize: 18 }}>{tasaRes >= 80 ? "✅" : tasaRes >= 50 ? "⚠️" : "🔴"}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: tasaRes >= 80 ? T.successText : tasaRes >= 50 ? "#b45309" : T.dangerText }}>Tasa de resolución: {tasaRes}%</div>
            <div style={{ fontSize: 11, color: T.textTertiary }}>Tiempo promedio: {tiemProm} días · {diff >= 0 ? "↑" : "↓"} {Math.abs(diff)}% vs mes anterior</div>
          </div>
        </div>
      </div>

      {/* Observaciones */}
      <div style={{ ...s.card, marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.textSecondary, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 8 }}>📝 Observaciones <span style={{ fontWeight: 400, textTransform: "none", fontSize: 11 }}>(opcional)</span></div>
        <textarea value={notaRM} onChange={e => setNotaRM(e.target.value)} placeholder="Notas adicionales para incluir en el reporte..." rows={3} style={{ ...s.input, width: "100%", resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }} />
      </div>

      {/* Botón generar */}
      <button
        onClick={generarPDF}
        disabled={generando}
        style={{
          width: "100%", padding: "14px", border: "none", borderRadius: 10,
          cursor: generando ? "not-allowed" : "pointer",
          background: generando ? "#94a3b8" : "linear-gradient(135deg,#0D1726,#1e3a5f)",
          color: "#fff", fontSize: 15, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          boxShadow: generando ? "none" : "0 4px 14px rgba(13,23,38,0.4)",
          transition: "all .2s",
        }}
      >
        {generando ? <>⏳ Generando...</> : <>🏛 Generar Reporte Junta Directiva PDF</>}
      </button>
      <div style={{ textAlign: "center", fontSize: 11, color: T.textTertiary, marginTop: 8 }}>
        Se descarga como HTML · Guarda como PDF desde el navegador
      </div>

    </div>
  );
}
