# Contagens de contratos em cadastros — 10/10/2026

Base: `d5de7a67238bb635668243d03dc9a451bbc3a806` (main, PR 37).
PartyList executava contracts.filter para cada card, inclusive ao pesquisar:
P cadastros e C contratos produziam P*C leituras. Agora um Map conta relações
em uma passagem; useMemo reutiliza-o enquanto contracts tem a mesma referência.
O store existente troca essa referência ao salvar contratos, alterar seu status
ou reler o armazenamento, preservando atualização das contagens.

Todos os estados continuam contados, incluindo inativos. Identificadores,
ordenação, pluralização, links, filtros, clientes, fornecedores e visibilidade
por perfil permanecem. Sem paginação, virtualização, alteração de layout,
CSS/fontes ou store. Contas demo/localStorage permanecem por decisão expressa
do usuário; sem backend, autenticação real, RLS ou segurança no servidor.

## Custo medido

`node scripts/party-counts.benchmark.mjs`: relações inteiramente sintéticas,
uma execução de aquecimento e cinco amostras, mediana em Node. Compara o
algoritmo anterior e confirma igualdade das contagens.

| Cadastros / contratos | Antes (ms) | Depois (ms) | Leituras antes / depois |
| --- | ---: | ---: | ---: |
| 100 / 1000 | 1,538 | 0,159 | 100000 / 1000 |
| 1000 / 10000 | 152,107 | 0,676 | 10000000 / 10000 |
| 5000 / 50000 | 1572,829 | 2,370 | 250000000 / 50000 |

Mede contagem, não renderização da tela ou latência em celular. Trabalho
O(P*C) -> O(C+P), com Map adicional O(IDs distintos). Pesquisar contracts
inalterados não relê relações, mas ainda filtra cadastros e renderiza cards.
DOM muito grande e serialização localStorage continuam sem otimização. Tempos
variam com CPU/JIT/carga; testes de leituras não dependem de timing.

Build Pages com mesma configuração; plugin somente de medição carregou
PartyList do HEAD como baseline, sem alterar o checkout:

| Artefato | Antes (bytes / gzip) | Depois (bytes / gzip) |
| --- | ---: | ---: |
| JS | 267318 / 84020 | 267424 / 84080 |
| CSS | 21096 / 4948 | 21096 / 4948 |

JS cresceu 106 bytes, gzip 60 bytes. CSS byte a byte idêntico:
SHA256 `bde811e5e563de43322c16c269b59708332faf8e904f5b840c458d2cb54af3be`.

## Gates e limites

- `npm.cmd test`: 75 Node + 74 DOM = 149/149. Novos testes: IDs especiais,
  ativos/inativos, imutabilidade, 10000 relações, troca da lista de contratos,
  cliente/fornecedor/perfil e várias pesquisas sem releitura.
- Builds normal/Pages aprovados; verify 64 bindings, mesmo pin. Detector
  Impeccable uma vez em PartyList: zero ocorrências; diff-check aprovado.
- Dependências/lockfile intactos: audit anterior de 7 avisos de desenvolvimento
  na cadeia Tailwind 3 continua pendente; zero avisos de produção. Sem nova
  auditoria ou major forçado neste lote.

Logs/métricas ignorados em `.tmp/third-lot`. Sem dados reais, envio, fixtures
de produção ou escrita fora do checkout. Revisão e publicação ficam com o
integrador; nenhum commit/push feito nesta etapa.
