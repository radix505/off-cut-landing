import Nav from '../components/Nav';
import Blog from '../components/Blog';
import Footer from '../components/Footer';
import { useT } from '../context/LangContext';

export default function BlogPage() {
  return (
    <>
      <Nav />
      <div className="blog-page-hero">
        <div className="blog-page-eyebrow">{useT('Off Cut — Barbershop', 'Off Cut — Barbershop')}</div>
        <h1 className="blog-page-title">{useT('Ze Świata\nOff Cut', 'From the\nOff Cut World')}</h1>
        <p className="blog-page-sub">{useT('Rzemiosło, styl i kultura z naszej perspektywy. Wkrótce.', 'Craft, style and culture from our perspective. Coming soon.')}</p>
      </div>
      <Blog />
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
