import { Grid } from './engine.js';
import { parseRLE, boundingBox } from './rle.js';
import { CATEGORIES, PATTERNS, speedLabel } from './patterns.js';
import { thumbLayout } from './thumb.js';

const COLS = 120;
const ROWS = 80;

export function mountGameOfLife(root) {
  root.innerHTML = `
    <section class="intro">
      <h1>Gra w życie</h1>
      <p>Automat komórkowy Johna Hortona Conwaya z 1970 roku. Martwa komórka z dokładnie 3 żywymi sąsiadami
      ożywa, żywa z 2 lub 3 sąsiadami przeżywa, każda inna umiera. Zapis reguły: <strong>B3/S23</strong>.
      Plansza jest zawinięta w torus: prawa krawędź sąsiaduje z lewą, górna z dolną.</p>
    </section>

    <section class="lab">
      <div class="board-wrap">
        <canvas class="board" aria-label="Plansza Gry w życie"></canvas>
      </div>
      <div class="controls">
        <button data-act="play" class="primary">Start</button>
        <button data-act="step">Krok</button>
        <button data-act="random">Losowo</button>
        <button data-act="clear">Wyczyść</button>
        <label class="speed">Prędkość
          <input type="range" min="1" max="60" value="12" data-speed>
          <output data-speed-out>12/s</output>
        </label>
      </div>
      <div class="stats">
        <span>Pokolenie <b data-gen>0</b></span>
        <span>Żywe komórki <b data-pop>0</b></span>
        <span class="loaded" data-loaded></span>
      </div>
      <p class="hint">Kliknij lub przeciągnij po planszy, żeby rysować. Przeciąganie od żywej komórki ściera.</p>
    </section>

    <section class="zoo">
      <h2>Zoo</h2>
      <p class="zoo-lead">Struktury, które wyłaniają się z reguły B3/S23. Najedź na kartę, żeby zobaczyć ruch;
      kliknij „Na planszę”, żeby wczytać wzór.</p>
      <div class="filters" role="tablist"></div>
      <div class="categories"></div>
    </section>
  `;

  const canvas = root.querySelector('.board');
  const ctx = canvas.getContext('2d');
  const grid = new Grid(COLS, ROWS);
  const $ = (sel) => root.querySelector(sel);
  const playBtn = $('[data-act="play"]');

  let running = false;
  let speed = 12;
  let last = 0;
  let acc = 0;
  let raf = 0;
  let cell = 6;

  const colors = () => {
    const cs = getComputedStyle(document.documentElement);
    return {
      bg: cs.getPropertyValue('--board-bg').trim(),
      grid: cs.getPropertyValue('--board-grid').trim(),
      live: cs.getPropertyValue('--live').trim(),
    };
  };

  function resize() {
    const w = canvas.parentElement.clientWidth;
    // Plansza mieści się w szerokości i zajmuje najwyżej ~65% wysokości okna.
    cell = Math.max(2, Math.min(Math.floor(w / COLS), Math.floor((window.innerHeight * 0.65) / ROWS)));
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = `${cell * COLS}px`;
    canvas.style.height = `${cell * ROWS}px`;
    canvas.width = cell * COLS * dpr;
    canvas.height = cell * ROWS * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function draw() {
    const c = colors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, cell * COLS, cell * ROWS);
    if (cell >= 5) {
      ctx.fillStyle = c.grid;
      for (let x = 1; x < COLS; x++) ctx.fillRect(x * cell, 0, 1, cell * ROWS);
      for (let y = 1; y < ROWS; y++) ctx.fillRect(0, y * cell, cell * COLS, 1);
    }
    ctx.fillStyle = c.live;
    const gap = cell >= 5 ? 1 : 0;
    for (let y = 0; y < ROWS; y++)
      for (let x = 0; x < COLS; x++)
        if (grid.cells[y * COLS + x]) ctx.fillRect(x * cell + gap, y * cell + gap, cell - gap, cell - gap);
    $('[data-gen]').textContent = grid.generation;
    $('[data-pop]').textContent = grid.population();
  }

  function setRunning(on) {
    running = on;
    playBtn.textContent = on ? 'Pauza' : 'Start';
    if (on) {
      last = performance.now();
      acc = 0;
      raf = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(raf);
    }
  }

  function tick(now) {
    acc += now - last;
    last = now;
    const interval = 1000 / speed;
    let steps = 0;
    while (acc >= interval && steps < 4) {
      grid.step();
      acc -= interval;
      steps++;
    }
    if (steps === 4) acc = 0;
    if (steps) draw();
    if (running) raf = requestAnimationFrame(tick);
  }

  function setLoaded(text) {
    $('[data-loaded]').textContent = text;
  }

  root.querySelector('.controls').addEventListener('click', (e) => {
    const act = e.target.closest('button')?.dataset.act;
    if (!act) return;
    if (act === 'play') setRunning(!running);
    if (act === 'step') { setRunning(false); grid.step(); draw(); }
    if (act === 'random') { grid.randomize(0.3); setLoaded('Losowa zupa (gęstość 30%)'); draw(); }
    if (act === 'clear') { setRunning(false); grid.clear(); setLoaded(''); draw(); }
  });

  const speedInput = $('[data-speed]');
  speedInput.addEventListener('input', () => {
    speed = +speedInput.value;
    $('[data-speed-out]').textContent = `${speed}/s`;
  });

  // Rysowanie: pierwszy dotknięty piksel decyduje, czy rysujemy, czy ścieramy.
  let painting = null;
  function cellAt(e) {
    const r = canvas.getBoundingClientRect();
    return [Math.floor((e.clientX - r.left) / cell), Math.floor((e.clientY - r.top) / cell)];
  }
  canvas.addEventListener('pointerdown', (e) => {
    const [x, y] = cellAt(e);
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return;
    painting = grid.get(x, y) ? 0 : 1;
    grid.set(x, y, painting);
    canvas.setPointerCapture(e.pointerId);
    draw();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (painting === null) return;
    const [x, y] = cellAt(e);
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return;
    if (grid.get(x, y) !== painting) { grid.set(x, y, painting); draw(); }
  });
  const stopPaint = () => { painting = null; };
  canvas.addEventListener('pointerup', stopPaint);
  canvas.addEventListener('pointercancel', stopPaint);

  function loadPattern(p, { scroll = true } = {}) {
    const cells = parseRLE(p.rle);
    const bb = boundingBox(cells);
    setRunning(false);
    grid.clear();
    // Statki startują przy krawędzi przeciwnej do kierunku ruchu, żeby było widać lot.
    let ox = Math.floor((COLS - bb.width) / 2);
    let oy = Math.floor((ROWS - bb.height) / 2);
    if (p.category === 'spaceship') {
      if (p.dx > 0) ox = 8;
      if (p.dx < 0) ox = COLS - bb.width - 8;
      if (p.dy > 0) oy = 8;
      if (p.dy < 0) oy = ROWS - bb.height - 8;
    }
    if (p.category === 'gun') { ox = 6; oy = 6; }
    grid.place(cells, ox, oy);
    setLoaded(`Wczytano: ${p.name}`);
    draw();
    if (scroll) canvas.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  }

  buildZoo(root, loadPattern);

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);
  // Przerysuj planszę przy zmianie motywu (systemowego albo przez data-theme).
  const mq = matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', draw);
  const themeObserver = new MutationObserver(draw);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  loadPattern(PATTERNS.find((p) => p.id === 'gosper-gun'), { scroll: false });

  return () => {
    setRunning(false);
    ro.disconnect();
    mq.removeEventListener('change', draw);
    themeObserver.disconnect();
  };
}

