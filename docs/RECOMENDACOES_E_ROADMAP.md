# BRD Pactum — Recomendações e Roadmap

Documento de apoio para apresentação aos sócios e planejamento das próximas
etapas do BRD Pactum.

Histórico original: 14 de julho de 2026. Reconciliado em: 10 de outubro de 2026.

## Atualização técnica em 10/10/2026

**Decisão de acesso em 10/10/2026:** o usuário determinou manter contas demo e
localStorage até definir quem terá acesso e como esse acesso funcionará.
Autenticação real, Supabase, backend, RLS e migração não estão autorizados neste
lote. A decisão prevalece sobre a prioridade de produção do histórico abaixo;
retomá-la exige definição de acesso e autorização explícita.

O lote de integridade local está implementado: contrato e seus novos eventos
usam uma gravação conjunta; memória e navegação só confirmam salvamento após
`localStorage.setItem` funcionar. Falhas conservam rascunhos e bytes existentes,
com releitura dentro dos modais quando necessária. A detecção de alterações em
outra aba não equivale a bloqueio ou transação entre abas.

Foram aprovados 145 testes (73 Node + 72 DOM), incluindo store real com falhas
simuladas, reload e formulário real; builds normal e GitHub Pages passaram.
O audit confirmou os mesmos 19 avisos do lockfile. As atualizações completas
exigem mudanças maiores de tooling e permanecem em lote separado. Evidências,
decisões e limites estão em [qa-storage-integrity-20261010.md](qa-storage-integrity-20261010.md).
Autenticação demo e decisões de produto continuam com os limites já descritos.

O lote separado de dependências também foi implementado em 10/10/2026:
React Router 7.18.4, Vite 7.3.7/plugin React 5.2.0, Vitest 4.1.11 e PostCSS
8.5.29, mais transitivas atualizadas dentro das faixas compatíveis. Os 145 testes
e builds normal/Pages passaram após `npm ci`. Audit atual: 7 avisos somente dev
(5 altos e 2 moderados), zero críticos e zero de produção. React 18, Tailwind 3,
fontes da UI, modelo de dados, demo e localStorage permanecem preservados.
Detalhes e custo de bundle/build: [qa-dependencies-20261010.md](qa-dependencies-20261010.md).

## Situação vigente em 09/10/2026

Esta seção prevalece sobre as recomendações históricas abaixo. A conferência
usou código, testes e decisões dos tickets; não pressupõe que uma pendência
de julho continua aberta. Regras aprovadas estão em
[domain-decisions.md](agent-rules/domain-decisions.md).

