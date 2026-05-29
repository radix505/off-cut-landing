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
  { initials: 'B', name: 'Bartosz K.',   color: '#1A73E8', datePL: '2 miesiące temu',  dateEN: '2 months ago',  localGuide: true,  reviewCount: 14, textPL: 'Aleksander wie, co robi - cięcie wyszło dokładnie tak, jak chciałem, a do tego luźna gadka przy fotelu.', textEN: 'Aleksander knows his stuff - the cut came out exactly how I wanted, plus easy conversation in the chair.' },
  { initials: 'W', name: 'Wojtek M.',    color: '#34A853', datePL: 'miesiąc temu',      dateEN: '1 month ago',   localGuide: false, reviewCount: 3,  textPL: 'Pierwszy raz ktoś naprawdę zapytał, jak chcę mieć ostrzyżone, zanim sięgnął po maszynkę.', textEN: 'First time someone actually asked how I wanted it before reaching for the clippers.' },
  { initials: 'M', name: 'Michał R.',    color: '#EA4335', datePL: '3 miesiące temu',  dateEN: '3 months ago',  localGuide: true,  reviewCount: 31, textPL: 'Chodzę tu od pół roku i za każdym razem wychodzę z głową lepszą, niż wszedłem.', textEN: 'I\'ve been coming for six months and I leave looking better than when I walked in, every time.' },
  { initials: 'M', name: 'Marek S.',     color: '#9334E6', datePL: '5 miesięcy temu',  dateEN: '5 months ago',  localGuide: false, reviewCount: 7,  textPL: 'Szukałem tylko miejsca blisko domu, a znalazłem barbera, którego nie chcę zmieniać.', textEN: 'I was just looking for somewhere close to home and found a barber I don\'t want to switch.' },
  { initials: 'K', name: 'Kamil T.',     color: '#FF6D00', datePL: 'tydzień temu',      dateEN: '1 week ago',    localGuide: true,  reviewCount: 8,  textPL: 'Nico zrobiła mi skin fade tak czysty, że znajomi od razu zapytali, gdzie się strzygę.', textEN: 'Nico gave me a skin fade so clean my mates immediately asked where I get it done.' },
  { initials: 'P', name: 'Paweł N.',     color: '#009688', datePL: '4 miesiące temu',  dateEN: '4 months ago',  localGuide: false, reviewCount: 2,  textPL: 'Trafiłem tu trochę z przypadku, a wyszedłem naprawdę zadowolony. Na pewno wrócę.', textEN: 'Walked in almost by chance and left genuinely happy. I\'ll definitely be back.' },
  { initials: 'Ł', name: 'Łukasz B.',    color: '#3F51B5', datePL: '6 miesięcy temu',  dateEN: '6 months ago',  localGuide: true,  reviewCount: 22, textPL: 'Wpadłem na szybkie cięcie, a wyszedłem po godzinie dobrej rozmowy i z najlepszą fryzurą od lat.', textEN: 'Came in for a quick cut and left an hour later - good conversation and the best haircut in years.' },
  { initials: 'A', name: 'Adam K.',      color: '#E91E63', datePL: '7 miesięcy temu',  dateEN: '7 months ago',  localGuide: false, reviewCount: 5,  textPL: 'Julia to prawdziwa mistrzyni w swoim fachu - wytłumaczyła, co zrobi, i zrobiła to perfekcyjnie.', textEN: 'Julia is a true master of her craft - she explained what she\'d do and nailed it.' },
  { initials: 'T', name: 'Tomasz W.',    color: '#0F9D58', datePL: '2 tygodnie temu',  dateEN: '2 weeks ago',   localGuide: true,  reviewCount: 47, textPL: 'Brodę dopracowali brzytwą co do milimetra. Wracam co miesiąc i nie zamierzam tego zmieniać.', textEN: 'They shaped my beard with a razor down to the millimeter. I come back every month and I\'m not changing that.' },
  { initials: 'R', name: 'Rafał D.',     color: '#7B1FA2', datePL: '3 tygodnie temu',  dateEN: '3 weeks ago',   localGuide: false, reviewCount: 4,  textPL: 'Pierwsza wizyta, a już wiem, że znalazłem swojego barbera na stałe.', textEN: 'First visit and I already know I\'ve found my regular barber.' },
  { initials: 'D', name: 'Dawid L.',     color: '#FF5722', datePL: '8 miesięcy temu',  dateEN: '8 months ago',  localGuide: true,  reviewCount: 19, textPL: 'Najlepszy fade, jaki w życiu miałem - chłopaki naprawdę wiedzą, co robią.', textEN: 'Best fade I\'ve ever had - these guys really know what they\'re doing.' },
  { initials: 'J', name: 'Jakub P.',     color: '#00ACC1', datePL: '5 dni temu',        dateEN: '5 days ago',    localGuide: false, reviewCount: 1,  textPL: 'Kawa na powitanie, dobra muzyka w tle i strzyżenie, do którego nie mam się o co przyczepić.', textEN: 'Coffee when you arrive, good music in the background, and a cut I can\'t find a single fault with.' },
  { initials: 'S', name: 'Szymon F.',    color: '#C2185B', datePL: 'miesiąc temu',      dateEN: '1 month ago',   localGuide: true,  reviewCount: 11, textPL: 'Widać, że robią to z głową - w końcu trafiłem na miejsce, do którego chce się wracać.', textEN: 'You can tell they put thought into it - I finally found a place I actually want to come back to.' },
  { initials: 'O', name: 'Oskar W.',     color: '#5D4037', datePL: '2 miesiące temu',  dateEN: '2 months ago',  localGuide: false, reviewCount: 6,  textPL: 'Sam bym nie wpadł na taką fryzurę, a okazało się, że idealnie pasuje do mojej twarzy.', textEN: 'I\'d never have thought of this cut myself, and it turned out to suit my face perfectly.' },
  { initials: 'F', name: 'Filip M.',     color: '#1976D2', datePL: '4 dni temu',        dateEN: '4 days ago',    localGuide: true,  reviewCount: 27, textPL: 'Wnętrze ma swój charakter, a obsługa zna się na rzeczy. Trudno o lepszy adres w mieście.', textEN: 'The place has real character and the staff know their craft. Hard to find a better spot in town.' },
  { initials: 'G', name: 'Grzegorz S.',  color: '#388E3C', datePL: '9 miesięcy temu',  dateEN: '9 months ago',  localGuide: false, reviewCount: 9,  textPL: 'Płacisz uczciwie i dostajesz robotę, za którą gdzie indziej życzą sobie dwa razy tyle.', textEN: 'You pay a fair price and get work other places would charge twice as much for.' },
  { initials: 'I', name: 'Igor C.',      color: '#FBC02D', datePL: 'tydzień temu',      dateEN: '1 week ago',    localGuide: true,  reviewCount: 38, textPL: 'Zawsze przyjmują o czasie i nikt cię nie pogania - widać, że zależy im na detalach.', textEN: 'Always on time and nobody rushes you - you can see they care about the details.' },
  { initials: 'H', name: 'Hubert J.',    color: '#455A64', datePL: '10 miesięcy temu', dateEN: '10 months ago', localGuide: false, reviewCount: 2,  textPL: 'Syn miał tu swoje pierwsze prawdziwe męskie strzyżenie i obaj wyszliśmy zachwyceni.', textEN: 'My son had his first proper men\'s cut here and we both walked out delighted.' },
  { initials: 'C', name: 'Cyprian B.',   color: '#D81B60', datePL: '6 dni temu',        dateEN: '6 days ago',    localGuide: true,  reviewCount: 16, textPL: 'Strzyżenie i broda w jednej wizycie, a efekt przerósł to, na co liczyłem.', textEN: 'Cut and beard in a single visit, and the result beat what I was hoping for.' },
  { initials: 'N', name: 'Norbert K.',   color: '#6A1B9A', datePL: '3 miesiące temu',  dateEN: '3 months ago',  localGuide: false, reviewCount: 4,  textPL: 'Atmosfera jak w klubie tylko dla swoich. Następnym razem przyciągnę tu brata.', textEN: 'Feels like a members-only club. Next time I\'m dragging my brother along.' },
  { initials: 'V', name: 'Wiktor L.',    color: '#0288D1', datePL: '2 tygodnie temu',  dateEN: '2 weeks ago',   localGuide: true,  reviewCount: 12, textPL: 'Krótka rozmowa przed cięciem zrobiła robotę - w końcu mam fryzurę, która do mnie pasuje.', textEN: 'A quick chat before the cut did the trick - I finally have a style that actually fits me.' },
  { initials: 'Z', name: 'Zbigniew O.',  color: '#F4511E', datePL: '11 miesięcy temu', dateEN: '11 months ago', localGuide: false, reviewCount: 3,  textPL: 'Brzytwa, gorący ręcznik i chwila pełnego luzu. Wyszedłem jak nowo narodzony.', textEN: 'Straight razor, hot towel and a moment of total calm. I walked out a new man.' },
  { initials: 'E', name: 'Eryk Z.',      color: '#43A047', datePL: '5 miesięcy temu',  dateEN: '5 months ago',  localGuide: true,  reviewCount: 25, textPL: 'Dobry sprzęt, konkretne podejście i efekt, który widać od razu w lustrze.', textEN: 'Good gear, a no-nonsense approach and a result you see in the mirror right away.' },
  { initials: 'X', name: 'Xawery P.',    color: '#8E24AA', datePL: '4 tygodnie temu',  dateEN: '4 weeks ago',   localGuide: false, reviewCount: 1,  textPL: 'Kolega mnie tu przysłał i się nie zawiodłem - teraz sam podsyłam znajomych.', textEN: 'A friend sent me here and I wasn\'t let down - now I\'m sending my own friends.' },
  { initials: 'U', name: 'Ulan T.',      color: '#00897B', datePL: 'miesiąc temu',      dateEN: '1 month ago',   localGuide: true,  reviewCount: 18, textPL: 'Dopięte na ostatni guzik - od linii brody po same końcówki włosów.', textEN: 'Buttoned up to the last detail - from the beard line to the very tips of the hair.' },
  { initials: 'D', name: 'Damian R.',    color: '#3949AB', datePL: '7 dni temu',        dateEN: '7 days ago',    localGuide: false, reviewCount: 2,  textPL: 'Blisko centrum, rezerwacja online zajmuje chwilę, a na miejscu nikt nie każe ci czekać.', textEN: 'Close to the center, online booking takes a second, and nobody keeps you waiting once you\'re there.' },
  { initials: 'B', name: 'Borys H.',     color: '#E64A19', datePL: '6 miesięcy temu',  dateEN: '6 months ago',  localGuide: true,  reviewCount: 33, textPL: 'Po latach skakania od barbera do barbera w końcu trafiłem na takiego, do którego wracam bez wahania.', textEN: 'After years of hopping between barbers I finally found one I come back to without a second thought.' },
  { initials: 'M', name: 'Mateusz G.',   color: '#2E7D32', datePL: '3 dni temu',        dateEN: '3 days ago',    localGuide: false, reviewCount: 1,  textPL: 'Świetna robota przy brodzie - kontur wyszedł ostry jak żyletka.', textEN: 'Great work on the beard - the lineup came out razor sharp.' },
  { initials: 'A', name: 'Artur Z.',     color: '#01579B', datePL: 'rok temu',          dateEN: 'a year ago',    localGuide: true,  reviewCount: 56, textPL: 'Strzygę się tu od ponad roku i jeszcze ani razu mnie nie zawiedli.', textEN: 'I\'ve been getting my cuts here for over a year and they\'ve never let me down once.' },
  { initials: 'P', name: 'Patryk D.',    color: '#6D4C41', datePL: '2 miesiące temu',  dateEN: '2 months ago',  localGuide: false, reviewCount: 8,  textPL: 'Pierwszy raz wyszedłem od barbera naprawdę zadowolony, a nie tylko „no, może być”.', textEN: 'First time I\'ve left a barber genuinely happy, not just “eh, good enough.”' },
  { initials: 'K', name: 'Krzysztof J.', color: '#AD1457', datePL: '4 miesiące temu',  dateEN: '4 months ago',  localGuide: true,  reviewCount: 41, textPL: 'Wnętrze ma klimat, a strzyżenie zrobili dokładnie tak, jak chciałem.', textEN: 'The place has a vibe, and they cut it exactly the way I wanted.' },
  { initials: 'J', name: 'Jędrzej W.',   color: '#283593', datePL: '2 tygodnie temu',  dateEN: '2 weeks ago',   localGuide: false, reviewCount: 5,  textPL: 'Rezerwacja online działa bez problemu, a klimat czuć już od progu.', textEN: 'Online booking works without a hitch, and you feel the vibe the moment you walk in.' },
  { initials: 'S', name: 'Sebastian U.', color: '#558B2F', datePL: '5 tygodni temu',    dateEN: '5 weeks ago',   localGuide: true,  reviewCount: 23, textPL: 'Klasyczny pompadour wyszedł perfekcyjnie - od znajomych same komplementy.', textEN: 'Classic pompadour came out perfect - nothing but compliments from friends.' },
  { initials: 'R', name: 'Robert F.',    color: '#E65100', datePL: '8 miesięcy temu',  dateEN: '8 months ago',  localGuide: false, reviewCount: 6,  textPL: 'Krótko, długo, z brodą czy bez - za każdym razem wychodzę zadowolony.', textEN: 'Short, long, with or without a beard - I leave happy every time.' },
  { initials: 'T', name: 'Tymoteusz K.', color: '#4527A0', datePL: '9 dni temu',        dateEN: '9 days ago',    localGuide: true,  reviewCount: 17, textPL: 'Doradzili mi fryzurę na ślub i był to strzał w dziesiątkę - goście dopytywali, gdzie się strzygłem.', textEN: 'They helped me pick a cut for my wedding and it was a bullseye - guests kept asking where I got it done.' },
  { initials: 'D', name: 'Daniel P.',    color: '#00695C', datePL: '6 tygodni temu',    dateEN: '6 weeks ago',   localGuide: false, reviewCount: 2,  textPL: 'Spokój, kawa i kontur dopracowany brzytwą. Solidna jakość bez windowania ceny.', textEN: 'Quiet, coffee and a lineup finished off with a razor. Solid quality without an inflated price.' },
  { initials: 'M', name: 'Mikołaj L.',   color: '#BF360C', datePL: 'tydzień temu',      dateEN: '1 week ago',    localGuide: true,  reviewCount: 29, textPL: 'Dobry kontakt, doradzą, ale nic nie wciskają na siłę. Wpadam co cztery tygodnie.', textEN: 'Easy to talk to, they\'ll advise you but never push anything. I drop in every four weeks.' },
  { initials: 'B', name: 'Bruno S.',     color: '#37474F', datePL: '3 miesiące temu',  dateEN: '3 months ago',  localGuide: false, reviewCount: 4,  textPL: 'Tata przyprowadził mnie tu na pierwsze męskie strzyżenie. Teraz przychodzimy razem.', textEN: 'My dad brought me here for my first proper men\'s cut. Now we come together.' },
  { initials: 'L', name: 'Leon B.',      color: '#1565C0', datePL: '2 dni temu',        dateEN: '2 days ago',    localGuide: true,  reviewCount: 21, textPL: 'Maszynka, a potem nożyczki na palcach - czysta robota. Widać wprawę.', textEN: 'Clippers first, then scissor-over-finger - clean work. You can see the experience.' },
  { initials: 'A', name: 'Arkadiusz N.', color: '#C62828', datePL: '4 tygodnie temu',  dateEN: '4 weeks ago',   localGuide: false, reviewCount: 3,  textPL: 'Dobrze jest mieć w końcu swojego barbera. To miejsce naprawdę robi różnicę.', textEN: 'It\'s good to finally have my own barber. This place genuinely makes a difference.' },
  { initials: 'P', name: 'Piotr H.',     color: '#00838F', datePL: '7 tygodni temu',    dateEN: '7 weeks ago',   localGuide: true,  reviewCount: 35, textPL: 'Znają trendy, ale nie wmuszają ich na siłę - strzygą pod konkretnego człowieka.', textEN: 'They know the trends but don\'t force them - they cut for the actual person in the chair.' },
  { initials: 'C', name: 'Cezary T.',    color: '#4E342E', datePL: '10 dni temu',       dateEN: '10 days ago',   localGuide: false, reviewCount: 1,  textPL: 'Pierwsza wizyta, ale na pewno nie ostatnia. Konkret od wejścia aż po pożegnanie.', textEN: 'First visit, definitely not the last. On point from the door to goodbye.' },
  { initials: 'M', name: 'Maciej O.',    color: '#6A1B9A', datePL: '5 miesięcy temu',  dateEN: '5 months ago',  localGuide: true,  reviewCount: 13, textPL: 'Dla mnie najlepszy barber w okolicy i nie ma tu nad czym dyskutować.', textEN: 'For me the best barber around, no argument.' },
  { initials: 'O', name: 'Olaf R.',      color: '#33691E', datePL: '11 dni temu',       dateEN: '11 days ago',   localGuide: false, reviewCount: 2,  textPL: 'Spokojne, męskie wnętrze bez zbędnego pokazywania się. Dokładnie tak, jak lubię.', textEN: 'A calm, masculine interior with no showing off. Exactly how I like it.' },
  { initials: 'F', name: 'Franciszek A.',color: '#0277BD', datePL: '6 miesięcy temu',  dateEN: '6 months ago',  localGuide: true,  reviewCount: 28, textPL: 'Po ślubie zostałem na stałe - nawet żona zauważyła różnicę :)', textEN: 'I stayed on after my wedding - even my wife noticed the difference :)' },
  { initials: 'G', name: 'Gabriel M.',   color: '#D84315', datePL: '12 dni temu',       dateEN: '12 days ago',   localGuide: false, reviewCount: 4,  textPL: 'Ostrzygli dokładnie tak, jak się umówiliśmy, bez żadnej improwizacji. Tak to ma wyglądać.', textEN: 'They cut it exactly as we agreed, no improvising. That\'s how it should be.' },
  { initials: 'I', name: 'Ignacy V.',    color: '#827717', datePL: '8 tygodni temu',    dateEN: '8 weeks ago',   localGuide: true,  reviewCount: 14, textPL: 'Szybkie wykończenie brzytwą i wracam do biura jak świeżo odpakowany.', textEN: 'A quick razor finish and I\'m back at the office looking brand new.' },
  { initials: 'H', name: 'Henryk K.',    color: '#3E2723', datePL: 'rok temu',          dateEN: 'a year ago',    localGuide: false, reviewCount: 7,  textPL: 'Strzygę się tu od otwarcia i poziom ani drgnął w dół.', textEN: 'I\'ve come here since they opened and the standard hasn\'t slipped an inch.' },
  { initials: 'V', name: 'Wiktor T.',    color: '#880E4F', datePL: '13 dni temu',       dateEN: '13 days ago',   localGuide: true,  reviewCount: 19, textPL: 'Najlepsza kawa w mieście do najlepszego cięcia - gdyby można było dać szóstkę, dałbym.', textEN: 'The best coffee in town with the best cut - if I could give six stars I would.' },
  { initials: 'Z', name: 'Zenon C.',     color: '#1B5E20', datePL: '3 miesiące temu',  dateEN: '3 months ago',  localGuide: false, reviewCount: 2,  textPL: 'Spokojnie tłumaczą, co i dlaczego robią. Nawet takiego sceptyka jak ja przekonali.', textEN: 'They calmly explain what they\'re doing and why. They even won over a skeptic like me.' },
  { initials: 'E', name: 'Emil S.',      color: '#0D47A1', datePL: '4 dni temu',        dateEN: '4 days ago',    localGuide: true,  reviewCount: 44, textPL: 'Przeszedłem przez wielu barberów, ale to Off Cut wygrywa precyzją i klimatem.', textEN: 'I\'ve been through plenty of barbers, but Off Cut wins on precision and atmosphere.' },
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
