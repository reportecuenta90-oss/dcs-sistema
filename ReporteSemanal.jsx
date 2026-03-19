import { useState } from "react";
import { useApp } from "./AppContext";
import { useData } from "./DataContext";

export default function ReporteSemanal({ addToast, LOGO_B64 }) {
  const { T, s, usuario, isMobile } = useApp();
  const { ordenes, reportes, incidencias, repIng, tecnicos, generando, setGenerando } = useData();

  const [offset, setOffset] = useState(0);
  const [notaSem, setNotaSem] = useState("");

  // ── Rango de semana ────────────────────────────────────────────────────────
  const hoy = new Date();
  const lunesActual = new Date(hoy);
  lunesActual.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
  lunesActual.setHours(0, 0, 0, 0);

  const lunes = new Date(lunesActual);
  lunes.setDate(lunesActual.getDate() + offset * 7);
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);
  domingo.setHours(23, 59, 59, 999);

  const enSemana = (f) => { if (!f) return false; const d = new Date(f); return d >= lunes && d <= domingo; };
  const fmtFecha = (d) => d.toLocaleDateString("es", { weekday: "short", day: "numeric", month: "short" });
  const periodoStr = `${fmtFecha(lunes)} — ${fmtFecha(domingo)}`;

  // ── Datos de la semana ─────────────────────────────────────────────────────
  const ordenesSemana     = ordenes.filter(o => enSemana(o.fecha_creacion || o.created_at || o.fecha));
  const reportesSemana    = reportes.filter(r => enSemana(r.created_at || r.fecha));
  const incidenciasSemana = incidencias.filter(i => enSemana(i.created_at || i.fecha));
  const repIngSemana      = repIng.filter(r => enSemana(r.created_at || r.fecha));

  const resueltas   = ordenesSemana.filter(o => o.estado === "Resuelto" || o.estado === "Cerrado");
  const enProceso   = ordenesSemana.filter(o => o.estado === "En proceso" || o.estado === "En revisión");
  const pendientes  = ordenesSemana.filter(o => o.estado === "Pendiente");
  const emergencias = [...reportesSemana.filter(r => r.urgencia === "Emergencia"), ...incidenciasSemana.filter(i => i.urgencia === "Emergencia")];

  const tasaRes = ordenesSemana.length > 0 ? Math.round((resueltas.length / ordenesSemana.length) * 100) : 0;

  const porPH = {};
  ordenesSemana.forEach(o => {
    const ph = o.ph || "Sin PH";
    if (!porPH[ph]) porPH[ph] = { total: 0, resueltas: 0 };
    porPH[ph].total++;
    if (o.estado === "Resuelto" || o.estado === "Cerrado") porPH[ph].resueltas++;
  });

  const porTecnico = {};
  ordenesSemana.forEach(o => {
    const tec = o.tecnico || tecnicos.find(t => t.id === o.asignadoA)?.nombre || "Sin asignar";
    if (!porTecnico[tec]) porTecnico[tec] = { total: 0, resueltas: 0 };
    porTecnico[tec].total++;
    if (o.estado === "Resuelto" || o.estado === "Cerrado") porTecnico[tec].resueltas++;
  });

  const porTipo = {};
  ordenesSemana.forEach(o => {
    const tipo = o.tipo || "General";
    if (!porTipo[tipo]) porTipo[tipo] = { total: 0, resueltas: 0 };
    porTipo[tipo].total++;
    if (o.estado === "Resuelto" || o.estado === "Cerrado") porTipo[tipo].resueltas++;
  });

  const materialesUsados = [];
  repIngSemana.forEach(r => {
    (r.materiales || []).forEach(m => {
      if (m.material) materialesUsados.push({ ...m, ph: r.ph || "" });
    });
  });

  const novedadesUrgentes = reportesSemana.filter(r => r.urgencia === "Urgente" || r.urgencia === "Emergencia");
  const criticas = ordenesSemana.filter(o => o.urgencia === "Emergencia");

  const tiemposRes = resueltas.filter(o => o.fecha_creacion && o.updated_at).map(o => (new Date(o.updated_at) - new Date(o.fecha_creacion)) / (1000 * 60 * 60 * 24));
  const tiemProm = tiemposRes.length > 0 ? (tiemposRes.reduce((a, b) => a + b, 0) / tiemposRes.length).toFixed(1) : "—";

  // ── Generar PDF ────────────────────────────────────────────────────────────
  const generarPDF = async () => {
    setGenerando(true);
    await new Promise(r => setTimeout(r, 300));
    try {
      const ahora    = new Date();
      const fechaGen = ahora.toLocaleDateString("es", { year: "numeric", month: "long", day: "numeric" });
      const horaGen  = ahora.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });

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

      const pct = tasaRes / 100;
      const r2 = 40, cx = 50, cy = 50, circ = 2 * Math.PI * r2;
      const donutSVG = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${cx}" cy="${cy}" r="${r2}" fill="none" stroke="#e2e8f0" stroke-width="12"/>
        <circle cx="${cx}" cy="${cy}" r="${r2}" fill="none" stroke="${tasaRes >= 80 ? "#16a34a" : tasaRes >= 50 ? "#d97706" : "#dc2626"}" stroke-width="12"
          stroke-dasharray="${circ * pct} ${circ * (1 - pct)}" stroke-dashoffset="${circ * 0.25}" stroke-linecap="round"/>
        <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="14" font-weight="800" fill="#0f172a" font-family="Arial">${tasaRes}%</text>
      </svg>`;

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
        : `<tr><td colspan="5" style="padding:12px;text-align:center;color:#94a3b8;font-size:12px">Sin actividades en proceso esta semana</td></tr>`;

      const secBitacora = reportesSemana.length > 0 ? `
        <div class="section">
          <div class="sec-header"><div class="sec-icon" style="background:#fdf4ff">📋</div>
            <div><div class="sec-title">Bitácora de Conserjes</div>
            <div class="sec-subtitle">${reportesSemana.length} entradas esta semana</div></div>
          </div>
          <table><thead><tr><th>Conserje</th><th>PH</th><th>Fecha</th><th>Turno</th><th style="text-align:center">Incidente</th></tr></thead>
          <tbody>${reportesSemana.map(r => `<tr>
            <td style="font-weight:600">${r.conserje || "—"}</td>
            <td>${r.ph}</td><td>${r.fecha}</td><td>${r.turno || "—"}</td>
            <td style="text-align:center">${r.huboIncidente || r.novedad
              ? '<span style="background:#fee2e2;color:#be123c;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700">⚠ Sí</span>'
              : '<span style="background:#dcfce7;color:#15803d;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700">No</span>'}</td>
          </tr>`).join("")}
          </tbody></table>
        </div>` : "";

      const secIncidencias = incidenciasSemana.length > 0 ? `
        <div class="section">
          <div class="sec-header"><div class="sec-icon" style="background:#fff7ed">🚧</div>
            <div><div class="sec-title">Incidencias en Vía Pública</div>
            <div class="sec-subtitle">${incidenciasSemana.length} reportada(s)</div></div>
          </div>
          ${incidenciasSemana.map(i => `<div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid #f1f5f9">
            <div style="width:8px;height:8px;border-radius:50%;background:#C9A84C;margin-top:5px;flex-shrink:0"></div>
            <div style="flex:1">
              <div style="font-size:12px;font-weight:600">${i.tipo || i.descripcion || "Incidencia"}</div>
              <div style="font-size:11px;color:#64748b;margin-top:2px">${i.calle || i.ubicacion || ""} · ${i.fecha || ""}</div>
            </div>
            <span style="background:${i.estado === "Resuelto" ? "#dcfce7" : "#fef9c3"};color:${i.estado === "Resuelto" ? "#15803d" : "#92400e"};padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700">${i.estado || "Pendiente"}</span>
          </div>`).join("")}
        </div>` : "";

      const secMateriales = materialesUsados.length > 0 ? `
        <div class="section">
          <div class="sec-header"><div class="sec-icon" style="background:#f0fdf4">📦</div>
            <div><div class="sec-title">Materiales Utilizados</div></div>
          </div>
          <table><thead><tr><th>Material</th><th style="text-align:center">Cantidad</th><th>Área</th><th>PH</th></tr></thead>
          <tbody>${materialesUsados.map(m => `<tr>
            <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:11px;font-weight:600">${m.material}</td>
            <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:11px;text-align:center">${m.cantidad || "—"} ${m.unidad || ""}</td>
            <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:11px">${m.area || "—"}</td>
            <td style="padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:11px;color:#64748b">${m.ph}</td>
          </tr>`).join("")}
          </tbody></table>
        </div>` : "";

      const secCriticas = criticas.length > 0 ? `
        <div class="section">
          <div class="sec-header"><div class="sec-icon" style="background:#fff1f2">🚨</div>
            <div><div class="sec-title">Órdenes que Requieren Atención</div>
            <div class="sec-subtitle">${criticas.length} emergencia(s) esta semana</div></div>
          </div>
          <table><thead><tr><th>Tipo</th><th>PH</th><th>Descripción</th><th style="text-align:center">Estado</th></tr></thead>
          <tbody>${criticas.map(o => `<tr>
            <td style="padding:7px 10px;font-size:11px;font-weight:600;color:#dc2626">${o.tipo || "General"}</td>
            <td style="padding:7px 10px;font-size:11px;font-weight:600">${o.ph || "—"}</td>
            <td style="padding:7px 10px;font-size:11px">${(o.descripcion || "").slice(0, 55)}</td>
            <td style="padding:7px 10px;font-size:10px;text-align:center">
              <span style="background:#fee2e2;color:#be123c;padding:2px 8px;border-radius:10px;font-weight:700">${o.estado}</span>
            </td>
          </tr>`).join("")}
          </tbody></table>
        </div>` : "";

      const notasHTML = notaSem.trim() ? `
        <div style="margin-top:32px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:20px 24px">
          <div style="font-size:11px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px">📝 Observaciones adicionales</div>
          <div style="font-size:13px;color:#78350f;line-height:1.8;white-space:pre-wrap">${notaSem.trim()}</div>
        </div>` : "";

      const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<title>Reporte Semanal — ${periodoStr}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=IBM+Plex+Sans:wght@300;400;500;600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'IBM Plex Sans',Arial,sans-serif;color:#1a1a2e;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .page{max-width:900px;margin:0 auto}

  .cover{background:linear-gradient(160deg,#0F4C3A 0%,#1a6b52 45%,#1e7a5f 100%);min-height:297mm;display:flex;flex-direction:column;justify-content:space-between;padding:60px 64px;position:relative;overflow:hidden;page-break-after:always}
  .cover::before{content:"";position:absolute;top:-80px;right:-80px;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(100,200,140,0.15) 0%,transparent 70%)}
  .cover-logo{width:80px;height:80px;object-fit:contain;background:rgba(255,255,255,0.06);border-radius:12px;padding:8px}
  .cover-brand-sub{font-size:12px;font-weight:300;opacity:.55;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;color:#fff}
  .cover-brand-name{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;line-height:1.1;color:#fff}
  .cover-brand-name span{color:#6EE7B7}
  .cover-divider{width:80px;height:2px;background:linear-gradient(90deg,#6EE7B7,transparent);margin:40px 0}
  .cover-title-label{font-size:11px;letter-spacing:3px;text-transform:uppercase;opacity:.5;font-weight:400;margin-bottom:12px;color:#fff}
  .cover-title-main{font-family:'Playfair Display',serif;font-size:48px;font-weight:800;line-height:1;margin-bottom:8px;color:#fff}
  .cover-title-main span{color:#6EE7B7;display:block;font-size:52px}
  .cover-title-sub{font-size:16px;font-weight:300;opacity:.7;margin-top:8px;color:#fff}
  .cover-meta{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border-top:1px solid rgba(110,231,183,0.3);padding-top:32px;margin-top:40px}
  .cover-meta-label{font-size:9px;letter-spacing:2px;text-transform:uppercase;opacity:.4;margin-bottom:6px;color:#fff}
  .cover-meta-value{font-size:15px;font-weight:600;color:#fff}
  .cover-meta-value span{color:#6EE7B7}
  .cover-confidential{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(110,231,183,0.7);border:1px solid rgba(110,231,183,0.2);padding:4px 12px;border-radius:3px}
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
  th{background:#0F4C3A;color:#fff;padding:9px 12px;text-align:left;font-size:10px;font-weight:600;letter-spacing:.5px;text-transform:uppercase}
  th:first-child{border-radius:6px 0 0 6px}th:last-child{border-radius:0 6px 6px 0}
  td{padding:9px 12px;border-bottom:1px solid #f1f5f9}
  tr:last-child td{border-bottom:none}
  tr:nth-child(even) td{background:#f8fafc}

  .firma-section{margin-top:60px;padding-top:32px;border-top:1px solid #e2e8f0;display:grid;grid-template-columns:1fr 1fr;gap:40px}
  .firma-box{text-align:center}
  .firma-line{border-top:1.5px solid #0F4C3A;margin:48px auto 8px;width:200px}
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
      <div class="cover-title-label">Informe de Seguimiento</div>
      <div class="cover-title-main">Reporte<span>Semanal</span></div>
      <div class="cover-title-sub">Actividades · Novedades · Incidencias · Técnicos</div>
    </div>
  </div>
  <div>
    <div class="cover-meta">
      <div style="padding:0 24px 0 0">
        <div class="cover-meta-label">Período</div>
        <div class="cover-meta-value"><span>${periodoStr}</span></div>
      </div>
      <div style="padding:0 24px 0 0">
        <div class="cover-meta-label">Frecuencia</div>
        <div class="cover-meta-value"><span>Semanal</span></div>
      </div>
      <div>
        <div class="cover-meta-label">Generado el</div>
        <div class="cover-meta-value">${fechaGen}</div>
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:32px">
      <div class="cover-prepared">Preparado por: ${usuario?.nombre || "—"} · DC&amp;S Sistema de Gestión</div>
      <div class="cover-confidential">Uso Interno</div>
    </div>
  </div>
</div>

<!-- CONTENIDO -->
<div class="content">

  <!-- RESUMEN EJECUTIVO -->
  <div class="section">
    <div class="sec-header">
      <div class="sec-icon" style="background:#fef9c3">📊</div>
      <div><div class="sec-title">Resumen Ejecutivo</div><div class="sec-subtitle">Indicadores clave — ${periodoStr}</div></div>
    </div>
    <div class="kpi-grid">
      <div class="kpi blue"><div class="kpi-val">${ordenesSemana.length}</div><div class="kpi-lbl">Total Asignaciones</div><div class="kpi-sub">Esta semana</div></div>
      <div class="kpi green"><div class="kpi-val">${resueltas.length}</div><div class="kpi-lbl">Completadas</div><div class="kpi-sub">Tasa: ${tasaRes}%</div></div>
      <div class="kpi gold"><div class="kpi-val">${enProceso.length + pendientes.length}</div><div class="kpi-lbl">En Gestión</div><div class="kpi-sub">${enProceso.length} proceso · ${pendientes.length} pend.</div></div>
      <div class="kpi red"><div class="kpi-val">${incidenciasSemana.length}</div><div class="kpi-lbl">Incidencias</div><div class="kpi-sub">Reportadas en calle</div></div>
    </div>
    <div class="kpi-grid">
      <div class="kpi purple"><div class="kpi-val">${reportesSemana.length}</div><div class="kpi-lbl">Bitácora Conserjes</div></div>
      <div class="kpi slate"><div class="kpi-val">${repIngSemana.length}</div><div class="kpi-lbl">Visitas Técnicas</div></div>
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
      </div>
    </div>
  </div>

  <!-- ACTIVIDADES POR PH -->
  ${Object.keys(porPH).length > 0 ? `
  <div class="section">
    <div class="sec-header">
      <div class="sec-icon" style="background:#faf5ff">🏢</div>
      <div><div class="sec-title">Actividades por Proyecto</div><div class="sec-subtitle">Resumen por PH esta semana</div></div>
    </div>
    <table>
      <thead><tr><th>Proyecto PH</th><th style="text-align:center">Órdenes</th><th style="text-align:center">Resueltas</th><th style="text-align:center">Pendientes</th><th style="text-align:center">Resolución</th></tr></thead>
      <tbody>${rowsPH}</tbody>
    </table>
  </div>` : ""}

  <!-- TÉCNICOS -->
  ${Object.keys(porTecnico).length > 0 ? `
  <div class="section">
    <div class="sec-header">
      <div class="sec-icon" style="background:#eff6ff">👷</div>
      <div><div class="sec-title">Actividad por Técnico</div><div class="sec-subtitle">Desempeño del equipo esta semana</div></div>
    </div>
    <table>
      <thead><tr><th>Técnico</th><th style="text-align:center">Total</th><th style="text-align:center">Completadas</th><th style="text-align:center">Eficiencia</th></tr></thead>
      <tbody>${rowsTecnicos}</tbody>
    </table>
  </div>` : ""}

  <!-- ACTIVIDADES EN PROCESO -->
  <div class="section">
    <div class="sec-header">
      <div class="sec-icon" style="background:#fffbeb">⚙️</div>
      <div><div class="sec-title">Actividades en Proceso</div><div class="sec-subtitle">${enProceso.length} asignación(es) activa(s)</div></div>
    </div>
    <table>
      <thead><tr><th>Proyecto PH</th><th>Tipo</th><th>Descripción</th><th>Técnico</th><th style="text-align:center">Estado</th></tr></thead>
      <tbody>${rowsEnProceso}</tbody>
    </table>
  </div>

  <!-- EMERGENCIAS / CRÍTICAS -->
  ${secCriticas}

  <!-- PROYECTOS DE MANTENIMIENTO -->
  ${Object.keys(porTipo).length > 0 ? `
  <div class="section">
    <div class="sec-header">
      <div class="sec-icon" style="background:#f0fdf4">🔧</div>
      <div><div class="sec-title">Proyectos de Mantenimiento y Reparación</div><div class="sec-subtitle">Resumen por tipo de trabajo esta semana</div></div>
    </div>
    <table>
      <thead><tr><th>Tipo de Trabajo</th><th style="text-align:center">Total</th><th style="text-align:center">Completados</th><th style="text-align:center">Pendientes</th><th style="text-align:center">Avance</th></tr></thead>
      <tbody>${rowsTipos}</tbody>
    </table>
  </div>` : ""}

  <!-- MATERIALES -->
  ${secMateriales}

  <!-- BITÁCORA CONSERJES -->
  ${secBitacora}

  <!-- INCIDENCIAS -->
  ${secIncidencias}

  ${notasHTML}

  <!-- FIRMA -->
  <div class="firma-section">
    <div class="firma-box">
      <div class="firma-line"></div>
      <div class="firma-name">${usuario?.nombre || "—"}</div>
      <div class="firma-title">${usuario?.rol === "ingeniera" ? "Ingeniera · DC&S" : "Administración · DC&S"}</div>
      <div class="firma-title" style="margin-top:2px">Fundación Administradora Buenaventura</div>
    </div>
    <div class="firma-box">
      <div class="firma-line"></div>
      <div class="firma-name">Revisado por</div>
      <div class="firma-title">Coordinación DC&S</div>
      <div class="firma-title" style="margin-top:2px">${periodoStr}</div>
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
      addToast("✅ Reporte semanal generado", "success");
    } catch (e) {
      console.error(e);
      addToast("Error al generar el reporte", "error");
    }
    setGenerando(false);
  };

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 680, display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <div style={{ ...s.card, background: `linear-gradient(135deg,${T.successBase}10,${T.surfacePrimary})`, border: `1px solid ${T.successBase}44` }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: T.textPrimary, marginBottom: 4 }}>📋 Reporte Semanal</div>
        <div style={{ fontSize: 12, color: T.textTertiary }}>Resumen completo de la semana — actividades, técnicos, conserjes e incidencias.</div>
      </div>

      {/* Selector de semana */}
      <div style={{ ...s.card, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button onClick={() => setOffset(o => o - 1)} style={{ ...s.btnSecondary, padding: "8px 14px" }}>← Anterior</button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{periodoStr}</div>
          <div style={{ fontSize: 11, color: T.textTertiary, marginTop: 2 }}>{offset === 0 ? "Semana actual" : offset === -1 ? "Semana pasada" : `Hace ${Math.abs(offset)} semanas`}</div>
        </div>
        <button onClick={() => setOffset(o => Math.min(o + 1, 0))} disabled={offset === 0} style={{ ...s.btnSecondary, padding: "8px 14px", opacity: offset === 0 ? 0.4 : 1 }}>Siguiente →</button>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {[
          { val: ordenesSemana.length, lbl: "Órdenes", color: T.accentBase, muted: T.accentMuted },
          { val: resueltas.length, lbl: "Resueltas", color: T.successBase, muted: T.successMuted },
          { val: enProceso.length, lbl: "En proceso", color: T.warningBase, muted: T.warningMuted },
          { val: pendientes.length, lbl: "Pendientes", color: T.dangerBase, muted: T.dangerMuted },
          { val: reportesSemana.length, lbl: "Conserjes", color: T.accentBase, muted: T.accentMuted },
          { val: incidenciasSemana.length, lbl: "Incidencias", color: T.dangerBase, muted: T.dangerMuted },
        ].map((k, i) => (
          <div key={i} style={{ background: k.muted, border: `1px solid ${k.color}33`, borderRadius: 8, padding: "14px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.val}</div>
            <div style={{ fontSize: 10, color: k.color, fontWeight: 600, marginTop: 4, textTransform: "uppercase", letterSpacing: ".5px" }}>{k.lbl}</div>
          </div>
        ))}
      </div>

      {/* Emergencias */}
      {emergencias.length > 0 && (
        <div style={{ background: T.dangerMuted, border: `1px solid ${T.dangerBase}44`, borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🚨</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.dangerText }}>¡{emergencias.length} emergencia{emergencias.length > 1 ? "s" : ""} esta semana!</div>
            <div style={{ fontSize: 11, color: T.dangerText, opacity: 0.8 }}>Incluidas en el reporte generado.</div>
          </div>
        </div>
      )}

      {/* Observaciones */}
      <div style={{ ...s.card }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.textSecondary, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 8 }}>📝 Observaciones <span style={{ fontWeight: 400, textTransform: "none", fontSize: 11 }}>(opcional)</span></div>
        <textarea value={notaSem} onChange={e => setNotaSem(e.target.value)} placeholder="Agrega notas u observaciones para incluir en el reporte..." rows={3} style={{ ...s.input, width: "100%", resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }} />
      </div>

      {/* Botón */}
      <button
        onClick={generarPDF}
        disabled={generando}
        style={{
          width: "100%", padding: "14px", border: "none", borderRadius: 10,
          cursor: generando ? "not-allowed" : "pointer",
          background: generando ? "#94a3b8" : `linear-gradient(135deg,${T.successBase},#15803d)`,
          color: "#fff", fontSize: 15, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          boxShadow: generando ? "none" : `0 4px 14px ${T.successBase}66`,
          transition: "all .2s",
        }}
      >
        {generando ? <>⏳ Generando...</> : <>📋 Generar Reporte Semanal PDF</>}
      </button>
      <div style={{ textAlign: "center", fontSize: 11, color: T.textTertiary, marginTop: -8 }}>
        Se descarga como HTML · Guarda como PDF desde el navegador
      </div>

    </div>
  );
}
