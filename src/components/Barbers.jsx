import { useT, useLang } from '../context/LangContext';
import { useReveal } from '../hooks/useReveal';
import { useRouter } from '../context/RouterContext';
import { useCatalog } from '../context/CatalogContext';

export default function Barbers() {
  const ref = useReveal();
  const { navigate } = useRouter();
  const { lang } = useLang();
  const { barbers } = useCatalog();
  return (
    <section id="barbers" className="barbers-section" ref={ref}>
      <div className="section-header">
        <div>
          <div className="section-title">{useT('Barberzy', 'The Barbers')}</div>
        </div>
        <a className="section-link" style={{ cursor: 'pointer' }} onClick={() => navigate('/crew')}>
          {useT('Poznaj ekipę →', 'Meet the crew →')}
        </a>
      </div>
      <div className="barbers-grid">
        {barbers.map((b) => (
          <div
            key={b.id}
            className={`barber-card reveal reveal-delay-${b.delay}`}
            onClick={() => navigate('/crew/' + b.slug)}
            style={{ cursor: 'pointer' }}
          >
            <div className="barber-portrait">
              {b.photo
                ? <img src={b.photo} alt={b.name} className="barber-photo" loading="lazy" decoding="async" />
                : <div className="barber-portrait-placeholder">
                    <div className="barber-silhouette" />
                    <span className="portrait-label">{lang === 'pl' ? 'Zdjęcie placeholder' : 'Photo placeholder'}</span>
                  </div>
              }
              <div className="barber-overlay">
                <div className="barber-name">{b.name}</div>
                <div className="barber-title">{lang === 'pl' ? b.titlePL : b.titleEN}</div>
                <p className="barber-bio-hover"><span>{lang === 'pl' ? b.bio.pl : b.bio.en}</span></p>
              </div>
            </div>
            <div className="barber-info">
              <div className="barber-spec">
                {b.tags.map((t) => (
                  <span key={t.en} className="spec-tag">{lang === 'pl' ? t.pl : t.en}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
