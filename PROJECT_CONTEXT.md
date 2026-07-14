# PROJECT_CONTEXT.md - brd-pactum

Gerado em: 2026-07-07 11:23:34

## Descricao

Servicos e gerenciamento de contratos do escritorio BRD (clientes e fornecedores).

## Objetivo

Elaborar, gerenciar e acompanhar contratos, com agenda de vencimentos, lembretes automaticos e dashboard, com acesso diferenciado para advogados e clientes.

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
