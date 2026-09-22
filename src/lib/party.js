// Reaproveitamento de dados no cadastro/elaboração (decisão dos sócios, Issue
// #11): ao elaborar ou cadastrar um contrato, a qualificação da parte é montada
// automaticamente a partir do cadastro. Os sócios definiram exatamente quais
// campos puxam: nome, CPF/CNPJ, RG, endereço, e-mail e contato telefônico.
// O usuário mantém o controle porque o texto gerado é editável em ambos os fluxos.
export function qualificacaoFromParty(party) {
  if (!party) return ''
  const isPJ = party.personType === 'PJ'
  return [
    party.name,
    party.doc ? `${isPJ ? 'CNPJ' : 'CPF'} ${party.doc}` : '',
    party.rg ? `RG ${party.rg}` : '',
    party.address,
    party.email,
    party.phone
  ]
    .map((parte) => (parte || '').trim())
    .filter(Boolean)
    .join(', ')
}
