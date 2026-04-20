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
    </LangProvider>
  );
}