function factsFor(p) {
  const cells = parseRLE(p.rle);
  const bb = boundingBox(cells);
  const facts = [`${cells.length} komórek`, `${bb.width}×${bb.height}`];
  if (p.category === 'still') facts.unshift('okres 1');
  if (p.category === 'oscillator') facts.unshift(`okres ${p.period}`);
  if (p.category === 'spaceship') facts.unshift(`okres ${p.period}`, speedLabel(p));
  if (p.category === 'gun') facts.unshift(`okres ${p.period}`, 'szybowiec co okres');
  return facts;
}

function buildZoo(root, onLoad) {
  const filters = root.querySelector('.filters');
  const container = root.querySelector('.categories');
  const sections = [];

  const allBtn = document.createElement('button');
  allBtn.textContent = `Wszystkie (${PATTERNS.length})`;
  allBtn.setAttribute('aria-pressed', 'true');
  filters.append(allBtn);

  for (const cat of CATEGORIES) {
    const items = PATTERNS.filter((p) => p.category === cat.id);
    const btn = document.createElement('button');
    btn.textContent = `${cat.name} (${items.length})`;
    btn.setAttribute('aria-pressed', 'false');
    btn.dataset.cat = cat.id;
    filters.append(btn);

    const sec = document.createElement('section');
    sec.className = 'category';
    sec.dataset.cat = cat.id;
    sec.innerHTML = `<h3>${cat.name} <span class="en">${cat.en}</span></h3><p class="cat-desc">${cat.description}</p>`;
    const list = document.createElement('div');
    list.className = 'cards';
    for (const p of items) list.append(makeCard(p, onLoad));
    sec.append(list);
    container.append(sec);
    sections.push(sec);
  }

  filters.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    for (const b of filters.children) b.setAttribute('aria-pressed', String(b === btn));
    for (const s of sections) s.hidden = btn.dataset.cat ? s.dataset.cat !== btn.dataset.cat : false;
  });
}

