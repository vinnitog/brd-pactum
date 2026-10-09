# Skills compartilhadas — brd-pactum

Biblioteca: [techtogs-utilities](https://github.com/vinnitog/techtogs-utilities).
Manifesto: `.techtogs-utilities.json`. Perfis: core, planning, frontend, javascript, react, web-qa, privacy, infra.

A pasta de descoberta `.agents/skills` aponta para uma copia compartilhada.
Os papeis de implementacao, revisao e QA sao aplicados pelo Codex conforme
autorizacao e ferramentas disponiveis.
Instalar o catalogo nao executa scripts, hooks, deploys, issues ou alteracoes de produto.

## Setup e verificacao

Reutilize a biblioteca existente no commit fixado. Se ela ainda nao estiver
disponivel, clone-a ao lado deste projeto. Para versoes diferentes entre consumidores, use clones separados e
`TECHTOGS_UTILITIES_PATH`. Nao atualize o checkout compartilhado silenciosamente.

```powershell
# Na raiz deste projeto:
# Somente se nao houver um checkout compartilhado adequado:
git clone git@github.com:vinnitog/techtogs-utilities.git ../techtogs-utilities
# Somente no clone novo, antes de usa-lo:
$utilitiesPin = (Get-Content -Raw .techtogs-utilities.json | ConvertFrom-Json).libraryCommit
git -C ../techtogs-utilities checkout --detach $utilitiesPin
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/bootstrap-utilities.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/bootstrap-utilities.ps1 -Action verify
```

O bootstrap tambem aceita `-UtilitiesPath` para uma biblioteca em outro diretorio.
O manifesto usa caminhos relativos e hashes; caminhos locais nao sao publicados.
As pastas compartilhadas sao geradas e ignoradas. Arquivos anteriormente versionados
aparecerao como remocoes de conteudo vendorizado na revisao da migracao; o manifesto,
bootstrap e regras locais devem entrar no mesmo commit antes de clonar em outra maquina.
Nao incluir alteracoes de codigo anteriores na migracao.

## Regras e roteamento

Leia `AGENTS.md` e o contexto real do projeto. Capacidade planejada nao ativa uma
skill de servico em producao. Perfil mobile web/PWA nao implica React Native,
Kotlin ou Swift. Escolha apenas skills pertinentes a tarefa; o catalogo completo
e consultavel na biblioteca sem instalar todos os perfis.
Comandos Matt de orquestracao continuam sujeitos ao fluxo Git e autorizacao locais.
Tracker e vocabulário de triagem sao configurados por projeto em `docs/agents/`;
`setup-matt-pocock-skills` e opcional e nao roda durante o bootstrap.
Leia estas regras locais sempre que a tarefa corresponder ao seu dominio:

- `docs/agent-rules/README.md`: workspace, execucao, autorizacoes e integridade da biblioteca.
- `docs/agent-rules/capabilities.json`: capacidades atuais e planejadas para roteamento.
- `docs/agent-rules/domain-decisions.md`: regras aprovadas, pendencias reais e limites de produto.

Os textos antigos do hub nao sao um mecanismo de atualizacao: o togs-backoffice
foi descontinuado e nao e dependencia deste projeto.

## Reversao

Na maquina onde ocorreu a migracao, `-Action rollback` restaura as copias anteriores
usando os backups privados da biblioteca. Nao remove documentos novos nem sobrescreve
mudancas posteriores do usuario. Em um clone novo, use o historico Git para restaurar
a versao vendorizada. Backups locais nao sao enviados ao GitHub.

Neste checkout, o bootstrap prioriza a copia local `.tmp/techtogs-utilities` no commit fixado, preservando edicoes pendentes da biblioteca vizinha. Esse diretorio e ignorado pelo Git.

## Acesso privado e validacao

A biblioteca e privada. O clone local requer uma identidade SSH autorizada no GitHub;
o bootstrap nao recebe nem grava credenciais. Confirme acesso com
`git ls-remote git@github.com:vinnitog/techtogs-utilities.git HEAD`.
No GitHub Actions, `TECHTOGS_UTILITIES_SSH_KEY` e uma deploy key de leitura;
o workflow de Pages instala e verifica a versao do manifesto apenas em eventos
confiaveis, sem persistir credenciais. PRs de forks executam o build do app sem
acessar a biblioteca privada. O workflow `utilities-auth.yml` verifica o transporte
privado em um consumidor isolado; ele nao substitui validar o manifesto deste app.

O pin local existente passou em verify com 64 bindings. Uma divergencia conhecida
de senior-dev em outro checkout compartilhado deve ser corrigida centralmente,
sem alterar o arquivo nem os hashes deste consumidor para contornar a verificacao.
As regras locais sao lidas por AGENTS.md; `projectRules` do manifesto permanece
inalterado para preservar o fingerprint e o historico de rollback da instalacao.
