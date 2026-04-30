import { useT } from '../context/LangContext';
import { useReveal } from '../hooks/useReveal';
import { useRouter } from '../context/RouterContext';
import { barbers } from '../data/barbers';

export default function Barbers() {
  const ref = useReveal();
  const { navigate } = useRouter();
  return (
    <section id="barbers" className="barbers-section" ref={ref}>
      <div className="section-header">
        <div>
          <div className="section-number">{useT('02 / ZESPÓŁ', '02 / TEAM')}</div>
          <div className="section-title">{useT('Barberzy', 'The Barbers')}</div>
        </div>
        <a className="section-link" style={{ cursor: 'pointer' }} onClick={() => navigate('/crew')}>
          {useT('Poznaj ekipę →', 'Meet the crew →')}
        </a>
      </div>
      <div className="barbers-grid">
        {barbers.map((b) => (
          <div
            key={b.name}
            className={`barber-card reveal reveal-delay-${b.delay}`}
            onClick={() => navigate('/crew/' + b.slug)}
            style={{ cursor: 'pointer' }}
          >
            <div className="barber-portrait">
              {b.photo
                ? <img src={b.photo} alt={b.name} className="barber-photo" />
                : <div className="barber-portrait-placeholder">
                    <div className="barber-silhouette" />
                    <span className="portrait-label">{useT('Zdjęcie placeholder', 'Photo placeholder')}</span>
                  </div>
              }
              <div className="barber-overlay">
                <div className="barber-name">{b.name}</div>
                <div className="barber-title">{useT(b.titlePL, b.titleEN)}</div>
                <p className="barber-bio-hover">{useT(b.bio.pl, b.bio.en)}</p>
              </div>
            </div>
            <div className="barber-info">
              <div className="barber-spec">
                {b.tags.map((t) => (
                  <span key={t.en} className="spec-tag">{useT(t.pl, t.en)}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
