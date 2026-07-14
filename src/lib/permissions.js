// Regras de acesso: advogados do BRD veem todas as informações dos clientes;
// o cliente vê apenas o que está vinculado ao próprio cadastro.

export function isAdvogado(user) {
  return user?.role === 'advogado'
}

export function isCliente(user) {
  return user?.role === 'cliente'
}

// Só advogados elaboram/gerenciam contratos e cadastros. Cliente é leitura.
export function canManage(user) {
  return isAdvogado(user)
}

// Filtra a lista de parties conforme o vínculo do usuário.
export function visibleParties(user, parties) {
  if (isAdvogado(user)) return parties
  if (isCliente(user) && user.partyId) return parties.filter((p) => p.id === user.partyId)
  return []
}

export function canSeeParty(user, party) {
  if (!party) return false
  if (isAdvogado(user)) return true
  return isCliente(user) && user.partyId === party.id
}
