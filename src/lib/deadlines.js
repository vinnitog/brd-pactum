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

export function getDeadlineBuckets(events, today) {
  const buckets = { semana: 0, mes: 0, semestre: 0, ano: 0 }
  if (!isValidLocalISO(today)) return buckets

  const reference = toLocalDate(today)
  const weekEnd = new Date(reference)
  weekEnd.setDate(reference.getDate() + ((7 - reference.getDay()) % 7))
  const monthEnd = new Date(reference.getFullYear(), reference.getMonth() + 1, 0)
  const sixMonthsEnd = new Date(reference.getFullYear(), reference.getMonth() + 7, 0)
  const weekEndISO = toLocalISO(weekEnd)
  const monthEndISO = toLocalISO(monthEnd)
  const sixMonthsEndISO = toLocalISO(sixMonthsEnd)

  for (const event of events) {
    if (event.type !== 'vencimento' || event.done || !isValidLocalISO(event.date) || event.date < today) continue
    if (event.date <= weekEndISO) buckets.semana++
    else if (event.date <= monthEndISO) buckets.mes++
    else if (event.date <= sixMonthsEndISO) buckets.semestre++
    else buckets.ano++
  }

  return buckets
}
