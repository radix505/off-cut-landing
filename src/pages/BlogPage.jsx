import Nav from '../components/Nav';
import Blog from '../components/Blog';
import Footer from '../components/Footer';
import { useT } from '../context/LangContext';
import { useRouter } from '../context/RouterContext';

export default function BlogPage() {
  const { navigate } = useRouter();

  return (
    <>
      <Nav />
      <div className="blog-page-hero">
        <button className="page-back-btn" onClick={() => navigate('/')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          {useT('Wróć', 'Back')}
        </button>
        <div className="blog-page-eyebrow">{useT('Off Cut — Barbershop', 'Off Cut — Barbershop')}</div>
        <h1 className="blog-page-title">{useT('Ze Świata\nOff Cut', 'From the\nOff Cut World')}</h1>
        <p className="blog-page-sub">{useT('Rzemiosło, styl i kultura z naszej perspektywy. Wkrótce.', 'Craft, style and culture from our perspective. Coming soon.')}</p>
      </div>
      <Blog />
      <Footer />
    </>
  );
}
