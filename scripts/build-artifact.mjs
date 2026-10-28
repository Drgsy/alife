// Składa podgląd aplikacji w jeden samodzielny plik HTML (dist/alife.html),
// publikowany jako artefakt Claude. Używa tych samych modułów z lib/ co Next.js;
// instrukcje import/export są usuwane, bo w jednym skrypcie nie są potrzebne.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const MODULES = [
  'lib/game-of-life/rle.js',
  'lib/game-of-life/engine.js',
  'lib/game-of-life/patterns.js',
  'lib/game-of-life/mount.js',
  'lib/tabs.js',
];

const strip = (src) =>
  src
    .replace(/^import[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '')
    .replace(/^export\s+(?=(function|class|const|let|async))/gm, '');

const js = MODULES.map((f) => `// ---- ${f}\n${strip(readFileSync(f, 'utf8'))}`).join('\n');
const css = readFileSync('app/globals.css', 'utf8');

const FONTS =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700' +
  '&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;600&display=swap';

const out = `<title>ALife</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="${FONTS.replace(/&/g, '&amp;')}">
<style>
${css}</style>
<header class="site-header">
  <a class="brand" href="#gra-w-zycie">ALife</a>
  <nav class="tabs" id="tabs" aria-label="Systemy"></nav>
</header>
<main id="view"></main>
<script>
(() => {
${js}
// ---- router zakładek (w artefakcie na hashu; w Next.js to osobne strony)
const MOUNTS = { 'gra-w-zycie': mountGameOfLife };
const nav = document.getElementById('tabs');
const view = document.getElementById('view');
let cleanup = null;
for (const t of TABS) {
  const a = document.createElement('a');
  a.href = '#' + t.slug;
  a.textContent = t.title;
  a.dataset.tab = t.slug;
  nav.append(a);
}
function route() {
  const slug = location.hash.slice(1);
  const tab = TABS.find((t) => t.slug === slug) || TABS[0];
  for (const a of nav.children) a.toggleAttribute('aria-current', a.dataset.tab === tab.slug);
  if (cleanup) cleanup();
  view.replaceChildren();
  cleanup = MOUNTS[tab.slug](view) || null;
}
window.addEventListener('hashchange', route);
route();
})();
</script>
`;
mkdirSync('dist', { recursive: true });
writeFileSync('dist/alife.html', out);
console.log(`dist/alife.html: ${(out.length / 1024).toFixed(1)} KB`);