| Tema histórico | Evidência posterior | Situação atual |
| --- | --- | --- |
| Relógio fixo e próximos vencimentos | [PR6](https://github.com/vinnitog/brd-pactum/pull/6), `deadlines.js` e testes de datas civis | Resolvido; seed antigo não equivale a relógio fixo. |
| Conferência de dados antes da minuta | [#4](https://github.com/vinnitog/brd-pactum/issues/4), [PR16](https://github.com/vinnitog/brd-pactum/pull/16) | Implementada; comunicação travada e demais campos previstos editáveis. Não confundir com aprovação ou histórico posterior. |
| Taxonomia não implementada | [#5](https://github.com/vinnitog/brd-pactum/issues/5), `contractTypes.js` | 11 grupos estáticos aprovados. Homologação de modelos jurídicos é outra entrega. |
| Perfis de acesso | [PR20](https://github.com/vinnitog/brd-pactum/pull/20) | Matriz visual implementada; cliente próprio, estagiário leitura e gestores. Sem proteção no servidor. |
| Dashboard, filtros e faixas | [#9](https://github.com/vinnitog/brd-pactum/issues/9), [PR22](https://github.com/vinnitog/brd-pactum/pull/22) | Implementados agrupamento por tipo, filtros combináveis e estado vazio. Assinatura/retroatividade não modeladas. |
| Agenda e edição | [PR23](https://github.com/vinnitog/brd-pactum/pull/23) | Calendário/lista, filtros, criação/edição, tipos e confirmação de exclusão implementados. |
| Gerenciamento manual | [PR25](https://github.com/vinnitog/brd-pactum/pull/25) | Qualificação reaproveitada, testemunha, vários vencimentos e urgência manual implementados. |
| Lembretes | [PR28](https://github.com/vinnitog/brd-pactum/pull/28) | Texto editável, lote de dois dias, histórico local e WhatsApp manual implementados. Não há envio automático por provedor. |
| Cadastro de partes | [PR30](https://github.com/vinnitog/brd-pactum/pull/30) | Busca nos dois tipos e campos opcionais. Cliente e fornecedor continuam cadastros separados; múltiplas partes por contrato não implementadas. |
| Design e cartões quebrados na agenda | [PR17](https://github.com/vinnitog/brd-pactum/pull/17), `AUDITORIA_DESIGN.md` | Correções anteriores presentes; evidência histórica não é nova homologação visual. |
| Pages e automação | PR31/32 e workflows atuais | Publicação e substituição da automação antiga concluídas. Codex em desenvolvimento/revisão/integração; Gemini somente na triagem responsável. |

### Prioridades remanescentes

1. **Adiado por decisão expressa de acesso em 10/10/2026:** manter contas demo e
   localStorage. Definir quem terá acesso e como antes de avaliar autenticação,
   banco e autorização no servidor. Não implementar backend, Supabase ou RLS
   automaticamente a partir das recomendações históricas.
2. **P1, primeiro lote implementado nesta retomada:** conservar vencimento e CPF
   do representante na minuta; respeitar campos explicitamente apagados e texto
   salvo vazio; editar agenda sem atribuir contrato ausente ou de outra parte.
   Fixtures cobrem geração, revisão, navegação entre etapas, salvamento e reabertura.
3. **P1, lote técnico implementado em 10/10/2026:** falhas de armazenamento são
   comunicadas e contrato/eventos compartilham um snapshot. JSON inválido é
   preservado; falhas não publicam estado ficticiamente salvo. A releitura mantém
   o rascunho, mas não faz merge nem garante exclusão mútua entre abas. Consulte
   [a evidência atual](qa-storage-integrity-20261010.md).
4. **P1, decisão de produto:** papéis de múltiplas partes, editor de contrato salvo,
   versões, histórico, estados e aprovador. Hoje há revisão anterior à geração e
   alteração ativo/inativo, sem ciclo de aprovação posterior.
5. **P1, decisão financeira:** parcelas são apenas quantidade; faltam datas,
   valores, arredondamento, quitação e cancelamento. Não gerar cobranças ou inferir
   periodicidade a partir desse número.
6. **P2, [#13 aberta](https://github.com/vinnitog/brd-pactum/issues/13):** definir
   modelos homologados, formato/download Word, relação com histórico e opções de
   pagamento múltiplo. Atualmente a minuta é texto; nenhum DOC/DOCX é gerado.
7. **P2:** resolver limites conflitantes de urgência, assinatura/retroatividade e
   filtro por tipo homônimo entre grupos antes de alterar classificação/dashboard.

**Dependências reconciliadas em 10/10/2026:** o baseline tinha 19 avisos
(7 moderados, 10 altos, 2 críticos). O lote dedicado removeu as críticas de
Vitest/Tinypool e os avisos de runtime Router; permanecem 7 avisos dev na cadeia
Tailwind 3. Braces 3.0.3 não tem correção publicada; selector-parser corrigido
exige uma major fora da faixa declarada pelo Tailwind 3. Não esconder os avisos
nem forçar overrides. Acompanhar correções upstream; migração de Tailwind exige
lote próprio com aprovação visual/regressão. Nenhum `npm audit fix` foi utilizado.

Campos continuam opcionais conforme #13/#14, preservando a testemunha exigida
no gerenciamento (#11). As recomendações antigas de tornar CPF/CNPJ ou dados
obrigatórios não autorizam validação impeditiva. PR33 entrega anexos privados à
automação; não representa exportação Word no aplicativo.

### Evidência e limites do lote

Fixtures são sintéticas. Os testes de DOM exercitam geração/revisão e agenda;
um teste separado utiliza o store real, salva em localStorage simulado e recarrega
o módulo. `test.cmd` aprovou 113 testes (48 Node + 65 DOM), incluindo 19 novos;
build Vite e revisão UI/UX/técnica aprovados. Isso não valida segurança,
persistência entre dispositivos, navegador
real, valor jurídico da minuta ou operação com dados reais. Migração de skills:
[evidência do clone limpo](agent-rules/migration-validation.md).

## Histórico de planejamento de julho

O conteúdo seguinte fica preservado como origem das recomendações. Consulte a
situação vigente acima antes de tratar seus itens como trabalho autorizado.

## 1. Objetivo

Registrar as melhorias identificadas ao comparar:

- o documento `Reunião tecnologia.pdf`, especialmente as páginas 1 a 9;
- o documento `20260710 - Reunião tecnologia.pdf`, apenas nas referências
  explícitas ao padrão do BRD Pactum;
- o protótipo atualmente implementado neste repositório.

Este é um documento vivo. Cada recomendação deve ser refinada, aprovada e
convertida em uma entrega pequena na branch `develop`, seguida de pull request
para `main`.

### Resumo executivo

- O protótipo já demonstra os fluxos centrais de cadastro, contratos, agenda e
  dashboard.
- O principal bloqueio para uso real é substituir contas e dados locais por
  autenticação, banco e regras de acesso no Supabase.
- As correções de datas são um ganho rápido e devem ocorrer em paralelo à
  fundação segura.
- A evolução seguinte organiza o ciclo de vida contratual: partes, revisão,
  edição, obrigações, agenda e histórico.
- Decisões jurídicas e de negócio continuam necessárias antes de automatizar
  modelos, pagamentos ou envio de mensagens.

### Como ler as prioridades e origens

- **P0 — bloqueia produção:** segurança, isolamento e persistência de dados.
- **P1 — corrige o domínio:** comportamento necessário para o ciclo contratual.
- **P2 — aprimora a operação:** indicadores, comunicação e experiência.
- **Documento:** requisito ou padrão descrito nas reuniões.
- **Produção:** necessidade técnica inferida para operar com dados reais.
- **Melhoria:** evolução recomendada, sujeita a priorização.
- **Decisão:** depende de aprovação dos sócios ou homologação jurídica.

RLS significa *Row Level Security*: regras aplicadas pelo banco para impedir que
um usuário leia ou altere registros de outro, mesmo acessando a API diretamente.

## 2. Delimitação de escopo

### Pertence ao BRD Pactum

- cadastro e pesquisa de clientes e fornecedores;
- cadastro de pessoa física e pessoa jurídica;
- representante legal de pessoa jurídica;
- identidade visual e logo próprias do programa;
- home com saudação no padrão visual do BRD Assistant;
- elaboração e gerenciamento de contratos;
- agenda de vencimentos em calendário e lista;
- geração de lembretes contratuais;
- dashboard de contratos, valores, prazos e classificações;
- acesso diferenciado para advogados e clientes.

### Não pertence ao BRD Pactum neste momento

- os fluxos específicos de contratos de honorários, distratos e petições
  descritos para o BRD Assistant nas páginas 10 e 11;
- débitos, acordos, financeiro, cobrança judicial e IA do BRD Concordia;
- agenda compartilhada de salas e usuários externos.

As menções ao Pactum no documento do BRD Concordia são referências de padrão de
cadastro e agenda, não novos módulos para este projeto. O BRD Assistant também
pode servir como referência visual ou processual — por exemplo, home e revisão —
sem trazer seus módulos específicos para o Pactum. Um contrato de honorários
ainda poderá ser cadastrado manualmente no Pactum se essa regra for aprovada.

## 3. Situação atual

| Área | Situação | Observação |
| --- | --- | --- |
| Clientes e fornecedores | Implementado no protótipo | Cadastro, busca e ficha individual disponíveis |
| Pessoa física e jurídica | Implementado no protótipo | Representante legal disponível para pessoa jurídica |
| Contratos | Parcial | Elaboração e gerenciamento básico funcionam |
| Revisão de contratos | Parcial | Revisão atual é uma edição simples da minuta |
| Agenda | Parcial | Calendário, lista, urgência e lembrete disponíveis |
| Dashboard | Parcial | Indicadores existem, mas datas e classificação precisam de ajustes |
| Identidade e home | Implementado no protótipo | Logo recriada e saudação no padrão do Assistant; falta homologação visual |
| Login e multiusuário | Demonstração | Contas e dados estão no navegador |
| Supabase | Não implementado | Auth, banco e RLS ainda precisam ser construídos |
| Testes automatizados | Inicial | Regras isoladas cobertas; fluxos React ainda não estão cobertos |

## 4. Recomendações priorizadas

### P0 — Segurança e dados reais

#### 4.1 Implementar Supabase Auth, banco de dados e RLS — Produção

O sistema atual usa contas de demonstração e `localStorage`. Isso é suficiente
para apresentar o protótipo, mas não protege dados jurídicos ou pessoais.

Aplicar:

- autenticação real com Supabase Auth;
- perfis de advogado e cliente definidos no banco;
- tabelas para usuários, partes, contratos, partes contratuais e eventos;
- estrutura mínima e reversível para marcos/obrigações, deixando o modelo
  detalhado de parcelas para depois da decisão dos sócios;
- Row Level Security (RLS) para garantir que cada cliente acesse somente o
  próprio cadastro, inclusive por chamadas diretas à API;
- permissão global de leitura e gestão para advogados autorizados;
- remoção das contas de demonstração do ambiente de produção;
- trilha mínima de criação, atualização e exclusão dos registros;
- política de backup e restauração testada;
- regras de retenção, exclusão lógica e responsabilidade pela autorização de
  advogados.

Resultado esperado: dados centralizados, persistentes entre dispositivos e
isolados por perfil.

### P1 — Correções funcionais e domínio contratual

#### 4.2 Remover datas fixas — Documento e correção

Esta é uma correção independente e deve ser tratada como ganho rápido, sem
aguardar a conclusão da migração para Supabase.

Aplicar:

- usar a data local atual nos indicadores;
- abrir a agenda no mês corrente;
- exibir na página inicial apenas eventos de hoje ou futuros;
- ordenar os próximos vencimentos antes de limitar a lista;
- definir se “esta semana” e “este mês” significam períodos de calendário ou
  janelas móveis de dias;
- excluir eventos concluídos e vencidos dos indicadores futuros.

Resultado esperado: agenda e dashboard corretos em qualquer data.

#### 4.3 Estruturar todas as partes do contrato — Documento e melhoria

O formulário atual parte do cadastro principal, mas um contrato pode conter
contratante, contratado e outros intervenientes.

Aplicar:

- permitir múltiplas partes contratuais;
- definir o papel de cada parte no instrumento;
- reutilizar dados do cadastro sem impedir ajustes específicos do contrato;
- manter representante legal para pessoas jurídicas;
- validar CPF/CNPJ, e-mail e duplicidade de documentos;
- definir campos mínimos obrigatórios por fluxo.

Resultado esperado: qualificação completa e reaproveitável de todas as partes.

#### 4.4 Evoluir a elaboração e a revisão — Documento, melhoria e decisão

Aplicar:

- definir com o jurídico quais tipos terão modelos próprios;
- manter indicação explícita de “rascunho” enquanto não houver modelo jurídico
  homologado;
- incluir na minuta todos os campos capturados, inclusive vencimento;
- separar revisão dos dados e revisão do texto final;
- criar estados como rascunho, em revisão, aprovado, ativo e inativo;
- registrar versões e responsável por cada aprovação;
- impedir confirmação duplicada ou salvamento incompleto.

Resultado esperado: processo de elaboração rastreável e juridicamente mais
seguro.

#### 4.5 Permitir gerenciamento contínuo — Melhoria

Aplicar:

- editar contratos após o cadastro;
- editar vencimentos, testemunhas, valores e demais condições;
- editar eventos da agenda sem excluir e recriar;
- solicitar confirmação antes de excluir eventos;
- registrar alterações relevantes em histórico;
- definir regras para encerramento, reativação e eventual exclusão de contratos.

Resultado esperado: o Pactum deixa de ser apenas um cadastro inicial e passa a
acompanhar o ciclo de vida contratual.

#### 4.6 Modelar parcelas e obrigações — Documento e decisão

Aplicar:

- registrar valor e vencimento de cada parcela;
- calcular o valor das parcelas quando a divisão for uniforme;
- permitir ajustes manuais quando os valores forem diferentes;
- gerar automaticamente os eventos correspondentes na agenda;
- acompanhar status como a vencer, pago, vencido ou cancelado, se aprovado pelo
  negócio;
- evitar importar o módulo financeiro completo do BRD Concordia sem aprovação.

Resultado esperado: vencimentos financeiros coerentes com o contrato e com a
agenda.

#### 4.7 Automatizar elaboração para gerenciamento — Documento e melhoria

Aplicar:

- transformar vencimento contratual em evento de agenda;
- criar eventos de reajuste e outros marcos informados durante a elaboração;
- evitar eventos duplicados;
- manter vínculo entre contrato, obrigação e evento;
- tratar falhas de salvamento de forma atômica.

Resultado esperado: informações preenchidas uma vez e reaproveitadas em todo o
sistema.

### P2 — Indicadores, comunicação e experiência

#### 4.8 Ajustar o dashboard — Documento e decisão

Aplicar:

- confirmar se “classificação” deve ser o tipo do contrato ou o grupo macro;
- preferencialmente agregar por tipo, com detalhamento por subtipo;
- definir a regra quando um contrato possui vários vencimentos;
- impedir dupla contagem indevida;
- criar estado vazio claro e filtros úteis;
- manter indicadores de ativos, inativos, valores e prazos.

Resultado esperado: indicadores compatíveis com as decisões de negócio e úteis
para gestão.

#### 4.9 Criar lembretes específicos — Documento e decisão

Aplicar:

- preservar o texto aprovado para vencimento contratual;
- criar textos próprios para reajuste, alteração de qualificação e outras
  providências;
- separar geração automática do evento/texto de envio automático ao
  destinatário;
- confirmar se a ação de envio será somente copiar/abrir e-mail ou usar um
  provedor externo;
- restringir o envio aos perfis autorizados;
- registrar data, destinatário e responsável quando houver envio automático;
- tratar clientes sem e-mail cadastrado.

Resultado esperado: comunicação correta, autorizada e rastreável.

Se o envio automático for aprovado, o projeto passará a ter integração externa;
o `PROJECT_CONTEXT.md` deverá ser atualizado com provedor, custos, autorização e
tratamento de falhas.

#### 4.10 Refinar permissões e experiência por perfil — Produção e melhoria

Aplicar:

- ocultar de clientes áreas sem acesso, como fornecedores e dashboard;
- bloquear as mesmas rotas também no backend;
- confirmar se fornecedores permitem elaboração ou apenas gerenciamento manual;
- ampliar áreas de toque de ações pequenas;
- manter foco dentro dos modais e retornar o foco ao fechá-los;
- adicionar feedback claro para sucesso, erro, carregamento e exclusão;
- revisar adaptação básica para desktop e tablet, contraste e navegação por
  teclado, sem transformar mobile em um novo produto sem aprovação.

Resultado esperado: interface mais clara e coerente com as permissões reais.

### Estratégia transversal de qualidade

#### 4.11 Ampliar testes automatizados — Produção

Testes acompanham cada entrega P0, P1 e P2. A Fase 3 consolida lacunas e testes
de ponta a ponta; ela não adia a proteção das fases anteriores.

Aplicar testes para:

- autenticação, perfis e políticas RLS;
- acesso direto a rotas e dados de outros clientes;
- cadastro e edição de pessoa física e jurídica;
- elaboração, revisão, confirmação e criação de eventos;
- gerenciamento manual com múltiplos vencimentos e testemunhas;
- datas, ordenação e cálculos do dashboard;
- taxonomia completa de contratos;
- modelos de lembrete por evento;
- edição, status e confirmação de exclusão;
- acessibilidade básica dos modais e formulários.

Estratégia mínima:

- manter `node:test` e `.\test.cmd` para funções puras;
- adotar Vitest, React Testing Library e jsdom quando o primeiro fluxo React for
  alterado;
- usar Supabase local com dados determinísticos para testar usuário anônimo,
  advogado, cliente A e cliente B em leitura, criação, atualização e exclusão;
- testar chamadas diretas à API, não apenas bloqueios visuais;
- incluir regressão de busca, cadastros, home, calendário/lista, virada de
  mês/ano, dashboard, fornecedor, persistência, concorrência, idempotência e
  rollback de contrato com eventos;
- registrar no pull request os comandos executados e seus resultados.

Resultado esperado: alterações futuras com menor risco de regressão.

## 5. Roadmap sugerido

### Fase 1 — Fundação segura

1. Modelagem de dados no Supabase.
2. Auth real e perfis.
3. RLS e testes de isolamento.
4. Migração da camada de armazenamento.
5. Remoção das datas fixas.

Critérios de saída:

- advogado e cliente autenticam sem contas demo em produção;
- matriz RLS positiva e negativa passa por API para todos os perfis;
- dados persistem entre sessões/dispositivos e a migração não perde os registros
  aprovados para migração;
- backup e restauração são verificados;
- datas dinâmicas e testes regressivos aplicáveis estão verdes;
- nenhuma pendência P0 ou P1 da fase permanece aberta.

### Fase 2 — Ciclo de vida contratual

1. Múltiplas partes e papéis contratuais.
2. Validações de cadastro e contrato.
3. Edição de contratos e eventos.
4. Histórico e estados de revisão.
5. Obrigações e geração automática da agenda; controle detalhado de parcelas
   conforme a decisão dos sócios.

Critérios de saída:

- contrato suporta as partes e papéis aprovados;
- transições de revisão, edição e histórico são testadas;
- contrato, obrigação e evento permanecem consistentes sem duplicidade;
- falha parcial executa rollback ou recuperação definida;
- agenda e dashboard refletem alterações de status;
- nenhuma pendência P0 ou P1 da fase permanece aberta.

### Fase 3 — Inteligência operacional

1. Dashboard com regras homologadas.
2. Lembretes específicos e rastreáveis.
3. Filtros e experiência por perfil.
4. Consolidação de testes de ponta a ponta e fechamento de lacunas de cobertura.
5. Homologação jurídica dos primeiros modelos contratuais.

Critérios de saída:

- smoke tests de advogado e cliente passam de ponta a ponta;
- dashboard e lembretes seguem regras homologadas;
- primeiros modelos possuem aceite jurídico registrado;
- testes, regressão aplicável e homologação de usuário estão registrados no PR;
- nenhuma pendência P0 ou P1 permanece aberta.

## 6. Decisões pendentes dos sócios

Antes da implementação completa, confirmar:

1. O que significa o processo de revisão “igual ao BRD Assistant”.
2. Quais modelos contratuais devem ser homologados primeiro.
3. Se o dashboard agrupa por tipo, subtipo ou grupo macro.
4. Se “lembrete automático” significa gerar evento/texto, abrir e-mail ou enviar
   por um provedor externo.
5. Quem pode visualizar, gerar, enviar e excluir lembretes e eventos.
6. Se contratos de fornecedores podem ser elaborados ou somente gerenciados.
7. Quais campos são obrigatórios em cada tipo de contrato.
8. Se parcelas exigem controle de pagamento ou apenas controle de vencimento.
9. Se “esta semana” e “este mês” usam calendário ou janelas móveis.
10. Como vários vencimentos afetam contagens e valores do dashboard.
11. Quais transições de estado, exclusões e prazos de retenção são permitidos.
12. Se dados de demonstração serão descartados ou migrados.
13. Qual é a taxonomia contratual oficial, como versioná-la e tratar nomes
    repetidos em grupos diferentes.
14. Se haverá suporte mobile além da adaptação básica de desktop/tablet.
15. Se a logo recriada e a home no padrão Assistant estão homologadas.

## 7. Ordem recomendada de execução

1. Datas dinâmicas como ganho rápido em paralelo à fundação.
2. Supabase Auth, banco e RLS.
3. Partes contratuais e validações.
4. Edição, histórico e revisão.
5. Parcelas e geração automática da agenda.
6. Dashboard e lembretes específicos.
7. Refinamentos de UX e ampliação contínua dos testes.

Essa ordem reduz risco de retrabalho: corrige datas em paralelo, protege e
estrutura os dados, evolui o domínio e, por fim, aprimora indicadores e
experiência.

## 8. Controle de implementação

Cada item deve ser convertido em uma issue ou tarefa pequena com:

- escopo e fora de escopo;
- critérios de aceite;
- impacto em banco, permissões e interface;
- testes manuais e automatizados;
- testes regressivos quando tocar comportamento existente;
- evidências, comandos e resultados registrados no pull request;
- homologação de usuário quando aplicável;
- validação em `develop`;
- pull request `develop -> main` para aprovação antes do deploy.
