export default function ThemeBtn({ dark, setDark }) {
  return (
    <button
      onClick={() => setDark(!dark)}
      style={{
        position: "fixed", top: 16, right: 16, zIndex: 9999,
        background: "transparent",
        border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,20,60,0.12)"}`,
        borderRadius: 6, padding: "5px 12px", cursor: "pointer",
        fontSize: 11, fontWeight: 600, letterSpacing: "0.5px",
        color: dark ? "#4A6080" : "#8098B4",
        fontFamily: "'IBM Plex Sans', sans-serif",
        transition: "all 0.15s",
      }}
    >
      {dark ? "LIGHT MODE" : "DARK MODE"}
    </button>
  );
}
