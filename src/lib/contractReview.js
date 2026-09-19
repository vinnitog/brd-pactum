// Configuração da tela de revisão dos dados do contrato antes da geração.
// Define, campo a campo, o que a pessoa pode corrigir na conferência e o que
// aparece apenas para leitura ("travado").
//
// A separação editável × travado é uma regra de negócio jurídica. Ela vem da
// decisão da sócia Fernanda registrada no card do Trello / Issue #4:
//   • partes/qualificação, objeto, valor, vencimento, parcelas, forma de
//     pagamento e prazo → corrigir
//   • atualização monetária / juros e multa → "depende do contrato"
//     (permitido corrigir, mas nem sempre se aplica)
//   • forma de comunicação entre as partes → travado (só conferência)
//
// mode:
//   'editavel'    → pode corrigir na revisão
//   'condicional' → pode corrigir, mas a aplicação depende do contrato
//   'travado'     → somente conferência (sem edição na revisão)

export const REVIEW_FIELDS = [
  { key: 'qualificacao', label: 'Identificação e qualificação das partes', control: 'textarea', mode: 'editavel' },
  { key: 'representante', label: 'Qualificação do representante legal', control: 'text', mode: 'editavel', onlyPJ: true },
  { key: 'objeto', label: 'Objeto do contrato', control: 'textarea', mode: 'editavel' },
  { key: 'valor', label: 'Valor', control: 'currency', mode: 'editavel' },
  { key: 'vencimento', label: 'Data de vencimento', control: 'date', mode: 'editavel' },
  { key: 'parcelas', label: 'Número de parcelas', control: 'number', mode: 'editavel' },
  { key: 'meioPagamento', label: 'Forma de pagamento', control: 'text', mode: 'editavel' },
  { key: 'atualizacaoMonetaria', label: 'Atualização monetária / juros por atraso', control: 'text', mode: 'condicional' },
  { key: 'prazo', label: 'Prazo', control: 'text', mode: 'editavel' },
  { key: 'multa', label: 'Multa', control: 'text', mode: 'condicional' },
  { key: 'comunicacao', label: 'Forma de comunicação entre as partes', control: 'textarea', mode: 'travado' }
]

// Um campo é editável na revisão quando não está travado. Campos "condicionais"
// continuam editáveis — a ressalva "depende do contrato" é só orientação.
export function isReviewFieldEditable(key) {
  const field = REVIEW_FIELDS.find((f) => f.key === key)
  return Boolean(field) && field.mode !== 'travado'
}

// Campos visíveis na revisão para o tipo de pessoa (esconde o representante
// legal quando o cliente é pessoa física).
export function reviewFieldsFor({ isPJ }) {
  return REVIEW_FIELDS.filter((field) => !field.onlyPJ || isPJ)
}
