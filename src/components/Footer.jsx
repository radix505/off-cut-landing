import { useT } from '../context/LangContext';
import { useRouter } from '../context/RouterContext';

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
  const { navigate } = useRouter();
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
          <p className="footer-pro-tagline">{useT('Premium Barbershop — Zał. 2019', 'Premium Barbershop — Est. 2019')}</p>
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
          </address>
        </div>

        {/* Hours */}
        <div className="footer-col">
          <div className="footer-col-label">{useT('Godziny otwarcia', 'Opening Hours')}</div>
          <ul className="footer-pro-hours">
            <li><span>{useT('Poniedziałek', 'Monday')}</span><span>10:00 – 19:00</span></li>
            <li><span>{useT('Wtorek', 'Tuesday')}</span><span>09:00 – 19:00</span></li>
            <li><span>{useT('Środa', 'Wednesday')}</span><span>09:00 – 19:00</span></li>
            <li><span>{useT('Czwartek', 'Thursday')}</span><span>09:00 – 19:00</span></li>
            <li><span>{useT('Piątek', 'Friday')}</span><span>09:00 – 19:00</span></li>
            <li><span>{useT('Sobota', 'Saturday')}</span><span>08:00 – 18:00</span></li>
            <li><span>{useT('Niedziela', 'Sunday')}</span><span>10:00 – 16:00</span></li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="footer-col">
          <div className="footer-col-label">{useT('Nawigacja', 'Navigation')}</div>
          <ul className="footer-pro-nav">
            <li><a onClick={(e) => { e.preventDefault(); navigate('/'); }} href="/">{useT('Strona główna', 'Home')}</a></li>
            <li><a onClick={(e) => { e.preventDefault(); navigate('/crew'); }} href="/crew">{useT('Ekipa', 'Meet Crew')}</a></li>
            <li><a onClick={(e) => { e.preventDefault(); navigate('/gallery'); }} href="/gallery">{useT('Galeria', 'Gallery')}</a></li>
            <li><a onClick={(e) => { e.preventDefault(); navigate('/prices'); }} href="/prices">{useT('Cennik', 'Prices')}</a></li>
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
          {useT('Stworzone przez', 'Created by')} <img src="/drawing.svg" alt="Corelaners" className="footer-credit-logo" /><a href="https://corelaners.eu" target="_blank" rel="noopener noreferrer">corelaners.eu</a>
        </div>
      </div>
    </footer>
  );
}
