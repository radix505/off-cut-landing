import { useT } from '../context/LangContext';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer>
      <div className="footer-top">
        <div>
          <div className="footer-brand">OFF CUT</div>
          <div className="footer-brand-sub">Barbershop</div>
          <div className="footer-tagline">{useT('Premium Barbershop — Zał. 2019', 'Premium Barbershop — Est. 2019')}</div>
        </div>
        <div className="footer-socials">
          <a className="social-link" href="https://instagram.com/offcutbarber" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a className="social-link" href="https://facebook.com/offcutbarber" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a className="social-link" href="https://maps.app.goo.gl/offcut-szczecin" target="_blank" rel="noopener noreferrer">Google Maps</a>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-address">
          ul. Niepodległości 21, 70-412 Szczecin<br />
          <a href="tel:+48601234567" className="footer-contact-link">+48 601 234 567</a> · <a href="mailto:contact@offcut.pl" className="footer-contact-link">contact@offcut.pl</a>
        </div>
        <div className="footer-copy">© {year} Off Cut Barbershop.</div>
      </div>
    </footer>
  );
}
