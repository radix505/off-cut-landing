import { createContext, useContext, useState, useEffect, useRef } from 'react';

const RouterContext = createContext();

export function RouterProvider({ children }) {
  const [page, setPage] = useState(() => {
    const p = window.location.pathname;
    return p === '/blog' ? 'blog' : p === '/prices' ? 'prices' : p === '/booking' ? 'booking' : p === '/gallery' ? 'gallery' : 'home';
  });
  const [cutting, setCutting] = useState(false);
  const [direction, setDirection] = useState('forward');
  const [pageVisible, setPageVisible] = useState(true);
  const timers = useRef([]);

  useEffect(() => {
    const onPop = () => {
      const p = window.location.pathname;
      setPage(p === '/blog' ? 'blog' : p === '/prices' ? 'prices' : p === '/booking' ? 'booking' : p === '/gallery' ? 'gallery' : 'home');
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function navigate(path) {
    const target = path === '/blog' ? 'blog' : path === '/prices' ? 'prices' : path === '/booking' ? 'booking' : path === '/gallery' ? 'gallery' : 'home';
    if (target === page) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];

    setDirection(target === 'home' ? 'backward' : 'forward');
    setPageVisible(false);
    setCutting(true);

    timers.current.push(setTimeout(() => {
      window.history.pushState(null, '', path);
      setPage(target);
      window.scrollTo(0, 0);
    }, 450));

    timers.current.push(setTimeout(() => setPageVisible(true), 620));
    timers.current.push(setTimeout(() => setCutting(false), 1050));
  }

  return (
    <RouterContext.Provider value={{ page, navigate, cutting, direction, pageVisible }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  return useContext(RouterContext);
}
