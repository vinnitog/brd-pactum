import { useState } from 'react'
import Modal from './Modal.jsx'
import { Button, Field, Input, Select } from './ui/index.jsx'
import { saveEvent } from '../lib/store.js'
import { todayLocalISO } from '../lib/format.js'

export default function EventFormModal({ partyId, contracts = [], onClose }) {
  const [form, setForm] = useState({
    contractId: contracts[0]?.id || '',
    type: 'vencimento',
    date: todayLocalISO(),
    urgency: 'media',
    note: ''
  })
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  function submit(e) {
    e.preventDefault()
    saveEvent({ ...form, partyId })
    onClose()
  }

  return (
    <Modal title="Novo vencimento na agenda" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Contrato">
          <Select value={form.contractId} onChange={(e) => set('contractId', e.target.value)}>
            <option value="">— sem contrato vinculado —</option>
            {contracts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.titulo || c.tipo}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Tipo de vencimento">
            <Select value={form.type} onChange={(e) => set('type', e.target.value)}>
              <option value="vencimento">Vencimento de contrato</option>
              <option value="atualizacao">Atualização monetária</option>
              <option value="qualificacao">Mudança de qualificação</option>
              <option value="outro">Outro</option>
            </Select>
          </Field>
          <Field label="Nível de urgência">
            <Select value={form.urgency} onChange={(e) => set('urgency', e.target.value)}>
              <option value="alta">Alta (vermelho)</option>
              <option value="media">Média (amarelo)</option>
              <option value="baixa">Baixa (verde)</option>
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Data">
            <Input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} required aria-required="true" />
          </Field>
          <Field label="Observação">
            <Input value={form.note} onChange={(e) => set('note', e.target.value)} placeholder="Detalhe do vencimento" />
          </Field>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Adicionar</Button>
        </div>
      </form>
    </Modal>
  )
}
