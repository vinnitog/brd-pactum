# Auditoria de design — BRD Pactum

Referência: [Impeccable](https://github.com/pbakaus/impeccable), aplicada em modo de operação: clareza, legibilidade e consistência para gestão de contratos. Identidade preservada e conferida no BRD Assistant: DM Sans, violeta `#964AFB`, fundo `#0B0911` e superfícies com subtom violeta.

## Método e limites

Auditoria do código de todas as páginas e dos componentes compartilhados, seguida de refinamento pontual. O repositório orienta priorizar testes locais e não abrir Browser em localhost sem pedido explícito. Portanto, os achados de layout são estáticos; não representam uma inspeção visual renderizada nem certificação WCAG. A avaliação visual final fica disponível no servidor Vite local.

## Integridade e avaliação inicial

O sistema tem identidade coerente com o escritório, fontes locais e componentes reutilizados. Os problemas eram principalmente contraste e estados incompletos, sem necessidade de substituir o design ou a stack.

| Dimensão | Nota inicial (0–4) | Evidência |
| --- | --- | --- |
| Acessibilidade | 2 | Metadados com branco a 30–40%, calendário sem nomes completos e busca sem rótulo. |
| Desempenho | 3 | Fontes locais e SVG sem dependências; blur desnecessário nos cards. Sem medição de runtime. |
| Responsividade | 2 | Rosca e legenda competiam em colunas estreitas; cabeçalhos sem quebra. |
| Tema | 3 | Paleta centralizada, mas texto secundário dependia de transparência. Tema claro fora do escopo. |
| Integridade | 3 | Componentes consistentes, porém busca sem resultado comunicava ausência de cadastro. |
| Total | 13/20 | Estimativa técnica inicial: melhorias relevantes necessárias. |

## Achados e correções

Foram agrupados oito achados: quatro P1 e quatro P2; nenhum bloqueio P0 identificado nesta auditoria.

| Prioridade | Local | Impacto e correção aplicada |
| --- | --- | --- |
| P1 | `components/ui`, páginas e modais | Texto auxiliar transparente prejudicava leitura (WCAG 1.4.3). Adotado `muted` opaco, campos com bordas mais visíveis, foco global e botão primário com tom violeta mais escuro. |
| P1 | `pages/Agenda` | Setas sem nome, seleção só visual e mudança de mês mantinha detalhe antigo. Incluídos nomes, data completa, contagem, estado pressionado, hoje, legenda de urgência e limpeza da seleção ao mudar de mês. |
| P1 | `pages/PartyList` | Busca dependia do placeholder como nome e dizia que não havia cadastros quando o filtro não correspondia. Rótulo visível e mensagem de recuperação corrigidos. |
| P1 | `pages/NewContract` | Minuta editável originalmente sem nome acessível (WCAG 4.1.2). Nome acessível e tipografia de revisão garantidos; a integração final preserva o rótulo “Texto da minuta” recebido da develop. |
| P2 | `components/Donut` | Totais e classificações longos podiam ultrapassar a área disponível. Layout responde à largura do card, legendas quebram e números usam alinhamento tabular. SVG decorativo, com dados preservados em texto. |
| P2 | `components/AppShell`, `pages/PartyDetail` | Navegação comprimida em tablets e grupos sem quebra. Ajustados breakpoint, alvos de interação, quebra de grupos, estados de seleção e atalho para conteúdo. |
| P2 | `pages/Home`, `pages/PartyList` | Bordas dos cards pareciam clicáveis, mas apenas o conteúdo era link; ausência de vencimentos escondia a seção. Card inteiro agora navega, com estado vazio explícito e acesso à agenda completa. |
| P2 | `components/AgendaList`, `pages/NewContract` | Conclusão apagava todos os controles da linha e formulário tinha pouca hierarquia. Conclusão agora usa texto e riscado; formulário tem títulos de seção e orientação para revisão, preservando as etapas “Revisar dados” e “Gerar minuta” recebidas da develop. |

## Validação

- Base anterior: 20 testes de lógica/políticas e 6 de componentes aprovados.
- Detector Impeccable executado sobre componentes, páginas, CSS e tokens: retorno `[]`; isso não comprova qualidade visual.
- Cálculo de contraste dos tokens: texto `muted` entre 6,63:1 e 8,17:1 nas quatro superfícies-base avaliadas; branco no botão primário 6,39:1; borda de campo sobre superfície 3,57:1. Os valores não substituem medição de todas as sobreposições renderizadas.
- Validação final: `test.cmd` aprovado com 38 testes (20 de lógica/políticas e 18 de componentes), incluindo 12 novos casos para início, busca, calendário, permissões, dados dos gráficos e geração/revisão/salvamento de minuta. Build de produção e `git diff --check` aprovados.
- Sem novas dependências, alterações de persistência, permissões ou integração externa.
- Não há service worker no código atual.
- Revisões UI/UX e técnica realizadas por subagents. Foram corrigidas a mensagem inicial que poderia ocultar atrasos e a nomenclatura acessível dos eventos do calendário. Papéis `code-reviewer`, `qa-senior` e `qa-automate` executados explicitamente, pois não há skills formais desses nomes na sessão.

## Avaliação manual na prévia

Entrar como advogado e como cliente; navegar por Início, Clientes, Fornecedores, Agenda e Dashboard. Conferir pesquisa sem resultados, calendário em outro mês, leitura de valores extensos, campos desabilitados, foco com Tab e revisão de minuta. Avaliar janela ampla e estreita/zoom, respeitando as permissões de cada perfil.

O refinamento está concluído no código; aparência renderizada, gestos de toque e leitor de tela real continuam sem validação nesta sessão. A criação futura de `PRODUCT.md` por `impeccable init` pode formalizar o contexto, sem ser pré-requisito para este refinamento do sistema existente.

## Correção após avaliação local — compromissos na agenda

A imagem enviada na avaliação revelou um problema que os testes DOM não detectaram: na coluna lateral do calendário, texto, data e ações dividiam a mesma linha flexível. O texto podia encolher quase até zero e quebrar uma palavra por linha.

`AgendaList` agora reserva uma linha inteira para título e descrição, com data, estado e ações em um rodapé que pode quebrar. A mesma correção atende à lista geral e à agenda do cadastro. O grid do calendário limita as colunas ao espaço disponível e alinha seus painéis ao topo, sem esticar o calendário à altura dos compromissos.

O screenshot é a reprodução visual fornecida; a inspeção do componente confirma a disputa de largura. Não foi criado teste de classes para simular garantia de layout: jsdom não calcula geometria, e Browser local segue restrito pelo repositório. Revisões UI/UX e de código concluídas por subagent; QA cobre as ações preservadas. A confirmação renderizada deve ser feita na prévia local, incluindo a coluna lateral, o modo Lista e janela estreita.

Validação deste ajuste: 40 testes aprovados (20 Node e 20 DOM), incluindo novos casos de concluir/reabrir e lembrete do evento correto com restauração de foco. Build e revisão de diff aprovados; servidor local responde com HTTP 200.

Na integração com a develop atualizada, foram preservados os novos assets da marca e o fluxo elaboração → revisão dos dados → revisão do texto. A suíte integrada contém 47 testes (25 Node e 22 DOM), incluindo os testes recebidos de revisão de dados e os testes desta auditoria.
