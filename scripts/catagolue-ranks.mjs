// Dopasowuje wzory z zoo do spisu Catagolue (b3s23, symetria C1) i zapisuje
// lib/game-of-life/catagolue.json: kod apgcode, liczbę wystąpień i miejsce w rankingu.
//
// Spis pobiera się z https://catagolue.hatsya.com/textcensus/b3s23/C1
// (leży na gałęzi data/catagolue jako data/catagolue-b3s23-C1.csv, ok. 15 MB).
// Użycie: node scripts/catagolue-ranks.mjs ścieżka/do/catagolue-b3s23-C1.csv
import { readFileSync, writeFileSync } from 'node:fs';
import { PATTERNS } from '../lib/game-of-life/patterns.js';
import { parseRLE } from '../lib/game-of-life/rle.js';

const csvPath = process.argv[2];
if (!csvPath) {
  console.error('Podaj ścieżkę do pliku CSV ze spisem Catagolue.');
  process.exit(1);
}

const key = (x, y) => `${x},${y}`;
function step(cells) {
  const live = new Set(cells.map(([x, y]) => key(x, y)));
  const counts = new Map();
  for (const [x, y] of cells)
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        if (dx || dy) counts.set(key(x + dx, y + dy), (counts.get(key(x + dx, y + dy)) || 0) + 1);
      }
  const out = [];
  for (const [k, n] of counts) if (n === 3 || (n === 2 && live.has(k))) out.push(k.split(',').map(Number));
  return out;
}

// Kształt niezależny od położenia, obrotu i odbicia: najmniejsza z 8 orientacji.
function canon(cells) {
  let best = null;
  for (let t = 0; t < 8; t++) {
    const pts = cells.map(([x, y]) => {
      if (t & 1) x = -x;
      if (t & 2) y = -y;
      return t & 4 ? [y, x] : [x, y];
    });
    const mx = Math.min(...pts.map((p) => p[0])), my = Math.min(...pts.map((p) => p[1]));
    const s = pts.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).join(';');
    if (best === null || s < best) best = s;
  }
  return best;
}

// Dekoder rozszerzonego kodu Wechslera (część apgcode po podkreślniku).
const CH = '0123456789abcdefghijklmnopqrstuv';
function decode(code) {
  const cells = [];
  code.split('z').forEach((strip, si) => {
    let x = 0;
    for (let i = 0; i < strip.length; i++) {
      const ch = strip[i];
      if (ch === 'w') x += 2;
      else if (ch === 'x') x += 3;
      else if (ch === 'y') x += 4 + CH.indexOf(strip[++i]);
      else {
        const v = CH.indexOf(ch);
        if (v < 0) throw new Error(`znak ${ch}`);
        for (let b = 0; b < 5; b++) if ((v >> b) & 1) cells.push([x, si * 5 + b]);
        x++;
      }
    }
  });
  return cells;
}

// Wszystkie fazy każdego wzoru (dla oscylatorów i statków), żeby trafić w fazę z apgcode.
const lookup = new Map();
for (const p of PATTERNS) {
  if (p.category === 'gun') continue;
  let cells = parseRLE(p.rle);
  for (let t = 0; t < (p.period || 1); t++) {
    const k = canon(cells);
    if (!lookup.has(k)) lookup.set(k, p.id);
    cells = step(cells);
  }
}

const rows = [];
for (const line of readFileSync(csvPath, 'utf8').split('\n')) {
  const m = /^"(x[spq]\d+)_([^"]+)","(\d+)"$/.exec(line.trim());
  if (m) rows.push({ apgcode: `${m[1]}_${m[2]}`, body: m[2], occurrences: Number(m[3]) });
}
// Ranking wśród obiektów xs/xp/xq (martwe natury, oscylatory, statki).
rows.sort((a, b) => b.occurrences - a.occurrences);

const result = {};
rows.forEach((r, i) => {
  let cells;
  try { cells = decode(r.body); } catch { return; }
  const id = lookup.get(canon(cells));
  if (id && !result[id]) result[id] = { apgcode: r.apgcode, occurrences: r.occurrences, rank: i + 1 };
});

const out = {
  source: 'https://catagolue.hatsya.com/census/b3s23/C1',
  objects: rows.length,
  patterns: result,
};
writeFileSync('lib/game-of-life/catagolue.json', JSON.stringify(out, null, 2) + '\n');
const missing = PATTERNS.filter((p) => !result[p.id]).map((p) => p.id);
console.log(`Dopasowano ${Object.keys(result).length} z ${PATTERNS.length} wzorów. Brak w spisie: ${missing.join(', ')}`);
