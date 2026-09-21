import { useMemo, useState } from 'react'
import { useStore } from '../lib/store.js'
import { getContractValuesByType } from '../lib/contractTypes.js'
import { Button, Card, Field, Select } from '../components/ui/index.jsx'
import Donut from '../components/Donut.jsx'
import { formatCurrencyBR, todayLocalISO } from '../lib/format.js'
import { deadlineBucket, getContractDeadlineBuckets } from '../lib/deadlines.js'

const PALETTE = ['#964AFB', '#22C55E', '#F5C518', '#38BDF8', '#FB7185', '#A78BFA', '#34D399', '#FBBF24', '#60A5FA', '#F472B6', '#2DD4BF']
const SEM_CLASSIFICACAO = 'Sem classificação'

// Faixas de prazo (decisão dos sócios): dia, semana, mês e próximos 6 meses.
const PRAZO_FAIXAS = [
  { value: 'dia', label: 'Vence hoje' },
  { value: 'semana', label: 'Vence esta semana' },
  { value: 'mes', label: 'Vence este mês' },
  { value: 'semestre', label: 'Próximos 6 meses' }
]

const tipoDe = (contract) => contract.tipo?.trim() || SEM_CLASSIFICACAO

export default function Dashboard() {
  const contracts = useStore((s) => s.contracts)
  const today = todayLocalISO()

  // Filtros opcionais e combináveis (decisão dos sócios). "todos"/"todas" = sem filtro.
  const [status, setStatus] = useState('todos')
  const [tipo, setTipo] = useState('todos')
  const [prazo, setPrazo] = useState('todas')

  const tiposDisponiveis = useMemo(
    () => [...new Set(contracts.map(tipoDe))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [contracts]
  )

  const filtrados = useMemo(
    () =>
      contracts.filter((c) => {
        if (status === 'ativos' && c.status !== 'ativo') return false
        if (status === 'inativos' && c.status === 'ativo') return false
        if (tipo !== 'todos' && tipoDe(c) !== tipo) return false
        if (prazo !== 'todas' && deadlineBucket(c.vencimento, today) !== prazo) return false
        return true
      }),
    [contracts, status, tipo, prazo, today]
  )

  const ativos = filtrados.filter((c) => c.status === 'ativo')
  const inativos = filtrados.filter((c) => c.status !== 'ativo')

  const valorAtivos = ativos.reduce((a, c) => a + (Number(c.valor) || 0), 0)
  const valorInativos = inativos.reduce((a, c) => a + (Number(c.valor) || 0), 0)

  const prazos = useMemo(() => getContractDeadlineBuckets(filtrados, today), [filtrados, today])
  const porClassificacao = useMemo(() => getContractValuesByType(filtrados), [filtrados])

  const filtroAtivo = status !== 'todos' || tipo !== 'todos' || prazo !== 'todas'
  const limparFiltros = () => {
    setStatus('todos')
    setTipo('todos')
    setPrazo('todas')
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Dashboard</h1>
      <p className="mb-6 text-sm text-muted">
        Indicadores dos contratos — referência {today.split('-').reverse().join('/')}.
      </p>

      <Card as="section" aria-label="Filtros" className="mb-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="todos">Todos</option>
              <option value="ativos">Ativos</option>
              <option value="inativos">Inativos</option>
            </Select>
          </Field>
          <Field label="Classificação (tipo)">
            <Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="todos">Todas</option>
              {tiposDisponiveis.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Faixa de prazo">
            <Select value={prazo} onChange={(e) => setPrazo(e.target.value)}>
              <option value="todas">Todas</option>
              {PRAZO_FAIXAS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-muted" aria-live="polite">
            {filtrados.length} de {contracts.length}{' '}
            {contracts.length === 1 ? 'contrato' : 'contratos'}
          </p>
          {filtroAtivo && (
            <Button variant="ghost" onClick={limparFiltros}>
              Limpar filtros
            </Button>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/60">Contratos ativos / inativos</h2>
          <Donut
            centerLabel={filtrados.length}
            emptyMessage="Nenhum contrato para os filtros selecionados."
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
            emptyMessage="Nenhum valor para os filtros selecionados."
            segments={[
              { label: 'Ativos', value: valorAtivos, display: `R$ ${formatCurrencyBR(valorAtivos)}`, color: '#964AFB' },
              { label: 'Inativos', value: valorInativos, display: `R$ ${formatCurrencyBR(valorInativos)}`, color: '#3F3357' }
            ]}
          />
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/60">Prazos (vencimentos)</h2>
          <Donut
            centerLabel={prazos.dia + prazos.semana + prazos.mes + prazos.semestre}
            emptyMessage="Nenhum contrato com vencimento nas próximas faixas de prazo."
            segments={[
              { label: 'Vence hoje', value: prazos.dia, color: '#EF4444' },
              { label: 'Vence esta semana', value: prazos.semana, color: '#F97316' },
              { label: 'Vence este mês', value: prazos.mes, color: '#F5C518' },
              { label: 'Próximos 6 meses', value: prazos.semestre, color: '#38BDF8' }
            ]}
          />
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/60">Valor por classificação</h2>
          <Donut
            centerLabel={porClassificacao.length}
            emptyMessage="Nenhum contrato com valor para os filtros selecionados."
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
