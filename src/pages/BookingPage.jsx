import Nav from '../components/Nav';
import Footer from '../components/Footer';
import Booking from '../components/Booking';
import { useT } from '../context/LangContext';
import { useRouter } from '../context/RouterContext';

export default function BookingPage() {
  const { navigate } = useRouter();
  return (
    <>
      <Nav />
      <div className="prices-page-hero">
        <div className="blog-page-eyebrow">Off Cut — Barbershop</div>
        <h1 className="blog-page-title">{useT('Rezerwacja', 'Booking')}</h1>
        <p className="blog-page-sub">
          {useT(
            'Zarezerwuj fotel online. Wybierz barbera, usługę i termin.',
            'Book your chair online. Pick your barber, service, and time.'
          )}
        </p>
      </div>
      <Booking />
      <Footer />
      <button
        className="prices-back-circle-btn"
        onClick={() => navigate('/')}
        aria-label={useT('Powrót', 'Back')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
    </>
  );
}
