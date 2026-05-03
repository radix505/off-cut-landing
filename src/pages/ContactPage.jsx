import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { useT, useLang } from '../context/LangContext';
import { useRouter } from '../context/RouterContext';

export default function ContactPage() {
  const { navigate } = useRouter();
  const { lang } = useLang();

  const hours = [
    { day: useT('Poniedziałek', 'Monday'),   hours: '10:00 – 19:00' },
    { day: useT('Wtorek',       'Tuesday'),   hours: '09:00 – 19:00' },
    { day: useT('Środa',        'Wednesday'), hours: '09:00 – 19:00' },
    { day: useT('Czwartek',     'Thursday'),  hours: '09:00 – 19:00' },
    { day: useT('Piątek',       'Friday'),    hours: '09:00 – 19:00' },
    { day: useT('Sobota',       'Saturday'),  hours: '08:00 – 18:00' },
    { day: useT('Niedziela',    'Sunday'),    hours: useT('Zamknięte', 'Closed') },
  ];

  return (
    <>
      <Nav />
      <div className="blog-page-hero contact-page-hero">
        <div className="blog-page-eyebrow">Off Cut — Barbershop</div>
        <h1 className="blog-page-title">{useT('Kontakt', 'Contact')}</h1>
        <p className="blog-page-sub">{useT('Znajdź nas, zadzwoń lub napisz.', 'Find us, call or write.')}</p>
      </div>

      <section className="contact-section">
        <div className="contact-inner">

          <div className="contact-col">
            <div className="contact-block">
              <div className="contact-label">{useT('Adres', 'Address')}</div>
              <div className="contact-value">
                Bolesława Krzywoustego 27 U4<br />70-316 Szczecin
              </div>
              <a
                className="contact-map-link"
                href="https://maps.google.com/?q=Bolesława+Krzywoustego+27+U4,+Szczecin"
                target="_blank"
                rel="noopener noreferrer"
              >
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

            <div className="contact-block">
              <div className="contact-label">{useT('Godziny otwarcia', 'Opening Hours')}</div>
              <ul className="contact-hours">
                {hours.map(({ day, hours: h }) => (
                  <li key={day}><span>{day}</span><span>{h}</span></li>
                ))}
              </ul>
            </div>

            <div className="contact-block">
              <div className="contact-label">{useT('Social media', 'Social Media')}</div>
              <div className="contact-socials">
                <a href="https://www.instagram.com/off_cut_barbershop/" target="_blank" rel="noopener noreferrer" className="contact-social-link">Instagram</a>
                <a href="https://www.facebook.com/offcutbarbershopszczecin" target="_blank" rel="noopener noreferrer" className="contact-social-link">Facebook</a>
                <a href="https://share.google/YjV0HAKR6jNQyiiHg" target="_blank" rel="noopener noreferrer" className="contact-social-link">Google Maps</a>
              </div>
            </div>
          </div>

          <div className="contact-map-col">
            <iframe
              className="contact-map-frame"
              title={useT('Lokalizacja Off Cut Barbershop', 'Off Cut Barbershop Location')}
              src="https://maps.google.com/maps?q=Boles%C5%82awa+Krzywoustego+27+U4%2C+Szczecin&output=embed&z=16"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
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
