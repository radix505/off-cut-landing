import { useState, useEffect, useRef } from 'react';
import { useLang } from '../context/LangContext';

export default function LangSplash() {
  const { splashVisible, selectLang } = useLang();
  const [phase, setPhase] = useState('idle'); // 'idle' | 'cutting' | 'splitting'
  const pending = useRef(null);
  const scissorsRef = useRef(null);

  // Mobile scissors: compute exact Y from real viewport dimensions and drive with Web Animations API
  useEffect(() => {
    if (phase !== 'cutting') return;
    const isMobile = window.matchMedia('(max-width: 600px)').matches;
    if (!isMobile || !scissorsRef.current) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Cut line: polygon(0 0, 100% 0, 100% 55%, 0 45%) → from (0, 45vh) to (100vw, 55vh)
    const startX = -110;
    const endX = vw + 20;
    const startY = vh * 0.45 + (startX / vw) * vh * 0.1 - 18;
    const endY   = vh * 0.45 + (endX   / vw) * vh * 0.1 - 18;

    scissorsRef.current.animate(
      [
        { transform: `translate(${startX}px, ${startY.toFixed(1)}px) rotate(12deg)` },
        { transform: `translate(${endX}px,   ${endY.toFixed(1)}px) rotate(12deg)` },
      ],
      { duration: 700, easing: 'cubic-bezier(0.4,0,0.2,1)', fill: 'forwards' }
    );
  }, [phase]);

  if (!splashVisible) return null;

  function handleSelect(l) {
    if (phase !== 'idle') return;
    pending.current = l;
    const mobile = window.matchMedia('(max-width: 600px)').matches;
    setPhase('cutting');
    if (mobile) {
      setTimeout(() => setPhase('splitting'), 700);
      setTimeout(() => selectLang(l), 1250);
    } else {
      setTimeout(() => setPhase('splitting'), 700);
      setTimeout(() => selectLang(l), 1100);
    }
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

      {phase === 'cutting' && (
        <div className="splash-scissors-overlay">
          <div className="splash-scissors-mover-up" ref={scissorsRef}>
            <svg viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g className="scissors-blade-top">
                <circle cx="12" cy="10" r="8" stroke="currentColor" strokeWidth="2.5" />
                <line x1="19" y1="12" x2="95" y2="20" stroke="currentColor" strokeWidth="2.5" />
              </g>
              <g className="scissors-blade-bottom">
                <circle cx="12" cy="30" r="8" stroke="currentColor" strokeWidth="2.5" />
                <line x1="19" y1="28" x2="95" y2="20" stroke="currentColor" strokeWidth="2.5" />
              </g>
              <circle cx="46" cy="20" r="3.5" fill="currentColor" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
