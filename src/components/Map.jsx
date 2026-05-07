import { useState } from 'react';
import { useReveal } from '../hooks/useReveal';
import { useT } from '../context/LangContext';

export default function Map() {
  const ref = useReveal();
  const [mapActive, setMapActive] = useState(false);

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
          </div>

          <div className="map-info-block">
            <div className="map-info-label">{useT('Telefon', 'Phone')}</div>
            <div className="map-info-value">
              <a href="tel:+48513340013" className="map-info-link">+48 513 340 013</a>
            </div>
          </div>

          <div className="map-info-block">
            <div className="map-info-label">{useT('Godziny otwarcia', 'Opening Hours')}</div>
            <div className="map-info-value">
              {useT('Pon – Sob', 'Mon – Sat')}<br />
              <span className="map-info-hours">09:00 – 20:00</span>
            </div>
            <div className="map-info-value" style={{ marginTop: '0.75rem' }}>
              {useT('Niedziela', 'Sunday')}<br />
              <span className="map-info-hours">10:00 – 16:00</span>
            </div>
          </div>

          <div className="map-info-block">
            <div className="map-info-label">Email</div>
            <div className="map-info-value">
              <a href="mailto:offcutszczecin@gmail.com" className="map-info-link">offcutszczecin@gmail.com</a>
            </div>
          </div>
        </div>

        <div className="map-frame-wrap reveal reveal-delay-2">
          {!mapActive && (
            <div className="map-tap-overlay" onClick={() => setMapActive(true)}>
              <div className="map-tap-hint">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  <circle cx="12" cy="9" r="2.5"/>
                </svg>
                {useT('Kliknij aby wejść w mapę', 'Tap to interact with map')}
              </div>
            </div>
          )}
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
