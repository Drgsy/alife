// Silnik automatu komórkowego typu B/S (zewnętrznie totalistycznego)
// z sąsiedztwem Moore'a na siatce zawiniętej w torus.
// Reguła jest parametrem, więc ten sam silnik obsłuży HighLife, Seeds itd.

export function parseRule(str) {
  const m = /^B([0-8]*)\/S([0-8]*)$/i.exec(str.trim());
  if (!m) throw new Error(`Niepoprawna reguła: ${str}`);
  const birth = new Array(9).fill(false);
  const survive = new Array(9).fill(false);
  for (const d of m[1]) birth[+d] = true;
  for (const d of m[2]) survive[+d] = true;
  return { birth, survive, name: `B${m[1]}/S${m[2]}` };
}

export class Grid {
  constructor(width, height, rule = 'B3/S23') {
    this.width = width;
    this.height = height;
    this.cells = new Uint8Array(width * height);
    this.next = new Uint8Array(width * height);
    this.rule = parseRule(rule);
    this.generation = 0;
  }

  get(x, y) {
    return this.cells[this.index(x, y)];
  }

  set(x, y, v) {
    this.cells[this.index(x, y)] = v ? 1 : 0;
  }

  index(x, y) {
    const w = this.width, h = this.height;
    return (((y % h) + h) % h) * w + (((x % w) + w) % w);
  }

  clear() {
    this.cells.fill(0);
    this.generation = 0;
  }

  randomize(density = 0.3, rand = Math.random) {
    for (let i = 0; i < this.cells.length; i++) this.cells[i] = rand() < density ? 1 : 0;
    this.generation = 0;
  }

  population() {
    let n = 0;
    for (let i = 0; i < this.cells.length; i++) n += this.cells[i];
    return n;
  }

  // Wstawia listę komórek [x, y] z lewym górnym rogiem w (ox, oy).
  place(cells, ox, oy) {
    for (const [x, y] of cells) this.set(ox + x, oy + y, 1);
  }

  liveCells() {
    const out = [];
    for (let y = 0; y < this.height; y++)
      for (let x = 0; x < this.width; x++) if (this.cells[y * this.width + x]) out.push([x, y]);
    return out;
  }

  step() {
    const { width: w, height: h, cells, next } = this;
    const { birth, survive } = this.rule;
    for (let y = 0; y < h; y++) {
      const ym = ((y - 1 + h) % h) * w;
      const y0 = y * w;
      const yp = ((y + 1) % h) * w;
      for (let x = 0; x < w; x++) {
        const xm = (x - 1 + w) % w;
        const xp = (x + 1) % w;
        const n =
          cells[ym + xm] + cells[ym + x] + cells[ym + xp] +
          cells[y0 + xm] + cells[y0 + xp] +
          cells[yp + xm] + cells[yp + x] + cells[yp + xp];
        next[y0 + x] = cells[y0 + x] ? (survive[n] ? 1 : 0) : (birth[n] ? 1 : 0);
      }
    }
    this.cells = next;
    this.next = cells;
    this.generation++;
  }
}
