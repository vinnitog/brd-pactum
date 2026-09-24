# BRD pactum

**Serviços + gerenciamento de contratos** para o escritório BRD — clientes e
fornecedores, elaboração e gerenciamento de contratos, agenda de vencimentos com
lembretes e dashboard de indicadores.

Segue a identidade visual do escritório (roxo `#964AFB`, tema escuro, fonte DM
Sans) e o padrão de UX do **BRD Assistant** (tela inicial "Olá, fulano.").

## Rodar

```powershell
npm install
npm run dev      # http://localhost:5174
npm test         # testes de lógica (permissões, lembrete, taxonomia)
npm run build    # build de produção
```

## Publicação no GitHub Pages

URL: [BRD Pactum](https://vinnitog.github.io/brd-pactum/).

O workflow `pages.yml` testa e compila os PRs para `main`. Após o merge em
`main`, publica automaticamente a pasta `dist` usando GitHub Actions.
O repositório deve ter Pages configurado com a origem **GitHub Actions**.

```powershell
npm.cmd run build:pages
```

Esse build usa a base `/brd-pactum/` e rotas com fragmento, por exemplo
`/brd-pactum/#/agenda`, para permitir abrir links e atualizar páginas sem 404.
O desenvolvimento local mantém suas URLs atuais. A publicação é uma demonstração:
autenticação real e dados compartilhados via Supabase ainda não estão integrados;
os dados permanecem no localStorage de cada navegador.

## Funcionalidades

- **Login diferenciado** — advogados BRD veem todos os cadastros; cada cliente
  vê apenas o próprio (contas de demonstração na tela de login).
- **Clientes / Fornecedores** — cadastro PF/PJ (com representante legal para PJ),
  busca e ficha com abas **Contratos** e **Agenda**.
- **Contratos**
  - _Elaboração_: classificação (tipo → subtipo, taxonomia completa da
    especificação) → qualificação das partes, valor/parcelas/pagamento,
    atualização monetária, prazo, multa, objeto, comunicação → **Gerar** →
    tela de **revisão** da minuta antes de salvar.
  - _Cadastro de gerenciamento_: qualificação, vencimentos com nível de
    urgência, valores e testemunhas (para fornecedores ou contratos manuais).
- **Agenda** — calendário mensal e lista, vencimentos com semáforo de urgência
  (🔴 alta / 🟡 média / 🟢 baixa) e geração do **texto de lembrete** ao cliente.
- **Dashboard** — gráficos de rosca: contratos ativos/inativos, valores,
  prazos (semana / mês / 6 meses / anos) e valor por classificação.

## Arquitetura

- **React + Vite + Tailwind** (identidade em `tailwind.config.js` e
  `src/styles/index.css`).
- Camada de dados **local-first** em `src/lib/store.js` (localStorage) por trás
  de uma API de serviços — toda a persistência está isolada nesse arquivo, o que
  permite trocar por **Supabase** na próxima fase sem mexer nas telas.
- Regras de acesso em `src/lib/permissions.js`; taxonomia em
  `src/lib/contractTypes.js`; modelo de lembrete em `src/lib/reminderTemplate.js`.

## Próxima fase (Supabase)

Substituir `src/lib/store.js` por chamadas ao Supabase (auth real + tabelas
`parties`, `contracts`, `events` com RLS por papel), reaproveitando as mesmas
assinaturas de função. Mantido fora do escopo inicial por depender de credenciais.
