# Regras locais para agentes

## Escopo e fonte de verdade

- Trabalhe na raiz deste repositorio. Nao recrie caminhos antigos da Area de Trabalho.
- Leia AGENTS.md, PROJECT_CONTEXT.md e os documentos de dominio antes de modificar o produto.
- Consulte domain-decisions.md para decisoes aprovadas e limites do lote atual.
- As orientacoes genericas de entrega das skills nao substituem o workspace, fluxo Git e validacao definidos pelo Pactum. Arquivos do app permanecem neste repositorio.
- Use somente skills pertinentes entre os perfis fixados; nao copie o catalogo nem personalize arquivos dentro de .agents/skills, que apontam para a biblioteca.

## Runtime e autorizacao

- Desenvolvimento, revisao e integracao usam Codex. Gemini fica restrito a triagem, quando configurada na automacao responsavel.
- Capacidade planejada nao e integracao implementada. Confirme codigo e testes antes de presumir autenticacao, persistencia, permissoes no servidor ou Supabase real.
- Instalacao das skills nao autoriza alterar producao, dados reais, cobrancas, mensagens externas ou configuracao de outros projetos.

## Integridade da biblioteca

- Preserve o commit e hashes de .techtogs-utilities.json ate uma atualizacao central validada.
- Se verify apontar divergencia de senior-dev, preserve o arquivo compartilhado e registre a dependencia central; nao recalcule hashes para silenciar a falha.
- Use o checkout fixado existente ou informe UtilitiesPath. Nao atualize automaticamente checkouts usados por outros consumidores.
- Autenticacao privada no CI usa TECHTOGS_UTILITIES_SSH_KEY com acesso de leitura. Nao registre o valor da chave, nem o publique em arquivos ou logs.
