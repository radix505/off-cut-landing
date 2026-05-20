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
  const [hidden, setHidden] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [onLight, setOnLight] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 1101px)').matches);
  const navRef = useRef(null);
  const lastY = useRef(0);
  const close = () => setOpen(false);
  const { lang, selectLang } = useLang();
  const toggleLang = () => selectLang(lang === 'pl' ? 'en' : 'pl');

  // Scroll-based hide/show: hides on scroll-down, reveals on scroll-up, always visible at top
  useEffect(() => {
    let raf;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 50);
        const atTop = y < 80;
        const scrollingDown = y > lastY.current + 4;
        const scrollingUp   = y < lastY.current - 4; // require deliberate upward intent
        if (atTop) {
          setHidden(false);
        } else if (scrollingDown) {
          setHovered(false);
          setHidden(true);
        } else if (scrollingUp) {
          setHidden(false);
        }
        // else: tiny jitter or stop → keep current state
        lastY.current = y;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  // Track desktop breakpoint for hover-reveal (desktop only)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1101px)');
    const update = () => { setIsDesktop(mq.matches); if (!mq.matches) setHovered(false); };
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Detect light sections behind the nav by checking known light-bg sections directly.
  // elementsFromPoint was unreliable on clip-path sections (barbers wavy top).
  useEffect(() => {
    let raf;
    // Selectors for every section that has a light/white background
    const LIGHT_SELECTORS = '.marquee-section, .blog-section, .map-section, .barbers-section';

    const check = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const nav = navRef.current;
        if (!nav) return;
        const navH = nav.getBoundingClientRect().height || 60;
        const lightSections = document.querySelectorAll(LIGHT_SELECTORS);
        let isLight = false;
        for (const el of lightSections) {
          const r = el.getBoundingClientRect();
          if (r.top < navH && r.bottom > 0) { isLight = true; break; }
        }
        setOnLight(isLight);
      });
    };
    window.addEventListener('scroll', check, { passive: true });
    check();
    return () => { window.removeEventListener('scroll', check); cancelAnimationFrame(raf); };
  }, []);

  // Close drawer on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Toggle body class so the mobile app bar can hide behind the backdrop
  useEffect(() => {
    document.body.classList.toggle('nav-drawer-is-open', open);
    return () => document.body.classList.remove('nav-drawer-is-open');
  }, [open]);

  const { page, navigate } = useRouter();
  const onServices = page === 'services';
  const onGallery = page === 'gallery';
  const onCrew = page === 'crew' || page === 'barber';
  const onContact = page === 'contact';
  const onAway = ['blog', 'services', 'gallery', 'booking', 'crew', 'barber', 'privacy', 'cookies', 'contact'].includes(page);

  function handleLogoClick() {
    if (onAway) navigate('/');
    else window.scrollTo({ top: 0, behavior: 'smooth' });
    close();
  }

  function handleBookClick() {
    navigate('/booking');
    close();
  }

  const isHidden = hidden && !hovered;

  return (
    <>
      {isHidden && isDesktop && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '24px', zIndex: 101 }}
          onMouseEnter={() => setHovered(true)}
        />
      )}
      {open && <div className="nav-backdrop" onClick={close} aria-hidden="true" />}
      <nav
        ref={navRef}
        className={[
          scrolled ? 'nav-scrolled' : '',
          isHidden ? 'nav-hidden' : '',
          scrolled ? 'nav-bg' : '',
          onLight ? 'nav--light' : '',
        ].filter(Boolean).join(' ')}
        onMouseLeave={isDesktop ? () => setHovered(false) : undefined}
      >
        {/* Logo */}
        <div className="nav-logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <img src="/logo.svg" alt="" className="nav-logo-icon" />
          <div className="nav-logo-text">
            <div className="nav-logo-wordmark">
              <span className="nav-logo-off">OFF</span>
              <span className="nav-logo-cut">CUT</span>
            </div>
            <span className="nav-logo-sub">Barbershop</span>
          </div>
        </div>

        {/* Desktop center pill */}
        <div className="nav-pill nav-pill--center">
          <ul className="nav-links">
            <li>
              <a href="/services" className={onServices ? 'nav-link--active' : ''} onClick={(e) => { e.preventDefault(); navigate('/services'); }}>
                {useT('Usługi', 'Services')}
              </a>
            </li>
            <li>
              <a href="/crew" className={onCrew ? 'nav-link--active' : ''} onClick={(e) => { e.preventDefault(); navigate('/crew'); }}>
                {useT('Ekipa', 'Meet Crew')}
              </a>
            </li>
            <li>
              <a href="/gallery" className={onGallery ? 'nav-link--active' : ''} onClick={(e) => { e.preventDefault(); navigate('/gallery'); }}>
                {useT('Galeria', 'Gallery')}
              </a>
            </li>
            <li>
              <a href="/contact" className={onContact ? 'nav-link--active' : ''} onClick={(e) => { e.preventDefault(); navigate('/contact'); }}>
                {useT('Kontakt', 'Contact')}
              </a>
            </li>
          </ul>
        </div>

        {/* Desktop right pill */}
        <div className="nav-pill nav-pill--right">
          <ScissorsIcon />
          <button className="nav-book" onClick={handleBookClick}>
            {useT('Zarezerwuj', 'Book Now')}
          </button>
          <LangToggle lang={lang} onToggle={toggleLang} />
        </div>

        {/* Mobile controls */}
        <div className="nav-mobile-right">
          <LangToggle lang={lang} onToggle={toggleLang} />
          <button
            className="nav-hamburger"
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Zamknij menu' : 'Otwórz menu'}
            aria-expanded={open}
          >
            <span className={`nav-hbg${open ? ' nav-hbg--open' : ''}`}>
              <span /><span /><span />
            </span>
          </button>
        </div>

        {/* Mobile slide-in drawer (inside nav to share stacking context) */}
        <div className={`nav-drawer${open ? ' nav-drawer--open' : ''}`} aria-hidden={!open}>
          <div className="nav-drawer-header">
            <div className="nav-drawer-brand" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
              <img src="/logo.svg" alt="" className="nav-drawer-logo" />
              <div className="nav-drawer-brand-text">
                <div className="nav-drawer-brand-wordmark"><span>OFF</span><span>CUT</span></div>
                <span className="nav-drawer-brand-sub">Barbershop</span>
              </div>
            </div>
          </div>

          <ul className="nav-drawer-links">
            <li>
              <button onClick={() => { navigate('/services'); close(); }}>
                <span>{useT('Usługi', 'Services')}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </li>
            <li>
              <button onClick={() => { navigate('/crew'); close(); }}>
                <span>{useT('Ekipa', 'Meet Crew')}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </li>
            <li>
              <button onClick={() => { navigate('/gallery'); close(); }}>
                <span>{useT('Galeria', 'Gallery')}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </li>
            <li>
              <button onClick={() => { navigate('/contact'); close(); }}>
                <span>{useT('Kontakt', 'Contact')}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </li>
            <li>
              <button onClick={() => { navigate('/blog'); close(); }}>
                <span>Blog</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </li>
          </ul>

          <div className="nav-drawer-footer">
            <button className="nav-drawer-book" onClick={handleBookClick}>
              {useT('Zarezerwuj wizytę', 'Book an appointment')}
            </button>
            <div className="nav-drawer-lang-row">
              <span className="nav-drawer-lang-label">{useT('Język', 'Language')}</span>
              <LangToggle lang={lang} onToggle={toggleLang} />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
