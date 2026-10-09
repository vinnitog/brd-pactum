// Dados exclusivamente sintéticos: nenhum cadastro ou documento real.
export function fixtureParty(overrides = {}) {
  return {
    id: 'fixture-pj', kind: 'cliente', personType: 'PJ', name: 'Empresa Exemplo QA',
    doc: '00.000.000/0000-00', address: 'Rua de Teste, 100',
    repLegal: { nome: 'Representante Fictícia', cargo: 'Administradora', cpf: '000.000.000-00' },
    ...overrides
  }
}

export function fixtureContract(overrides = {}) {
  return {
    partyId: 'fixture-pj', tipo: 'Prestação de Serviços', objeto: 'Serviço fictício para teste',
    valor: 1234.56, parcelas: 3, meioPagamento: 'Pix', prazo: '12 meses',
    ...overrides
  }
}
