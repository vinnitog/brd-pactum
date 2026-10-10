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
    events,
    reminders: []
  }
}

// ---- Núcleo de persistência ------------------------------------------------
const listeners = new Set()
let storageIssue = null
let lastStoredRaw
let state = load()

function reportStorageIssue(kind, notify = true) {
  const messages = {
    corrupt: 'Os dados salvos neste navegador não puderam ser lidos. Eles foram preservados e nenhuma alteração será gravada. Restaure os dados antes de tentar novamente.',
    read: 'Não foi possível acessar os dados salvos neste navegador. Nenhuma alteração será gravada. Verifique as permissões de armazenamento e tente reler os dados.',
    write: 'Não foi possível salvar neste navegador. Nenhuma alteração foi gravada. Seus campos foram mantidos; libere espaço ou verifique as permissões e tente salvar novamente.',
    invalid: 'Não foi possível salvar estes dados. Nenhuma alteração foi gravada. Confira os dados do cadastro e tente novamente.',
    conflict: 'Os dados salvos mudaram em outra aba. Nenhuma alteração foi gravada e seus campos foram mantidos. Releia os dados salvos antes de tentar novamente.'
  }
  storageIssue = kind ? { kind, message: messages[kind] } : null
  if (notify) listeners.forEach((listener) => listener())
}

function optionalTextFields(record, fields) {
  return fields.every((field) => record[field] == null || typeof record[field] === 'string')
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function objectOrEmpty(value) {
  return value == null || isRecord(value)
}

function storedState(raw) {
  const parsed = JSON.parse(raw)
  const collections = ['parties', 'contracts', 'events']
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) ||
      collections.some((key) => !Array.isArray(parsed[key])) ||
      (parsed.reminders !== undefined && !Array.isArray(parsed.reminders))) throw new Error('Invalid stored state')
  if ([...collections, 'reminders'].some((key) =>
    (parsed[key] || []).some((item) => !item || typeof item !== 'object' || Array.isArray(item) || typeof item.id !== 'string'))) throw new Error('Invalid stored record')
  if (parsed.parties.some((item) => typeof item.name !== 'string') ||
      parsed.events.some((item) => typeof item.date !== 'string') ||
      (parsed.reminders || []).some((item) => typeof item.sentAt !== 'string')) throw new Error('Invalid stored record')
  if (parsed.parties.some((item) => !optionalTextFields(item, ['doc', 'rg', 'email', 'phone', 'address']) ||
      !objectOrEmpty(item.repLegal) || (item.repLegal && !optionalTextFields(item.repLegal, ['nome', 'cpf', 'cargo']))) ||
      parsed.contracts.some((item) => !optionalTextFields(item, ['tipo', 'subtipo', 'titulo', 'generatedText', 'vencimento']) ||
      !objectOrEmpty(item.parte) || (item.parte && !optionalTextFields(item.parte, ['qualificacao', 'representante'])) ||
      (item.testemunhas != null && (!Array.isArray(item.testemunhas) || item.testemunhas.some((witness) =>
        !witness || !objectOrEmpty(witness) || !optionalTextFields(witness, ['nome', 'cpf'])))))) throw new Error('Invalid stored record')
  return { reminders: [], ...parsed }
}

function load() {
  let raw
  try {
    raw = localStorage.getItem(KEY)
  } catch {
    reportStorageIssue('read', false)
    return null
  }
  if (raw !== null) {
    try {
      const loaded = storedState(raw)
      lastStoredRaw = raw
      reportStorageIssue(null, false)
      return loaded
    } catch {
      reportStorageIssue('corrupt', false)
      return null
    }
  }
  reportStorageIssue(null, false)
  lastStoredRaw = null
  return seed()
}

// Leitura bloqueada nunca substitui dados existentes por exemplos da demonstração.
state ||= { parties: [], contracts: [], events: [], reminders: [] }

function commit(next) {
  if (storageIssue?.kind === 'corrupt' || storageIssue?.kind === 'read') return false
  let currentRaw
  try {
    currentRaw = localStorage.getItem(KEY)
  } catch {
    reportStorageIssue('read')
    return false
  }
  if (currentRaw !== lastStoredRaw) {
    reportStorageIssue('conflict')
    return false
  }
  let serialized
  try {
    serialized = JSON.stringify(next)
    storedState(serialized)
  } catch {
    reportStorageIssue('invalid')
    return false
  }
  try {
    localStorage.setItem(KEY, serialized)
  } catch {
    reportStorageIssue('write')
    return false
  }
  state = next
  lastStoredRaw = serialized
  storageIssue = null
  listeners.forEach((l) => l())
  return true
}

