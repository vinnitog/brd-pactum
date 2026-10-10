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

## 3. Jornada real de navegador com store e reload

Novo runner `npm.cmd run test:e2e` inicia o Vite em loopback com envFile:false,
sem config/env real e sem serviços. Requer Playwright disponível localmente;
`PLAYWRIGHT_MODULE` pode apontar para instalação absoluta existente, sem nova
dependência de app. Edge é padrão; `E2E_BROWSER_CHANNEL` permite selecionar outro
canal instalado. Rede externa, métodos de escrita HTTP e service workers são
bloqueados. Dados/localStorage existem apenas no contexto temporário do browser.

6/6 jornadas:1440/390 e advogado/estagiário/cliente. Pesquisa encontra o
registro999; conta cliente recebe apenas seu cadastro e é recusada na URL de
terceiros; contrato48 acessível por paginação. No advogado, quota mantém form e
bytes; mudança de snapshot reproduz conflito sem overwrite, releitura mantém
draft, próximo save insere uma vez, preserva edição alheia/49 contratos e reload
reabre o salvo. Sem overflow/pageerror nos seis cenários.

Conflito é alteração direta fictícia do storage enquanto o form está aberto,
não corrida simultânea entre processos. Não comprova exclusão mútua entre abas,
segurança de servidor, dispositivos físicos ou recuperação de disco real.
CI remoto/publicação permanecem sob o coordenador, não executados por este lote.
