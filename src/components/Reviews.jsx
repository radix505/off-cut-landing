import { useT } from '../context/LangContext';
import { useReveal } from '../hooks/useReveal';

const reviews = [
  {
    initials: 'B',
    name: 'Bartosz',
    textPL: 'Cięcie idealne, atmosfera luźna, Olek to prawdziwy profesjonalista.',
    textEN: 'Perfect cut, relaxed atmosphere — Olek is a true professional.',
  },
  {
    initials: 'W',
    name: 'Wojtek',
    textPL: 'Świetny barber shop z profesjonalnym podejściem do klienta.',
    textEN: 'Great barbershop with a professional approach to every client.',
  },
  {
    initials: 'M',
    name: 'Michał',
    textPL: 'Idealne miejsce dla każdego mężczyzny, który chce zadbać o swój wygląd.',
    textEN: 'The perfect place for any man who cares about his appearance.',
  },
  {
    initials: 'M',
    name: 'Marek',
    textPL: 'Off Cut to barber shop, który zdecydowanie polecam każdemu.',
    textEN: 'Off Cut is a barbershop I would wholeheartedly recommend to anyone.',
  },
];

export default function Reviews() {
  const ref = useReveal();
  return (
    <section id="reviews" className="reviews-section" ref={ref}>
      <div className="section-header">
        <div>
          <div className="section-number">{useT('06 / OPINIE', '06 / REVIEWS')}</div>
          <div className="section-title">{useT('Co mówią klienci', 'What Clients Say')}</div>
        </div>
        <a
          className="section-link"
          href="https://www.google.com/maps/search/Off+Cut+Barbershop"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google →
        </a>
      </div>
      <div className="reviews-grid reveal">
        {reviews.map((r) => (
          <div className="review-card" key={r.name + r.initials}>
            <div className="review-avatar">{r.initials}</div>
            <div className="review-stars">★★★★★</div>
            <p className="review-text">"{useT(r.textPL, r.textEN)}"</p>
            <div className="review-footer">
              <span className="review-author">{r.name}</span>
              <span className="review-source">Google</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
