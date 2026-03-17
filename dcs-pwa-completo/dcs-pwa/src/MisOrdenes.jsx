import EstadoBadge from "./EstadoBadge.jsx";
import { useApp } from "./AppContext";
import { useData } from "./DataContext";
import { useMemo } from "react";

export default function MisOrdenes({ abrirOrden }) {
  const { T, s, usuario } = useApp();
  const { ordenes } = useData();
  const misOrdenes = useMemo(() => usuario?.rol === "tecnico" ? ordenes.filter(o => o.asignadoA === usuario.id) : ordenes, [ordenes, usuario]);
  const activas = misOrdenes.filter(o => o.estado !== "Resuelto" && o.estado !== "Cerrado");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 680 }}>
      <div style={{ ...s.card, background: `linear-gradient(135deg,${T.accentBase}10,${T.surfacePrimary})`, border: `1px solid ${T.accentBorder}` }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: T.textPrimary, marginBottom: 2 }}>≡ Asignaciones</div>
        <div style={{ fontSize: 12, color: T.textTertiary }}>{activas.length} asignacion{activas.length !== 1 ? "es" : ""} activa{activas.length !== 1 ? "s" : ""}</div>
      </div>
      {activas.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: T.textTertiary, fontSize: 12 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
          No tienes asignaciones pendientes.
        </div>
      )}
      {activas.map(o => (
        <div key={o.id} onClick={() => abrirOrden(o)} style={{ ...s.card, cursor: "pointer", borderLeft: `4px solid ${o.estado === "En proceso" ? T.accentBase : T.warningBase}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, flex: 1, marginRight: 8 }}>{o.ph}</div>
            <EstadoBadge estado={o.estado} />
          </div>
          <div style={{ fontSize: 12, color: T.textSecondary, marginBottom: 4 }}>{o.tipo}</div>
          <div style={{ fontSize: 11, color: T.textTertiary }}>{o.ubicacion} · {o.fecha}</div>
          {o.foto_dano && (<img src={o.foto_dano} alt="" style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 6, marginTop: 8, border: `1px solid ${T.borderDefault}` }} />)}
        </div>
      ))}
    </div>
  );
}
