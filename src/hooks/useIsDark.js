import { useEffect, useState } from 'react';

const DARK_SECTIONS = ['hero', 'services', 'gallery', 'booking'];

export function useIsDark(y) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    let rafId = null;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const checkY = y != null ? y : window.innerHeight - 48;
        const dark = DARK_SECTIONS.some(id => {
          const el = document.getElementById(id);
          if (!el) return false;
          const r = el.getBoundingClientRect();
          return r.top <= checkY && r.bottom >= checkY;
        });
        setIsDark(dark);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [y]);

  return isDark;
}
