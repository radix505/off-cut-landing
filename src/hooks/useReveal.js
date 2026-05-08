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
    if (!el) return () => observer.disconnect();

    el.querySelectorAll('.reveal').forEach((r) => observer.observe(r));
    observer.observe(el);

    // Catch .reveal nodes that mount after this effect runs (e.g. cards
    // rendered once async data resolves). Without this, late-arriving
    // children stay at opacity: 0 because they were never observed.
    const mutations = new MutationObserver((records) => {
      records.forEach((rec) => {
        rec.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          if (node.classList?.contains('reveal')) observer.observe(node);
          node.querySelectorAll?.('.reveal').forEach((r) => observer.observe(r));
        });
      });
    });
    mutations.observe(el, { childList: true, subtree: true });

    return () => { observer.disconnect(); mutations.disconnect(); };
  }, []);

  return ref;
}
