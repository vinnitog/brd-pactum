import { useMemo, useState } from 'react'
import Modal from './Modal.jsx'
import ReminderComposer from './ReminderComposer.jsx'
import { Button, EmptyState } from './ui/index.jsx'
import { getParty, getContract } from '../lib/store.js'
import { formatDateBR, todayLocalISO } from '../lib/format.js'
import { isValidLocalISO } from '../lib/deadlines.js'

// Janela de antecedência decidida pelos sócios: o lembrete é gerado 2 dias antes
// do vencimento (Issue #12). Vencimentos dentro dessa janela já vêm marcados.
const REMINDER_WINDOW_DAYS = 2

function addDaysISO(iso, days) {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d + days)
  const yy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

// Geração de lembretes em lote (decisão dos sócios): lista os vencimentos
// futuros em aberto, pré-seleciona os que vencem em até 2 dias e gera os textos
// para envio manual pelo sócio, um por cliente.
export default function BatchReminderModal({ events, onClose }) {
  const today = todayLocalISO()
  const windowEnd = isValidLocalISO(today) ? addDaysISO(today, REMINDER_WINDOW_DAYS) : today

  const upcoming = useMemo(
    () =>
      (events || [])
        .filter((e) => !e.done && isValidLocalISO(e.date) && e.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [events, today]
  )

  const [selected, setSelected] = useState(() =>
    new Set(upcoming.filter((e) => e.date <= windowEnd).map((e) => e.id))
  )
  const [generated, setGenerated] = useState(null)

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const generatedEvents = generated
    ? upcoming.filter((e) => generated.has(e.id))
    : []

  return (
    <Modal title="Gerar lembretes em lote" onClose={onClose} maxWidth="max-w-2xl">
      {upcoming.length === 0 ? (
        <EmptyState title="Nenhum vencimento em aberto para gerar lembretes." />
      ) : generated ? (
        <div className="space-y-6">
          {generatedEvents.map((e) => {
            const party = getParty(e.partyId)
            const contract = getContract(e.contractId)
            return (
              <div key={e.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <p className="mb-3 text-sm font-medium text-white">
                  {party?.name || 'Cliente'} · {contract?.titulo || contract?.tipo || 'Contrato'} · {formatDateBR(e.date)}
                </p>
                <ReminderComposer event={e} party={party} contract={contract} />
              </div>
            )
          })}
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => setGenerated(null)}>
              ← Voltar à seleção
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <p className="mb-3 text-sm text-muted">
            Selecione os vencimentos. Os que vencem em até {REMINDER_WINDOW_DAYS} dias já vêm marcados.
          </p>
          <ul className="space-y-2">
            {upcoming.map((e) => {
              const party = getParty(e.partyId)
              const contract = getContract(e.contractId)
              return (
                <li key={e.id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(e.id)}
                      onChange={() => toggle(e.id)}
                      className="h-4 w-4 shrink-0 accent-brd-500"
                    />
                    <span className="min-w-0 flex-1 text-sm text-white [overflow-wrap:anywhere]">
                      {party?.name || 'Cliente'} · {contract?.titulo || contract?.tipo || 'Contrato'}
                      <span className="text-muted"> · {formatDateBR(e.date)}</span>
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
          <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button disabled={selected.size === 0} onClick={() => setGenerated(new Set(selected))}>
              Gerar {selected.size > 0 ? `(${selected.size})` : ''} lembretes
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
