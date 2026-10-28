// Prosty router oparty na hashu (#gra-w-zycie). Działa jako statyczna strona
// na Vercelu bez konfiguracji przekierowań.
//
// Nowy system ALife = nowy wpis w TABS z funkcją mount(el), która zwraca
// opcjonalną funkcję sprzątającą (zatrzymanie animacji, zdjęcie nasłuchów).
import { mountGameOfLife } from './tabs/game-of-life/index.js';

const TABS = [
  { id: 'gra-w-zycie', title: 'Gra w życie', mount: mountGameOfLife },
];

const nav = document.getElementById('tabs');
const view = document.getElementById('view');
let cleanup = null;

for (const tab of TABS) {
  const a = document.createElement('a');
  a.href = `#${tab.id}`;
  a.textContent = tab.title;
  a.dataset.tab = tab.id;
  nav.append(a);
}

function route() {
  const id = location.hash.replace(/^#\/?/, '');
  const tab = TABS.find((t) => t.id === id) || TABS[0];
  for (const a of nav.children) a.toggleAttribute('aria-current', a.dataset.tab === tab.id);
  if (cleanup) cleanup();
  view.replaceChildren();
  cleanup = tab.mount(view) || null;
  document.title = `${tab.title} · ALife`;
}

window.addEventListener('hashchange', route);
route();
