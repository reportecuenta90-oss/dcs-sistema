import { ESTADO_CONFIG } from "./constants.js";
import EstadoBadge from "./EstadoBadge.jsx";

export default function DetalleOrden({
  selOrden, tecnicos, usuario, fotos,
  actualizarOrden, subirFoto, generarPDF,
  setFotoModal, matForm, setMatForm,
  addToast, pushNotif, navTo,
  T, s,
}) {
  return (
    <div style={{maxWidth:620,display:"flex",flexDirection:"column",gap:14}}>

              {/* Header */}
              <div style={s.card}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,marginBottom:16}}>
                  <div>
                    <div style={{
                      display:"inline-block",
                      fontSize:10,fontWeight:600,
                      color:T.textTertiary,
                      textTransform:"uppercase",letterSpacing:"0.8px",
                      background:T.surfaceSecond,
                      border:`1px solid ${T.borderDefault}`,
                      padding:"3px 8px",borderRadius:4,marginBottom:10,
                    }}>{selOrden.tipo}</div>
                    <div style={{fontSize:17,fontWeight:600,color:T.textPrimary,marginBottom:12}}>{selOrden.ph}</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
                    <EstadoBadge estado={selOrden.estado}/>
                    {(usuario.rol==="admin"||usuario.rol==="ingeniera") && (
                      <button style={{...s.btnSecondary,padding:"6px 12px",fontSize:11}}
                        onClick={()=>generarPDF(selOrden)}>
                        📄 Exportar PDF
                      </button>
                    )}
                    {/* Técnico — "Marcar en proceso" solo si está Pendiente */}
                    {usuario.rol==="tecnico" && selOrden.estado==="Pendiente" && (
                      <button
                        onClick={()=>actualizarOrden(selOrden.id,{estado:"En proceso"},`Estado → En proceso`)}
                        style={{
                          padding:"6px 14px",borderRadius:6,fontSize:11,fontWeight:600,
                          fontFamily:"'IBM Plex Sans',sans-serif",cursor:"pointer",
                          border:`1px solid ${ESTADO_CONFIG["En proceso"].dot}`,
                          background:"transparent",
                          color:T.textSecondary,
                        }}>
                        Marcar en proceso
                      </button>
                    )}
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6,fontSize:12,color:T.textSecondary}}>
                  <span>📍 {selOrden.ubicacion}</span>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11}}>📅 {selOrden.fecha}</span>
                  {selOrden.asignadoA && <span>👷 {tecnicos.find(t2=>t2.id===selOrden.asignadoA)?.nombre}</span>}
                </div>
              </div>

              {/* Checklist */}
              {selOrden.checklist?.length>0 && (
                <div style={s.card}>
                  <div style={s.secTitle}>Checklist</div>
                  {selOrden.checklist.map((c,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${T.borderSubtle}`}}>
                      <div style={{
                        width:20,height:20,borderRadius:4,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:10,fontWeight:700,flexShrink:0,
                        background:c.cumple?T.successMuted:T.dangerMuted,
                        color:c.cumple?T.successText:T.dangerText,
                        border:`1px solid ${c.cumple?`${T.successBase}33`:`${T.dangerBase}33`}`,
                      }}>{c.cumple?"✓":"✗"}</div>
                      <span style={{fontSize:12,color:T.textSecondary}}>{c.item}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Mediciones */}
              {selOrden.mediciones?.length>0 && (
                <div style={s.cardFlush}>
                  <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.borderDefault}`}}>
                    <div style={s.secTitle}>Mediciones técnicas</div>
                  </div>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr>{["Punto","Esperado","Actual","Resultado"].map(h=><th key={h} style={s.th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {selOrden.mediciones.map((m,i)=>(
                        <tr key={i}>
                          <td style={s.td}><div style={{fontSize:12,color:T.textSecondary}}>{m.punto}</div></td>
                          <td style={s.td}><div style={{fontSize:11,color:T.textTertiary,fontFamily:"'IBM Plex Mono',monospace"}}>{m.esperado}</div></td>
                          <td style={s.td}><div style={{fontSize:12,fontWeight:600,color:T.textPrimary,fontFamily:"'IBM Plex Mono',monospace"}}>{m.actual}</div></td>
                          <td style={s.td}>
                            <span style={{
                              display:"inline-flex",alignItems:"center",gap:4,
                              padding:"3px 8px",borderRadius:4,fontSize:11,fontWeight:600,
                              background:m.cumple?T.successMuted:T.dangerMuted,
                              color:m.cumple?T.successText:T.dangerText,
                              border:`1px solid ${m.cumple?`${T.successBase}33`:`${T.dangerBase}33`}`,
                            }}>{m.cumple?"Cumple":"No cumple"}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Descripción del problema — admin/ing solo lectura */}
              {(usuario.rol==="admin"||usuario.rol==="ingeniera") && selOrden.descripcion && (
                <div style={s.card}>
                  <div style={s.secTitle}>📝 Descripción del problema</div>
                  <p style={{fontSize:13,color:T.textSecondary,lineHeight:1.7,marginTop:4}}>{selOrden.descripcion}</p>
                </div>
              )}

              {/* Historial — solo admin e ing */}
              {(usuario.rol==="admin"||usuario.rol==="ingeniera") && selOrden.historial?.length>0 && (
                <div style={s.card}>
                  <div style={s.secTitle}>Historial de cambios</div>
                  {selOrden.historial.map((h,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"8px 0",borderBottom:`1px solid ${T.borderSubtle}`}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:T.accentBase,flexShrink:0,marginTop:5}}/>
                      <div>
                        <div style={{fontSize:12,color:T.textPrimary,fontWeight:500}}>{h.accion}</div>
                        <div style={{fontSize:10,color:T.textTertiary,marginTop:2,fontFamily:"'IBM Plex Mono',monospace"}}>{h.usuario} · {h.fecha}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Registro fotográfico — admin/ing SOLO VE las fotos */}
              {(usuario.rol==="admin"||usuario.rol==="ingeniera") && (fotos[selOrden.id]?.dano || fotos[selOrden.id]?.resuelto || selOrden.foto_dano) && (
                <div style={s.card}>
                  <div style={s.secTitle}>📷 Registro fotográfico</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                    {[
                      {lbl:"Foto del daño",tipo:"dano",src:fotos[selOrden.id]?.dano||selOrden.foto_dano},
                      {lbl:"Trabajo realizado",tipo:"resuelto",src:fotos[selOrden.id]?.resuelto},
                    ].map(({lbl,tipo,src})=>(
                      <div key={tipo}>
                        <div style={{fontSize:10,fontWeight:600,color:T.textTertiary,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:8}}>{lbl}</div>
                        {src
                          ? <img src={src} alt=""
                              onClick={()=>setFotoModal({src,titulo:lbl})}
                              style={{width:"100%",height:150,objectFit:"cover",borderRadius:8,border:`2px solid ${tipo==="resuelto"?T.successBase:T.dangerBase}`,cursor:"zoom-in"}}/>
                          : <div style={{width:"100%",height:150,borderRadius:8,border:`1px dashed ${T.borderSubtle}`,background:T.surfaceSecond,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:T.textTertiary,gap:6}}>
                              <span style={{fontSize:16}}>📷</span>
                              {tipo==="resuelto"?"El técnico subirá la evidencia":"Sin foto del daño"}
                            </div>
                        }
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Foto del daño — técnico la ve para saber qué reparar */}
              {usuario.rol==="tecnico" && (selOrden.foto_dano||fotos[selOrden.id]?.dano) && (
                <div style={s.card}>
                  <div style={s.secTitle}>📷 Foto del daño reportado</div>
                  <img
                    src={selOrden.foto_dano||fotos[selOrden.id]?.dano} alt=""
                    onClick={()=>setFotoModal({src:selOrden.foto_dano||fotos[selOrden.id]?.dano,titulo:"Foto del daño reportado"})}
                    style={{width:"100%",maxHeight:220,objectFit:"cover",borderRadius:8,border:`2px solid ${T.dangerBase}`,marginTop:6,cursor:"zoom-in"}}
                  />
                  {selOrden.descripcion && <p style={{fontSize:12,color:T.textSecondary,marginTop:10,lineHeight:1.6}}><strong>Descripción:</strong> {selOrden.descripcion}</p>}
                </div>
              )}

              {/* Acciones técnico — solo foto upload */}
              {usuario.rol==="tecnico" && selOrden.estado!=="En revisión"&&selOrden.estado!=="Cerrado" && (
                <div style={{...s.card,border:`1px solid ${T.borderStrong}`}}>
                  <div style={s.secTitle}>📷 Evidencia del trabajo</div>
                  {/* Foto trabajo realizado */}
                  <div style={{marginBottom:14}}>
                    <div style={{fontSize:11,fontWeight:600,color:T.textSecondary,marginBottom:6}}>📷 Foto del trabajo realizado</div>
                    {fotos[selOrden.id]?.resuelto
                      ? <div style={{position:"relative",display:"inline-block"}}>
                          <img src={fotos[selOrden.id].resuelto} alt=""
                          onClick={()=>setFotoModal({src:fotos[selOrden.id].resuelto,titulo:"Foto del trabajo realizado"})}
                          style={{width:"100%",maxWidth:280,height:160,objectFit:"cover",borderRadius:8,border:`2px solid ${T.successBase}`,cursor:"zoom-in"}}/>
                          <div style={{position:"absolute",top:4,right:4,background:T.successBase,color:"#fff",borderRadius:4,padding:"2px 6px",fontSize:10,fontWeight:700}}>✓ Subida</div>
                        </div>
                      : <div style={{width:"100%",height:100,borderRadius:8,border:`2px dashed ${T.borderStrong}`,background:T.surfaceSecond,display:"flex",alignItems:"center",justifyContent:"center",gap:8,cursor:"pointer",fontSize:12,color:T.textTertiary}}>
                          <label style={{cursor:"pointer",display:"flex",alignItems:"center",gap:6,color:T.accentBase,fontWeight:600,fontSize:12}}>
                            📷 Subir foto de evidencia
                            <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>subirFoto(selOrden.id,"resuelto",e.target.files[0])}/>
                          </label>
                        </div>
                    }
                    {fotos[selOrden.id]?.resuelto && (
                      <label style={{display:"block",fontSize:11,color:T.accentBase,fontWeight:600,marginTop:6,cursor:"pointer"}}>
                        🔄 Cambiar foto
                        <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>subirFoto(selOrden.id,"resuelto",e.target.files[0])}/>
                      </label>
                    )}
                  </div>

                </div>
              )}

              {/* Si ya está en revisión o cerrado, técnico ve estado */}
              {usuario.rol==="tecnico" && (selOrden.estado==="Resuelto"||selOrden.estado==="En revisión"||selOrden.estado==="Cerrado") && (
                <div style={{...s.card,background:selOrden.estado==="Cerrado"?T.successMuted:T.accentMuted,border:`1px solid ${selOrden.estado==="Cerrado"?T.successBase:T.accentBorder}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:22}}>{selOrden.estado==="Cerrado"?"✅":"⏳"}</span>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:selOrden.estado==="Cerrado"?T.successText:T.accentText}}>{selOrden.estado==="Cerrado"?"Orden cerrada y aprobada":"Trabajo enviado — en revisión"}</div>
                      <div style={{fontSize:11,color:T.textTertiary,marginTop:2}}>{selOrden.estado==="Cerrado"?"La ingeniería aprobó esta orden.":"La ingeniería revisará y cerrará la orden."}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Aprobación ingeniera */}
              {usuario.rol==="ingeniera" && (
                <div style={{...s.card,border:`1px solid ${T.accentBorder}`}}>
                  <div style={{...s.secTitle,color:T.accentText}}>Aprobación — Ing. Mitche</div>
                  {(selOrden.estado==="En revisión"||selOrden.estado==="Resuelto")&&!selOrden.aprobado
                    ? <div>
                        {selOrden.estado==="En revisión" && <div style={{fontSize:11,color:T.accentBase,fontWeight:600,marginBottom:10}}>⏳ El técnico marcó esta orden como finalizada — revisa y aprueba.</div>}
                        <button onClick={()=>actualizarOrden(selOrden.id,{aprobado:true,estado:"Cerrado"},"Orden aprobada y cerrada")} style={{...s.btnPrimary,width:"100%",padding:12}}>✓ Aprobar y cerrar orden</button>
                        <button onClick={()=>actualizarOrden(selOrden.id,{estado:"En proceso"},"Orden devuelta al técnico para revisión")} style={{...s.btnSecondary,width:"100%",padding:10,marginTop:8,fontSize:12}}>↩ Devolver al técnico</button>
                      </div>
                    : selOrden.aprobado
                      ? <div style={{fontSize:12,fontWeight:600,color:T.successText}}>✓ Orden aprobada y cerrada</div>
                      : <div style={{fontSize:12,color:T.textTertiary}}>La orden debe estar finalizada para aprobar.</div>
                  }
                </div>
              )}

              {/* Reasignar técnico */}
              {usuario.rol==="admin" && (
                <div style={s.card}>
                  <div style={s.secTitle}>Asignación de técnico</div>
                  <select
                    value={selOrden.asignadoA||""}
                    onChange={e=>actualizarOrden(selOrden.id,{asignadoA:e.target.value?Number(e.target.value):null,realizadoPor:e.target.value?"":selOrden.realizadoPor},e.target.value?`Técnico asignado: ${tecnicos.find(t2=>t2.id===Number(e.target.value))?.nombre}`:"Técnico removido")}
                    style={s.select}
                  >
                    <option value="">Sin asignar</option>
                    {tecnicos.map(t2=><option key={t2.id} value={t2.id}>{t2.nombre}</option>)}
                  </select>
                  {!selOrden.asignadoA && (
                    <div style={{marginTop:10}}>
                      <div style={{fontSize:11,color:T.textTertiary,marginBottom:4}}>¿Quién realizó el trabajo? (si no hay técnico asignado)</div>
                      <input
                        key={selOrden.id+"realizadoPor"}
                        defaultValue={selOrden.realizadoPor||""}
                        onBlur={e=>{ if(e.target.value!==selOrden.realizadoPor) actualizarOrden(selOrden.id,{realizadoPor:e.target.value},e.target.value?`Trabajo realizado por: ${e.target.value}`:""); }}
                        placeholder="Nombre de quien realizó el trabajo..."
                        style={{...s.input,width:"100%"}}
                      />
                    </div>
                  )}
                  {(selOrden.realizadoPor||tecnicos.find(t=>t.id===selOrden.asignadoA)) && (
                    <div style={{marginTop:8,fontSize:11,color:T.successText,fontWeight:600}}>
                      👷 {selOrden.asignadoA ? tecnicos.find(t=>t.id===selOrden.asignadoA)?.nombre : selOrden.realizadoPor}
                    </div>
                  )}
                </div>
              )}

              {/* ── SECCIONES SOLO TÉCNICO ── */}
              {usuario.rol==="tecnico" && (
                <>
              {/* Descripción adicional del trabajo */}
              <div style={s.card}>
                <div style={s.secTitle}>📝 Descripción adicional del trabajo</div>
                <textarea
                  key={selOrden.id+"desc"}
                  defaultValue={selOrden.descripcionTrabajo||""}
                  onBlur={e=>actualizarOrden(selOrden.id,{descripcionTrabajo:e.target.value})}
                  rows={4}
                  placeholder="Describe detalladamente el trabajo realizado, equipos usados, procedimiento..."
                  style={s.textarea}
                />
              </div>

              {/* Materiales instalados — nuevo diseño */}
              {(()=>{
                return (
                <div style={s.card}>
                  <div style={s.secTitle}>🔧 Materiales instalados</div>
                  {/* Formulario */}
                  <div style={{background:T.accentMuted,border:`1.5px dashed ${T.accentBorder}`,borderRadius:10,padding:12,marginBottom:14}}>
                    <div style={{marginBottom:8}}>
                      <div style={{fontSize:10,fontWeight:700,color:T.textTertiary,textTransform:"uppercase",marginBottom:4}}>Material</div>
                      <input
                        value={matForm.material}
                        onChange={e=>setMatForm(p=>({...p,material:e.target.value}))}
                        placeholder="Ej: Pintura, Tubo PVC, Cable..."
                        style={{...s.input,width:"100%"}}
                      />
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                      <div>
                        <div style={{fontSize:10,fontWeight:700,color:T.textTertiary,textTransform:"uppercase",marginBottom:4}}>Cantidad</div>
                        <input type="number" value={matForm.cantidad} onChange={e=>setMatForm(p=>({...p,cantidad:e.target.value}))} placeholder="0" style={{...s.input,width:"100%"}}/>
                      </div>
                      <div>
                        <div style={{fontSize:10,fontWeight:700,color:T.textTertiary,textTransform:"uppercase",marginBottom:4}}>Unidad</div>
                        <select value={matForm.unidad} onChange={e=>setMatForm(p=>({...p,unidad:e.target.value}))} style={{...s.select,width:"100%"}}>
                          <option value="">— Unidad —</option>
                          {["m","pcs","kg","litros","rollo","caja","galón","par","unidad"].map(u=><option key={u}>{u}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{marginBottom:8}}>
                      <div style={{fontSize:10,fontWeight:700,color:T.textTertiary,textTransform:"uppercase",marginBottom:4}}>Área de uso</div>
                      <input value={matForm.area} onChange={e=>setMatForm(p=>({...p,area:e.target.value}))} placeholder="Ej: Lobby, Piscina, Apt. 3B..." style={{...s.input,width:"100%"}}/>
                    </div>
                    <div style={{marginBottom:10}}>
                      <div style={{fontSize:10,fontWeight:700,color:T.textTertiary,textTransform:"uppercase",marginBottom:4}}>Observación <span style={{fontWeight:400,opacity:0.6}}>(opcional)</span></div>
                      <input value={matForm.obs} onChange={e=>setMatForm(p=>({...p,obs:e.target.value}))} placeholder="Detalle adicional..." style={{...s.input,width:"100%"}}/>
                    </div>
                    <button
                      onClick={()=>{
                        if(!matForm.material.trim()) return addToast("Escribe el nombre del material","warning");
                        const nuevo={material:matForm.material,cantidad:matForm.cantidad||"—",unidad:matForm.unidad||"pcs",area:matForm.area,obs:matForm.obs};
                        actualizarOrden(selOrden.id,{materiales:[...(selOrden.materiales||[]),nuevo]});
                      }}
                      style={{...s.btnPrimary,width:"100%",justifyContent:"center",display:"flex",alignItems:"center",gap:6}}
                    >+ Agregar material</button>
                  </div>
                  {/* Lista */}
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                    <span style={{fontSize:12,fontWeight:600,color:T.textPrimary}}>Materiales agregados</span>
                    <span style={{background:T.accentMuted,border:`1px solid ${T.accentBorder}`,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700,color:T.accentText}}>{(selOrden.materiales||[]).length} items</span>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {(selOrden.materiales||[]).length===0 && (
                      <div style={{textAlign:"center",padding:20,color:T.textTertiary,fontSize:12,background:T.surfaceSecond,borderRadius:8,border:`1.5px dashed ${T.borderDefault}`}}>
                        📦 Aún no hay materiales agregados
                      </div>
                    )}
                    {(selOrden.materiales||[]).map((m,i)=>(
                      <div key={i} style={{background:T.surfaceSecond,border:`1.5px solid ${T.accentBorder}`,borderRadius:10,padding:"11px 12px",display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:28,height:28,background:T.accentBase,color:"#fff",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,flexShrink:0}}>{i+1}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:700,color:T.accentText,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.material}</div>
                          <div style={{fontSize:11,color:T.textTertiary,marginTop:2}}>{m.cantidad} {m.unidad}{m.area?` · 📍 ${m.area}`:""}</div>
                          {m.obs&&<div style={{fontSize:10,color:T.textTertiary,marginTop:1,fontStyle:"italic",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>💬 {m.obs}</div>}
                        </div>
                        <button onClick={()=>{
                          const mats=(selOrden.materiales||[]).filter((_,j)=>j!==i);
                          actualizarOrden(selOrden.id,{materiales:mats});
                        }} style={{background:T.dangerMuted,border:`1px solid ${T.dangerBase}33`,color:T.dangerText,borderRadius:6,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,cursor:"pointer",flexShrink:0}}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
                );
              })()}

              {/* Insumos instalados por área */}
              <div style={s.card}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                  <div style={s.secTitle}>📦 Insumos instalados por área</div>
                  <button onClick={()=>{
                    const nuevo={area:"",descripcion:""};
                    actualizarOrden(selOrden.id,{insumos:[...(selOrden.insumos||[]),nuevo]});
                  }} style={{...s.btnSecondary,padding:"4px 10px",fontSize:11}}>+ Agregar</button>
                </div>
                {(selOrden.insumos||[]).length===0 && (
                  <div style={{textAlign:"center",color:T.textTertiary,fontSize:11,padding:"12px 0"}}>Sin insumos. Usa "+ Agregar".</div>
                )}
                {(selOrden.insumos||[]).map((ins,i)=>(
                  <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 2fr auto",gap:8,marginBottom:10,alignItems:"start"}}>
                    <input
                      defaultValue={ins.area||""}
                      onBlur={e=>{const ins2=[...(selOrden.insumos||[])];ins2[i]={...ins2[i],area:e.target.value};actualizarOrden(selOrden.id,{insumos:ins2});}}
                      placeholder="Área / Nivel"
                      style={{...s.input,padding:"7px 10px",fontSize:12}}
                    />
                    <textarea
                      defaultValue={ins.descripcion||""}
                      onBlur={e=>{const ins2=[...(selOrden.insumos||[])];ins2[i]={...ins2[i],descripcion:e.target.value};actualizarOrden(selOrden.id,{insumos:ins2});}}
                      placeholder="Descripción de insumos instalados..."
                      rows={2}
                      style={{...s.textarea,padding:"7px 10px",fontSize:12}}
                    />
                    <button onClick={()=>{
                      const ins2=(selOrden.insumos||[]).filter((_,j)=>j!==i);
                      actualizarOrden(selOrden.id,{insumos:ins2});
                    }} style={{background:"none",border:"none",cursor:"pointer",color:T.dangerText,fontSize:18,paddingTop:6}}>×</button>
                  </div>
                ))}
              </div>

              {/* Conclusiones */}
              <div style={s.card}>
                <div style={s.secTitle}>📋 Conclusiones</div>
                <textarea
                  key={selOrden.id+"conc"}
                  defaultValue={selOrden.conclusiones||""}
                  onBlur={e=>actualizarOrden(selOrden.id,{conclusiones:e.target.value})}
                  rows={4}
                  placeholder="Conclusiones del trabajo realizado, estado final del sistema, recomendaciones..."
                  style={s.textarea}
                />
              </div>

              {/* Notas */}
              <div style={s.card}>
                <div style={s.secTitle}>Notas internas</div>
                <textarea key={selOrden.id} defaultValue={selOrden.notas} onBlur={e=>actualizarOrden(selOrden.id,{notas:e.target.value})} rows={3} placeholder="Observaciones internas (no aparecen en el PDF)..." style={s.textarea}/>
              </div>

              {/* ── Trabajo Finalizado — después de Notas ── */}
              <button
                onClick={()=>{
                  if(!fotos[selOrden.id]?.resuelto){addToast("Sube una foto del trabajo antes de finalizar","warning");return;}
                  actualizarOrden(selOrden.id,{estado:"Resuelto"},`Trabajo finalizado por ${usuario.nombre}`);
                  pushNotif(`✅ Trabajo resuelto por ${usuario.nombre} — ${selOrden.ph||""}. Pendiente aprobación.`,"✅");
                  addToast("¡Trabajo marcado como Resuelto! ✅","success");
                  setTimeout(()=>navTo("asignacionesTerminadas"),800);
                }}
                style={{
                  width:"100%",padding:"14px",borderRadius:10,fontSize:14,fontWeight:700,
                  fontFamily:"'IBM Plex Sans',sans-serif",border:"none",
                  background:"linear-gradient(135deg,#16a34a,#15803d)",
                  color:"#fff",cursor:"pointer",letterSpacing:".3px",
                  boxShadow:"0 4px 14px rgba(22,163,74,0.4)",
                }}>
                ✅ Trabajo Finalizado
              </button>
                </>
              )}
    </div>
  );
}
