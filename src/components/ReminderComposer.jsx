import { useState } from 'react'
import { Button, Textarea } from './ui/index.jsx'
import { buildReminder } from '../lib/reminderTemplate.js'
import { whatsappLink } from '../lib/whatsapp.js'
import { addReminder, useStore } from '../lib/store.js'
import { formatRelativeTime } from '../lib/format.js'

const CHANNEL_LABEL = {
  whatsapp: 'WhatsApp',
  sistema: 'Registrado no sistema'
}

// Compositor de lembrete ao cliente (Issue #12): parte do modelo do escritório
// com cliente/contrato/vencimento preenchidos, permite editar antes do envio,
// dispara por WhatsApp (canal decidido pelos sócios) e registra o histórico.
// O disparo é manual e por contato principal do cliente.
export default function ReminderComposer({ event, party, contract }) {
  const [text, setText] = useState(() => buildReminder({ event, party, contract }))
  const [copied, setCopied] = useState(false)
  const reminders = useStore((s) => s.reminders || [])
  const history = reminders
    .filter((r) => r.eventId === event?.id)
    .sort((a, b) => b.sentAt.localeCompare(a.sentAt))

  const phone = party?.phone
  const link = phone ? whatsappLink(phone, text) : ''

  function register(channel) {
    addReminder({
      eventId: event?.id,
      contractId: contract?.id || event?.contractId,
      partyId: party?.id || event?.partyId,
      channel,
      text
    })
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div>
      <p className="mb-2 text-xs text-muted">Revise e edite o texto antes de enviar ao cliente.</p>
      <Textarea
        aria-label="Texto do lembrete"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="h-64 leading-relaxed"
      />
      <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
        <Button variant="ghost" onClick={copy}>
          {copied ? 'Copiado ✓' : 'Copiar texto'}
        </Button>
        <Button variant="ghost" onClick={() => register('sistema')}>
          Registrar envio
        </Button>
        {link ? (
          <Button as="a" href={link} target="_blank" rel="noopener noreferrer" onClick={() => register('whatsapp')}>
            Enviar por WhatsApp →
          </Button>
        ) : (
          <Button disabled title="Cadastre um telefone no cliente para envio por WhatsApp.">
            Enviar por WhatsApp →
          </Button>
        )}
      </div>
      {!phone && (
        <p className="mt-2 text-right text-xs text-muted">Cadastre um telefone no cliente para envio direto por WhatsApp.</p>
      )}

      <div className="mt-4 border-t border-white/10 pt-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Histórico de envios</h3>
        {history.length === 0 ? (
          <p className="mt-1 text-xs text-muted">Nenhum lembrete registrado para este vencimento.</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {history.map((r) => (
              <li key={r.id} className="text-xs text-white/70">
                {CHANNEL_LABEL[r.channel] || r.channel} · {formatRelativeTime(r.sentAt)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
