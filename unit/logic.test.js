import test from 'node:test'
import assert from 'node:assert/strict'
import { visibleParties, canManage, canSeeParty, isAdvogado } from '../src/lib/permissions.js'
import { buildReminder } from '../src/lib/reminderTemplate.js'
import { CONTRACT_GROUPS, findTipo } from '../src/lib/contractTypes.js'
import { parseCurrencyBR, maskCNPJ } from '../src/lib/format.js'

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
