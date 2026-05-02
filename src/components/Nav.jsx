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

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);
  const close = () => setOpen(false);
  const { lang, selectLang } = useLang();

  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    let raf;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 50);
        setHidden(y > 120 && y > lastY.current);
        lastY.current = y;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);
  const { page, navigate } = useRouter();
  const onBlog = page === 'blog';
  const onGallery = page === 'gallery';
  const onCrew = page === 'crew' || page === 'barber';
  const onAway = page === 'blog' || page === 'prices' || page === 'gallery' || page === 'booking' || page === 'crew' || page === 'barber' || page === 'privacy' || page === 'cookies';

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

  return (
    <nav ref={navRef} className={[scrolled ? 'nav-scrolled' : '', hidden ? 'nav-hidden' : ''].filter(Boolean).join(' ')}>
      <div className="nav-logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
        <img src="/logo.svg" alt="" className="nav-logo-icon" />
        <div className="nav-logo-text">
          <span className="nav-logo-main">OFF CUT</span>
          <span className="nav-logo-sub">Barbershop</span>
        </div>
      </div>
      <ul className={`nav-links${open ? ' nav-links--open' : ''}`}>
        <li><a href="/prices" onClick={(e) => { e.preventDefault(); navigate('/prices'); close(); }}>{useT('Usługi', 'Services')}</a></li>
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
        <li><a href="#footer" onClick={(e) => { e.preventDefault(); if (onAway) { navigate('/'); setTimeout(() => document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth' }), 700); } else { document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth' }); } close(); }}>{useT('Kontakt', 'Contact')}</a></li>
        <li><a href="#location" onClick={(e) => handleSectionClick(e, 'location')}>{useT('Lokalizacja', 'Location')}</a></li>
        <li>
          <a
            href="/blog"
            className={onBlog ? 'nav-link--active' : ''}
            onClick={(e) => { e.preventDefault(); navigate('/blog'); close(); }}
          >
            Blog
          </a>
        </li>
        <li className="nav-mobile-book">
          <button className="nav-book-mobile" onClick={handleBookClick}>
            {useT('Zarezerwuj', 'Book Now')}
          </button>
        </li>
      </ul>
      <div className="nav-right">
        <ScissorsIcon />
        <button className="nav-book" onClick={handleBookClick}>
          {useT('Zarezerwuj', 'Book Now')}
        </button>
        <div className="lang-switch">
          <button className={`lang-switch-btn${lang === 'pl' ? ' active' : ''}`} onClick={() => selectLang('pl')}>PL</button>
          <span className="lang-switch-sep">/</span>
          <button className={`lang-switch-btn${lang === 'en' ? ' active' : ''}`} onClick={() => selectLang('en')}>EN</button>
        </div>
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
  );
}
