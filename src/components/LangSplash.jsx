import { useState } from 'react';
import { useLang } from '../context/LangContext';

export default function LangSplash() {
  const { splashVisible, selectLang } = useLang();
  const [phase, setPhase] = useState('idle'); // 'idle' | 'splitting'

  if (!splashVisible) return null;

  function handleSelect(l) {
    if (phase !== 'idle') return;
    setPhase('splitting');
    setTimeout(() => selectLang(l), 420);
  }

  const busy = phase !== 'idle';
  const splitting = phase === 'splitting';

  return (
    <div id="lang-splash">
      <div
        className={`splash-half splash-half--dark${splitting ? ' splash-splitting' : ''}`}
        onClick={() => handleSelect('pl')}
        style={busy ? { pointerEvents: 'none' } : {}}
      >
        <div className="splash-content splash-content--dark">
          <div className="splash-brand">OFF CUT</div>
          <div className="splash-sub">Barbershop</div>
          <div className="splash-divider" />
          <div className="splash-lang">Polski</div>
          <div className="splash-lang-hint">kliknij aby wybrać</div>
        </div>
      </div>
      <div
        className={`splash-half splash-half--light${splitting ? ' splash-splitting' : ''}`}
        onClick={() => handleSelect('en')}
        style={busy ? { pointerEvents: 'none' } : {}}
      >
        <div className="splash-content splash-content--light">
          <div className="splash-brand">OFF CUT</div>
          <div className="splash-sub">Barbershop</div>
          <div className="splash-divider" />
          <div className="splash-lang">English</div>
          <div className="splash-lang-hint">click to select</div>
        </div>
      </div>

      {/* Full-viewport logo with color split matching the diagonal */}
      <div className={`splash-logo-wrap${splitting ? ' splash-logo-splitting' : ''}`}>
        <div className="splash-logo-half splash-logo-half--dark">
          <img src="/logo.svg" alt="" className="splash-logo-img splash-logo-img--dark" />
        </div>
        <div className="splash-logo-half splash-logo-half--light">
          <img src="/logo.svg" alt="" className="splash-logo-img splash-logo-img--light" />
        </div>
      </div>


    </div>
  );
}
