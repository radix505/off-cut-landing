import { useState } from 'react';
import { useT } from '../context/LangContext';

export default function Nav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <nav>
      <div className="nav-logo" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); close(); }} style={{ cursor: 'pointer' }}>
        <span className="nav-logo-main">OFF CUT</span>
        <span className="nav-logo-sub">Barbershop</span>
      </div>
      <ul className={`nav-links${open ? ' nav-links--open' : ''}`}>
        <li><a href="#services" onClick={close}>{useT('Usługi', 'Services')}</a></li>
        <li><a href="#barbers" onClick={close}>{useT('Barberzy', 'Barbers')}</a></li>
        <li><a href="#gallery" onClick={close}>{useT('Galeria', 'Gallery')}</a></li>
        <li><a href="#booking" onClick={close}>{useT('Kontakt', 'Contact')}</a></li>
      </ul>
      <div className="nav-right">
        <button className="nav-book" onClick={() => { document.getElementById('booking').scrollIntoView({ behavior: 'smooth' }); close(); }}>
          {useT('Zarezerwuj', 'Book Now')}
        </button>
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
