import { useMemo } from 'react';
import { useT, useLang } from '../context/LangContext';
import { useReveal } from '../hooks/useReveal';
import { useRouter } from '../context/RouterContext';
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
  const prices = variants.map((v) => priceFromLabel(v.price)).filter((n) => n != null);
  if (prices.length === 0) return s.price || '';
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return `${min} PLN`;
  return lang === 'pl' ? `od ${min} PLN` : `from ${min} PLN`;
}

function CategoryColumn({ category, items, lang, barberById, loading, revealDelay, onSelect }) {
  const eyebrowLang = lang === 'pl' ? category.altPL : category.altEN;
  const merged = useMemo(() => mergeByName(items), [items]);
  const emptyLabel = lang === 'pl'
    ? `${eyebrowLang}: brak pozycji`
    : `${eyebrowLang}: no items`;
  return (
    <div className={`services-col reveal reveal-delay-${revealDelay}`}>
      <header className="services-col-header">
        <div className="services-col-num">
          <span className="services-col-num-prefix"></span> {eyebrowLang}
        </div>
      </header>

      {loading ? (
        <SkeletonColumn />
      ) : merged.length === 0 ? (
        <div className="services-col-empty" role="status" aria-label={emptyLabel} />
      ) : (
        <ul className="services-index">
          {merged.map((s) => {
            const name = (lang === 'pl' ? s.namePL : s.nameEN) || s.namePL || s.nameEN || '';
            const price = mergedPriceLabel(s, lang);
            return (
              <li key={s.id}>
                <button
                  type="button"
                  className="services-index-row"
                  onClick={() => onSelect(s)}
                >
                  <span className="services-index-name">{name}</span>
                  {s.barberIds?.length > 0 && (
                    <span className="services-index-barbers" aria-hidden="true">
                      {s.barberIds.slice(0, 3).map((bid) => {
                        const b = barberById[bid];
                        if (!b?.photo) return null;
                        return (
                          <span key={bid} className="services-index-av-wrap" title={b.name}>
                            <img
                              src={b.photo}
                              alt=""
                              className="services-index-av"
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                                const wrap = e.currentTarget.parentElement;
                                if (wrap) wrap.style.display = 'none';
                              }}
                            />
                          </span>
                        );
                      })}
                    </span>
                  )}
                  {price ? <span className="services-index-price">{price}</span> : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function SkeletonColumn() {
  return (
    <ul className="services-index services-index--skeleton" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i}><div className="services-index-row services-index-row--skeleton" /></li>
      ))}
    </ul>
  );
}

export default function Services() {
  const ref = useReveal();
  const { navigate } = useRouter();
  const { lang } = useLang();
  const { barbers, services, loading, error } = useCatalog();

  const sectionNumber = useT('01 / USŁUGI', '01 / SERVICES');
  const sectionTitle = useT('Co robimy', 'What We Do');
  const fullPriceLink = useT('Pełny cennik →', 'Full price list →');
  const errorLine = useT('Cennik chwilowo niedostępny.', 'Price list temporarily unavailable.');
  const callLabel = useT('Zadzwoń:', 'Call:');

  const barberById = useMemo(
    () => Object.fromEntries(barbers.map((b) => [b.id, b])),
    [barbers]
  );

  const grouped = useMemo(() => {
    const groups = { hair: [], beard: [], combo: [] };
    for (const s of services) if (groups[s.category]) groups[s.category].push(s);
    return groups;
  }, [services]);

  const isEmptyCatalog =
    !loading && !error && CATEGORIES.every((c) => (grouped[c.id] || []).length === 0);

  const handleSelect = (s) => navigate('/booking', { preselectedService: s });

  return (
    <section id="services" className="services-section" ref={ref}>
      <div className="section-header">
        <div>
          <div className="section-number">{sectionNumber}</div>
          <div className="section-title">{sectionTitle}</div>
        </div>
        <a className="section-link" onClick={() => navigate('/services')} style={{ cursor: 'pointer' }}>
          {fullPriceLink}
        </a>
      </div>

      {error || isEmptyCatalog ? (
        <div className="services-fallback" role="status">
          <span className="services-fallback-line">{errorLine}</span>
          <span className="services-fallback-call">
            {callLabel}{' '}
            <a href="tel:+48731750600" className="services-fallback-phone">+48 731 750 600</a>
          </span>
        </div>
      ) : (
        <div className="services-columns">
          {CATEGORIES.map((cat, i) => (
            <CategoryColumn
              key={cat.id}
              category={cat}
              items={grouped[cat.id] || []}
              lang={lang}
              barberById={barberById}
              loading={loading}
              revealDelay={i + 1}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}
    </section>
  );
}
