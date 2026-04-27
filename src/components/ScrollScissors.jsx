import { useEffect, useRef } from 'react';

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

  const dx = (x1 - x0) / 100 * vw;
  const dy = (y1 - y0) * rem;
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;

  return { xPx: (clamped / 100) * vw, yRem, angle };
}

// Half-dimensions of the SVG (90×36) for centering via transform
const HW = 45;
const HH = 18;

export default function ScrollScissors() {
  const elRef  = useRef(null);
  const topRef = useRef(null);
  const botRef = useRef(null);

  const lastScrollY  = useRef(typeof window !== 'undefined' ? window.scrollY : 0);
  const remCache     = useRef(typeof window !== 'undefined' ? parseFloat(getComputedStyle(document.documentElement).fontSize) : 16);
  const barbersCache = useRef(null);

  useEffect(() => {
    let rafId = null;

    const update = () => {
      const el = elRef.current;
      if (!el) return;

      if (!barbersCache.current) barbersCache.current = document.querySelector('#barbers');
      const barbers = barbersCache.current;
      if (!barbers) return;

      const scrollingDown = window.scrollY >= lastScrollY.current;
      lastScrollY.current = window.scrollY;

      const rect   = barbers.getBoundingClientRect();
      const vh     = window.innerHeight;
      const vw     = window.innerWidth;
      const rem    = remCache.current;
      const offset = 5 * rem;

      const isVisible = rect.top <= vh && rect.top >= -offset;
      if (!isVisible) {
        el.style.opacity = '0';
        topRef.current && (topRef.current.style.animationPlayState = 'paused');
        botRef.current && (botRef.current.style.animationPlayState = 'paused');
        return;
      }

      const progress  = Math.max(0, Math.min(1, (vh - rect.top) / (vh + offset)));
      const { xPx, yRem, angle } = samplePath(progress * 100, vw, rem);

      // y in viewport coords — barbers top + path y offset from that top
      const y = rect.top + yRem * rem;

      const edgeFade = Math.min(progress * 6, (1 - progress) * 6, 1);

      // Use transform only (no left/top changes) — stays on compositor thread
      el.style.transform = `translate(${xPx - HW}px, ${y - HH}px) rotate(${angle}deg) scaleX(${scrollingDown ? 1 : -1})`;
      el.style.opacity    = String(edgeFade);

      const play = edgeFade > 0 ? 'running' : 'paused';
      topRef.current && (topRef.current.style.animationPlayState = play);
      botRef.current && (botRef.current.style.animationPlayState = play);
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => { rafId = null; update(); });
    };
    const onResize = () => {
      remCache.current  = parseFloat(getComputedStyle(document.documentElement).fontSize);
      barbersCache.current = null;
      if (rafId) return;
      rafId = requestAnimationFrame(() => { rafId = null; update(); });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={elRef}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        opacity: 0,
        transition: 'opacity 0.15s',
        zIndex: 50,
        pointerEvents: 'none',
        mixBlendMode: 'difference',
        willChange: 'transform',
      }}
    >
      <svg viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="90" height="36" color="#fff">
        <g ref={topRef} className="scroll-scissor-top" style={{ animationPlayState: 'paused' }}>
          <circle cx="12" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
          <line x1="19" y1="12" x2="95" y2="20" stroke="currentColor" strokeWidth="1.5" />
        </g>
        <g ref={botRef} className="scroll-scissor-bottom" style={{ animationPlayState: 'paused' }}>
          <circle cx="12" cy="30" r="8" stroke="currentColor" strokeWidth="1.5" />
          <line x1="19" y1="28" x2="95" y2="20" stroke="currentColor" strokeWidth="1.5" />
        </g>
        <circle cx="46" cy="20" r="2.5" fill="currentColor" />
      </svg>
    </div>
  );
}
