// Kod apgcode: zapis obiektu używany przez apgsearch i Catagolue, np. xs4_33 (blok),
// xp2_7 (migacz), xq4_153 (szybowiec). Prefiks: xs<liczba komórek> dla martwych natur,
// xp<okres> dla oscylatorów, xq<okres> dla statków. Po podkreślniku jest rozszerzony
// kod Wechslera kształtu: paski po 5 wierszy, każda kolumna paska to jeden znak 0–v
// (bit 0 = górny wiersz), paski rozdziela „z”, a ciągi zer skraca się do w (00),
// x (000) i y<znak> (4–35 zer). Spośród wszystkich faz i 8 orientacji wybiera się
// kod najkrótszy, a przy równej długości najmniejszy alfabetycznie.
import { Grid } from './engine.js';

const CH = '0123456789abcdefghijklmnopqrstuv';

function orientations(cells) {
  const out = [];
  for (let t = 0; t < 8; t++) {
    const pts = cells.map(([x, y]) => {
      if (t & 1) x = -x;
      if (t & 2) y = -y;
      return t & 4 ? [y, x] : [x, y];
    });
    const mx = Math.min(...pts.map((p) => p[0]));
    const my = Math.min(...pts.map((p) => p[1]));
    out.push(pts.map(([x, y]) => [x - mx, y - my]));
  }
  return out;
}

function compressZeros(s) {
  return s.replace(/0+/g, (run) => {
    let n = run.length;
    let out = '';
    while (n >= 4) {
      const k = Math.min(n, 39);
      out += 'y' + CH[k - 4];
      n -= k;
    }
    if (n === 3) out += 'x';
    else if (n === 2) out += 'w';
    else if (n === 1) out += '0';
    return out;
  });
}

// Kształt (komórki z min x = min y = 0) → rozszerzony kod Wechslera.
export function wechsler(cells) {
  const w = Math.max(...cells.map((c) => c[0])) + 1;
  const h = Math.max(...cells.map((c) => c[1])) + 1;
  const live = new Set(cells.map(([x, y]) => `${x},${y}`));
  const strips = [];
  for (let s = 0; s < Math.ceil(h / 5); s++) {
    let cols = '';
    for (let x = 0; x < w; x++) {
      let v = 0;
      for (let b = 0; b < 5; b++) if (live.has(`${x},${s * 5 + b}`)) v |= 1 << b;
      cols += CH[v];
    }
    strips.push(compressZeros(cols.replace(/0+$/, '')));
  }
  return strips.join('z');
}

export function decodeWechsler(code) {
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
        if (v < 0) throw new Error(`Niepoprawny znak „${ch}” w kodzie Wechslera`);
        for (let b = 0; b < 5; b++) if ((v >> b) & 1) cells.push([x, si * 5 + b]);
        x++;
      }
    }
  });
  return cells;
}

function better(a, b) {
  return b === null || a.length < b.length || (a.length === b.length && a < b);
}

// Fazy wzoru na nieograniczonej płaszczyźnie (wystarczająco duża siatka z marginesem).
function phases(cells, period) {
  const w = Math.max(...cells.map((c) => c[0])) + 1;
  const h = Math.max(...cells.map((c) => c[1])) + 1;
  const pad = period + 4;
  const g = new Grid(w + 2 * pad, h + 2 * pad);
  g.place(cells, pad, pad);
  const out = [cells];
  for (let t = 1; t < period; t++) {
    g.step();
    out.push(g.liveCells());
  }
  return out;
}

// apgcode dla martwej natury, oscylatora lub statku; null dla dział.
export function apgcode(p, cells) {
  const prefix = { still: `xs${cells.length}`, oscillator: `xp${p.period}`, spaceship: `xq${p.period}` }[p.category];
  if (!prefix) return null;
  let best = null;
  for (const phase of phases(cells, p.period || 1))
    for (const o of orientations(phase)) {
      const code = wechsler(o);
      if (better(code, best)) best = code;
    }
  return `${prefix}_${best}`;
}
