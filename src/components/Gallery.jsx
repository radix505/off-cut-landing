import { useState } from 'react';
import { useT } from '../context/LangContext';
import { useReveal } from '../hooks/useReveal';

export default function Gallery() {
  const ref = useReveal();
  const [err1, setErr1] = useState(false);
  const [err2, setErr2] = useState(false);

  return (
    <section id="gallery" className="gallery-section" ref={ref}>
      <div className="section-header">
        <div>
          <div className="section-number">{useT('03 / GALERIA', '03 / GALLERY')}</div>
          <div className="section-title">{useT('Nasza praca', 'The Work')}</div>
        </div>
        <a className="section-link" href="https://www.instagram.com/off_cut_barbershop/" target="_blank" rel="noopener noreferrer">Instagram →</a>
      </div>
      <div className="gallery-grid reveal">
        <div className="gallery-cell">
          <div className="gallery-inner">
            {err1 ? (
              <div className="gallery-placeholder-inner">
                <div className="gallery-placeholder-icon">+</div>
                <span className="gallery-placeholder-text">{useT('Główne zdjęcie', 'Feature photo')}</span>
              </div>
            ) : (
              <img src="/gallery/offcut-1.jpg" alt={useT('Strzyżenie Off Cut', 'Off Cut haircut')} className="gallery-img" onError={() => setErr1(true)} />
            )}
          </div>
        </div>
        <div className="gallery-cell">
          <div className="gallery-inner">
            {err2 ? (
              <div className="gallery-placeholder-inner">
                <span className="gallery-placeholder-text">Work 01</span>
              </div>
            ) : (
              <img src="/gallery/offcut-2.jpg" alt={useT('Praca barbera', 'Barber work')} className="gallery-img" onError={() => setErr2(true)} />
            )}
          </div>
        </div>
        <div className="gallery-cell"><div className="gallery-inner"><span className="gallery-placeholder-text">Work 02</span></div></div>
        <div className="gallery-cell"><div className="gallery-inner"><span className="gallery-placeholder-text">Work 03</span></div></div>
        <div className="gallery-cell"><div className="gallery-inner"><span className="gallery-placeholder-text">Work 04</span></div></div>
      </div>
    </section>
  );
}
