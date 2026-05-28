import { useT, useLang } from '../context/LangContext';
import { useRouter } from '../context/RouterContext';
import { HOURS_DISPLAY, BUSINESS_HOURS } from '../data/businessHours';

const DAY_NAMES_PL = ['Niedziela','Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota'];
const DAY_NAMES_EN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function getStatus(lang) {
  const now = new Date(), day = now.getDay(), hour = now.getHours() + now.getMinutes() / 60;
  const h = BUSINESS_HOURS[day], pad = (n) => String(n).padStart(2, '0');
  if (!h || hour >= h.end) {
    let next = day;
    for (let i = 1; i <= 7; i++) { next = (day + i) % 7; if (BUSINESS_HOURS[next]) break; }
    const nh = BUSINESS_HOURS[next], diff = (next - day + 7) % 7;
    const namePL = diff === 1 ? 'jutro' : `w ${DAY_NAMES_PL[next]}`;
    const nameEN = diff === 1 ? 'tomorrow' : DAY_NAMES_EN[next];
    return { open: false, label: lang === 'pl' ? `Zamknięte · otwieramy ${namePL} o ${pad(nh.start)}:00` : `Closed · opens ${nameEN} at ${pad(nh.start)}:00` };
  }
  if (hour < h.start) return { open: false, label: lang === 'pl' ? `Zamknięte · otwieramy o ${pad(h.start)}:00` : `Closed · opens at ${pad(h.start)}:00` };
  return { open: true, label: lang === 'pl' ? `Otwarte · zamykamy o ${pad(h.end)}:00` : `Open · closes at ${pad(h.end)}:00` };
}

const ScissorsIcon = () => (
  <svg viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="14">
    <circle cx="10" cy="32" r="7" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="16" y1="29" x2="95" y2="6" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="10" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="16" y1="11" x2="95" y2="34" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="43" cy="20" r="2.5" fill="currentColor"/>
  </svg>
);

export default function Footer() {
  const { navigate, page } = useRouter();
  const { lang } = useLang();
  const status = getStatus(lang);
  return (
    <footer className="footer-pro">
      <div className="footer-pro-inner">

        {/* Brand */}
        <div className="footer-col footer-col--brand">
          <div className="footer-pro-logo-wrap">
            <div className="footer-pro-logo">OFF CUT</div>
            <img src="/logo.svg" alt="" className="footer-logo-icon" />
          </div>
          <div className="footer-pro-logo-sub">Barbershop</div>
          <div className="footer-pro-scissors"><ScissorsIcon /></div>
          <p className="footer-pro-tagline">{useT('Premium Barbershop - Zał. 2019', 'Premium Barbershop - Est. 2019')}</p>
          <div className="footer-pro-socials">
            <a href="https://www.instagram.com/off_cut_barbershop/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="footer-pro-social">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <defs>
                  <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#F58529"/>
                    <stop offset="40%" stopColor="#DD2A7B"/>
                    <stop offset="100%" stopColor="#515BD4"/>
                  </linearGradient>
                </defs>
                <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#ig-grad)"/>
                <circle cx="12" cy="12" r="4" stroke="url(#ig-grad)"/>
                <circle cx="17.5" cy="6.5" r="0.8" fill="#DD2A7B" stroke="none"/>
              </svg>
            </a>
            <a href="https://www.facebook.com/offcutbarbershopszczecin" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="footer-pro-social">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1877F2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a href="https://share.google/YjV0HAKR6jNQyiiHg" target="_blank" rel="noopener noreferrer" aria-label="Google Maps" className="footer-pro-social">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <defs><clipPath id="gpin-f"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></clipPath></defs>
                <rect x="4" y="2" width="8" height="9" fill="#4285F4" clipPath="url(#gpin-f)"/>
                <rect x="12" y="2" width="8" height="9" fill="#EA4335" clipPath="url(#gpin-f)"/>
                <rect x="4" y="11" width="8" height="14" fill="#34A853" clipPath="url(#gpin-f)"/>
                <rect x="12" y="11" width="8" height="14" fill="#FBBC05" clipPath="url(#gpin-f)"/>
                <circle cx="12" cy="9" r="2.6" fill="white"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Contact */}
        <div className="footer-col">
          <div className="footer-col-label">{useT('Kontakt', 'Contact')}</div>
          <address className="footer-pro-address">
            <div className="footer-pro-address-line">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
              Bolesława Krzywoustego 27 U4,<br/>70-316 Szczecin
            </div>
            <div className="footer-pro-address-line">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <a href="mailto:offcutszczecin@gmail.com">offcutszczecin@gmail.com</a>
            </div>
            <div className="footer-pro-address-line">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <a href="tel:+48513340013">+48 513 340 013</a>
            </div>
          </address>
        </div>

        {/* Hours */}
        <div className="footer-col">
          <div className="footer-col-label">{useT('Godziny otwarcia', 'Opening Hours')}</div>
          <div className="footer-status">
            <span className={`contact-status-dot${status.open ? ' contact-status-dot--open' : ' contact-status-dot--closed'}`} />
            <span className="footer-status-text">{status.label}</span>
          </div>
          <ul className="footer-pro-hours">
            {HOURS_DISPLAY.map((row) => (
              <li key={row.dayEN}>
                <span>{lang === 'pl' ? row.dayPL : row.dayEN}</span>
                <span>{lang === 'pl' ? row.rangePL : row.rangeEN}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Navigation */}
        <div className="footer-col">
          <div className="footer-col-label">{useT('Nawigacja', 'Navigation')}</div>
          <ul className="footer-pro-nav">
            <li><a onClick={(e) => { e.preventDefault(); page === 'home' ? window.scrollTo({ top: 0, behavior: 'smooth' }) : navigate('/'); }} href="/">{useT('Strona główna', 'Home')}</a></li>
            <li><a onClick={(e) => { e.preventDefault(); navigate('/crew'); }} href="/crew">{useT('Ekipa', 'Meet Crew')}</a></li>
            <li><a onClick={(e) => { e.preventDefault(); navigate('/gallery'); }} href="/gallery">{useT('Galeria', 'Gallery')}</a></li>
            <li><a onClick={(e) => { e.preventDefault(); navigate('/services'); }} href="/services">{useT('Usługi', 'Services')}</a></li>
            <li><a onClick={(e) => { e.preventDefault(); navigate('/booking'); }} href="/booking">{useT('Rezerwacja', 'Booking')}</a></li>
            <li><a onClick={(e) => { e.preventDefault(); navigate('/blog'); }} href="/blog">Blog</a></li>
          </ul>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="footer-pro-bottom">
        <div className="footer-pro-copy">© {new Date().getFullYear()} Off Cut Barbershop. {useT('Wszelkie prawa zastrzeżone.', 'All rights reserved.')}</div>
        <div className="footer-pro-legal">
          <button className="footer-pro-legal-link" onClick={() => navigate('/privacy')}>{useT('Polityka prywatności', 'Privacy Policy')}</button>
          <span className="footer-pro-legal-sep">·</span>
          <button className="footer-pro-legal-link" onClick={() => navigate('/cookies')}>Cookies</button>
        </div>
        <div className="footer-credit">
          {useT('Stworzone przez', 'Created by')} <img src="https://corelaners.eu/public/logo-white.svg" alt="Corelaners" className="footer-credit-logo" /><a href="https://corelaners.eu" target="_blank" rel="noopener noreferrer">corelaners.eu</a>
        </div>
      </div>
    </footer>
  );
}
