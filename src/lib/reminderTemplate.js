// Gera o texto de lembrete para envio ao cliente a partir de um evento da
// agenda (modelo definido na especificação "Reunião tecnologia").
import { formatDateBR } from './format.js'

const ASSUNTO = {
  vencimento: 'próximo do vencimento',
  atualizacao: 'com atualização monetária prevista',
  qualificacao: 'com alteração de qualificação pendente',
  outro: 'com providência pendente'
}

export function buildReminder({ event, party, contract }) {
  const nomeCliente = party?.name || 'cliente'
  const nomeContrato = contract?.titulo || contract?.tipo || 'Contrato de Prestação de Serviços'
  const situacao = ASSUNTO[event?.type] || ASSUNTO.outro
  const data = event?.date ? ` (referência: ${formatDateBR(event.date)})` : ''

  return `Prezado(a) cliente,

Informamos que o ${nomeContrato} referente ao cliente ${nomeCliente} está ${situacao}${data}.

Dessa forma, recomendamos a análise prévia quanto ao interesse na renovação, alteração ou encerramento contratual, a fim de evitar a prorrogação automática, interrupção dos serviços ou qualquer pendência operacional.

Caso haja interesse na renovação, também sugerimos a revisão das condições comerciais, prazos, valores, reajustes e demais cláusulas contratuais.

Permanecemos à disposição para auxiliar na análise e condução das providências necessárias.

Atenciosamente,
BRD pactum.`
}
