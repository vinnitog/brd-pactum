const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
]

const NUMEROS_EXTENSO = [
  'zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove',
  'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove',
  'vinte', 'vinte e um', 'vinte e dois', 'vinte e três', 'vinte e quatro',
  'vinte e cinco', 'vinte e seis', 'vinte e sete', 'vinte e oito', 'vinte e nove', 'trinta'
]

export function formatCurrencyBR(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return ''
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatDateBR(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function formatDateExtenso(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map((v) => parseInt(v, 10))
  const mes = MESES[m - 1] || ''
  return `${String(d).padStart(2, '0')} de ${mes} de ${y}`
}

export function numeroExtenso(n) {
  const i = parseInt(n, 10)
  if (!Number.isInteger(i) || i < 0) return String(n)
  return NUMEROS_EXTENSO[i] ?? String(i)
}

export function maskCPF(value) {
  const d = (value || '').replace(/\D/g, '').slice(0, 11)
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2')
}

export function maskCEP(value) {
  const d = (value || '').replace(/\D/g, '').slice(0, 8)
  return d.replace(/^(\d{5})(\d)/, '$1-$2')
}

export function maskCurrency(value) {
  const d = (value || '').replace(/\D/g, '')
  if (!d) return ''
  const cents = d.padStart(3, '0')
  const reais = cents.slice(0, -2)
  const centavos = cents.slice(-2)
  return `${parseInt(reais, 10).toLocaleString('pt-BR')},${centavos}`
}

export function parseCurrencyBR(masked) {
  const d = (masked || '').replace(/\D/g, '')
  if (!d) return 0
  return parseInt(d, 10) / 100
}

export function maskRG(value) {
  const raw = (value || '').toUpperCase().replace(/[^0-9X]/g, '').slice(0, 9)
  if (raw.length <= 2) return raw
  if (raw.length <= 5) return `${raw.slice(0, 2)}.${raw.slice(2)}`
  if (raw.length <= 8) return `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5)}`
  return `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5, 8)}-${raw.slice(8, 9)}`
}

export function maskCNPJ(value) {
  const d = (value || '').replace(/\D/g, '').slice(0, 14)
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

export function isValidCNPJ(cnpj) {
  const d = (cnpj || '').replace(/\D/g, '')
  if (d.length !== 14) return false
  if (/^(\d)\1{13}$/.test(d)) return false
  const calc = (len) => {
    const weights = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    let sum = 0
    for (let i = 0; i < len; i++) sum += parseInt(d[i], 10) * weights[i]
    const r = sum % 11
    return r < 2 ? 0 : 11 - r
  }
  return calc(12) === parseInt(d[12], 10) && calc(13) === parseInt(d[13], 10)
}

export function todayLocalISO() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

export function maskDateBR(value) {
  const d = (value || '').replace(/\D/g, '').slice(0, 8)
  if (d.length <= 2) return d
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`
}

export function brDateToISO(br) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((br || '').trim())
  if (!m) return ''
  const [, dd, mm, yyyy] = m
  const day = parseInt(dd, 10)
  const month = parseInt(mm, 10)
  const year = parseInt(yyyy, 10)
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900) return ''
  const dt = new Date(year, month - 1, day)
  if (
    dt.getFullYear() !== year ||
    dt.getMonth() !== month - 1 ||
    dt.getDate() !== day
  ) return ''
  return `${yyyy}-${mm}-${dd}`
}

export function isoToBRDate(iso) {
  if (!iso) return ''
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return ''
  const [, y, mo, d] = m
  return `${d}/${mo}/${y}`
}

export function formatRelativeTime(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (isNaN(date.getTime())) return ''
  const diffMs = Date.now() - date.getTime()
  const diffSec = Math.round(diffMs / 1000)
  if (diffSec < 60) return 'agora'
  const diffMin = Math.round(diffSec / 60)
  if (diffMin < 60) return `${diffMin} min`
  const diffHour = Math.round(diffMin / 60)
  if (diffHour < 24) return `${diffHour} h`
  const diffDay = Math.round(diffHour / 24)
  if (diffDay < 7) return `${diffDay} d`
  return formatDateBR(iso.slice(0, 10))
}

export function displayName(user) {
  if (!user) return ''
  const meta = user.prefs || user.user_metadata || {}
  const explicit = String(meta.name || meta.full_name || '').trim()
  if (explicit && !explicit.includes('@')) return explicit

  const email = user.email || (String(user.name || '').includes('@') ? user.name : '')
  const local = String(email).split('@')[0] || ''
  const base = local.split('+')[0].replace(/[._-]+/g, ' ').trim()
  if (!base) return email || ''
  return base
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function isValidCPF(cpf) {
  const d = (cpf || '').replace(/\D/g, '')
  if (d.length !== 11) return false
  if (/^(\d)\1{10}$/.test(d)) return false
  for (let t = 9; t < 11; t++) {
    let sum = 0
    for (let i = 0; i < t; i++) sum += parseInt(d[i], 10) * (t + 1 - i)
    let check = (sum * 10) % 11
    if (check === 10) check = 0
    if (check !== parseInt(d[t], 10)) return false
  }
  return true
}
