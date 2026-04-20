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
          <a className="social-link" href="#">Instagram</a>
          <a className="social-link" href="#">Facebook</a>
          <a className="social-link" href="#">Google Maps</a>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-address">ul. Twoja 1, Poznań<br />contact@offcut.pl</div>
        <div className="footer-copy">© 2025 Off Cut Barbershop.</div>
      </div>
    </footer>
  );
}
