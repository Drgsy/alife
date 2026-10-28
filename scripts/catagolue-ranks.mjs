// Dopasowuje wzory z zoo (po kodzie apgcode) do spisu Catagolue (b3s23, symetria C1) i zapisuje
// lib/game-of-life/catagolue.json: kod apgcode, liczbę wystąpień i miejsce w rankingu.
//
// Spis pobiera się z https://catagolue.hatsya.com/textcensus/b3s23/C1
// (leży na gałęzi data/catagolue jako data/catagolue-b3s23-C1.csv, ok. 15 MB).
// Użycie: node scripts/catagolue-ranks.mjs ścieżka/do/catagolue-b3s23-C1.csv
import { readFileSync, writeFileSync } from 'node:fs';
import { PATTERNS } from '../lib/game-of-life/patterns.js';
import { parseRLE } from '../lib/game-of-life/rle.js';
import { apgcode } from '../lib/game-of-life/apgcode.js';

const csvPath = process.argv[2];
if (!csvPath) {
  console.error('Podaj ścieżkę do pliku CSV ze spisem Catagolue.');
  process.exit(1);
}

// Kod apgcode każdego wzoru liczymy sami (lib/game-of-life/apgcode.js), więc
// dopasowanie do spisu to zwykłe porównanie kodów.
const byCode = new Map();
for (const p of PATTERNS) {
  const code = apgcode(p, parseRLE(p.rle));
  if (code) byCode.set(code, p.id);
}

const rows = [];
for (const line of readFileSync(csvPath, 'utf8').split('\n')) {
  const m = /^"(x[spq]\d+)_([^"]+)","(\d+)"$/.exec(line.trim());
  if (m) rows.push({ apgcode: `${m[1]}_${m[2]}`, occurrences: Number(m[3]) });
}
// Ranking wśród obiektów xs/xp/xq (martwe natury, oscylatory, statki).
rows.sort((a, b) => b.occurrences - a.occurrences);

const result = {};
rows.forEach((r, i) => {
  const id = byCode.get(r.apgcode);
  if (id) result[id] = { apgcode: r.apgcode, occurrences: r.occurrences, rank: i + 1 };
});

const out = {
  source: 'https://catagolue.hatsya.com/census/b3s23/C1',
  objects: rows.length,
  total: rows.reduce((sum, r) => sum + r.occurrences, 0),
  patterns: result,
};
writeFileSync('lib/game-of-life/catagolue.json', JSON.stringify(out, null, 2) + '\n');
const missing = PATTERNS.filter((p) => !result[p.id]).map((p) => p.id);
console.log(`Dopasowano ${Object.keys(result).length} z ${PATTERNS.length} wzorów. Brak w spisie: ${missing.join(', ')}`);
