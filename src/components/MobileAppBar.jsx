import { useEffect, useRef } from 'react';
import { useT } from '../context/LangContext';
import { useRouter } from '../context/RouterContext';

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const ServicesIcon = () => (
  <svg width="20" height="10" viewBox="0 0 100 40" fill="none">
    <circle cx="10" cy="32" r="7" stroke="currentColor" strokeWidth="4"/>
    <line x1="16" y1="29" x2="95" y2="6" stroke="currentColor" strokeWidth="4"/>
    <circle cx="10" cy="8" r="7" stroke="currentColor" strokeWidth="4"/>
    <line x1="16" y1="11" x2="95" y2="34" stroke="currentColor" strokeWidth="4"/>
    <circle cx="43" cy="20" r="5" fill="currentColor"/>
  </svg>
);

const GalleryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.08 2.2 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

export default function MobileAppBar() {
  const { navigate, page } = useRouter();
  const barRef = useRef(null);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv || !barRef.current) return;
    const bar = barRef.current;

    let rafId;
    const pin = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        // In Safari, when the page elastic-scrolls (rubber-band), the visual
        // viewport shifts relative to the layout viewport. Counteract with a
        // translateY so the bar stays at the visible bottom.
        // In Chrome the offset is always 0, so we clear the inline style and
        // let the CSS @supports rule handle GPU compositing for Safari only.
        const offsetTop = vv.offsetTop ?? 0;
        if (offsetTop === 0) {
          bar.style.transform = '';
        } else {
          bar.style.transform = `translateY(${-offsetTop}px) translateZ(0)`;
        }
      });
    };

    vv.addEventListener('scroll', pin, { passive: true });
    return () => {
      vv.removeEventListener('scroll', pin);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const isHome = page === 'home';
  const isServices = page === 'services';
  const isGallery = page === 'gallery';
  const isContact = page === 'contact';

  return (
    <div ref={barRef} className="mobile-app-bar" role="navigation" aria-label={useT('Nawigacja', 'Navigation')}>
      <button
        className={`mab-item${isHome ? ' mab-item--active' : ''}`}
        onClick={() => navigate('/')}
        aria-current={isHome ? 'page' : undefined}
      >
        <span className="mab-icon"><HomeIcon /></span>
        <span className="mab-label">{useT('Strona', 'Home')}</span>
      </button>

      <button
        className={`mab-item${isServices ? ' mab-item--active' : ''}`}
        onClick={() => navigate('/services')}
        aria-current={isServices ? 'page' : undefined}
      >
        <span className="mab-icon"><ServicesIcon /></span>
        <span className="mab-label">{useT('Usługi', 'Services')}</span>
      </button>

      <button
        className="mab-book"
        onClick={() => navigate('/booking')}
        aria-label={useT('Zarezerwuj wizytę', 'Book an appointment')}
      >
        <span className="mab-book-circle">
          <CalendarIcon />
        </span>
        <span className="mab-book-text">{useT('Rezerwuj', 'Book')}</span>
      </button>

      <button
        className={`mab-item${isGallery ? ' mab-item--active' : ''}`}
        onClick={() => navigate('/gallery')}
        aria-current={isGallery ? 'page' : undefined}
      >
        <span className="mab-icon"><GalleryIcon /></span>
        <span className="mab-label">{useT('Galeria', 'Gallery')}</span>
      </button>

      <button
        className={`mab-item${isContact ? ' mab-item--active' : ''}`}
        onClick={() => navigate('/contact')}
        aria-current={isContact ? 'page' : undefined}
      >
        <span className="mab-icon"><PhoneIcon /></span>
        <span className="mab-label">{useT('Kontakt', 'Contact')}</span>
      </button>
    </div>
  );
}
