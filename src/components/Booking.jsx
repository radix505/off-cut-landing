import { useT } from '../context/LangContext';
import { useReveal } from '../hooks/useReveal';

export default function Booking() {
  const ref = useReveal();
  return (
    <section id="booking" className="booking-section" ref={ref}>
      <div className="section-header">
        <div>
          <div className="section-number">{useT('04 / REZERWACJA', '04 / BOOKING')}</div>
          <div className="section-title">{useT('Zarezerwuj fotel', 'Reserve your chair')}</div>
        </div>
      </div>
      <div className="booking-layout">
        <div className="booking-text reveal">
          <h2>
            {useT('ZAREZERWUJ', 'BOOK')}<br />
            {useT('SWÓJ', 'YOUR')}<br />
            {useT('TERMIN', 'SLOT')}
          </h2>
          <p>
            {useT(
              'Wizyty walk-in dostępne gdy mamy wolne miejsca. Aby mieć pewność co do wybranego barbera, rezerwuj z wyprzedzeniem.',
              'Walk-ins welcome when available. For guaranteed access to your preferred barber, book ahead.'
            )}
          </p>
          <div className="booking-info-row">
            <div className="booking-info-item">
              <span className="booking-info-label">{useT('Godziny', 'Hours')}</span>
              <span className="booking-info-value">{useT('Pon–Sob 9–20', 'Mon–Sat 9–20')}</span>
              <span className="booking-info-value" style={{ color: '#555', fontSize: '0.7rem' }}>{useT('Nie 10–16', 'Sun 10–16')}</span>
            </div>
            <div className="booking-info-item">
              <span className="booking-info-label">{useT('Telefon', 'Phone')}</span>
              <span className="booking-info-value">+48 600 000 000</span>
            </div>
            <div className="booking-info-item">
              <span className="booking-info-label">{useT('Adres', 'Location')}</span>
              <span className="booking-info-value">ul. Twoja 1<br />Poznań</span>
            </div>
          </div>
        </div>
        <div className="booking-form reveal reveal-delay-2">
          <div className="form-group">
            <label className="form-label">{useT('Imię i nazwisko', 'Full name')}</label>
            <input className="form-input" type="text" placeholder="Jan Kowalski" />
          </div>
          <div className="form-group">
            <label className="form-label">{useT('Preferowany barber', 'Preferred barber')}</label>
            <select className="form-input">
              <option value="">{useT('Bez preferencji', 'No preference')}</option>
              <option>Olek</option>
              <option>Julia</option>
              <option>Nico</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{useT('Usługa', 'Service')}</label>
            <select className="form-input">
              <option value="">{useT('Wybierz usługę', 'Select a service')}</option>
              <option>{useT('Strzyżenie Męskie Włosy Krótkie — 100 PLN', 'Men\'s Cut Short Hair — 100 PLN')}</option>
              <option>{useT('Strzyżenie Męskie Włosy Długie — 110 PLN', 'Men\'s Cut Long Hair — 110 PLN')}</option>
              <option>{useT('Trymowanie Brody — 80 PLN', 'Beard Trim — 80 PLN')}</option>
              <option>{useT('Strzyżenie Głowy i Brody — 140 PLN', 'Cut & Beard — 140 PLN')}</option>
              <option>{useT('Golenie Głowy Maszynką — 50 PLN', 'Head Shave — 50 PLN')}</option>
              <option>{useT('Golenie Głowy Maszynką + Broda — 100 PLN', 'Head Shave + Beard — 100 PLN')}</option>
              <option>{useT('Strzyżenie Głowy i Brody + Brzytwa — 170 PLN', 'Cut & Beard + Straight Razor — 170 PLN')}</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{useT('Data i godzina', 'Date & time')}</label>
            <input className="form-input" type="datetime-local" />
          </div>
          <div className="form-group">
            <label className="form-label">{useT('Telefon', 'Phone')}</label>
            <input className="form-input" type="tel" placeholder="+48 600 000 000" />
          </div>
          <button className="form-submit">{useT('Wyślij rezerwację →', 'Request Booking →')}</button>
        </div>
      </div>
    </section>
  );
}
