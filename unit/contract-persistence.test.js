import test from 'node:test'
import assert from 'node:assert/strict'
import { fixtureContract, fixtureParty } from './fixtures/contracts.js'

test('salvar e recarregar conserva revisão vazia, parcelas, data e eventos com e sem vínculo', async () => {
  const previousStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  let persisted = JSON.stringify({ parties: [fixtureParty()], contracts: [], events: [], reminders: [] })
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: () => persisted, setItem: (_key, value) => { persisted = value } }
  })
  try {
    const store = await import('../src/lib/store.js?fixture-session-save')
    const saved = store.saveContract(fixtureContract({
      parte: { qualificacao: 'Qualificação provisória', representante: 'Representante provisória' },
      generatedText: 'Minuta provisória', vencimento: '2028-02-29'
    }))
    store.saveContract({ ...saved, parte: { qualificacao: '', representante: '' }, generatedText: '' })
    const linked = store.saveEvent({ partyId: saved.partyId, contractId: saved.id, date: saved.vencimento, type: 'vencimento' })
    const unlinked = store.saveEvent({ partyId: saved.partyId, contractId: '', date: '2028-03-01', type: 'outro' })

    // Uma nova instância do módulo simula o carregamento de outra sessão local.
    const reopened = await import('../src/lib/store.js?fixture-session-reopen')
    const contract = reopened.getContract(saved.id)
    assert.deepEqual(contract.parte, { qualificacao: '', representante: '' })
    assert.equal(contract.generatedText, '')
    assert.equal(contract.parcelas, 3)
    assert.equal(contract.valor, 1234.56)
    assert.equal(contract.vencimento, '2028-02-29')
    assert.equal(reopened.listContracts(saved.partyId).length, 1)
    assert.deepEqual(reopened.listEvents({ partyId: saved.partyId }), [linked, unlinked])
    assert.equal(reopened.getParty(saved.partyId).repLegal.cpf, '000.000.000-00')
  } finally {
    if (previousStorage) Object.defineProperty(globalThis, 'localStorage', previousStorage)
    else delete globalThis.localStorage
  }
})
