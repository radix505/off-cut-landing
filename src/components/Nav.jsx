import { useState } from 'react';
import { useT, useLang } from '../context/LangContext';

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

export default function Nav() {
  const [open, setOpen] = useState(false);
  const { lang, selectLang } = useLang();

  const go = (id) => {
    scrollTo(id);
    setOpen(false);
  };

  const toggleLang = () => {
    selectLang(lang === 'pl' ? 'en' : 'pl');
  };

  return (
    <nav className={open ? 'nav-open' : ''}>
      <div className="nav-logo">
        <span className="nav-logo-main">OFF CUT</span>
        <span className="nav-logo-sub">Barbershop</span>
      </div>
      <ul className="nav-links">
        <li><a href="#services" onClick={(e) => { e.preventDefault(); go('services'); }}>{useT('Usługi', 'Services')}</a></li>
        <li><a href="#barbers" onClick={(e) => { e.preventDefault(); go('barbers'); }}>{useT('Barberzy', 'Barbers')}</a></li>
        <li><a href="#gallery" onClick={(e) => { e.preventDefault(); go('gallery'); }}>{useT('Galeria', 'Gallery')}</a></li>
        <li><a href="#faq" onClick={(e) => { e.preventDefault(); go('faq'); }}>FAQ</a></li>
        <li><a href="#booking" onClick={(e) => { e.preventDefault(); go('booking'); }}>{useT('Kontakt', 'Contact')}</a></li>
      </ul>
      <div className="nav-right">
        <button className="nav-lang" onClick={toggleLang} aria-label="Switch language">
          {lang === 'pl' ? 'EN' : 'PL'}
        </button>
        <button className="nav-book" onClick={() => go('booking')}>{useT('Zarezerwuj', 'Book Now')}</button>
        <button
          className="nav-hamburger"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  );
}
