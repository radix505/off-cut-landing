import Nav from '../components/Nav';
import Hero from '../components/Hero';
import Marquee from '../components/Marquee';
import Services from '../components/Services';
import Barbers from '../components/Barbers';
import Gallery from '../components/Gallery';
import Reviews from '../components/Reviews';
import Booking from '../components/Booking';
import Blog from '../components/Blog';
import Map from '../components/Map';
import Footer from '../components/Footer';
import ScrollScissors from '../components/ScrollScissors';
import { useIsDark } from '../hooks/useIsDark';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const isDark = useIsDark();
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const btnStyle = isDark
    ? { background: 'rgba(255,255,255,0.13)', borderColor: 'rgba(255,255,255,0.35)', color: '#fff' }
    : {};

  function handleScrollBtn() {
    if (atTop) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <>
      <Nav />
      <ScrollScissors />
      <Hero />
      <Marquee />
      <Services />
      <Barbers />
      <Gallery />
      <Reviews />
      <Booking />
      <Blog />
      <Map />
      <Footer />
      <button
        className="scroll-top-btn"
        style={btnStyle}
        onClick={handleScrollBtn}
        aria-label={atTop ? 'Scroll down' : 'Back to top'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: atTop ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1)' }}
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
    </>
  );
}
