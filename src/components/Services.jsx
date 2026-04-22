import { useState } from 'react';
import { useT } from '../context/LangContext';
import { useReveal } from '../hooks/useReveal';
import { useRouter } from '../context/RouterContext';

export const services = [
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
  const [view, setView] = useState('grid');
  const { navigate } = useRouter();

  return (
    <section id="services" className="services-section" ref={ref}>
      <div className="section-header">
        <div>
          <div className="section-number">{useT('01 / USŁUGI', '01 / SERVICES')}</div>
          <div className="section-title">{useT('Co robimy', 'What we do')}</div>
        </div>
        <div className="services-header-right">
          <div className="view-toggle">
            <button className={`view-toggle-btn${view === 'grid' ? ' active' : ''}`} onClick={() => setView('grid')} aria-label="Grid view">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="0" y="0" width="5.5" height="5.5"/><rect x="7.5" y="0" width="5.5" height="5.5"/><rect x="0" y="7.5" width="5.5" height="5.5"/><rect x="7.5" y="7.5" width="5.5" height="5.5"/></svg>
            </button>
            <button className={`view-toggle-btn${view === 'list' ? ' active' : ''}`} onClick={() => setView('list')} aria-label="List view">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="0" y="0" width="13" height="1.5"/><rect x="0" y="5.75" width="13" height="1.5"/><rect x="0" y="11.5" width="13" height="1.5"/></svg>
            </button>
          </div>
          <a className="section-link" onClick={() => navigate('/prices')} style={{ cursor: 'pointer' }}>{useT('Pełny cennik →', 'Full price list →')}</a>
        </div>
      </div>
      <div className={view === 'list' ? 'services-list' : 'services-grid'}>
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
