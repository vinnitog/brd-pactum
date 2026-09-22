// Monta o link de envio por WhatsApp (canal decidido pelos sócios, Issue #12).
// O disparo é manual: o link abre a conversa com o texto do lembrete já pronto
// para o sócio revisar e enviar ao contato principal do cliente.
const BR_COUNTRY_CODE = '55'

export function whatsappLink(phone, text) {
  const digits = (phone || '').replace(/\D/g, '')
  if (!digits) return ''
  // Números locais (DDD + número, até 11 dígitos) recebem o código do Brasil.
  const withCountry = digits.length <= 11 ? `${BR_COUNTRY_CODE}${digits}` : digits
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(text || '')}`
}
