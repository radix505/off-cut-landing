import { Component, lazy, Suspense } from 'react';
import { LangProvider } from './context/LangContext';
import { RouterProvider, useRouter } from './context/RouterContext';
import { CatalogProvider } from './context/CatalogContext';
import LangSplash from './components/LangSplash';
import CookieBanner from './components/CookieBanner';
import ScissorsTransition from './components/ScissorsTransition';
import HomePage from './pages/HomePage';

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('App error', error, info); }
  reset = () => { this.setState({ error: null }); window.location.assign('/'); };
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem', textAlign: 'center', gap: '1rem' }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '0.06em', color: 'var(--ink)' }}>Coś poszło nie tak</h1>
        <p style={{ color: 'var(--ink-weak)', maxWidth: '480px', lineHeight: 1.6 }}>
          Spróbuj odświeżyć stronę. Jeśli problem się powtarza, skontaktuj się z nami pod numerem +48 513 340 013.
        </p>
        <button onClick={this.reset} style={{ marginTop: '1rem', padding: '0.85rem 1.6rem', background: 'var(--ink)', color: 'var(--paper-strong)', border: 'none', fontSize: '0.78rem', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer' }}>
          Wróć na stronę główną
        </button>
      </div>
    );
  }
}

const BlogPage    = lazy(() => import('./pages/BlogPage'));
const PricePage   = lazy(() => import('./pages/PricePage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const CrewPage    = lazy(() => import('./pages/CrewPage'));
const BarberPage  = lazy(() => import('./pages/BarberPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const CookiesPage = lazy(() => import('./pages/CookiesPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

function AppRoutes() {
  const { page, pageVisible } = useRouter();
  return (
    <div className={`page-content${pageVisible ? ' visible' : ''}`}>
      <Suspense fallback={null}>
        {page === 'blog'    ? <BlogPage /> :
         page === 'services'  ? <PricePage /> :
         page === 'booking' ? <BookingPage /> :
         page === 'gallery' ? <GalleryPage /> :
         page === 'crew'    ? <CrewPage /> :
         page === 'barber'  ? <BarberPage /> :
         page === 'privacy' ? <PrivacyPage /> :
         page === 'cookies' ? <CookiesPage /> :
         page === 'contact' ? <ContactPage /> :
         <HomePage />}
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LangProvider>
        <CatalogProvider>
          <RouterProvider>
            <LangSplash />
            <ScissorsTransition />
            <AppRoutes />
            <CookieBanner />
          </RouterProvider>
        </CatalogProvider>
      </LangProvider>
    </ErrorBoundary>
  );
}
