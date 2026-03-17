import { PHS } from "./constants.js";
import { supa } from "./supabase.js";

const COLORES = ["#2563EB","#7C3AED","#0891B2","#059669","#D97706","#DC2626","#9333EA","#0D9488"];

export default function DiarioCampo({
  formDiario, setFormDiario,
  formBloque, setFormBloque,
  diarios, setDiarios, setOrdenes,
  diarioEditId, setDiarioEditId,
  usuario, navTo, addToast, fmtHora,
  dbOnline, LOGO_B64,
  T, s,
}) {

            const agregarBloque = () => {
              if(!formBloque.hallazgos&&!formBloque.ordenes&&!formBloque.accionesTomadas)
                return addToast("Completa al menos un campo del bloque.","warning");
              setFormDiario(p=>({...p, bloques:[...p.bloques, {...formBloque, id:crypto.randomUUID()}]}));
              setFormBloque({ph:PHS[0],hora:"",ordenes:"",hallazgos:"",accionesTomadas:"",recomendaciones:"",fotos:[]});
              addToast(`Bloque ${formBloque.ph} agregado`);
            };

            const guardarDiario = () => {
              if(!formDiario.resumen) return addToast("Escribe el resumen del día.","warning");

              if(diarioEditId) {
                // Editar existente
                setDiarios(p=>p.map(d=>d.id===diarioEditId ? {...d,...formDiario} : d));
                setDiarioEditId(null);
                addToast("Diario actualizado ✓");
              } else {
                // Nuevo
                const nuevo = {...formDiario, id:crypto.randomUUID(), autor:usuario.nombre,
                  creadoEn: new Date().toLocaleString("es",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"})};
                setDiarios(p=>[nuevo,...p]);
      // Si tiene pendientes, agregar como evento en el calendario del día siguiente
      if(nuevo.pendientes){
        const fechaBase = new Date(nuevo.fecha+"T00:00:00");
        fechaBase.setDate(fechaBase.getDate()+1);
        const fechaSig = fechaBase.toISOString().split("T")[0];
        const evtId = "pend_"+crypto.randomUUID();
        setOrdenes(p=>[...p,{
          id:evtId,
          tipo:"📌 Pendiente de Diario",
          ph:nuevo.bloques[0]?.ph||"—",
          ubicacion:nuevo.pendientes.slice(0,80),
          fecha:fechaSig,
          estado:"Pendiente",
          asignadoA:null,
          aprobado:false,
          notas:nuevo.pendientes,
          descripcionTrabajo:"",conclusiones:"",
          mediciones:[],materiales:[],insumos:[],checklist:[],
          historial:[{fecha:new Date().toLocaleString("es"),usuario:nuevo.autor,accion:"Creado desde pendientes del diario"}],
          esPendienteDiario:true,
        }]);
        addToast("📌 Pendiente agregado al calendario","success");
      }
                addToast("Diario guardado ✓");
                if(dbOnline) {
                  supa.post("diarios",{
                    autor:nuevo.autor, fecha:nuevo.fecha,
                    hora_inicio:nuevo.horaInicio||"", hora_fin:nuevo.horaFin||"",
                    resumen:nuevo.resumen||"", pendientes:nuevo.pendientes||"",
                    alertas:nuevo.alertas||"", bloques:nuevo.bloques||[],
                    creado_en:nuevo.creadoEn||""
                  }).catch(()=>{});
                }
              }
              setFormDiario({fecha:new Date().toISOString().split("T")[0],horaInicio:"",horaFin:"",resumen:"",pendientes:"",alertas:"",bloques:[]});
              navTo("misDiarios");
            };

            const exportarDiarioPDF = (d) => {
              const hoy = new Date().toLocaleDateString("es",{year:"numeric",month:"long",day:"numeric"});
              const fechaDisplay = new Date(d.fecha+"T00:00:00").toLocaleDateString("es",{weekday:"long",year:"numeric",month:"long",day:"numeric"});

              // Colores por índice para los bloques
              const colores = ["#2563EB","#7C3AED","#0891B2","#059669","#D97706","#DC2626","#9333EA","#0D9488"];

              const bloquesHTML = d.bloques.map((b,idx)=>{
                const color = colores[idx % colores.length];
                const fotosHTML = (b.fotos||[]).length>0 ? `
                  <div style="margin-top:12px">
                    <div style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">📷 Registro fotográfico (${b.fotos.length} foto${b.fotos.length!==1?"s":""})</div>
                    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px">
                      ${b.fotos.map((f,i)=>`<div><img src="${f.data||f}" style="width:100%;height:140px;object-fit:cover;border-radius:4px;border:1px solid #ddd"/><div style="font-size:9px;color:#9ca3af;text-align:center;margin-top:3px">Foto ${i+1}</div></div>`).join("")}
                    </div>
                  </div>` : "";

                // 3 estilos de separación según índice para mostrar variedad
                const estilos = [
                  // Estilo 1 — Encabezado tipo sello oscuro
                  `<div style="margin-bottom:24px;border-radius:6px;overflow:hidden;border:1px solid #e5e7eb">
                    <div style="background:#0D1726;color:#fff;padding:12px 20px;display:flex;align-items:center;justify-content:space-between">
                      <div style="display:flex;align-items:center;gap:10px">
                        <div style="width:32px;height:32px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:#fff">${idx+1}</div>
                        <div>
                          <div style="font-size:14px;font-weight:700">${b.ph}</div>
                          ${b.hora?`<div style="font-size:10px;opacity:.7">⏰ ${b.hora}</div>`:""}
                        </div>
                      </div>
                      <div style="font-size:10px;opacity:.6;font-family:monospace">PH #${String(idx+1).padStart(2,"0")}</div>
                    </div>
                    <div style="padding:16px 20px;background:#fff">
                      ${b.ordenes?`<div style="margin-bottom:10px"><span style="font-size:10px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.5px">📋 Órdenes atendidas</span><div style="font-size:12px;color:#374151;margin-top:4px;line-height:1.7">${b.ordenes}</div></div>`:""}
                      ${b.hallazgos?`<div style="margin-bottom:10px"><span style="font-size:10px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.5px">🔍 Hallazgos</span><div style="font-size:12px;color:#374151;margin-top:4px;line-height:1.7">${b.hallazgos}</div></div>`:""}
                      ${b.accionesTomadas?`<div style="margin-bottom:10px"><span style="font-size:10px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.5px">⚙ Acciones tomadas</span><div style="font-size:12px;color:#374151;margin-top:4px;line-height:1.7">${b.accionesTomadas}</div></div>`:""}
                      ${b.recomendaciones?`<div style="margin-bottom:10px"><div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:4px;padding:10px 14px"><span style="font-size:10px;font-weight:700;color:#1D4ED8;text-transform:uppercase;letter-spacing:.5px">💡 Recomendaciones</span><div style="font-size:12px;color:#1e40af;margin-top:4px;line-height:1.7">${b.recomendaciones}</div></div></div>`:""}
                      ${fotosHTML}
                    </div>
                  </div>`,
                ][0]; // usamos el estilo sello oscuro — el más limpio

                return estilos;
              }).join("");

              const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/>
              <title>Diario de Campo — ${d.fecha}</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono&display=swap');
                *{box-sizing:border-box;margin:0;padding:0}
                body{font-family:'IBM Plex Sans',Arial,sans-serif;color:#111;background:#fff;font-size:13px}
                .page{max-width:860px;margin:0 auto;padding:36px 44px}
                .header{display:flex;align-items:center;justify-content:space-between;padding-bottom:18px;border-bottom:3px solid #0D1726;margin-bottom:28px}
                .kpi-row{display:flex;gap:10px;margin-bottom:28px;flex-wrap:wrap}
                .kpi{flex:1;min-width:100px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px 14px;text-align:center}
                .kpi-val{font-size:24px;font-weight:800;color:#0D1726;line-height:1}
                .kpi-lbl{font-size:10px;color:#6b7280;margin-top:4px;font-weight:600;text-transform:uppercase;letter-spacing:.5px}
                .sec-title{font-size:11px;font-weight:700;color:#fff;background:#374151;padding:6px 14px;border-radius:3px;text-transform:uppercase;letter-spacing:.8px;margin:24px 0 12px;display:inline-block}
                .resumen-box{background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:16px 20px;font-size:13px;line-height:1.8;color:#374151;margin-bottom:24px;white-space:pre-wrap}
                .alerta-box{background:#FFF7ED;border:1px solid #FED7AA;border-radius:6px;padding:14px 18px;margin-bottom:16px}
                .pendiente-box{background:#F0FDF4;border:1px solid #BBF7D0;border-radius:6px;padding:14px 18px;margin-bottom:24px}
                .firma-row{display:flex;justify-content:flex-end;margin-top:52px}
                .firma-line{width:220px;border-top:1.5px solid #374151;margin:56px auto 8px}
                .footer{margin-top:36px;padding-top:12px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;font-size:10px;color:#9ca3af}
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
                  <div style="font-size:11px;color:#6b7280;margin-top:3px">${d.autor}${d.horaInicio?` · ${d.horaInicio}${d.horaFin?" — "+d.horaFin:""}`:""}</div>
                </div>
              </div>

              <div class="kpi-row">
                <div class="kpi"><div class="kpi-val">${d.bloques.length}</div><div class="kpi-lbl">PHs visitados</div></div>
                <div class="kpi"><div class="kpi-val">${d.bloques.filter(b=>b.ordenes).length}</div><div class="kpi-lbl">Con órdenes</div></div>
                <div class="kpi"><div class="kpi-val">${d.bloques.reduce((a,b)=>(b.fotos||[]).length+a,0)}</div><div class="kpi-lbl">Fotos totales</div></div>
                <div class="kpi"><div class="kpi-val">${d.bloques.filter(b=>b.recomendaciones).length}</div><div class="kpi-lbl">Con recomend.</div></div>
                ${d.horaInicio&&d.horaFin?`<div class="kpi"><div class="kpi-val" style="font-size:16px">${d.horaInicio}–${d.horaFin}</div><div class="kpi-lbl">Jornada</div></div>`:""}
              </div>

              <div class="sec-title">📝 Resumen del día</div>
              <div class="resumen-box">${d.resumen}</div>

              <div class="sec-title">🏢 PHs visitados (${d.bloques.length})</div>
              <div style="margin-top:16px">${bloquesHTML}</div>

              ${d.alertas?`<div class="sec-title">🚨 Alertas y urgencias</div><div class="alerta-box"><span style="font-size:12px;color:#C2410C;line-height:1.7">${d.alertas}</span></div>`:""}
              ${d.pendientes?`<div class="sec-title">📌 Pendientes para mañana</div><div class="pendiente-box"><span style="font-size:12px;color:#15803D;line-height:1.7">${d.pendientes}</span></div>`:""}

              <div class="firma-row">
                <div style="text-align:center">
                  <div style="font-size:11px;color:#6b7280">Preparado y firmado por,</div>
                  <div class="firma-line"></div>
                  <div style="font-size:14px;font-weight:700;color:#0D1726">${d.autor}</div>
                  <div style="font-size:11px;color:#6b7280;margin-top:3px">Ingeniera · DC&amp;S · Fundación Buenaventura</div>
                  <div style="font-size:11px;color:#6b7280;margin-top:2px">Certified Test Technician</div>
                </div>
              </div>
              <div class="footer"><span>DC&amp;S · Fundación Buenaventura · Diario de Campo</span><span>Generado el ${hoy}</span></div>
              </div></body></html>`;
              const w=window.open("","_blank"); w.document.write(html); w.document.close();
            };


  return (
              <div style={{maxWidth:720,display:"flex",flexDirection:"column",gap:16}}>

                {/* Header */}
                <div style={{...s.card,background:`linear-gradient(135deg,${T.accentBase}12,${T.surfacePrimary})`,border:`1px solid ${T.accentBorder}`}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <span style={{fontSize:28}}>📓</span>
                      <div>
                        <div style={{fontSize:15,fontWeight:700,color:T.textPrimary}}>Diario de Campo</div>
                        <div style={{fontSize:11,color:T.textTertiary,marginTop:1}}>{usuario.nombre} · {new Date().toLocaleDateString("es",{weekday:"long",day:"numeric",month:"long"})}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      {diarios.length>0 && <span style={{fontSize:11,color:T.textTertiary,alignSelf:"center"}}>{diarios.length} diario{diarios.length!==1?"s":""} guardado{diarios.length!==1?"s":""}</span>}
                    </div>
                  </div>
                </div>

                {/* ── FORMULARIO NUEVO DIARIO ── */}
                <div style={s.card}>
                  <div style={{...s.secTitle,marginBottom:16}}>📅 Datos de la jornada</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:14}}>
                    <div>
                      <label style={s.label}>Fecha</label>
                      <input type="date" value={formDiario.fecha} onChange={e=>setFormDiario(p=>({...p,fecha:e.target.value}))} style={s.input}/>
                    </div>
                    <div>
                      <label style={s.label}>Hora inicio</label>
                      <input type="time" value={formDiario.horaInicio} onChange={e=>setFormDiario(p=>({...p,horaInicio:e.target.value}))} style={s.input}/>
                    </div>
                    <div>
                      <label style={s.label}>Hora fin</label>
                      <input type="time" value={formDiario.horaFin} onChange={e=>setFormDiario(p=>({...p,horaFin:e.target.value}))} style={s.input}/>
                    </div>
                  </div>
                  <div>
                    <label style={s.label}>Resumen del día *</label>
                    <textarea value={formDiario.resumen} onChange={e=>setFormDiario(p=>({...p,resumen:e.target.value}))} rows={3} placeholder="Describe brevemente lo que se hizo hoy, el objetivo de la jornada..." style={s.textarea}/>
                  </div>
                </div>

                {/* ── BLOQUES DE PH ── */}
                <div style={s.card}>
                  <div style={{...s.secTitle,marginBottom:4}}>🏢 Agregar PH visitado</div>
                  <div style={{fontSize:11,color:T.textTertiary,marginBottom:14}}>Llena los datos de cada PH que visitaste y presiona "Agregar". Puedes agregar todos los que necesites.</div>

                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                    <div>
                      <label style={s.label}>PH</label>
                      <select value={formBloque.ph} onChange={e=>setFormBloque(p=>({...p,ph:e.target.value}))} style={s.select}>
                        {PHS.map(p=><option key={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={s.label}>Hora de llegada</label>
                      <input type="time" value={formBloque.hora} onChange={e=>setFormBloque(p=>({...p,hora:e.target.value}))} style={s.input}/>
                    </div>
                  </div>

                  {[
                    {key:"ordenes",     label:"📋 Órdenes atendidas",    placeholder:"Describe las órdenes que revisaste, su estado, avances..."},
                    {key:"hallazgos",   label:"🔍 Hallazgos",             placeholder:"Problemas detectados, anomalías, observaciones del lugar..."},
                    {key:"accionesTomadas", label:"⚙ Acciones tomadas",  placeholder:"Qué se hizo, qué se corrigió, qué se instruyó..."},
                    {key:"recomendaciones", label:"💡 Recomendaciones",   placeholder:"Próximos pasos, seguimiento necesario, sugerencias..."},
                  ].map(f=>(
                    <div key={f.key} style={{marginBottom:12}}>
                      <label style={s.label}>{f.label}</label>
                      <textarea value={formBloque[f.key]} onChange={e=>setFormBloque(p=>({...p,[f.key]:e.target.value}))} rows={2} placeholder={f.placeholder} style={s.textarea}/>
                    </div>
                  ))}

                  {/* Fotos del bloque */}
                  <div style={{marginBottom:14}}>
                    <label style={s.label}>📷 Fotos de este PH</label>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                      {(formBloque.fotos||[]).map((f,i)=>(
                        <div key={i} style={{position:"relative"}}>
                          <img src={f.data} alt="" style={{width:72,height:56,objectFit:"cover",borderRadius:4,border:`1px solid ${T.borderDefault}`}}/>
                          <button onClick={()=>setFormBloque(p=>({...p,fotos:p.fotos.filter((_,j)=>j!==i)}))} style={{position:"absolute",top:-6,right:-6,background:T.dangerBase,color:"#fff",border:"none",borderRadius:"50%",width:18,height:18,cursor:"pointer",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                        </div>
                      ))}
                      <label style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,width:72,height:56,borderRadius:4,cursor:"pointer",border:`2px dashed ${T.borderDefault}`,background:T.surfaceSecond,fontSize:10,color:T.textTertiary}}>
                        <span style={{fontSize:18}}>📷</span>
                        <input type="file" accept="image/*" multiple capture="environment" style={{display:"none"}}
                          onChange={e=>{
                            Array.from(e.target.files).forEach(file=>{
                              const r=new FileReader();
                              r.onload=ev=>setFormBloque(p=>({...p,fotos:[...(p.fotos||[]),{data:ev.target.result,nombre:file.name}]}));
                              r.readAsDataURL(file);
                            });
                          }}/>
                      </label>
                    </div>
                  </div>

                  <button onClick={agregarBloque} style={{...s.btnPrimary,width:"100%",padding:11,fontSize:13}}>
                    + Agregar {formBloque.ph}
                  </button>
                </div>

                {/* Bloques agregados — editables */}
                {formDiario.bloques.length>0 && (
                  <div style={s.card}>
                    <div style={{...s.secTitle,marginBottom:14}}>📍 PHs agregados ({formDiario.bloques.length}) — toca uno para editarlo</div>
                    <div style={{display:"flex",flexDirection:"column",gap:12}}>
                      {formDiario.bloques.map((b,idx)=>{
                        const colores=["#2563EB","#7C3AED","#0891B2","#059669","#D97706","#DC2626"];
                        const color=colores[idx%colores.length];
                        const isOpen = diarioEditId===`bloque-${b.id}`;
                        const toggleBloque = () => setDiarioEditId(p => p===`bloque-${b.id}` ? null : `bloque-${b.id}`);
                        const updateBloque = (key,val) => setFormDiario(p=>({...p, bloques:p.bloques.map((x,i)=>i===idx?{...x,[key]:val}:x)}));
                        return (
                          <div key={b.id} style={{borderRadius:6,border:`1px solid ${isOpen?color:T.borderDefault}`,overflow:"hidden",transition:"border-color .15s"}}>
                            {/* Header del bloque */}
                            <div onClick={toggleBloque} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",cursor:"pointer",background:isOpen?`${color}14`:T.surfaceSecond,borderLeft:`4px solid ${color}`}}>
                              <div style={{width:28,height:28,borderRadius:"50%",background:color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"#fff",flexShrink:0}}>{idx+1}</div>
                              <div style={{flex:1}}>
                                <div style={{fontSize:13,fontWeight:700,color:T.textPrimary}}>{b.ph}</div>
                                <div style={{fontSize:11,color:T.textTertiary,marginTop:1}}>
                                  {b.hora?`⏰ ${fmtHora(b.hora)} · `:""}{(b.fotos||[]).length} foto{(b.fotos||[]).length!==1?"s":""}
                                  {b.hallazgos?" · 🔍":""}{b.recomendaciones?" · 💡":""}
                                </div>
                              </div>
                              <span style={{color:isOpen?color:T.textTertiary,fontSize:14,transition:"transform .2s",display:"inline-block",transform:isOpen?"rotate(90deg)":"none"}}>›</span>
                              <button onClick={e=>{e.stopPropagation();setFormDiario(p=>({...p,bloques:p.bloques.filter((_,j)=>j!==idx)}))} } style={{background:"none",border:"none",cursor:"pointer",color:T.dangerText,fontSize:16,padding:4}}>×</button>
                            </div>

                            {/* Cuerpo editable del bloque */}
                            {isOpen && (
                              <div style={{padding:"14px 16px",background:T.surfacePrimary,borderTop:`1px solid ${T.borderDefault}`}}>
                                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                                  <div>
                                    <label style={s.label}>PH</label>
                                    <select value={b.ph} onChange={e=>updateBloque("ph",e.target.value)} style={s.select}>
                                      {PHS.map(p=><option key={p}>{p}</option>)}
                                    </select>
                                  </div>
                                  <div>
                                    <label style={s.label}>Hora de llegada</label>
                                    <input type="time" value={b.hora||""} onChange={e=>updateBloque("hora",e.target.value)} style={s.input}/>
                                  </div>
                                </div>
                                {[
                                  {key:"ordenes",     label:"📋 Órdenes atendidas",   rows:2},
                                  {key:"hallazgos",   label:"🔍 Hallazgos",            rows:2},
                                  {key:"accionesTomadas", label:"⚙ Acciones tomadas", rows:2},
                                  {key:"recomendaciones", label:"💡 Recomendaciones",  rows:2},
                                ].map(f=>(
                                  <div key={f.key} style={{marginBottom:10}}>
                                    <label style={s.label}>{f.label}</label>
                                    <textarea value={b[f.key]||""} onChange={e=>updateBloque(f.key,e.target.value)} rows={f.rows} style={s.textarea}/>
                                  </div>
                                ))}
                                {/* Fotos del bloque — editables */}
                                <div style={{marginBottom:4}}>
                                  <label style={s.label}>📷 Fotos</label>
                                  <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                                    {(b.fotos||[]).map((f,i)=>(
                                      <div key={i} style={{position:"relative"}}>
                                        <img src={f.data||f} alt="" style={{width:72,height:56,objectFit:"cover",borderRadius:4,border:`1px solid ${T.borderDefault}`}}/>
                                        <button onClick={()=>updateBloque("fotos",(b.fotos||[]).filter((_,j)=>j!==i))} style={{position:"absolute",top:-6,right:-6,background:T.dangerBase,color:"#fff",border:"none",borderRadius:"50%",width:18,height:18,cursor:"pointer",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                                      </div>
                                    ))}
                                    <label style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,width:72,height:56,borderRadius:4,cursor:"pointer",border:`2px dashed ${T.accentBase}`,background:T.accentMuted,fontSize:10,color:T.accentText}}>
                                      <span style={{fontSize:18}}>📷</span>
                                      <span>Agregar</span>
                                      <input type="file" accept="image/*" multiple capture="environment" style={{display:"none"}}
                                        onChange={e=>{
                                          Array.from(e.target.files).forEach(file=>{
                                            const r=new FileReader();
                                            r.onload=ev=>updateBloque("fotos",[...(b.fotos||[]),{data:ev.target.result,nombre:file.name}]);
                                            r.readAsDataURL(file);
                                          });
                                        }}/>
                                    </label>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Cierre del día */}
                <div style={s.card}>
                  <div style={{...s.secTitle,marginBottom:14}}>🔚 Cierre del día</div>
                  <div style={{marginBottom:12}}>
                    <label style={{...s.label,color:T.dangerText}}>🚨 Alertas o urgencias</label>
                    <textarea value={formDiario.alertas} onChange={e=>setFormDiario(p=>({...p,alertas:e.target.value}))} rows={2} placeholder="Situaciones urgentes que requieren atención inmediata..." style={{...s.textarea,borderColor:formDiario.alertas?T.dangerBase:T.borderDefault}}/>
                  </div>
                  <div>
                    <label style={{...s.label,color:T.successText}}>📌 Pendientes para mañana</label>
                    <textarea value={formDiario.pendientes} onChange={e=>setFormDiario(p=>({...p,pendientes:e.target.value}))} rows={2} placeholder="Tareas pendientes, seguimientos, visitas programadas..." style={{...s.textarea,borderColor:formDiario.pendientes?T.successBase:T.borderDefault}}/>
                  </div>
                </div>

                {/* Botón guardar */}
                <button onClick={guardarDiario} style={{...s.btnPrimary,width:"100%",padding:14,fontSize:14,marginBottom:8}}>
                  📓 Guardar Diario del {new Date(formDiario.fecha+"T00:00:00").toLocaleDateString("es",{weekday:"long",day:"numeric",month:"long"})}
                </button>
                <button onClick={()=>navTo("misDiarios")} style={{...s.btnSecondary,width:"100%",padding:11,fontSize:13}}>
                  📚 Ver mis diarios guardados →
                </button>

              </div>
  );
}
