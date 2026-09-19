// @vitest-environment jsdom

import React, { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

const storeMocks = vi.hoisted(() => ({
  deleteEvent: vi.fn(),
  getContract: vi.fn(() => null),
  getParty: vi.fn(() => null),
  saveContract: vi.fn(),
  saveEvent: vi.fn(),
  saveParty: vi.fn(),
  toggleEventDone: vi.fn(),
  useStore: vi.fn((selector) => selector({ events: [] }))
}))

vi.mock('../src/lib/store.js', () => storeMocks)
const authMocks = vi.hoisted(() => ({ useAuth: vi.fn() }))
vi.mock('../src/contexts/AuthContext.jsx', () => authMocks)

import AgendaList from '../src/components/AgendaList.jsx'
import EventFormModal from '../src/components/EventFormModal.jsx'
import Modal from '../src/components/Modal.jsx'
import Donut from '../src/components/Donut.jsx'
import Home from '../src/pages/Home.jsx'
import PartyList from '../src/pages/PartyList.jsx'
import Agenda from '../src/pages/Agenda.jsx'
import NewContract from '../src/pages/NewContract.jsx'

let state
const lawyer = { name: 'Dra. Ana', role: 'advogado' }
const client = { name: 'Ana', role: 'cliente', partyId: 'party-1' }

function renderPage(page) {
  return render(<MemoryRouter>{page}</MemoryRouter>)
}

function event(overrides = {}) {
  return { id: 'event-1', partyId: 'party-1', type: 'vencimento', date: '2028-02-15', urgency: 'alta', done: false, note: 'Prazo próprio', ...overrides }
}

function ModalHarness({ children }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Abrir diálogo</button>
      {open && (
        <Modal title="Diálogo de teste" onClose={() => setOpen(false)}>
          {children}
        </Modal>
      )}
    </>
  )
}

async function openModal(children) {
  render(<ModalHarness>{children}</ModalHarness>)
  const trigger = screen.getByRole('button', { name: 'Abrir diálogo' })
  trigger.focus()
  fireEvent.click(trigger)
  const dialog = screen.getByRole('dialog', { name: 'Diálogo de teste' })
  await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true))
  return { dialog, trigger }
}

