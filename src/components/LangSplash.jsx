import { useState } from 'react';
import { useLang } from '../context/LangContext';

export default function LangSplash() {
  const { splashVisible, selectLang } = useLang();
  const [slicing, setSlicing] = useState(false);

  if (!splashVisible) return null;

  function handleSelect(l) {
    if (slicing) return;
    setSlicing(true);
    setTimeout(() => selectLang(l), 820);
  }

  return (
    <div id="lang-splash">
      <div className="splash-half splash-half--dark" onClick={() => handleSelect('pl')}>
        <div className="splash-content splash-content--dark">
          <div className="splash-brand">OFF CUT</div>
          <div className="splash-sub">Barbershop</div>
          <div className="splash-divider" />
          <div className="splash-lang">Polski</div>
          <div className="splash-lang-hint">kliknij aby wybrać</div>
        </div>
      </div>
      <div className="splash-half splash-half--light" onClick={() => handleSelect('en')}>
        <div className="splash-content splash-content--light">
          <div className="splash-brand">OFF CUT</div>
          <div className="splash-sub">Barbershop</div>
          <div className="splash-divider" />
          <div className="splash-lang">English</div>
          <div className="splash-lang-hint">click to select</div>
        </div>
      </div>
      {slicing && (
        <div className="splash-scissors-overlay">
          <div className="splash-scissors-mover">
            <svg viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g className="scissors-blade-top">
                <circle cx="12" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
                <line x1="19" y1="12" x2="95" y2="20" stroke="currentColor" strokeWidth="1.5" />
              </g>
              <g className="scissors-blade-bottom">
                <circle cx="12" cy="30" r="8" stroke="currentColor" strokeWidth="1.5" />
                <line x1="19" y1="28" x2="95" y2="20" stroke="currentColor" strokeWidth="1.5" />
              </g>
              <circle cx="46" cy="20" r="2.5" fill="currentColor" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
