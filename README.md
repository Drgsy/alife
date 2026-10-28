# ALife

Plac zabaw z systemami sztucznego życia. Na razie jedna zakładka: **Gra w życie** (B3/S23)
z interaktywną planszą i zoo organizmów w czterech kategoriach: martwe natury, oscylatory,
statki i działa.

## Uruchomienie lokalne

Strona jest statyczna (HTML + moduły ES, bez kroku budowania):

```bash
npm run dev          # npx serve .
# albo: python3 -m http.server 8000
```

## Testy zoo

```bash
npm test
```

Skrypt `scripts/verify-patterns.mjs` symuluje każdy wzór na nieograniczonej płaszczyźnie i sprawdza
okres, brak krótszego okresu, przesunięcie statków i to, że działa wypuszczają jeden szybowiec na okres.

## Vercel

Import repozytorium w Vercel z presetem **Other**, bez komendy budowania, katalog wyjściowy: główny.
Routing działa na hashu (`#/gra-w-zycie`), więc nie potrzeba przekierowań.

## Dodawanie kolejnego systemu

1. Utwórz `src/tabs/<nazwa>/index.js` z funkcją `mount(el)`, która zwraca funkcję sprzątającą.
2. Dopisz wpis do tablicy `TABS` w `src/main.js`.

Silnik `src/tabs/game-of-life/engine.js` przyjmuje dowolną regułę B/S (np. `B36/S23` dla HighLife),
więc można go użyć dla innych automatów typu Life.

## Uwagi o nazwach

Nazwy angielskie wzorów to nazwy kanoniczne z LifeWiki. Polskie nazwy są tłumaczeniami opisowymi
(nie ma jednego ustalonego polskiego nazewnictwa).
