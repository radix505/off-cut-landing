import { useState, useEffect, useRef } from 'react';
import { useT, useLang } from '../context/LangContext';
import { useRouter } from '../context/RouterContext';

const ScissorsIcon = () => (
  <svg className="nav-scissors" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="32" r="7" stroke="currentColor" strokeWidth="1.5" />
    <line x1="16" y1="29" x2="95" y2="6" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="10" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
    <line x1="16" y1="11" x2="95" y2="34" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="43" cy="20" r="2.5" fill="currentColor" />
  </svg>
);

function LangToggle({ lang, onToggle }) {
  return (
    <button
      className="lang-toggle"
      onClick={onToggle}
      aria-label={lang === 'pl' ? 'Switch to English' : 'Przełącz na Polski'}
    >
      <span className={`lang-toggle-opt${lang === 'en' ? ' lang-toggle-opt--on' : ''}`}>EN</span>
      <span className={`lang-toggle-opt${lang === 'pl' ? ' lang-toggle-opt--on' : ''}`}>PL</span>
    </button>
  );
}

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);
  const close = () => setOpen(false);
  const { lang, selectLang } = useLang();

  const [hidden, setHidden] = useState(false);
  const [hovered, setHovered] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    let raf;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 50);
        const atTop = y < 80;
        if (!atTop && y > lastY.current) setHovered(false);
        setHidden(!atTop);
        lastY.current = y;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  const { page, navigate } = useRouter();
  const onGallery = page === 'gallery';
  const onCrew = page === 'crew' || page === 'barber';
  const onContact = page === 'contact';
  const onAway = page === 'blog' || page === 'services' || page === 'gallery' || page === 'booking' || page === 'crew' || page === 'barber' || page === 'privacy' || page === 'cookies' || page === 'contact';

  function handleLogoClick() {
    if (onAway) navigate('/');
    else window.scrollTo({ top: 0, behavior: 'smooth' });
    close();
  }

  function handleSectionClick(e, id) {
    if (onAway) {
      e.preventDefault();
      navigate('/');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 700);
    }
    close();
  }

  function handleBookClick() {
    navigate('/booking');
    close();
  }

  const isHidden = hidden && !hovered;
  const showBg = page !== 'home' || scrolled;
  const toggleLang = () => selectLang(lang === 'pl' ? 'en' : 'pl');

  return (
    <>
    {isHidden && (
      <div
        style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '8px', zIndex: 101 }}
        onMouseEnter={() => setHovered(true)}
      />
    )}
    {open && <div className="nav-backdrop" onClick={close} aria-hidden="true" />}
    <nav
      ref={navRef}
      className={[scrolled ? 'nav-scrolled' : '', isHidden ? 'nav-hidden' : '', showBg ? 'nav-bg' : ''].filter(Boolean).join(' ')}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="nav-logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
        <img src="/logo.svg" alt="" className="nav-logo-icon" />
        <div className="nav-logo-text">
          <span className="nav-logo-off">OFF</span>
          <span className="nav-logo-cut">CUT</span>
        </div>
      </div>

      <div className="nav-pill nav-pill--center">
        <ul className={`nav-links${open ? ' nav-links--open' : ''}`}>
          <li><a href="/services" onClick={(e) => { e.preventDefault(); navigate('/services'); close(); }}>{useT('Usługi', 'Services')}</a></li>
          <li>
            <a
              href="/crew"
              className={onCrew ? 'nav-link--active' : ''}
              onClick={(e) => { e.preventDefault(); navigate('/crew'); close(); }}
            >
              {useT('Ekipa', 'Meet Crew')}
            </a>
          </li>
          <li>
            <a
              href="/gallery"
              className={onGallery ? 'nav-link--active' : ''}
              onClick={(e) => { e.preventDefault(); navigate('/gallery'); close(); }}
            >
              {useT('Galeria', 'Gallery')}
            </a>
          </li>
          <li><a href="/contact" className={onContact ? 'nav-link--active' : ''} onClick={(e) => { e.preventDefault(); navigate('/contact'); close(); }}>{useT('Kontakt', 'Contact')}</a></li>
          <li className="nav-mobile-book">
            <button className="nav-book-mobile" onClick={handleBookClick}>
              {useT('Zarezerwuj', 'Book Now')}
            </button>
          </li>
        </ul>
      </div>

      <div className="nav-pill nav-pill--right">
        <ScissorsIcon />
        <button className="nav-book" onClick={handleBookClick}>
          {useT('Zarezerwuj', 'Book Now')}
        </button>
        <LangToggle lang={lang} onToggle={toggleLang} />
      </div>

      <div className="nav-mobile-right">
        <button className="nav-hamburger" onClick={() => setOpen(o => !o)} aria-label="Menu">
          {open ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          )}
        </button>
      </div>
    </nav>
    </>
  );
}
