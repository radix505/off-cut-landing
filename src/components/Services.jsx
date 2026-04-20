import { useT } from '../context/LangContext';
import { useReveal } from '../hooks/useReveal';

const services = [
  {
    num: '001',
    namePL: 'Klasyczne Strzyżenie', nameEN: 'Classic Cut',
    descPL: 'Fundament. Precyzyjna praca nożyczkami dopasowana do kształtu twarzy i stylu życia.',
    descEN: 'The foundation. Precision scissor work tailored to your face shape and lifestyle.',
    duration: '45 min', price: '80 PLN', delay: 1,
  },
  {
    num: '002',
    namePL: 'Fade & Blend', nameEN: 'Fade & Blend',
    descPL: 'Maszynowe rzeźbienie od skóry do czubka. Czyste linie, płynne przejścia.',
    descEN: 'Machine-sculpted from skin to crown. Clean lines, smooth transitions.',
    duration: '50 min', price: '100 PLN', delay: 2,
  },
  {
    num: '003',
    namePL: 'Golenie Brzytwą', nameEN: 'Hot Towel Shave',
    descPL: 'Stary rytuał. Brzytwa, gorący ręcznik, premium balsam. Pełne doświadczenie.',
    descEN: 'Old-world ritual. Straight razor, hot towel, premium balm. The full experience.',
    duration: '60 min', price: '120 PLN', delay: 3,
  },
  {
    num: '004',
    namePL: 'Rzeźbienie Brody', nameEN: 'Beard Sculpt',
    descPL: 'Kształt, definicja, krawędzie. Twoja broda jako statement, nie przypadek.',
    descEN: 'Shape, define, edge. Your beard as a statement, not an afterthought.',
    duration: '30 min', price: '60 PLN', delay: 1,
  },
  {
    num: '005',
    namePL: 'Strzyżenie + Broda', nameEN: 'Cut + Beard',
    descPL: 'Kompletny pakiet. Od głowy po szczękę, przez jednego rzemieślnika, w jednej wizycie.',
    descEN: 'The complete package. Head-to-jaw, handled by one craftsman, one sitting.',
    duration: '75 min', price: '150 PLN', delay: 2,
  },
  {
    num: '006',
    namePL: 'Strzyżenie Junior', nameEN: 'Junior Cut',
    descPL: 'Cierpliwe ręce dla najmłodszych. Ta sama jakość, ta sama uwaga.',
    descEN: 'Patient hands for young clients. Same quality, same attention.',
    duration: '30 min', price: '60 PLN', delay: 3,
  },
];

export default function Services() {
  const ref = useReveal();
  return (
    <section id="services" className="services-section" ref={ref}>
      <div className="section-header">
        <div>
          <div className="section-number">{useT('01 / USŁUGI', '01 / SERVICES')}</div>
          <div className="section-title">{useT('Co robimy', 'What we do')}</div>
        </div>
        <a className="section-link">{useT('Pełny cennik →', 'Full price list →')}</a>
      </div>
      <div className="services-grid">
        {services.map((s) => (
          <div key={s.num} className={`service-card reveal reveal-delay-${s.delay}`}>
            <div className="service-num">{s.num}</div>
            <div className="service-name">{useT(s.namePL, s.nameEN)}</div>
            <div className="service-desc">{useT(s.descPL, s.descEN)}</div>
            <div className="service-price">
              <span>{s.duration}</span>
              <span className="service-price-amount">{s.price}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
