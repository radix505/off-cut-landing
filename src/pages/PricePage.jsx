import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { services } from '../components/Services';
import { useT } from '../context/LangContext';

export default function PricePage() {
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
        <div className="services-list">
          {services.map((s) => (
            <div key={s.num} className="service-card">
              <div className="service-num">{s.num}</div>
              <div className="service-name">{useT(s.namePL, s.nameEN)}</div>
              <div className="service-desc">{useT(s.descPL, s.descEN)}</div>
              <div className="service-price">
                <span>{s.duration}</span>
                <span className="service-price-amount">{s.price}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
      <button
        className="scroll-top-btn"
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
