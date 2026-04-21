import { LangProvider } from './context/LangContext';
import LangSplash from './components/LangSplash';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import Services from './components/Services';
import Barbers from './components/Barbers';
import Gallery from './components/Gallery';
import Booking from './components/Booking';
import Footer from './components/Footer';
export default function App() {
  return (
    <LangProvider>
      <LangSplash />
      <Nav />
      <Hero />
      <Marquee />
      <Services />
      <Barbers />
      <Gallery />
      <Booking />
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
    </LangProvider>
  );
}
