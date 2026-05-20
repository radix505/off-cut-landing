import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { useT, useLang } from '../context/LangContext';
import { useRouter } from '../context/RouterContext';
import { HOURS_DISPLAY, BUSINESS_HOURS } from '../data/businessHours';

const DAY_NAMES_PL = ['Niedziela','Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota'];
const DAY_NAMES_EN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function getOpenStatus(lang) {
  const now  = new Date();
  const day  = now.getDay();
  const hour = now.getHours() + now.getMinutes() / 60;
  const h    = BUSINESS_HOURS[day];
  const pad  = (n) => String(n).padStart(2, '0');
  if (!h || hour >= h.end) {
    let next = day;
    for (let i = 1; i <= 7; i++) { next = (day + i) % 7; if (BUSINESS_HOURS[next]) break; }
    const nh = BUSINESS_HOURS[next]; const diff = (next - day + 7) % 7;
    const namePL = diff === 1 ? 'jutro' : `w ${DAY_NAMES_PL[next]}`;
    const nameEN = diff === 1 ? 'tomorrow' : DAY_NAMES_EN[next];
    return { open: false, label: lang === 'pl' ? `Zamknięte · otwieramy ${namePL} o ${pad(nh.start)}:00` : `Closed · opens ${nameEN} at ${pad(nh.start)}:00` };
  }
  if (hour < h.start) return { open: false, label: lang === 'pl' ? `Zamknięte · otwieramy o ${pad(h.start)}:00` : `Closed · opens at ${pad(h.start)}:00` };
  return { open: true, label: lang === 'pl' ? `Otwarte · zamykamy o ${pad(h.end)}:00` : `Open · closes at ${pad(h.end)}:00` };
}

export default function ContactPage() {
  const { navigate } = useRouter();
  const { lang }     = useLang();
  const todayDisplayIndex = (() => { const d = new Date().getDay(); return d === 0 ? 6 : d - 1; })();
  const hours  = HOURS_DISPLAY.map((r) => ({ day: lang === 'pl' ? r.dayPL : r.dayEN, h: lang === 'pl' ? r.rangePL : r.rangeEN }));
  const status = getOpenStatus(lang);

  return (
    <>
      <Nav />

      <section className="contact-page">
        <div className="contact-page-inner">

          {/* Header row */}
          <div className="contact-page-header">
            <button className="page-back-btn" onClick={() => navigate('/')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              {useT('Wróć', 'Back')}
            </button>
          </div>

          <h1 className="contact-page-title">{useT('Kontakt', 'Contact')}</h1>

          {/* Two-column info grid */}
          <div className="contact-page-grid">

            {/* LEFT — location + contact details + social */}
            <div className="contact-page-col">
              <div className="contact-item">
                <div className="contact-label">{useT('Adres', 'Address')}</div>
                <p className="contact-value">Bolesława Krzywoustego 27 U4<br />70-316 Szczecin</p>
                <a className="contact-action-link" href="https://maps.google.com/?q=Off+Cut+Barbershop+Szczecin" target="_blank" rel="noopener noreferrer">
                  {useT('Otwórz w mapach →', 'Open in Maps →')}
                </a>
              </div>

              <div className="contact-item-row">
                <div className="contact-item">
                  <div className="contact-label">{useT('Telefon', 'Phone')}</div>
                  <a href="tel:+48513340013" className="contact-value contact-link">+48 513 340 013</a>
                </div>
                <div className="contact-item">
                  <div className="contact-label">Email</div>
                  <a href="mailto:offcutszczecin@gmail.com" className="contact-value contact-link contact-link--sm">offcutszczecin@gmail.com</a>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-label">{useT('Social media', 'Social Media')}</div>
                <div className="contact-socials">
                  <a href="https://www.instagram.com/off_cut_barbershop/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="contact-social-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <defs><linearGradient id="ig-g" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#F58529"/><stop offset="40%" stopColor="#DD2A7B"/><stop offset="100%" stopColor="#515BD4"/></linearGradient></defs>
                      <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#ig-g)"/><circle cx="12" cy="12" r="4" stroke="url(#ig-g)"/><circle cx="17.5" cy="6.5" r="0.8" fill="#DD2A7B" stroke="none"/>
                    </svg>
                  </a>
                  <a href="https://www.facebook.com/offcutbarbershopszczecin" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="contact-social-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1877F2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  </a>
                  <a href="https://share.google/YjV0HAKR6jNQyiiHg" target="_blank" rel="noopener noreferrer" aria-label="Google Maps" className="contact-social-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <defs><clipPath id="gpin"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></clipPath></defs>
                      <rect x="4" y="2" width="8" height="9" fill="#4285F4" clipPath="url(#gpin)"/><rect x="12" y="2" width="8" height="9" fill="#EA4335" clipPath="url(#gpin)"/><rect x="4" y="11" width="8" height="14" fill="#34A853" clipPath="url(#gpin)"/><rect x="12" y="11" width="8" height="14" fill="#FBBC05" clipPath="url(#gpin)"/><circle cx="12" cy="9" r="2.6" fill="white"/>
                    </svg>
                  </a>
                </div>
              </div>

              <div className="contact-item contact-status">
                <span className={`contact-status-dot${status.open ? ' contact-status-dot--open' : ' contact-status-dot--closed'}`} />
                <span className="contact-status-text">{status.label}</span>
              </div>
            </div>

            {/* RIGHT — hours + CTA */}
            <div className="contact-page-col">
              <div className="contact-item">
                <div className="contact-label">{useT('Godziny otwarcia', 'Opening Hours')}</div>
                <ul className="contact-hours">
                  {hours.map(({ day, h }, i) => (
                    <li key={day} className={i === todayDisplayIndex ? `contact-hours-today contact-hours-today--${status.open ? 'open' : 'closed'}` : ''}>
                      <span>{day}</span><span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="contact-item">
                <button className="btn-primary" style={{ width: '100%', maxWidth: '100%', flex: 'none' }} onClick={() => navigate('/booking')}>
                  {useT('Zarezerwuj wizytę', 'Book an appointment')}
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Map */}
      <div className="contact-map-section">
        <iframe
          title="map"
          src="https://maps.google.com/maps?q=Off+Cut+Barbershop+Szczecin&output=embed&z=16"
          allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <Footer />
    </>
  );
}
