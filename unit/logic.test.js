import test from 'node:test'
import assert from 'node:assert/strict'
import { visibleParties, canManage, canSeeParty, isAdvogado } from '../src/lib/permissions.js'
import { buildReminder } from '../src/lib/reminderTemplate.js'
import { CONTRACT_GROUPS, findTipo, getContractValuesByType } from '../src/lib/contractTypes.js'
import { parseCurrencyBR, maskCNPJ } from '../src/lib/format.js'
import { getDeadlineBuckets, getUpcomingEvents, isValidLocalISO } from '../src/lib/deadlines.js'
import { REVIEW_FIELDS, isReviewFieldEditable, reviewFieldsFor } from '../src/lib/contractReview.js'

const advogado = { id: 'a', role: 'advogado' }
const cliente = { id: 'c', role: 'cliente', partyId: 'p1' }
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

test('prazos usam semana e mês civis sem contar vencidos ou datas inválidas', () => {
  const events = [
    { type: 'vencimento', date: '2026-08-28', done: false },
    { type: 'vencimento', date: '2026-08-30', done: false },
    { type: 'vencimento', date: '2026-08-31', done: false },
    { type: 'vencimento', date: '2026-09-01', done: false },
    { type: 'vencimento', date: '2027-02-28', done: false },
    { type: 'vencimento', date: '2027-03-01', done: false },
    { type: 'vencimento', date: '2026-08-27', done: false },
    { type: 'vencimento', date: '2026-08-29', done: true },
    { type: 'outro', date: '2026-08-29', done: false },
    { type: 'vencimento', date: '2026-02-30', done: false }
  ]

  assert.deepEqual(getDeadlineBuckets(events, '2026-08-28'), {
    semana: 2,
    mes: 1,
    semestre: 2,
    ano: 1
  })
})

test('semana civil atravessa mês de segunda a domingo', () => {
  const events = [
    { type: 'vencimento', date: '2026-08-30', done: false },
    { type: 'vencimento', date: '2026-08-31', done: false },
    { type: 'vencimento', date: '2026-09-06', done: false },
    { type: 'vencimento', date: '2026-09-07', done: false }
  ]

  assert.deepEqual(getDeadlineBuckets(events, '2026-08-31'), {
    semana: 2,
    mes: 0,
    semestre: 1,
    ano: 0
  })
})

test('semana civil atravessa a virada do ano sem incluir a segunda seguinte', () => {
  const events = [
    { type: 'vencimento', date: '2026-12-28', done: false },
    { type: 'vencimento', date: '2027-01-03', done: false },
    { type: 'vencimento', date: '2027-01-04', done: false }
  ]

  assert.deepEqual(getDeadlineBuckets(events, '2026-12-28'), {
    semana: 2,
    mes: 0,
    semestre: 1,
    ano: 0
  })
})

test('fim do mês separa o dia atual do primeiro dia do mês seguinte', () => {
  const events = [
    { type: 'vencimento', date: '2027-01-31', done: false },
    { type: 'vencimento', date: '2027-02-01', done: false }
  ]

  assert.deepEqual(getDeadlineBuckets(events, '2027-01-31'), {
    semana: 1,
    mes: 0,
    semestre: 1,
    ano: 0
  })
})

test('limite de seis meses inclui o último dia e exclui o seguinte', () => {
  const events = [
    { type: 'vencimento', date: '2027-02-28', done: false },
    { type: 'vencimento', date: '2027-03-01', done: false }
  ]

  assert.deepEqual(getDeadlineBuckets(events, '2026-08-28'), {
    semana: 0,
    mes: 0,
    semestre: 1,
    ano: 1
  })
})

test('datas ISO reconhecem 29 de fevereiro somente em ano bissexto', () => {
  assert.equal(isValidLocalISO('2028-02-29'), true)
  assert.equal(isValidLocalISO('2027-02-29'), false)

  assert.deepEqual(
    getDeadlineBuckets([{ type: 'vencimento', date: '2028-02-29', done: false }], '2028-02-28'),
    { semana: 1, mes: 0, semestre: 0, ano: 0 }
  )
})

test('today inválido produz resultados vazios e não classifica prazos', () => {
  const events = [{ type: 'vencimento', date: '2028-02-29', done: false }]
  const emptyBuckets = { semana: 0, mes: 0, semestre: 0, ano: 0 }

  for (const today of ['', '2027-02-29', '28/02/2028']) {
    assert.deepEqual(getDeadlineBuckets(events, today), emptyBuckets)
    assert.deepEqual(getUpcomingEvents(events, { today }), [])
  }
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
