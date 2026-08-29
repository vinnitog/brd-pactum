import { useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { visibleParties } from '../lib/permissions.js'
import { useStore } from '../lib/store.js'
import AgendaList from '../components/AgendaList.jsx'
import { formatDateBR } from '../lib/format.js'
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
          <p className="text-sm text-white/50">Vencimentos, atualizações e mudanças de qualificação.</p>
        </div>
        <div className="flex gap-1 rounded-xl border border-white/10 bg-black/30 p-1">
          {[
            ['agenda', 'Agenda'],
            ['lista', 'Lista']
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                mode === key ? 'bg-brd/20 text-brd-200' : 'text-white/50 hover:text-white'
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => setCursor(new Date(year, month - 1, 1))}
                className="rounded-lg px-3 py-1 text-white/60 hover:text-white"
              >
                ‹
              </button>
              <h2 className="text-lg font-semibold">
                {MONTHS[month]} {year}
              </h2>
              <button
                onClick={() => setCursor(new Date(year, month + 1, 1))}
                className="rounded-lg px-3 py-1 text-white/60 hover:text-white"
              >
                ›
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-white/40">
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
                    className={`flex aspect-square flex-col items-center justify-center rounded-lg border text-sm transition ${
                      active ? 'border-brd bg-brd/15 text-white' : 'border-transparent hover:bg-white/5 text-white/80'
                    }`}
                  >
                    <span>{d}</span>
                    {evs.length > 0 && (
                      <span className="mt-0.5 flex gap-0.5">
                        {evs.slice(0, 3).map((e, idx) => (
                          <span key={idx} className={`h-1.5 w-1.5 rounded-full ${URG_DOT[e.urgency] || URG_DOT.baixa}`} />
                        ))}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">
              {selectedDay ? formatDateBR(selectedDay) : 'Selecione um dia'}
            </h3>
            {selectedDay ? (
              <AgendaList events={selectedEvents} showParty canManage={user?.role === 'advogado'} />
            ) : (
              <p className="text-sm text-white/40">Clique em um dia com marcações para ver os vencimentos.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
