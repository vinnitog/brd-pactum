// @vitest-environment jsdom
import React from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import NewContract from '../src/pages/NewContract.jsx'
import ManageContractModal from '../src/components/ManageContractModal.jsx'
import EventFormModal from '../src/components/EventFormModal.jsx'
import PartyFormModal from '../src/components/PartyFormModal.jsx'
import ReminderComposer from '../src/components/ReminderComposer.jsx'
import StorageNotice from '../src/components/StorageNotice.jsx'
import { getState, retryStorage } from '../src/lib/store.js'
import { fixtureParty } from './fixtures/contracts.js'

const KEY = 'brd-pactum:v1'
const party = fixtureParty({ phone: '(11) 90000-0000' })
const original = JSON.stringify({ parties: [party], contracts: [], events: [], reminders: [] })
let failWrites
let written

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem(KEY, original)
  retryStorage()
  failWrites = true
  written = []
  const nativeSetItem = Storage.prototype.setItem
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (key, raw) {
    if (failWrites) throw new DOMException('Storage full', 'QuotaExceededError')
    written.push(raw)
    nativeSetItem.call(this, key, raw)
  })
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))
  vi.stubGlobal('scrollTo', vi.fn())
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it('minuta vazia e campos apagados permanecem após quota; retry salva contrato/evento uma vez', () => {
  render(<MemoryRouter initialEntries={[`/novo/${party.id}`]}>
    <StorageNotice />
    <Routes>
      <Route path="/novo/:id" element={<NewContract />} />
      <Route path="/parte/:id" element={<h1>Contrato salvo</h1>} />
    </Routes>
  </MemoryRouter>)
  fireEvent.change(screen.getByLabelText('Classificação'), { target: { value: 'civis' } })
  fireEvent.change(screen.getByLabelText('Tipo'), { target: { value: 'Prestação de Serviços' } })
  fireEvent.change(screen.getByLabelText('Vencimento'), { target: { value: '2028-02-29' } })
  fireEvent.click(screen.getByRole('button', { name: /Revisar dados/ }))
  fireEvent.change(screen.getByLabelText('Identificação e qualificação das partes'), { target: { value: '' } })
  fireEvent.change(screen.getByLabelText('Qualificação do representante legal'), { target: { value: '' } })
  fireEvent.click(screen.getByRole('button', { name: /Gerar minuta/ }))
  fireEvent.change(screen.getByLabelText('Texto da minuta'), { target: { value: '' } })
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar e salvar' }))
  expect(screen.getByRole('alert').textContent).toMatch(/Nenhuma alteração foi gravada/)
  expect(screen.getByRole('status').textContent).toMatch(/tente salvar novamente/)
  expect(screen.getByLabelText('Texto da minuta').value).toBe('')
  expect(localStorage.getItem(KEY)).toBe(original)
  expect(getState().contracts).toHaveLength(0)
  failWrites = false
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar e salvar' }))
  expect(screen.getByRole('heading', { name: 'Contrato salvo' })).toBeTruthy()
  expect(written).toHaveLength(1)
  const saved = JSON.parse(localStorage.getItem(KEY))
  expect(saved.contracts).toHaveLength(1)
  expect(saved.events).toHaveLength(1)
  expect(saved.contracts[0]).toMatchObject({ generatedText: '', parte: { qualificacao: '', representante: '' } })
  expect(saved.events[0]).toMatchObject({ date: '2028-02-29', contractId: saved.contracts[0].id, partyId: party.id })
})

it('gerenciamento mantém testemunha e múltiplos vencimentos em falha e só fecha após gravação conjunta', () => {
  const onClose = vi.fn()
  render(<ManageContractModal partyId={party.id} onClose={onClose} />)
  fireEvent.change(screen.getByLabelText('Título / identificação do contrato'), { target: { value: 'Cadastro sintético' } })
  fireEvent.change(screen.getAllByPlaceholderText('Nome')[0], { target: { value: 'Testemunha QA' } })
  fireEvent.click(screen.getAllByRole('button', { name: '+ adicionar' })[0])
  fireEvent.click(screen.getByRole('button', { name: 'Salvar cadastro' }))
  expect(onClose).not.toHaveBeenCalled()
  expect(screen.getByRole('alert').textContent).toMatch(/Não foi possível salvar/)
  expect(screen.getByLabelText('Título / identificação do contrato').value).toBe('Cadastro sintético')
  expect(screen.getAllByPlaceholderText('Nome')[0].value).toBe('Testemunha QA')
  expect(localStorage.getItem(KEY)).toBe(original)
  failWrites = false
  fireEvent.click(screen.getByRole('button', { name: 'Salvar cadastro' }))
  expect(onClose).toHaveBeenCalledOnce()
  expect(written).toHaveLength(1)
  expect(getState().contracts).toHaveLength(1)
  expect(getState().events).toHaveLength(2)
  expect(getState().events.every((event) => event.contractId === getState().contracts[0].id)).toBe(true)
})

