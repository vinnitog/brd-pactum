const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

function toLocalDate(value) {
  const match = ISO_DATE_PATTERN.exec(value || '')
  if (!match) return null
  const [, year, month, day] = match.map(Number)
  return new Date(year, month - 1, day)
}

function toLocalISO(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isValidLocalISO(value) {
  const match = ISO_DATE_PATTERN.exec(value || '')
  if (!match) return false

  const [, year, month, day] = match.map(Number)
  const date = toLocalDate(value)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

export function getUpcomingEvents(events, { today, partyIds, limit = 4 } = {}) {
  if (!isValidLocalISO(today)) return []

  return events
    .filter((event) => !event.done)
    .filter((event) => !partyIds || partyIds.has(event.partyId))
    .filter((event) => isValidLocalISO(event.date) && event.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit)
}

// Faixas de prazo fixas a partir da data de referência (hoje), conforme decisão
// dos sócios: dia (vence hoje), semana civil, mês civil e próximos 6 meses.
// "Fixo" = janelas de calendário (fim da semana/mês), não janelas deslizantes.
// Contratos já vencidos ou com vencimento além de 6 meses ficam fora das faixas.
// As faixas são mutuamente exclusivas: o primeiro limite atingido define a faixa.
export function deadlineBucket(dateISO, today) {
  if (!isValidLocalISO(today) || !isValidLocalISO(dateISO) || dateISO < today) return null

  const reference = toLocalDate(today)
  const weekEnd = new Date(reference)
  weekEnd.setDate(reference.getDate() + ((7 - reference.getDay()) % 7))
  const monthEnd = new Date(reference.getFullYear(), reference.getMonth() + 1, 0)
  const sixMonthsEnd = new Date(reference.getFullYear(), reference.getMonth() + 7, 0)

  if (dateISO === today) return 'dia'
  if (dateISO <= toLocalISO(weekEnd)) return 'semana'
  if (dateISO <= toLocalISO(monthEnd)) return 'mes'
  if (dateISO <= toLocalISO(sixMonthsEnd)) return 'semestre'
  return null
}

// Conta os contratos em cada faixa de prazo pela data de vencimento. O prazo é
// medido a partir da assinatura (decisão dos sócios); como o contrato guarda a
// data de vencimento explícita, ela é o marco usado aqui.
export function getContractDeadlineBuckets(contracts, today) {
  const buckets = { dia: 0, semana: 0, mes: 0, semestre: 0 }
  for (const contract of contracts) {
    const bucket = deadlineBucket(contract.vencimento, today)
    if (bucket) buckets[bucket]++
  }
  return buckets
}
