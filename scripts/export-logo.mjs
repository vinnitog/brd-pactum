// Exporta os assets finais em PNG a partir dos SVGs mestres em public/brand.
// Uso (one-off, nao faz parte do build do app):
//   npm i --no-save @resvg/resvg-js
//   node scripts/export-logo.mjs
// Os PNGs sao versionados em public/brand/png; rode este script quando
// alterar os SVGs mestres para regerar os assets.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const brandDir = join(root, 'public', 'brand')
const outDir = join(brandDir, 'png')
const fontDir = join(root, 'public', 'fonts')

mkdirSync(outDir, { recursive: true })

// [arquivo svg, largura em px, nome base do png]
const targets = [
  ['brd-pactum-logo-ondark.svg', 872, 'brd-pactum-logo-ondark-872'],
  ['brd-pactum-logo-ondark.svg', 1744, 'brd-pactum-logo-ondark-1744'],
  ['brd-pactum-logo.svg', 1440, 'brd-pactum-logo-1440'],
  ['brd-pactum-mark.svg', 512, 'brd-pactum-mark-512'],
  ['brd-pactum-mark.svg', 1024, 'brd-pactum-mark-1024']
]

for (const [svgFile, width, outName] of targets) {
  const svg = readFileSync(join(brandDir, svgFile), 'utf8')
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: { fontDirs: [fontDir], defaultFontFamily: 'DM Sans', loadSystemFonts: false }
  })
  const png = resvg.render().asPng()
  const outPath = join(outDir, `${outName}.png`)
  writeFileSync(outPath, png)
  console.log(`ok ${outName}.png (${width}px, ${png.length} bytes)`)
}
