// Składa aplikację w jeden samodzielny plik HTML (dist/alife.html), który można
// opublikować jako artefakt Claude. Moduły są łączone w kolejności zależności,
// a instrukcje import/export usuwane, bo w jednym skrypcie nie są potrzebne.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const MODULES = [
  'src/tabs/game-of-life/rle.js',
  'src/tabs/game-of-life/engine.js',
  'src/tabs/game-of-life/patterns.js',
  'src/tabs/game-of-life/index.js',
  'src/main.js',
];

const js = MODULES.map((f) => {
  const src = readFileSync(f, 'utf8')
    .replace(/^import[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '')
    .replace(/^export\s+(?=(function|class|const|let|async))/gm, '');
  return `// ---- ${f}\n${src}`;
}).join('\n');

const css = readFileSync('src/styles.css', 'utf8');
const html = readFileSync('index.html', 'utf8');
const fonts = html.match(/<link rel="stylesheet" href="https:\/\/fonts[^>]+>/)[0];
const body = html.slice(html.indexOf('<body>') + 6, html.indexOf('</body>'))
  .replace(/<script[^>]*src=[^>]*><\/script>/, '')
  .trim();

const out = `<title>ALife</title>
<meta name="claude:viewport-fit-sides" content="cover">
${fonts}
<style>
${css}</style>
${body}
<script>
(() => {
${js}
})();
</script>
`;
mkdirSync('dist', { recursive: true });
writeFileSync('dist/alife.html', out);
console.log(`dist/alife.html: ${(out.length / 1024).toFixed(1)} KB`);
