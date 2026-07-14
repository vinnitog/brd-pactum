// Wordmark "BRD pactum" — recriado em SVG a partir da identidade do escritório:
// "B" gráfico em roxo da marca (#964AFB), "RD" branco bold e "pactum." itálico.
export function LogoMark({ size = 32, className = '' }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#0B0911" />
      <path
        fill="#964AFB"
        d="M18 14h16.5c6 0 10 3.2 10 8.3 0 3.3-1.9 5.8-5 7 3.8 1 6.1 3.8 6.1 7.6 0 5.6-4.4 9.1-11.2 9.1H18V14zm8.6 6.4v6.5h6.2c2.6 0 4.1-1.2 4.1-3.3s-1.5-3.2-4.1-3.2h-6.2zm0 12.4v6.8h6.7c2.8 0 4.4-1.3 4.4-3.4 0-2.2-1.6-3.4-4.4-3.4h-6.7z"
      />
      <rect x="18" y="26.6" width="9" height="3.4" rx="1.7" fill="#0B0911" />
    </svg>
  )
}

export default function Logo({ className = '', markSize = 30 }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={markSize} />
      <span className="text-xl font-bold tracking-tight text-white">
        <span className="text-brd">B</span>RD
        <span className="ml-1 font-medium italic text-white/70">pactum.</span>
      </span>
    </span>
  )
}