it('cadastro de parte conserva campos e permite salvar novamente sem fechar em falha', () => {
  const onClose = vi.fn()
  render(<MemoryRouter><PartyFormModal kind="cliente" onClose={onClose} /></MemoryRouter>)
  fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: 'Pessoa QA' } })
  fireEvent.click(screen.getByRole('button', { name: /Salvar/ }))
  expect(onClose).not.toHaveBeenCalled()
  expect(screen.getByRole('alert').textContent).toMatch(/Não foi possível salvar/)
  expect(screen.getByLabelText('Nome completo').value).toBe('Pessoa QA')
  failWrites = false
  fireEvent.click(screen.getByRole('button', { name: /Salvar/ }))
  expect(onClose).toHaveBeenCalledOnce()
  expect(getState().parties).toHaveLength(2)
})

it('releitura dentro do modal conserva rascunho e alterações externas antes de salvar', () => {
  const onClose = vi.fn()
  render(<ManageContractModal partyId={party.id} onClose={onClose} />)
  fireEvent.change(screen.getByLabelText('Título / identificação do contrato'), { target: { value: 'Rascunho QA' } })
  fireEvent.change(screen.getAllByPlaceholderText('Nome')[0], { target: { value: 'Testemunha QA' } })
  failWrites = false
  const changed = JSON.stringify({ ...JSON.parse(original), parties: [party, fixtureParty({ id: 'external-party', name: 'Parte externa QA' })] })
  localStorage.setItem(KEY, changed)
  written.length = 0
  fireEvent.click(screen.getByRole('button', { name: 'Salvar cadastro' }))
  expect(onClose).not.toHaveBeenCalled()
  expect(screen.getByRole('alert').textContent).toMatch(/outra aba/)
  expect(localStorage.getItem(KEY)).toBe(changed)
  expect(written).toHaveLength(0)
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Reler dados salvos' }))
  expect(screen.queryByRole('alert')).toBeNull()
  expect(screen.getByLabelText('Título / identificação do contrato').value).toBe('Rascunho QA')
  expect(screen.getAllByPlaceholderText('Nome')[0].value).toBe('Testemunha QA')
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Salvar cadastro' }))
  expect(written).toHaveLength(0)
  fireEvent.click(screen.getByRole('button', { name: 'Salvar cadastro' }))
  expect(onClose).toHaveBeenCalledOnce()
  expect(written).toHaveLength(1)
  expect(getState().parties).toHaveLength(2)
  expect(getState().parties[1].id).toBe('external-party')
  expect(getState().contracts).toHaveLength(1)
  expect(getState().events).toHaveLength(1)
})

it('agenda mantém evento sem contrato e rascunho quando não consegue persistir', () => {
  const onClose = vi.fn()
  render(<EventFormModal partyId={party.id} onClose={onClose} />)
  fireEvent.change(screen.getByLabelText('Observação'), { target: { value: 'Prazo QA' } })
  fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }))
  expect(onClose).not.toHaveBeenCalled()
  expect(screen.getByRole('alert').textContent).toMatch(/Não foi possível salvar/)
  expect(screen.getByLabelText('Observação').value).toBe('Prazo QA')
  failWrites = false
  fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }))
  expect(onClose).toHaveBeenCalledOnce()
  expect(getState().events[0]).toMatchObject({ contractId: '', note: 'Prazo QA' })
})

it('histórico que falha bloqueia o link externo e conserva o texto sem simular envio', () => {
  const event = { id: 'event-qa', date: '2028-02-29', type: 'vencimento', partyId: party.id }
  render(<ReminderComposer event={event} party={party} />)
  fireEvent.change(screen.getByLabelText('Texto do lembrete'), { target: { value: 'Mensagem QA' } })
  const link = screen.getByRole('link', { name: /Enviar por WhatsApp/ })
  // dispatchEvent retorna false quando o app cancela a navegação externa.
  expect(fireEvent.click(link)).toBe(false)
  expect(screen.getByRole('alert').textContent).toMatch(/Não foi possível salvar/)
  expect(screen.getByLabelText('Texto do lembrete').value).toBe('Mensagem QA')
  expect(getState().reminders).toHaveLength(0)
  failWrites = false
  fireEvent.click(screen.getByRole('button', { name: 'Registrar envio' }))
  expect(getState().reminders).toHaveLength(1)
  expect(screen.queryByRole('alert')).toBeNull()
})

it('aviso permite reler dados recuperados sem gravar por cima dos bytes inválidos', () => {
  failWrites = false
  localStorage.setItem(KEY, '{corrupt')
  written.length = 0
  retryStorage()
  render(<StorageNotice />)
  expect(screen.getByRole('status').textContent).toMatch(/foram preservados/)
  fireEvent.click(screen.getByRole('button', { name: 'Reler dados salvos' }))
  expect(localStorage.getItem(KEY)).toBe('{corrupt')
  expect(written).toHaveLength(0)
  localStorage.setItem(KEY, original)
  written.length = 0
  fireEvent.click(screen.getByRole('button', { name: 'Reler dados salvos' }))
  expect(screen.queryByRole('status')).toBeNull()
  expect(written).toHaveLength(0)
  expect(getState().parties[0].id).toBe(party.id)
})
