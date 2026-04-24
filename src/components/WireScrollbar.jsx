import { useEffect, useRef, useState } from 'react';

const DARK_SECTIONS = ['hero', 'services', 'gallery', 'booking'];

const CLIPPER_H = 32; // px reserved at bottom for the clipper

function buildPath(h) {
  const cx = 8, amp = 5, step = 22;
  const usable = h - CLIPPER_H;
  let d = `M ${cx} 0`;
  const n = Math.ceil(usable / step) + 1;
  for (let i = 0; i < n; i++) {
    const y0 = i * step;
    const y1 = Math.min(y0 + step, usable);
    const dir = i % 2 === 0 ? 1 : -1;
    d += ` C ${cx + amp * dir} ${y0 + step * 0.3},${cx + amp * dir} ${y0 + step * 0.7},${cx} ${y1}`;
  }
  return d;
}

export default function WireScrollbar() {
  const [height, setHeight] = useState(window.innerHeight);
  const [progress, setProgress] = useState(0);
  const [isDark, setIsDark] = useState(false);
  const [pathLen, setPathLen] = useState(0);
  const [tip, setTip] = useState({ x: 8, y: 0 });
  const [scrollingDown, setScrollingDown] = useState(true);
  const lastScrollY = useRef(window.scrollY);
  const baseRef = useRef(null);

  useEffect(() => {
    const onResize = () => setHeight(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (baseRef.current) setPathLen(baseRef.current.getTotalLength());
  }, [height]);

  useEffect(() => {
    const update = () => {
      setScrollingDown(window.scrollY >= lastScrollY.current);
      lastScrollY.current = window.scrollY;

      const total = document.documentElement.scrollHeight - window.innerHeight;
      const p = total > 0 ? window.scrollY / total : 0;
      setProgress(p);

      let tipY = window.innerHeight * 0.5;
      if (baseRef.current && pathLen > 0) {
        const pt = baseRef.current.getPointAtLength(pathLen * p);
        setTip({ x: pt.x, y: pt.y });
        tipY = pt.y;
      }

      // color based on what section the clipper tip is actually over
      const dark = DARK_SECTIONS.some(id => {
        const el = document.getElementById(id);
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return r.top <= tipY && r.bottom >= tipY;
      });
      setIsDark(dark);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, [pathLen]);

  const d = buildPath(height);
  const baseColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.07)';
  const activeColor = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(10,10,10,0.65)';
  const dashOffset = pathLen > 0 ? pathLen * (1 - progress) : 0;

  return (
    <div style={{
      position: 'fixed', right: 8, top: 0,
      width: 16, height: '100vh',
      zIndex: 100, pointerEvents: 'none',
      overflow: 'visible',
    }}>
      <svg width="16" height={height} viewBox={`0 0 16 ${height}`} fill="none" overflow="visible">
        {/* dim base wire */}
        <path ref={baseRef} d={d} stroke={baseColor} strokeWidth="1" strokeLinecap="round" style={{ transition: 'stroke 0.5s' }} />
        {/* active wire — scroll progress */}
        {pathLen > 0 && (
          <path
            d={d}
            stroke={activeColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray={pathLen}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke 0.5s' }}
          />
        )}
        {/* clipper hanging at wire tip */}
        {pathLen > 0 && (
          <g transform={`translate(${tip.x - 9}, ${tip.y}) ${scrollingDown ? '' : 'scale(1,-1) translate(0,-27)'}`} stroke={activeColor} strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke 0.5s' }}>
            {/* body */}
            <rect x="1" y="0" width="16" height="22" rx="3" strokeWidth="1.2" fill="none" />
            {/* blade */}
            <rect x="0" y="20" width="18" height="5" rx="1.5" strokeWidth="1.2" fill="none" />
            {/* blade teeth */}
            <line x1="3" y1="22" x2="3" y2="25" strokeWidth="1" />
            <line x1="6" y1="22" x2="6" y2="25" strokeWidth="1" />
            <line x1="9" y1="22" x2="9" y2="25" strokeWidth="1" />
            <line x1="12" y1="22" x2="12" y2="25" strokeWidth="1" />
            <line x1="15" y1="22" x2="15" y2="25" strokeWidth="1" />
            {/* power button */}
            <rect x="6" y="4" width="6" height="3" rx="1" strokeWidth="0.8" fill="none" />
            {/* grip */}
            <line x1="3" y1="10" x2="15" y2="10" strokeWidth="0.8" />
            <line x1="3" y1="13" x2="15" y2="13" strokeWidth="0.8" />
            <line x1="3" y1="16" x2="15" y2="16" strokeWidth="0.8" />
          </g>
        )}
      </svg>
    </div>
  );
}
