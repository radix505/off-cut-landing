import { createContext, useContext, useState } from 'react';

export const LangContext = createContext();

function detectInitialLang() {
  if (typeof window === 'undefined') return 'pl';
  const stored = localStorage.getItem('lang-chosen');
  if (stored === 'pl' || stored === 'en') return stored;
  const nav = (navigator.language || navigator.userLanguage || 'pl').toLowerCase();
  return nav.startsWith('pl') ? 'pl' : 'en';
}

function detectSplashVisible() {
  if (typeof window === 'undefined') return false;
  return !localStorage.getItem('lang-chosen');
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(detectInitialLang);
  const [splashVisible, setSplashVisible] = useState(detectSplashVisible);

  function selectLang(l) {
    setLang(l);
    setSplashVisible(false);
    try { localStorage.setItem('lang-chosen', l); } catch { /* ignore quota/private mode */ }
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
