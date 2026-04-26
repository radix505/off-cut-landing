import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { useT } from '../context/LangContext';
import { useIsDark } from '../hooks/useIsDark';

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
];

export default function GalleryPage() {
  const isDark = useIsDark();
  const btnStyle = isDark
    ? { background: 'rgba(255,255,255,0.13)', borderColor: 'rgba(255,255,255,0.35)', color: '#fff' }
    : {};

  return (
    <>
      <Nav />
      <div className="gallery-page-hero">
        <div className="blog-page-eyebrow">{useT('Off Cut — Barbershop', 'Off Cut — Barbershop')}</div>
        <h1 className="blog-page-title">{useT('Galeria\nPrac', 'Our\nWork')}</h1>
        <p className="blog-page-sub">{useT('Każde cięcie to historia. Oto nasze rzemiosło.', 'Every cut tells a story. Here\'s our craft.')}</p>
      </div>
      <section className="gallery-page-section">
        <div className="gallery-page-meta">
          <span className="gallery-page-count">{photos.length} {useT('zdjęć', 'photos')}</span>
          <a
            className="section-link"
            href="https://www.instagram.com/off_cut_barbershop/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram →
          </a>
        </div>
        <div className="gallery-page-grid">
          {photos.map((src, i) => (
            <div
              key={i}
              className="gallery-page-cell"
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
        </div>
      </section>
      <Footer />
      <button
        className="scroll-top-btn"
        style={btnStyle}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
    </>
  );
}
