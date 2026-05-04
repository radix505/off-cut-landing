import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { useT, useLang } from '../context/LangContext';
import { useRouter } from '../context/RouterContext';
import { useCatalog } from '../context/CatalogContext';

export default function BarberPage() {
  const { crewSlug, navigate } = useRouter();
  const { lang } = useLang();
  const { barbers, loading } = useCatalog();

  if (loading && barbers.length === 0) return <><Nav /></>;

  const barber = barbers.find((b) => b.slug === crewSlug) ?? barbers[0];
  if (!barber) return <><Nav /></>;

  const firstNameProper = barber.name.charAt(0) + barber.name.slice(1).toLowerCase();

  return (
    <>
      <Nav />

      <div className="barber-page-hero">
        <div className="barber-page-hero-content">
          <button className="barber-page-back" onClick={() => navigate('/crew')}>
            {useT('← Ekipa', '← Crew')}
          </button>
          <div className="barber-page-hero-name">{barber.name}</div>
          <div className="barber-page-hero-title">{lang === 'pl' ? barber.titlePL : barber.titleEN}</div>
        </div>
      </div>

      <section className="barber-page-body">
        <div className="barber-page-layout">

          <div className="barber-page-info">
            <div className="barber-page-section-label">{useT('O mnie', 'About')}</div>
            <p className="barber-page-bio">{lang === 'pl' ? barber.longBio.pl : barber.longBio.en}</p>

            <div className="barber-page-section-label" style={{ marginTop: '2.5rem' }}>
              {useT('Specjalizacje', 'Specialities')}
            </div>
            <div className="barber-page-tags">
              {barber.tags.map((t) => (
                <span key={t.en} className="spec-tag spec-tag--light">{lang === 'pl' ? t.pl : t.en}</span>
              ))}
            </div>

            <button
              className="barber-page-book"
              onClick={() => navigate('/booking')}
            >
              {lang === 'pl' ? `Zarezerwuj u ${firstNameProper}` : `Book with ${firstNameProper}`}
            </button>
          </div>

          <div className="barber-page-photo-col">
            <div className="barber-page-photo-wrap">
              <img src={barber.photo} alt={barber.name} className="barber-page-photo" />
            </div>
            <div className="barber-page-placeholder-block">
              <span className="barber-page-placeholder-label">
                {useT('Zdjęcia / galeria — wkrótce', 'Photos / gallery — coming soon')}
              </span>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}
