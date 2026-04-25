import Nav from '../components/Nav';
import Hero from '../components/Hero';
import Marquee from '../components/Marquee';
import Services from '../components/Services';
import Barbers from '../components/Barbers';
import Gallery from '../components/Gallery';
import Blog from '../components/Blog';
import Reviews from '../components/Reviews';
import Booking from '../components/Booking';
import Footer from '../components/Footer';
import ScrollScissors from '../components/ScrollScissors';
import { useIsDark } from '../hooks/useIsDark';

export default function HomePage() {
  const isDark = useIsDark();
  const btnStyle = isDark
    ? { background: 'rgba(255,255,255,0.13)', borderColor: 'rgba(255,255,255,0.35)', color: '#fff' }
    : {};

  return (
    <>
      <Nav />
      <ScrollScissors />
      <Hero />
      <Marquee />
      <Services />
      <Barbers />
      <Gallery />
      <Blog />
      <Reviews />
      <Booking />
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
