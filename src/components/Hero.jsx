import { useEffect, useState } from 'react';
import { useT } from '../context/LangContext';
import { useRouter } from '../context/RouterContext';

const SIXTY_DAYS = 60 * 24 * 60 * 60 * 1000;

export default function Hero() {
  const { navigate } = useRouter();
  const subLine1 = useT('Precyzyjne strzyżenie. Ponadczasowe rzemiosło.', 'Precision cuts. Timeless craft.');
  const subLine2 = useT('Gdzie pielęgnacja staje się rytuałem.', 'Where grooming becomes ritual.');
  const [lastBooking, setLastBooking] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('offcut-last-booking');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.completedAt < SIXTY_DAYS) setLastBooking(parsed);
    } catch {}
  }, []);

  const rebookLabel = useT(
    lastBooking ? `Umów ponownie u ${lastBooking.barberName}` : '',
    lastBooking ? `Book again with ${lastBooking.barberName}` : ''
  );

  return (
    <section className="hero" id="home">
      <div className="hero-bg" />
      <div className="hero-year">{useT('ZAŁ. 2019 — PREMIUM GROOMING', 'EST. 2019 — PREMIUM GROOMING')}</div>
      <div className="hero-content">
        <div className="hero-eyebrow">
          <span className="eyebrow-line" />
          <span>{useT('Szczecin', 'Szczecin')}</span>
          <span className="hero-eyebrow-sep" aria-hidden="true" />
          <span className="hero-eyebrow-est">{useT('ZAŁ. 2019', 'EST. 2019')}</span>
        </div>
        <h1 className="hero-title">
          <span className="hero-title-line">THE</span>
          <span className="hero-title-line">SHARP</span>
          <span className="hero-title-line">ART</span>
        </h1>
        <span className="hero-rule" aria-hidden="true" />
        <p className="hero-sub">
          {subLine1}<br />{subLine2}
        </p>
        <div className="hero-cta">
          <button className="btn-primary" onClick={() => navigate('/booking')}>{useT('Zarezerwuj wizytę', 'Book Appointment')}</button>
          <button className="btn-ghost" onClick={() => navigate('/services')}>{useT('Zobacz usługi', 'View Services')}</button>
        </div>
        {lastBooking && (
          <button
            className="hero-rebook"
            onClick={() => navigate('/booking', {
              preselectedBarber: lastBooking.barberId,
              preselectedService: lastBooking.serviceId,
            })}
          >
            {rebookLabel} →
          </button>
        )}
      </div>
      <div className="hero-scroll-hint">
        <div className="scroll-line" />
        <span>{useT('Przewiń', 'Scroll')}</span>
      </div>
    </section>
  );
}
