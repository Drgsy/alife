# ALife

Plac zabaw z systemami sztucznego życia, w Next.js. Na razie jedna zakładka: **Gra w życie** (B3/S23)
z interaktywną planszą i zoo organizmów w czterech kategoriach: martwe natury, oscylatory, statki i działa.

## Uruchomienie lokalne

Wymaga Node.js 20.9 lub nowszego.

```bash
npm install
npm run dev        # http://localhost:3000
```

## Testy zoo

```bash
npm test
```

`scripts/verify-patterns.mjs` symuluje każdy wzór na nieograniczonej płaszczyźnie i sprawdza okres,
brak krótszego okresu, przesunięcie statków i to, że działa wypuszczają jeden szybowiec na okres.

## Struktura

- `app/` – strony Next.js (App Router); każda zakładka to osobna trasa, np. `app/gra-w-zycie/page.js`.
- `components/` – komponenty React (nawigacja, montowanie symulacji).
- `lib/game-of-life/` – silnik (dowolna reguła B/S, torus), parser RLE, katalog wzorów, widok.
- `lib/tabs.js` – lista zakładek w nawigacji.
- `scripts/build-artifact.mjs` – składa jednoplikowy podgląd (`dist/alife.html`) publikowany jako artefakt.

## Dodawanie kolejnego systemu

1. Dodaj wpis w `lib/tabs.js`.
2. Utwórz `app/<slug>/page.js` i komponent w `components/`.

## Vercel

Import repozytorium w Vercel; preset Next.js wykrywa się sam.

## Uwagi o nazwach

Nazwy angielskie wzorów to nazwy kanoniczne z LifeWiki. Polskie nazwy są tłumaczeniami opisowymi.
