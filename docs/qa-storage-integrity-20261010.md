# Integridade do armazenamento local — 10/10/2026

## Escopo e base

Lote do BRD Pactum iniciado em `origin/develop`
`3241c3deab6b6a16c9f26d5c68e394f3040537a0`, na branch isolada
`codex/pactum-storage-integrity-20261010`. A árvore de `origin/main` era idêntica;
foi incorporada por fast-forward para preservar seus dois commits de merge.
HEAD de revisão: `5189dfd98d66cbfc5e008182f5417c95d54ae517`.

O checkout original e suas quatro alterações locais de migração foram
preservados. O pin compartilhado permanece
`bd46a3d293aec0c85bdc5a1be6b1a2c6477438a7`; nenhum arquivo da biblioteca foi
alterado. Esta evidência descreve validação local anterior à publicação.

## Comportamento entregue

- Elaboração e gerenciamento gravam contrato e novos vencimentos juntos em
  `brd-pactum:v1`. Todos os criadores/editores atualizam a memória somente depois
  da gravação bem-sucedida. Falha retorna `null`/`false` e impede navegação ou
  fechamento que indicaria sucesso.
- Leitura bloqueada, JSON inválido e estruturas incompatíveis preservam os
  bytes existentes e bloqueiam gravações. O seed aparece somente quando a chave
  não existe; abrir ou reler a demonstração não grava o seed automaticamente.
- O envelope legado sem `reminders` abre sem migração escrita. A checagem de
  tipos protege os campos que a interface lê como texto; campos opcionais,
  strings vazias e decisões #13/#14 continuam permitidos. Não foram adicionadas
  validações de CPF, taxonomia ou obrigatoriedade de campos.
- Aviso global e erros nos formulários explicam a falha. Reler dados salvos fica
  dentro do foco dos modais para leitura bloqueada, corrupção ou conflito;
  sucesso conserva o rascunho, limpa o erro local e devolve foco ao salvar. O
  compositor de lembretes devolve foco ao texto.
- Uma segunda leitura antes de cada escrita detecta mudança no conteúdo da
  chave desde o carregamento. O teste de recuperação conserva registro adicionado
  externamente e salva o rascunho depois de reler, em um único snapshot.
- Falha ao registrar histórico cancela o clique de WhatsApp; nenhum envio
  externo foi efetuado nos testes. O envio permanece manual.

## Verificação

| Verificação local | Resultado |
| --- | --- |
| `npm.cmd ci` | Instalação isolada concluída; lockfile preservado |
| `npm.cmd test` | 73 Node + 72 DOM aprovados, sem falhas ou skips |
| `npm.cmd run build` | Exit 0, 69 módulos |
| `npm.cmd run build:pages` | Exit 0, 69 módulos |
| Bootstrap `-Action verify -UtilitiesPath <biblioteca bd46>` | 64 bindings verificados |
| `git diff --check` | Sem erros de whitespace |
| `npm.cmd audit --json` | 19 avisos: 7 moderados, 10 altos, 2 críticos |

Os 32 testes adicionais deste lote exercitam o store real e os formulários:
quota/permissão, leitura inicial e releitura, JSON e estruturas inválidas,
payloads inválidos, compatibilidade legada, APIs de mutação, ausência de IDs,
persistência antes da memória, nova sessão, seed sem escrita inicial, snapshot
único, recuperação sem duplicação e conservação de dados externos. Os 113
testes anteriores continuam aprovados. A suíte DOM descobre os dois arquivos
`unit/**/*.dom.test.jsx`, conforme o include existente no Vite.

Logs locais ignorados no checkout isolado: `.tmp/storage-test-final.log`,
`.tmp/storage-build.log`, `.tmp/storage-build-pages.log` e
`.tmp/storage-npm-audit.json`.

Skills lidas da biblioteca fixada: `senior-dev`, `clean-code`,
`error-handling-patterns`, `code-reviewer`, `qa-senior`, `qa-automate`,
`javascript-testing-patterns`, `test-scenarios`, `ui-ux-expert`, `impeccable` e
`accessibility-compliance`. O subagente realizou passagens separadas de QA,
review e interface, somente leitura; os achados de alerta/foco foram corrigidos
e retestados. O detector Impeccable foi executado uma vez nos sete arquivos de
UI e não encontrou ocorrências; o incremento posterior de recuperação local
recebeu revisão estática e teste DOM de foco, sem repetir o detector.

## Limites e próximo lote

A gravação conjunta é uma atualização de uma chave local. A leitura antes da
escrita não é compare-and-swap: outra aba pode escrever entre essas duas
operações. Não há mutex, merge automático ou sincronização entre dispositivos.
A releitura conserva o texto do formulário; ela não resolve divergências de
domínio como edição simultânea do mesmo registro ou referências removidas.
Integridade referencial completa e política de conflito precisam acompanhar
a futura camada de persistência e suas decisões de domínio.

Testes usam fixtures sintéticas e localStorage simulado. Não validam quotas
reais de todos os navegadores, geometria/responsividade, leitor de tela,
conformidade WCAG completa, autorização no servidor, RLS, conteúdo jurídico ou
produção. Nenhum dado real, serviço pago, credencial ou mensagem externa foi
usado. Os avisos de futuras opções do React Router persistem sem falhas.

As 19 vulnerabilidades pertencem ao lockfile anterior. O audit sugere mudanças
maiores de Vitest, Vite e Tailwind para remediação completa. Não foi executado
`audit fix --force` nem misturada atualização de dependências neste lote.
O lote seguinte deve planejar compatibilidade de Node, plugins, PostCSS,
classes/CSS, testes e publicação Pages antes de atualizar tooling.

Para reverter o comportamento deste lote, reverter seu futuro commit de código;
o formato/chave de armazenamento permanecem compatíveis e nenhuma migração de
dados ou descarte de JSON inválido foi executada. Isso não restaura gravações de
usuários feitas depois de uma publicação.
