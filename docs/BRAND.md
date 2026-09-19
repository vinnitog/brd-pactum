# Identidade visual — BRD pactum

Logo do **BRD pactum**, adaptado da marca do escritório BRD (decisão dos sócios:
adaptação da logo BRD existente; estilo moderno e sofisticado; aprovação final de
Luís e Letícia).

## Elementos

- **Marca (símbolo):** tile escuro (`#0B0911`) com o "B" gráfico em roxo da marca
  (`#964AFB`).
- **Wordmark:** `BRD pactum` — "B" em roxo, "RD" em branco bold, "pactum." em
  itálico. Fonte **DM Sans**.
- **Cores:** roxo da marca `#964AFB`, fundo escuro `#0B0911`, texto branco.

## Arquivos

Fontes vetoriais (mestres) em `public/brand/`:

| Arquivo | Uso |
| --- | --- |
| `brd-pactum-logo.svg` | Lockup completo, fundo transparente (uso sobre superfícies escuras no app). |
| `brd-pactum-logo-ondark.svg` | Lockup completo sobre fundo escuro da marca (legível isolado, para documentos). |
| `brd-pactum-mark.svg` | Apenas o símbolo (ícone). |

Assets finais em **PNG** (`public/brand/png/`), formato pedido pelos sócios:

| Arquivo | Conteúdo |
| --- | --- |
| `brd-pactum-logo-ondark-872.png` / `-1744.png` | Lockup completo sobre fundo escuro (1x / 2x). |
| `brd-pactum-logo-1440.png` | Lockup completo, fundo transparente. |
| `brd-pactum-mark-512.png` / `-1024.png` | Símbolo isolado. |

A logo é aplicada na **tela inicial** (login) e no cabeçalho via o componente
React `src/components/Logo.jsx`, que usa a mesma geometria dos SVGs mestres.

## Regenerar os PNGs

Os PNGs são exportados dos SVGs mestres. Ao alterar um SVG, regenere:

```bash
npm i --no-save @resvg/resvg-js
node scripts/export-logo.mjs
```

O script usa as fontes DM Sans de `public/fonts`. A dependência de rasterização
é instalada só para o export (não faz parte do build do app).
