// @vitest-environment jsdom

import React, { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'

const storeMocks = vi.hoisted(() => ({
  deleteEvent: vi.fn(),
  getContract: vi.fn(() => null),
  getParty: vi.fn(() => null),
  saveContract: vi.fn(() => ({ id: 'contract-1' })),
  saveEvent: vi.fn(),
  toggleEventDone: vi.fn(),
  useStore: vi.fn((selector) => selector({ events: [] }))
}))

vi.mock('../src/lib/store.js', () => storeMocks)

import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AgendaList from '../src/components/AgendaList.jsx'
import EventFormModal from '../src/components/EventFormModal.jsx'
import Modal from '../src/components/Modal.jsx'
import NewContract from '../src/pages/NewContract.jsx'

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
  document.body.style.overflow = ''
  window.requestAnimationFrame = (callback) => window.setTimeout(callback, 0)
  window.cancelAnimationFrame = (id) => window.clearTimeout(id)
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
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
