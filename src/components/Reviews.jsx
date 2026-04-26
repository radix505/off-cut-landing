import { useState, useEffect, useRef } from 'react';
import { useT } from '../context/LangContext';
import { useReveal } from '../hooks/useReveal';

const GoogleG = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} style={{ flexShrink: 0 }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const LocalGuideIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="11" height="11" style={{ flexShrink: 0 }}>
    <path d="M12 2l2.9 8.9H23l-7.5 5.4 2.9 8.9L12 20l-6.4 5.2 2.9-8.9L1 11h8.1z" fill="#F29900"/>
  </svg>
);

const reviews = [
  { initials: 'B', name: 'Bartosz K.', color: '#1A73E8', datePL: '2 miesiące temu',  dateEN: '2 months ago',  localGuide: true,  reviewCount: 14, textPL: 'Cięcie idealne, atmosfera luźna, Aleksander to prawdziwy profesjonalista.',            textEN: 'Perfect cut, relaxed atmosphere — Aleksander is a true professional.' },
  { initials: 'W', name: 'Wojtek M.',  color: '#34A853', datePL: 'miesiąc temu',      dateEN: '1 month ago',   localGuide: false, reviewCount: 3,  textPL: 'Świetny barber shop z profesjonalnym podejściem do klienta.',                  textEN: 'Great barbershop with a professional approach to every client.' },
  { initials: 'M', name: 'Michał R.',  color: '#EA4335', datePL: '3 miesiące temu',  dateEN: '3 months ago',  localGuide: true,  reviewCount: 31, textPL: 'Idealne miejsce dla każdego mężczyzny, który chce zadbać o swój wygląd.',    textEN: 'The perfect place for any man who cares about his appearance.' },
  { initials: 'M', name: 'Marek S.',   color: '#9334E6', datePL: '5 miesięcy temu',  dateEN: '5 months ago',  localGuide: false, reviewCount: 7,  textPL: 'Off Cut to barber shop, który zdecydowanie polecam każdemu.',              textEN: 'Off Cut is a barbershop I would wholeheartedly recommend to anyone.' },
  { initials: 'K', name: 'Kamil T.',   color: '#FF6D00', datePL: 'tydzień temu',      dateEN: '1 week ago',    localGuide: true,  reviewCount: 8,  textPL: 'Nico zrobił mi niesamowity skin fade. Najlepsze miejsce w mieście!',       textEN: 'Nico did an incredible skin fade. Best place in the city!' },
  { initials: 'P', name: 'Paweł N.',   color: '#009688', datePL: '4 miesiące temu',  dateEN: '4 months ago',  localGuide: false, reviewCount: 2,  textPL: 'Profesjonalizm na najwyższym poziomie. Zadowolony w 100%.',               textEN: 'Professionalism at its finest. 100% satisfied.' },
  { initials: 'Ł', name: 'Łukasz B.',  color: '#3F51B5', datePL: '6 miesięcy temu',  dateEN: '6 months ago',  localGuide: true,  reviewCount: 22, textPL: 'Klimatyczne miejsce, świetni ludzie i jeszcze lepsze strzyżenie.',         textEN: 'Great atmosphere, great people, and even better haircuts.' },
  { initials: 'A', name: 'Adam K.',    color: '#E91E63', datePL: '7 miesięcy temu',  dateEN: '7 months ago',  localGuide: false, reviewCount: 5,  textPL: 'Julia jest mistrzem w swoim fachu. Polecam wszystkim!',                   textEN: 'Julia is a master of her craft. I recommend to everyone!' },
];

const PER_PAGE = 4;
const TOTAL_PAGES = Math.ceil(reviews.length / PER_PAGE);

export default function Reviews() {
  const ref = useReveal();
  const [page, setPage]     = useState(0);
  const [fading, setFading] = useState(false);
  const pageRef = useRef(0);

  function goTo(next) {
    setFading(true);
    setTimeout(() => {
      pageRef.current = next;
      setPage(next);
      setFading(false);
    }, 350);
  }

  useEffect(() => {
    const t = setInterval(() => {
      goTo((pageRef.current + 1) % TOTAL_PAGES);
    }, 60000);
    return () => clearInterval(t);
  }, []);

  const visible = reviews.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <section id="reviews" className="reviews-section" ref={ref}>
      <div className="section-header">
        <div>
          <div className="section-number">{useT('04 / OPINIE', '04 / REVIEWS')}</div>
          <div className="section-title">{useT('Co mówią klienci', 'What Clients Say')}</div>
        </div>
        <a className="section-link" href="https://share.google/YjV0HAKR6jNQyiiHg" target="_blank" rel="noopener noreferrer">
          {useT('Wszystkie opinie →', 'All reviews →')}
        </a>
      </div>

      <div className="reviews-aggregate reveal">
        <div className="reviews-aggregate-score">5.0</div>
        <div className="reviews-aggregate-middle">
          <div className="reviews-aggregate-stars">★★★★★</div>
          <div className="reviews-aggregate-label">{useT('Ocena w Google', 'Google rating')}</div>
        </div>
        <div className="reviews-aggregate-divider" />
        <div className="reviews-aggregate-right">
          <GoogleG size={22} />
          <span className="reviews-aggregate-google">Google Maps</span>
        </div>
      </div>

      <div className={`reviews-grid${fading ? ' reviews-fading' : ''}`}>
        {visible.map((r) => (
          <a className="review-card" key={r.name} href="https://share.google/YjV0HAKR6jNQyiiHg" target="_blank" rel="noopener noreferrer">
            <div className="review-card-top">
              <div className="review-avatar" style={{ background: r.color }}>{r.initials}</div>
              <div className="review-meta">
                <div className="review-author">{r.name}</div>
                <div className="review-submeta">
                  {r.localGuide && <span className="review-local-guide"><LocalGuideIcon />{useT('Lokalny przewodnik', 'Local Guide')}</span>}
                  {r.localGuide && <span className="review-dot">·</span>}
                  <span className="review-count">{r.reviewCount} {useT('opinii', 'reviews')}</span>
                </div>
              </div>
              <GoogleG size={18} />
            </div>
            <div className="review-stars-row">
              <span className="review-stars">★★★★★</span>
              <span className="review-date">{useT(r.datePL, r.dateEN)}</span>
            </div>
            <p className="review-text">{useT(r.textPL, r.textEN)}</p>
          </a>
        ))}
      </div>

      <div className="reviews-dots">
        {Array.from({ length: TOTAL_PAGES }, (_, i) => (
          <button key={i} className={`reviews-dot${i === page ? ' active' : ''}`} onClick={() => goTo(i)} aria-label={`Page ${i + 1}`} />
        ))}
      </div>
    </section>
  );
}
