import { useState, useEffect, useRef } from 'react';
import { useT } from '../context/LangContext';
import { useReveal } from '../hooks/useReveal';

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

const VISIBLE = 8;

function getSlice(offset) {
  return Array.from({ length: VISIBLE }, (_, i) => photos[(offset + i) % photos.length]);
}

function preload(srcs) {
  return Promise.all(srcs.map(src => new Promise(resolve => {
    const img = new Image();
    img.onload = img.onerror = resolve;
    img.src = src;
  })));
}

export default function Gallery() {
  const ref = useReveal();
  const [layerA, setLayerA] = useState(() => getSlice(0));
  const [layerB, setLayerB] = useState(() => getSlice(VISIBLE));
  const [showA, setShowA] = useState(true);
  const offsetRef = useRef(0);

  const [lightboxIdx, setLightboxIdx] = useState(null);
  const currentPhotos = showA ? layerA : layerB;

  function openLightbox(src) {
    const idx = photos.indexOf(src);
    setLightboxIdx(idx >= 0 ? idx : 0);
  }
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

  useEffect(() => {
    const t = setInterval(() => {
      const nextOffset = (offsetRef.current + VISIBLE) % photos.length;
      const nextSlice = getSlice(nextOffset);

      preload(nextSlice).then(() => {
        if (showA) {
          setLayerB(nextSlice);
        } else {
          setLayerA(nextSlice);
        }
        setShowA(a => !a);
        offsetRef.current = nextOffset;
      });
    }, 5000);
    return () => clearInterval(t);
  }, [showA]);

  return (
    <section id="gallery" className="gallery-section" ref={ref}>
      <div className="section-header">
        <div>
          <div className="section-number">{useT('03 / GALERIA', '03 / GALLERY')}</div>
          <div className="section-title">{useT('Nasza praca', 'The Work')}</div>
        </div>
        <a className="section-link" href="https://www.instagram.com/off_cut_barbershop/" target="_blank" rel="noopener noreferrer">
          Instagram →
        </a>
      </div>

      <div className="gallery-stage reveal">
        <div className={`gallery-grid gallery-layer${showA ? ' gallery-layer--visible' : ''}`}>
          {layerA.map((src, i) => (
            <div key={i} className="gallery-cell" style={{ backgroundImage: `url(${src})` }} onClick={() => openLightbox(src)} />
          ))}
        </div>
        <div className={`gallery-grid gallery-layer${!showA ? ' gallery-layer--visible' : ''}`}>
          {layerB.map((src, i) => (
            <div key={i} className="gallery-cell" style={{ backgroundImage: `url(${src})` }} onClick={() => openLightbox(src)} />
          ))}
        </div>
      </div>

      {lightboxIdx !== null && (
        <div className="lightbox" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>×</button>
          <button className="lightbox-prev" onClick={prevPhoto}>‹</button>
          <img
            key={lightboxIdx}
            src={photos[lightboxIdx]}
            className="lightbox-img"
            onClick={e => e.stopPropagation()}
            alt=""
          />
          <button className="lightbox-next" onClick={nextPhoto}>›</button>
          <div className="lightbox-counter">{lightboxIdx + 1} / {photos.length}</div>
        </div>
      )}
    </section>
  );
}
