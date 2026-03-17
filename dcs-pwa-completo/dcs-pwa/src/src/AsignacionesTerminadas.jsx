import EstadoBadge from "./EstadoBadge.jsx";

export default function AsignacionesTerminadas({ misOrdenes, T, s, abrirOrden }) {
  const terminadas = misOrdenes.filter(o => o.estado === "Resuelto" || o.estado === "Cerrado");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 680 }}>
      {/* Header */}
      <div style={{
        ...s.card,
        background: `linear-gradient(135deg,${T.successBase}10,${T.surfacePrimary})`,
        border: `1px solid ${T.successBase}33`,
      }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: T.textPrimary, marginBottom: 2 }}>✅ Asignaciones Terminadas</div>
        <div style={{ fontSize: 12, color: T.textTertiary }}>
          {terminadas.length} asignacion{terminadas.length !== 1 ? "es" : ""} completada{terminadas.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Vacío */}
      {terminadas.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: T.textTertiary, fontSize: 12 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
          Aún no has completado asignaciones.
        </div>
      )}

      {/* Lista */}
      {terminadas.map(o => (
        <div
          key={o.id}
          onClick={() => abrirOrden(o)}
          style={{
            ...s.card,
            cursor: "pointer",
            borderLeft: `4px solid ${T.successBase}`,
            opacity: 0.9,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, flex: 1, marginRight: 8 }}>{o.ph}</div>
            <EstadoBadge estado={o.estado} />
          </div>
          <div style={{ fontSize: 12, color: T.textSecondary, marginBottom: 4 }}>{o.tipo}</div>
          <div style={{ fontSize: 11, color: T.textTertiary }}>{o.ubicacion} · {o.fecha}</div>
          {o.foto_resuelta && (
            <img src={o.foto_resuelta} alt="" style={{
              width: "100%", height: 100, objectFit: "cover",
              borderRadius: 6, marginTop: 8, border: `1px solid ${T.successBase}33`,
            }} />
          )}
        </div>
      ))}
    </div>
  );
}
