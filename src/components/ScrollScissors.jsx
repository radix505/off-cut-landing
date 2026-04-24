import { useEffect, useRef, useState } from 'react';

// Must match the clip-path polygon points in index.css exactly
// [xPercent, yRem]
const PATH = [
  [0, 5], [3, 5], [6, 4.1], [9, 4.7], [13, 3.9], [17, 4.3],
  [21, 3.5], [25, 3.9], [29, 3.1], [33, 3.5], [37, 2.7], [41, 3],
  [45, 2.2], [49, 2.6], [53, 1.8], [57, 2.2], [61, 1.4], [65, 1.8],
  [69, 1], [73, 1.4], [77, 0.6], [81, 1], [85, 0.3], [89, 0.6],
  [93, 0.1], [97, 0.3], [100, 0],
];

function samplePath(xPct, vw, rem) {
  const clamped = Math.max(0, Math.min(100, xPct));
  let i = PATH.length - 2;
  for (let j = 0; j < PATH.length - 1; j++) {
    if (clamped <= PATH[j + 1][0]) { i = j; break; }
  }
  const [x0, y0] = PATH[i];
  const [x1, y1] = PATH[i + 1];
  const t = x1 === x0 ? 0 : (clamped - x0) / (x1 - x0);
  const yRem = y0 + (y1 - y0) * t;

  // local slope angle in degrees — scissors tilt with the cut
  const dx = (x1 - x0) / 100 * vw;
  const dy = (y1 - y0) * rem;
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;

  return { xPx: (clamped / 100) * vw, yRem, angle };
}

export default function ScrollScissors() {
  const [pos, setPos] = useState({ x: 0, y: 0, angle: -3, opacity: 0, flipX: false });
  const lastScrollY = useRef(typeof window !== 'undefined' ? window.scrollY : 0);

  useEffect(() => {
    const update = () => {
      const barbers = document.querySelector('#barbers');
      if (!barbers) return;

      const scrollingDown = window.scrollY >= lastScrollY.current;
      lastScrollY.current = window.scrollY;

      const rect = barbers.getBoundingClientRect();
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const offset = 5 * rem;

      const isVisible = rect.top <= vh && rect.top >= -offset;
      if (!isVisible) {
        setPos(prev => ({ ...prev, opacity: 0 }));
        return;
      }

      // progress: 0 = path right end at viewport bottom, 1 = path left end at viewport top
      const progress = Math.max(0, Math.min(1, (vh - rect.top) / (vh + offset)));

      // map progress to x% along the path (scrolling down → move right)
      const xPct = progress * 100;
      const { xPx, yRem, angle } = samplePath(xPct, vw, rem);

      // y in viewport = barbers element top + path y offset
      const y = rect.top + yRem * rem;

      const edgeFade = Math.min(progress * 6, (1 - progress) * 6, 1);
      setPos({ x: xPx, y, angle, opacity: edgeFade, flipX: !scrollingDown });
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const playing = pos.opacity > 0 ? 'running' : 'paused';

  return (
    <div
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        transform: `translate(-50%, -50%) rotate(${pos.angle}deg) scaleX(${pos.flipX ? -1 : 1})`,
        opacity: pos.opacity,
        transition: 'opacity 0.2s',
        zIndex: 50,
        pointerEvents: 'none',
        mixBlendMode: 'difference',
      }}
    >
      <svg viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="90" height="36" color="#fff">
        <g className="scroll-scissor-top" style={{ animationPlayState: playing }}>
          <circle cx="12" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
          <line x1="19" y1="12" x2="95" y2="20" stroke="currentColor" strokeWidth="1.5" />
        </g>
        <g className="scroll-scissor-bottom" style={{ animationPlayState: playing }}>
          <circle cx="12" cy="30" r="8" stroke="currentColor" strokeWidth="1.5" />
          <line x1="19" y1="28" x2="95" y2="20" stroke="currentColor" strokeWidth="1.5" />
        </g>
        <circle cx="46" cy="20" r="2.5" fill="currentColor" />
      </svg>
    </div>
  );
}
