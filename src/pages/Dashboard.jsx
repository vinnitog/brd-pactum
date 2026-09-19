import { useMemo } from 'react'
import { useStore } from '../lib/store.js'
import { getContractValuesByType } from '../lib/contractTypes.js'
import { Card } from '../components/ui/index.jsx'
import Donut from '../components/Donut.jsx'
import { formatCurrencyBR, todayLocalISO } from '../lib/format.js'
import { getDeadlineBuckets } from '../lib/deadlines.js'

const PALETTE = ['#964AFB', '#22C55E', '#F5C518', '#38BDF8', '#FB7185', '#A78BFA', '#34D399', '#FBBF24', '#60A5FA', '#F472B6', '#2DD4BF']

export default function Dashboard() {
  const contracts = useStore((s) => s.contracts)
  const events = useStore((s) => s.events)
  const today = todayLocalISO()

  const ativos = contracts.filter((c) => c.status === 'ativo')
  const inativos = contracts.filter((c) => c.status !== 'ativo')

  const valorAtivos = ativos.reduce((a, c) => a + (Number(c.valor) || 0), 0)
  const valorInativos = inativos.reduce((a, c) => a + (Number(c.valor) || 0), 0)

  // Prazos: baseados nos vencimentos futuros da agenda.
  const prazos = useMemo(() => getDeadlineBuckets(events, today), [events, today])

  // Valor dos contratos por tipo específico.
  const porClassificacao = useMemo(() => getContractValuesByType(contracts), [contracts])

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Dashboard</h1>
      <p className="mb-6 text-sm text-muted">Indicadores dos contratos — referência {today.split('-').reverse().join('/')}.</p>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/60">Contratos ativos / inativos</h2>
          <Donut
            centerLabel={contracts.length}
            segments={[
              { label: 'Ativos', value: ativos.length, color: '#22C55E' },
              { label: 'Inativos', value: inativos.length, color: '#FB7185' }
            ]}
          />
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/60">Valor — ativos / inativos</h2>
          <Donut
            centerLabel={`R$ ${formatCurrencyBR(valorAtivos + valorInativos)}`}
            segments={[
              { label: 'Ativos', value: valorAtivos, display: `R$ ${formatCurrencyBR(valorAtivos)}`, color: '#964AFB' },
              { label: 'Inativos', value: valorInativos, display: `R$ ${formatCurrencyBR(valorInativos)}`, color: '#3F3357' }
            ]}
          />
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/60">Prazos (vencimentos)</h2>
          <Donut
            centerLabel={prazos.semana + prazos.mes + prazos.semestre + prazos.ano}
            segments={[
              { label: 'Vence esta semana', value: prazos.semana, color: '#EF4444' },
              { label: 'Vence este mês', value: prazos.mes, color: '#F5C518' },
              { label: 'Próximos 6 meses', value: prazos.semestre, color: '#38BDF8' },
              { label: 'Próximos anos', value: prazos.ano, color: '#22C55E' }
            ]}
          />
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/60">Valor por classificação</h2>
          <Donut
            centerLabel={porClassificacao.length}
            segments={porClassificacao.map(([label, value], i) => ({
              label,
              value,
              display: `R$ ${formatCurrencyBR(value)}`,
              color: PALETTE[i % PALETTE.length]
            }))}
          />
        </Card>
      </div>
    </div>
  )
}
