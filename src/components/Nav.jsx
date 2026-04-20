import { useT } from '../context/LangContext';

export default function Nav() {
  return (
    <nav>
      <div className="nav-logo">
        <span className="nav-logo-main">OFF CUT</span>
        <span className="nav-logo-sub">Barbershop</span>
      </div>
      <ul className="nav-links">
        <li><a href="#services">{useT('Usługi', 'Services')}</a></li>
        <li><a href="#barbers">{useT('Barberzy', 'Barbers')}</a></li>
        <li><a href="#gallery">{useT('Galeria', 'Gallery')}</a></li>
        <li><a href="#booking">{useT('Kontakt', 'Contact')}</a></li>
      </ul>
      <button className="nav-book">{useT('Zarezerwuj', 'Book Now')}</button>
    </nav>
  );
}
