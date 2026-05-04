import { lazy, Suspense } from 'react';
import { LangProvider } from './context/LangContext';
import { RouterProvider, useRouter } from './context/RouterContext';
import LangSplash from './components/LangSplash';
import CookieBanner from './components/CookieBanner';
import ScissorsTransition from './components/ScissorsTransition';
import HomePage from './pages/HomePage';

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
         page === 'prices'  ? <PricePage /> :
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
    <LangProvider>
      <RouterProvider>
        <LangSplash />
        <ScissorsTransition />
        <AppRoutes />
        <CookieBanner />
      </RouterProvider>
    </LangProvider>
  );
}
