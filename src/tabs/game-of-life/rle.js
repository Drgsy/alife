// Parser formatu RLE (Run Length Encoded), standardowego zapisu wzorów
// używanego m.in. przez Golly i LifeWiki. Zwraca listę żywych komórek [x, y].
export function parseRLE(text) {
  const body = text
    .split('\n')
    .filter((line) => !line.startsWith('#') && !/^\s*x\s*=/.test(line))
    .join('');
  const cells = [];
  let x = 0;
  let y = 0;
  let count = '';
  for (const ch of body) {
    if (ch >= '0' && ch <= '9') {
      count += ch;
      continue;
    }
    const n = count === '' ? 1 : parseInt(count, 10);
    count = '';
    if (ch === 'b' || ch === '.') {
      x += n;
    } else if (ch === 'o' || ch === 'A') {
      for (let i = 0; i < n; i++) cells.push([x + i, y]);
      x += n;
    } else if (ch === '$') {
      y += n;
      x = 0;
    } else if (ch === '!') {
      break;
    }
  }
  return cells;
}

export function boundingBox(cells) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of cells) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  if (cells.length === 0) return { minX: 0, minY: 0, width: 0, height: 0 };
  return { minX, minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}
