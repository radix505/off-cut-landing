import { useState, useEffect, useRef } from 'react';
import { useT } from '../context/LangContext';
import { useReveal } from '../hooks/useReveal';
import { useRouter } from '../context/RouterContext';

const photos = [
  '/gallery/DSC_3460.jpeg',
  '/gallery/DSC_3485.jpeg',
  '/gallery/DSC_3711.jpeg',
  '/gallery/DSC_3773.jpeg',
  '/gallery/DSC_4006.jpeg',
  '/gallery/DSC_4023.jpeg',
  '/gallery/DSC_4037.jpeg',
  '/gallery/DSC_4042.jpeg',
  '/gallery/DSC_4046.jpeg',
  '/gallery/DSC_4047.jpeg',
  '/gallery/DSC_4070.jpeg',
  '/gallery/DSC_4073.jpeg',
  '/gallery/DSC_4100.jpeg',
  '/gallery/DSC_4104.jpeg',
  '/gallery/DSC_4126.jpeg',
  '/gallery/DSC_4153.jpeg',
  '/gallery/DSC_4255.jpeg',
  '/gallery/DSC_4258.jpeg',
  '/gallery/IMG_2333.png',
  '/gallery/IMG_2358.jpeg',
  '/gallery/IMG_2361.jpeg',
  '/gallery/IMG_2362.jpeg',
  '/gallery/IMG_2373.jpeg',
  '/gallery/IMG_2374.jpeg',
  '/gallery/IMG_2375.jpeg',
  '/gallery/IMG_2376.jpeg',
  '/gallery/IMG_2377.jpeg',
  '/gallery/IMG_2807.jpeg',
  '/gallery/IMG_2811.jpeg',
  '/gallery/IMG_3024.jpeg',
  '/gallery/IMG_3025.jpeg',
  '/gallery/319C0F08-DB22-4ABB-8F4D-F489828F6DBE.jpeg',
  '/gallery/ADEAFE12-39E6-4E6A-B8AD-E411C5EA7BAE.jpeg',
  '/gallery/IMG_7729.jpeg',
];

const FEATURED = [3, 8, 14, 20, 27].map(i => photos[i]);

export default function Gallery() {
  const ref = useReveal();
  const { navigate } = useRouter();
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const touchStartX = useRef(null);

  const onTouchStart = e => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = e => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) setLightboxIdx(i => (i + 1) % photos.length);
      else setLightboxIdx(i => (i - 1 + photos.length) % photos.length);
    }
    touchStartX.current = null;
  };

  const openLightbox = src => {
    const idx = photos.indexOf(src);
    setLightboxIdx(idx >= 0 ? idx : 0);
  };
  const closeLightbox = () => setLightboxIdx(null);
  const prevPhoto = e => { e.stopPropagation(); setLightboxIdx(i => (i - 1 + photos.length) % photos.length); };
  const nextPhoto = e => { e.stopPropagation(); setLightboxIdx(i => (i + 1) % photos.length); };

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = e => {
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowLeft')  setLightboxIdx(i => (i - 1 + photos.length) % photos.length);
      if (e.key === 'ArrowRight') setLightboxIdx(i => (i + 1) % photos.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIdx]);

  useEffect(() => {
    document.body.style.overflow = lightboxIdx !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightboxIdx]);

  return (
    <section id="gallery" className="gallery-section" ref={ref}>
      <div className="section-header">
        <div>
          <div className="section-number">{useT('03 / GALERIA', '03 / GALLERY')}</div>
          <div className="section-title">{useT('Nasza praca', 'The Work')}</div>
        </div>
        <a className="section-link" href="https://www.instagram.com/off_cut_barbershop/" target="_blank" rel="noopener noreferrer">
          <svg className="section-link-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <defs>
              <linearGradient id="ig-grad-g" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F58529"/>
                <stop offset="40%" stopColor="#DD2A7B"/>
                <stop offset="100%" stopColor="#515BD4"/>
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#ig-grad-g)"/>
            <circle cx="12" cy="12" r="4" stroke="url(#ig-grad-g)"/>
            <circle cx="17.5" cy="6.5" r="0.8" fill="#DD2A7B" stroke="none"/>
          </svg>
          {useT('Więcej na Instagram →', 'More on Instagram →')}
        </a>
      </div>

      <div className="gallery-editorial reveal">
        <div
          className="gallery-editorial-hero"
          style={{ backgroundImage: `url(${FEATURED[0]})` }}
          onClick={() => openLightbox(FEATURED[0])}
        />
        {FEATURED.slice(1).map((src, i) => (
          <div
            key={i}
            className="gallery-editorial-cell"
            style={{ backgroundImage: `url(${src})` }}
            onClick={() => openLightbox(src)}
          />
        ))}
      </div>

      <button className="gallery-editorial-cta" onClick={() => navigate('/gallery')}>
        <span>{useT(`Wszystkie ${photos.length} zdjęć`, `All ${photos.length} shots`)}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      </button>

      {lightboxIdx !== null && (
        <div className="lightbox" onClick={closeLightbox} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <button className="lightbox-close" onClick={closeLightbox}>×</button>
          <button className="lightbox-prev" onClick={prevPhoto}>‹</button>
          <img
            key={lightboxIdx}
            src={photos[lightboxIdx]}
            className="lightbox-img"
            onClick={e => e.stopPropagation()}
            alt={`Gallery photo ${lightboxIdx + 1} of ${photos.length}`}
          />
          <button className="lightbox-next" onClick={nextPhoto}>›</button>
          <div className="lightbox-counter">{lightboxIdx + 1} / {photos.length}</div>
        </div>
      )}
    </section>
  );
}
