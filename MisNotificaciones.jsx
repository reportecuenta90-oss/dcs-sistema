export default function MisNotificaciones({
  mensajes, notifs, setNotifs, usuario,
  msgBusqCons, setMsgBusqCons,
  respAbiertas, setRespAbiertas,
  textosResp, setTextosResp,
  setMensajes, addToast, pushNotif,
  unread,
  T, s,
}) {
  const misMensajes = mensajes.filter(m => m.para === usuario.nombre || m.para === "todos");

  const marcarLeidoMsg = (id) => setMensajes(p => p.map(m => m.id === id ? { ...m, leidoPor: [...(m.leidoPor || []), usuario.nombre] } : m));

  const responderMsg = (msgId) => {
    const texto = textosResp[msgId] || "";
    if (!texto.trim()) return;
    setMensajes(p => p.map(m => m.id === msgId ? {
      ...m, respuestas: [...(m.respuestas || []), {
        de: usuario.nombre, texto: texto.trim(),
        hora: new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }),
        fecha: new Date().toISOString().split("T")[0],
        leidoPor: [usuario.nombre],
      }]
    } : m));
    setTextosResp(p => ({ ...p, [msgId]: "" }));
    setRespAbiertas(p => ({ ...p, [msgId]: false }));
    marcarLeidoMsg(msgId);
    pushNotif(`💬 ${usuario.nombre} respondió tu mensaje`, "💬");
    addToast("Respuesta enviada");
  };

  const todasItems = [
    ...misMensajes.map(m => ({ ...m, _tipo: "mensaje" })),
    ...notifs.map(n => ({ ...n, _tipo: "notif" })),
  ].filter(item => {
    if (!msgBusqCons) return true;
    const txt = item.texto || item.msg || "";
    return txt.toLowerCase().includes(msgBusqCons.toLowerCase());
  });

  const sinLeerTotal = misMensajes.filter(m => !(m.leidoPor || []).includes(usuario.nombre)).length + unread;

  return (
    <div style={{ maxWidth: 540, display: "flex", flexDirection: "column", gap: 12 }}>

      {/* Header */}
      <div style={{ ...s.card, background: `linear-gradient(135deg,${T.accentBase}10,${T.surfacePrimary})`, border: `1px solid ${T.accentBorder}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 26 }}>🔔</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>Notificaciones y Mensajes</div>
              <div style={{ fontSize: 11, color: T.textTertiary, marginTop: 1 }}>
                {sinLeerTotal > 0 ? <span style={{ color: T.dangerText, fontWeight: 700 }}>{sinLeerTotal} sin leer</span> : "Todo al día"}
              </div>
            </div>
          </div>
          {sinLeerTotal > 0 && (
            <button onClick={() => { setNotifs(p => p.map(n => ({ ...n, read: true }))); misMensajes.forEach(m => marcarLeidoMsg(m.id)); }}
              style={{ ...s.btnSecondary, padding: "7px 12px", fontSize: 11 }}>
              Todo leído
            </button>
          )}
        </div>
        <input value={msgBusqCons} onChange={e => setMsgBusqCons(e.target.value)} placeholder="Buscar en notificaciones..." style={{ ...s.input, fontSize: 12 }} />
      </div>

      {/* Vacío */}
      {todasItems.length === 0 && (
        <div style={{ ...s.card, textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>{msgBusqCons ? "🔍" : "🔕"}</div>
          <div style={{ fontSize: 13, color: T.textTertiary }}>{msgBusqCons ? "Sin resultados" : "No tienes notificaciones aún"}</div>
        </div>
      )}

      {/* Lista */}
      {todasItems.map(item => {
        if (item._tipo === "mensaje") {
          const leido = (item.leidoPor || []).includes(usuario.nombre);
          const esCom = item.tipo === "comunicado";
          const color = esCom ? "#7C3AED" : T.accentBase;
          const respAbierta = respAbiertas[item.id] || false;
          return (
            <div key={item.id} style={{
              ...s.card, padding: "14px 16px",
              borderLeft: `4px solid ${leido ? T.borderDefault : color}`,
              border: `1px solid ${leido ? T.borderDefault : color + "33"}`,
              background: leido ? T.surfacePrimary : `${color}06`,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: esCom ? "#EDE9FE" : T.accentMuted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                  {esCom ? "📢" : "💬"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color }}>{esCom ? "Comunicado — Ing. Mitche" : "Mensaje de Ing. Mitche"}</span>
                    {!leido && <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.dangerBase, display: "inline-block" }} />}
                  </div>
                  <div style={{ fontSize: 10, color: T.textTertiary, marginBottom: 6 }}>{item.fecha} {item.hora}</div>
                  <div style={{ fontSize: 13, color: T.textPrimary, lineHeight: 1.7 }}>{item.texto}</div>
                </div>
              </div>

              {(item.respuestas || []).length > 0 && (
                <div style={{ marginLeft: 44, marginBottom: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                  {item.respuestas.map((r, i) => (
                    <div key={i} style={{ background: T.surfaceSecond, borderRadius: 6, padding: "7px 10px", borderLeft: `3px solid ${T.successBase}`, fontSize: 12 }}>
                      <span style={{ fontWeight: 700, color: T.successText }}>{r.de}</span>
                      <span style={{ color: T.textTertiary, fontSize: 10, marginLeft: 6 }}>{r.hora}</span>
                      <div style={{ color: T.textPrimary, marginTop: 2, lineHeight: 1.6 }}>{r.texto}</div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginLeft: 44, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {!leido && <button onClick={() => marcarLeidoMsg(item.id)} style={{ ...s.btnSecondary, padding: "5px 10px", fontSize: 11 }}>Leído</button>}
                <button onClick={() => setRespAbiertas(p => ({ ...p, [item.id]: !p[item.id] }))}
                  style={{ ...s.btnSecondary, padding: "5px 10px", fontSize: 11, color: T.accentText, borderColor: T.accentBorder }}>
                  {respAbierta ? "Cancelar" : "Responder"}
                </button>
              </div>

              {respAbierta && (
                <div style={{ marginLeft: 44, marginTop: 10, display: "flex", gap: 8 }}>
                  <textarea value={textosResp[item.id] || ""} onChange={e => setTextosResp(p => ({ ...p, [item.id]: e.target.value }))}
                    rows={2} placeholder="Escribe tu respuesta..." style={{ ...s.textarea, flex: 1, fontSize: 12 }} />
                  <button onClick={() => responderMsg(item.id)} style={{ ...s.btnPrimary, padding: "8px 14px", fontSize: 12, alignSelf: "flex-end" }}>Enviar</button>
                </div>
              )}
            </div>
          );
        }

        // Notificación
        const n = item;
        const ic = n.icon === "✅" ? T.successText : n.icon === "⚠️" ? T.warningText : n.icon === "💬" ? T.accentText : T.textSecondary;
        const ib = n.icon === "✅" ? T.successMuted : n.icon === "⚠️" ? T.warningMuted : n.icon === "💬" ? T.accentMuted : T.surfaceSecond;
        return (
          <div key={n.id}
            onClick={() => setNotifs(p => p.map(x => x.id === n.id ? { ...x, read: true } : x))}
            style={{
              ...s.card, cursor: "pointer", padding: "12px 16px",
              borderLeft: `4px solid ${n.read ? T.borderDefault : ic}`,
              border: `1px solid ${n.read ? T.borderDefault : ic + "33"}`,
              opacity: n.read ? 0.85 : 1,
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: ib, border: `1px solid ${ic}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{n.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: n.read ? T.textSecondary : T.textPrimary, fontWeight: n.read ? 400 : 600, lineHeight: 1.5 }}>{n.msg}</div>
                <div style={{ fontSize: 10, color: T.textTertiary, marginTop: 2 }}>{n.time}</div>
              </div>
              {!n.read && <div style={{ width: 7, height: 7, borderRadius: "50%", background: ic, flexShrink: 0 }} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
