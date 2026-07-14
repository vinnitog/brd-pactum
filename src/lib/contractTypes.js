// Taxonomia de contratos do BRD pactum (transcrita da especificação "Reunião
// tecnologia"). Cada grupo tem um rótulo e uma lista de tipos; cada tipo pode
// ter subtipos. Usada na aba Elaboração (classificação → subtipo) e no
// Dashboard (valor dos contratos por classificação).

export const CONTRACT_GROUPS = [
  {
    id: 'civis',
    label: 'I. Contratos Civis e Gerais',
    tipos: [
      {
        nome: 'Compra e Venda',
        subtipos: [
          'Compra e venda de veículo',
          'Compra e venda mercantil',
          'Compra e venda futura',
          'Compra e venda com reserva de domínio',
          'Compra e venda internacional',
          'Compra e venda de quotas',
          'Compra e venda de estabelecimento empresarial'
        ]
      },
      {
        nome: 'Empreitada',
        subtipos: [
          'Empreitada global',
          'Empreitada por preço unitário',
          'Empreitada de mão de obra',
          'Empreitada mista'
        ]
      },
      {
        nome: 'Prestação de Serviços',
        subtipos: [
          'Prestação de serviços em geral',
          'Prestação de serviços advocatícios',
          'Prestação de serviços médicos',
          'Prestação de serviços odontológicos',
          'Prestação de serviços veterinários',
          'Prestação de serviços de engenharia',
          'Prestação de serviços de arquitetura',
          'Prestação de serviços de marketing',
          'Prestação de serviços de software',
          'Prestação de serviços de manutenção',
          'Prestação de serviços de segurança',
          'Prestação de serviços de limpeza',
          'Prestação de serviços contábeis',
          'Prestação de serviços administrativos',
          'Prestação de serviços de consultoria',
          'Prestação de serviços educacionais'
        ]
      },
      {
        nome: 'Locação',
        subtipos: [
          'Locação residencial',
          'Locação comercial',
          'Locação industrial',
          'Locação rural',
          'Locação de equipamentos',
          'Locação de máquinas',
          'Locação de veículos',
          'Locação de aeronaves',
          'Locação de embarcações'
        ]
      },
      { nome: 'Comodato', subtipos: ['Comodato de imóvel', 'Comodato de veículo', 'Comodato de equipamentos'] },
      { nome: 'Mútuo', subtipos: ['Empréstimo particular', 'Empréstimo empresarial', 'Empréstimo conversível'] },
      {
        nome: 'Doação',
        subtipos: ['Doação pura', 'Doação modal', 'Doação com reserva de usufruto', 'Doação remuneratória']
      },
      { nome: 'Permuta', subtipos: ['Permuta de imóveis', 'Permuta de bens móveis', 'Permuta imobiliária com torna'] },
      { nome: 'Depósito', subtipos: ['Depósito voluntário', 'Depósito necessário'] },
      { nome: 'Mandato', subtipos: ['Procuração', 'Mandato mercantil', 'Mandato judicial'] },
      { nome: 'Comissão', subtipos: [] },
      { nome: 'Agência', subtipos: [] },
      { nome: 'Distribuição', subtipos: [] },
      { nome: 'Corretagem', subtipos: ['Corretagem imobiliária', 'Corretagem de seguros'] },
      { nome: 'Transporte', subtipos: ['Transporte de cargas', 'Transporte de passageiros'] },
      { nome: 'Seguro', subtipos: [] },
      { nome: 'Constituição de renda', subtipos: [] },
      { nome: 'Fiança', subtipos: [] },
      { nome: 'Transação', subtipos: [] },
      { nome: 'Compromisso de compra e venda', subtipos: [] },
      {
        nome: 'Cessão',
        subtipos: ['Cessão de crédito', 'Cessão de direitos', 'Cessão de posição contratual', 'Cessão de direitos hereditários']
      },
      { nome: 'Confissão de dívida', subtipos: [] },
      { nome: 'Dação em pagamento', subtipos: [] },
      { nome: 'Novação', subtipos: [] },
      { nome: 'Constituição de usufruto', subtipos: [] },
      { nome: 'Constituição de servidão', subtipos: [] }
    ]
  },
  {
    id: 'empresariais',
    label: 'II. Contratos Empresariais',
    tipos: [
      { nome: 'Sociedade', subtipos: ['Contrato Social', 'Acordo de Sócios', 'Acordo de Quotistas', 'Acordo de Acionistas'] },
      { nome: 'Joint Venture', subtipos: [] },
      { nome: 'M&A', subtipos: ['Compra de quotas', 'Compra de ações', 'Asset Deal', 'Share Deal'] },
      { nome: 'Investimento', subtipos: ['Mútuo conversível', 'SAFE', 'Vesting', 'Stock Option', 'Phantom Shares'] },
      { nome: 'Confidencialidade', subtipos: ['NDA unilateral', 'NDA bilateral'] },
      { nome: 'Não Concorrência', subtipos: [] },
      { nome: 'Não Aliciamento', subtipos: [] },
      { nome: 'Memorando de Entendimentos (MOU)', subtipos: [] },
      { nome: 'Carta de Intenções (LOI)', subtipos: [] },
      { nome: 'Term Sheet', subtipos: [] },
      { nome: 'Parceria Comercial', subtipos: [] },
      { nome: 'Representação Comercial', subtipos: [] },
      { nome: 'Distribuição', subtipos: [] },
      { nome: 'Franquia', subtipos: [] },
      { nome: 'Licenciamento', subtipos: ['Marca', 'Software', 'Patente', 'Direito autoral'] },
      { nome: 'Cessão de Marca', subtipos: [] },
      { nome: 'Cessão de Software', subtipos: [] },
      { nome: 'Desenvolvimento de Software', subtipos: ['Software sob encomenda', 'SaaS', 'Licença de uso', 'Manutenção', 'SLA'] },
      { nome: 'Marketplace', subtipos: [] },
      { nome: 'White Label', subtipos: [] },
      { nome: 'Influenciador Digital', subtipos: [] },
      { nome: 'Afiliado', subtipos: [] },
      { nome: 'Dropshipping', subtipos: [] }
    ]
  },
  {
    id: 'imobiliarios',
    label: 'III. Contratos Imobiliários',
    tipos: [
      'Administração imobiliária',
      'Corretagem',
      'Promessa de compra e venda',
      'Cessão de promessa',
      'Built to Suit',
      'Sale and Lease Back',
      'Direito de superfície',
      'Incorporação',
      'SPE',
      'Built to Rent'
    ].map((nome) => ({ nome, subtipos: [] }))
  },
  {
    id: 'bancarios',
    label: 'IV. Contratos Bancários',
    tipos: [
      'Financiamento',
      'Leasing',
      'Alienação fiduciária',
      'Abertura de crédito',
      'Conta corrente',
      'Cartão de crédito',
      'Factoring',
      'Securitização'
    ].map((nome) => ({ nome, subtipos: [] }))
  },
  {
    id: 'agronegocio',
    label: 'V. Contratos do Agronegócio',
    tipos: ['Arrendamento rural', 'Parceria rural', 'CPR', 'Barter', 'Integração', 'Compra futura'].map((nome) => ({
      nome,
      subtipos: []
    }))
  },
  {
    id: 'trabalhistas',
    label: 'VI. Contratos Trabalhistas',
    tipos: [
      'Contrato de trabalho por prazo indeterminado',
      'Prazo determinado',
      'Intermitente',
      'Teletrabalho',
      'Aprendiz',
      'Estágio',
      'Temporário',
      'Experiência',
      'PJ (prestação de serviços)'
    ].map((nome) => ({ nome, subtipos: [] }))
  },
  {
    id: 'pi',
    label: 'VII. Propriedade Intelectual',
    tipos: [
      'Licença de marca',
      'Licença de patente',
      'Cessão de patente',
      'Licença de software',
      'Cessão de software',
      'Licença de imagem',
      'Cessão de direitos autorais'
    ].map((nome) => ({ nome, subtipos: [] }))
  },
  {
    id: 'consumo',
    label: 'VIII. Contratos de Consumo',
    tipos: ['Prestação de serviços', 'Ensino', 'Plano de saúde', 'Academia', 'Turismo', 'Hospedagem', 'Eventos'].map(
      (nome) => ({ nome, subtipos: [] })
    )
  },
  {
    id: 'publicos',
    label: 'IX. Contratos Públicos',
    tipos: ['Contrato administrativo', 'Concessão', 'Permissão', 'PPP', 'Credenciamento'].map((nome) => ({
      nome,
      subtipos: []
    }))
  },
  {
    id: 'termos',
    label: 'X. Termos Jurídicos',
    tipos: [
      'Termo de Confidencialidade',
      'Termo de Quitação',
      'Termo de Rescisão',
      'Termo de Entrega',
      'Termo de Recebimento',
      'Termo de Garantia',
      'Termo de Responsabilidade',
      'Termo de Consentimento (LGPD)',
      'Termo de Uso',
      'Política de Privacidade'
    ].map((nome) => ({ nome, subtipos: [] }))
  },
  {
    id: 'complementares',
    label: 'XI. Documentos Complementares',
    tipos: [
      'Procuração',
      'Substabelecimento',
      'Ata de reunião',
      'Ata de assembleia',
      'Declaração',
      'Memorando',
      'Regulamento interno',
      'Código de conduta',
      'Manual de compliance'
    ].map((nome) => ({ nome, subtipos: [] }))
  }
]

export function findGroup(groupId) {
  return CONTRACT_GROUPS.find((g) => g.id === groupId) || null
}

export function findTipo(groupId, tipoNome) {
  const g = findGroup(groupId)
  if (!g) return null
  return g.tipos.find((t) => t.nome === tipoNome) || null
}
