import React, { useState } from 'react';
import { useT } from '../context/LangContext';
import { useReveal } from '../hooks/useReveal';
import { useRouter } from '../context/RouterContext';

const BARBER_PHOTO = {
  'ALEKSANDER': '/team/Aleksander.jpeg',
  'OLEK':       '/team/Aleksander.jpeg',
  'JULIA':      '/team/Julia.jpeg',
  'NICO':       '/team/Nico.jpeg',
};

export const services = [
  {
    num: '001',
    namePL: 'Strzyżenie Męskie Włosy Krótkie', nameEN: 'Men\'s Cut — Short Hair',
    descPL: 'Precyzyjne strzyżenie krótkich włosów. Czyste linie, dopasowane do kształtu głowy.',
    descEN: 'Precise short hair cut. Clean lines, shaped to your head.',
    duration: '50 min', price: '100 PLN', delay: 1,
    barbers: ['OLEK', 'JULIA'],
  },
  {
    num: '002',
    namePL: 'Strzyżenie Męskie Włosy Długie', nameEN: 'Men\'s Cut — Long Hair',
    descPL: 'Strzyżenie długich włosów z dbałością o teksturę i ruch.',
    descEN: 'Long hair cut with attention to texture and movement.',
    duration: '1h', price: '110 PLN', delay: 2,
    barbers: ['OLEK', 'JULIA'],
  },
  {
    num: '003',
    namePL: 'Trymowanie Brody', nameEN: 'Beard Trim',
    descPL: 'Kształt, krawędzie, definicja. Broda pod kontrolą.',
    descEN: 'Shape, edge, define. Beard back in line.',
    duration: '20 min', price: '80 PLN', delay: 3,
    barbers: ['OLEK', 'JULIA'],
  },
  {
    num: '004',
    namePL: 'Strzyżenie Głowy i Brody', nameEN: 'Cut & Beard',
    descPL: 'Kompletna wizyta. Włosy i broda w jednym czasie, przez jednego rzemieślnika.',
    descEN: 'Full visit. Hair and beard in one sitting, by one craftsman.',
    duration: '1h 10min', price: '140 PLN', delay: 1,
    barbers: ['OLEK', 'JULIA'],
  },
  {
    num: '005',
    namePL: 'Golenie Głowy Maszynką', nameEN: 'Head Shave — One Length',
    descPL: 'Gładkie golenie maszynką na jedną długość. Szybko, czysto, równo.',
    descEN: 'Clean machine shave at one length. Fast, precise, even.',
    duration: '10 min', price: '50 PLN', delay: 2,
    barbers: ['OLEK', 'JULIA'],
  },
  {
    num: '006',
    namePL: 'Golenie Głowy Maszynką + Broda', nameEN: 'Head Shave + Beard',
    descPL: 'Golenie głowy maszynką z pełnym trymowaniem brody.',
    descEN: 'Machine head shave with full beard trim.',
    duration: '30 min', price: '100 PLN', delay: 3,
    barbers: ['OLEK', 'JULIA'],
  },
  {
    num: '007',
    namePL: 'Strzyżenie Głowy i Brody + Brzytwa', nameEN: 'Cut & Beard + Straight Razor',
    descPL: 'Pełne doświadczenie. Strzyżenie, broda i wykończenie brzytwą.',
    descEN: 'The full experience. Cut, beard, and straight razor finish.',
    duration: '1h 15min', price: '170 PLN', delay: 2,
    barbers: ['OLEK', 'JULIA'],
  },
  {
    num: '008',
    namePL: 'Strzyżenie Męskie Włosy Krótkie', nameEN: 'Men\'s Cut — Short Hair',
    descPL: 'Precyzyjne strzyżenie krótkich włosów. Czyste linie, dopasowane do kształtu głowy.',
    descEN: 'Precise short hair cut. Clean lines, shaped to your head.',
    duration: '1h', price: '80 PLN', delay: 3,
    barbers: ['NICO'],
  },
  {
    num: '009',
    namePL: 'Strzyżenie Męskie Włosy Długie', nameEN: 'Men\'s Cut — Long Hair',
    descPL: 'Strzyżenie długich włosów z dbałością o teksturę i ruch.',
    descEN: 'Long hair cut with attention to texture and movement.',
    duration: '1h 20min', price: '90 PLN', delay: 1,
    barbers: ['NICO'],
  },
  {
    num: '010',
    namePL: 'Trymowanie Brody', nameEN: 'Beard Trim',
    descPL: 'Kształt, krawędzie, definicja. Broda pod kontrolą.',
    descEN: 'Shape, edge, define. Beard back in line.',
    duration: '40 min', price: '60 PLN', delay: 2,
    barbers: ['NICO'],
  },
  {
    num: '011',
    namePL: 'Strzyżenie Głowy i Brody', nameEN: 'Cut & Beard',
    descPL: 'Kompletna wizyta. Włosy i broda w jednym czasie, przez jednego rzemieślnika.',
    descEN: 'Full visit. Hair and beard in one sitting, by one craftsman.',
    duration: '1h 30min', price: '130 PLN', delay: 3,
    barbers: ['NICO'],
  },
  {
    num: '012',
    namePL: 'Golenie Głowy Maszynką', nameEN: 'Head Shave — One Length',
    descPL: 'Gładkie golenie maszynką na jedną długość. Szybko, czysto, równo.',
    descEN: 'Clean machine shave at one length. Fast, precise, even.',
    duration: '30 min', price: '40 PLN', delay: 1,
    barbers: ['NICO'],
  },
  {
    num: '013',
    namePL: 'Golenie Głowy Maszynką + Broda', nameEN: 'Head Shave + Beard',
    descPL: 'Golenie głowy maszynką z pełnym trymowaniem brody.',
    descEN: 'Machine head shave with full beard trim.',
    duration: '1h', price: '100 PLN', delay: 2,
    barbers: ['NICO'],
  },
];

