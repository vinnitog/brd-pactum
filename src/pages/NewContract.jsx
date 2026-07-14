import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ClassificationPicker from '../components/ClassificationPicker.jsx'
import { Button, Card, Field, Input, Textarea } from '../components/ui/index.jsx'
import { useStore, getParty, saveContract, saveEvent } from '../lib/store.js'
import { generateContractText } from '../lib/contractGenerator.js'
import { maskCurrency, parseCurrencyBR } from '../lib/format.js'

export default function NewContract() {
  const { id } = useParams()
  const navigate = useNavigate()
  const party = useStore(() => getParty(id))

  const [classe, setClasse] = useState({ groupId: '', tipo: '', subtipo: '' })
  const [f, setF] = useState({
    titulo: '',
    qualificacao: '',
    representante: '',
    valor: '',
    vencimento: '',
    parcelas: '',
    meioPagamento: '',
    atualizacaoMonetaria: '',
    prazo: '',
    multa: '',
    objeto: '',
    comunicacao: ''
  })
  const [review, setReview] = useState(null) // { contract, text }
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }))

  const isPJ = party?.personType === 'PJ'

  // Pré-preenche a qualificação a partir do cadastro do cliente (torna a
  // elaboração automática, conforme observação da especificação).
  const defaultQualificacao = useMemo(() => {
    if (!party) return ''
    return `${party.name}, ${isPJ ? 'CNPJ' : 'CPF'} ${party.doc || '—'}, ${party.address || ''}`.trim()
  }, [party, isPJ])

  function buildContract() {
    return {
      partyId: id,
      source: 'elaboracao',
      status: 'ativo',
      groupId: classe.groupId,
      tipo: classe.tipo,
      subtipo: classe.subtipo,
      titulo: f.titulo.trim() || `${classe.tipo}${classe.subtipo ? ' · ' + classe.subtipo : ''}`,
      parte: {
        qualificacao: (f.qualificacao || defaultQualificacao).trim(),
        representante: isPJ ? f.representante.trim() || (party?.repLegal?.nome ? `${party.repLegal.nome}, ${party.repLegal.cargo}` : '') : ''
      },
      valor: parseCurrencyBR(f.valor),
      vencimento: f.vencimento,
      parcelas: f.parcelas ? Number(f.parcelas) : null,
      meioPagamento: f.meioPagamento.trim(),
      atualizacaoMonetaria: f.atualizacaoMonetaria.trim(),
      prazo: f.prazo.trim(),
      multa: f.multa.trim(),
      objeto: f.objeto.trim(),
      comunicacao: f.comunicacao.trim()
    }
  }

  function gerar(e) {
    e.preventDefault()
    const contract = buildContract()
    setReview({ contract, text: generateContractText(contract, party) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function confirmar() {
    const saved = saveContract({ ...review.contract, generatedText: review.text })
    if (review.contract.vencimento) {
      saveEvent({
        contractId: saved.id,
        partyId: id,
        type: 'vencimento',
        date: review.contract.vencimento,
        urgency: 'media',
        note: 'Vencimento do contrato'
      })
    }
    navigate(`/parte/${id}`)
  }

  if (!party) return <p className="text-white/60">Cadastro não encontrado.</p>

  // ---- Tela de revisão (processo de revisão antes de finalizar) ----
  if (review) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Revisão do contrato</h1>
        <p className="mt-1 text-sm text-white/50">
          Confira a minuta gerada antes de salvar. Você pode voltar e ajustar os campos.
        </p>
        <Card className="mt-6">
          <textarea
            value={review.text}
            onChange={(e) => setReview((r) => ({ ...r, text: e.target.value }))}
            className="h-[28rem] w-full rounded-xl border border-white/10 bg-black/40 p-4 text-sm leading-relaxed text-white/80"
          />
        </Card>
        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <Button variant="ghost" onClick={() => setReview(null)}>
            ← Voltar e editar
          </Button>
          <Button onClick={confirmar}>Confirmar e salvar</Button>
        </div>
      </div>
    )
  }

  // ---- Formulário de elaboração ----
  return (
    <div>
      <Link to={`/parte/${id}`} className="text-sm text-white/40 hover:text-white">
        ← {party.name}
      </Link>
      <h1 className="mt-3 text-2xl font-bold">Novo contrato — elaboração</h1>
      <p className="mt-1 text-sm text-white/50">Cliente: {party.name}</p>

      <form onSubmit={gerar} className="mt-6 space-y-6">
        <Card>
          <ClassificationPicker value={classe} onChange={setClasse} />
        </Card>

        <Card className="space-y-4">
          <Field label="Título do contrato (opcional)">
            <Input value={f.titulo} onChange={(e) => set('titulo', e.target.value)} placeholder="Gerado automaticamente se vazio" />
          </Field>

          <Field label="Identificação e qualificação das partes" hint="Pré-preenchido pelo cadastro; ajuste se necessário.">
            <Textarea
              value={f.qualificacao}
              onChange={(e) => set('qualificacao', e.target.value)}
              placeholder={defaultQualificacao}
            />
          </Field>

          {isPJ && (
            <Field label="Qualificação do representante legal">
              <Input
                value={f.representante}
                onChange={(e) => set('representante', e.target.value)}
                placeholder={party.repLegal?.nome ? `${party.repLegal.nome}, ${party.repLegal.cargo}` : 'Nome, cargo, CPF'}
              />
            </Field>
          )}

          <Field label="Objeto do contrato">
            <Textarea value={f.objeto} onChange={(e) => set('objeto', e.target.value)} />
          </Field>
        </Card>

        <Card className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Valor (R$)">
              <Input value={f.valor} onChange={(e) => set('valor', maskCurrency(e.target.value))} inputMode="numeric" placeholder="0,00" />
            </Field>
            <Field label="Vencimento">
              <Input type="date" value={f.vencimento} onChange={(e) => set('vencimento', e.target.value)} />
            </Field>
            <Field label="Parcelas">
              <Input type="number" min="1" value={f.parcelas} onChange={(e) => set('parcelas', e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Meio de pagamento">
              <Input value={f.meioPagamento} onChange={(e) => set('meioPagamento', e.target.value)} placeholder="Boleto, Pix, transferência…" />
            </Field>
            <Field label="Atualização monetária / inadimplência">
              <Input value={f.atualizacaoMonetaria} onChange={(e) => set('atualizacaoMonetaria', e.target.value)} placeholder="Ex.: IPCA + multa 2%" />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Prazo">
              <Input value={f.prazo} onChange={(e) => set('prazo', e.target.value)} placeholder="Ex.: 12 meses" />
            </Field>
            <Field label="Multa">
              <Input value={f.multa} onChange={(e) => set('multa', e.target.value)} placeholder="Ex.: 10% sobre o saldo" />
            </Field>
          </div>
          <Field label="Comunicação">
            <Textarea value={f.comunicacao} onChange={(e) => set('comunicacao', e.target.value)} placeholder="Forma de comunicação entre as partes." />
          </Field>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => navigate(`/parte/${id}`)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!classe.tipo}>
            Gerar →
          </Button>
        </div>
      </form>
    </div>
  )
}
