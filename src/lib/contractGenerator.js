// Gera um texto-base do contrato a partir dos campos preenchidos na elaboração.
// É um rascunho estruturado para revisão dos advogados (não substitui a peça
// final). A integração com modelos/IA entra em fase posterior.
import { formatCurrencyBR, formatDateExtenso, todayLocalISO } from './format.js'

export function generateContractText(contract, party) {
  const l = []
  const titulo = (contract.subtipo || contract.tipo || 'CONTRATO').toUpperCase()
  l.push(titulo)
  l.push('')

  l.push('DAS PARTES')
  if (contract.parte?.qualificacao) {
    l.push(contract.parte.qualificacao)
  } else if (party) {
    l.push(
      `${party.name}, ${party.personType === 'PJ' ? 'inscrita no CNPJ' : 'inscrito(a) no CPF'} sob o nº ${
        party.doc || '—'
      }, com endereço em ${party.address || '—'}.`
    )
  }
  if (contract.parte?.representante) {
    l.push(`Neste ato representada por ${contract.parte.representante}.`)
  } else if (party?.repLegal?.nome) {
    l.push(`Neste ato representada por ${party.repLegal.nome}, ${party.repLegal.cargo}, CPF ${party.repLegal.cpf}.`)
  }
  l.push('')

  l.push('DO OBJETO')
  l.push(contract.objeto || 'Objeto a ser detalhado.')
  l.push('')

  l.push('DO VALOR E CONDIÇÕES DE PAGAMENTO')
  const valor = contract.valor ? `R$ ${formatCurrencyBR(contract.valor)}` : '—'
  const parcelas = contract.parcelas ? ` em ${contract.parcelas} parcela(s)` : ''
  l.push(`Valor total de ${valor}${parcelas}, pago por ${contract.meioPagamento || '—'}.`)
  if (contract.atualizacaoMonetaria) {
    l.push(`Atualização monetária / inadimplência: ${contract.atualizacaoMonetaria}.`)
  }
  l.push('')

  l.push('DO PRAZO')
  l.push(`Prazo: ${contract.prazo || '—'}.`)
  l.push('')

  l.push('DA MULTA')
  l.push(`Multa: ${contract.multa || '—'}.`)
  l.push('')

  l.push('DA COMUNICAÇÃO')
  l.push(contract.comunicacao || 'As comunicações entre as partes serão feitas por escrito.')
  l.push('')

  if (contract.testemunhas?.length) {
    l.push('DAS TESTEMUNHAS')
    contract.testemunhas.forEach((t, i) => l.push(`${i + 1}. ${t.nome} — CPF ${t.cpf || '—'}`))
    l.push('')
  }

  l.push(`São Paulo, ${formatDateExtenso(todayLocalISO())}.`)
  l.push('')
  l.push('BRD pactum.')
  return l.join('\n')
}
