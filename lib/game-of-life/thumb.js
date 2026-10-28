import { Grid } from './engine.js';
import { parseRLE, boundingBox } from './rle.js';

// Rozmiar i położenie wzoru na miniaturze (mały torus).
// Oscylatory w trakcie okresu wychodzą poza swój stan startowy (np. galaktyka Koka
// rośnie z 9×9 do 13×13), więc liczymy obwiednię wszystkich faz na dużej siatce.
// Margines 2 pustych komórek po każdej stronie gwarantuje, że wzór nie dotknie
// samego siebie przez zawinięte brzegi.
export function thumbLayout(p) {
  const cells = parseRLE(p.rle);
  const bb = boundingBox(cells);

  if (p.category === 'spaceship' || p.category === 'gun') {
    const margin = 12;
    const cols = Math.max(bb.width + margin * 2, 12);
    const rows = Math.max(bb.height + margin * 2, 12);
    const centered = { ox: Math.floor((cols - bb.width) / 2), oy: Math.floor((rows - bb.height) / 2) };
    return { cells, cols, rows, ...(p.category === 'gun' ? { ox: 2, oy: 2 } : centered) };
  }

  const pad = 20;
  const g = new Grid(bb.width + pad * 2, bb.height + pad * 2);
  g.place(cells, pad, pad);
  let minX = pad, minY = pad, maxX = pad + bb.width - 1, maxY = pad + bb.height - 1;
  for (let t = 0; t < (p.period || 1); t++) {
    g.step();
    for (const [x, y] of g.liveCells()) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  const margin = 2;
  const envW = maxX - minX + 1, envH = maxY - minY + 1;
  const cols = Math.max(envW + margin * 2, 12);
  const rows = Math.max(envH + margin * 2, 12);
  // Lewy górny róg obwiedni na środku miniatury, wzór przesunięty o tyle, o ile obwiednia wystaje.
  const ex = Math.floor((cols - envW) / 2), ey = Math.floor((rows - envH) / 2);
  return { cells, cols, rows, ox: ex + (pad - minX), oy: ey + (pad - minY) };
}
