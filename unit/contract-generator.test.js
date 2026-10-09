import test from 'node:test'
import assert from 'node:assert/strict'
import { generateContractText } from '../src/lib/contractGenerator.js'
import { fixtureContract, fixtureParty } from './fixtures/contracts.js'

test('minuta inclui o vencimento informado em formato brasileiro sem deslocar o dia', () => {
  const text = generateContractText(fixtureContract({ vencimento: '2028-02-29' }), fixtureParty())
  assert.match(text, /29\/02\/2028/)
  assert.match(text, /R\$ 1\.234,56 em 3 parcela\(s\), pago por Pix/)
})

test('minuta sem vencimento opcional não inventa data nem expõe valor ausente', () => {
  const text = generateContractText(fixtureContract({ vencimento: '' }), fixtureParty())
  assert.doesNotMatch(text, /Vencimento:|undefined|null|Invalid Date/)
})

test('minuta legada sem campos de parte usa cadastro PJ e CPF do representante', () => {
  const party = fixtureParty()
  const text = generateContractText(fixtureContract(), party)
  assert.ok(text.includes(party.name))
  assert.ok(text.includes(party.doc))
  assert.ok(text.includes(party.repLegal.nome))
  assert.ok(text.includes(`CPF ${party.repLegal.cpf}`))
})

test('minuta respeita qualificação e representante explicitamente apagados na revisão', () => {
  const party = fixtureParty()
  const text = generateContractText(fixtureContract({ parte: { qualificacao: '', representante: '' } }), party)
  assert.ok(!text.includes(party.name))
  assert.ok(!text.includes(party.repLegal.nome))
})

test('minuta usa cadastro somente para campo ausente de uma parte legada parcial', () => {
  const party = fixtureParty()
  const text = generateContractText(fixtureContract({ parte: { qualificacao: '' } }), party)
  assert.ok(!text.includes(party.name))
  assert.ok(text.includes(party.repLegal.nome))
})

test('minuta PF não inclui representante residual de cadastro PJ', () => {
  const party = fixtureParty({ personType: 'PF', name: 'Pessoa Fictícia QA', doc: '111.111.111-11' })
  const text = generateContractText(fixtureContract(), party)
  assert.ok(text.includes(party.name))
  assert.ok(text.includes(party.doc))
  assert.ok(!text.includes(party.repLegal.nome))
  assert.doesNotMatch(text, /Neste ato representada/)
})

test('minuta usa texto revisado em vez dos dados de cadastro', () => {
  const text = generateContractText(fixtureContract({
    parte: { qualificacao: 'Parte revista para teste', representante: 'Representante revista para teste' }
  }), fixtureParty())
  assert.ok(text.includes('Parte revista para teste'))
  assert.ok(text.includes('Representante revista para teste'))
  assert.ok(!text.includes('Empresa Exemplo QA'))
  assert.ok(!text.includes('Representante Fictícia'))
})
