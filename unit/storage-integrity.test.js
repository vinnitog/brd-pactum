import test from 'node:test'
import assert from 'node:assert/strict'
import { fixtureParty, fixtureContract } from './fixtures/contracts.js'

let session = 0
const initialState = () => ({
  parties: [fixtureParty()],
  contracts: [fixtureContract({ id: 'existing-contract', status: 'ativo' })],
  events: [{ id: 'existing-event', partyId: 'fixture-pj', contractId: '', date: '2028-01-01', done: false }],
  reminders: []
})

async function openStore(t, initialRaw = JSON.stringify(initialState())) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const storage = { raw: initialRaw, writes: 0, readError: false, writeError: false }
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem() {
        if (storage.readError) throw new Error('Access denied')
        return storage.raw
      },
      setItem(_key, raw) {
        storage.writes++
        if (storage.writeError) throw new Error('Quota exceeded')
        storage.raw = raw
      }
    }
  })
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous)
    else delete globalThis.localStorage
  })
  const store = await import(`../src/lib/store.js?storage-session-${session++}`)
  return { store, storage }
}

test('contrato e múltiplos eventos persistem em uma única gravação e sobrevivem à recarga', async (t) => {
  const { store, storage } = await openStore(t)
  const saved = store.saveContractWithEvents(fixtureContract({ generatedText: '', parte: { qualificacao: '', representante: '' } }), [
    { date: '2028-02-29', type: 'vencimento', urgency: 'alta', note: 'Primeiro', contractId: 'wrong', partyId: 'wrong' },
    { date: '2028-03-30', type: 'revisao', urgency: 'baixa', note: 'Segundo' }
  ])
  assert.equal(storage.writes, 1)
  assert.ok(saved.id)
  const reopened = await import(`../src/lib/store.js?storage-session-${session++}`)
  assert.deepEqual(reopened.getContract(saved.id), saved)
  assert.equal(saved.generatedText, '')
  assert.deepEqual(saved.parte, { qualificacao: '', representante: '' })
  const events = reopened.listEvents({ contractId: saved.id })
  assert.equal(events.length, 2)
  assert.ok(events.every((event) => event.partyId === saved.partyId && event.done === false))
  assert.deepEqual(events.map(({ date, type, urgency, note }) => ({ date, type, urgency, note })), [
    { date: '2028-02-29', type: 'vencimento', urgency: 'alta', note: 'Primeiro' },
    { date: '2028-03-30', type: 'revisao', urgency: 'baixa', note: 'Segundo' }
  ])
  assert.equal(reopened.getState().events[0].contractId, '')
})

test('quota não publica contrato/eventos parciais e retry grava exatamente um conjunto', async (t) => {
  const { store, storage } = await openStore(t)
  const before = store.getState()
  const rawBefore = storage.raw
  storage.writeError = true
  const data = fixtureContract({ generatedText: 'Minuta revisada' })
  const events = [{ date: '2028-02-29', type: 'vencimento' }]
  assert.equal(store.saveContractWithEvents(data, events), null)
  assert.equal(store.getState(), before)
  assert.equal(storage.raw, rawBefore)
  assert.equal(store.getStorageIssue().kind, 'write')
  storage.writeError = false
  const saved = store.saveContractWithEvents(data, events)
  assert.equal(store.getStorageIssue(), null)
  assert.equal(store.getState().contracts.length, 2)
  assert.equal(store.listEvents({ contractId: saved.id }).length, 1)
  assert.deepEqual(JSON.parse(storage.raw), store.getState())
})

test('cada mutação preserva o snapshot quando a escrita falha', async (t) => {
  const { store, storage } = await openStore(t)
  const before = store.getState()
  const rawBefore = storage.raw
  storage.writeError = true
  const operations = [
    () => store.saveParty({ id: 'fixture-pj', name: 'Alterado' }),
    () => store.saveContract({ id: 'existing-contract', generatedText: 'Alterado' }),
    () => store.saveEvent({ id: 'existing-event', date: '2028-12-01' }),
    () => store.addReminder({ text: 'Lembrete sintético' }),
    () => store.setContractStatus('existing-contract', 'inativo'),
    () => store.toggleEventDone('existing-event'),
    () => store.deleteEvent('existing-event'),
    () => store.resetStore()
  ]
  for (const operation of operations) {
    assert.ok([null, false].includes(operation()))
    assert.equal(store.getState(), before)
    assert.equal(storage.raw, rawBefore)
  }
})

test('JSON inválido e estrutura inválida preservam bytes e bloqueiam todas as escritas', async (t) => {
  const invalidValues = ['{invalid', '', 'null', '[]', '"text"', '{}',
    JSON.stringify({ ...initialState(), reminders: {} }),
    JSON.stringify({ ...initialState(), events: [null] }),
    JSON.stringify({ ...initialState(), events: [{}] }),
    JSON.stringify({ ...initialState(), parties: [{}] }),
    JSON.stringify({ ...initialState(), reminders: [{}] }),
    JSON.stringify({ ...initialState(), parties: [fixtureParty({ email: 123 })] }),
    JSON.stringify({ ...initialState(), contracts: [fixtureContract({ id: 'bad', tipo: 123 })] }),
    JSON.stringify({ ...initialState(), contracts: [fixtureContract({ id: 'bad', testemunhas: {} })] })]
  for (const raw of invalidValues) {
    await t.test(`estrutura ${invalidValues.indexOf(raw) + 1}`, async (subtest) => {
      const { store, storage } = await openStore(subtest, raw)
      assert.equal(store.getStorageIssue().kind, 'corrupt')
      const before = store.getState()
      assert.equal(store.saveParty({ name: 'Novo' }), null)
      assert.equal(store.saveContractWithEvents(fixtureContract(), []), null)
      assert.equal(store.saveEvent({ date: '2028-01-01' }), null)
      assert.equal(store.addReminder({ text: 'Teste' }), null)
      assert.equal(store.setContractStatus('any', 'inativo'), false)
      assert.equal(store.toggleEventDone('any'), false)
      assert.equal(store.deleteEvent('any'), false)
      assert.equal(store.resetStore(), false)
      assert.equal(store.retryStorage(), false)
      assert.equal(storage.writes, 0)
      assert.equal(storage.raw, raw)
      assert.equal(store.getState(), before)
    })
  }
})