export default function Services() {
  const ref = useReveal();
  const [view, setView] = useState('list');
  const { navigate } = useRouter();

  return (
    <section id="services" className="services-section" ref={ref}>
      <div className="section-header">
        <div>
          <div className="section-number">{useT('01 / USŁUGI', '01 / SERVICES')}</div>
          <div className="section-title">{useT('Co robimy', 'Top Services')}</div>
        </div>
        <div className="services-header-right">
          <div className="view-toggle">
            <button className={`view-toggle-btn${view === 'grid' ? ' active' : ''}`} onClick={() => setView('grid')} aria-label="Grid view">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="0" y="0" width="5.5" height="5.5"/><rect x="7.5" y="0" width="5.5" height="5.5"/><rect x="0" y="7.5" width="5.5" height="5.5"/><rect x="7.5" y="7.5" width="5.5" height="5.5"/></svg>
            </button>
            <div className="view-toggle-list-wrap">
              {view === 'grid' && (
                <div className="view-toggle-hint" aria-hidden="true">
                  <svg width="10" height="14" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="5" y1="0" x2="5" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    <polyline points="1,6 5,11 9,6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </div>
              )}
              <button className={`view-toggle-btn${view === 'list' ? ' active' : ''}`} onClick={() => setView('list')} aria-label="List view">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="0" y="0" width="13" height="1.5"/><rect x="0" y="5.75" width="13" height="1.5"/><rect x="0" y="11.5" width="13" height="1.5"/></svg>
              </button>
            </div>
          </div>
          <a className="section-link" onClick={() => navigate('/prices')} style={{ cursor: 'pointer' }}>{useT('Pełny cennik →', 'Full price list →')}</a>
        </div>
      </div>
      <div className={view === 'list' ? 'services-list' : 'services-grid'}>
        {services.slice(0, 4).map((s, i) => (
          <React.Fragment key={s.num}>
            {view === 'list' && i > 0 && services[i - 1].barbers?.[0] !== s.barbers?.[0] && (
              <div className="services-list-separator">
                <span>{s.barbers?.[0]}</span>
              </div>
            )}
            <div className={`service-card service-fly service-fly--${i % 2 === 0 ? 'left' : 'right'}`} style={{ cursor: 'pointer', animationDelay: `${i * 0.08}s` }} onClick={() => navigate('/booking', { preselectedService: s })}>
              <div className="service-num">{s.num}</div>
              <div className="service-name">{useT(s.namePL, s.nameEN)}</div>
              <div className="service-desc">{useT(s.descPL, s.descEN)}</div>
              {s.barbers && (
                <div className="service-barbers">
                  {s.barbers.map((b) => (
                    <div key={b} className="service-barber-av-wrap" title={b === 'OLEK' ? 'ALEKSANDER' : b}>
                      <img src={BARBER_PHOTO[b]} alt={b} className="service-barber-av" loading="lazy" decoding="async" />
                    </div>
                  ))}
                </div>
              )}
              <div className="service-price">
                <span>{s.duration}</span>
                <span className="service-price-amount">{s.price}</span>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
      <div className="services-see-all">
        <button className="services-see-all-btn" onClick={() => navigate('/prices')}>
          {useT('Zobacz wszystkie usługi →', 'See all services →')}
        </button>
      </div>
    </section>
  );
}
