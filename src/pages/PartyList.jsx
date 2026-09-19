import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { canManage, visibleParties } from '../lib/permissions.js'
import { useStore } from '../lib/store.js'
import { Button, Card, Input, Field, Badge, EmptyState } from '../components/ui/index.jsx'
import PartyFormModal from '../components/PartyFormModal.jsx'

const LABELS = {
  cliente: { title: 'Clientes', singular: 'cliente', empty: 'Nenhum cliente cadastrado ainda.' },
  fornecedor: { title: 'Fornecedores', singular: 'fornecedor', empty: 'Nenhum fornecedor cadastrado ainda.' }
}

export default function PartyList({ kind }) {
  const { user } = useAuth()
  const parties = useStore((s) => s.parties)
  const contracts = useStore((s) => s.contracts)
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const meta = LABELS[kind]

  const list = useMemo(() => {
    const visible = visibleParties(user, parties).filter((p) => p.kind === kind)
    const q = query.trim().toLowerCase()
    if (!q) return visible
    return visible.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.doc || '').toLowerCase().includes(q)
    )
  }, [user, parties, kind, query])

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{meta.title}</h1>
          <p className="text-sm text-muted">
            Selecione um {meta.singular} para ver contratos e agenda.
          </p>
        </div>
        {canManage(user) && (
          <Button onClick={() => setCreating(true)}>+ Novo {meta.singular}</Button>
        )}
      </div>

      <Field label={`Pesquisar ${meta.title.toLowerCase()}`} className="mb-5 max-w-md">
        <Input
          type="search"
          placeholder={`Pesquisar ${meta.singular} por nome ou documento…`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Field>

      {list.length === 0 ? (
        <EmptyState title={query.trim() ? 'Nenhum resultado encontrado.' : meta.empty}>
          {query.trim() ? 'Tente outro nome ou documento, ou limpe a pesquisa.' : canManage(user) && `Use o botão "Novo ${meta.singular}" para cadastrar.`}
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => {
            const count = contracts.filter((c) => c.partyId === p.id).length
            return (
              <Card as={Link} to={`/parte/${p.id}`} key={p.id} className="block transition-colors hover:border-brd/50 hover:bg-brd/5">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-white">{p.name}</h2>
                  <Badge tone="gray">{p.personType}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted">{p.doc}</p>
                <p className="mt-3 text-xs text-muted">
                  {count} contrato{count === 1 ? '' : 's'}
                </p>
              </Card>
            )
          })}
        </div>
      )}

      {creating && <PartyFormModal kind={kind} onClose={() => setCreating(false)} />}
    </div>
  )
}
