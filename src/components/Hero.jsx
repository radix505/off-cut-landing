import { useT } from '../context/LangContext';

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

export default function Hero() {
  const subLine1 = useT('Precyzyjne strzyżenie. Bezczasowe rzemiosło.', 'Precision cuts. Timeless craft.');
  const subLine2 = useT('Rezerwacja online w 60 sekund.', 'Online booking in 60 seconds.');

  return (
    <section className="hero" id="home">
      <div className="hero-bg" />
      <div className="hero-grid-lines" />
      <div className="hero-year">{useT('ZAŁ. 2019 — PREMIUM GROOMING', 'EST. 2019 — PREMIUM GROOMING')}</div>
      <div className="hero-content">
        <div className="hero-rating">
          <span className="hero-rating-stars" aria-hidden="true">★★★★★</span>
          <span className="hero-rating-text">{useT('4.9 / 5 — 127 opinii Google', '4.9 / 5 — 127 Google reviews')}</span>
        </div>
        <div className="hero-eyebrow">
          <span className="eyebrow-line" aria-hidden="true" />
          <span>{useT('Szczecin — ul. Niepodległości 21', 'Szczecin — ul. Niepodległości 21')}</span>
        </div>
        <h1 className="hero-title">
          <span className="hero-title-line">{useT('MISTRZ', 'MASTER')}</span>
          <span className="hero-title-line">{useT('BARBER', 'BARBER')}</span>
          <span className="hero-title-line">{useT('SZCZECIN', 'SZCZECIN')}</span>
        </h1>
        <p className="hero-sub">
          {subLine1}<br />{subLine2}
        </p>
        <div className="hero-cta">
          <button className="btn-primary" onClick={() => scrollTo('booking')}>
            {useT('Zarezerwuj wizytę', 'Book Appointment')}
          </button>
          <button className="btn-ghost" onClick={() => scrollTo('services')}>
            {useT('Zobacz usługi', 'View Services')}
          </button>
        </div>
      </div>
      <div className="hero-scroll-hint" aria-hidden="true">
        <div className="scroll-line" />
        <span>Scroll</span>
      </div>
    </section>
  );
}
