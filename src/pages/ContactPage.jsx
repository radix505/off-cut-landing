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

      <section className="contact-section">
        <div className="contact-deco" aria-hidden="true">
          {[
            { x: '5%',  y: '12%', r: '15deg',  s: 0.65, d: '0s',   dur: '10s' },
            { x: '80%', y: '20%', r: '-20deg', s: 0.5,  d: '2s',   dur: '13s' },
            { x: '90%', y: '68%', r: '35deg',  s: 0.55, d: '1s',   dur: '9s'  },
          ].map((o, i) => (
            <div key={i} className="contact-deco-obj" style={{ left: o.x, top: o.y, animationDelay: o.d, animationDuration: o.dur }}>
              <svg style={{ transform: `rotate(${o.r}) scale(${o.s})` }} width="72" height="29" viewBox="0 0 100 40" fill="none">
                <circle cx="10" cy="32" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="16" y1="29" x2="95" y2="6" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="10" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="16" y1="11" x2="95" y2="34" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="43" cy="20" r="2.5" fill="currentColor"/>
              </svg>
            </div>
          ))}
        </div>

        <div className="contact-grid">

          {/* LEFT — address / phone+email / social */}
          <div className="contact-col">
            <div className="contact-block">
              <div className="contact-label">{useT('Adres', 'Address')}</div>
              <div className="contact-value">Bolesława Krzywoustego 27 U4<br />70-316 Szczecin</div>
              <a className="contact-action-link" href="https://maps.google.com/?q=Bolesława+Krzywoustego+27+U4,+Szczecin" target="_blank" rel="noopener noreferrer">
                {useT('Otwórz w mapach →', 'Open in Maps →')}
              </a>
            </div>

            <div className="contact-row">
              <div className="contact-block">
                <div className="contact-label">{useT('Telefon', 'Phone')}</div>
                <div className="contact-value">
                  <a href="tel:+48513340013" className="contact-link">+48 513 340 013</a>
                </div>
              </div>
              <div className="contact-block" style={{ borderLeft: '0.5px solid rgba(255,255,255,0.07)' }}>
                <div className="contact-label">Email</div>
                <div className="contact-value">
                  <a href="mailto:offcutszczecin@gmail.com" className="contact-link">offcutszczecin@gmail.com</a>
                </div>
              </div>
            </div>

            <div className="contact-block" style={{ flex: 1 }}>
              <div className="contact-label">{useT('Social media', 'Social Media')}</div>
              <div className="contact-socials">
                <a href="https://www.instagram.com/off_cut_barbershop/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="contact-social-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <defs><linearGradient id="ig-grad-c" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#F58529"/><stop offset="40%" stopColor="#DD2A7B"/><stop offset="100%" stopColor="#515BD4"/></linearGradient></defs>
                    <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#ig-grad-c)"/>
                    <circle cx="12" cy="12" r="4" stroke="url(#ig-grad-c)"/>
                    <circle cx="17.5" cy="6.5" r="0.8" fill="#DD2A7B" stroke="none"/>
                  </svg>
                </a>
                <a href="https://www.facebook.com/offcutbarbershopszczecin" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="contact-social-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1877F2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
                <a href="https://share.google/YjV0HAKR6jNQyiiHg" target="_blank" rel="noopener noreferrer" aria-label="Google Maps" className="contact-social-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <defs><clipPath id="gpin-c"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></clipPath></defs>
                    <rect x="4" y="2" width="8" height="9" fill="#4285F4" clipPath="url(#gpin-c)"/>
                    <rect x="12" y="2" width="8" height="9" fill="#EA4335" clipPath="url(#gpin-c)"/>
                    <rect x="4" y="11" width="8" height="14" fill="#34A853" clipPath="url(#gpin-c)"/>
                    <rect x="12" y="11" width="8" height="14" fill="#FBBC05" clipPath="url(#gpin-c)"/>
                    <circle cx="12" cy="9" r="2.6" fill="white"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT — opening hours */}
          <div className="contact-col">
            <div className="contact-block contact-block--hours">
              <div className="contact-label">{useT('Godziny otwarcia', 'Opening Hours')}</div>
              <ul className="contact-hours">
                {hours.map(({ day, h }) => (
                  <li key={day}><span>{day}</span><span>{h}</span></li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </section>

      <Footer />

      <button className="page-back-btn" onClick={() => navigate('/')}>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        {useT('Wróć', 'Back')}
      </button>
    </>
  );
}
