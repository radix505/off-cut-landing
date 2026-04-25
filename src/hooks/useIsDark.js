import { useEffect, useState } from 'react';

const DARK_SECTIONS = ['hero', 'services', 'gallery', 'booking'];

export function useIsDark(y) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => {
      const checkY = y != null ? y : window.innerHeight - 48;
      const dark = DARK_SECTIONS.some(id => {
        const el = document.getElementById(id);
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return r.top <= checkY && r.bottom >= checkY;
      });
      setIsDark(dark);
    };
    window.addEventListener('scroll', check, { passive: true });
    check();
    return () => window.removeEventListener('scroll', check);
  }, [y]);

  return isDark;
}
