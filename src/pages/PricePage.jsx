import { useState, useEffect, useMemo } from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { useT, useLang } from '../context/LangContext';
import { useRouter } from '../context/RouterContext';
import { useIsDark } from '../hooks/useIsDark';
import { useCatalog } from '../context/CatalogContext';

const CATEGORIES = [
  { id: 'hair',  num: '01', altPL: 'WŁOSY',  altEN: 'HAIR'  },
  { id: 'beard', num: '02', altPL: 'BRODA',  altEN: 'BEARD' },
  { id: 'combo', num: '03', altPL: 'ZESTAW', altEN: 'COMBO' },
];

function mergeByName(services) {
  const seen = new Map();
  for (const s of services) {
    const existing = seen.get(s.namePL);
    if (!existing) {
      seen.set(s.namePL, {
        ...s,
        barberIds: [...(s.barberIds ?? [])],
        variants: [s],
      });
      continue;
    }
    existing.variants.push(s);
    for (const bid of s.barberIds ?? []) {
      if (!existing.barberIds.includes(bid)) existing.barberIds.push(bid);
    }
  }
  return Array.from(seen.values());
}

function priceFromLabel(label) {
  const match = (label ?? '').match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

function mergedPriceLabel(s, lang) {
  const variants = s.variants ?? [s];
  const prices = variants.map(v => priceFromLabel(v.price)).filter(n => n != null);
  if (prices.length === 0) return s.price || '';
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return `${min} PLN`;
  return lang === 'pl' ? `od ${min} PLN` : `from ${min} PLN`;
}

function mergedDurationLabel(s) {
  const variants = s.variants ?? [s];
  const label = variants.map(v => v.duration).find(Boolean);
  return label || null;
}

function groupByCategory(svcs) {
  const buckets = { hair: [], beard: [], combo: [] };
  for (const s of svcs) if (buckets[s.category]) buckets[s.category].push(s);
  return CATEGORIES
    .map(cat => ({ category: cat, services: mergeByName(buckets[cat.id]) }))
    .filter(g => g.services.length > 0);
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

  const groups = useMemo(() => groupByCategory(services), [services]);
  const barberById = useMemo(
    () => Object.fromEntries(barbers.map(b => [b.id, b])),
    [barbers]
  );

  return (
    <>
      <Nav />
      <div className="prices-page-hero">
        <button className="page-back-btn" onClick={() => navigate('/')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          {useT('Wróć', 'Back')}
        </button>
        <h1 className="blog-page-title">{useT('Usługi', 'Services')}</h1>
        <p className="blog-page-sub">
          {useT(
            'Wszystkie usługi w jednym miejscu. Czas i cena — bez niespodzianek.',
            'All services in one place. Time and price — no surprises.'
          )}
        </p>
        <div className="prices-hero-cta">
          <button className="btn-primary" onClick={() => navigate('/booking')}>
            {useT('Zarezerwuj wizytę', 'Book an appointment')}
          </button>
          <button className="btn-ghost" onClick={() => navigate('/crew')}>
            {useT('Poznaj ekipę', 'Meet the Crew')}
          </button>
        </div>
      </div>

      <section className="prices-full-section">
        <div className="prices-groups">
          {groups.map(group => {
            const cat = group.category;
            const catLabel = lang === 'pl' ? cat.altPL : cat.altEN;
            return (
              <div key={cat.id} className="prices-group">

                <div className="prices-group-header prices-group-header--cat">
                  <div className="prices-group-cat">
                    <span className="prices-group-cat-name">{catLabel}</span>
                  </div>
                </div>

                <div className="prices-service-list">
                  {group.services.map(s => {
                    const dur = mergedDurationLabel(s);
                    const price = mergedPriceLabel(s, lang);
                    return (
                      <div
                        key={s.id}
                        className="prices-service-row"
                        onClick={() => navigate('/booking', { preselectedService: s })}
                      >
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
                          {dur ? <span className="psr-dur">{dur}</span> : null}
                          {price ? <span className="psr-price">{price}</span> : null}
                        </div>
                        <span className="psr-book-arrow">→</span>
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>
      </section>

      <Footer />
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
