import { createContext, useContext, useState } from 'react';

export const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => { try { return localStorage.getItem('offcut-lang') || 'pl'; } catch { return 'pl'; } });
  const [splashVisible, setSplashVisible] = useState(true);

  function selectLang(l) {
    setLang(l);
    setSplashVisible(false);
    try { localStorage.setItem('offcut-lang', l); } catch {}
  }

  return (
    <LangContext.Provider value={{ lang, splashVisible, selectLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useT(pl, en) {
  const { lang } = useContext(LangContext);
  return lang === 'pl' ? pl : en;
}

export function useLang() {
  return useContext(LangContext);
}
