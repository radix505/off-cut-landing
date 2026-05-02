import { useT } from '../context/LangContext';
import { useRouter } from '../context/RouterContext';

export default function Hero() {
  const { navigate } = useRouter();
  const subLine1 = useT('Precyzyjne strzyżenie. Ponadczasowe rzemiosło.', 'Precision cuts. Timeless craft.');
  const subLine2 = useT('Gdzie pielęgnacja staje się rytuałem.', 'Where grooming becomes ritual.');

  return (
    <section className="hero" id="home">
      <div className="hero-bg" />
      <div className="hero-grid-lines" />
      <div className="hero-year">{useT('ZAŁ. 2019 — PREMIUM GROOMING', 'EST. 2019 — PREMIUM GROOMING')}</div>
      <div className="hero-content">
        <div className="hero-eyebrow">
          <span className="eyebrow-line" />
          <span>{useT('Szczecin', 'Szczecin')}</span>
        </div>
        <h1 className="hero-title">
          <span className="hero-title-line">THE</span>
          <span className="hero-title-line">SHARP</span>
          <span className="hero-title-line">ART</span>
        </h1>
        <p className="hero-sub">
          {subLine1}<br />{subLine2}
        </p>
        <div className="hero-cta">
          <button className="btn-primary" onClick={() => navigate('/booking')}>{useT('Zarezerwuj wizytę', 'Book Appointment')}</button>
          <button className="btn-ghost" onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}>{useT('Zobacz usługi', 'View Services')}</button>
        </div>
      </div>
      <div className="hero-scroll-hint">
        <div className="scroll-line" />
        <span>{useT('Przewiń', 'Scroll')}</span>
      </div>
    </section>
  );
}
