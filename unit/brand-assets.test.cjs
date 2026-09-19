const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

// Geometria unica do "B" grafico da marca. Todos os assets devem compartilhar
// exatamente este path para a identidade nao divergir entre logo, favicon e PNGs.
const MARK_PATH =
  "M18 14h16.5c6 0 10 3.2 10 8.3 0 3.3-1.9 5.8-5 7 3.8 1 6.1 3.8 6.1 7.6 0 5.6-4.4 9.1-11.2 9.1H18V14zm8.6 6.4v6.5h6.2c2.6 0 4.1-1.2 4.1-3.3s-1.5-3.2-4.1-3.2h-6.2zm0 12.4v6.8h6.7c2.8 0 4.4-1.3 4.4-3.4 0-2.2-1.6-3.4-4.4-3.4h-6.7z";

test("mestres SVG da marca existem e compartilham a mesma geometria", () => {
  const svgMasters = [
    "public/brand/brd-pactum-logo.svg",
    "public/brand/brd-pactum-logo-ondark.svg",
    "public/brand/brd-pactum-mark.svg",
    "public/favicon.svg",
    "src/components/Logo.jsx"
  ];
  for (const file of svgMasters) {
    assert.ok(fs.existsSync(path.join(root, file)), `${file} deve existir`);
    assert.ok(read(file).includes(MARK_PATH), `${file} deve usar a geometria unica da marca`);
  }
});

test("assets finais PNG existem e sao PNG validos", () => {
  const pngs = [
    "public/brand/png/brd-pactum-logo-ondark-872.png",
    "public/brand/png/brd-pactum-logo-ondark-1744.png",
    "public/brand/png/brd-pactum-logo-1440.png",
    "public/brand/png/brd-pactum-mark-512.png",
    "public/brand/png/brd-pactum-mark-1024.png"
  ];
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  for (const file of pngs) {
    const full = path.join(root, file);
    assert.ok(fs.existsSync(full), `${file} deve existir`);
    const buf = fs.readFileSync(full);
    assert.ok(buf.length > 1000, `${file} nao pode ser um PNG vazio`);
    assert.ok(buf.subarray(0, 8).equals(signature), `${file} deve ter assinatura PNG valida`);
  }
});

test("cor da marca (#964AFB) esta presente nos mestres da logo", () => {
  for (const file of ["public/brand/brd-pactum-logo.svg", "public/brand/brd-pactum-mark.svg"]) {
    assert.match(read(file), /#964AFB/i);
  }
});
