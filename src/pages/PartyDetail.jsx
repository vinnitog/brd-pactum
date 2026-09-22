import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { canManage, canSeeParty } from '../lib/permissions.js'
import { useStore, getParty } from '../lib/store.js'
import { Button, Card, Badge, EmptyState } from '../components/ui/index.jsx'
import PartyFormModal from '../components/PartyFormModal.jsx'
import ManageContractModal from '../components/ManageContractModal.jsx'
import ContractViewModal from '../components/ContractViewModal.jsx'
import EventFormModal from '../components/EventFormModal.jsx'
import AgendaList from '../components/AgendaList.jsx'

export default function PartyDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const party = useStore(() => getParty(id))
  const allContracts = useStore((s) => s.contracts)
  const allEvents = useStore((s) => s.events)
  const contracts = useMemo(() => allContracts.filter((c) => c.partyId === id), [allContracts, id])
  const events = useMemo(
    () => allEvents.filter((e) => e.partyId === id).sort((a, b) => a.date.localeCompare(b.date)),
    [allEvents, id]
  )

  const [tab, setTab] = useState('contratos')
  const [subTab, setSubTab] = useState('elaboracao')
  const [editing, setEditing] = useState(false)
  const [managing, setManaging] = useState(false)
  const [viewing, setViewing] = useState(null)
  const [addingEvent, setAddingEvent] = useState(false)

  if (!party) {
    return <EmptyState title="Cadastro não encontrado." />
  }
  if (!canSeeParty(user, party)) {
    return <EmptyState title="Você não tem acesso a este cadastro." />
  }

  const elaborados = contracts.filter((c) => c.source !== 'manual')
  const gerenciados = contracts.filter((c) => c.source === 'manual')
  const manage = canManage(user)

  return (
    <div>
      <Link to={party.kind === 'cliente' ? '/clientes' : '/fornecedores'} className="text-sm text-muted hover:text-white">
        ← {party.kind === 'cliente' ? 'Clientes' : 'Fornecedores'}
      </Link>

      <div className="mt-3 mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold">{party.name || 'Cadastro sem identificação'}</h1>
            <Badge tone="gray">{party.personType}</Badge>
            <Badge tone={party.kind === 'cliente' ? 'brd' : 'yellow'}>
              {party.kind === 'cliente' ? 'Cliente' : 'Fornecedor'}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted">{party.doc}</p>
          <p className="text-sm text-muted">
            {[party.email, party.phone].filter(Boolean).join(' · ')}
          </p>
          {party.repLegal?.nome && (
            <p className="mt-1 text-xs text-muted">
              Rep. legal: {party.repLegal.nome} ({party.repLegal.cargo})
            </p>
          )}
        </div>
        {manage && (
          <Button variant="ghost" onClick={() => setEditing(true)}>
            Editar cadastro
          </Button>
        )}
      </div>

      {/* Abas */}
      <div className="mb-6 flex gap-1 border-b border-white/10">
        {[
          ['contratos', 'Contratos'],
          ['agenda', 'Agenda']
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            aria-pressed={tab === key}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              tab === key ? 'border-brd text-white' : 'border-transparent text-muted hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'contratos' && (
        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {[
                ['elaboracao', 'Elaboração'],
                ['gerenciamento', 'Cadastro de gerenciamento']
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSubTab(key)}
                  aria-pressed={subTab === key}
                  className={`min-h-11 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    subTab === key ? 'bg-brd/15 text-brd-200' : 'text-muted hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {manage && subTab === 'elaboracao' && (
              <Button onClick={() => navigate(`/parte/${party.id}/contratos/novo`)}>+ Novo contrato</Button>
            )}
            {manage && subTab === 'gerenciamento' && (
              <Button onClick={() => setManaging(true)}>+ Cadastrar gerenciamento</Button>
            )}
          </div>

          <ContractGrid
            contracts={subTab === 'elaboracao' ? elaborados : gerenciados}
            emptyLabel={
              subTab === 'elaboracao'
                ? 'Nenhum contrato elaborado ainda.'
                : 'Nenhum contrato em gerenciamento manual. Use para fornecedores ou contratos feitos fora do sistema.'
            }
            onView={setViewing}
          />
        </div>
      )}

      {tab === 'agenda' && (
        <div>
          {manage && (
            <div className="mb-4 flex justify-end">
              <Button onClick={() => setAddingEvent(true)}>+ Novo vencimento</Button>
            </div>
          )}
          <AgendaList events={events} showParty={false} canManage={manage} />
        </div>
      )}

      {editing && <PartyFormModal kind={party.kind} party={party} onClose={() => setEditing(false)} />}
      {managing && <ManageContractModal partyId={party.id} onClose={() => setManaging(false)} />}
      {viewing && <ContractViewModal contract={viewing} onClose={() => setViewing(null)} />}
      {addingEvent && (
        <EventFormModal partyId={party.id} contracts={contracts} onClose={() => setAddingEvent(false)} />
      )}
    </div>
  )
}

function ContractGrid({ contracts, emptyLabel, onView }) {
  if (contracts.length === 0) return <EmptyState title={emptyLabel} />
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {contracts.map((c) => (
        <Card key={c.id} className="flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white">{c.titulo || `${c.tipo}${c.subtipo ? ' · ' + c.subtipo : ''}`}</h3>
            <Badge tone={c.status === 'ativo' ? 'green' : 'gray'}>{c.status}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted">
            {c.tipo}
            {c.subtipo ? ` · ${c.subtipo}` : ''}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-muted">{c.source === 'manual' ? 'Gerenciamento manual' : 'Elaborado'}</span>
            <Button variant="subtle" onClick={() => onView(c)}>
              Ver detalhes →
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
