import { createContext, useContext, useState, useEffect, useRef } from 'react';

const RouterContext = createContext();

export function RouterProvider({ children }) {
  const [page, setPage] = useState(() =>
    window.location.pathname === '/blog' ? 'blog' : 'home'
  );
  const [cutting, setCutting] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const timers = useRef([]);

  useEffect(() => {
    const onPop = () => setPage(window.location.pathname === '/blog' ? 'blog' : 'home');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function navigate(path) {
    const target = path === '/blog' ? 'blog' : 'home';
    if (target === page) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];

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
    <RouterContext.Provider value={{ page, navigate, cutting, pageVisible }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  return useContext(RouterContext);
}
