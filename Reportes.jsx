import { useApp } from "./AppContext";

export default function Reportes({ navTo }) {
  const { T, s } = useApp();

  const opciones = [
    {
      id: "reporteMensual",
      icon: "📊",
      titulo: "Reporte Mensual",
      desc: "Resumen completo del mes: órdenes, técnicos, conserjes, materiales, incidencias y proyectos de mantenimiento.",
      color: T.accentBase,
      colorMuted: T.accentMuted,
      colorBorder: T.accentBorder,
      colorText: T.accentText,
    },
    {
      id: "reporteSemanal",
      icon: "📋",
      titulo: "Reporte Semanal",
      desc: "Resumen de la semana: actividades por PH, técnicos, conserjes, incidencias y proyectos en proceso.",
      color: T.successBase,
      colorMuted: T.successMuted,
      colorBorder: `${T.successBase}44`,
      colorText: T.successText,
    },
    {
      id: "reporteJunta",
      icon: "🏛",
      titulo: "Reporte Junta Directiva y Residentes",
      desc: "Informe mensual oficial: financiero, actividades, proyectos en proceso y mantenimiento para la Junta y Residentes.",
      color: "#C9A84C",
      colorMuted: "#fefce8",
      colorBorder: "#fde68a",
      colorText: "#92400e",
    },
  ];

  return (
    <div style={{ maxWidth: 620, display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{
        ...s.card,
        background: `linear-gradient(135deg,${T.accentBase}10,${T.surfacePrimary})`,
        border: `1px solid ${T.accentBorder}`,
      }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: T.textPrimary, marginBottom: 4 }}>
          📊 Reportes
        </div>
        <div style={{ fontSize: 12, color: T.textTertiary }}>
          Selecciona el tipo de reporte que deseas generar en PDF.
        </div>
      </div>

      {/* Opciones */}
      {opciones.map(op => (
        <button
          key={op.id}
          onClick={() => navTo(op.id)}
          style={{
            ...s.card,
            cursor: "pointer",
            textAlign: "left",
            border: `1px solid ${op.colorBorder}`,
            background: op.colorMuted,
            transition: "box-shadow .15s, transform .1s",
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 20px ${op.color}22`; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
        >
          <div style={{
            width: 56, height: 56, borderRadius: 12, flexShrink: 0,
            background: `${op.color}22`,
            border: `1.5px solid ${op.colorBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26,
          }}>
            {op.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: op.colorText, marginBottom: 4 }}>
              {op.titulo}
            </div>
            <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.5 }}>
              {op.desc}
            </div>
          </div>
          <span style={{ fontSize: 20, color: op.colorText, flexShrink: 0 }}>›</span>
        </button>
      ))}
    </div>
  );
}