function makeCard(p, onLoad) {
  const card = document.createElement('article');
  card.className = 'card';
  const facts = factsFor(p);
  card.innerHTML = `
    <canvas class="thumb" aria-hidden="true"></canvas>
    <div class="card-body">
      <h4>${p.name}</h4>
      <div class="en">${p.en}</div>
      <ul class="facts">${facts.map((f) => `<li>${f}</li>`).join('')}</ul>
      ${p.note ? `<p class="note">${p.note}</p>` : ''}
      <button class="load">Na planszę</button>
    </div>`;
  card.querySelector('.load').addEventListener('click', () => onLoad(p));
  setupThumb(card, p);
  return card;
}

// Miniatura: mała siatka-torus (rozmiar z thumbLayout); animuje się po najechaniu.
function setupThumb(card, p) {
  const canvas = card.querySelector('.thumb');
  const { cells, cols, rows, ox, oy } = thumbLayout(p);
  const size = 160;
  const cellPx = Math.max(1, Math.floor(size / Math.max(cols, rows)));
  const dpr = window.devicePixelRatio || 1;
  canvas.width = cols * cellPx * dpr;
  canvas.height = rows * cellPx * dpr;
  canvas.style.aspectRatio = `${cols} / ${rows}`;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  let grid;
  const reset = () => {
    grid = new Grid(cols, rows);
    grid.place(cells, ox, oy);
  };
  const draw = () => {
    const cs = getComputedStyle(document.documentElement);
    ctx.fillStyle = cs.getPropertyValue('--board-bg').trim();
    ctx.fillRect(0, 0, cols * cellPx, rows * cellPx);
    ctx.fillStyle = cs.getPropertyValue('--live').trim();
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++)
        if (grid.cells[y * cols + x]) ctx.fillRect(x * cellPx, y * cellPx, cellPx, cellPx);
  };
  reset();
  draw();

  let timer = 0;
  const start = () => {
    if (timer) return;
    timer = setInterval(() => {
      grid.step();
      // Szybowce z działa po okrążeniu małego torusa uderzyłyby w działo, więc wracamy do startu.
      if (p.category === 'gun' && grid.generation > 3 * rows) reset();
      draw();
    }, p.period >= 30 ? 40 : 120);
  };
  const stop = () => { clearInterval(timer); timer = 0; reset(); draw(); };
  card.addEventListener('pointerenter', start);
  card.addEventListener('pointerleave', stop);
  card.addEventListener('focusin', start);
  card.addEventListener('focusout', stop);
}
