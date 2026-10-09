# Validacao da migracao de skills — 2026-10-09

## Candidato validado

Base do consumidor: `origin/develop` em `af250702a879b0ce6d9dd2c59314245cf128b448`.
Biblioteca privada fixada: `547b07aa1c645f8f7517c908b330305242c350fb`.
O manifesto mantem os oito perfis e 64 bindings ja selecionados. Nenhum hash foi atualizado.

Foi feito clone real por SSH de `vinnitog/brd-pactum`, branch develop, em
`.tmp/migration-clean-consumer`, relativo a raiz do projeto. Sobre esse clone foram
aplicados exclusivamente estes arquivos do candidato local:

- `.gitignore`
- `.togs/orchestrator.json`
- `AGENTS.md`
- `SKILLS_MANAGED.md`
- `.techtogs-utilities.json`
- `SKILLS_SHARED.md`
- `docs/agent-rules/README.md`
- `docs/agent-rules/capabilities.json`
- `scripts/bootstrap-utilities.ps1`

Os 27 arquivos antes versionados em `.agents/skills` foram removidos do clone antes
do bootstrap. No checkout de trabalho, a remocao deve ser somente do indice Git,
preservando junctions locais e arquivos compartilhados. O manifesto, bootstrap,
regras, ignores e remocoes fazem parte da mesma migracao.

## Evidencias executadas

1. `gh repo view vinnitog/techtogs-utilities --json isPrivate`: biblioteca privada.
2. `git ls-remote git@github.com:vinnitog/techtogs-utilities.git HEAD`: acesso SSH aprovado.
3. Fetch SSH do commit fixado no checkout **ja existente** `.tmp/techtogs-utilities`:
   sucesso, sem criar outra copia da biblioteca nem alterar HEAD ou seus arquivos.
4. Bootstrap do clone com `-UtilitiesPath` apontando para esse checkout:
   `{"project":"brd-pactum","changes":64,"backupAvailable":true}`.
5. Verify do clone:
   `{"project":"brd-pactum","verifiedBindings":64}`.
6. Verify do checkout de trabalho: mesmos 64 bindings aprovados.
7. `git status --short` da biblioteca fixada: vazio; HEAD permaneceu no pin do manifesto.
8. Autenticacao privada no CI remoto tambem aprovada em develop:
   [run 37712669943](https://github.com/vinnitog/brd-pactum/actions/runs/37712669943).
   O workflow usa um consumidor isolado; a evidencia local acima cobre o manifesto real.

O Secret `TECHTOGS_UTILITIES_SSH_KEY` existe no repositorio. Nenhuma credencial foi
exibida, copiada para documentos ou alterada nesta validacao. O valor armazenado no
GitHub nao e recuperavel; o sucesso do workflow e a evidencia de acesso no runner.

## Limites e preservacao

Esta evidencia cobre a migracao sobre a base indicada, antes das correcoes de produto
do lote atual. A validacao final de codigo e fixtures deve usar o candidato completo.
Nao comprova publicacao ou deploy das mudancas ainda nao commitadas.

Os workflows locais de autenticacao ja estavam publicados em origin/develop;
foram preservados no fast-forward. A unica diferenca local era espacamento entre
Secrets. Suas copias anteriores ficaram em `.tmp/migration-workflow-backup`.

A biblioteca vizinha e suas edicoes anteriores nao foram modificadas. A divergencia
conhecida de senior-dev nesse checkout continua sendo responsabilidade central;
a versao fixada existente usada aqui passou em verify. Nao se recalculou hash para
contornar integridade, nem se tentou reinstalar todo o catalogo. As regras locais
ficam em docs/agent-rules e sao referenciadas por AGENTS.md, sem alterar o fingerprint
da instalacao existente. O utilitario oficial criou apenas seus registros privados
de instalacao para o consumidor isolado durante o bootstrap.

## Candidato completo — validacao final local

Apos as correcoes de integridade contratual, o clone limpo existente recebeu os
arquivos alterados e novos listados explicitamente por `git diff HEAD --name-only
--diff-filter=ACMRTUXB` e `git ls-files --others --exclude-standard`. A exportacao
recusou junctions, diretorios, node_modules, .tmp, .env e arquivos de chave. As
remocoes dos 27 arquivos vendorizados foram preservadas. A lista exata dessa
exportacao esta em `.tmp/migration-candidate-files.json` (evidencia local ignorada).

| Validacao no clone | Resultado |
| --- | --- |
| Verify usando biblioteca fixada existente | 64 bindings aprovados |
| `npm.cmd ci`, sem node_modules preexistente | 237 pacotes instalados pelo lockfile |
| `test.cmd` | 113 testes aprovados: 48 Node + 65 DOM |
| `npm.cmd run build:pages` | Sucesso; 68 modulos transformados |

Os testes incluem fixtures de geracao de minuta, revisao com campos explicitamente
vazios, partes PF/PJ, parcelas, vencimento e conservacao dos eventos na persistencia.
O build gerou assets locais sob `/brd-pactum/`; nao houve publicacao ou acesso a dados
reais durante esta validacao. Avisos de future flags do React Router permaneceram
sem causar falha. A validacao comprova a instalacao do consumidor limpo com o pin
privado ja autenticado, sem reutilizar node_modules do checkout principal.

### Dependencias existentes a tratar em lote separado

`npm ci` e `npm audit --json` reportaram 19 vulnerabilidades do lockfile existente:
7 moderadas, 10 altas e 2 criticas. As duas criticas foram atribuidas a dependencias
de desenvolvimento: `vitest@3.2.6` (direta) e `tinypool@1.1.1` (transitiva).
Ha tambem alertas moderados de runtime em `react-router-dom@6.30.4` (direta) e
`react-router@6.30.4` (transitiva). Isso nao demonstra exploracao no app; requer
avaliacao e atualizacao controlada das dependencias em lote proprio. O relatorio
JSON esta em `.tmp/migration-npm-audit.json`, sem credenciais. Nao foi executado
`npm audit fix` e package-lock.json permaneceu inalterado.
