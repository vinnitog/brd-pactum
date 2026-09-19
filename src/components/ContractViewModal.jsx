import { useState } from 'react'
import Modal from './Modal.jsx'
import { Button, Badge } from './ui/index.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { canManage } from '../lib/permissions.js'
import { getParty, setContractStatus } from '../lib/store.js'
import { generateContractText } from '../lib/contractGenerator.js'
import { formatCurrencyBR } from '../lib/format.js'

function Row({ label, value }) {
  if (!value) return null
  return (
    <div className="flex flex-col border-b border-white/5 py-2 sm:flex-row sm:gap-4">
      <span className="w-48 shrink-0 text-xs uppercase tracking-wide text-muted">{label}</span>
      <span className="text-sm text-white/80">{value}</span>
    </div>
  )
}

export default function ContractViewModal({ contract, onClose }) {
  const { user } = useAuth()
  const party = getParty(contract.partyId)
  const [view, setView] = useState('dados') // dados | texto
  const manage = canManage(user)
  const text = contract.generatedText || generateContractText(contract, party)

  return (
    <Modal title={contract.titulo || contract.tipo} onClose={onClose} maxWidth="max-w-2xl">
      <div className="mb-4 flex items-center gap-2">
        <Badge tone={contract.status === 'ativo' ? 'green' : 'gray'}>{contract.status}</Badge>
        <Badge tone="gray">{contract.source === 'manual' ? 'Gerenciamento manual' : 'Elaborado'}</Badge>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setView('dados')}
          className={`rounded-lg px-3 py-1.5 text-sm ${view === 'dados' ? 'bg-brd/15 text-brd-200' : 'text-muted'}`}
        >
          Dados
        </button>
        <button
          onClick={() => setView('texto')}
          className={`rounded-lg px-3 py-1.5 text-sm ${view === 'texto' ? 'bg-brd/15 text-brd-200' : 'text-muted'}`}
        >
          Minuta gerada
        </button>
      </div>

      {view === 'dados' ? (
        <div>
          <Row label="Classificação" value={[contract.tipo, contract.subtipo].filter(Boolean).join(' · ')} />
          <Row label="Qualificação" value={contract.parte?.qualificacao} />
          <Row label="Representante" value={contract.parte?.representante} />
          <Row label="Objeto" value={contract.objeto} />
          <Row label="Valor" value={contract.valor ? `R$ ${formatCurrencyBR(contract.valor)}` : null} />
          <Row label="Parcelas" value={contract.parcelas ? String(contract.parcelas) : null} />
          <Row label="Meio de pagamento" value={contract.meioPagamento} />
          <Row label="Atualização / inadimplência" value={contract.atualizacaoMonetaria} />
          <Row label="Prazo" value={contract.prazo} />
          <Row label="Multa" value={contract.multa} />
          <Row label="Comunicação" value={contract.comunicacao} />
          <Row
            label="Testemunhas"
            value={contract.testemunhas?.map((t) => t.nome).filter(Boolean).join(', ')}
          />
        </div>
      ) : (
        <textarea
          readOnly
          value={text}
          className="h-80 w-full rounded-xl border border-white/10 bg-black/40 p-4 text-sm leading-relaxed text-white/80"
        />
      )}

      {manage && (
        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => setContractStatus(contract.id, contract.status === 'ativo' ? 'inativo' : 'ativo')}
          >
            {contract.status === 'ativo' ? 'Marcar inativo' : 'Reativar'}
          </Button>
          <Button onClick={onClose}>Fechar</Button>
        </div>
      )}
    </Modal>
  )
}
