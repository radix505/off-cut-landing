import { useEffect, useRef } from 'react';

export function useReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.1 }
    );

    const el = ref.current;
    if (el) {
      el.querySelectorAll('.reveal').forEach((r) => observer.observe(r));
      if (el.classList.contains('reveal')) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return ref;
}
