import { useReveal } from '../hooks/useReveal';
import { useT, useLang } from '../context/LangContext';
import { HOURS_SUMMARY } from '../data/businessHours';

export default function Map() {
  const ref = useReveal();
  const { lang } = useLang();

  return (
    <section id="location" className="map-section" ref={ref}>
      <div className="section-header">
        <div>
          <div className="section-number">{useT('07 / LOKALIZACJA', '07 / LOCATION')}</div>
          <div className="section-title">{useT('Znajdź nas', 'Find Us')}</div>
        </div>
        <a
          className="section-link"
          href="https://maps.google.com/?q=Bolesława+Krzywoustego+27+U4,+Szczecin"
          target="_blank"
          rel="noopener noreferrer"
        >
          {useT('Otwórz w mapach →', 'Open in Maps →')}
        </a>
      </div>

      <div className="map-layout reveal">
        <div className="map-info">
          <div className="map-info-block">
            <div className="map-info-label">{useT('Adres', 'Address')}</div>
            <div className="map-info-value">
              Bolesława Krzywoustego 27 U4<br />70-316 Szczecin
            </div>
            <a
              className="map-directions-cta"
              href="https://www.google.com/maps/dir/?api=1&destination=Bole%C5%82awa+Krzywoustego+27+U4%2C+Szczecin"
              target="_blank"
              rel="noopener noreferrer"
            >
              {useT('Wyznacz trasę', 'Get directions')} →
            </a>
          </div>

          <div className="map-info-block">
            <div className="map-info-label">{useT('Telefon', 'Phone')}</div>
            <div className="map-info-value">
              <a href="tel:+48513340013" className="map-info-link">+48 513 340 013</a>
            </div>
          </div>

          <div className="map-info-block">
            <div className="map-info-label">{useT('Godziny otwarcia', 'Opening Hours')}</div>
            {HOURS_SUMMARY.map((slot, i) => (
              <div
                key={slot.labelEN}
                className="map-info-value"
                style={i > 0 ? { marginTop: '0.75rem' } : undefined}
              >
                {lang === 'pl' ? slot.labelPL : slot.labelEN}<br />
                <span className="map-info-hours">{slot.range}</span>
              </div>
            ))}
          </div>

          <div className="map-info-block">
            <div className="map-info-label">Email</div>
            <div className="map-info-value">
              <a href="mailto:offcutszczecin@gmail.com" className="map-info-link">offcutszczecin@gmail.com</a>
            </div>
          </div>
        </div>

        <div className="map-frame-wrap reveal reveal-delay-2">
          <iframe
            className="map-frame"
            title={useT('Lokalizacja Off Cut Barbershop', 'Off Cut Barbershop Location')}
            src="https://maps.google.com/maps?q=Boles%C5%82awa+Krzywoustego+27+U4%2C+Szczecin&output=embed&z=16"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
