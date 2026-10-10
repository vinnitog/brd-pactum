export function countContractsByParty(contracts) {
  const counts = new Map()
  for (const contract of contracts) {
    const partyId = contract.partyId
    counts.set(partyId, (counts.get(partyId) || 0) + 1)
  }
  return counts
}
