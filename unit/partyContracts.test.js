import test from 'node:test'
import assert from 'node:assert/strict'
import { countContractsByParty } from '../src/lib/partyContracts.js'

test('party counts preserve strict identifiers and count all contract statuses without changing records', () => {
  const contracts = [
    { partyId: 'own', status: 'ativo' }, { partyId: 'own', status: 'inativo' },
    { partyId: 'other' }, { partyId: '__proto__' }, { partyId: 'constructor' },
    { partyId: '1' }, { partyId: 1 }, { partyId: null }, {}
  ].map(Object.freeze)
  Object.freeze(contracts)
  const counts = countContractsByParty(contracts)
  for (const id of ['own', 'other', '__proto__', 'constructor', '1', 1, null, undefined, 'missing']) {
    assert.equal(counts.get(id) || 0, contracts.filter(contract => contract.partyId === id).length)
  }
  assert.equal(countContractsByParty([]).size, 0)
})

test('large-list indexing reads each relationship once independently of the number of parties', () => {
  let reads = 0
  const contracts = Array.from({ length: 10000 }, (_, i) => ({
    get partyId() { reads++; return 'party-' + (i % 1000) }
  }))
  const counts = countContractsByParty(contracts)
  for (let i = 0; i < 1000; i++) assert.equal(counts.get('party-' + i), 10)
  assert.equal(reads, contracts.length)
})
