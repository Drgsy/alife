'use client';

import { useEffect, useRef } from 'react';
import { mountGameOfLife } from '../lib/game-of-life/mount';

// Symulacja rysuje bezpośrednio na canvasie, więc React tylko montuje
// i sprząta widok; cała logika jest w lib/game-of-life.
export default function GameOfLife() {
  const ref = useRef(null);
  useEffect(() => mountGameOfLife(ref.current), []);
  return <div ref={ref} />;
}
