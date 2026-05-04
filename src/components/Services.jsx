import React, { useMemo, useState } from 'react';
import { useT, useLang } from '../context/LangContext';
import { useReveal } from '../hooks/useReveal';
import { useRouter } from '../context/RouterContext';
import { useCatalog } from '../context/CatalogContext';

export default function Services() {
  const ref = useReveal();
  const [view, setView] = useState('list');
  const { navigate } = useRouter();
  const { lang } = useLang();
  const { barbers, services, loading } = useCatalog();

  const barberById = useMemo(
    () => Object.fromEntries(barbers.map(b => [b.id, b])),
    [barbers]
  );

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
        {!loading && services.slice(0, 6).map((s, i) => {
          const prev = i > 0 ? services[i - 1] : null;
          const firstBarberId = s.barberIds?.[0];
          const firstBarber = firstBarberId ? barberById[firstBarberId] : null;
          const prevFirstBarberId = prev?.barberIds?.[0];
          return (
            <React.Fragment key={s.id}>
              {view === 'list' && prev && prevFirstBarberId !== firstBarberId && (
                <div className="services-list-separator">
                  <span>{firstBarber?.name?.toUpperCase() ?? firstBarberId}</span>
                </div>
              )}
              <div className={`service-card reveal reveal-delay-${s.delay}`} onClick={() => navigate('/booking', { preselectedService: s })} style={{ cursor: 'pointer' }}>
                <div className="service-num">{s.id}</div>
                <div className="service-name">{lang === 'pl' ? s.namePL : s.nameEN}</div>
                <div className="service-desc">{lang === 'pl' ? s.descPL : s.descEN}</div>
                {s.barberIds?.length > 0 && (
                  <div className="service-barbers">
                    {s.barberIds.map((bid) => {
                      const b = barberById[bid];
                      if (!b) return null;
                      return (
                        <div key={bid} className="service-barber-av-wrap" title={b.name}>
                          <img src={b.photo} alt={b.name} className="service-barber-av" />
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="service-price">
                  <span>{s.duration}</span>
                  <span className="service-price-amount">{s.price}</span>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}
