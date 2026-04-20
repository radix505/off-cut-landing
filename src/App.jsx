import { LangProvider } from './context/LangContext';
import LangSplash from './components/LangSplash';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import WhyUs from './components/WhyUs';
import Services from './components/Services';
import Barbers from './components/Barbers';
import Testimonials from './components/Testimonials';
import Gallery from './components/Gallery';
import FAQ from './components/FAQ';
import Booking from './components/Booking';
import Footer from './components/Footer';
import StickyMobileCTA from './components/StickyMobileCTA';

export default function App() {
  return (
    <LangProvider>
      <LangSplash />
      <Nav />
      <Hero />
      <Marquee />
      <WhyUs />
      <Services />
      <Barbers />
      <Testimonials />
      <Gallery />
      <FAQ />
      <Booking />
      <Footer />
      <StickyMobileCTA />
    </LangProvider>
  );
}
