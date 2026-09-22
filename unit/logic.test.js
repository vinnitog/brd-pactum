import test from 'node:test'
import assert from 'node:assert/strict'
import {
  visibleParties,
  canManage,
  canSeeParty,
  canSeeSensitive,
  isAdvogado,
  isEquipeBRD,
  isSocioPatrimonial,
  roleLabel
} from '../src/lib/permissions.js'
import { buildReminder } from '../src/lib/reminderTemplate.js'
import { CONTRACT_GROUPS, findTipo, getContractValuesByType } from '../src/lib/contractTypes.js'
import { parseCurrencyBR, maskCNPJ } from '../src/lib/format.js'
import { deadlineBucket, getContractDeadlineBuckets, getUpcomingEvents, isValidLocalISO } from '../src/lib/deadlines.js'
import { REVIEW_FIELDS, isReviewFieldEditable, reviewFieldsFor } from '../src/lib/contractReview.js'
import { qualificacaoFromParty } from '../src/lib/party.js'

const advogado = { id: 'a', role: 'advogado' }
const cliente = { id: 'c', role: 'cliente', partyId: 'p1' }
const estagiario = { id: 'e', role: 'estagiario' }
const socio = { id: 's', role: 'socio' }
const socioPatrimonial = { id: 'sp', role: 'socio', patrimonial: true }
const parties = [
  { id: 'p1', kind: 'cliente', name: 'Cliente 1' },
  { id: 'p2', kind: 'cliente', name: 'Cliente 2' }
]

test('advogado vê todos os cadastros; cliente só o próprio', () => {
  assert.equal(visibleParties(advogado, parties).length, 2)
  const seenByCliente = visibleParties(cliente, parties)
  assert.equal(seenByCliente.length, 1)
  assert.equal(seenByCliente[0].id, 'p1')
})

test('permissões de gestão e acesso por cadastro', () => {
  assert.ok(isAdvogado(advogado))
  assert.ok(canManage(advogado))
  assert.ok(!canManage(cliente))
  assert.ok(canSeeParty(cliente, parties[0]))
  assert.ok(!canSeeParty(cliente, parties[1]))
})

test('estagiário consulta todos os cadastros mas não gerencia', () => {
  assert.ok(isEquipeBRD(estagiario))
  assert.equal(visibleParties(estagiario, parties).length, 2)
  assert.ok(canSeeParty(estagiario, parties[1]))
  assert.ok(!canManage(estagiario))
})

test('sócio vê todos os cadastros e gerencia', () => {
  assert.ok(isEquipeBRD(socio))
  assert.equal(visibleParties(socio, parties).length, 2)
  assert.ok(canManage(socio))
})

test('só o sócio patrimonial alcança os dados sensíveis', () => {
  assert.ok(canSeeSensitive(socioPatrimonial))
  assert.ok(isSocioPatrimonial(socioPatrimonial))
  for (const user of [socio, advogado, estagiario, cliente, null]) {
    assert.ok(!canSeeSensitive(user))
  }
})

test('equipe interna do BRD abrange estagiário, advogado e sócio', () => {
  for (const user of [estagiario, advogado, socio, socioPatrimonial]) {
    assert.ok(isEquipeBRD(user))
  }
  for (const user of [cliente, null, undefined, {}]) {
    assert.ok(!isEquipeBRD(user))
  }
})

test('roleLabel traz rótulos amigáveis por perfil', () => {
  assert.equal(roleLabel(cliente), 'Cliente')
  assert.equal(roleLabel(estagiario), 'Estagiário')
  assert.equal(roleLabel(advogado), 'Advogado associado')
  assert.equal(roleLabel(socio), 'Sócio')
  assert.equal(roleLabel(socioPatrimonial), 'Sócio patrimonial')
})

test('lembrete usa o modelo do escritório e cita o cliente/contrato', () => {
  const text = buildReminder({
    event: { type: 'vencimento', date: '2026-07-03' },
    party: { name: 'Carmello 350' },
    contract: { titulo: 'Contrato Gold' }
  })
  assert.match(text, /^Prezado\(a\) cliente,/)
  assert.match(text, /Carmello 350/)
  assert.match(text, /Contrato Gold/)
  assert.match(text, /BRD pactum\.$/)
})

test('taxonomia de contratos carrega grupos e subtipos', () => {
  assert.ok(CONTRACT_GROUPS.length >= 11)
  const ps = findTipo('civis', 'Prestação de Serviços')
  assert.ok(ps)
  assert.ok(ps.subtipos.includes('Prestação de serviços advocatícios'))
})

test('helpers de formatação BR', () => {
  assert.equal(parseCurrencyBR('3.500,00'), 3500)
  assert.equal(maskCNPJ('12345678000190'), '12.345.678/0001-90')
})

