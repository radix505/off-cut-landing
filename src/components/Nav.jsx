import { useState } from 'react';
import { useT, useLang } from '../context/LangContext';
import { useRouter } from '../context/RouterContext';

export default function Nav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const { lang, selectLang } = useLang();
  const { page, navigate } = useRouter();
  const onBlog = page === 'blog';
  const onAway = page === 'blog' || page === 'prices';

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
    if (onAway) {
      navigate('/');
      setTimeout(() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' }), 700);
    } else {
      document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
    }
    close();
  }

  return (
    <nav>
      <div className="nav-logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
        <span className="nav-logo-main">OFF CUT</span>
        <span className="nav-logo-sub">Barbershop</span>
      </div>
      <ul className={`nav-links${open ? ' nav-links--open' : ''}`}>
        <li><a href="#services" onClick={(e) => handleSectionClick(e, 'services')}>{useT('Usługi', 'Services')}</a></li>
        <li><a href="#barbers" onClick={(e) => handleSectionClick(e, 'barbers')}>{useT('Barberzy', 'Barbers')}</a></li>
        <li><a href="#gallery" onClick={(e) => handleSectionClick(e, 'gallery')}>{useT('Galeria', 'Gallery')}</a></li>
        <li><a href="#booking" onClick={(e) => handleSectionClick(e, 'booking')}>{useT('Kontakt', 'Contact')}</a></li>
        <li>
          <a
            href="/blog"
            className={onBlog ? 'nav-link--active' : ''}
            onClick={(e) => { e.preventDefault(); navigate('/blog'); close(); }}
          >
            Blog
          </a>
        </li>
      </ul>
      <div className="nav-right">
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
