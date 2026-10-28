// Zoo Gry w życie (B3/S23). Cztery kategorie za materiałem wprowadzającym:
// martwe natury, oscylatory, statki i działa.
//
// Wzory zapisane są w RLE. Nazwy angielskie to nazwy kanoniczne z LifeWiki,
// polskie to tłumaczenia opisowe. Okresy, prędkości i przesunięcia są
// sprawdzane symulacją przez `npm test` (scripts/verify-patterns.mjs).

export const CATEGORIES = [
  {
    id: 'still',
    name: 'Martwe natury',
    en: 'still lifes',
    description: 'Nie zmieniają się: każda żywa komórka ma 2 lub 3 sąsiadów, a żadna martwa nie ma dokładnie 3.',
  },
  {
    id: 'oscillator',
    name: 'Oscylatory',
    en: 'oscillators',
    description: 'Wracają do tego samego kształtu w tym samym miejscu co określoną liczbę pokoleń (okres).',
  },
  {
    id: 'spaceship',
    name: 'Statki',
    en: 'spaceships',
    description: 'Po upływie okresu odtwarzają swój kształt przesunięty po siatce. Prędkość zapisuje się jako ułamek c, czyli jednej komórki na pokolenie.',
  },
  {
    id: 'gun',
    name: 'Działa',
    en: 'guns',
    description: 'Oscylatory, które co okres wypuszczają nowy statek, więc liczba żywych komórek rośnie bez końca.',
  },
];

