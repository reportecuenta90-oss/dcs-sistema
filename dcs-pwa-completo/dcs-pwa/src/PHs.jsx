import { PHS } from "./constants.js";
import { useApp } from "./AppContext";
import { useData } from "./DataContext";

export default function PHs({ navTo }) {
  const { T, s, setPhFiltro } = useApp();
  const { ordenes, reportes } = useData();

  // setPhFiltro viene de DataContext
  const { setPhFiltro: setPhFiltroData } = useData();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
      {PHS.map(ph => {
        const total   = ordenes.filter(o => o.ph === ph).length;
        const pend    = ordenes.filter(o => o.ph === ph && o.estado === "Pendiente").length;
        const urgente = reportes.filter(r => r.ph === ph && r.novedad).length;
        const reps    = reportes.filter(r => r.ph === ph).length;
        return (
          <button
            key={ph}
            onClick={() => { setPhFiltroData(ph); navTo("ordenes"); }}
            style={{
              background: T.surfacePrimary,
              border: `1px solid ${urgente > 0 ? `${T.dangerBase}44` : pend > 0 ? `${T.warningBase}44` : T.borderDefault}`,
              borderRadius: 8, padding: 16, cursor: "pointer", textAlign: "left",
              transition: "border-color .15s, background .15s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{ph}</div>
                <div style={{ fontSize: 11, color: T.textTertiary, marginTop: 3 }}>{total} órd. · {reps} reportes</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                {urgente > 0 && (<span style={{ background: T.dangerMuted, color: T.dangerText, border: `1px solid ${T.dangerBase}33`, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4 }}>⚠ {urgente} urgente{urgente > 1 ? "s" : ""}</span>)}
                {pend > 0 && (<span style={{ background: T.warningMuted, color: T.warningText, border: `1px solid ${T.warningBase}33`, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4 }}>{pend} pend.</span>)}
                {total === 0 && !urgente && (<span style={{ background: T.successMuted, color: T.successText, border: `1px solid ${T.successBase}33`, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4 }}>OK</span>)}
                <span style={{ color: T.textTertiary, fontSize: 14, marginTop: 2 }}>›</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
