import { useState } from 'react';
import { useT } from '../context/LangContext';
import { useReveal } from '../hooks/useReveal';

export default function Booking() {
  const ref = useReveal();
  const [status, setStatus] = useState(null);

  const confirmText = useT(
    'Oddzwonimy w ciągu 15 minut, aby potwierdzić termin i barbera (Pon–Sob 9–20).',
    "We'll call within 15 minutes to confirm date & barber (Mon–Sat 9–20)."
  );
  const okText = useT(
    'Otworzyliśmy Twoją pocztę z gotową wiadomością. Wyślij ją, aby dokończyć rezerwację.',
    'We opened your mail client with a prefilled message. Send it to complete your booking.'
  );

  function handleSubmit(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const subject = `Rezerwacja — ${data.name || 'nowy klient'}`;
    const body =
      `Imię: ${data.name}\n` +
      `Telefon: ${data.phone}\n` +
      `Usługa: ${data.service}\n` +
      `(Termin i barbera potwierdzimy telefonicznie.)`;
    window.location.href =
      `mailto:contact@offcut.pl?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus('ok');
  }

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
              <span className="booking-info-value booking-info-sub">{useT('Nie 10–16', 'Sun 10–16')}</span>
            </div>
            <div className="booking-info-item">
              <span className="booking-info-label">{useT('Telefon', 'Phone')}</span>
              <a className="booking-info-value booking-info-link" href="tel:+48601234567">+48 601 234 567</a>
            </div>
            <div className="booking-info-item">
              <span className="booking-info-label">{useT('Adres', 'Location')}</span>
              <span className="booking-info-value">ul. Niepodległości 21<br />70-412 Szczecin</span>
            </div>
          </div>
        </div>
        <form className="booking-form reveal reveal-delay-2" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="booking-name">{useT('Imię i nazwisko', 'Full name')}</label>
            <input id="booking-name" name="name" className="form-input" type="text" placeholder="Jan Kowalski" required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="booking-phone">{useT('Telefon', 'Phone')}</label>
            <input id="booking-phone" name="phone" className="form-input" type="tel" placeholder="+48 600 000 000" required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="booking-service">{useT('Usługa', 'Service')}</label>
            <select id="booking-service" name="service" className="form-input" required defaultValue="">
              <option value="" disabled>{useT('Wybierz usługę', 'Select a service')}</option>
              <option>{useT('Klasyczne strzyżenie — 80 PLN', 'Classic Cut — 80 PLN')}</option>
              <option>{useT('Fade & Blend — 100 PLN', 'Fade & Blend — 100 PLN')}</option>
              <option>{useT('Golenie brzytwą — 120 PLN', 'Hot Towel Shave — 120 PLN')}</option>
              <option>{useT('Rzeźbienie brody — 60 PLN', 'Beard Sculpt — 60 PLN')}</option>
              <option>{useT('Strzyżenie + Broda — 150 PLN', 'Cut + Beard — 150 PLN')}</option>
              <option>{useT('Strzyżenie Junior — 60 PLN', 'Junior Cut — 60 PLN')}</option>
            </select>
          </div>
          <button className="form-submit" type="submit">{useT('Wyślij rezerwację →', 'Request Booking →')}</button>
          <p className="form-note">{status === 'ok' ? okText : confirmText}</p>
        </form>
      </div>
    </section>
  );
}
