import { useState } from 'react'
import Modal from './Modal.jsx'
import { Button } from './ui/index.jsx'
import { buildReminder } from '../lib/reminderTemplate.js'

// Transforma um aviso da agenda em texto e permite copiar / abrir e-mail para
// enviar ao cliente como lembrete (conforme especificação).
export default function ReminderModal({ event, party, contract, onClose }) {
  const [copied, setCopied] = useState(false)
  const text = buildReminder({ event, party, contract })

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const mailto = `mailto:${party?.email || ''}?subject=${encodeURIComponent(
    'Lembrete contratual — BRD pactum'
  )}&body=${encodeURIComponent(text)}`

  return (
    <Modal title="Lembrete ao cliente" onClose={onClose} maxWidth="max-w-2xl">
      <textarea
        readOnly
        value={text}
        className="h-72 w-full rounded-xl border border-white/10 bg-black/40 p-4 text-sm leading-relaxed text-white/80"
      />
      <div className="mt-4 flex flex-wrap justify-end gap-3">
        <Button variant="ghost" onClick={copy}>
          {copied ? 'Copiado ✓' : 'Copiar texto'}
        </Button>
        <Button as="a" href={mailto}>
          Enviar por e-mail →
        </Button>
      </div>
      {!party?.email && (
        <p className="mt-2 text-right text-xs text-muted">Cadastre um e-mail no cliente para envio direto.</p>
      )}
    </Modal>
  )
}
