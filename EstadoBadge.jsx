import { ESTADO_CONFIG } from "./constants.js";

export default function EstadoBadge({ estado }) {
  const c = ESTADO_CONFIG[estado] || {};
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 4,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.3px",
      background: c.bg, color: c.text,
      border: `1px solid ${c.border}`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {estado}
    </span>
  );
}
