import { URGENCIAS, AREAS_EDIFICIO } from "./constants.js";
import { SUPA_URL, SUPA_KEY } from "./supabase.js";
import SelectConOtro from "./SelectConOtro.jsx";

export default function NuevoReporte({
  formRep, setFormRep,
  novedadesHora, setNovedadesHora,
  nuevaNovedad, setNuevaNovedad,
  crearReporte, fmtHora,
  dbOnline, addToast,
  usuario, T, s,
}) {
  return (
    <div style={{maxWidth:500,display:"flex",flexDirection:"column",gap:14}}>

              {/* ── SECCIÓN 1 — INFO DEL TURNO (automática) ── */}
              <div style={{...s.card,background:`linear-gradient(135deg,${T.accentBase}10,${T.surfacePrimary})`,border:`1px solid ${T.accentBorder}`}}>
                <div style={{fontSize:11,fontWeight:700,color:T.accentText,textTransform:"uppercase",letterSpacing:".8px",marginBottom:14}}>
                  📍 Información del turno
                </div>

                {/* PH y fecha — automáticos */}
                <div style={{display:"flex",gap:10,marginBottom:14}}>
                  <div style={{flex:1,background:T.accentMuted,border:`1px solid ${T.accentBorder}`,borderRadius:6,padding:"10px 14px"}}>
                    <div style={{fontSize:9,fontWeight:700,color:T.accentText,textTransform:"uppercase",letterSpacing:".5px",marginBottom:2}}>Proyecto</div>
                    <div style={{fontSize:13,fontWeight:700,color:T.accentText}}>{usuario.ph}</div>
                  </div>
                  <div style={{background:T.surfaceSecond,border:`1px solid ${T.borderDefault}`,borderRadius:6,padding:"10px 14px"}}>
                    <div style={{fontSize:9,fontWeight:700,color:T.textTertiary,textTransform:"uppercase",letterSpacing:".5px",marginBottom:2}}>Fecha</div>
                    <div style={{fontSize:12,fontWeight:600,color:T.textSecondary,whiteSpace:"nowrap"}}>
                      {new Date().toLocaleDateString("es",{weekday:"short",day:"numeric",month:"short"})}
                    </div>
                  </div>
                  <div style={{background:T.surfaceSecond,border:`1px solid ${T.borderDefault}`,borderRadius:6,padding:"10px 14px"}}>
                    <div style={{fontSize:9,fontWeight:700,color:T.textTertiary,textTransform:"uppercase",letterSpacing:".5px",marginBottom:2}}>Hora</div>
                    <div style={{fontSize:12,fontWeight:600,color:T.textSecondary}}>
                      {new Date().toLocaleTimeString("es",{hour:"2-digit",minute:"2-digit"})}
                    </div>
                  </div>
                </div>

                {/* Turno */}
                <div>
                  <label style={s.label}>Turno</label>
                  <div style={{display:"flex",gap:8}}>
                    {["🌅 Mañana","☀️ Tarde","🌙 Noche"].map(t=>{
                      const active = formRep.turno===t;
                      return (
                        <button key={t} onClick={()=>setFormRep(p=>({...p,turno:t}))} style={{
                          flex:1,padding:"9px 6px",borderRadius:6,cursor:"pointer",fontSize:12,
                          fontFamily:"'IBM Plex Sans',sans-serif",fontWeight:active?700:400,
                          border:`1.5px solid ${active?T.accentBase:T.borderDefault}`,
                          background:active?T.accentMuted:T.surfaceSecond,
                          color:active?T.accentText:T.textTertiary,
                          transition:"all .15s",
                        }}>{t}</button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── SECCIÓN 2 — NOVEDADES DEL TURNO ── */}
              <div style={s.card}>
                <div style={{fontSize:11,fontWeight:700,color:T.textTertiary,textTransform:"uppercase",letterSpacing:".8px",marginBottom:14}}>
                  📝 Novedades del turno
                </div>

                {/* Anotador de novedades por hora */}
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:11,fontWeight:600,color:T.textSecondary,marginBottom:8}}>📋 Registro de novedades por hora</div>
                  {/* Lista de novedades agregadas */}
                  {novedadesHora.length>0 && (
                    <div style={{background:T.surfaceSecond,borderRadius:8,padding:10,marginBottom:10,maxHeight:180,overflowY:"auto"}}>
                      {novedadesHora.map((n,i)=>(
                        <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"6px 0",borderBottom:i<novedadesHora.length-1?`1px solid ${T.borderSubtle}`:"none"}}>
                          <span style={{fontSize:11,fontWeight:700,color:T.accentBase,flexShrink:0,background:T.accentMuted,padding:"2px 6px",borderRadius:4}}>{fmtHora(n.hora)}</span>
                          <span style={{fontSize:12,color:T.textPrimary,flex:1}}>{n.texto}</span>
                          <button onClick={()=>setNovedadesHora(p=>p.filter((_,j)=>j!==i))} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:T.textTertiary}}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Agregar nueva novedad */}
                  <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                    <input
                      type="time"
                      value={nuevaNovedad.hora}
                      onChange={e=>setNuevaNovedad(p=>({...p,hora:e.target.value}))}
                      style={{...s.input,width:90,flexShrink:0}}
                    />
                    <input
                      value={nuevaNovedad.texto}
                      onChange={e=>setNuevaNovedad(p=>({...p,texto:e.target.value}))}
                      placeholder="Describe la novedad de esta hora..."
                      style={{...s.input,flex:1}}
                      onKeyDown={e=>{
                        if(e.key==="Enter"&&nuevaNovedad.hora&&nuevaNovedad.texto.trim()){
                          setNovedadesHora(p=>[...p,{hora:nuevaNovedad.hora,texto:nuevaNovedad.texto.trim()}]);
                          setNuevaNovedad({hora:"",texto:""});
                        }
                      }}
                    />
                    <button
                      onClick={()=>{
                        if(!nuevaNovedad.hora||!nuevaNovedad.texto.trim()) return;
                        setNovedadesHora(p=>[...p,{hora:nuevaNovedad.hora,texto:nuevaNovedad.texto.trim()}]);
                        setNuevaNovedad({hora:"",texto:""});
                      }}
                      style={{...s.btnPrimary,padding:"8px 12px",fontSize:13,flexShrink:0}}
                    >+ Agregar</button>
                  </div>
                  <div style={{fontSize:10,color:T.textTertiary,marginTop:4}}>Presiona Enter o el botón para agregar cada novedad</div>
                </div>

                {/* Descripción libre con micrófono */}
                <div style={{marginBottom:16}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                    <label style={{...s.label,marginBottom:0}}>Resumen general del turno *</label>
                    {(()=>{
                      const escuchando = formRep._escuchando||false;
                      const soportado  = typeof window!=="undefined"&&("SpeechRecognition" in window||"webkitSpeechRecognition" in window);
                      if(!soportado) return null;
                      return (
                        <button onClick={()=>{
                          if(escuchando){window._dcsSpeech?.stop();setFormRep(p=>({...p,_escuchando:false}));return;}
                          const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
                          const rec=new SR();
                          rec.lang="es-PA";rec.continuous=true;rec.interimResults=true;
                          rec.onstart=()=>setFormRep(p=>({...p,_escuchando:true}));

                          rec.onerror=()=>{setFormRep(p=>({...p,_escuchando:false}));addToast("No se pudo acceder al micrófono","warning");};
                          let _acum="";
                          rec.onresult=(e)=>{
                            let interim="";
                            _acum="";
                            for(let i=0;i<e.results.length;i++){
                              if(e.results[i].isFinal) _acum+=e.results[i][0].transcript+" ";
                              else interim+=e.results[i][0].transcript;
                            }
                            setFormRep(p=>({...p,_acum:_acum.trim(),_interim:interim}));
                          };
                          rec.onend=()=>{
                            setFormRep(p=>({...p,
                              observacion:((p.observacion||"").trim()+" "+(p._acum||"")).trim(),
                              _acum:"",_interim:"",_escuchando:false
                            }));
                          };
                          window._dcsSpeech=rec;rec.start();
                        }} style={{
                          display:"flex",alignItems:"center",gap:5,padding:"5px 11px",
                          borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",
                          fontFamily:"'IBM Plex Sans',sans-serif",transition:"all .2s",
                          border:`1.5px solid ${formRep._escuchando?T.dangerBase:T.borderDefault}`,
                          background:formRep._escuchando?T.dangerMuted:T.surfaceSecond,
                          color:formRep._escuchando?T.dangerText:T.textTertiary,
                        }}>
                          <span style={{fontSize:13}}>{formRep._escuchando?"⏹":"🎙"}</span>
                          {formRep._escuchando?"Detener":"Hablar"}
                        </button>
                      );
                    })()}
                  </div>
                  <textarea
                    value={formRep._escuchando?((formRep.observacion||"").trim()+" "+(formRep._acum||"")+" "+(formRep._interim||"")).trim():(formRep.observacion||"")}
                    onChange={e=>setFormRep(p=>({...p,observacion:e.target.value,_interim:""}))}
                    rows={4}
                    placeholder="Describe con detalle lo que observaste, pasó o atendiste en el turno..."
                    style={{...s.textarea,borderColor:formRep._escuchando?T.dangerBase:T.borderDefault}}
                  />
                  {formRep._escuchando && (
                    <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4,fontSize:11,color:T.dangerText,fontWeight:600}}>
                      <span style={{width:6,height:6,borderRadius:"50%",background:T.dangerBase,display:"inline-block",animation:"pulse 1s infinite"}}/>
                      Escuchando... habla claramente
                    </div>
                  )}
                </div>

                {/* Separador — sección de incidente */}
                <div style={{borderTop:`1px dashed ${T.borderDefault}`,margin:"18px 0"}}/>
                <div style={{fontSize:11,fontWeight:700,color:T.textTertiary,textTransform:"uppercase",letterSpacing:".8px",marginBottom:4}}>
                  🚨 Reporte de daño o incidente <span style={{fontWeight:400,textTransform:"none",fontSize:10}}>(opcional — solo si hubo algo)</span>
                </div>
                <div style={{fontSize:11,color:T.textTertiary,marginBottom:14}}>
                  Si no hubo ningún incidente, deja esta sección vacía.
                </div>

                {/* Toggle ¿hubo incidente? */}
                <div style={{display:"flex",gap:8,marginBottom:14}}>
                  {["Sin incidente","Hubo incidente"].map(op=>{
                    const active = (formRep.huboIncidente||"Sin incidente")===op;
                    const esDaño = op==="Hubo incidente";
                    return (
                      <button key={op} onClick={()=>setFormRep(p=>({...p,huboIncidente:op}))} style={{
                        flex:1,padding:"9px 8px",borderRadius:6,cursor:"pointer",fontSize:12,
                        fontFamily:"'IBM Plex Sans',sans-serif",fontWeight:active?700:400,
                        border:`1.5px solid ${active?(esDaño?T.dangerBase:T.successBase):T.borderDefault}`,
                        background:active?(esDaño?T.dangerMuted:T.successMuted):T.surfaceSecond,
                        color:active?(esDaño?T.dangerText:T.successText):T.textTertiary,
                        transition:"all .15s",
                      }}>{esDaño?"⚠️ Hubo incidente":"✅ Sin incidente"}</button>
                    );
                  })}
                </div>

                {/* Campos del incidente — solo si hubo */}
                {formRep.huboIncidente==="Hubo incidente" && (
                  <div style={{display:"flex",flexDirection:"column",gap:14,padding:"14px",borderRadius:8,border:`1px solid ${T.dangerBase}33`,background:T.dangerMuted}}>

                    {/* Nivel de urgencia */}
                    <div>
                      <label style={{...s.label,color:T.dangerText}}>Nivel de urgencia</label>
                      <div style={{display:"flex",gap:8}}>
                        {URGENCIAS.map(u=>{
                          const cfg={
                            Normal:    {bg:T.successMuted,border:T.successBase,text:T.successText,icon:"🟢"},
                            Urgente:   {bg:T.warningMuted,border:T.warningBase,text:T.warningText,icon:"🟡"},
                            Emergencia:{bg:T.dangerMuted, border:T.dangerBase, text:T.dangerText, icon:"🔴"},
                          }[u];
                          const active=formRep.urgencia===u;
                          return (
                            <button key={u} onClick={()=>setFormRep(p=>({...p,urgencia:u}))} style={{
                              flex:1,padding:"9px 4px",borderRadius:6,cursor:"pointer",fontSize:11,
                              fontFamily:"'IBM Plex Sans',sans-serif",fontWeight:active?700:500,
                              border:`1.5px solid ${active?cfg.border:T.borderDefault}`,
                              background:active?cfg.bg:"#fff",
                              color:active?cfg.text:T.textTertiary,
                              transition:"all .15s",
                            }}>{cfg.icon} {u}</button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Descripción del incidente */}
                    <div>
                      <label style={s.label}>Descripción del incidente</label>
                      <textarea
                        value={formRep.descripcionIncidente||""}
                        onChange={e=>setFormRep(p=>({...p,descripcionIncidente:e.target.value}))}
                        rows={3}
                        placeholder="Describe qué pasó, cómo ocurrió, si hay personas involucradas, daños visibles..."
                        style={{...s.textarea,background:"#fff"}}
                      />
                    </div>

                    {/* Área del edificio */}
                    <div>
                      <label style={s.label}>Área del edificio</label>
                      <SelectConOtro
                        opciones={AREAS_EDIFICIO}
                        valor={formRep.area||AREAS_EDIFICIO[0]}
                        otroValor={formRep.areaOtro||""}
                        onChange={v=>setFormRep(p=>({...p,area:v,areaOtro:""}))}
                        onOtroChange={v=>setFormRep(p=>({...p,areaOtro:v,area:"Otro"}))}
                        inputPlaceholder="Escribe el área específica..."
                        s={s} T={T}
                      />
                    </div>

                    {/* Foto del incidente */}
                    <div>
                      <label style={s.label}>📷 Foto del incidente</label>
                      {!formRep.foto ? (
                        <label style={{
                          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                          gap:8,padding:"20px",borderRadius:8,cursor:"pointer",
                          border:`2px dashed ${T.dangerBase}55`,background:"#fff",
                          fontSize:12,color:T.dangerText,
                        }}>
                          <span style={{fontSize:28}}>📷</span>
                          <span style={{fontWeight:600}}>Toca para tomar o adjuntar foto</span>
                          <input type="file" accept="image/*" capture="environment" style={{display:"none"}}
                            onChange={async e=>{
                              const file=e.target.files[0]; if(!file) return;
                              // Preview inmediato
                              const r=new FileReader();
                              r.onload=ev=>setFormRep(p=>({...p,foto:ev.target.result}));
                              r.readAsDataURL(file);
                              // Subir a Supabase Storage
                              if(dbOnline){
                                try{
                                  addToast("Subiendo foto...","info");
                                  const ext=file.name.split(".").pop()||"jpg";
                                  const path=`reportes/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
                                  const res=await fetch(`${SUPA_URL}/storage/v1/object/fotos-reportes/${path}`,{
                                    method:"POST",
                                    headers:{"Authorization":`Bearer ${SUPA_KEY}`,"Content-Type":file.type,"x-upsert":"true"},
                                    body:file
                                  });
                                  if(res.ok){
                                    const url=`${SUPA_URL}/storage/v1/object/public/fotos-reportes/${path}`;
                                    setFormRep(p=>({...p,foto:url}));
                                    addToast("Foto guardada en la nube ✓","success");
                                  }
                                }catch(err){ console.error(err); }
                              }
                            }}/>
                        </label>
                      ) : (
                        <div style={{position:"relative"}}>
                          <img src={formRep.foto} alt="" style={{width:"100%",height:160,objectFit:"cover",borderRadius:8,border:`1px solid ${T.borderDefault}`}}/>
                          <button onClick={()=>setFormRep(p=>({...p,foto:null}))} style={{
                            position:"absolute",top:8,right:8,background:"rgba(0,0,0,0.6)",
                            color:"#fff",border:"none",borderRadius:"50%",width:28,height:28,
                            cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",
                          }}>×</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Botón enviar */}
              <button onClick={crearReporte} style={{
                ...s.btnPrimary,width:"100%",padding:14,fontSize:14,
                background: formRep.huboIncidente==="Hubo incidente"
                  ? (formRep.urgencia==="Emergencia"?T.dangerBase:formRep.urgencia==="Urgente"?T.warningBase:T.accentBase)
                  : T.accentBase,
              }}>
                {formRep.huboIncidente==="Hubo incidente"
                  ? (formRep.urgencia==="Emergencia"?"🚨 Enviar Emergencia":formRep.urgencia==="Urgente"?"⚠️ Enviar Reporte Urgente":"📋 Enviar Reporte con Incidente")
                  : "📋 Enviar Reporte de Turno"}
              </button>

    </div>
  );
}
