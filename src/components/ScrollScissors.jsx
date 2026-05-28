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

// Document-relative offsetTop - only changes on resize, not on scroll
function getDocTop(el) {
  let top = 0, node = el;
  while (node) { top += node.offsetTop; node = node.offsetParent; }
  return top;
}

const HW = 45;
const HH = 18;

export default function ScrollScissors() {
  const elRef  = useRef(null);
  const topRef = useRef(null);
  const botRef = useRef(null);

  useEffect(() => {
    let rafId      = null;
    let lastScrollY = window.scrollY;
    let bladeState  = false; // track to avoid unnecessary DOM writes

    // Cached layout values - only refreshed on resize
    let barbersDocTop = 0;
    let vw  = window.innerWidth;
    let vh  = window.innerHeight;
    let rem = parseFloat(getComputedStyle(document.documentElement).fontSize);

    function cacheLayout() {
      const el = document.querySelector('#barbers');
      if (el) barbersDocTop = getDocTop(el);
      vw  = window.innerWidth;
      vh  = window.innerHeight;
      rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    }
    cacheLayout();

    function setBlades(playing) {
      if (bladeState === playing) return;
      bladeState = playing;
      const state = playing ? 'running' : 'paused';
      if (topRef.current) topRef.current.style.animationPlayState = state;
      if (botRef.current) botRef.current.style.animationPlayState = state;
    }

    function update() {
      rafId = null;
      const el = elRef.current;
      if (!el) return;

      const scrollY      = window.scrollY;
      const scrollingDown = scrollY >= lastScrollY;
      lastScrollY = scrollY;

      const offset  = 5 * rem;
      // Viewport Y of barbers section top - no getBoundingClientRect needed
      const rectTop = barbersDocTop - scrollY;
      const isVisible = rectTop <= vh && rectTop >= -offset;

      if (!isVisible) {
        if (el.style.opacity !== '0') el.style.opacity = '0';
        setBlades(false);
        return;
      }

      const progress = Math.max(0, Math.min(1, (vh - rectTop) / (vh + offset)));
      const edgeFade = Math.min(progress * 6, (1 - progress) * 6, 1);

      const { xPx, yRem, angle } = samplePath(progress * 100, vw, rem);
      const tx = xPx - HW;
      const ty = rectTop + yRem * rem - HH;

      el.style.transform = `translate(${tx}px,${ty}px) rotate(${angle}deg) scaleX(${scrollingDown ? 1 : -1})`;
      el.style.opacity   = String(edgeFade);
      setBlades(edgeFade > 0);
    }

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(update);
    };

    const onResize = () => {
      cacheLayout();
      if (rafId) return;
      rafId = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    rafId = requestAnimationFrame(update);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div
      ref={elRef}
      className="scroll-scissors"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        opacity: 0,
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
