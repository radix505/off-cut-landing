import { useState, useEffect } from 'react';

export default function LogoIntro() {
  const [visible] = useState(() => {
    try { return !!localStorage.getItem('offcut-lang'); } catch { return false; }
  });
  const [exiting, setExiting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const t1 = setTimeout(() => setExiting(true), 730);
    const t2 = setTimeout(() => setDone(true), 1050);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [visible]);

  if (!visible || done) return null;

  return (
    <div className={`logo-intro${exiting ? ' logo-intro--exit' : ''}`}>
      <img src="/logo.svg" alt="" className="logo-intro-img logo-intro-img--top" />
      <img src="/logo.svg" alt="" className="logo-intro-img logo-intro-img--bottom" />
    </div>
  );
}
