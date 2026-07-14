// Camada de dados local-first (localStorage). Todos os acessos passam por aqui,
// então trocar por Supabase depois é isolado a este arquivo. Um contador de
// versão + subscribe permite que os componentes React re-renderizem após
// mutações sem uma lib de estado externa.
import { useSyncExternalStore } from 'react'

const KEY = 'brd-pactum:v1'

function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
}

// ---- Seed inicial (demonstração) -------------------------------------------
function seed() {
  const carmello = {
    id: 'party_carmello',
    kind: 'cliente',
    personType: 'PJ',
    name: 'Condomínio Carmello 350',
    doc: '12.345.678/0001-90',
    email: 'sindico@carmello350.com.br',
    phone: '(11) 99999-0001',
    address: 'Rua Carmello, 350 - São Paulo/SP',
    repLegal: { nome: 'João Síndico', cpf: '123.456.789-00', cargo: 'Síndico' },
    createdAt: new Date().toISOString()
  }
  const cliente2 = {
    id: 'party_marina',
    kind: 'cliente',
    personType: 'PF',
    name: 'Marina Alves',
    doc: '987.654.321-00',
    email: 'marina.alves@email.com',
    phone: '(11) 98888-2222',
    address: 'Av. Paulista, 1000 - São Paulo/SP',
    repLegal: null,
    createdAt: new Date().toISOString()
  }
  const fornecedor = {
    id: 'party_grafica',
    kind: 'fornecedor',
    personType: 'PJ',
    name: 'Gráfica Impressa Bem Ltda',
    doc: '55.444.333/0001-22',
    email: 'contato@impressabem.com.br',
    phone: '(11) 3333-4444',
    address: 'Rua da Indústria, 45 - Osasco/SP',
    repLegal: { nome: 'Carlos Gerente', cpf: '111.222.333-44', cargo: 'Sócio-administrador' },
    createdAt: new Date().toISOString()
  }

  const contratoCarmello = {
    id: 'contract_gold',
    partyId: carmello.id,
    groupId: 'civis',
    tipo: 'Prestação de Serviços',
    subtipo: 'Prestação de serviços advocatícios',
    titulo: 'Contrato de Prestação de Serviços Gold – Carmello 350',
    status: 'ativo',
    source: 'elaboracao',
    valor: 3500,
    parcelas: 12,
    meioPagamento: 'Boleto bancário',
    atualizacaoMonetaria: 'IPCA ao ano + multa de 2% em caso de inadimplência',
    prazo: '12 meses',
    multa: '10% sobre o saldo devedor',
    objeto: 'Assessoria jurídica preventiva e contenciosa ao condomínio.',
    comunicacao: 'Por e-mail e WhatsApp cadastrados.',
    testemunhas: [
      { nome: 'Ana Testemunha', cpf: '222.333.444-55' },
      { nome: 'Pedro Testemunha', cpf: '333.444.555-66' }
    ],
    parte: {
      qualificacao: 'Condomínio Carmello 350, CNPJ 12.345.678/0001-90',
      representante: 'João Síndico, CPF 123.456.789-00'
    },
    createdAt: new Date().toISOString()
  }

  const events = [
    {
      id: 'ev_1',
      contractId: contratoCarmello.id,
      partyId: carmello.id,
      type: 'vencimento',
      date: '2026-07-03',
      urgency: 'alta',
      note: 'Vencimento do contrato',
      done: false
    },
    {
      id: 'ev_2',
      contractId: contratoCarmello.id,
      partyId: carmello.id,
      type: 'atualizacao',
      date: '2026-07-03',
      urgency: 'media',
      note: 'Atualização monetária',
      done: false
    },
    {
      id: 'ev_3',
      contractId: contratoCarmello.id,
      partyId: carmello.id,
      type: 'qualificacao',
      date: '2026-07-03',
      urgency: 'baixa',
      note: 'Mudar qualificação síndico',
      done: false
    }
  ]

  return {
    parties: [carmello, cliente2, fornecedor],
    contracts: [contratoCarmello],
    events
  }
}

// ---- Núcleo de persistência ------------------------------------------------
let state = load()
const listeners = new Set()

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignora storage corrompido */
  }
  const initial = seed()
  try {
    localStorage.setItem(KEY, JSON.stringify(initial))
  } catch {
    /* modo privado sem storage: mantém em memória */
  }
  return initial
}

function commit(next) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignora */
  }
  listeners.forEach((l) => l())
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Hook de leitura reativa. `selector` recebe o estado inteiro.
export function useStore(selector) {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state)
  )
}

export function getState() {
  return state
}

export function resetStore() {
  commit(seed())
}

// ---- Parties (clientes / fornecedores) -------------------------------------
export function listParties(kind) {
  const all = state.parties
  return kind ? all.filter((p) => p.kind === kind) : all
}

export function getParty(id) {
  return state.parties.find((p) => p.id === id) || null
}

export function saveParty(data) {
  const parties = [...state.parties]
  if (data.id) {
    const i = parties.findIndex((p) => p.id === data.id)
    if (i >= 0) parties[i] = { ...parties[i], ...data }
    commit({ ...state, parties })
    return parties[i]
  }
  const created = { ...data, id: uid('party'), createdAt: new Date().toISOString() }
  commit({ ...state, parties: [...parties, created] })
  return created
}

// ---- Contratos -------------------------------------------------------------
export function listContracts(partyId) {
  const all = state.contracts
  return partyId ? all.filter((c) => c.partyId === partyId) : all
}

export function getContract(id) {
  return state.contracts.find((c) => c.id === id) || null
}

export function saveContract(data) {
  const contracts = [...state.contracts]
  if (data.id) {
    const i = contracts.findIndex((c) => c.id === data.id)
    if (i >= 0) contracts[i] = { ...contracts[i], ...data }
    commit({ ...state, contracts })
    return contracts[i]
  }
  const created = {
    status: 'ativo',
    ...data,
    id: uid('contract'),
    createdAt: new Date().toISOString()
  }
  commit({ ...state, contracts: [...contracts, created] })
  return created
}

export function setContractStatus(id, status) {
  const contracts = state.contracts.map((c) => (c.id === id ? { ...c, status } : c))
  commit({ ...state, contracts })
}

// ---- Eventos / agenda ------------------------------------------------------
export function listEvents(filter = {}) {
  let evs = state.events
  if (filter.partyId) evs = evs.filter((e) => e.partyId === filter.partyId)
  if (filter.contractId) evs = evs.filter((e) => e.contractId === filter.contractId)
  return [...evs].sort((a, b) => a.date.localeCompare(b.date))
}

export function saveEvent(data) {
  const events = [...state.events]
  if (data.id) {
    const i = events.findIndex((e) => e.id === data.id)
    if (i >= 0) events[i] = { ...events[i], ...data }
    commit({ ...state, events })
    return events[i]
  }
  const created = { done: false, ...data, id: uid('ev') }
  commit({ ...state, events: [...events, created] })
  return created
}

export function toggleEventDone(id) {
  const events = state.events.map((e) => (e.id === id ? { ...e, done: !e.done } : e))
  commit({ ...state, events })
}

export function deleteEvent(id) {
  commit({ ...state, events: state.events.filter((e) => e.id !== id) })
}
