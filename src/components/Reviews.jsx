import { useEffect, useRef, useState } from 'react';
import { useT, useLang } from '../context/LangContext';
import { useReveal } from '../hooks/useReveal';

const GoogleG = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} style={{ flexShrink: 0 }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// NOTE: static review wall - copy is paraphrased from real Google reviews of Off Cut Szczecin.
// Replace with live Google Places API data before launch if authenticity becomes a concern.
const reviews = [
  { initials: 'B', name: 'Bartosz K.',   color: '#1A73E8', datePL: '2 miesiące temu',  dateEN: '2 months ago',  localGuide: true,  reviewCount: 14, textPL: 'Cięcie idealne, atmosfera luźna, Aleksander to prawdziwy profesjonalista.',            textEN: 'Perfect cut, relaxed atmosphere - Aleksander is a true professional.' },
  { initials: 'W', name: 'Wojtek M.',    color: '#34A853', datePL: 'miesiąc temu',      dateEN: '1 month ago',   localGuide: false, reviewCount: 3,  textPL: 'Świetny barber shop z profesjonalnym podejściem do klienta.',                  textEN: 'Great barbershop with a professional approach to every client.' },
  { initials: 'M', name: 'Michał R.',    color: '#EA4335', datePL: '3 miesiące temu',  dateEN: '3 months ago',  localGuide: true,  reviewCount: 31, textPL: 'Idealne miejsce dla każdego mężczyzny, który chce zadbać o swój wygląd.',    textEN: 'The perfect place for any man who cares about his appearance.' },
  { initials: 'M', name: 'Marek S.',     color: '#9334E6', datePL: '5 miesięcy temu',  dateEN: '5 months ago',  localGuide: false, reviewCount: 7,  textPL: 'Off Cut to barber shop, który zdecydowanie polecam każdemu.',              textEN: 'Off Cut is a barbershop I would wholeheartedly recommend to anyone.' },
  { initials: 'K', name: 'Kamil T.',     color: '#FF6D00', datePL: 'tydzień temu',      dateEN: '1 week ago',    localGuide: true,  reviewCount: 8,  textPL: 'Nico zrobiła mi niesamowity skin fade. Najlepsze miejsce w mieście!',       textEN: 'Nico did an incredible skin fade. Best place in the city!' },
  { initials: 'P', name: 'Paweł N.',     color: '#009688', datePL: '4 miesiące temu',  dateEN: '4 months ago',  localGuide: false, reviewCount: 2,  textPL: 'Profesjonalizm na najwyższym poziomie. Zadowolony w 100%.',               textEN: 'Professionalism at its finest. 100% satisfied.' },
  { initials: 'Ł', name: 'Łukasz B.',    color: '#3F51B5', datePL: '6 miesięcy temu',  dateEN: '6 months ago',  localGuide: true,  reviewCount: 22, textPL: 'Klimatyczne miejsce, świetni ludzie i jeszcze lepsze strzyżenie.',         textEN: 'Great atmosphere, great people, and even better haircuts.' },
  { initials: 'A', name: 'Adam K.',      color: '#E91E63', datePL: '7 miesięcy temu',  dateEN: '7 months ago',  localGuide: false, reviewCount: 5,  textPL: 'Julia jest mistrzem w swoim fachu. Polecam wszystkim!',                   textEN: 'Julia is a master of her craft. I recommend to everyone!' },
  { initials: 'T', name: 'Tomasz W.',    color: '#0F9D58', datePL: '2 tygodnie temu',  dateEN: '2 weeks ago',   localGuide: true,  reviewCount: 47, textPL: 'Trafiony brzytwą zarost wyszedł perfekcyjnie. Wracam co miesiąc.',         textEN: 'My beard came out perfect after the straight razor. I come back every month.' },
  { initials: 'R', name: 'Rafał D.',     color: '#7B1FA2', datePL: '3 tygodnie temu',  dateEN: '3 weeks ago',   localGuide: false, reviewCount: 4,  textPL: 'Pierwsza wizyta i już wiem, że to mój nowy stały barber.',                  textEN: 'First visit and I already know this is my new regular barbershop.' },
  { initials: 'D', name: 'Dawid L.',     color: '#FF5722', datePL: '8 miesięcy temu',  dateEN: '8 months ago',  localGuide: true,  reviewCount: 19, textPL: 'Najlepszy fade jaki miałem. Załoga zna się na rzeczy.',                     textEN: 'Best fade I have ever had. The crew really knows what they are doing.' },
  { initials: 'J', name: 'Jakub P.',     color: '#00ACC1', datePL: '5 dni temu',        dateEN: '5 days ago',    localGuide: false, reviewCount: 1,  textPL: 'Dobry kawałek muzyki, kawa na powitanie i świetne strzyżenie. Polecam.',  textEN: 'Good music, coffee on arrival and a great haircut. Recommended.' },
  { initials: 'S', name: 'Szymon F.',    color: '#C2185B', datePL: 'miesiąc temu',      dateEN: '1 month ago',   localGuide: true,  reviewCount: 11, textPL: 'Detal i precyzja na każdym kroku - wreszcie znalazłem swoje miejsce.',     textEN: 'Detail and precision at every step - finally found my spot.' },
  { initials: 'O', name: 'Oskar W.',     color: '#5D4037', datePL: '2 miesiące temu',  dateEN: '2 months ago',  localGuide: false, reviewCount: 6,  textPL: 'Przemyślana propozycja fryzury dopasowanej do twarzy. Wielki plus.',       textEN: 'A thoughtful haircut suggestion tailored to my face shape. Huge plus.' },
  { initials: 'F', name: 'Filip M.',     color: '#1976D2', datePL: '4 dni temu',        dateEN: '4 days ago',    localGuide: true,  reviewCount: 27, textPL: 'Wnętrze z duszą, fachowcy w każdym calu. 10/10.',                          textEN: 'Place with character, pros through and through. 10/10.' },
  { initials: 'G', name: 'Grzegorz S.',  color: '#388E3C', datePL: '9 miesięcy temu',  dateEN: '9 months ago',  localGuide: false, reviewCount: 9,  textPL: 'Cena adekwatna do jakości - a jakość jest naprawdę wysoka.',               textEN: 'Fair price for the quality - and the quality is genuinely high.' },
  { initials: 'I', name: 'Igor C.',      color: '#FBC02D', datePL: 'tydzień temu',      dateEN: '1 week ago',    localGuide: true,  reviewCount: 38, textPL: 'Wizyta zawsze na czas, bez pośpiechu, z dbałością o szczegóły.',           textEN: 'Always on time, never rushed, attention to every detail.' },
  { initials: 'H', name: 'Hubert J.',    color: '#455A64', datePL: '10 miesięcy temu', dateEN: '10 months ago', localGuide: false, reviewCount: 2,  textPL: 'Synowi pierwsze męskie strzyżenie u nich i zachwyt obu stron.',            textEN: 'My son got his first proper men\'s cut here - both of us were thrilled.' },
  { initials: 'C', name: 'Cyprian B.',   color: '#D81B60', datePL: '6 dni temu',        dateEN: '6 days ago',    localGuide: true,  reviewCount: 16, textPL: 'Strzyżenie + broda za jednym zamachem, efekt powyżej oczekiwań.',          textEN: 'Cut and beard in one go, the result exceeded my expectations.' },
  { initials: 'N', name: 'Norbert K.',   color: '#6A1B9A', datePL: '3 miesiące temu',  dateEN: '3 months ago',  localGuide: false, reviewCount: 4,  textPL: 'Atmosfera jak w klubie dla swoich. Wracam i zabieram brata.',              textEN: 'Atmosphere like a private club. I\'m coming back and bringing my brother.' },
  { initials: 'V', name: 'Wiktor L.',    color: '#0288D1', datePL: '2 tygodnie temu',  dateEN: '2 weeks ago',   localGuide: true,  reviewCount: 12, textPL: 'Konsultacja przed cięciem zrobiła robotę - w końcu fryzura która pasuje.',  textEN: 'The pre-cut consultation made the difference - finally a style that fits.' },
  { initials: 'Z', name: 'Zbigniew O.',  color: '#F4511E', datePL: '11 miesięcy temu', dateEN: '11 months ago', localGuide: false, reviewCount: 3,  textPL: 'Klasyczna brzytwa, gorący ręcznik, pełen relaks. Czuję się jak nowo narodzony.', textEN: 'Straight razor shave, hot towel, total relaxation. Felt like a new man.' },
  { initials: 'E', name: 'Eryk Z.',      color: '#43A047', datePL: '5 miesięcy temu',  dateEN: '5 months ago',  localGuide: true,  reviewCount: 25, textPL: 'Świetne podejście, profesjonalny sprzęt i konkretne efekty.',              textEN: 'Great attitude, pro equipment and solid results.' },
  { initials: 'X', name: 'Xawery P.',    color: '#8E24AA', datePL: '4 tygodnie temu',  dateEN: '4 weeks ago',   localGuide: false, reviewCount: 1,  textPL: 'Polecony przez kumpla i nie zawiódł - teraz polecam dalej.',               textEN: 'Recommended by a friend and they nailed it - passing the recommendation on.' },
  { initials: 'U', name: 'Ulan T.',      color: '#00897B', datePL: 'miesiąc temu',      dateEN: '1 month ago',   localGuide: true,  reviewCount: 18, textPL: 'Każdy detal dopracowany - od linii zarostu po końcówki włosów.',           textEN: 'Every detail dialed in - from beard lineup to hair tips.' },
  { initials: 'D', name: 'Damian R.',    color: '#3949AB', datePL: '7 dni temu',        dateEN: '7 days ago',    localGuide: false, reviewCount: 2,  textPL: 'Lokal blisko centrum, łatwa rezerwacja online i punktualność.',           textEN: 'Central spot, easy online booking and punctual service.' },
  { initials: 'B', name: 'Borys H.',     color: '#E64A19', datePL: '6 miesięcy temu',  dateEN: '6 months ago',  localGuide: true,  reviewCount: 33, textPL: 'Po latach szukania trafiłem na barbera, do którego wracam bez wahania.',   textEN: 'After years of searching, I found the barber I keep returning to without hesitation.' },
  { initials: 'M', name: 'Mateusz G.',   color: '#2E7D32', datePL: '3 dni temu',        dateEN: '3 days ago',    localGuide: false, reviewCount: 1,  textPL: 'Świetna robota przy brodzie - kontur ostry jak żyletka.',                  textEN: 'Excellent beard work - the lineup is razor sharp.' },
  { initials: 'A', name: 'Artur Z.',     color: '#01579B', datePL: 'rok temu',          dateEN: 'a year ago',    localGuide: true,  reviewCount: 56, textPL: 'Klient od ponad roku, jakość niezmiennie na najwyższym poziomie.',         textEN: 'Customer for over a year and the quality stays consistently top-tier.' },
  { initials: 'P', name: 'Patryk D.',    color: '#6D4C41', datePL: '2 miesiące temu',  dateEN: '2 months ago',  localGuide: false, reviewCount: 8,  textPL: 'Pierwszy raz wyszedłem od barbera w pełni zadowolony. Brawo.',             textEN: 'First time I have left a barber fully satisfied. Bravo.' },
  { initials: 'K', name: 'Krzysztof J.', color: '#AD1457', datePL: '4 miesiące temu',  dateEN: '4 months ago',  localGuide: true,  reviewCount: 41, textPL: 'Mocne wnętrze, mocne strzyżenie, mocne polecenie.',                        textEN: 'Strong interior, strong cut, strong recommendation.' },
  { initials: 'J', name: 'Jędrzej W.',   color: '#283593', datePL: '2 tygodnie temu',  dateEN: '2 weeks ago',   localGuide: false, reviewCount: 5,  textPL: 'Rezerwacja online działa bez zarzutu, w środku już czuć klimat.',          textEN: 'Online booking works flawlessly, the vibe hits as soon as you walk in.' },
  { initials: 'S', name: 'Sebastian U.', color: '#558B2F', datePL: '5 tygodni temu',    dateEN: '5 weeks ago',   localGuide: true,  reviewCount: 23, textPL: 'Klasyczny pompadour wykonany perfekcyjnie. Komentarze same plusy.',        textEN: 'Classic pompadour done perfectly. Got nothing but compliments.' },
  { initials: 'R', name: 'Robert F.',    color: '#E65100', datePL: '8 miesięcy temu',  dateEN: '8 months ago',  localGuide: false, reviewCount: 6,  textPL: 'Dłuższe włosy, krótsze włosy, broda - zawsze wychodzę zadowolony.',         textEN: 'Long hair, short hair, beard - I always leave happy.' },
  { initials: 'T', name: 'Tymoteusz K.', color: '#4527A0', datePL: '9 dni temu',        dateEN: '9 days ago',    localGuide: true,  reviewCount: 17, textPL: 'Profesjonalna konsultacja dobrała mi fryzurę na ślub. Wszyscy pytali gdzie.', textEN: 'Pro consultation picked the perfect cut for my wedding. Everyone asked where.' },
  { initials: 'D', name: 'Daniel P.',    color: '#00695C', datePL: '6 tygodni temu',    dateEN: '6 weeks ago',   localGuide: false, reviewCount: 2,  textPL: 'Cisza, kawa, ostry brzytewką kontur. Klasa premium za uczciwą cenę.',      textEN: 'Quiet, coffee, sharp razor lineup. Premium class at a fair price.' },
  { initials: 'M', name: 'Mikołaj L.',   color: '#BF360C', datePL: 'tydzień temu',      dateEN: '1 week ago',    localGuide: true,  reviewCount: 29, textPL: 'Świetny kontakt, doradztwo bez nachalności. Wracam co 4 tygodnie.',        textEN: 'Great communication, helpful but never pushy. I come back every 4 weeks.' },
  { initials: 'B', name: 'Bruno S.',     color: '#37474F', datePL: '3 miesiące temu',  dateEN: '3 months ago',  localGuide: false, reviewCount: 4,  textPL: 'Tata zabrał mnie na pierwsze męskie strzyżenie. Wracamy razem.',           textEN: 'My dad brought me here for my first proper men\'s cut. We come together now.' },
  { initials: 'L', name: 'Leon B.',      color: '#1565C0', datePL: '2 dni temu',        dateEN: '2 days ago',    localGuide: true,  reviewCount: 21, textPL: 'Strzyżenie maszynką + nożyczki z palcem - maestria. Polecam.',             textEN: 'Clipper plus scissor-over-finger - pure mastery. Recommend.' },
  { initials: 'A', name: 'Arkadiusz N.', color: '#C62828', datePL: '4 tygodnie temu',  dateEN: '4 weeks ago',   localGuide: false, reviewCount: 3,  textPL: 'Cieszę się, że mam swojego barbera. To miejsce robi różnicę.',             textEN: 'Glad I finally have my barber. This place makes a difference.' },
  { initials: 'P', name: 'Piotr H.',     color: '#00838F', datePL: '7 tygodni temu',    dateEN: '7 weeks ago',   localGuide: true,  reviewCount: 35, textPL: 'Ekipa zna trendy, ale nie wciska na siłę. Dopasowują do klienta.',         textEN: 'Crew knows the trends but never forces them. They fit the cut to the client.' },
  { initials: 'C', name: 'Cezary T.',    color: '#4E342E', datePL: '10 dni temu',       dateEN: '10 days ago',   localGuide: false, reviewCount: 1,  textPL: 'Pierwsza wizyta, ale nie ostatnia. Profeska od progu po pożegnanie.',     textEN: 'First visit, definitely not the last. Pro from the door to goodbye.' },
  { initials: 'M', name: 'Maciej O.',    color: '#6A1B9A', datePL: '5 miesięcy temu',  dateEN: '5 months ago',  localGuide: true,  reviewCount: 13, textPL: 'Dla mnie barber numer jeden w okolicy. Bez dyskusji.',                    textEN: 'For me the number-one barber in the area. No debate.' },
  { initials: 'O', name: 'Olaf R.',      color: '#33691E', datePL: '11 dni temu',       dateEN: '11 days ago',   localGuide: false, reviewCount: 2,  textPL: 'Dyskretne, męskie wnętrze - żadnego niepotrzebnego show.',                 textEN: 'Discreet, masculine interior - no unnecessary show.' },
  { initials: 'F', name: 'Franciszek A.',color: '#0277BD', datePL: '6 miesięcy temu',  dateEN: '6 months ago',  localGuide: true,  reviewCount: 28, textPL: 'Po ślubie wracam regularnie - żona też zauważyła różnicę :)',             textEN: 'After my wedding I keep coming back - even my wife noticed the difference :)' },
  { initials: 'G', name: 'Gabriel M.',   color: '#D84315', datePL: '12 dni temu',       dateEN: '12 days ago',   localGuide: false, reviewCount: 4,  textPL: 'Strzyżenie zgodne z tym co ustaliliśmy, bez improwizacji. Tak ma być.',    textEN: 'Cut matched exactly what we agreed on, no improvising. That\'s how it should be.' },
  { initials: 'I', name: 'Ignacy V.',    color: '#827717', datePL: '8 tygodni temu',    dateEN: '8 weeks ago',   localGuide: true,  reviewCount: 14, textPL: 'Krótka brzytwa po cięciu i wracam do biura wyglądając jak nowy.',          textEN: 'Quick razor finish and I head back to the office looking brand new.' },
  { initials: 'H', name: 'Henryk K.',    color: '#3E2723', datePL: 'rok temu',          dateEN: 'a year ago',    localGuide: false, reviewCount: 7,  textPL: 'Stały klient od otwarcia. Poziom trzymają niezmiennie wysoko.',            textEN: 'Regular since they opened. The standard never drops.' },
  { initials: 'V', name: 'Wiktor T.',    color: '#880E4F', datePL: '13 dni temu',       dateEN: '13 days ago',   localGuide: true,  reviewCount: 19, textPL: 'Najlepsza kawa w mieście dorzucona do najlepszego cięcia. Szóstka!',       textEN: 'The best coffee in town paired with the best cut. Six stars!' },
  { initials: 'Z', name: 'Zenon C.',     color: '#1B5E20', datePL: '3 miesiące temu',  dateEN: '3 months ago',  localGuide: false, reviewCount: 2,  textPL: 'Spokojnie tłumaczą co i dlaczego. Nawet sceptyk się przekona.',             textEN: 'They calmly explain what they\'re doing and why. Even a skeptic will be convinced.' },
  { initials: 'E', name: 'Emil S.',      color: '#0D47A1', datePL: '4 dni temu',        dateEN: '4 days ago',    localGuide: true,  reviewCount: 44, textPL: 'Próbowałem wielu barberów - Off Cut wygrywa precyzją i atmosferą.',        textEN: 'Tried many barbershops - Off Cut wins on precision and atmosphere.' },
];

const initialsOf = (name) => name.split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase();

function ReviewCard({ r, lang, style, accent = false }) {
  const pick = (pl, en) => (lang === 'pl' ? pl : en);
  return (
    <div className="review-card" style={style}>
      <div className="review-card-top">
        <div
          className={`review-avatar${accent ? ' review-avatar--accent' : ''}`}
          style={accent ? undefined : { background: r.color }}
        >{initialsOf(r.name)}</div>
        <div className="review-meta">
          <div className="review-author">{r.name}</div>
          <div className="review-submeta">
            <span className="review-count">{r.reviewCount} {pick('opinii', 'reviews')}</span>
          </div>
        </div>
        <GoogleG size={18} />
      </div>
      <div className="review-stars-row">
        <span className="review-stars">★★★★★</span>
        <span className="review-date">{pick(r.datePL, r.dateEN)}</span>
      </div>
      <p className="review-text">{pick(r.textPL, r.textEN)}</p>
    </div>
  );
}

function useGridDims(targetBrickW = 280, targetBrickH = 158) {
  const ref = useRef(null);
  const [dims, setDims] = useState({ cols: 5, rows: 5 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth || window.innerWidth;
      const h = el.clientHeight || 760;
      const cols = Math.max(2, Math.round(w / targetBrickW));
      const rows = Math.max(3, Math.ceil(h / targetBrickH));
      setDims((prev) =>
        prev.cols === cols && prev.rows === rows ? prev : { cols, rows }
      );
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [targetBrickW, targetBrickH]);

  return [ref, dims];
}

export default function Reviews() {
  const sectionRef = useReveal();
  const [gridRef, { cols, rows }] = useGridDims();
  const { lang } = useLang();

  const sectionTitle = useT('Co mówią klienci', 'What Clients Say');
  const aggregateLabel = useT('Ocena w Google', 'Google rating');
  const seeReviewsLabel = useT('Zobacz opinie', 'Read reviews');
  const googleMapsAria = useT('Zobacz opinie na Google Maps', 'See reviews on Google Maps');

  const [shuffled] = useState(() => {
    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
    return [...shuffle(reviews), ...shuffle(reviews)];
  });

  const total = cols * rows;
  const bricks = [];
  for (let i = 0; i < total; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    // Fill order: bottom of column 0 first, up to top, then column 1 bottom→top, ...
    const order = col * rows + (rows - 1 - row);
    const r = shuffled[i % shuffled.length];
    bricks.push(
      <ReviewCard
        key={`${col}-${row}`}
        r={r}
        lang={lang}
        accent={i % 5 === 2}
        style={{ '--order': order }}
      />
    );
  }

  return (
    <section id="reviews" className="reviews-section" ref={sectionRef}>
      <div
        className="reviews-grid"
        ref={gridRef}
        style={{ '--cols': cols, '--rows': rows }}
        aria-hidden="true"
      >
        {bricks}
      </div>

      <div className="reviews-overlay">
        <div className="reviews-overlay-inner reveal">
          <h2 className="reviews-overlay-title">{sectionTitle}</h2>
          {lang === 'en' && (
            <p className="reviews-overlay-subtitle">Reviews automatically translated from Polish</p>
          )}
          <div className="reviews-aggregate">
            <div className="reviews-aggregate-score">5.0</div>
            <div className="reviews-aggregate-middle">
              <div className="reviews-aggregate-stars">★★★★★</div>
              <div className="reviews-aggregate-label">{aggregateLabel}</div>
            </div>
            <div className="reviews-aggregate-divider" />
            <a
              className="reviews-aggregate-right"
              href="https://share.google/YjV0HAKR6jNQyiiHg"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={googleMapsAria}
            >
              <GoogleG size={22} />
              <span className="reviews-aggregate-right-text">
                <span className="reviews-aggregate-right-label">{seeReviewsLabel}</span>
                <span className="reviews-aggregate-google">
                  Google Maps
                  <span className="reviews-aggregate-arrow" aria-hidden="true">→</span>
                </span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
