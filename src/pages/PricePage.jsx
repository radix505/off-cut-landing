import { useState, useEffect, useMemo } from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { useT, useLang } from '../context/LangContext';
import { useRouter } from '../context/RouterContext';
import { useIsDark } from '../hooks/useIsDark';
import { useCatalog } from '../context/CatalogContext';

function groupServices(svcs) {
  const groups = [];
  svcs.forEach(s => {
    const key = (s.barberIds ?? []).join(',');
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.services.push(s);
    else groups.push({ key, barberIds: s.barberIds ?? [], services: [s] });
  });
  return groups;
}

export default function PricePage() {
  const { navigate } = useRouter();
  const { lang } = useLang();
  const isDark = useIsDark();
  const { barbers, services } = useCatalog();
  const btnStyle = isDark
    ? { background: 'rgba(255,255,255,0.13)', borderColor: 'rgba(255,255,255,0.35)', color: '#fff' }
    : {};

  const [atTop, setAtTop] = useState(true);
  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const groups = groupServices(services);
  const barberById = useMemo(
    () => Object.fromEntries(barbers.map(b => [b.id, b])),
    [barbers]
  );

  return (
    <>
      <Nav />
      <div className="prices-page-hero">
        <div className="blog-page-eyebrow">Off Cut — Barbershop</div>
        <h1 className="blog-page-title">{useT('Usługi', 'Services')}</h1>
        <p className="blog-page-sub">
          {useT(
            'Wszystkie usługi w jednym miejscu. Czas i cena — bez niespodzianek.',
            'All services in one place. Time and price — no surprises.'
          )}
        </p>
      </div>

      <section className="prices-full-section">
        <div className="prices-groups">
          {groups.map(group => {
            const headBarber = barberById[group.barberIds[0]];
            return (
              <div key={group.key} className="prices-group">

                <div className="prices-group-header">
                  <div className="prices-group-avatars">
                    {group.barberIds.map(id => {
                      const b = barberById[id];
                      if (!b) return null;
                      return (
                        <div key={id} className="prices-group-av-wrap">
                          <img src={b.photo} alt={b.name} className="prices-group-av" />
                        </div>
                      );
                    })}
                  </div>
                  <div className="prices-group-names">
                    <span className="prices-group-name">
                      {group.barberIds.map(id => barberById[id]?.name).filter(Boolean).join(' & ')}
                    </span>
                    <span className="prices-group-title">
                      {lang === 'pl' ? headBarber?.titlePL : headBarber?.titleEN}
                    </span>
                  </div>
                  <div className="prices-group-count">
                    {group.services.length} {useT('usług', 'services')}
                  </div>
                </div>

                <div className="prices-service-list">
                  {group.services.map(s => (
                    <div
                      key={s.id}
                      className="prices-service-row"
                      onClick={() => navigate('/booking', { preselectedService: s })}
                    >
                      <span className="psr-num">{s.id}</span>
                      <div className="psr-info">
                        <span className="psr-name">{lang === 'pl' ? s.namePL : s.nameEN}</span>
                        <span className="psr-desc">{lang === 'pl' ? s.descPL : s.descEN}</span>
                      </div>
                      <div className="psr-barbers">
                        {(s.barberIds ?? []).map(id => {
                          const b = barberById[id];
                          if (!b) return null;
                          return (
                            <div key={id} className="psr-av-wrap">
                              <img src={b.photo} alt={b.name} className="psr-av" title={b.name} />
                            </div>
                          );
                        })}
                      </div>
                      <div className="psr-meta">
                        <span className="psr-dur">{s.duration}</span>
                        <span className="psr-price">{s.price}</span>
                      </div>
                      <span className="psr-book-arrow">→</span>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>
      </section>

      <Footer />
      <button className="page-back-btn" onClick={() => navigate('/')}>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        {useT('Wróć', 'Back')}
      </button>
      <button
        className="scroll-top-btn"
        style={{ ...btnStyle, opacity: atTop ? 0 : undefined, pointerEvents: atTop ? 'none' : undefined, transition: 'opacity 0.3s' }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
    </>
  );
}
