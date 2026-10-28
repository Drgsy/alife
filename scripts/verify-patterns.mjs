// Sprawdza symulacją, że każdy wzór w zoo zachowuje się tak, jak opisuje katalog:
// martwe natury się nie zmieniają, oscylatory mają podany okres (i żadnego krótszego),
// statki odtwarzają się przesunięte o (dx, dy) po podanym okresie,
// a działa wracają do siebie co okres i wypuszczają jeden szybowiec na okres.
import { PATTERNS, CATEGORIES } from '../lib/game-of-life/patterns.js';
import { parseRLE } from '../lib/game-of-life/rle.js';
import { Grid } from '../lib/game-of-life/engine.js';
import { thumbLayout } from '../lib/game-of-life/thumb.js';

const key = (x, y) => `${x},${y}`;

// Nieograniczona płaszczyzna (zbiór żywych komórek), reguła B3/S23.
function step(live) {
  const counts = new Map();
  for (const k of live) {
    const [x, y] = k.split(',').map(Number);
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const kk = key(x + dx, y + dy);
        counts.set(kk, (counts.get(kk) || 0) + 1);
      }
  }
  const out = new Set();
  for (const [k, n] of counts) if (n === 3 || (n === 2 && live.has(k))) out.add(k);
  return out;
}

const toSet = (cells) => new Set(cells.map(([x, y]) => key(x, y)));
const same = (a, b) => a.size === b.size && [...a].every((k) => b.has(k));
const shift = (s, dx, dy) =>
  new Set([...s].map((k) => { const [x, y] = k.split(',').map(Number); return key(x + dx, y + dy); }));
const mirrorY = (s) =>
  new Set([...s].map((k) => { const [x, y] = k.split(',').map(Number); return key(x, -y); }));
function normalize(s) {
  let mx = Infinity, my = Infinity;
  for (const k of s) { const [x, y] = k.split(',').map(Number); mx = Math.min(mx, x); my = Math.min(my, y); }
  return { set: shift(s, -mx, -my), mx, my };
}
function run(s, n) { for (let i = 0; i < n; i++) s = step(s); return s; }
function within(s, box) {
  return new Set([...s].filter((k) => {
    const [x, y] = k.split(',').map(Number);
    return x >= box.x0 && x <= box.x1 && y >= box.y0 && y <= box.y1;
  }));
}

let failures = 0;
const fail = (p, msg) => { failures++; console.log(`  BŁĄD  ${p.id}: ${msg}`); };

for (const p of PATTERNS) {
  if (!CATEGORIES.some((c) => c.id === p.category)) fail(p, `nieznana kategoria ${p.category}`);
  const s0 = toSet(parseRLE(p.rle));
  if (p.category === 'still') {
    if (!same(step(s0), s0)) fail(p, 'zmienia się po 1 pokoleniu');
  } else if (p.category === 'oscillator') {
    let s = s0;
    for (let t = 1; t <= p.period; t++) {
      s = step(s);
      if (same(s, s0) && t < p.period) fail(p, `ma krótszy okres ${t}`);
    }
    if (!same(s, s0)) fail(p, `nie wraca po ${p.period} pokoleniach`);
  } else if (p.category === 'spaceship') {
    const a = normalize(s0);
    let s = s0;
    for (let t = 1; t <= p.period; t++) {
      s = step(s);
      const b = normalize(s);
      if (same(a.set, b.set) && t < p.period) fail(p, `odtwarza się już po ${t}`);
      if (t === p.period) {
        if (!same(a.set, b.set)) fail(p, `nie odtwarza kształtu po ${p.period}`);
        else if (b.mx - a.mx !== p.dx || b.my - a.my !== p.dy)
          fail(p, `przesunięcie (${b.mx - a.mx}, ${b.my - a.my}) zamiast (${p.dx}, ${p.dy})`);
      }
    }
  } else if (p.category === 'gun') {
    // Rozgrzewka, potem porównanie obszaru działa i przyrostu populacji co okres.
    const cells = parseRLE(p.rle);
    const xs = cells.map((c) => c[0]), ys = cells.map((c) => c[1]);
    const box = { x0: Math.min(...xs) - 2, x1: Math.max(...xs) + 2, y0: Math.min(...ys) - 2, y1: Math.max(...ys) + 2 };
    let s = run(s0, p.period * 2);
    const pops = [];
    let prev = within(s, box);
    for (let k = 0; k < 3; k++) {
      s = run(s, p.period);
      const cur = within(s, box);
      pops.push(s.size);
      if (!same(cur, prev)) fail(p, `obszar działa nie powtarza się co ${p.period}`);
      prev = cur;
    }
    const growth = [pops[1] - pops[0], pops[2] - pops[1]];
    if (growth.some((g) => g !== 5)) fail(p, `przyrost populacji na okres ${growth} zamiast 5 (jeden szybowiec)`);
  }
  if (p.check === 'mirror-half') {
    const half = run(s0, p.period / 2);
    if (!same(normalize(half).set, normalize(mirrorY(s0)).set)) fail(p, 'w połowie okresu nie jest odbiciem pionowym');
  }
}

// Miniatury to mały torus: martwe natury i oscylatory muszą się tam zachowywać
// tak samo jak na nieograniczonej płaszczyźnie (nie mogą dotknąć siebie przez brzeg).
for (const p of PATTERNS) {
  if (p.category !== 'still' && p.category !== 'oscillator') continue;
  const { cells, cols, rows, ox, oy } = thumbLayout(p);
  const g = new Grid(cols, rows);
  g.place(cells, ox, oy);
  const start = g.cells.slice();
  const period = p.period || 1;
  for (let k = 1; k <= 4; k++) {
    for (let i = 0; i < period; i++) g.step();
    if (!g.cells.every((v, i) => v === start[i])) { fail(p, `miniatura ${cols}×${rows} psuje wzór (po ${k * period} pokoleniach)`); break; }
  }
}

console.log(failures === 0 ? `OK: wszystkie wzory (${PATTERNS.length}) zgodne z katalogiem.` : `${failures} błędów.`);
process.exit(failures === 0 ? 0 : 1);
