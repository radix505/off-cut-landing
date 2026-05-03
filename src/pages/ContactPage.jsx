import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { useT, useLang } from '../context/LangContext';
import { useRouter } from '../context/RouterContext';

export default function ContactPage() {
  const { navigate } = useRouter();

  const hours = [
    { day: useT('Poniedziałek', 'Monday'),   h: '10:00 – 19:00' },
    { day: useT('Wtorek',       'Tuesday'),   h: '09:00 – 19:00' },
    { day: useT('Środa',        'Wednesday'), h: '09:00 – 19:00' },
    { day: useT('Czwartek',     'Thursday'),  h: '09:00 – 19:00' },
    { day: useT('Piątek',       'Friday'),    h: '09:00 – 19:00' },
    { day: useT('Sobota',       'Saturday'),  h: '08:00 – 18:00' },
    { day: useT('Niedziela',    'Sunday'),    h: useT('Zamknięte', 'Closed') },
  ];

  return (
    <>
      <Nav />

      {/* Hero — interactive map behind text */}
      <div className="contact-hero">
        <iframe
          className="contact-hero-map"
          title="map"
          src="https://maps.google.com/maps?q=Boles%C5%82awa+Krzywoustego+27+U4%2C+Szczecin&output=embed&z=16"
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="contact-hero-overlay" />
        <div className="contact-hero-content">
          <div className="blog-page-eyebrow contact-hero-eyebrow">Off Cut — Barbershop</div>
          <h1 className="blog-page-title contact-hero-title">{useT('Kontakt', 'Contact')}</h1>
          <p className="blog-page-sub contact-hero-sub">{useT('Znajdź nas, zadzwoń lub napisz.', 'Find us, call or write.')}</p>
        </div>
      </div>

      {/* Info section — light background */}
      <section className="contact-section">
        <div className="contact-grid">

          <div className="contact-block">
            <div className="contact-label">{useT('Adres', 'Address')}</div>
            <div className="contact-value">Bolesława Krzywoustego 27 U4<br />70-316 Szczecin</div>
            <a className="contact-action-link" href="https://maps.google.com/?q=Bolesława+Krzywoustego+27+U4,+Szczecin" target="_blank" rel="noopener noreferrer">
              {useT('Otwórz w mapach →', 'Open in Maps →')}
            </a>
          </div>

          <div className="contact-block">
            <div className="contact-label">{useT('Telefon', 'Phone')}</div>
            <div className="contact-value">
              <a href="tel:+48513340013" className="contact-link">+48 513 340 013</a>
            </div>
          </div>

          <div className="contact-block">
            <div className="contact-label">Email</div>
            <div className="contact-value">
              <a href="mailto:offcutszczecin@gmail.com" className="contact-link">offcutszczecin@gmail.com</a>
            </div>
          </div>

          <div className="contact-block contact-block--wide">
            <div className="contact-label">{useT('Godziny otwarcia', 'Opening Hours')}</div>
            <ul className="contact-hours">
              {hours.map(({ day, h }) => (
                <li key={day}><span>{day}</span><span>{h}</span></li>
              ))}
            </ul>
          </div>

          <div className="contact-block">
            <div className="contact-label">{useT('Social media', 'Social Media')}</div>
            <div className="contact-socials">
              <a href="https://www.instagram.com/off_cut_barbershop/" target="_blank" rel="noopener noreferrer" className="contact-link">Instagram</a>
              <a href="https://www.facebook.com/offcutbarbershopszczecin" target="_blank" rel="noopener noreferrer" className="contact-link">Facebook</a>
              <a href="https://share.google/YjV0HAKR6jNQyiiHg" target="_blank" rel="noopener noreferrer" className="contact-link">Google Maps</a>
            </div>
          </div>

        </div>
      </section>

      <Footer />

      <button
        className="prices-back-circle-btn"
        onClick={() => navigate('/')}
        aria-label={useT('Powrót', 'Back')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
    </>
  );
}
