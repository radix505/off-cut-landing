import { useT } from '../context/LangContext';
import { useReveal } from '../hooks/useReveal';

export default function Gallery() {
  const ref = useReveal();
  return (
    <section id="gallery" className="gallery-section" ref={ref}>
      <div className="section-header">
        <div>
          <div className="section-number">{useT('03 / GALERIA', '03 / GALLERY')}</div>
          <div className="section-title">{useT('Nasza praca', 'The Work')}</div>
        </div>
        <a className="section-link">Instagram →</a>
      </div>
      <div className="gallery-grid reveal">
        <div className="gallery-cell">
          <div className="gallery-inner">
            <div className="gallery-placeholder-icon">+</div>
            <span className="gallery-placeholder-text">{useT('Główne zdjęcie', 'Feature photo')}</span>
          </div>
        </div>
        <div className="gallery-cell"><div className="gallery-inner"><span className="gallery-placeholder-text">Work 01</span></div></div>
        <div className="gallery-cell"><div className="gallery-inner"><span className="gallery-placeholder-text">Work 02</span></div></div>
        <div className="gallery-cell"><div className="gallery-inner"><span className="gallery-placeholder-text">Work 03</span></div></div>
        <div className="gallery-cell"><div className="gallery-inner"><span className="gallery-placeholder-text">Work 04</span></div></div>
      </div>
    </section>
  );
}
