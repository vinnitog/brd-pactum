import { useState } from 'react'
import Modal from './Modal.jsx'
import { Button, Field, Input, Textarea } from './ui/index.jsx'
import ClassificationPicker from './ClassificationPicker.jsx'
import { saveContract, saveEvent } from '../lib/store.js'
import { maskCurrency, parseCurrencyBR, todayLocalISO } from '../lib/format.js'

// Sub-aba "Cadastro de gerenciamento": qualificação das partes, principais
// vencimentos (com nível de urgência), valores e testemunhas. Usada para
// fornecedores ou contratos elaborados manualmente fora do sistema.
const VENC_TIPOS = [
  ['vencimento', 'Vencimento de contrato'],
  ['atualizacao', 'Atualização monetária'],
  ['qualificacao', 'Mudança de qualificação'],
  ['outro', 'Outro']
]

export default function ManageContractModal({ partyId, onClose }) {
  const [titulo, setTitulo] = useState('')
  const [classe, setClasse] = useState({ groupId: '', tipo: '', subtipo: '' })
  const [qualificacao, setQualificacao] = useState('')
  const [valor, setValor] = useState('')
  const [vencimentos, setVencimentos] = useState([
    { type: 'vencimento', date: todayLocalISO(), urgency: 'media', note: '' }
  ])
  const [testemunhas, setTestemunhas] = useState([{ nome: '', cpf: '' }])

  const setVenc = (i, k, v) =>
    setVencimentos((list) => list.map((x, idx) => (idx === i ? { ...x, [k]: v } : x)))
  const setTest = (i, k, v) =>
    setTestemunhas((list) => list.map((x, idx) => (idx === i ? { ...x, [k]: v } : x)))

  function submit(e) {
    e.preventDefault()
    const contract = saveContract({
      partyId,
      source: 'manual',
      status: 'ativo',
      groupId: classe.groupId,
      tipo: classe.tipo,
      subtipo: classe.subtipo,
      titulo: titulo.trim() || classe.tipo || 'Contrato (gerenciamento)',
      valor: parseCurrencyBR(valor),
      parte: { qualificacao: qualificacao.trim() },
      testemunhas: testemunhas.filter((t) => t.nome.trim())
    })
    vencimentos
      .filter((v) => v.date)
      .forEach((v) =>
        saveEvent({ contractId: contract.id, partyId, type: v.type, date: v.date, urgency: v.urgency, note: v.note })
      )
    onClose()
  }

  return (
    <Modal title="Cadastro de gerenciamento" onClose={onClose} maxWidth="max-w-2xl">
      <form onSubmit={submit} className="space-y-5">
        <Field label="Título / identificação do contrato">
          <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Contrato de fornecimento gráfico 2026" />
        </Field>

        <ClassificationPicker value={classe} onChange={setClasse} />

        <Field label="Qualificação das partes">
          <Textarea
            value={qualificacao}
            onChange={(e) => setQualificacao(e.target.value)}
            placeholder="Identificação e qualificação completa das partes envolvidas."
          />
        </Field>

        <Field label="Valor (R$)">
          <Input value={valor} onChange={(e) => setValor(maskCurrency(e.target.value))} inputMode="numeric" placeholder="0,00" />
        </Field>

        {/* Vencimentos com nível de urgência */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-white/80">Principais vencimentos</span>
            <button
              type="button"
              onClick={() => setVencimentos((l) => [...l, { type: 'outro', date: todayLocalISO(), urgency: 'media', note: '' }])}
              className="text-xs font-medium text-brd hover:underline"
            >
              + adicionar
            </button>
          </div>
          <div className="space-y-2">
            {vencimentos.map((v, i) => (
              <div key={i} className="grid grid-cols-1 gap-2 rounded-xl border border-white/10 bg-black/20 p-3 sm:grid-cols-[1.4fr_1fr_1fr_auto]">
                <select
                  value={v.type}
                  onChange={(e) => setVenc(i, 'type', e.target.value)}
                  className="rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-sm text-white"
                >
                  {VENC_TIPOS.map(([val, lab]) => (
                    <option key={val} value={val}>
                      {lab}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={v.date}
                  onChange={(e) => setVenc(i, 'date', e.target.value)}
                  className="rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-sm text-white"
                />
                <select
                  value={v.urgency}
                  onChange={(e) => setVenc(i, 'urgency', e.target.value)}
                  className="rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-sm text-white"
                >
                  <option value="alta">🔴 Alta</option>
                  <option value="media">🟡 Média</option>
                  <option value="baixa">🟢 Baixa</option>
                </select>
                <button
                  type="button"
                  onClick={() => setVencimentos((l) => l.filter((_, idx) => idx !== i))}
                  className="px-2 text-muted hover:text-red-400"
                  title="Remover"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Testemunhas */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-white/80">Testemunhas</span>
            <button
              type="button"
              onClick={() => setTestemunhas((l) => [...l, { nome: '', cpf: '' }])}
              className="text-xs font-medium text-brd hover:underline"
            >
              + adicionar
            </button>
          </div>
          <div className="space-y-2">
            {testemunhas.map((t, i) => (
              <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Input value={t.nome} onChange={(e) => setTest(i, 'nome', e.target.value)} placeholder="Nome" />
                <Input value={t.cpf} onChange={(e) => setTest(i, 'cpf', e.target.value)} placeholder="CPF" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Salvar cadastro</Button>
        </div>
      </form>
    </Modal>
  )
}
