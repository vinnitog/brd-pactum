# PROJECT_CONTEXT.md - brd-pactum

Gerado em: 2026-07-07. Estado conferido em: 2026-10-10.

## Estado Implementado

React + Vite seguem adequados ao prototipo atual. Supabase continua planejado:
AuthContext usa contas de demonstracao, store.js persiste em localStorage e as
permissoes sao aplicadas apenas no frontend. Nao existe autenticacao real,
backend, RLS nem persistencia entre dispositivos. Contrato e seus novos eventos
agora sao gravados em um unico snapshot antes de atualizar a memoria. Falhas de
leitura/escrita e conteudo invalido sao apresentados sem sobrescrever dados ou
fechar formularios; dados de outra aba precisam ser relidos antes de salvar.
Essa conferencia nao fornece bloqueio entre abas. Evidencia e limites:
docs/qa-storage-integrity-20261010.md.

A elaboracao permite revisao de campos e texto antes de salvar. A minuta e uma
string editavel, sem exportacao DOC/DOCX. Contratos salvos ainda nao possuem
editor posterior, versoes ou aprovador. Parcelas representam apenas quantidade.
Lembretes possuem geracao e historico locais; o envio por WhatsApp e manual.

As caracteristicas e a stack abaixo registram a intencao original, nao comprovam
integracoes. Decisoes vigentes: docs/agent-rules/domain-decisions.md. Prioridades
reconciliadas: docs/RECOMENDACOES_E_ROADMAP.md. Skills e regras particulares:
SKILLS_SHARED.md, .techtogs-utilities.json e docs/agent-rules/README.md.

## Descricao

Servicos e gerenciamento de contratos do escritorio BRD (clientes e fornecedores).

## Objetivo

Elaborar, gerenciar e acompanhar contratos, com agenda de vencimentos, geracao de lembretes e dashboard, com acesso diferenciado para advogados e clientes.

## Publico Alvo

Advogados/socios do BRD e clientes do escritorio

## Caracteristicas Informadas

- Interface visual: Sim
- Login/autenticacao: Sim
- Banco de dados: Sim
- Offline/PWA: Nao
- Mobile: Nao
- Dashboard/graficos: Sim
- API propria: Nao
- Integracoes externas: Nao
- Multiusuario: Sim

## Stack Escolhida

```text
React + Vite + Supabase
```

## Motivo Da Stack

O projeto tem interface e sinais de login, multiusuario ou dados persistentes. React organiza telas/estado e Supabase reduz custo inicial de auth e banco.

## Alternativas Rejeitadas

HTML/CSS/JS vanilla: pode limitar evolucao com varias telas. Backend customizado: rejeitado no inicio para evitar manutencao antes da necessidade real.

## Revisao Obrigatoria De Stack

Antes da primeira feature real, o `senior-dev` deve validar se a stack escolhida ainda faz sentido.

Se houver front-end, `ui-ux-expert` deve validar impacto visual e UX.

O `code-reviewer` deve apontar risco de stack inadequada, excesso de complexidade ou falta de base para evolucao.

## Workflow Padrao

1. `senior-dev`
2. `ui-ux-expert`, quando houver front-end
3. `code-reviewer`
4. `qa-senior`
5. `qa-automate`
6. Validacao final com testes e diff
7. Commit/push em `develop` e PR `develop -> main`

## Comandos De Validacao

```powershell
.\test.cmd
npm.cmd test
git diff --check
```

## Notas De Escopo

- Trabalhar sempre em `develop`.
- Nunca fazer push direto para `main`.
- Preservar alteracoes existentes do usuario.
- Fazer staging explicito por arquivo.
- Manter documentacao de contexto versionada neste arquivo.
