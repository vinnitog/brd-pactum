// Perfis de acesso decididos pelos sócios do BRD (Issue #8):
// - cliente: enxerga apenas o próprio cadastro (processos e documentos vinculados);
//   nunca vê o cadastro de outro cliente.
// - estagiario: equipe interna; consulta todos os cadastros para dar apoio, sem editar.
// - advogado: advogado associado; consulta e edita dados de clientes.
// - socio: sócio do escritório; consulta e edita como o advogado. O sócio patrimonial
//   (patrimonial: true) também vê os dados sensíveis restritos aos demais perfis.

export const ROLES = Object.freeze({
  CLIENTE: 'cliente',
  ESTAGIARIO: 'estagiario',
  ADVOGADO: 'advogado',
  SOCIO: 'socio'
})

export const ROLE_LABELS = Object.freeze({
  [ROLES.CLIENTE]: 'Cliente',
  [ROLES.ESTAGIARIO]: 'Estagiário',
  [ROLES.ADVOGADO]: 'Advogado associado',
  [ROLES.SOCIO]: 'Sócio'
})

// Equipe interna do BRD: enxerga todos os cadastros.
const EQUIPE_BRD = new Set([ROLES.ESTAGIARIO, ROLES.ADVOGADO, ROLES.SOCIO])
// Quem pode elaborar/gerenciar contratos e editar cadastros (não inclui estagiário).
const PODE_EDITAR = new Set([ROLES.ADVOGADO, ROLES.SOCIO])

export function isCliente(user) {
  return user?.role === ROLES.CLIENTE
}

export function isEstagiario(user) {
  return user?.role === ROLES.ESTAGIARIO
}

export function isAdvogado(user) {
  return user?.role === ROLES.ADVOGADO
}

export function isSocio(user) {
  return user?.role === ROLES.SOCIO
}

// Estagiário, advogado ou sócio — a equipe interna do escritório.
export function isEquipeBRD(user) {
  return EQUIPE_BRD.has(user?.role)
}

// Só os sócios patrimoniais veem os dados sensíveis (financeiro / comunicações internas).
export function isSocioPatrimonial(user) {
  return isSocio(user) && user?.patrimonial === true
}

// Elabora/gerencia contratos e edita cadastros: advogados e sócios.
// Estagiário e cliente têm acesso de leitura.
export function canManage(user) {
  return PODE_EDITAR.has(user?.role)
}

// Portão dos dados sensíveis do escritório; ligado quando esses dados existirem.
export function canSeeSensitive(user) {
  return isSocioPatrimonial(user)
}

// Filtra a lista de parties conforme o vínculo do usuário.
export function visibleParties(user, parties) {
  if (isEquipeBRD(user)) return parties
  if (isCliente(user) && user.partyId) return parties.filter((p) => p.id === user.partyId)
  return []
}

export function canSeeParty(user, party) {
  if (!party) return false
  if (isEquipeBRD(user)) return true
  return isCliente(user) && user.partyId === party.id
}

// Rótulo amigável do perfil para a interface.
export function roleLabel(user) {
  if (isSocioPatrimonial(user)) return 'Sócio patrimonial'
  return ROLE_LABELS[user?.role] ?? user?.role ?? ''
}
