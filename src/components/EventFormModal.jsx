import { useMemo, useState } from 'react'
import Modal from './Modal.jsx'
import { Button, Field, Input, Select } from './ui/index.jsx'
import { saveEvent } from '../lib/store.js'
import { todayLocalISO } from '../lib/format.js'

// Datas relevantes acompanhadas na agenda. Decisão dos sócios (Issue #10): além
// do vencimento, também assinatura, renovação automática e revisão do contrato.
export const EVENT_TYPES = [
  ['vencimento', 'Vencimento de contrato'],
  ['assinatura', 'Assinatura'],
  ['renovacao', 'Renovação automática'],
  ['revisao', 'Revisão'],
  ['atualizacao', 'Atualização monetária'],
  ['qualificacao', 'Mudança de qualificação'],
  ['outro', 'Outro']
]

export default function EventFormModal({ partyId, parties = [], contracts = [], event = null, onClose }) {
  const editing = Boolean(event?.id)
  const [form, setForm] = useState(() => ({
    partyId: event?.partyId || partyId || parties[0]?.id || '',
    contractId: event?.contractId || contracts[0]?.id || '',
    type: event?.type || 'vencimento',
    date: event?.date || todayLocalISO(),
    urgency: event?.urgency || 'media',
    note: event?.note || ''
  }))
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  // Aberto pela agenda (sem parte fixa e sem estar editando): o usuário escolhe a
  // parte e vê apenas os contratos dela. Ao editar, a parte do evento é mantida.
  const showPartyPicker = !editing && !partyId && parties.length > 0
  const partyContracts = useMemo(
    () => (showPartyPicker ? contracts.filter((c) => c.partyId === form.partyId) : contracts),
    [showPartyPicker, contracts, form.partyId]
  )

  function submit(e) {
    e.preventDefault()
    if (!form.partyId) return
    // Ao trocar de parte, o contrato antes selecionado pode não pertencer a ela.
    const contractId = partyContracts.some((c) => c.id === form.contractId) ? form.contractId : ''
    saveEvent({ ...(editing ? { id: event.id } : {}), ...form, contractId })
    onClose()
  }

  return (
    <Modal title={editing ? 'Editar vencimento na agenda' : 'Novo vencimento na agenda'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        {showPartyPicker && (
          <Field label="Cliente / fornecedor">
            <Select
              value={form.partyId}
              onChange={(e) => setForm((f) => ({ ...f, partyId: e.target.value, contractId: '' }))}
            >
              {parties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.kind === 'cliente' ? 'Cliente' : 'Fornecedor'})
                </option>
              ))}
            </Select>
          </Field>
        )}
        <Field label="Contrato">
          <Select value={form.contractId} onChange={(e) => set('contractId', e.target.value)}>
            <option value="">— sem contrato vinculado —</option>
            {partyContracts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.titulo || c.tipo}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Tipo de vencimento">
            <Select value={form.type} onChange={(e) => set('type', e.target.value)}>
              {EVENT_TYPES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
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
          <Button type="submit">{editing ? 'Salvar' : 'Adicionar'}</Button>
        </div>
      </form>
    </Modal>
  )
}