export function getStorageIssue() {
  return storageIssue
}

export function useStorageIssue() {
  return useSyncExternalStore(subscribe, getStorageIssue, getStorageIssue)
}

export function retryStorage() {
  const loaded = load()
  if (loaded) state = loaded
  listeners.forEach((listener) => listener())
  return Boolean(loaded)
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
  return commit(seed())
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
  if (!isRecord(data)) {
    reportStorageIssue('invalid')
    return null
  }
  const parties = [...state.parties]
  if (data.id) {
    const i = parties.findIndex((p) => p.id === data.id)
    if (i < 0) return null
    parties[i] = { ...parties[i], ...data }
    return commit({ ...state, parties }) ? parties[i] : null
  }
  const created = { ...data, id: uid('party'), createdAt: new Date().toISOString() }
  return commit({ ...state, parties: [...parties, created] }) ? created : null
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
  return saveContractWithEvents(data)
}

// Contrato e vencimentos pertencem à mesma gravação; nenhum consumidor observa
// contrato sem os eventos que o formulário confirmou.
export function saveContractWithEvents(data, eventData = []) {
  if (!isRecord(data) || !Array.isArray(eventData) || eventData.some((event) =>
    !event || typeof event !== 'object' || Array.isArray(event) || typeof event.date !== 'string')) {
    reportStorageIssue('invalid')
    return null
  }
  const contracts = [...state.contracts]
  let saved
  if (data.id) {
    const i = contracts.findIndex((c) => c.id === data.id)
    if (i < 0) return null
    saved = { ...contracts[i], ...data }
    contracts[i] = saved
  } else {
    saved = { status: 'ativo', ...data, id: uid('contract'), createdAt: new Date().toISOString() }
    contracts.push(saved)
  }
  const events = eventData.map((event) => ({
    done: false, ...event, id: uid('ev'), contractId: saved.id, partyId: saved.partyId
  }))
  return commit({ ...state, contracts, events: [...state.events, ...events] }) ? saved : null
}

export function setContractStatus(id, status) {
  const contracts = state.contracts.map((c) => (c.id === id ? { ...c, status } : c))
  return commit({ ...state, contracts })
}

// ---- Eventos / agenda ------------------------------------------------------
export function listEvents(filter = {}) {
  let evs = state.events
  if (filter.partyId) evs = evs.filter((e) => e.partyId === filter.partyId)
  if (filter.contractId) evs = evs.filter((e) => e.contractId === filter.contractId)
  return [...evs].sort((a, b) => a.date.localeCompare(b.date))
}

export function saveEvent(data) {
  if (!isRecord(data)) {
    reportStorageIssue('invalid')
    return null
  }
  const events = [...state.events]
  if (data.id) {
    const i = events.findIndex((e) => e.id === data.id)
    if (i < 0) return null
    events[i] = { ...events[i], ...data }
    return commit({ ...state, events }) ? events[i] : null
  }
  const created = { done: false, ...data, id: uid('ev') }
  return commit({ ...state, events: [...events, created] }) ? created : null
}

export function toggleEventDone(id) {
  const events = state.events.map((e) => (e.id === id ? { ...e, done: !e.done } : e))
  return commit({ ...state, events })
}

export function deleteEvent(id) {
  return commit({ ...state, events: state.events.filter((e) => e.id !== id) })
}

// ---- Histórico de lembretes ao cliente (Issue #12) -------------------------
// Cada registro guarda o texto disparado, o canal e o momento do envio. O
// disparo é manual (decisão dos sócios): registrar aqui documenta o envio.
export function listReminders(filter = {}) {
  let rs = state.reminders || []
  if (filter.eventId) rs = rs.filter((r) => r.eventId === filter.eventId)
  if (filter.contractId) rs = rs.filter((r) => r.contractId === filter.contractId)
  if (filter.partyId) rs = rs.filter((r) => r.partyId === filter.partyId)
  return [...rs].sort((a, b) => b.sentAt.localeCompare(a.sentAt))
}

export function addReminder(data) {
  if (!isRecord(data)) {
    reportStorageIssue('invalid')
    return null
  }
  const reminders = state.reminders ? [...state.reminders] : []
  const created = {
    channel: 'whatsapp',
    ...data,
    id: uid('rem'),
    sentAt: new Date().toISOString()
  }
  return commit({ ...state, reminders: [...reminders, created] }) ? created : null
}
