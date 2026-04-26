import { useT } from '../context/LangContext';
import { useReveal } from '../hooks/useReveal';

const barbers = [
  {
    name: 'NICO',
    titlePL: 'Barber', titleEN: 'Barber',
    photo: '/team/Nico.jpeg',
    tags: [
      { pl: 'Klasyczne strzyżenie', en: 'Classic Cut' },
      { pl: 'Broda', en: 'Beard' },
      { pl: 'Gorący ręcznik', en: 'Hot Towel' },
    ],
    delay: 1,
  },
  {
    name: 'ALEKSANDER',
    titlePL: 'Master Barber', titleEN: 'Master Barber',
    photo: '/team/Aleksander.jpeg',
    tags: [
      { pl: 'Fade', en: 'Fade' },
      { pl: 'Broda', en: 'Beard' },
      { pl: 'Skin Fade', en: 'Skin Fade' },
    ],
    delay: 2,
  },
  {
    name: 'JULIA',
    titlePL: 'Barber', titleEN: 'Barber',
    photo: '/team/Julia.jpeg',
    tags: [
      { pl: 'Praca nożyczkami', en: 'Scissor Work' },
      { pl: 'Włosy teksturowane', en: 'Textured Hair' },
      { pl: 'Skin Fade', en: 'Skin Fade' },
    ],
    delay: 3,
  },
];

export default function Barbers() {
  const ref = useReveal();
  return (
    <section id="barbers" className="barbers-section" ref={ref}>
      <div className="section-header">
        <div>
          <div className="section-number">{useT('02 / ZESPÓŁ', '02 / TEAM')}</div>
          <div className="section-title">{useT('Barberzy', 'The Barbers')}</div>
        </div>
        <a className="section-link">{useT('Poznaj ekipę →', 'Meet the crew →')}</a>
      </div>
      <div className="barbers-grid">
        {barbers.map((b) => (
          <div key={b.name} className={`barber-card reveal reveal-delay-${b.delay}`}>
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
