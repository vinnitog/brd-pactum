import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { isEquipeBRD, visibleParties } from '../lib/permissions.js'
import { useStore } from '../lib/store.js'
import { Card, Badge, EmptyState } from '../components/ui/index.jsx'
import { formatDateBR, todayLocalISO } from '../lib/format.js'
import { getUpcomingEvents } from '../lib/deadlines.js'

function firstName(name = '') {
  const parts = name.trim().split(/\s+/)
  // Mantém o título junto do nome (ex.: "Dr. Luis") em vez de "Dr.".
  if (parts.length > 1 && /\.$/.test(parts[0])) return `${parts[0]} ${parts[1]}`
  return parts[0] || name
}

export default function Home() {
  const { user } = useAuth()
  const parties = useStore((s) => s.parties)
  const contracts = useStore((s) => s.contracts)
  const events = useStore((s) => s.events)

  const mine = visibleParties(user, parties)
  const clientes = mine.filter((p) => p.kind === 'cliente')
  const fornecedores = mine.filter((p) => p.kind === 'fornecedor')
  const myPartyIds = new Set(mine.map((p) => p.id))
  const myContracts = contracts.filter((c) => myPartyIds.has(c.partyId))
  const upcoming = getUpcomingEvents(events, {
    today: todayLocalISO(),
    partyIds: myPartyIds,
    limit: 4
  })

  const tiles = [
    { to: '/clientes', label: 'Clientes', count: clientes.length, desc: 'Cadastros, contratos e agenda de cada cliente.' },
    {
      to: '/fornecedores',
      label: 'Fornecedores',
      count: fornecedores.length,
      desc: 'Cadastros e contratos com fornecedores.'
    },
    { to: '/agenda', label: 'Agenda', count: upcoming.length, desc: 'Vencimentos, atualizações e lembretes.' }
  ]
  if (isEquipeBRD(user)) {
    tiles.push({
      to: '/dashboard',
      label: 'Dashboard',
      count: myContracts.length,
      desc: 'Indicadores dos contratos ativos e inativos.'
    })
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Olá, {firstName(user?.name)}.</h1>
        <p className="mt-1 text-sm text-muted">O que você quer fazer hoje?</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <Card as={Link} to={t.to} key={t.to} className="group flex flex-col transition-colors hover:border-brd/50 hover:bg-brd/5">
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold text-white">{t.label}</h2>
              <Badge tone="brd">{t.count}</Badge>
            </div>
            <p className="mt-2 flex-1 text-sm text-muted">{t.desc}</p>
            <span className="mt-6 text-sm font-medium text-brd-200 group-hover:text-white">Abrir {t.label.toLowerCase()} →</span>
          </Card>
        ))}
      </div>

      <section className="mt-10" aria-labelledby="upcoming-title">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="upcoming-title" className="text-xl font-semibold">Próximos vencimentos</h2>
          <Link to="/agenda" className="inline-flex min-h-11 items-center text-sm font-medium text-brd-200 hover:text-white">Ver agenda completa →</Link>
        </div>
        {upcoming.length === 0 && <EmptyState title="Nenhum vencimento previsto a partir de hoje.">Consulte a agenda completa para ver os demais registros.</EmptyState>}
        <div className="space-y-2">
          {upcoming.map((e) => {
            const party = parties.find((p) => p.id === e.partyId)
            const tone = e.urgency === 'alta' ? 'red' : e.urgency === 'media' ? 'yellow' : 'green'
            return (
              <Link
                key={e.id}
                to="/agenda"
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 transition hover:border-brd/40"
              >
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                    e.urgency === 'alta' ? 'bg-urg-alta' : e.urgency === 'media' ? 'bg-urg-media' : 'bg-urg-baixa'
                  }`}
                />
                <span className="min-w-0 flex-1 text-sm text-white/80 [overflow-wrap:anywhere]">
                  {e.note} — {party?.name}
                </span>
                <Badge tone={tone}>{formatDateBR(e.date)}</Badge>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
