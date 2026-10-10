# Etapas finais viáveis — 10/10/2026

## 1. Automação com versão imutável

Callers develop/review fixados em brd-ci
42feac9abdaac2e7eeae199237b5425a1204d8b6, conferido/publicado pelo coordenador.
Inputs/condições/secrets/modelos/permissões intactos; 8/8 regressões Node de
políticas passaram. O pin bd46 de skills e demo/localStorage foram preservados.
Nenhum workflow/modelo pago executado; publicação/CI remoto pelo coordenador no
mesmo PR38.

YAML (4 arquivos) e actionlint dos callers passaram; shellcheck/pyflakes desativados por ausência. Review.yml normalizado de CRLF misto para LF; conteúdo YAML preservado.

## 2. Listas extensas sem renderização integral

Partes e contratos renderizam24 cartões por página sem remover dados do store.
Pesquisa/perfil filtram antes de paginar; mudar pesquisa/perfil/tipo volta ao
início, contagens continuam incluindo todos os contratos. Troca de subaba de
contrato volta ao início; último registro permanece acessível. Não altera
classificação, minuta, finanças ou autenticação demo.

Medição JSDOM com1000 partes sintéticas:1000 cartões/6010 nós/589,0ms antes;
24 cartões/158 nós/74,8ms depois. É uma amostra local de montagem, não latência
real/SLA/WebVitals; a redução determinística de DOM é o resultado principal.
Teste cobre pesquisa pelo registro999, referências/ordem de42 páginas, última
página, abas e todos os dados preservados. Suíte152/152 (76Node+76DOM), builds
normal/Pages e verify64 aprovados. Nenhuma atualização de dependências neste lote.

## Decisões abertas, sem falsa conclusão

Mantidas contas demo/localStorage até decisão de acesso do usuário. Partes
múltiplas, versões/estados/aprovador/edição posterior, calendário financeiro de
parcelas, Word/modelos homologados, urgência conflitante e assinatura/
retroatividade dependem das decisões listadas em agent-rules/domain-decisions.md.
Não foi implementado backend/RLS/auth real, cobrança ou envio automático.
Os7 avisos Tailwind3 dev continuam; migração de major exige lote e aprovação
visual próprios. Integridade store, contagens e dependências dos lotes anteriores
estão implementados; não tratar o histórico de julho como tarefa autorizada.