test('próximos vencimentos considera hoje/futuro e ordena antes de limitar', () => {
  const events = [
    { id: 'later', partyId: 'p1', date: '2026-09-20', done: false },
    { id: 'past', partyId: 'p1', date: '2026-08-27', done: false },
    { id: 'invalid', partyId: 'p1', date: '', done: false },
    { id: 'today', partyId: 'p1', date: '2026-08-28', done: false },
    { id: 'done', partyId: 'p1', date: '2026-08-29', done: true },
    { id: 'next', partyId: 'p1', date: '2026-08-29', done: false },
    { id: 'hidden', partyId: 'p2', date: '2026-08-28', done: false }
  ]

  const result = getUpcomingEvents(events, {
    today: '2026-08-28',
    partyIds: new Set(['p1']),
    limit: 2
  })

  assert.deepEqual(result.map((event) => event.id), ['today', 'next'])
})

test('faixa de prazo classifica hoje, semana e mês civis, ignorando vencidos e inválidos', () => {
  // Faixas fixas a partir da data de referência (decisão dos sócios):
  // dia (hoje), semana civil, mês civil, próximos 6 meses.
  assert.equal(deadlineBucket('2026-08-28', '2026-08-28'), 'dia') // vence hoje
  assert.equal(deadlineBucket('2026-08-30', '2026-08-28'), 'semana') // domingo da semana civil
  assert.equal(deadlineBucket('2026-08-31', '2026-08-28'), 'mes') // após a semana, dentro do mês
  assert.equal(deadlineBucket('2026-09-01', '2026-08-28'), 'semestre') // dentro de 6 meses
  assert.equal(deadlineBucket('2027-02-28', '2026-08-28'), 'semestre') // último dia da janela de 6 meses
  assert.equal(deadlineBucket('2027-03-01', '2026-08-28'), null) // além de 6 meses → fora das faixas
  assert.equal(deadlineBucket('2026-08-27', '2026-08-28'), null) // já vencido
  assert.equal(deadlineBucket('2026-02-30', '2026-08-28'), null) // data inválida
})

test('semana civil da faixa de prazo vai de segunda a domingo', () => {
  // Referência 2026-08-31 é segunda; a semana civil termina em 2026-09-06 (domingo).
  assert.equal(deadlineBucket('2026-08-30', '2026-08-31'), null) // domingo anterior (vencido)
  assert.equal(deadlineBucket('2026-08-31', '2026-08-31'), 'dia')
  assert.equal(deadlineBucket('2026-09-06', '2026-08-31'), 'semana') // domingo da mesma semana
  // Segunda seguinte: já passou o fim do mês (ago) e da semana → cai em 6 meses.
  assert.equal(deadlineBucket('2026-09-07', '2026-08-31'), 'semestre')
})

test('semana civil da faixa atravessa a virada do ano sem incluir a segunda seguinte', () => {
  assert.equal(deadlineBucket('2026-12-28', '2026-12-28'), 'dia')
  assert.equal(deadlineBucket('2027-01-03', '2026-12-28'), 'semana') // domingo da mesma semana
  assert.equal(deadlineBucket('2027-01-04', '2026-12-28'), 'semestre') // segunda seguinte, mês/ano diferente
})

test('fim do mês separa o dia atual do primeiro dia do mês seguinte', () => {
  // Referência 2027-01-31 é domingo: fim de semana e fim de mês coincidem.
  assert.equal(deadlineBucket('2027-01-31', '2027-01-31'), 'dia')
  // Dia seguinte já ultrapassa semana e mês correntes → cai em 6 meses.
  assert.equal(deadlineBucket('2027-02-01', '2027-01-31'), 'semestre')
})

test('faixa de prazo reconhece 29 de fevereiro somente em ano bissexto', () => {
  assert.equal(isValidLocalISO('2028-02-29'), true)
  assert.equal(isValidLocalISO('2027-02-29'), false)
  assert.equal(deadlineBucket('2028-02-29', '2028-02-28'), 'semana')
  assert.equal(deadlineBucket('2027-02-29', '2027-02-27'), null) // data inexistente
})

test('today inválido não classifica nenhuma faixa de prazo', () => {
  for (const today of ['', '2027-02-29', '28/02/2028']) {
    assert.equal(deadlineBucket('2028-02-29', today), null)
    assert.deepEqual(getUpcomingEvents([{ type: 'vencimento', date: '2028-02-29', done: false }], { today }), [])
  }
})

