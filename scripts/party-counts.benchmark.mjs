// Synthetic relationships only. Measures counting work, not full DOM rendering.
import assert from 'node:assert/strict'
import { performance } from 'node:perf_hooks'
import { countContractsByParty } from '../src/lib/partyContracts.js'

const samples = 5
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]

function measure(run) {
  run()
  const times = []
  for (let i = 0; i < samples; i++) {
    const start = performance.now()
    run()
    times.push(performance.now() - start)
  }
  return median(times)
}

const results = []
for (const [partyCount, contractCount] of [[100, 1000], [1000, 10000], [5000, 50000]]) {
  const ids = Array.from({ length: partyCount }, (_, i) => 'party-' + i)
  const contracts = Array.from({ length: contractCount }, (_, i) => ({ partyId: ids[i % partyCount] }))
  const previous = () => ids.map(id => contracts.filter(contract => contract.partyId === id).length)
  const indexed = () => {
    const counts = countContractsByParty(contracts)
    return ids.map(id => counts.get(id) || 0)
  }
  assert.deepEqual(indexed(), previous())
  results.push({ partyCount, contractCount, samples,
    previousMedianMs: measure(previous), indexedMedianMs: measure(indexed),
    previousRelationshipReads: partyCount * contractCount,
    indexedRelationshipReads: contractCount })
}
console.log(JSON.stringify({ method: 'one warm-up, five samples, medians; synthetic Node counting only', results }, null, 2))
