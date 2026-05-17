import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { useT, useLang } from '../context/LangContext';
import { useRouter } from '../context/RouterContext';
import { useIsDark } from '../hooks/useIsDark';
import { useCatalog } from '../context/CatalogContext';

export default function CrewPage() {
  const { navigate } = useRouter();
  const { lang } = useLang();
  const { barbers } = useCatalog();
  const isDark = useIsDark();
  const btnStyle = isDark
    ? { background: 'rgba(255,255,255,0.13)', borderColor: 'rgba(255,255,255,0.35)', color: '#fff' }
    : {};

  return (
    <>
      <Nav />
      <section className="crew-page-section">
        <button className="page-back-btn" onClick={() => navigate('/')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          {useT('Strona główna', 'Home')}
        </button>
        <div className="crew-page-header">
          <div className="crew-page-header-text">
            <h1 className="crew-page-title">{useT('Meet\nthe\nCrew', 'Meet\nthe\nCrew')}</h1>
            <p className="crew-page-sub">{useT('Każdy z nas wnosi coś wyjątkowego. Razem tworzymy Off Cut.', 'Each of us brings something unique. Together we are Off Cut.')}</p>
          </div>
          <div className="crew-page-grid">
            {barbers.map((b) => (
              <div key={b.slug} className="crew-card" onClick={() => navigate('/crew/' + b.slug)}>
                <div className="crew-card-photo-wrap">
                  <img src={b.photo} alt={b.name} className="crew-card-photo" />
                  <div className="crew-card-bio-overlay">
                    <p className="crew-card-bio-text">{lang === 'pl' ? b.bio.pl : b.bio.en}</p>
                    <span className="crew-card-cta">{useT('Zobacz profil →', 'View profile →')}</span>
                  </div>
                  <div className="crew-card-name-bar">
                    <span className="crew-card-name">{b.name}</span>
                    <span className="crew-card-title">{lang === 'pl' ? b.titlePL : b.titleEN}</span>
                  </div>
                </div>
                <div className="crew-card-tags">
                  {b.tags.map((t) => (
                    <span key={t.en} className="spec-tag">{lang === 'pl' ? t.pl : t.en}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
      <button
        className="scroll-top-btn"
        style={btnStyle}
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
