import { useT } from '../context/LangContext';

export default function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <div>
          <div className="footer-brand">OFF CUT</div>
          <div className="footer-brand-sub">Barbershop</div>
          <div className="footer-tagline">{useT('Premium Barbershop — Zał. 2019', 'Premium Barbershop — Est. 2019')}</div>
        </div>
        <div className="footer-socials">
          <a className="social-link" href="https://www.instagram.com/off_cut_barbershop/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
            </svg>
          </a>
          <a className="social-link" href="https://www.facebook.com/offcutbarbershopszczecin" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
          </a>
          <a className="social-link" href="https://share.google/YjV0HAKR6jNQyiiHg" target="_blank" rel="noopener noreferrer" aria-label="Google Maps">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-address">ul. Twoja 1, Poznań<br />contact@offcut.pl</div>
        <div className="footer-copy">© 2025 Off Cut Barbershop.</div>
      </div>
    </footer>
  );
}
