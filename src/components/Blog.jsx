import { useT } from '../context/LangContext';
import { useReveal } from '../hooks/useReveal';

const posts = [
  {
    num: '001',
    categoryPL: 'Rzemiosło',
    categoryEN: 'Craft',
    titlePL: 'Sztuka Fadea: od skóry do czubka',
    titleEN: 'The Art of the Fade: Skin to Crown',
    excerptPL: 'Co sprawia, że perfekcyjny fade to więcej niż technika maszynowa? Rozmawiamy o gradiencie, świetle i tym czego nie nauczy żaden tutorial.',
    excerptEN: 'What makes a perfect fade more than machine technique? We talk gradient, light, and what no tutorial will ever teach you.',
    delay: 1,
  },
  {
    num: '002',
    categoryPL: 'Styl',
    categoryEN: 'Style',
    titlePL: 'Klasyk nie umiera: fryzury ponadczasowe',
    titleEN: 'The Classic Never Dies: Timeless Cuts',
    excerptPL: 'Pompadour, ivy league, side part. Dlaczego pewne cięcia wracają dekada po dekadzie i jak nosić je we współczesny sposób.',
    excerptEN: 'Pompadour, ivy league, side part. Why certain cuts return decade after decade and how to wear them today.',
    delay: 2,
  },
  {
    num: '003',
    categoryPL: 'Pielęgnacja',
    categoryEN: 'Grooming',
    titlePL: 'Broda: codzienna rutyna w 4 krokach',
    titleEN: 'Beard: Daily Ritual in 4 Steps',
    excerptPL: 'Dobra broda to nawyk, nie przypadek. Olejek, wosk, brzytwa i czas — wszystko czego potrzebujesz między wizytami.',
    excerptEN: 'A great beard is a habit, not luck. Oil, wax, razor, and time — everything you need between appointments.',
    delay: 3,
  },
  {
    num: '004',
    categoryPL: 'Kultura',
    categoryEN: 'Culture',
    titlePL: 'Barbershop jako trzecie miejsce',
    titleEN: 'The Barbershop as Third Place',
    excerptPL: 'Nie dom, nie praca. Fotel, lustro i rozmowa. Dlaczego barbershop pełni rolę której brakuje we współczesnym mieście.',
    excerptEN: 'Not home, not work. The chair, the mirror, and the conversation. Why the barbershop fills a role the modern city is missing.',
    delay: 1,
  },
];

export default function Blog() {
  const ref = useReveal();
  return (
    <section id="blog" className="blog-section" ref={ref}>
      <div className="section-header">
        <div>
          <div className="section-number">{useT('06 / BLOG', '06 / BLOG')}</div>
          <div className="section-title">{useT('Ze świata Off Cut', 'From the Off Cut World')}</div>
        </div>
        <span className="section-link blog-coming-tag">
          {useT('Wkrótce dostępne', 'Coming soon')}
        </span>
      </div>

      <div className="blog-grid">
        {posts.map((p) => (
          <article key={p.num} className={`blog-card reveal reveal-delay-${p.delay}`}>
            <div className="blog-card-image">
              <div className="blog-image-placeholder">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="1" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <div className="blog-card-num">{p.num}</div>
              <div className="blog-soon-badge">{useT('WKRÓTCE', 'SOON')}</div>
            </div>
            <div className="blog-card-body">
              <div className="blog-category">{useT(p.categoryPL, p.categoryEN)}</div>
              <h3 className="blog-title">{useT(p.titlePL, p.titleEN)}</h3>
              <p className="blog-excerpt">{useT(p.excerptPL, p.excerptEN)}</p>
              <div className="blog-card-footer">
                <span className="blog-read-label">{useT('Czytaj wkrótce', 'Read soon')}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="blog-arrow">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
