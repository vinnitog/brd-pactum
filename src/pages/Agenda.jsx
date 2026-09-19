import { useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { visibleParties } from '../lib/permissions.js'
import { useStore } from '../lib/store.js'
import AgendaList from '../components/AgendaList.jsx'
import { formatDateBR, todayLocalISO } from '../lib/format.js'
import { isValidLocalISO } from '../lib/deadlines.js'

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]
const URG_DOT = { alta: 'bg-urg-alta', media: 'bg-urg-media', baixa: 'bg-urg-baixa' }

export default function Agenda() {
  const { user } = useAuth()
  const parties = useStore((s) => s.parties)
  const allEvents = useStore((s) => s.events)
  const [mode, setMode] = useState('agenda') // agenda (calendário) | lista
  const [cursor, setCursor] = useState(() => new Date())
  const [selectedDay, setSelectedDay] = useState(null)
  const today = todayLocalISO()

  function changeMonth(offset) {
    setCursor(new Date(year, month + offset, 1))
    setSelectedDay(null)
  }

  const visibleIds = useMemo(() => new Set(visibleParties(user, parties).map((p) => p.id)), [user, parties])
  const events = useMemo(() => allEvents.filter((e) => visibleIds.has(e.partyId)), [allEvents, visibleIds])

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`

  const byDay = useMemo(() => {
    const map = {}
    for (const e of events) {
      if (isValidLocalISO(e.date) && e.date.startsWith(monthPrefix)) {
        ;(map[e.date] ||= []).push(e)
      }
    }
    return map
  }, [events, monthPrefix])

  const cells = useMemo(() => {
    const first = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const arr = []
    for (let i = 0; i < first; i++) arr.push(null)
    for (let d = 1; d <= daysInMonth; d++) arr.push(d)
    return arr
  }, [year, month])

  const selectedEvents = selectedDay ? byDay[selectedDay] || [] : []

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Agenda</h1>
          <p className="text-sm text-muted">Vencimentos, atualizações e mudanças de qualificação.</p>
        </div>
        <div className="flex gap-1 rounded-xl border border-white/10 bg-black/30 p-1">
          {[
            ['agenda', 'Agenda'],
            ['lista', 'Lista']
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              aria-pressed={mode === key}
              className={`min-h-11 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                mode === key ? 'bg-brd/20 text-brd-200' : 'text-muted hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {mode === 'lista' ? (
        <AgendaList events={events} showParty canManage={user?.role === 'advogado'} />
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => changeMonth(-1)}
                aria-label="Mês anterior"
                className="min-h-11 min-w-11 rounded-lg px-3 py-2 text-white/70 hover:bg-white/5 hover:text-white"
              >
                ‹
              </button>
              <h2 className="text-lg font-semibold">
                {MONTHS[month]} {year}
              </h2>
              <button
                onClick={() => changeMonth(1)}
                aria-label="Próximo mês"
                className="min-h-11 min-w-11 rounded-lg px-3 py-2 text-white/70 hover:bg-white/5 hover:text-white"
              >
                ›
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted">
              {WEEKDAYS.map((w) => (
                <div key={w} className="py-1">
                  {w}
                </div>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {cells.map((d, i) => {
                if (!d) return <div key={i} />
                const iso = `${monthPrefix}-${String(d).padStart(2, '0')}`
                const evs = byDay[iso] || []
                const active = selectedDay === iso
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDay(iso)}
                    aria-label={`${formatDateBR(iso)}: ${evs.length} evento${evs.length === 1 ? '' : 's'}`}
                    aria-pressed={active}
                    aria-current={iso === today ? 'date' : undefined}
                    className={`flex min-h-11 min-w-0 flex-col items-center justify-center rounded-lg border py-2 text-sm tabular-nums transition-colors sm:aspect-square ${
                      active ? 'border-brd-200 bg-brd-600 text-white' : iso === today ? 'border-brd/60 text-brd-200 hover:bg-white/5' : 'border-transparent hover:bg-white/5 text-white/80'
                    }`}
                  >
                    <span>{d}</span>
                    {evs.length > 0 && (
                      <span aria-hidden="true" className="mt-0.5 flex gap-0.5">
                        {evs.slice(0, 3).map((e, idx) => (
                          <span key={idx} className={`h-1.5 w-1.5 rounded-full ${URG_DOT[e.urgency] || URG_DOT.baixa}`} />
                        ))}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-white/10 pt-4 text-xs text-muted" aria-label="Urgência dos eventos">
              {Object.entries({ alta: 'Alta', media: 'Média', baixa: 'Baixa' }).map(([key, label]) => (
                <span key={key} className="inline-flex items-center gap-2">
                  <span aria-hidden="true" className={`h-2 w-2 rounded-full ${URG_DOT[key]}`} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="min-w-0">
            <h2 aria-live="polite" className="mb-3 text-lg font-semibold text-white">
              {selectedDay ? formatDateBR(selectedDay) : 'Selecione um dia'}
            </h2>
            {selectedDay ? (
              <AgendaList events={selectedEvents} showParty canManage={user?.role === 'advogado'} />
            ) : (
              <p className="text-sm text-muted">Clique em um dia com marcações para ver os vencimentos.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