test('getContractDeadlineBuckets conta contratos por faixa e ignora sem vencimento ou vencidos', () => {
  const contracts = [
    { vencimento: '2026-08-28' }, // dia
    { vencimento: '2026-08-30' }, // semana
    { vencimento: '2026-08-31' }, // mes
    { vencimento: '2026-09-01' }, // semestre
    { vencimento: '2027-03-01' }, // além de 6 meses → ignorado
    { vencimento: '2026-08-01' }, // vencido → ignorado
    { vencimento: '' }, // sem vencimento → ignorado
    {} // sem campo → ignorado
  ]

  assert.deepEqual(getContractDeadlineBuckets(contracts, '2026-08-28'), {
    dia: 1,
    semana: 1,
    mes: 1,
    semestre: 1
  })
})

test('dashboard agrega valores pelo tipo específico do contrato', () => {
  const contracts = [
    { tipo: 'Prestação de Serviços', valor: 1500 },
    { tipo: 'Locação', valor: '900' },
    { tipo: 'Prestação de Serviços', valor: 2500 },
    { tipo: '', valor: 300 },
    { tipo: 'Sem valor', valor: '' }
  ]

  assert.deepEqual(getContractValuesByType(contracts), [
    ['Prestação de Serviços', 4000],
    ['Locação', 900],
    ['Sem classificação', 300]
  ])
})

test('revisão respeita a decisão da Fernanda sobre o que pode ser corrigido', () => {
  const modeOf = (key) => REVIEW_FIELDS.find((f) => f.key === key)?.mode

  // Fica travado (somente conferência).
  assert.equal(modeOf('comunicacao'), 'travado')
  assert.equal(isReviewFieldEditable('comunicacao'), false)

  // "Depende do contrato" → editável, mas com ressalva.
  assert.equal(modeOf('atualizacaoMonetaria'), 'condicional')
  assert.equal(modeOf('multa'), 'condicional')
  assert.equal(isReviewFieldEditable('multa'), true)

  // Pode corrigir livremente.
  for (const key of ['qualificacao', 'objeto', 'valor', 'vencimento', 'parcelas', 'meioPagamento', 'prazo']) {
    assert.equal(modeOf(key), 'editavel', `${key} deveria ser editável`)
    assert.equal(isReviewFieldEditable(key), true)
  }

  // Campo desconhecido não é editável.
  assert.equal(isReviewFieldEditable('inexistente'), false)
})

test('revisão esconde o representante legal para pessoa física', () => {
  const pf = reviewFieldsFor({ isPJ: false })
  const pj = reviewFieldsFor({ isPJ: true })
  assert.ok(!pf.some((f) => f.key === 'representante'))
  assert.ok(pj.some((f) => f.key === 'representante'))
})

test('dashboard não mistura tipos homônimos de grupos jurídicos diferentes', () => {
  const contracts = [
    { groupId: 'civis', tipo: 'Distribuição', valor: 1000 },
    { groupId: 'empresariais', tipo: 'Distribuição', valor: 2000 },
    { groupId: 'civis', tipo: 'Corretagem', valor: 3000 },
    { groupId: 'imobiliarios', tipo: 'Corretagem', valor: 4000 }
  ]

  assert.deepEqual(getContractValuesByType(contracts), [
    ['Corretagem — Contratos Imobiliários', 4000],
    ['Corretagem — Contratos Civis e Gerais', 3000],
    ['Distribuição — Contratos Empresariais', 2000],
    ['Distribuição — Contratos Civis e Gerais', 1000]
  ])
})

// Reaproveitamento de dados (Issue #11): a qualificação é montada a partir do
// cadastro, na ordem e com os campos definidos pelos sócios.
test('qualificacaoFromParty reaproveita nome, CPF, RG, endereço, e-mail e telefone (PF)', () => {
  const party = {
    personType: 'PF',
    name: 'Marina Alves',
    doc: '987.654.321-00',
    rg: '12.345.678-9',
    address: 'Av. Paulista, 1000 - São Paulo/SP',
    email: 'marina@email.com',
    phone: '(11) 98888-2222'
  }
  assert.equal(
    qualificacaoFromParty(party),
    'Marina Alves, CPF 987.654.321-00, RG 12.345.678-9, Av. Paulista, 1000 - São Paulo/SP, marina@email.com, (11) 98888-2222'
  )
})

test('qualificacaoFromParty usa rótulo CNPJ para pessoa jurídica', () => {
  const party = { personType: 'PJ', name: 'Gráfica Bem Ltda', doc: '55.444.333/0001-22', email: 'contato@bem.com' }
  assert.equal(qualificacaoFromParty(party), 'Gráfica Bem Ltda, CNPJ 55.444.333/0001-22, contato@bem.com')
})

test('qualificacaoFromParty ignora campos vazios sem deixar vírgulas soltas', () => {
  assert.equal(qualificacaoFromParty({ personType: 'PF', name: 'Só Nome' }), 'Só Nome')
})

test('qualificacaoFromParty retorna string vazia quando não há parte', () => {
  assert.equal(qualificacaoFromParty(null), '')
})
