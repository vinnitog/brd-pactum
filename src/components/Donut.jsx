// Gráfico de rosca (donut) em SVG puro — sem dependências. Estilo semelhante
// ao "integra": segmentos coloridos + legenda + percentuais.
export default function Donut({ segments, size = 190, thickness = 26, centerLabel, emptyMessage = 'Sem dados para exibir.' }) {
  const data = segments.filter((s) => s.value > 0)
  const total = data.reduce((a, s) => a + s.value, 0)
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  const cx = size / 2

  let offset = 0

  return (
    <div className="donut-layout min-w-0">
      <div className="donut-content">
        <div className="relative max-w-full shrink-0" style={{ width: size, aspectRatio: '1' }}>
          <svg aria-hidden="true" className="h-auto w-full" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
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
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ padding: thickness + 8 }}>
            <span className={`max-w-full text-center font-bold tabular-nums text-white [overflow-wrap:anywhere] ${String(centerLabel ?? total).length > 9 ? 'text-base' : 'text-2xl'}`}>{centerLabel ?? total}</span>
          </div>
        </div>

        <ul className="w-full min-w-0 space-y-3">
          {data.length === 0 && <li className="text-sm text-muted">{emptyMessage}</li>}
          {data.map((s, i) => {
            const pct = total > 0 ? Math.round((s.value / total) * 100) : 0
            return (
              <li key={i} className="grid grid-cols-[0.75rem_minmax(0,1fr)] items-start gap-x-2 text-sm">
                <span aria-hidden="true" className="mt-1 h-3 w-3 rounded-full" style={{ background: s.color }} />
                <span className="min-w-0 text-white/80 [overflow-wrap:anywhere]">{s.label}</span>
                <span className="col-start-2 flex flex-wrap justify-between gap-x-3 gap-y-1 tabular-nums">
                  <span className="min-w-0 font-medium text-white/90 [overflow-wrap:anywhere]">{s.display ?? s.value}</span>
                  <span className="text-muted">{pct}%</span>
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
