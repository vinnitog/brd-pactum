import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ClassificationPicker from '../components/ClassificationPicker.jsx'
import { Badge, Button, Card, Field, Input, Textarea } from '../components/ui/index.jsx'
import { useStore, getParty, saveContract, saveEvent } from '../lib/store.js'
import { generateContractText } from '../lib/contractGenerator.js'
import { reviewFieldsFor } from '../lib/contractReview.js'
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
  // Fluxo em etapas: elaboração → revisão dos dados → revisão do texto.
  const [stage, setStage] = useState('form') // 'form' | 'dados' | 'texto'
  const [text, setText] = useState('')
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }))

  const isPJ = party?.personType === 'PJ'

  // Pré-preenche a qualificação a partir do cadastro do cliente (torna a
  // elaboração automática, conforme observação da especificação).
  const defaultQualificacao = useMemo(() => {
    if (!party) return ''
    return `${party.name}, ${isPJ ? 'CNPJ' : 'CPF'} ${party.doc || '—'}, ${party.address || ''}`.trim()
  }, [party, isPJ])

  const defaultRepresentante = useMemo(
    () => (party?.repLegal?.nome ? `${party.repLegal.nome}, ${party.repLegal.cargo}` : ''),
    [party]
  )

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
        representante: isPJ ? f.representante.trim() || defaultRepresentante : ''
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

  // Vai da elaboração para a revisão dos dados. Materializa os valores
  // pré-preenchidos para que apareçam explicitamente na conferência.
  function revisarDados(e) {
    e.preventDefault()
    setF((s) => ({
      ...s,
      qualificacao: s.qualificacao.trim() || defaultQualificacao,
      representante: isPJ ? s.representante.trim() || defaultRepresentante : s.representante
    }))
    setStage('dados')
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }

  function gerarMinuta() {
    setText(generateContractText(buildContract(), party))
    setStage('texto')
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }

  function confirmar() {
    const contract = buildContract()
    const saved = saveContract({ ...contract, generatedText: text })
    if (contract.vencimento) {
      saveEvent({
        contractId: saved.id,
        partyId: id,
        type: 'vencimento',
        date: contract.vencimento,
        urgency: 'media',
        note: 'Vencimento do contrato'
      })
    }
    navigate(`/parte/${id}`)
  }

  if (!party) return <p className="text-white/60">Cadastro não encontrado.</p>

  // ---- Revisão do texto (minuta gerada, antes de salvar) ----
  if (stage === 'texto') {
    return (
      <div>
        <h1 className="text-2xl font-bold">Revisão do texto</h1>
        <p className="mt-1 text-sm text-muted">
          Confira a minuta gerada antes de salvar. Você pode voltar e ajustar os dados.
        </p>
        <Card className="mt-6">
          <textarea
            aria-label="Texto da minuta"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="h-[28rem] w-full rounded-xl border border-white/40 bg-control p-4 text-base leading-relaxed text-white/90"
          />
        </Card>
        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <Button variant="ghost" onClick={() => setStage('dados')}>
            ← Voltar aos dados
          </Button>
          <Button onClick={confirmar}>Confirmar e salvar</Button>
        </div>
      </div>
    )
  }

  // ---- Revisão dos dados (conferência campo a campo antes de gerar) ----
  if (stage === 'dados') {
    const fields = reviewFieldsFor({ isPJ })
    return (
      <div>
        <h1 className="text-2xl font-bold">Revisão dos dados</h1>
        <p className="mt-1 text-sm text-muted">
          Confira as informações do contrato e ajuste o que for necessário antes de gerar a minuta.
          Campos assinalados como <span className="text-white/70">travados</span> aparecem apenas para
          leitura.
        </p>
        <Card className="mt-6 space-y-4">
          {fields.map((field) => (
            <ReviewField
              key={field.key}
              field={field}
              value={f[field.key]}
              onChange={(v) => set(field.key, v)}
            />
          ))}
        </Card>
        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <Button variant="ghost" onClick={() => setStage('form')}>
            ← Voltar à elaboração
          </Button>
          <Button onClick={gerarMinuta}>Gerar minuta →</Button>
        </div>
      </div>
    )
  }

  // ---- Formulário de elaboração ----
  return (
    <div>
      <Link to={`/parte/${id}`} className="text-sm text-muted hover:text-white">
        ← {party.name}
      </Link>
      <h1 className="mt-3 text-2xl font-bold">Novo contrato — elaboração</h1>
      <p className="mt-1 text-sm text-muted">Cliente: {party.name}</p>

      <form onSubmit={revisarDados} className="mt-6 space-y-6">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Classificação do contrato</h2>
          <ClassificationPicker value={classe} onChange={setClasse} />
        </Card>

        <Card className="space-y-4">
          <h2 className="text-lg font-semibold">Partes e objeto</h2>
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
                placeholder={defaultRepresentante || 'Nome, cargo, CPF'}
              />
            </Field>
          )}

          <Field label="Objeto do contrato">
            <Textarea value={f.objeto} onChange={(e) => set('objeto', e.target.value)} />
          </Field>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-lg font-semibold">Condições do contrato</h2>
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

        <p className="text-sm text-muted">Na próxima etapa, você poderá conferir os dados antes de gerar a minuta.</p>
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => navigate(`/parte/${id}`)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!classe.tipo}>
            Revisar dados →
          </Button>
        </div>
      </form>
    </div>
  )
}

// Renderiza um campo na tela de revisão respeitando a regra de edição da
// Fernanda: travado vira apenas leitura; condicional ganha uma ressalva.
function ReviewField({ field, value, onChange }) {
  const locked = field.mode === 'travado'
  const hint =
    field.mode === 'condicional' ? 'Depende do contrato — ajuste apenas se aplicável.' : undefined

  return (
    <Field label={field.label} hint={hint}>
      {locked ? (
        <>
          <Badge tone="gray" className="mb-1.5">Somente conferência</Badge>
          <div className="min-h-[44px] w-full whitespace-pre-wrap rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white/60">
            {value?.toString().trim() || '—'}
          </div>
        </>
      ) : field.control === 'textarea' ? (
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} />
      ) : field.control === 'currency' ? (
        <Input value={value} onChange={(e) => onChange(maskCurrency(e.target.value))} inputMode="numeric" placeholder="0,00" />
      ) : field.control === 'date' ? (
        <Input type="date" value={value} onChange={(e) => onChange(e.target.value)} />
      ) : field.control === 'number' ? (
        <Input type="number" min="1" value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </Field>
  )
}