test('reler dados corrigidos libera a gravação sem sobrescrever o conteúdo recuperado', async (t) => {
  const { store, storage } = await openStore(t, '{invalid')
  storage.raw = JSON.stringify(initialState())
  assert.equal(store.retryStorage(), true)
  assert.equal(storage.writes, 0)
  assert.equal(store.getStorageIssue(), null)
  assert.deepEqual(store.getState(), initialState())
  assert.ok(store.saveContractWithEvents(fixtureContract(), []))
  assert.equal(store.getState().events.length, 1)
})

test('falha de leitura não escreve seed e pode ser recuperada', async (t) => {
  const { store, storage } = await openStore(t)
  const before = store.getState()
  storage.readError = true
  const blocked = await import(`../src/lib/store.js?storage-session-${session++}`)
  assert.equal(blocked.getStorageIssue().kind, 'read')
  assert.equal(blocked.getState().contracts.length, 0)
  assert.equal(blocked.saveContract(fixtureContract()), null)
  assert.equal(storage.writes, 0)
  assert.equal(store.retryStorage(), false)
  assert.equal(store.getStorageIssue().kind, 'read')
  assert.equal(store.getState(), before)
  assert.equal(store.saveContract(fixtureContract()), null)
  assert.equal(storage.writes, 0)
  storage.readError = false
  assert.equal(store.retryStorage(), true)
  assert.equal(store.getStorageIssue(), null)
  assert.equal(storage.writes, 0)
})

test('snapshot legado sem reminders abre sem escrita e mantém referência estável', async (t) => {
  const legacy = initialState()
  delete legacy.reminders
  const { store, storage } = await openStore(t, JSON.stringify(legacy))
  assert.deepEqual(store.getState().reminders, [])
  assert.equal(store.getState(), store.getState())
  assert.equal(store.getStorageIssue(), store.getStorageIssue())
  assert.equal(storage.writes, 0)
  assert.equal(storage.raw, JSON.stringify(legacy))
})

test('IDs ausentes não produzem atualização nem falso sucesso', async (t) => {
  const { store, storage } = await openStore(t)
  const before = store.getState()
  assert.equal(store.saveParty({ id: 'missing' }), null)
  assert.equal(store.saveContract({ id: 'missing' }), null)
  assert.equal(store.saveEvent({ id: 'missing' }), null)
  assert.equal(storage.writes, 0)
  assert.equal(store.getState(), before)
})

test('payload estruturalmente inválido não pode gravar um snapshot ilegível na próxima sessão', async (t) => {
  const { store, storage } = await openStore(t)
  const before = store.getState()
  const rawBefore = storage.raw
  for (const payload of [null, undefined, [], 'wrong']) {
    assert.equal(store.saveParty(payload), null)
    assert.equal(store.saveContractWithEvents(payload), null)
    assert.equal(store.saveEvent(payload), null)
    assert.equal(store.addReminder(payload), null)
  }
  for (const events of [null, {}, [null], [{ date: 123 }], [[]]]) {
    assert.equal(store.saveContractWithEvents(fixtureContract(), events), null)
    assert.equal(store.getStorageIssue().kind, 'invalid')
    assert.equal(store.getState(), before)
    assert.equal(storage.raw, rawBefore)
  }
  assert.equal(store.saveParty({ name: 123 }), null)
  assert.equal(storage.writes, 0)
  assert.ok(store.saveParty({ name: '', doc: '', email: '' }))
  assert.equal(store.getStorageIssue(), null)
})

test('base alterada em outra aba não é sobrescrita; releitura conserva conteúdo externo', async (t) => {
  const { store, storage } = await openStore(t)
  const before = store.getState()
  const external = initialState()
  external.parties.push(fixtureParty({ id: 'external-party', name: 'Outro cadastro QA' }))
  storage.raw = JSON.stringify(external)
  assert.equal(store.saveContractWithEvents(fixtureContract(), []), null)
  assert.equal(store.getStorageIssue().kind, 'conflict')
  assert.equal(store.getState(), before)
  assert.equal(storage.writes, 0)
  assert.equal(storage.raw, JSON.stringify(external))
  assert.equal(store.retryStorage(), true)
  assert.ok(store.saveContractWithEvents(fixtureContract(), []))
  assert.equal(JSON.parse(storage.raw).parties.length, 2)
  assert.equal(store.getStorageIssue(), null)
})

test('primeira abertura e releitura sem chave não gravam os exemplos automaticamente', async (t) => {
  const { store, storage } = await openStore(t, null)
  assert.equal(storage.writes, 0)
  assert.equal(storage.raw, null)
  assert.equal(store.getStorageIssue(), null)
  assert.equal(store.retryStorage(), true)
  assert.equal(storage.writes, 0)
  assert.equal(storage.raw, null)
  assert.ok(store.getState().parties.length > 0)
})
