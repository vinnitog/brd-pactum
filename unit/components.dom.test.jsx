// @vitest-environment jsdom

import React, { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom'

const storeMocks = vi.hoisted(() => ({
  addReminder: vi.fn(),
  deleteEvent: vi.fn(),
  getContract: vi.fn(() => null),
  getParty: vi.fn(() => null),
  listReminders: vi.fn(() => []),
  saveContract: vi.fn(),
  saveEvent: vi.fn(),
  saveParty: vi.fn(),
  toggleEventDone: vi.fn(),
  useStore: vi.fn((selector) => selector({ events: [], reminders: [] }))
}))

vi.mock('../src/lib/store.js', () => storeMocks)
const authMocks = vi.hoisted(() => ({ useAuth: vi.fn() }))
vi.mock('../src/contexts/AuthContext.jsx', () => authMocks)

import AgendaList from '../src/components/AgendaList.jsx'
import EventFormModal from '../src/components/EventFormModal.jsx'
import ReminderComposer from '../src/components/ReminderComposer.jsx'
import BatchReminderModal from '../src/components/BatchReminderModal.jsx'
import Modal from '../src/components/Modal.jsx'
import Donut from '../src/components/Donut.jsx'
import Home from '../src/pages/Home.jsx'
import PartyList from '../src/pages/PartyList.jsx'
import Agenda from '../src/pages/Agenda.jsx'
import NewContract from '../src/pages/NewContract.jsx'
import Dashboard from '../src/pages/Dashboard.jsx'
import ManageContractModal from '../src/components/ManageContractModal.jsx'
import PartyFormModal from '../src/components/PartyFormModal.jsx'
import AppRouter from '../src/components/AppRouter.jsx'
import AppShell from '../src/components/AppShell.jsx'

let state
const lawyer = { name: 'Dra. Ana', role: 'advogado' }
const client = { name: 'Ana', role: 'cliente', partyId: 'party-1' }
const intern = { name: 'Camila Estagiária', role: 'estagiario' }

function renderPage(page) {
  return render(<MemoryRouter>{page}</MemoryRouter>)
}

function event(overrides = {}) {
  return { id: 'event-1', partyId: 'party-1', type: 'vencimento', date: '2028-02-15', urgency: 'alta', done: false, note: 'Prazo próprio', ...overrides }
}

describe('roteamento da publicação no GitHub Pages', () => {
  let originalUrl
  let originalHistoryState

  function TestRoutes() {
    return (
      <Routes>
        <Route path="/agenda" element={<><h1>Agenda de teste</h1><Link to="/parte/party-1">Abrir cadastro</Link></>} />
        <Route path="/parte/:id" element={<h1>Cadastro de teste</h1>} />
      </Routes>
    )
  }

  beforeEach(() => {
    originalUrl = window.location.href
    originalHistoryState = window.history.state
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllEnvs()
    window.history.replaceState(originalHistoryState, '', originalUrl)
  })

  it('abre a rota pelo hash, navega por Link e mantém a rota profunda após remontar', () => {
    vi.stubEnv('MODE', 'github-pages')
    window.history.replaceState(null, '', '/brd-pactum/#/agenda')
    const page = <AppRouter><TestRoutes /></AppRouter>
    const { unmount } = render(page)
    expect(screen.getByRole('heading', { name: 'Agenda de teste' })).toBeTruthy()

    fireEvent.click(screen.getByRole('link', { name: 'Abrir cadastro' }))
    expect(screen.getByRole('heading', { name: 'Cadastro de teste' })).toBeTruthy()
    expect(window.location.hash).toBe('#/parte/party-1')
    expect(window.location.pathname).toBe('/brd-pactum/')

    unmount()
    render(page)
    expect(screen.getByRole('heading', { name: 'Cadastro de teste' })).toBeTruthy()
    expect(window.location.hash).toBe('#/parte/party-1')
  })

  it('usa pathname e navega sem hash no modo de desenvolvimento', () => {
    vi.stubEnv('MODE', 'development')
    window.history.replaceState(null, '', '/agenda')
    render(<AppRouter><TestRoutes /></AppRouter>)
    expect(screen.getByRole('heading', { name: 'Agenda de teste' })).toBeTruthy()

    fireEvent.click(screen.getByRole('link', { name: 'Abrir cadastro' }))
    expect(screen.getByRole('heading', { name: 'Cadastro de teste' })).toBeTruthy()
    expect(window.location.pathname).toBe('/parte/party-1')
    expect(window.location.hash).toBe('')
  })

  it('pula para o conteúdo principal sem alterar o hash ou a rota atual', () => {
    vi.stubEnv('MODE', 'github-pages')
    window.history.replaceState(null, '', '/brd-pactum/#/agenda')
    render(<AppRouter><AppShell><TestRoutes /></AppShell></AppRouter>)
    const skipLink = screen.getByRole('link', { name: 'Pular para o conteúdo' })
    skipLink.focus()

    fireEvent.click(skipLink)

    expect(document.activeElement).toBe(screen.getByRole('main'))
    expect(window.location.hash).toBe('#/agenda')
    expect(window.location.pathname).toBe('/brd-pactum/')
    expect(screen.getByRole('heading', { name: 'Agenda de teste' })).toBeTruthy()
  })
})

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
    events: [],
    reminders: []
  }
  storeMocks.useStore.mockImplementation((selector) => selector(state))
  storeMocks.getParty.mockImplementation((id) => state.parties.find((party) => party.id === id) || null)
  storeMocks.getContract.mockImplementation((id) => state.contracts.find((contract) => contract.id === id) || null)
  storeMocks.saveContract.mockImplementation((contract) => ({ ...contract, id: 'saved-contract' }))
  storeMocks.saveParty.mockImplementation((party) => ({ ...party, id: 'saved-party' }))
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
    state.parties[1].phone = '(11) 98888-2222'
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
    const reminder = within(dialog).getByRole('textbox', { name: 'Texto do lembrete' }).value
    expect(reminder).toContain('Contrato de Bruno')
    expect(reminder).toContain('Bruno Cliente')
    expect(reminder).toContain('com atualização monetária prevista')
    expect(reminder).toContain('20/03/2028')
    expect(reminder).not.toContain('Contrato de Ana')
    expect(reminder).not.toContain('15/02/2028')
    expect(within(dialog).getByRole('link', { name: /Enviar por WhatsApp/ }).getAttribute('href')).toContain('https://wa.me/5511988882222?')

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

  it('estagiário enxerga todos os cadastros e o Dashboard, mas não cria clientes', () => {
    authMocks.useAuth.mockReturnValue({ user: intern })
    state.contracts = [{ id: 'contract-1', partyId: 'party-1' }]
    renderPage(<Home />)
    expect(screen.getByRole('link', { name: /^Dashboard 1 / })).toBeTruthy()
    expect(screen.getByRole('link', { name: /^Clientes 2 / })).toBeTruthy()

    cleanup()
    authMocks.useAuth.mockReturnValue({ user: intern })
    renderPage(<PartyList kind="cliente" />)
    expect(screen.getByRole('link', { name: /Ana Cliente/ })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Bruno Cliente/ })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Novo cliente/ })).toBeNull()
  })

  it('estagiário vê a agenda de todos os clientes sem ações de gestão', () => {
    authMocks.useAuth.mockReturnValue({ user: intern })
    state.events = [event(), event({ id: 'other', partyId: 'party-2', note: 'Prazo do Bruno' })]
    renderPage(<Agenda />)
    fireEvent.click(screen.getByRole('button', { name: 'Lista', exact: true }))

    expect(screen.getByText(/Prazo próprio/)).toBeTruthy()
    expect(screen.getByText(/Prazo do Bruno/)).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Concluir evento|Reabrir evento|Excluir evento/ })).toBeNull()
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

  it('centraliza a busca aberta entre clientes e fornecedores e permite escolher o tipo no novo cadastro', () => {
    state.parties[2].email = 'contato@fornecedor.com'
    renderPage(<PartyList />)
    const search = screen.getByRole('searchbox', { name: 'Pesquisar cadastros' })

    fireEvent.change(search, { target: { value: 'contato@fornecedor.com' } })
    expect(screen.getByRole('link', { name: /Fornecedor Externo/ })).toBeTruthy()
    expect(screen.queryByRole('link', { name: /Ana Cliente/ })).toBeNull()

    fireEvent.change(search, { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: /Novo cadastro/ }))
    const dialog = screen.getByRole('dialog', { name: 'Novo cadastro' })
    expect(within(dialog).getByRole('combobox', { name: 'Tipo de cadastro' }).value).toBe('cliente')
    fireEvent.change(within(dialog).getByRole('combobox', { name: 'Tipo de cadastro' }), { target: { value: 'fornecedor' } })
    fireEvent.change(within(dialog).getByRole('textbox', { name: 'Nome completo' }), { target: { value: 'Novo fornecedor' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Salvar' }))

    expect(storeMocks.saveParty).toHaveBeenCalledWith(expect.objectContaining({ kind: 'fornecedor', name: 'Novo fornecedor' }))
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

describe('agenda: filtros e criação/edição (Issue #10)', () => {
  // Referência 2028-02-15 (beforeEach). party-1/party-2 = clientes, party-3 = fornecedor.
  function mixedEvents() {
    return [
      event({ id: 'ev-ana', partyId: 'party-1', note: 'Prazo Ana' }),
      event({ id: 'ev-bruno', partyId: 'party-2', note: 'Prazo Bruno' }),
      event({ id: 'ev-forn', partyId: 'party-3', note: 'Prazo Fornecedor' })
    ]
  }

  it('filtra por tipo de parte mantendo apenas clientes ou fornecedores', () => {
    state.events = mixedEvents()
    renderPage(<Agenda />)
    fireEvent.click(screen.getByRole('button', { name: 'Lista', exact: true }))
    expect(screen.getByText(/Prazo Ana/)).toBeTruthy()
    expect(screen.getByText(/Prazo Fornecedor/)).toBeTruthy()

    fireEvent.change(screen.getByRole('combobox', { name: 'Tipo de parte' }), { target: { value: 'fornecedor' } })
    expect(screen.getByText(/Prazo Fornecedor/)).toBeTruthy()
    expect(screen.queryByText(/Prazo Ana/)).toBeNull()
    expect(screen.queryByText(/Prazo Bruno/)).toBeNull()
  })

  it('filtra por uma parte específica de forma cumulativa com o tipo', () => {
    state.events = mixedEvents()
    renderPage(<Agenda />)
    fireEvent.click(screen.getByRole('button', { name: 'Lista', exact: true }))

    fireEvent.change(screen.getByRole('combobox', { name: 'Parte' }), { target: { value: 'party-2' } })
    expect(screen.getByText(/Prazo Bruno/)).toBeTruthy()
    expect(screen.queryByText(/Prazo Ana/)).toBeNull()
    expect(screen.queryByText(/Prazo Fornecedor/)).toBeNull()
  })

  it('não exibe filtros para o cliente que enxerga apenas a própria parte', () => {
    authMocks.useAuth.mockReturnValue({ user: client })
    state.events = [event({ note: 'Prazo próprio' })]
    renderPage(<Agenda />)
    expect(screen.queryByRole('combobox', { name: 'Tipo de parte' })).toBeNull()
    expect(screen.queryByRole('combobox', { name: 'Parte' })).toBeNull()
  })

  it('ao mudar o tipo de parte, descarta a parte selecionada incompatível', () => {
    state.events = mixedEvents()
    renderPage(<Agenda />)
    fireEvent.click(screen.getByRole('button', { name: 'Lista', exact: true }))

    fireEvent.change(screen.getByRole('combobox', { name: 'Parte' }), { target: { value: 'party-3' } })
    expect(screen.queryByText(/Prazo Ana/)).toBeNull()
    fireEvent.change(screen.getByRole('combobox', { name: 'Tipo de parte' }), { target: { value: 'cliente' } })

    expect(screen.getByRole('combobox', { name: 'Parte' }).value).toBe('todas')
    expect(screen.getByText(/Prazo Ana/)).toBeTruthy()
    expect(screen.getByText(/Prazo Bruno/)).toBeTruthy()
    expect(screen.queryByText(/Prazo Fornecedor/)).toBeNull()
  })

  it('permite ao advogado criar um evento escolhendo a parte na agenda', () => {
    state.events = []
    renderPage(<Agenda />)
    fireEvent.click(screen.getByRole('button', { name: '+ Novo evento' }))

    const dialog = screen.getByRole('dialog', { name: 'Novo vencimento na agenda' })
    fireEvent.change(within(dialog).getByRole('combobox', { name: 'Cliente / fornecedor' }), { target: { value: 'party-3' } })
    fireEvent.change(within(dialog).getByLabelText('Data'), { target: { value: '2028-05-10' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Adicionar' }))

    expect(storeMocks.saveEvent).toHaveBeenCalledOnce()
    expect(storeMocks.saveEvent.mock.calls[0][0]).toMatchObject({ partyId: 'party-3', date: '2028-05-10' })
  })

  it('não oferece criação de evento para o estagiário', () => {
    authMocks.useAuth.mockReturnValue({ user: intern })
    state.events = mixedEvents()
    renderPage(<Agenda />)
    expect(screen.queryByRole('button', { name: '+ Novo evento' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Lista', exact: true }))
    expect(screen.queryByRole('button', { name: 'Editar evento' })).toBeNull()
  })

  it('edita um evento existente a partir da lista da agenda', () => {
    state.events = [event({ id: 'ev-ana', partyId: 'party-1', note: 'Prazo Ana' })]
    renderPage(<Agenda />)
    fireEvent.click(screen.getByRole('button', { name: 'Lista', exact: true }))
    fireEvent.click(screen.getByRole('button', { name: 'Editar evento' }))

    const dialog = screen.getByRole('dialog', { name: 'Editar vencimento na agenda' })
    // Em edição a parte é fixa: sem seletor de parte no formulário.
    expect(within(dialog).queryByRole('combobox', { name: 'Cliente / fornecedor' })).toBeNull()
    fireEvent.change(within(dialog).getByLabelText('Observação'), { target: { value: 'Prazo revisado' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Salvar' }))

    expect(storeMocks.saveEvent).toHaveBeenCalledOnce()
    expect(storeMocks.saveEvent.mock.calls[0][0]).toMatchObject({ id: 'ev-ana', note: 'Prazo revisado' })
  })

  it('oferece os tipos de data relevantes decididos pelos sócios', () => {
    render(<EventFormModal partyId="party-1" onClose={vi.fn()} />)
    const tipo = screen.getByRole('combobox', { name: 'Tipo de vencimento' })
    for (const label of ['Assinatura', 'Renovação automática', 'Revisão']) {
      expect(within(tipo).getByRole('option', { name: label })).toBeTruthy()
    }
  })

  it('regressão: formulário com parte fixa não mostra seletor de parte', () => {
    render(<EventFormModal partyId="party-1" contracts={[]} onClose={vi.fn()} />)
    expect(screen.queryByRole('combobox', { name: 'Cliente / fornecedor' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Adicionar' })).toBeTruthy()
  })
})

describe('lembretes ao cliente (Issue #12)', () => {
  const party = { id: 'party-1', name: 'Ana Cliente', phone: '(11) 90000-0000' }
  const contract = { id: 'contract-1', partyId: 'party-1', titulo: 'Contrato de Ana' }

  it('permite editar o texto e envia por WhatsApp com o texto ajustado, registrando o histórico', () => {
    const ev = event({ contractId: 'contract-1' })
    render(<ReminderComposer event={ev} party={party} contract={contract} />)

    const textarea = screen.getByRole('textbox', { name: 'Texto do lembrete' })
    fireEvent.change(textarea, { target: { value: 'Mensagem revisada pelo sócio' } })

    const link = screen.getByRole('link', { name: /Enviar por WhatsApp/ })
    expect(link.getAttribute('href')).toBe(`https://wa.me/5511900000000?text=${encodeURIComponent('Mensagem revisada pelo sócio')}`)

    fireEvent.click(link)
    expect(storeMocks.addReminder).toHaveBeenCalledWith(
      expect.objectContaining({ eventId: ev.id, contractId: 'contract-1', partyId: 'party-1', channel: 'whatsapp', text: 'Mensagem revisada pelo sócio' })
    )
  })

  it('registra envio manual pelo sistema quando não há disparo por WhatsApp', () => {
    const ev = event({ contractId: 'contract-1' })
    render(<ReminderComposer event={ev} party={party} contract={contract} />)
    fireEvent.click(screen.getByRole('button', { name: 'Registrar envio' }))
    expect(storeMocks.addReminder).toHaveBeenCalledWith(expect.objectContaining({ channel: 'sistema', eventId: ev.id }))
  })

  it('desabilita o WhatsApp quando o cliente não tem telefone cadastrado', () => {
    render(<ReminderComposer event={event()} party={{ id: 'party-1', name: 'Sem Telefone' }} contract={contract} />)
    expect(screen.queryByRole('link', { name: /Enviar por WhatsApp/ })).toBeNull()
    expect(screen.getByRole('button', { name: /Enviar por WhatsApp/ }).disabled).toBe(true)
    expect(screen.getByText(/Cadastre um telefone/)).toBeTruthy()
  })

  it('lista o histórico de envios já registrados para o vencimento', () => {
    state.reminders = [
      { id: 'rem-1', eventId: 'event-1', channel: 'whatsapp', text: 'x', sentAt: '2028-02-15T10:00:00.000Z' }
    ]
    render(<ReminderComposer event={event()} party={party} contract={contract} />)
    expect(screen.getByRole('heading', { name: 'Histórico de envios' })).toBeTruthy()
    expect(screen.getByRole('listitem').textContent).toMatch(/WhatsApp ·/)
  })

  it('não oferece geração de lembrete para o cliente (envio é do sócio do BRD)', () => {
    render(<AgendaList events={[event({ contractId: 'contract-1' })]} />)
    expect(screen.queryByRole('button', { name: 'Gerar lembrete' })).toBeNull()
  })

  it('gera lembretes em lote pré-selecionando os vencimentos dentro de 2 dias', () => {
    state.contracts = [contract]
    state.events = [
      event({ id: 'due', contractId: 'contract-1', date: '2028-02-16' }),
      event({ id: 'far', contractId: 'contract-1', date: '2028-03-30' })
    ]
    renderPage(<Agenda />)
    fireEvent.click(screen.getByRole('button', { name: 'Lembretes em lote' }))

    const dialog = screen.getByRole('dialog', { name: 'Gerar lembretes em lote' })
    const checks = within(dialog).getAllByRole('checkbox')
    expect(checks).toHaveLength(2)
    expect(checks[0].checked).toBe(true) // 16/02 → dentro da janela de 2 dias
    expect(checks[1].checked).toBe(false) // 30/03 → fora da janela

    fireEvent.click(within(dialog).getByRole('button', { name: /Gerar/ }))
    const composers = within(dialog).getAllByRole('textbox', { name: 'Texto do lembrete' })
    expect(composers).toHaveLength(1)
    expect(composers[0].value).toContain('Contrato de Ana')
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
    expect(screen.getByText('Sem dados para exibir.')).toBeTruthy()
    expect(screen.getByText('0')).toBeTruthy()
    expect(screen.queryByText(/NaN|Infinity|%/)).toBeNull()
  })

  it('exibe mensagem de vazio personalizada quando fornecida', () => {
    render(<Donut segments={[]} emptyMessage="Nenhum contrato para os filtros selecionados." />)
    expect(screen.getByText('Nenhum contrato para os filtros selecionados.')).toBeTruthy()
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

describe('Dashboard com filtros', () => {
  // Data de referência dos testes: 2028-02-15 (fixada no beforeEach).
  const contracts = [
    { id: 'c1', status: 'ativo', tipo: 'Locação', valor: 1000, vencimento: '2028-02-15' },
    { id: 'c2', status: 'ativo', tipo: 'Prestação de Serviços', valor: 2000, vencimento: '2028-07-01' },
    { id: 'c3', status: 'encerrado', tipo: 'Locação', valor: 500, vencimento: '' }
  ]
  const contador = () =>
    screen.getByText((_, el) => el?.tagName === 'P' && /^\d+ de \d+ contratos?$/.test(el.textContent || ''))

  beforeEach(() => {
    state.contracts = contracts.map((c) => ({ ...c }))
  })

  it('exibe os quatro indicadores e conta todos os contratos sem filtro', () => {
    renderPage(<Dashboard />)
    for (const titulo of ['Contratos ativos / inativos', 'Valor — ativos / inativos', 'Prazos (vencimentos)', 'Valor por classificação']) {
      expect(screen.getByRole('heading', { name: titulo })).toBeTruthy()
    }
    expect(contador().textContent).toBe('3 de 3 contratos')
  })

  it('filtra por status reduzindo a contagem', () => {
    renderPage(<Dashboard />)
    fireEvent.change(screen.getByRole('combobox', { name: 'Status' }), { target: { value: 'ativos' } })
    expect(contador().textContent).toBe('2 de 3 contratos')
  })

  it('combina filtro de status e de classificação (tipo) simultaneamente', () => {
    renderPage(<Dashboard />)
    fireEvent.change(screen.getByRole('combobox', { name: 'Status' }), { target: { value: 'ativos' } })
    fireEvent.change(screen.getByRole('combobox', { name: 'Classificação (tipo)' }), { target: { value: 'Prestação de Serviços' } })
    expect(contador().textContent).toBe('1 de 3 contratos')
  })

  it('exibe mensagem quando nenhum contrato atende aos filtros', () => {
    renderPage(<Dashboard />)
    fireEvent.change(screen.getByRole('combobox', { name: 'Status' }), { target: { value: 'inativos' } })
    fireEvent.change(screen.getByRole('combobox', { name: 'Classificação (tipo)' }), { target: { value: 'Prestação de Serviços' } })
    expect(contador().textContent).toBe('0 de 3 contratos')
    expect(screen.getByText('Nenhum contrato para os filtros selecionados.')).toBeTruthy()
  })

  it('limpa os filtros e restaura a contagem total', () => {
    renderPage(<Dashboard />)
    fireEvent.change(screen.getByRole('combobox', { name: 'Faixa de prazo' }), { target: { value: 'dia' } })
    expect(contador().textContent).toBe('1 de 3 contratos')
    fireEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }))
    expect(contador().textContent).toBe('3 de 3 contratos')
    expect(screen.queryByRole('button', { name: 'Limpar filtros' })).toBeNull()
  })
})

describe('cadastro de gerenciamento (Issue #11)', () => {
  beforeEach(() => {
    Object.assign(state.parties[0], {
      rg: '12.345.678-9',
      email: 'ana@email.com',
      phone: '(11) 90000-0000',
      address: 'Rua A, 100 - São Paulo/SP'
    })
  })

  it('pré-preenche a qualificação reaproveitando os dados do cadastro da parte', () => {
    render(<MemoryRouter><ManageContractModal partyId="party-1" onClose={() => {}} /></MemoryRouter>)
    const qualificacao = screen.getByLabelText('Qualificação das partes')
    expect(qualificacao.value).toContain('Ana Cliente')
    expect(qualificacao.value).toContain('CPF 111.222.333-44')
    expect(qualificacao.value).toContain('RG 12.345.678-9')
    expect(qualificacao.value).toContain('ana@email.com')
    expect(qualificacao.value).toContain('(11) 90000-0000')
  })

  it('bloqueia o cadastro sem testemunha e exibe erro', () => {
    render(<MemoryRouter><ManageContractModal partyId="party-1" onClose={() => {}} /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: 'Salvar cadastro' }))
    expect(screen.getByRole('alert').textContent).toMatch(/testemunha/i)
    expect(storeMocks.saveContract).not.toHaveBeenCalled()
  })

  it('salva o cadastro e agenda o vencimento quando há testemunha', () => {
    const onClose = vi.fn()
    render(<MemoryRouter><ManageContractModal partyId="party-1" onClose={onClose} /></MemoryRouter>)
    fireEvent.change(screen.getAllByPlaceholderText('Nome')[0], { target: { value: 'Testemunha Um' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar cadastro' }))

    expect(storeMocks.saveContract).toHaveBeenCalledOnce()
    expect(storeMocks.saveContract).toHaveBeenCalledWith(
      expect.objectContaining({
        partyId: 'party-1',
        source: 'manual',
        testemunhas: [expect.objectContaining({ nome: 'Testemunha Um' })]
      })
    )
    expect(storeMocks.saveEvent).toHaveBeenCalledWith(
      expect.objectContaining({ contractId: 'saved-contract', partyId: 'party-1', type: 'vencimento' })
    )
    expect(onClose).toHaveBeenCalledOnce()
  })
})

describe('RG no cadastro de parte (Issue #11)', () => {
  it('exibe e salva o RG para pessoa física', () => {
    render(
      <MemoryRouter>
        <PartyFormModal
          kind="cliente"
          party={{ id: 'party-1', kind: 'cliente', personType: 'PF', name: 'Ana Cliente', rg: '12.345.678-9' }}
          onClose={() => {}}
        />
      </MemoryRouter>
    )
    expect(screen.getByLabelText('RG').value).toBe('12.345.678-9')
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(storeMocks.saveParty).toHaveBeenCalledWith(expect.objectContaining({ rg: '12.345.678-9' }))
  })

  it('não exibe o campo RG para pessoa jurídica', () => {
    render(
      <MemoryRouter>
        <PartyFormModal
          kind="fornecedor"
          party={{ id: 'p2', kind: 'fornecedor', personType: 'PJ', name: 'Gráfica Bem Ltda' }}
          onClose={() => {}}
        />
      </MemoryRouter>
    )
    expect(screen.queryByLabelText('RG')).toBeNull()
  })
})
