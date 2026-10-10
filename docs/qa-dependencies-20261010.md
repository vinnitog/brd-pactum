# Dependências e escopo demo — 10/10/2026

## Base e decisão de acesso

Checkout isolado `brd-pactum`, branch `codex/second-lot-20261010`, base main
`507559383266f456b4d78c60a3fd4599b99a3add`. O checkout original continua com
suas quatro alterações locais de migração, preservadas. A biblioteca permanece
fixada em `bd46a3d293aec0c85bdc5a1be6b1a2c6477438a7`; verify aprovou 64 bindings.

O usuário determinou manter contas demo e localStorage enquanto define quem
terá acesso e como. Essa decisão está registrada em `PROJECT_CONTEXT.md`,
`docs/agent-rules/domain-decisions.md` e roadmap. Autenticação real, Supabase,
backend, RLS, migração, dados reais e envio automático permanecem fora do lote.

## Atualização gradual

| Dependência resolvida | Antes | Depois | Motivo |
| --- | --- | --- | --- |
| react-router-dom / react-router | 6.30.4 | 7.18.4 | Correções de navegação e hidratação; React 18 suportado |
| vite | 5.4.21 | 7.3.7 | Versão corrigida sem migrar bundler para Vite 8 |
| @vitejs/plugin-react | 4.7.0 | 5.2.0 | Faixa de peers/engine coerente com Vite 7 |
| vitest | 3.2.6 | 4.1.11 | Mock redirect corrigido; pool próprio elimina Tinypool |
| postcss | 8.5.16 | 8.5.29 | Correções de source maps |
| React / React DOM | 18.3.1 | 18.3.1 | Preservado |
| Tailwind | 3.4.19 | 3.4.19 | Preservado; não misturar migração de estilos |
| JSDOM | 25.0.1 | 25.0.1 | Preservado |

Primeiro foi atualizado somente o Router e executada a regressão de 145 testes.
Depois foram atualizados tooling e transitivas compatíveis (`browserslist`,
`baseline-browser-mapping`, `nanoid`, `source-map-js`, `postcss-nested`), seguidos
de nova regressão. Instalação limpa final por `npm ci` e nova suíte passaram.
Não houve `npm audit fix`, `--force`, overrides, edição manual do lockfile ou
alteração da biblioteca compartilhada.

Node suportado no package: `^20.19.0 || ^22.12.0 || >=24.0.0`, conforme interseção
do tooling escolhido. Pages usa Node 22 e auth CI usa 24; ensaio local usa 24.12.0.
O alvo de build anterior (`es2020`, Edge 88, Firefox 78, Chrome 87, Safari 14) foi
explicitado para o upgrade não aplicar silenciosamente o novo default do Vite.
Isso preserva o alvo de compilação; não constitui homologação de cada navegador.

