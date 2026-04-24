import { LangProvider } from './context/LangContext';
import { RouterProvider, useRouter } from './context/RouterContext';
import LangSplash from './components/LangSplash';
import ScissorsTransition from './components/ScissorsTransition';
import HomePage from './pages/HomePage';
import BlogPage from './pages/BlogPage';
import PricePage from './pages/PricePage';

function AppRoutes() {
  const { page, pageVisible } = useRouter();
  return (
    <div className={`page-content${pageVisible ? ' visible' : ''}`}>
      {page === 'blog' ? <BlogPage /> : page === 'prices' ? <PricePage /> : <HomePage />}
    </div>
  );
}

import WireScrollbar from './components/WireScrollbar';

export default function App() {
  return (
    <LangProvider>
      <RouterProvider>
        <WireScrollbar />
        <LangSplash />
        <ScissorsTransition />
        <AppRoutes />
      </RouterProvider>
    </LangProvider>
  );
}
