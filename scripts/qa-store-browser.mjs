// Real UI/store with synthetic localStorage. Every external/service request is blocked.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import react from '@vitejs/plugin-react'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const root = fileURLToPath(new URL('../', import.meta.url))
const KEY = 'brd-pactum:v1'
const snapshot = JSON.stringify({
  parties: Array.from({ length: 1000 }, (_, i) => ({ id: `large-${i}`, name: `Pessoa QA ${i}`, personType: 'PF', kind: 'cliente' })),
  contracts: Array.from({ length: 49 }, (_, i) => ({ id: `contract-${i}`, partyId: 'large-0', titulo: `Contrato QA ${i}`, tipo: 'Prestação de Serviços', status: 'ativo', source: 'elaboracao', generatedText: '' })),
  events: [], reminders: [],
})
const server = await createServer({ root, configFile: false, envFile: false, plugins: [react()], server: { host: '127.0.0.1', port: 0, open: false } })
let browser
try {
  await server.listen()
  const base = `http://127.0.0.1:${server.httpServer.address().port}`
  browser = await chromium.launch({ headless: true, channel: process.env.E2E_BROWSER_CHANNEL || 'msedge' })
  for (const width of [1440, 390]) {
    for (const role of ['advogado', 'estagiario', 'cliente']) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block' })
      const user = { id: 'fictional-user', name: 'Pessoa QA', role, partyId: role === 'cliente' ? 'large-999' : undefined }
      await context.addInitScript(({ snapshot, user }) => {
        if (localStorage.getItem('brd-pactum:v1') === null) localStorage.setItem('brd-pactum:v1', snapshot)
        localStorage.setItem('brd-pactum:auth', JSON.stringify(user))
      }, { snapshot, user })
      await context.route('**/*', route => {
        const request = route.request()
        return new URL(request.url()).origin === base && ['GET', 'HEAD'].includes(request.method()) ? route.continue() : route.abort()
      })
      const page = await context.newPage()
      page.setDefaultTimeout(8000)
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      await page.goto(`${base}/clientes`)
      await page.getByRole('searchbox').waitFor()
      assert.equal(await page.locator('h2').count(), role === 'cliente' ? 1 : 24)
      if (role !== 'cliente') {
        await page.getByRole('button', { name: 'Próxima página', exact: true }).click()
        await page.getByRole('link', { name: /^Pessoa QA 24 / }).waitFor()
      }
      await page.getByRole('searchbox').fill('Pessoa QA 999')
      await page.getByRole('link', { name: /^Pessoa QA 999 / }).waitFor()
      assert.equal(await page.locator('h2').count(), 1)
      assert.equal(await page.evaluate(KEY => localStorage.getItem(KEY), KEY), snapshot)
      if (role === 'cliente') {
        await page.goto(`${base}/parte/large-0`)
        await page.getByText('Você não tem acesso a este cadastro.', { exact: true }).waitFor()
        assert.equal(await page.locator('h3').count(), 0)
      } else {
        await page.goto(`${base}/parte/large-0`)
        await page.getByText('Contrato QA 0', { exact: true }).waitFor()
        assert.equal(await page.getByRole('button', { name: /Ver detalhes/ }).count(), 24)
        await page.getByRole('button', { name: 'Próxima página', exact: true }).click()
        await page.getByRole('button', { name: 'Próxima página', exact: true }).click()
        await page.getByText('Contrato QA 48', { exact: true }).waitFor()
        assert.equal(await page.getByRole('button', { name: /Ver detalhes/ }).count(), 1)
      }
      if (role === 'advogado') {
        await page.goto(`${base}/clientes`)
        await page.getByRole('button', { name: '+ Novo cliente', exact: true }).click()
        await page.getByLabel('Nome completo', { exact: true }).fill('Cadastro Novo QA')
        await page.evaluate(() => {
          const native = Storage.prototype.setItem
          window.fixtureRestoreStorage = () => { Storage.prototype.setItem = native }
          Storage.prototype.setItem = function (key, value) { if (key === 'brd-pactum:v1') throw new DOMException('fixture quota', 'QuotaExceededError'); return native.call(this, key, value) }
        })
        await page.getByRole('button', { name: 'Salvar', exact: true }).click()
        await page.getByRole('alert').waitFor()
        assert.equal(await page.getByLabel('Nome completo', { exact: true }).inputValue(), 'Cadastro Novo QA')
        assert.equal(await page.evaluate(KEY => localStorage.getItem(KEY), KEY), snapshot)
        await page.evaluate(() => window.fixtureRestoreStorage())
        // Simulate a second-tab edit; commit must not overwrite it.
        await page.evaluate(KEY => { const data = JSON.parse(localStorage.getItem(KEY)); data.parties[0].name = 'Editado em outra aba QA'; localStorage.setItem(KEY, JSON.stringify(data)) }, KEY)
        await page.getByRole('button', { name: 'Salvar', exact: true }).click()
        await page.getByRole('alert').filter({ hasText: 'outra aba' }).waitFor()
        assert.equal(await page.getByLabel('Nome completo', { exact: true }).inputValue(), 'Cadastro Novo QA')
        await page.getByRole('dialog').getByRole('button', { name: 'Reler dados salvos', exact: true }).click()
        await page.getByRole('button', { name: 'Salvar', exact: true }).click()
        await page.getByRole('heading', { name: 'Cadastro Novo QA', exact: true }).waitFor()
        await page.reload()
        await page.getByRole('heading', { name: 'Cadastro Novo QA', exact: true }).waitFor()
        const saved = await page.evaluate(KEY => JSON.parse(localStorage.getItem(KEY)), KEY)
        assert.equal(saved.parties.length, 1001)
        assert.equal(saved.parties[0].name, 'Editado em outra aba QA')
        assert.equal(saved.parties.filter(item => item.name === 'Cadastro Novo QA').length, 1)
        assert.equal(saved.contracts.length, 49)
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
      assert.deepEqual(errors, [])
      await context.close()
      console.log(`PASS ${width}px/${role}: full search, pagination/privacy, local snapshot${role === 'advogado' ? ',quota/conflict/reload' : ''}`)
    }
  }
} finally { await browser?.close(); await server.close() }
