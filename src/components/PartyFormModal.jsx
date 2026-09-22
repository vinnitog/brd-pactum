import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from './Modal.jsx'
import { Button, Field, Input, Select } from './ui/index.jsx'
import { saveParty } from '../lib/store.js'
import { maskCPF, maskCNPJ, maskRG } from '../lib/format.js'

// Cadastro de cliente/fornecedor. Para PJ, abre a qualificação do representante
// legal (conforme a especificação).
export default function PartyFormModal({ kind, party = null, onClose }) {
  const navigate = useNavigate()
  const [form, setForm] = useState(() => ({
    id: party?.id,
    kind: party?.kind || kind || 'cliente',
    personType: party?.personType || 'PF',
    name: party?.name || '',
    doc: party?.doc || '',
    rg: party?.rg || '',
    email: party?.email || '',
    phone: party?.phone || '',
    address: party?.address || '',
    repNome: party?.repLegal?.nome || '',
    repCpf: party?.repLegal?.cpf || '',
    repCargo: party?.repLegal?.cargo || ''
  }))
  const [error, setError] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const isPJ = form.personType === 'PJ'

  function submit(e) {
    e.preventDefault()
    const saved = saveParty({
      id: form.id,
      kind: form.kind,
      personType: form.personType,
      name: form.name.trim(),
      doc: form.doc.trim(),
      rg: isPJ ? '' : form.rg.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      repLegal: isPJ ? { nome: form.repNome.trim(), cpf: form.repCpf.trim(), cargo: form.repCargo.trim() } : null
    })
    onClose()
    if (!party) navigate(`/parte/${saved.id}`)
  }

  const label = form.kind === 'cliente' ? 'cliente' : 'fornecedor'

  return (
    <Modal title={party ? `Editar ${label}` : kind ? `Novo ${label}` : 'Novo cadastro'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        {!party && !kind && (
          <Field label="Tipo de cadastro">
            <Select value={form.kind} onChange={(e) => set('kind', e.target.value)}>
              <option value="cliente">Cliente</option>
              <option value="fornecedor">Fornecedor</option>
            </Select>
          </Field>
        )}
        <Field label="Tipo de pessoa">
          <Select value={form.personType} onChange={(e) => set('personType', e.target.value)}>
            <option value="PF">Pessoa Física</option>
            <option value="PJ">Pessoa Jurídica</option>
          </Select>
        </Field>

        <Field label={isPJ ? 'Razão social' : 'Nome completo'}>
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} autoFocus />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={isPJ ? 'CNPJ' : 'CPF'}>
            <Input
              value={form.doc}
              onChange={(e) => set('doc', isPJ ? maskCNPJ(e.target.value) : maskCPF(e.target.value))}
              inputMode="numeric"
            />
          </Field>
          <Field label="Telefone">
            <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </Field>
        </div>

        {!isPJ && (
          <Field label="RG">
            <Input value={form.rg} onChange={(e) => set('rg', maskRG(e.target.value))} inputMode="text" />
          </Field>
        )}

        <Field label="E-mail">
          <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
        </Field>

        <Field label="Endereço">
          <Input value={form.address} onChange={(e) => set('address', e.target.value)} />
        </Field>

        {isPJ && (
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="mb-3 text-sm font-medium text-brd-200">Representante legal</p>
            <div className="space-y-4">
              <Field label="Nome">
                <Input value={form.repNome} onChange={(e) => set('repNome', e.target.value)} />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="CPF">
                  <Input value={form.repCpf} onChange={(e) => set('repCpf', maskCPF(e.target.value))} />
                </Field>
                <Field label="Cargo">
                  <Input value={form.repCargo} onChange={(e) => set('repCargo', e.target.value)} />
                </Field>
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </Modal>
  )
}
