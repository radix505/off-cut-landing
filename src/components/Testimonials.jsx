import { useT } from '../context/LangContext';
import { useReveal } from '../hooks/useReveal';

const reviews = [
  {
    quotePL: 'Byłem u wielu barberów w Szczecinie, ale dopiero tutaj zrozumiałem co znaczy prawdziwy skin fade. Marcus wie co robi, a atmosfera w salonie jest nieporównywalna.',
    quoteEN: "I've been to plenty of barbers in Szczecin, but only here did I understand what a real skin fade is. Marcus knows his craft, and the atmosphere is unmatched.",
    name: 'Michał K.',
    metaPL: 'Klient od 2 lat — Fade & Blend',
    metaEN: 'Client for 2 years — Fade & Blend',
    date: '2025-11',
    delay: 1,
  },
  {
    quotePL: 'Golenie brzytwą z gorącym ręcznikiem — kompletny reset po tygodniu pracy. Daniel ma rękę precyzyjną jak szwajcarski zegarek. Polecam bez wahania.',
    quoteEN: 'Hot towel straight-razor shave — a complete reset after a long week. Daniel has the precision of a Swiss watch. Highly recommended.',
    name: 'Adam S.',
    metaPL: 'Stały klient — Golenie brzytwą',
    metaEN: 'Regular — Hot Towel Shave',
    date: '2025-10',
    delay: 2,
  },
  {
    quotePL: 'Przyszedłem z synem na pierwsze "męskie" strzyżenie. Tomás był niesamowicie cierpliwy, a syn wyszedł dumny jak paw. Wracamy co miesiąc.',
    quoteEN: 'Brought my son here for his first "grown-up" haircut. Tomás was incredibly patient and my son walked out beaming. We come back every month.',
    name: 'Piotr W.',
    metaPL: 'Rodzic — Cut + Junior',
    metaEN: 'Parent — Cut + Junior',
    date: '2025-09',
    delay: 3,
  },
];

export default function Testimonials() {
  const ref = useReveal();
  return (
    <section id="testimonials" className="testimonials-section" ref={ref}>
      <div className="section-header">
        <div>
          <div className="section-number">{useT('03 / OPINIE', '03 / REVIEWS')}</div>
          <div className="section-title">{useT('Co mówią klienci', 'What clients say')}</div>
        </div>
        <a
          className="section-link"
          href="https://www.google.com/search?q=off+cut+barbershop+szczecin"
          target="_blank"
          rel="noopener noreferrer"
        >
          {useT('Wszystkie opinie Google →', 'All Google reviews →')}
        </a>
      </div>
      <div className="testimonials-grid">
        {reviews.map((r) => (
          <article key={r.name} className={`testimonial-card reveal reveal-delay-${r.delay}`}>
            <div className="testimonial-stars" aria-label="5 out of 5 stars">★★★★★</div>
            <p className="testimonial-quote">{useT(r.quotePL, r.quoteEN)}</p>
            <div className="testimonial-author">
              <div className="testimonial-name">{r.name}</div>
              <div className="testimonial-meta">{useT(r.metaPL, r.metaEN)} · {r.date}</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
