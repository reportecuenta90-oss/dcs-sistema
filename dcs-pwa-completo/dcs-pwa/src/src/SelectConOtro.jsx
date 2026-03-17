// ── Select con campo "Otro" reutilizable ─────────────────────────────────────
export default function SelectConOtro({
  label, opciones, valor, otroValor,
  onChange, onOtroChange,
  style, inputPlaceholder, s, T,
}) {
  const esOtro = valor === opciones[opciones.length - 1] || (valor && !opciones.includes(valor));

  return (
    <div>
      {label && <label style={s.label}>{label}</label>}
      <select
        value={esOtro ? opciones[opciones.length - 1] : valor}
        onChange={e => {
          const v = e.target.value;
          const esNuevoOtro = v === opciones[opciones.length - 1];
          onChange(esNuevoOtro ? opciones[opciones.length - 1] : v);
          if (!esNuevoOtro) onOtroChange("");
        }}
        style={style || s.select}
      >
        {opciones.map(o => <option key={o}>{o}</option>)}
      </select>

      {esOtro && (
        <input
          autoFocus
          type="text"
          value={otroValor || ""}
          onChange={e => onOtroChange(e.target.value)}
          placeholder={inputPlaceholder || "Escribe aquí..."}
          style={{
            ...s.input,
            marginTop: 8,
            borderColor: T.accentBase,
            outline: `2px solid ${T.accentBase}22`,
          }}
        />
      )}
    </div>
  );
}
