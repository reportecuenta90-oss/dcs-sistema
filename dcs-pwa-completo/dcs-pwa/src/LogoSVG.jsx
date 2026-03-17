// ── Logo SVG — nudo entrelazado con gradiente teal→azul ──────────────────────
export default function LogoSVG({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#00D4AA" />
          <stop offset="50%"  stopColor="#00B4D8" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>
      {/* Lazo vertical */}
      <path d="M50 8 C32 8 18 20 18 35 C18 50 32 57 50 57 C68 57 82 50 82 35 C82 20 68 8 50 8 Z"
        stroke="url(#lg)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M50 92 C32 92 18 80 18 65 C18 50 32 43 50 43 C68 43 82 50 82 65 C82 80 68 92 50 92 Z"
        stroke="url(#lg)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Lazo horizontal */}
      <path d="M8 50 C8 32 20 18 35 18 C50 18 57 32 57 50 C57 68 50 82 35 82 C20 82 8 68 8 50 Z"
        stroke="url(#lg)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M92 50 C92 32 80 18 65 18 C50 18 43 32 43 50 C43 68 50 82 65 82 C80 82 92 68 92 50 Z"
        stroke="url(#lg)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Centro */}
      <circle cx="50" cy="50" r="7" stroke="url(#lg)" strokeWidth="4.5" fill="none" />
    </svg>
  );
}
