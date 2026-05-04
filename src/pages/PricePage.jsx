import { useState, useEffect } from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { services } from '../components/Services';
import { useT, useLang } from '../context/LangContext';
import { useRouter } from '../context/RouterContext';
import { useIsDark } from '../hooks/useIsDark';

const BARBER_PHOTO = {
  'OLEK':  '/team/Aleksander.jpeg',
  'JULIA': '/team/Julia.jpeg',
  'NICO':  '/team/Nico.jpeg',
};

const BARBER_META = {
  'OLEK':  { name: 'Aleksander', titlePL: 'Senior Barber', titleEN: 'Senior Barber' },
  'JULIA': { name: 'Julia',      titlePL: 'Senior Barber', titleEN: 'Senior Barber' },
  'NICO':  { name: 'Nico',       titlePL: 'Barber',        titleEN: 'Barber' },
};

function groupServices(svcs) {
  const groups = [];
  svcs.forEach(s => {
    const key = s.barbers.join(',');
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.services.push(s);
    else groups.push({ key, barbers: s.barbers, services: [s] });
  });
  return groups;
}

export default function PricePage() {
  const { navigate } = useRouter();
  const { lang } = useLang();
  const isDark = useIsDark();
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

  return (
    <>
      <Nav />
      <div className="prices-page-hero">
        <div className="blog-page-eyebrow">Off Cut — Barbershop</div>
        <h1 className="blog-page-title">{useT('Cennik', 'Prices')}</h1>
        <p className="blog-page-sub">
          {useT(
            'Wszystkie usługi w jednym miejscu. Czas i cena — bez niespodzianek.',
            'All services in one place. Time and price — no surprises.'
          )}
        </p>
      </div>

      <section className="prices-full-section">
        <div className="prices-groups">
          {groups.map(group => (
            <div key={group.key} className="prices-group">

              {/* Barber group header */}
              <div className="prices-group-header">
                <div className="prices-group-avatars">
                  {group.barbers.map(k => (
                    <div key={k} className="prices-group-av-wrap">
                      <img src={BARBER_PHOTO[k]} alt={BARBER_META[k]?.name} className="prices-group-av" />
                    </div>
                  ))}
                </div>
                <div className="prices-group-names">
                  <span className="prices-group-name">
                    {group.barbers.map(k => BARBER_META[k]?.name).join(' & ')}
                  </span>
                  <span className="prices-group-title">
                    {lang === 'pl'
                      ? BARBER_META[group.barbers[0]]?.titlePL
                      : BARBER_META[group.barbers[0]]?.titleEN}
                  </span>
                </div>
                <div className="prices-group-count">
                  {group.services.length} {useT('usług', 'services')}
                </div>
              </div>

              {/* Service rows */}
              <div className="prices-service-list">
                {group.services.map(s => (
                  <div
                    key={s.num}
                    className="prices-service-row"
                    onClick={() => navigate('/booking', { preselectedService: s })}
                  >
                    <span className="psr-num">{s.num}</span>
                    <div className="psr-info">
                      <span className="psr-name">{lang === 'pl' ? s.namePL : s.nameEN}</span>
                      <span className="psr-desc">{lang === 'pl' ? s.descPL : s.descEN}</span>
                    </div>
                    <div className="psr-barbers">
                      {s.barbers.map(k => (
                        <div key={k} className="psr-av-wrap">
                          <img src={BARBER_PHOTO[k]} alt={BARBER_META[k]?.name} className="psr-av" title={BARBER_META[k]?.name} />
                        </div>
                      ))}
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
          ))}
        </div>
      </section>

      <Footer />
      <button
        className="prices-back-circle-btn"
        style={btnStyle}
        onClick={() => navigate('/')}
        aria-label={useT('Powrót', 'Back')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
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