beforeEach(() => {
  vi.clearAllMocks()
  state = {
    parties: [
      { id: 'party-1', name: 'Ana Cliente', kind: 'cliente', personType: 'PF', doc: '111.222.333-44' },
      { id: 'party-2', name: 'Bruno Cliente', kind: 'cliente', personType: 'PF', doc: '555.666.777-88' },
      { id: 'party-3', name: 'Fornecedor Externo', kind: 'fornecedor', personType: 'PJ', doc: '12.345.678/0001-90' }
    ],
    contracts: [],
    events: []
  }
  storeMocks.useStore.mockImplementation((selector) => selector(state))
  storeMocks.getParty.mockImplementation((id) => state.parties.find((party) => party.id === id) || null)
  storeMocks.getContract.mockImplementation((id) => state.contracts.find((contract) => contract.id === id) || null)
  storeMocks.saveContract.mockImplementation((contract) => ({ ...contract, id: 'saved-contract' }))
  authMocks.useAuth.mockReturnValue({ user: lawyer })
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2028, 1, 15, 12))
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))
  vi.stubGlobal('scrollTo', vi.fn())
  document.body.style.overflow = ''
  window.requestAnimationFrame = (callback) => window.setTimeout(callback, 0)
  window.cancelAnimationFrame = (id) => window.clearTimeout(id)
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('Modal acessível', () => {
  it('expõe semântica de diálogo, título associado e foco inicial', async () => {
    const { dialog } = await openModal(
      <>
        <input aria-label="Primeiro campo" />
        <button type="button">Salvar</button>
      </>
    )

    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(dialog.getAttribute('aria-labelledby')).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Fechar' }))
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('mantém Tab e Shift+Tab dentro do diálogo', async () => {
    const { dialog } = await openModal(
      <>
        <input aria-label="Campo" />
        <button type="button">Última ação</button>
      </>
    )
    const close = screen.getByRole('button', { name: 'Fechar' })
    const last = screen.getByRole('button', { name: 'Última ação' })

    last.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(close)

    close.focus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(last)

    screen.getByRole('button', { name: 'Abrir diálogo' }).focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(close)
    expect(dialog.contains(document.activeElement)).toBe(true)
  })

  it('fecha com Escape e devolve o foco ao acionador', async () => {
    const { trigger } = await openModal(<button type="button">Ação</button>)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('fecha apenas ao acionar o overlay e restaura o scroll anterior', async () => {
    document.body.style.overflow = 'scroll'
    const { dialog, trigger } = await openModal(<button type="button">Ação interna</button>)

    fireEvent.mouseDown(dialog)
    expect(screen.getByRole('dialog')).toBe(dialog)

    fireEvent.mouseDown(dialog.parentElement)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.body.style.overflow).toBe('scroll')
    expect(document.activeElement).toBe(trigger)
  })
})

describe('revisão de dados do contrato (Issue #4)', () => {
  function renderNewContract() {
    storeMocks.getParty.mockReturnValue({
      id: 'p1',
      name: 'Cliente X',
      personType: 'PF',
      doc: '111',
      address: 'Rua A'
    })
    render(
      <MemoryRouter initialEntries={['/novo/p1']}>
        <Routes>
          <Route path="/novo/:id" element={<NewContract />} />
          <Route path="/parte/:id" element={<div>Página da parte</div>} />
        </Routes>
      </MemoryRouter>
    )
  }

  function preencherEIrParaRevisao() {
    fireEvent.change(screen.getByLabelText('Classificação'), { target: { value: 'civis' } })
    fireEvent.change(screen.getByLabelText('Tipo'), { target: { value: 'Prestação de Serviços' } })
    fireEvent.change(screen.getByLabelText('Valor (R$)'), { target: { value: '150000' } })
    fireEvent.change(screen.getByLabelText('Comunicação'), { target: { value: 'Somente por e-mail' } })
    fireEvent.click(screen.getByRole('button', { name: /Revisar dados/ }))
  }

  it('trava a comunicação e mantém o valor editável na conferência', () => {
    renderNewContract()
    preencherEIrParaRevisao()

    expect(screen.getByRole('heading', { name: 'Revisão dos dados' })).toBeTruthy()
    // Campo travado: aparece só para conferência, sem controle editável.
    expect(screen.getByText('Somente conferência')).toBeTruthy()
    expect(screen.getByText('Somente por e-mail')).toBeTruthy()
    expect(screen.queryByLabelText('Forma de comunicação entre as partes')).toBeNull()
    // Campo editável mantém o valor preenchido e permite ajuste.
    expect(screen.getByLabelText('Valor').value).toBe('1.500,00')
  })

  it('gera a minuta com o valor ajustado na revisão e salva ao confirmar', () => {
    renderNewContract()
    preencherEIrParaRevisao()

    fireEvent.change(screen.getByLabelText('Valor'), { target: { value: '200000' } })
    fireEvent.click(screen.getByRole('button', { name: /Gerar minuta/ }))

    const minuta = screen.getByLabelText('Texto da minuta')
    expect(minuta.value).toContain('R$ 2.000,00')

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar e salvar' }))
    expect(storeMocks.saveContract).toHaveBeenCalledOnce()
    expect(storeMocks.saveContract.mock.calls[0][0].comunicacao).toBe('Somente por e-mail')
  })
})

describe('proteções da agenda', () => {
  it('conclui e reabre o mesmo evento e apresenta seu estado atualizado', () => {
    const scheduledEvent = event({ id: 'event-to-toggle' })
    const { rerender } = render(<AgendaList events={[scheduledEvent]} canManage />)

    fireEvent.click(screen.getByRole('button', { name: 'Concluir evento' }))
    expect(storeMocks.toggleEventDone).toHaveBeenNthCalledWith(1, 'event-to-toggle')

    rerender(<AgendaList events={[{ ...scheduledEvent, done: true }]} canManage />)
    expect(screen.getByText('Concluído')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Concluir evento' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Reabrir evento' }))
    expect(storeMocks.toggleEventDone).toHaveBeenCalledTimes(2)
    expect(storeMocks.toggleEventDone).toHaveBeenNthCalledWith(2, 'event-to-toggle')
  })

  it('gera o lembrete do segundo evento com seus próprios dados e devolve foco ao fechar', async () => {
    state.parties[1].email = 'bruno@example.test'
    state.contracts = [
      { id: 'contract-1', partyId: 'party-1', titulo: 'Contrato de Ana' },
      { id: 'contract-2', partyId: 'party-2', titulo: 'Contrato de Bruno' }
    ]
    const events = [
      event({ contractId: 'contract-1' }),
      event({ id: 'event-2', partyId: 'party-2', contractId: 'contract-2', date: '2028-03-20', type: 'atualizacao' })
    ]
    render(<AgendaList events={events} canManage />)
    const trigger = screen.getAllByRole('button', { name: 'Gerar lembrete' })[1]
    trigger.focus()
    fireEvent.click(trigger)

    const dialog = screen.getByRole('dialog', { name: 'Lembrete ao cliente' })
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true))
    const reminder = within(dialog).getByRole('textbox').value
    expect(reminder).toContain('Contrato de Bruno')
    expect(reminder).toContain('Bruno Cliente')
    expect(reminder).toContain('com atualização monetária prevista')
    expect(reminder).toContain('20/03/2028')
    expect(reminder).not.toContain('Contrato de Ana')
    expect(reminder).not.toContain('15/02/2028')
    expect(within(dialog).getByRole('link', { name: /Enviar por e-mail/ }).getAttribute('href')).toContain('mailto:bruno@example.test?')

    fireEvent.click(within(dialog).getByRole('button', { name: 'Fechar' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('marca a data do novo evento como obrigatória e impede envio vazio', async () => {
    const onClose = vi.fn()
    render(<EventFormModal partyId="party-1" onClose={onClose} />)
    const date = screen.getByLabelText('Data')

    expect(date.required).toBe(true)
    expect(date.getAttribute('aria-required')).toBe('true')
    fireEvent.change(date, { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }))

    expect(date.checkValidity()).toBe(false)
    expect(storeMocks.saveEvent).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('só exclui o evento depois de confirmação explícita', () => {
    const event = {
      id: 'event-1',
      partyId: 'party-1',
      contractId: '',
      type: 'vencimento',
      date: '2028-02-29',
      urgency: 'alta',
      done: false
    }
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true)
    render(<AgendaList events={[event]} canManage />)
    const remove = screen.getByRole('button', { name: 'Excluir evento' })

    fireEvent.click(remove)
    expect(storeMocks.deleteEvent).not.toHaveBeenCalled()

    fireEvent.click(remove)
    expect(confirm).toHaveBeenCalledTimes(2)
    expect(storeMocks.deleteEvent).toHaveBeenCalledOnce()
    expect(storeMocks.deleteEvent).toHaveBeenCalledWith('event-1')
  })
})

describe('início e cadastros', () => {
  it('limita o estado vazio aos vencimentos futuros quando há um prazo atrasado', () => {
    state.events = [event({ date: '2028-02-14' })]
    renderPage(<Home />)

    expect(screen.getByText('Nenhum vencimento previsto a partir de hoje.')).toBeTruthy()
    expect(screen.getByText('Consulte a agenda completa para ver os demais registros.')).toBeTruthy()
    expect(screen.queryByText(/nenhum.*pendente/i)).toBeNull()
    expect(screen.getByRole('link', { name: /Ver agenda completa/ }).getAttribute('href')).toBe('/agenda')
  })

  it('restringe o início do cliente aos seus dados e não oferece Dashboard', () => {
    authMocks.useAuth.mockReturnValue({ user: client })
    state.events = [event(), event({ id: 'other', partyId: 'party-2', note: 'Prazo privado' })]
    renderPage(<Home />)

    expect(screen.getByRole('link', { name: /Prazo próprio — Ana Cliente/ })).toBeTruthy()
    expect(screen.queryByText(/Prazo privado/)).toBeNull()
    expect(screen.queryByRole('link', { name: /Dashboard/ })).toBeNull()
    expect(screen.getByRole('link', { name: /^Clientes 1 / }).getAttribute('href')).toBe('/clientes')
    expect(screen.getByRole('link', { name: /^Fornecedores 0 / })).toBeTruthy()
  })

  it('oferece cards como links nativos e Dashboard para o advogado', () => {
    state.contracts = [{ id: 'contract-1', partyId: 'party-1' }]
    renderPage(<Home />)

    for (const [name, destination] of [['Clientes', '/clientes'], ['Fornecedores', '/fornecedores'], ['Agenda', '/agenda'], ['Dashboard', '/dashboard']]) {
      expect(screen.getByRole('link', { name: new RegExp(`^${name} `) }).getAttribute('href')).toBe(destination)
    }
    expect(screen.getByRole('link', { name: /^Dashboard 1 / })).toBeTruthy()
  })

  it('pesquisa clientes por nome ou documento usando campo rotulado e links corretos', () => {
    renderPage(<PartyList kind="cliente" />)
    const search = screen.getByRole('searchbox', { name: 'Pesquisar clientes' })

    fireEvent.change(search, { target: { value: 'ana' } })
    expect(screen.getByRole('link', { name: /Ana Cliente/ }).getAttribute('href')).toBe('/parte/party-1')
    expect(screen.queryByRole('link', { name: /Bruno Cliente/ })).toBeNull()

    fireEvent.change(search, { target: { value: '555.666' } })
    expect(screen.getByRole('link', { name: /Bruno Cliente/ }).getAttribute('href')).toBe('/parte/party-2')
    expect(screen.queryByRole('link', { name: /Ana Cliente/ })).toBeNull()
  })

  it('distingue busca vazia e restaura apenas cadastros autorizados ao limpar', () => {
    authMocks.useAuth.mockReturnValue({ user: client })
    renderPage(<PartyList kind="cliente" />)
    const search = screen.getByRole('searchbox', { name: 'Pesquisar clientes' })

    fireEvent.change(search, { target: { value: 'Bruno' } })
    expect(screen.getByText('Nenhum resultado encontrado.')).toBeTruthy()
    expect(screen.queryByText('Nenhum cliente cadastrado ainda.')).toBeNull()
    expect(screen.queryByRole('button', { name: /Novo cliente/ })).toBeNull()

    fireEvent.change(search, { target: { value: '' } })
    expect(screen.getByRole('link', { name: /Ana Cliente/ })).toBeTruthy()
    expect(screen.queryByRole('link', { name: /Bruno Cliente/ })).toBeNull()
    expect(screen.queryByText('Nenhum resultado encontrado.')).toBeNull()
  })
})

describe('navegação acessível da agenda', () => {
  it('identifica hoje e anuncia todos os eventos autorizados mesmo acima de três', () => {
    authMocks.useAuth.mockReturnValue({ user: client })
    state.events = [
      ...Array.from({ length: 4 }, (_, i) => event({ id: `own-${i}`, note: `Prazo ${i + 1}` })),
      event({ id: 'private', partyId: 'party-2', note: 'Evento privado' })
    ]
    renderPage(<Agenda />)
    const today = screen.getByRole('button', { name: '15/02/2028: 4 eventos' })

    expect(today.getAttribute('aria-current')).toBe('date')
    expect(today.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(today)
    expect(today.getAttribute('aria-pressed')).toBe('true')
    for (let i = 1; i <= 4; i++) expect(screen.getByText(new RegExp(`Prazo ${i} · Ana Cliente`))).toBeTruthy()
    expect(screen.queryByText(/Evento privado/)).toBeNull()
  })

  it('limpa seleção e detalhes ao mudar de mês e não os restaura ao voltar', () => {
    state.events = [event()]
    renderPage(<Agenda />)
    fireEvent.click(screen.getByRole('button', { name: '15/02/2028: 1 evento' }))
    expect(screen.getByRole('heading', { name: '15/02/2028' })).toBeTruthy()
    expect(screen.getByText(/Prazo próprio/)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Próximo mês' }))
    expect(screen.getByRole('heading', { name: 'Março 2028' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Selecione um dia' })).toBeTruthy()
    expect(screen.queryByText(/Prazo próprio/)).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Mês anterior' }))
    expect(screen.getByRole('heading', { name: 'Fevereiro 2028' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '15/02/2028: 1 evento' }).getAttribute('aria-pressed')).toBe('false')
    expect(screen.getByRole('heading', { name: 'Selecione um dia' })).toBeTruthy()
  })

  it('expõe o modo ativo e impede ações de gestão para clientes na lista e no dia', () => {
    authMocks.useAuth.mockReturnValue({ user: client })
    state.events = [event(), event({ id: 'private', partyId: 'party-2', note: 'Evento privado' })]
    renderPage(<Agenda />)
    const calendar = screen.getByRole('button', { name: 'Agenda', exact: true })
    const list = screen.getByRole('button', { name: 'Lista', exact: true })
    expect(calendar.getAttribute('aria-pressed')).toBe('true')
    expect(list.getAttribute('aria-pressed')).toBe('false')

    fireEvent.click(list)
    expect(calendar.getAttribute('aria-pressed')).toBe('false')
    expect(list.getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByText(/Prazo próprio/)).toBeTruthy()
    expect(screen.queryByText(/Evento privado/)).toBeNull()
    expect(screen.queryByRole('button', { name: /Concluir evento|Reabrir evento|Excluir evento/ })).toBeNull()

    fireEvent.click(calendar)
    fireEvent.click(screen.getByRole('button', { name: '15/02/2028: 1 evento' }))
    expect(calendar.getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByText(/Prazo próprio/)).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Concluir evento|Reabrir evento|Excluir evento/ })).toBeNull()
  })
})

describe('dados textuais dos gráficos', () => {
  it('apresenta rótulo, valor e percentual juntos sem depender de cor', () => {
    render(<Donut segments={[
      { label: 'Ativos', value: 3, display: 'R$ 3,00', color: '#00ff00' },
      { label: 'Inativos', value: 1, color: '#ff0000' }
    ]} />)
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(within(items[0]).getByText('Ativos')).toBeTruthy()
    expect(within(items[0]).getByText('R$ 3,00')).toBeTruthy()
    expect(within(items[0]).getByText('75%')).toBeTruthy()
    expect(within(items[1]).getByText('Inativos')).toBeTruthy()
    expect(within(items[1]).getByText('1')).toBeTruthy()
    expect(within(items[1]).getByText('25%')).toBeTruthy()
  })

  it.each([
    { caseName: 'vazios', segments: [] },
    { caseName: 'zerados', segments: [{ label: 'Ativos', value: 0, color: '#00ff00' }] }
  ])('trata dados $caseName sem percentuais inválidos', ({ segments }) => {
    render(<Donut segments={segments} />)
    expect(screen.getByText('Sem dados.')).toBeTruthy()
    expect(screen.getByText('0')).toBeTruthy()
    expect(screen.queryByText(/NaN|Infinity|%/)).toBeNull()
  })
})

describe('elaboração e revisão de contrato', () => {
  it('gera uma minuta rotulada, respeita movimento reduzido e salva somente após revisão', () => {
    const scrollTo = vi.fn()
    vi.stubGlobal('scrollTo', scrollTo)
    vi.stubGlobal('matchMedia', vi.fn((query) => ({ matches: query === '(prefers-reduced-motion: reduce)', media: query })))
    render(
      <MemoryRouter initialEntries={['/parte/party-1/novo']}>
        <Routes>
          <Route path="/parte/:id/novo" element={<NewContract />} />
          <Route path="/parte/:id" element={<h1>Detalhes da parte</h1>} />
        </Routes>
      </MemoryRouter>
    )
    const generate = screen.getByRole('button', { name: 'Revisar dados →' })
    expect(generate.disabled).toBe(true)
    fireEvent.change(screen.getByRole('combobox', { name: 'Classificação' }), { target: { value: 'civis' } })
    fireEvent.change(screen.getByRole('combobox', { name: 'Tipo', exact: true }), { target: { value: 'Compra e Venda' } })
    fireEvent.change(screen.getByLabelText('Objeto do contrato'), { target: { value: 'Aquisição de equipamento' } })
    fireEvent.change(screen.getByLabelText('Vencimento'), { target: { value: '2028-03-10' } })
    expect(generate.disabled).toBe(false)
    fireEvent.click(generate)

    expect(screen.getByRole('heading', { name: 'Revisão dos dados' })).toBeTruthy()
    expect(storeMocks.saveContract).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Gerar minuta →' }))
    const draft = screen.getByRole('textbox', { name: 'Texto da minuta' })
    expect(draft.value).toContain('Aquisição de equipamento')
    expect(draft.value).toContain('Ana Cliente')
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' })
    expect(storeMocks.saveContract).not.toHaveBeenCalled()
    expect(storeMocks.saveEvent).not.toHaveBeenCalled()
    fireEvent.change(draft, { target: { value: 'Minuta revisada pelo advogado' } })
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar e salvar' }))

    expect(storeMocks.saveContract).toHaveBeenCalledOnce()
    expect(storeMocks.saveContract).toHaveBeenCalledWith(expect.objectContaining({ partyId: 'party-1', tipo: 'Compra e Venda', generatedText: 'Minuta revisada pelo advogado' }))
    expect(storeMocks.saveEvent).toHaveBeenCalledOnce()
    expect(storeMocks.saveEvent).toHaveBeenCalledWith(expect.objectContaining({ contractId: 'saved-contract', partyId: 'party-1', date: '2028-03-10' }))
    expect(screen.getByRole('heading', { name: 'Detalhes da parte' })).toBeTruthy()
  })
})
