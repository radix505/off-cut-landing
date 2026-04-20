import { useLang } from '../context/LangContext';

export default function LangSplash() {
  const { splashVisible, selectLang } = useLang();
  return (
    <div id="lang-splash" className={splashVisible ? '' : 'hidden'}>
      <div className="splash-brand">OFF CUT</div>
      <div className="splash-sub">Barbershop</div>
      <div className="splash-divider" />
      <div className="splash-prompt">Choose your language</div>
      <div className="lang-options">
        <button className="lang-btn" onClick={() => selectLang('pl')}>Polski</button>
        <div className="lang-sep" />
        <button className="lang-btn" onClick={() => selectLang('en')}>English</button>
      </div>
    </div>
  );
}