export const PATTERNS = [
  // --- Martwe natury -------------------------------------------------------
  {
    id: 'block', category: 'still', name: 'Blok', en: 'Block',
    rle: '2o$2o!',
    note: 'Kwadrat 2×2. Najmniejsza martwa natura.',
  },
  {
    id: 'beehive', category: 'still', name: 'Ul', en: 'Beehive',
    rle: 'b2o$o2bo$b2o!',
    note: 'Sześć komórek ułożonych w sześciokąt.',
  },
  {
    id: 'loaf', category: 'still', name: 'Bochenek', en: 'Loaf',
    rle: 'b2o$o2bo$bobo$2bo!',
  },
  {
    id: 'boat', category: 'still', name: 'Łódź', en: 'Boat',
    rle: '2o$obo$bo!',
  },
  {
    id: 'ship', category: 'still', name: 'Okręt', en: 'Ship',
    rle: '2o$obo$b2o!',
    note: 'Mimo nazwy nie porusza się: to martwa natura, nie statek.',
  },
  {
    id: 'tub', category: 'still', name: 'Wanna', en: 'Tub',
    rle: 'bo$obo$bo!',
  },
  {
    id: 'pond', category: 'still', name: 'Staw', en: 'Pond',
    rle: 'b2o$o2bo$o2bo$b2o!',
  },
  {
    id: 'eater1', category: 'still', name: 'Zjadacz 1', en: 'Eater 1 (fishhook)',
    rle: '2o$obo$2bo$2b2o!',
    note: 'Potrafi „zjeść” nadlatującego szybowca i wrócić do swojego kształtu. Używany w konstrukcjach do pochłaniania niepotrzebnych statków.',
  },

  {
    id: 'barge', category: 'still', name: 'Barka', en: 'Barge',
    rle: 'bo$obo$bobo$2bo!',
  },
  {
    id: 'long-boat', category: 'still', name: 'Długa łódź', en: 'Long boat',
    rle: '2o$obo$bobo$2bo!',
    note: 'Łódź wydłużona o jedną komórkę po przekątnej.',
  },
  {
    id: 'long-barge', category: 'still', name: 'Długa barka', en: 'Long barge',
    rle: 'bo$obo$bobo$2bobo$3bo!',
    note: 'Barka wydłużona o jedną komórkę po przekątnej.',
  },
  {
    id: 'snake', category: 'still', name: 'Wąż', en: 'Snake',
    rle: '2obo$ob2o!',
  },
  {
    id: 'aircraft-carrier', category: 'still', name: 'Lotniskowiec', en: 'Aircraft carrier',
    rle: '2o$o2bo$2b2o!',
  },
  {
    id: 'mango', category: 'still', name: 'Mango', en: 'Mango',
    rle: 'b2o$o2bo$bo2bo$2b2o!',
  },

  // --- Oscylatory ----------------------------------------------------------
  {
    id: 'blinker', category: 'oscillator', name: 'Migacz', en: 'Blinker',
    rle: '3o!', period: 2,
    note: 'Trzy komórki w linii, na przemian poziomo i pionowo. Najmniejszy oscylator.',
  },
  {
    id: 'toad', category: 'oscillator', name: 'Ropucha', en: 'Toad',
    rle: 'b3o$3o!', period: 2,
  },
  {
    id: 'beacon', category: 'oscillator', name: 'Latarnia', en: 'Beacon',
    rle: '2o$2o$2b2o$2b2o!', period: 2,
    note: 'Dwa bloki stykające się rogami; dwie środkowe komórki zapalają się i gasną.',
  },
  {
    id: 'clock', category: 'oscillator', name: 'Zegar', en: 'Clock',
    rle: '2bo$obo$bobo$bo!', period: 2,
  },
  {
    id: 'pulsar', category: 'oscillator', name: 'Pulsar', en: 'Pulsar',
    rle: '2b3o3b3o2b2$o4bobo4bo$o4bobo4bo$o4bobo4bo$2b3o3b3o2b2$2b3o3b3o2b$o4bobo4bo$o4bobo4bo$o4bobo4bo2$2b3o3b3o!',
    period: 3,
  },
  {
    id: 'bipole', category: 'oscillator', name: 'Bipol', en: 'Bipole',
    rle: '2o$obo2$2bobo$3b2o!', period: 2,
  },
  {
    id: 'spark-coil', category: 'oscillator', name: 'Cewka iskrowa', en: 'Spark coil',
    rle: '2o4b2o$obo2bobo$2bo2bo$obo2bobo$2o4b2o!', period: 2,
  },
  {
    id: 'caterer', category: 'oscillator', name: 'Catering', en: 'Caterer',
    rle: '2bo$o3b4o$o3bo$o$3bo$b2o!', period: 3,
  },
  {
    id: 'cross', category: 'oscillator', name: 'Krzyż', en: 'Cross',
    rle: '2b4o$2bo2bo$3o2b3o$o6bo$o6bo$3o2b3o$2bo2bo$2b4o!', period: 3,
  },
  {
    id: 'mold', category: 'oscillator', name: 'Pleśń', en: 'Mold',
    rle: '3b2o$2bo2bo$o2bobo$4bo$ob2o$bo!', period: 4,
  },
  {
    id: 'octagon-2', category: 'oscillator', name: 'Ośmiokąt 2', en: 'Octagon 2',
    rle: '3b2o$2bo2bo$bo4bo$o6bo$o6bo$bo4bo$2bo2bo$3b2o!', period: 5,
  },
  {
    id: 'figure-eight', category: 'oscillator', name: 'Ósemka', en: 'Figure eight',
    rle: '3o$3o$3o$3b3o$3b3o$3b3o!', period: 8,
  },
  {
    id: 'koks-galaxy', category: 'oscillator', name: 'Galaktyka Koka', en: "Kok's galaxy",
    rle: '2ob6o$2ob6o$2o$2o5b2o$2o5b2o$2o5b2o$7b2o$6ob2o$6ob2o!', period: 8,
    note: 'Nazwana od Jana Koka. Cztery ramiona ułożone obrotowo wokół środka.',
  },
  {
    id: 'tumbler', category: 'oscillator', name: 'Akrobata', en: 'Tumbler',
    rle: 'bo5bo$obo3bobo$o2bobo2bo$2bo3bo$2b2ob2o!', period: 14, check: 'mirror-half',
    note: 'W połowie okresu (po 7 pokoleniach) jest swoim odbiciem do góry nogami.',
  },
  {
    id: 'pentadecathlon', category: 'oscillator', name: 'Pentadekatlon', en: 'Pentadecathlon',
    rle: '2bo4bo2b$2ob4ob2o$2bo4bo!', period: 15,
    note: 'Nazwa pochodzi od okresu 15 (gr. pente + deka).',
  },
  {
    id: 'queen-bee-shuttle', category: 'oscillator', name: 'Wahadłowiec królowej pszczół', en: 'Queen bee shuttle',
    rle: '9bo12b$7bobo12b$6bobo13b$2o3bo2bo11b2o$2o4bobo11b2o$7bobo12b$9bo!',
    period: 30,
    note: '„Królowa pszczół” przesuwa się tam i z powrotem między dwoma blokami, które ją zatrzymują. Dwa takie wahadłowce tworzą działo Gospera.',
  },

  // --- Statki --------------------------------------------------------------
  {
    id: 'glider', category: 'spaceship', name: 'Szybowiec', en: 'Glider',
    rle: 'bo$2bo$3o!', period: 4, dx: 1, dy: 1,
    note: 'Najmniejszy statek. Co 4 pokolenia przesuwa się o jedną komórkę po przekątnej. Z szybowców buduje się bramki logiczne.',
  },
  {
    id: 'lwss', category: 'spaceship', name: 'Lekki statek kosmiczny', en: 'Lightweight spaceship (LWSS)',
    rle: 'bo2bo$o$o3bo$4o!', period: 4, dx: -2, dy: 0,
    note: 'Najmniejszy statek poruszający się poziomo lub pionowo.',
  },
  {
    id: 'mwss', category: 'spaceship', name: 'Średni statek kosmiczny', en: 'Middleweight spaceship (MWSS)',
    rle: '3bo$bo3bo$o$o4bo$5o!', period: 4, dx: -2, dy: 0,
  },
  {
    id: 'hwss', category: 'spaceship', name: 'Ciężki statek kosmiczny', en: 'Heavyweight spaceship (HWSS)',
    rle: '3b2o$bo4bo$o$o5bo$6o!', period: 4, dx: -2, dy: 0,
  },
  {
    id: 'turtle', category: 'spaceship', name: 'Żółw', en: 'Turtle',
    rle: 'b3o7bo$b2o2bob2ob2o$3b3o4bo$bo2bobo3bo$o4bo4bo$o4bo4bo$bo2bobo3bo$3b3o4bo$b2o2bob2ob2o$b3o7bo!',
    period: 3, dx: -1, dy: 0,
    note: 'Statek o prędkości c/3.',
  },
  {
    id: 'weekender', category: 'spaceship', name: 'Weekendowiec', en: 'Weekender',
    rle: 'bo12bo$bo12bo$obo10bobo$bo12bo$bo12bo$2bo3b4o3bo$6b4o$2b4o4b4o2$4bo6bo$5b2o2b2o!',
    period: 7, dx: 0, dy: -2,
    note: 'Statek o prędkości 2c/7: przesuwa się o 2 komórki co 7 pokoleń. Znaleziony przez Davida Eppsteina w 2000 roku.',
  },
  {
    id: 'loafer', category: 'spaceship', name: 'Próżniak', en: 'Loafer',
    rle: 'b2o2bob2o$o2bo2b2o$bobo$2bo$8bo$6b3o$5bo$6bo$7b2o!', period: 7, dx: -1, dy: 0,
    note: 'Wolny statek o prędkości c/7. Odkryty przez Josha Balla w 2013 roku.',
  },
  {
    id: 'copperhead', category: 'spaceship', name: 'Miedziogłowiec', en: 'Copperhead',
    rle: 'b2o2b2o$3b2o$3b2o$obo2bobo$o6bo2$o6bo$b2o2b2o$2b4o2$3b2o$3b2o!', period: 10, dx: 0, dy: -1,
    note: 'Statek o prędkości c/10, odkryty w 2016 roku.',
  },

  // --- Działa --------------------------------------------------------------
  {
    id: 'gosper-gun', category: 'gun', name: 'Działo Gospera', en: 'Gosper glider gun',
    rle: '24bo$22bobo$12b2o6b2o12b2o$11bo3bo4b2o12b2o$2o8bo5bo3b2o$2o8bo3bob2o4bobo$10bo5bo7bo$11bo3bo$12b2o!',
    period: 30, emits: 'glider',
    note: 'Pierwsze znane działo, znalezione przez Billa Gospera w 1970 roku. Pokazało, że skończony wzór może rosnąć bez końca. Wypuszcza jeden szybowiec co 30 pokoleń.',
  },
  {
    id: 'simkin-gun', category: 'gun', name: 'Działo Simkina', en: 'Simkin glider gun',
    rle: '2o5b2o$2o5b2o2$4b2o$4b2o5$22b2ob2o$21bo5bo$21bo6bo2b2o$21b3o3bo3b2o$26bo4$20b2o$20bo$21b3o$23bo!',
    period: 120, emits: 'glider',
    note: 'Znalezione przez Michaela Simkina w 2015 roku. Wypuszcza jeden szybowiec co 120 pokoleń.',
  },
];

// Prędkość w zapisie LifeWiki: c/4 po przekątnej, c/2 ortogonalnie, 2c/5 itd.
export function speedLabel(p) {
  const d = Math.max(Math.abs(p.dx), Math.abs(p.dy));
  const g = gcd(d, p.period);
  const num = d / g, den = p.period / g;
  const frac = `${num === 1 ? '' : num}c/${den}`;
  const dir = p.dx !== 0 && p.dy !== 0 ? 'po przekątnej' : 'ortogonalnie';
  return `${frac} ${dir}`;
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}
