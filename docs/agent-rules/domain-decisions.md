# Decisões de domínio vigentes

Conferidas em 09/10/2026 contra tickets, código e testes. Estas regras locais
prevalecem sobre recomendações históricas ainda não reconciliadas.

- [#4](https://github.com/vinnitog/brd-pactum/issues/4): revisão dos dados ocorre
  antes da minuta. Comunicação permanece travada; os demais campos previstos
  em `contractReview.js` são editáveis. Apagar um valor explicitamente deve ser
  respeitado ao avançar, voltar, gerar, salvar e reabrir.
- [#5](https://github.com/vinnitog/brd-pactum/issues/5): taxonomia estática de
  11 grupos. Não substituir por categorias macro nem criar CRUD de classificação.
- [#9](https://github.com/vinnitog/brd-pactum/issues/9): dashboard por tipo,
  filtros opcionais combináveis e estado vazio estão implementados. Datas de
  assinatura e retroatividade ainda precisam de modelagem própria.
- [#10](https://github.com/vinnitog/brd-pactum/issues/10): agenda permite edição.
  Editar não pode criar um vínculo contratual ausente; opções respeitam a parte.
- [#11](https://github.com/vinnitog/brd-pactum/issues/11): gerenciamento reaproveita
  qualificação e exige ao menos uma testemunha com nome. Mantém vários vencimentos
  e urgência manual; limites conflitantes de urgência dependem dos sócios.
- [#12](https://github.com/vinnitog/brd-pactum/issues/12): geração local de
  lembretes, lote com janela de dois dias, texto editável e envio manual. Não
  autoriza contratar serviço ou enviar mensagens automaticamente.
- [#13](https://github.com/vinnitog/brd-pactum/issues/13) e
  [#14](https://github.com/vinnitog/brd-pactum/issues/14): campos opcionais e
  aceitação livre de dados, preservada a exceção da testemunha no gerenciamento.
  Não adicionar validação impeditiva de CPF/CNPJ ou duplicidade. Cliente e
  fornecedor são cadastros separados; a pessoa pode existir em ambos.

## Decisões ainda necessárias

- Múltiplas partes: papéis, cardinalidade e vínculo com a minuta.
- Edição posterior: versões, histórico, aprovador, estados e permissões.
- Parcelas: datas, valores, arredondamento, periodicidade, quitação e cancelamento.
- Word: modelos homologados, formato, download e relação com o histórico.
- Pagamento múltiplo: opções e representação. Não inferir um cronograma financeiro.
- Produção: ambiente de autenticação/banco, migração dos dados locais e regras RLS.

Nenhuma dessas lacunas autoriza inventar regras ou operar com dados reais.
