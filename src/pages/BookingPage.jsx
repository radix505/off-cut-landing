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
      <div className="booking-page-wrap"><Booking /></div>
      <Footer />
      <button className="page-back-btn" onClick={() => navigate('/')}>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        {useT('Wróć', 'Back')}
      </button>
    </>
  );
}
