import { createContext, useContext, useEffect, useState } from 'react';

const CatalogContext = createContext({ barbers: [], services: [], loading: true, error: null });

export function CatalogProvider({ children }) {
  const [state, setState] = useState({ barbers: [], services: [], loading: true, error: null });

  useEffect(() => {
    const ctrl = new AbortController();
    fetch('/api/catalog', { signal: ctrl.signal })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(data => setState({
        barbers: data.barbers ?? [],
        services: data.services ?? [],
        loading: false,
        error: null,
      }))
      .catch(err => {
        if (err.name === 'AbortError') return;
        setState(s => ({ ...s, loading: false, error: err }));
      });
    return () => ctrl.abort();
  }, []);

  return <CatalogContext.Provider value={state}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  return useContext(CatalogContext);
}

export function useBarbers() {
  return useContext(CatalogContext).barbers;
}

export function useServices() {
  return useContext(CatalogContext).services;
}
