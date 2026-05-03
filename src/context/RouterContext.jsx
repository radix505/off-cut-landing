import { createContext, useContext, useState, useEffect, useRef } from 'react';

const RouterContext = createContext();

function parsePath(p) {
  if (p.startsWith('/crew/')) return { page: 'barber', crewSlug: p.split('/')[2] || null };
  if (p === '/crew') return { page: 'crew', crewSlug: null };
  if (p === '/blog') return { page: 'blog', crewSlug: null };
  if (p === '/prices') return { page: 'prices', crewSlug: null };
  if (p === '/booking') return { page: 'booking', crewSlug: null };
  if (p === '/gallery') return { page: 'gallery', crewSlug: null };
  if (p === '/privacy') return { page: 'privacy', crewSlug: null };
  if (p === '/cookies') return { page: 'cookies', crewSlug: null };
  return { page: 'home', crewSlug: null };
}

export function RouterProvider({ children }) {
  const [state, setState] = useState(() => parsePath(window.location.pathname));
  const [cutting, setCutting] = useState(false);
  const [direction, setDirection] = useState('forward');
  const [pageVisible, setPageVisible] = useState(true);
  const [navState, setNavState] = useState(null);
  const timers = useRef([]);

  const page = state.page;
  const crewSlug = state.crewSlug;

  useEffect(() => {
    const onPop = () => setState(parsePath(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function clearNavState() { setNavState(null); }

  function navigate(path, state = null) {
    const target = parsePath(path);
    if (target.page === page && target.crewSlug === crewSlug) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];

    const depth = { home: 0, blog: 1, prices: 1, gallery: 1, booking: 1, privacy: 1, cookies: 1, crew: 1, barber: 2 };
    setDirection(depth[target.page] < depth[page] ? 'backward' : 'forward');
    setPageVisible(false);
    setCutting(true);

    timers.current.push(setTimeout(() => {
      window.history.pushState(null, '', path);
      setState(target);
      setNavState(state);
      window.scrollTo(0, 0);
    }, 450));

    timers.current.push(setTimeout(() => setPageVisible(true), 620));
    timers.current.push(setTimeout(() => setCutting(false), 1050));
  }

  return (
    <RouterContext.Provider value={{ page, crewSlug, navigate, navState, clearNavState, cutting, direction, pageVisible }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  return useContext(RouterContext);
}