Fontes primárias consultadas: [migração Vite 7](https://v7.vite.dev/guide/migration),
[migração Vitest](https://vitest.dev/guide/migration/),
[release Vitest 4.1.11](https://github.com/vitest-dev/vitest/releases/tag/v4.1.11),
[migração Router 7](https://reactrouter.com/7.18.4/upgrading/v6) e
[advisory do mantenedor Router](https://github.com/remix-run/react-router/security/advisories/GHSA-wrjc-x8rr-h8h6).
Metadados `npm view` conferiram engines, peers e dependências das versões exatas.
Não há rotas com splats multissegmento, data router, SSR, loader/action ou fetcher
no Pactum. HashRouter do Pages, BrowserRouter local, links, rota profunda após
remontar e matriz demo existente são exercitados pelos testes atuais.

## Audit e avisos restantes

| Audit | Antes | Depois |
| --- | --- | --- |
| Completo | 19: 7 moderados, 10 altos, 2 críticos | 7: 2 moderados, 5 altos, 0 críticos |
| Produção (`--omit=dev`) | Router com avisos no baseline | 0; exit 0 |

Os sete pacotes restantes não são sete defeitos independentes: cinco são
afetados pela cadeia Braces (`braces`, `chokidar`, `fast-glob`, `micromatch`,
`tailwindcss`); dois pela cadeia selector-parser (`postcss-selector-parser`,
`postcss-nested`). Todos são tooling dev do Tailwind 3.

- Braces latest 3.0.3 continua afetado e não há patch publicado no momento da
  análise. [Disposição do advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
- selector-parser corrigido 7.1.6 é major fora da faixa `^6.1.2` declarada por
  Tailwind 3; nested 6 usa o mesmo parser 6. Não forçar substituição transitive
  ou migrar Tailwind para afirmar audit zero sem uma migração validada de estilos.
- A configuração compila fontes locais versionadas e globs fixos, não conteúdo
  de usuários ou padrões recebidos por uma API. O build permanece estático;
  não existe serviço Node desses pacotes em runtime. Isso limita o contexto de
  exposição atual, sem declarar os avisos inexploráveis ou resolvidos.
- Acompanhar patches upstream; reavaliar o audit antes de instalar código/config
  não confiável. Tailwind 4 fica para lote explícito com revisão visual e regressão.

## Gates e medidas

| Gate | Resultado |
| --- | --- |
| npm ci | Exit 0 |
| npm test baseline | 73 Node + 72 DOM aprovados |
| npm test após Router | 73 Node + 72 DOM aprovados |
| npm test após tooling/transitivas | 73 Node + 72 DOM aprovados |
| npm test após instalação limpa final | 73 Node + 72 DOM; zero falhas/cancelados/skips |
| build normal | Exit 0, três execuções medidas |
| build:pages | Exit 0; base `/brd-pactum/` e modo hash preservados |
| verify compartilhado | 64 bindings aprovados |
| git diff --check | Aprovado |

Testes cobrem os fluxos demo e permissões visuais, geração/revisão da minuta,
campos apagados, agenda e lembretes locais, filtros, store real, falhas de
localStorage, JSON inválido preservado, concorrência detectada e navegação
normal/Pages. Não foi adicionado teste que apenas repete a declaração de versões.

| Medida do build normal | Antes | Depois |
| --- | --- | --- |
| Wall clock (3 execuções, ms) | 4610.91 / 4501.94 / 4422.03 | 5903.27 / 4824.10 / 4911.49 |
| Mediana wall clock | 4501.94 ms | 4911.49 ms |
| JS bytes reais | 251025 | 267078 |
| JS gzip local | 77938 | 83932 |
| CSS bytes | 21073 | 21063 |

O custo observado foi +16053 bytes JS (+6.4%), +5994 bytes gzip (+7.7%) e
+409.55 ms na mediana de build (+9.1%). A amostra é pequena e a máquina é
compartilhada; esses tempos não comprovam ganho ou perda no carregamento real.
A entrega é segurança/compatibilidade, não uma otimização de bundle.

Uma reconstrução separada do HEAD anterior foi extraída por `git archive` para
`.tmp/second-lot-baseline`, com lock original e `npm ci`, sem tocar no checkout
original. A comparação PostCSS encontrou os mesmos 927 nós em ordem, seletores,
declarações e valores. As únicas cinco diferenças são espaços após `:` em
parâmetros de media queries; a forma normalizada é idêntica. CSS fonte, Tailwind
config, assets, rotas, componentes, AuthContext, store e testes não foram editados.
Não houve trabalho visual; Impeccable/UI-UX não foram acionados neste lote.

Logs locais ignorados: `.tmp/second-lot-{tests-before,tests-router,tests-tooling,tests-final,ci,pages-final}.log`,
audit `{before,tooling,final,prod}.json`, build `{before,after}.json` e
`second-lot-css-comparison.json`, todos com prefixo `second-lot-` em `.tmp`.

## Revisão, limites e rollback

Papéis aplicados: senior-dev e clean-code para escopo/implementação; code-reviewer
para peers, engines, lock e fronteiras de demo; qa-senior/qa-automate para
regressão proporcional e leitura das evidências. Skills pertinentes já lidas
da biblioteca fixada; nenhum catálogo foi reinstalado ou personalizado.
Revisão independente do responsável segue antes de commit/publicação.

Sem navegador real, serviço remoto, deploy, dado pessoal ou mensagem enviada.
Fixtures locais são sintéticas. Audit é uma fotografia do registro no dia da
análise; sete avisos dev continuam abertos. Demo/localStorage não se tornam
autenticação ou persistência segura pelo upgrade. Limites de isolamento entre
abas/dispositivos permanecem os registrados no lote anterior.

Rollback: reverter o futuro commit de dependências, engines, alvo e documentos,
executar `npm ci` e os gates novamente. Não há migração de banco, alteração de
schema do snapshot ou dado a restaurar. O implementador deixou diff sem
staging, commit ou push para revisão do responsável.
