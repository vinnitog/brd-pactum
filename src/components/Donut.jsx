// Gráfico de rosca (donut) em SVG puro — sem dependências. Estilo semelhante
// ao "integra": segmentos coloridos + legenda + percentuais.
export default function Donut({ segments, size = 190, thickness = 26, centerLabel }) {
  const data = segments.filter((s) => s.value > 0)
  const total = data.reduce((a, s) => a + s.value, 0)
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  const cx = size / 2

  let offset = 0

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={thickness} />
          {total > 0 &&
            data.map((s, i) => {
              const len = (s.value / total) * c
              const seg = (
                <circle
                  key={i}
                  cx={cx}
                  cy={cx}
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={thickness}
                  strokeDasharray={`${len} ${c - len}`}
                  strokeDashoffset={-offset}
                  transform={`rotate(-90 ${cx} ${cx})`}
                  strokeLinecap="butt"
                />
              )
              offset += len
              return seg
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{centerLabel ?? total}</span>
        </div>
      </div>

      <ul className="w-full space-y-2">
        {data.length === 0 && <li className="text-sm text-white/40">Sem dados.</li>}
        {data.map((s, i) => {
          const pct = total > 0 ? Math.round((s.value / total) * 100) : 0
          return (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span className="h-3 w-3 rounded-full" style={{ background: s.color }} />
              <span className="flex-1 text-white/70">{s.label}</span>
              <span className="font-medium text-white/90">{s.display ?? s.value}</span>
              <span className="w-10 text-right text-white/40">{pct}%</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
