import { useState } from 'react'
import { useStore, getParty, getContract, toggleEventDone, deleteEvent } from '../lib/store.js'
import { formatDateBR } from '../lib/format.js'
import { Badge, Button, EmptyState } from './ui/index.jsx'
import ReminderModal from './ReminderModal.jsx'

const TYPE_LABEL = {
  vencimento: 'Vencimento',
  atualizacao: 'Atualização monetária',
  qualificacao: 'Mudança de qualificação',
  outro: 'Outro'
}

const URG_DOT = { alta: 'bg-urg-alta', media: 'bg-urg-media', baixa: 'bg-urg-baixa' }
const URG_TONE = { alta: 'red', media: 'yellow', baixa: 'green' }

export default function AgendaList({ events, showParty = true, canManage = false }) {
  // Assina o store para re-renderizar quando um evento é marcado como concluído.
  useStore((s) => s.events)
  const [reminder, setReminder] = useState(null)

  if (!events || events.length === 0) {
    return <EmptyState title="Nenhum vencimento na agenda." />
  }

  return (
    <div className="space-y-2">
      {events.map((e) => {
        const party = getParty(e.partyId)
        const contract = getContract(e.contractId)
        return (
          <div
            key={e.id}
            className={`flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 ${
              e.done ? 'opacity-50' : ''
            }`}
          >
            <span className={`h-3 w-3 shrink-0 rounded-full ${URG_DOT[e.urgency] || URG_DOT.baixa}`} />
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium text-white ${e.done ? 'line-through' : ''}`}>
                {contract?.titulo || contract?.tipo || 'Contrato'}
              </p>
              <p className="text-xs text-white/50">
                {TYPE_LABEL[e.type] || e.type}
                {e.note ? ` — ${e.note}` : ''}
                {showParty && party ? ` · ${party.name}` : ''}
              </p>
            </div>
            <Badge tone={URG_TONE[e.urgency] || 'gray'}>{formatDateBR(e.date)}</Badge>
            <div className="flex items-center gap-1">
              <Button variant="subtle" onClick={() => setReminder(e)}>
                Gerar lembrete
              </Button>
              {canManage && (
                <>
                  <button
                    onClick={() => toggleEventDone(e.id)}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg px-2 py-1 text-xs text-white/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brd/60"
                    title="Concluir/reabrir"
                    aria-label={e.done ? 'Reabrir evento' : 'Concluir evento'}
                  >
                    {e.done ? '↺' : '✓'}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Excluir este evento da agenda? Esta ação não pode ser desfeita.')) deleteEvent(e.id)
                    }}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg px-2 py-1 text-xs text-white/40 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                    title="Excluir"
                    aria-label="Excluir evento"
                  >
                    🗑
                  </button>
                </>
              )}
            </div>
          </div>
        )
      })}

      {reminder && (
        <ReminderModal
          event={reminder}
          party={getParty(reminder.partyId)}
          contract={getContract(reminder.contractId)}
          onClose={() => setReminder(null)}
        />
      )}
    </div>
  )
}
