import { useState, useMemo, useEffect, useRef } from 'react';
import { useLang } from '../context/LangContext';
import { useReveal } from '../hooks/useReveal';
import { useRouter } from '../context/RouterContext';
import { buildSlots } from '../data/booking-config';
import { BUSINESS_HOURS, HOURS_SUMMARY } from '../data/businessHours';
import { useCatalog } from '../context/CatalogContext';
import BookingTimeWheel from './BookingTimeWheel';
import { trackEvent } from '../lib/analytics';

const MONTH_PL = ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
const MONTH_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_PL  = ['Pon','Wt','Śr','Czw','Pt','Sob','Nie'];
const DAYS_EN  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function toISODate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function isValidEmail(s) { return EMAIL_RE.test((s ?? '').trim()); }
function isValidPhone(s) {
  const digits = (s ?? '').replace(/\D/g, '');
  if (digits.length === 9) return true;
  if (digits.length === 11 && digits.startsWith('48')) return true;
  return false;
}
function isValidName(s) { return (s ?? '').trim().length >= 2; }

function buildCalDays(year, month) {
  const first = new Date(year, month, 1).getDay();
  const offset = first === 0 ? 6 : first - 1;
  const total  = new Date(year, month + 1, 0).getDate();
  const days   = Array(offset).fill(null);
  for (let d = 1; d <= total; d++) days.push(d);
  return days;
}

function categorize(svc) {
  if (!svc) return null;
  if (svc.category) return svc.category;
  const txt = `${svc.namePL || ''} ${svc.nameEN || ''}`.toLowerCase();
  const hasBeard = /(brod|beard)/.test(txt);
  const hasHair  = /(strzy|włos|wlos|cut|hair|golenie głowy|head shave)/.test(txt);
  if (hasBeard && hasHair) return 'combo';
  if (hasBeard) return 'beard';
  return 'hair';
}

function pickVariantForBarber(svc, barberId) {
  if (!svc?.variants?.length) return svc;
  const variant = svc.variants.find((v) => (v.barberIds ?? []).includes(barberId));
  if (!variant) return svc;
  return { ...variant, variants: svc.variants };
}

const CATEGORY_DEFS = [
  {
    key: 'hair',
    namePL: 'Włosy', nameEN: 'Hair',
    subPL: 'Strzyżenie',  subEN: 'Cuts & Shaves',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="6" cy="6" r="3"/>
        <circle cx="6" cy="18" r="3"/>
        <line x1="20" y1="4" x2="8.12" y2="15.88"/>
        <line x1="14.47" y1="14.48" x2="20" y2="20"/>
        <line x1="8.12" y1="8.12" x2="12" y2="12"/>
      </svg>
    ),
  },
  {
    key: 'beard',
    namePL: 'Broda', nameEN: 'Beard',
    subPL: 'Trymowanie',  subEN: 'Trim & Edge',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 9 Q7 7, 9.5 9 Q11 10, 12 9.5 Q13 10, 14.5 9 Q17 7, 20 9"/>
        <path d="M5 12 Q5 17, 9 19 Q12 20.5, 15 19 Q19 17, 19 12"/>
        <line x1="10" y1="13" x2="14" y2="13"/>
      </svg>
    ),
  },
  {
    key: 'combo',
    namePL: 'Combo', nameEN: 'Combo',
    subPL: 'Włosy + Broda', subEN: 'Cut + Beard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="6" cy="4" r="1.6"/>
        <circle cx="14" cy="4" r="1.6"/>
        <line x1="7.35" y1="5.4" x2="14" y2="13"/>
        <line x1="12.65" y1="5.4" x2="6" y2="13"/>
        <path d="M5 16.6 Q7.5 15, 9.7 16.4 Q10.5 16.9, 11.5 16.6 Q12.5 16.9, 13.3 16.4 Q15.5 15, 18 16.6"/>
        <path d="M6 18.4 Q6 21.5, 10 22.1 Q14 21.5, 14 18.4"/>
      </svg>
    ),
  },
];

export default function Booking() {
  const ref = useReveal();
  const { lang } = useLang();
  const t = (pl, en) => (lang === 'pl' ? pl : en);
  const { navState, clearNavState } = useRouter();
  const { barbers: BARBERS, services: ALL_SERVICES } = useCatalog();

  const [step,      setStep]      = useState(1);
  const [barber,    setBarber]    = useState(null);
  const [category,  setCategory]  = useState(null);
  const [service,   setService]   = useState(null);
  const [date,      setDate]      = useState(null);
  const [slot,      setSlot]      = useState(null);
  const [calOpen,   setCalOpen]   = useState(true);
  const [calBase,   setCalBase]   = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [name,      setName]      = useState('');
  const [phone,     setPhone]     = useState('');
  const [email,     setEmail]     = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [unavailable,  setUnavailable]  = useState(() => new Set());
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [fullyBookedDates, setFullyBookedDates] = useState(() => new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg,     setErrorMsg]     = useState('');
  const [filteredBarberIds, setFilteredBarberIds] = useState(null);
  const [touched, setTouched] = useState({ name: false, phone: false, email: false });
  const [step4Phase, setStep4Phase] = useState('form'); // 'form' | 'resume'
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 540px)').matches
  );
  const wizardEndRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 540px)');
    const update = () => {
      setIsMobile(mq.matches);
      if (!mq.matches) setCalOpen(true);
    };
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const calYear  = calBase.getFullYear();
  const calMonth = calBase.getMonth();
  const calDays  = useMemo(() => buildCalDays(calYear, calMonth), [calYear, calMonth]);
  const slots    = useMemo(() => buildSlots(date), [date]);

  useEffect(() => {
    if (!barber || !date || !service) { setUnavailable(new Set()); return; }
    const iso = toISODate(date);
    const ctrl = new AbortController();
    setLoadingAvail(true);
    const params = new URLSearchParams({
      barberId: String(barber.id),
      date: iso,
      serviceId: service.id,
    });
    fetch(`/api/availability?${params}`, { signal: ctrl.signal })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(data => setUnavailable(new Set(data.unavailable ?? [])))
      .catch(err => { if (err.name !== 'AbortError') setUnavailable(new Set()); })
      .finally(() => setLoadingAvail(false));
    return () => ctrl.abort();
  }, [barber?.id, date, service?.id]);

  useEffect(() => {
    if (!barber || !service) { setFullyBookedDates(new Set()); return; }
    const ctrl = new AbortController();
    const params = new URLSearchParams({
      barberId: String(barber.id),
      serviceId: service.id,
      year: String(calYear),
      month: String(calMonth + 1),
    });
    fetch(`/api/availability/month?${params}`, { signal: ctrl.signal })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(data => setFullyBookedDates(new Set(data.fullyBookedDates ?? [])))
      .catch(err => { if (err.name !== 'AbortError') setFullyBookedDates(new Set()); });
    return () => ctrl.abort();
  }, [barber?.id, service?.id, calYear, calMonth]);

  useEffect(() => {
    if (step !== 3 || !date) return;
    const el = wizardEndRef.current;
    if (!el) return;
    const id = setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 120);
    return () => clearTimeout(id);
  }, [date, step]);

  useEffect(() => {
    if (step !== 3 || !slot) return;
    const el = wizardEndRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    return () => cancelAnimationFrame(id);
  }, [slot, step]);

  useEffect(() => {
    if (step !== 1 || !barber) return;
    const el = wizardEndRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    return () => cancelAnimationFrame(id);
  }, [barber, step]);

  useEffect(() => {
    if (!category || step !== 2) return;
    const el = wizardEndRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    return () => cancelAnimationFrame(id);
  }, [category, step]);

  useEffect(() => {
    if (step !== 2 || !service) return;
    const el = wizardEndRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    return () => cancelAnimationFrame(id);
  }, [service, step]);

  const today = new Date(); today.setHours(0, 0, 0, 0);

  useEffect(() => {
    if (!navState?.preselectedService) return;
    if (BARBERS.length === 0) return;
    const pre = navState.preselectedService;
    clearNavState();
    setCategory(categorize(pre));
    const eligibleIds = new Set(pre.barberIds ?? []);
    const eligible = BARBERS.filter(b => eligibleIds.has(b.id));
    if (eligible.length === 1) {
      const only = eligible[0];
      setBarber(only);
      setService(pickVariantForBarber(pre, only.id));
      setFilteredBarberIds(new Set([only.id]));
      setStep(3);
    } else {
      setService(pre);
      setFilteredBarberIds(new Set(eligible.map(b => b.id)));
      setStep(1);
    }
  }, [navState, BARBERS]);

  useEffect(() => {
    if (!navState?.preselectedBarber) return;
    const found = BARBERS.find(b => b.id === navState.preselectedBarber);
    clearNavState();
    if (!found) return;
    setBarber(found);
    setFilteredBarberIds(new Set([found.id]));
    setStep(2);
  }, [navState]);

  const visibleSteps = useMemo(() => {
    if (!filteredBarberIds) return [1, 2, 3, 4];
    if (filteredBarberIds.size <= 1 && service) return [3, 4];
    if (filteredBarberIds.size <= 1) return [2, 3, 4];
    return [1, 3, 4]; // multiple eligible barbers, service preselected
  }, [filteredBarberIds, service]);

  const stepIdx = visibleSteps.indexOf(step);

  function goBack() {
    if (step === 4 && step4Phase === 'resume') { setStep4Phase('form'); return; }
    if (step === 2 && category) { setCategory(null); setService(null); return; }
    if (stepIdx <= 0) return;
    setStep(visibleSteps[stepIdx - 1]);
  }

  function goForward() {
    if (step === 4) {
      if (step4Phase === 'form') {
        if (!canAdvance[3]()) {
          setTouched({ name: true, phone: true, email: true });
          return;
        }
        setStep4Phase('resume');
        return;
      }
      if (!isSubmitting) submitBooking();
      return;
    }
    if (!canAdvance[step - 1]() || isSubmitting) return;
    if (stepIdx < visibleSteps.length - 1) setStep(visibleSteps[stepIdx + 1]);
    else submitBooking();
  }

  function prevMonth() { setCalBase(b => { const d = new Date(b); d.setMonth(d.getMonth()-1); return d; }); setDate(null); setSlot(null); }
  function nextMonth() { setCalBase(b => { const d = new Date(b); d.setMonth(d.getMonth()+1); return d; }); setDate(null); setSlot(null); }

  function isoFromDay(d) {
    return `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  function pickDay(d) {
    if (!d) return;
    const picked = new Date(calYear, calMonth, d);
    if (picked < today) return;
    if (BUSINESS_HOURS[picked.getDay()] == null) return;
    setDate(picked); setSlot(null);
    if (isMobile) setCalOpen(false);
  }

  const isPast        = d => d && new Date(calYear, calMonth, d) < today;
  const isToday       = d => { const n = new Date(); return d && n.getFullYear()===calYear && n.getMonth()===calMonth && n.getDate()===d; };
  const isSelected    = d => date && d && date.getFullYear()===calYear && date.getMonth()===calMonth && date.getDate()===d;
  const isFullyBooked = d => d && fullyBookedDates.has(isoFromDay(d));
  const isClosed      = d => !!d && BUSINESS_HOURS[new Date(calYear, calMonth, d).getDay()] == null;

  const canAdvance = [
    () => !!barber,
    () => !!service,
    () => !!date && !!slot && !unavailable.has(slot),
    () => isValidName(name) && isValidPhone(phone) && isValidEmail(email),
  ];

  function reset() {
    setStep(1); setBarber(null); setCategory(null); setService(null); setDate(null); setSlot(null);
    setCalOpen(true);
    setName(''); setPhone(''); setEmail(''); setSubmitted(false);
    setUnavailable(new Set()); setIsSubmitting(false); setErrorMsg('');
    setFilteredBarberIds(null);
    setTouched({ name: false, phone: false, email: false });
    setStep4Phase('form');
  }

  async function submitBooking() {
    if (isSubmitting) return;
    setErrorMsg(''); setIsSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barberId:  barber.id,
          serviceId: service.id,
          date:      toISODate(date),
          slot,
          name:      name.trim(),
          phone:     phone.trim(),
          email:     email.trim(),
          lang,
        }),
      });
      if (res.ok) {
        try {
          localStorage.setItem('offcut-last-booking', JSON.stringify({
            barberId: barber.id,
            barberName: barber.name,
            serviceId: service.id,
            completedAt: Date.now(),
          }));
        } catch {}
        trackEvent('booking_submitted', {
          barber_id: barber.id,
          barber_name: barber.name,
          service_id: service.id,
          service_name: lang === 'pl' ? service.namePL : service.nameEN,
          value: service.priceNumeric ?? service.price_pln ?? undefined,
          currency: 'PLN',
        });
        setSubmitted(true);
        return;
      }
      let body = {};
      try { body = await res.json(); } catch {}
      if (res.status === 409) {
        setErrorMsg(lang === 'pl'
          ? 'Ten termin został właśnie zajęty. Wybierz inną godzinę.'
          : 'This slot was just taken. Please choose another time.');
        setSlot(null);
        setStep(3);
      } else if (res.status === 400 || res.status === 422) {
        setErrorMsg(lang === 'pl'
          ? 'Sprawdź wpisane dane i spróbuj ponownie.'
          : 'Please check your details and try again.');
      } else {
        setErrorMsg(lang === 'pl'
          ? 'Nie udało się wysłać. Spróbuj ponownie za chwilę.'
          : 'Could not submit. Please try again shortly.');
      }
    } catch {
      setErrorMsg(lang === 'pl'
        ? 'Brak połączenia. Sprawdź internet i spróbuj ponownie.'
        : 'Connection error. Check your network and retry.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const stepLabels = [
    t('Barber','Barber'), t('Usługa','Service'), t('Termin','Date'), t('Dane','Details')
  ];

  const dateLabel = date
    ? date.toLocaleDateString(lang==='pl'?'pl-PL':'en-GB', { weekday:'short', day:'numeric', month:'short' })
    : '';
  const dateChipLabel = date
    ? `${(lang==='pl' ? DAYS_PL : DAYS_EN)[(date.getDay()+6)%7]} ${date.getDate()} ${(lang==='pl' ? MONTH_PL : MONTH_EN)[date.getMonth()]}`.toUpperCase()
    : '';
  const tChangeDate = t('Zmień datę','Change date');
  const tChange     = t('ZMIEŃ','CHANGE');

  if (submitted) return (
    <section id="booking" className="booking-section" ref={ref}>
      <div className="section-header">
        <div>
          <div className="section-number">{t('05 / REZERWACJA','05 / BOOKING')}</div>
        </div>
      </div>
      <div className="booking-success">
        <div className="booking-success-icon">✓</div>
        <div className="booking-success-title">{t('Rezerwacja wysłana!','Booking Sent!')}</div>
        <p className="booking-success-text">
          {t(
            'Termin trafił do nas. Mail z potwierdzeniem zgłoszenia jest już w drodze; drugi wyślemy z plikiem do kalendarza, jak tylko barber zatwierdzi rezerwację.',
            'Your booking is in. We\'ve just sent a confirmation that it was received; a second email with a calendar file will follow as soon as the barber approves it.',
          )}
        </p>
        <div className="booking-success-email">
          <span className="booking-success-email-label">{t('Potwierdzenie na e-mail', 'Confirmation email')}</span>
          <span className="booking-success-email-addr">
            {email.trim() || t('- podaj e-mail przy następnej rezerwacji', '- add your email at next booking')}
          </span>
        </div>
        <div className="booking-success-summary">
          <span>{barber?.name}</span><span className="bss-dot">·</span>
          <span>{lang==='pl' ? service?.namePL : service?.nameEN}</span><span className="bss-dot">·</span>
          <span>{dateLabel}</span><span className="bss-dot">·</span>
          <span>{slot}</span>
        </div>
        <button className="booking-reset-btn" onClick={reset}>{t('Nowa rezerwacja','New booking')}</button>
      </div>
    </section>
  );

  return (
    <section id="booking" className="booking-section" ref={ref}>
      <div className="section-header">
        <div>
          <div className="section-number">{t('05 / REZERWACJA','05 / BOOKING')}</div>
        </div>
      </div>

      <div className="booking-layout">

        {/* ── LEFT INFO ── */}
        <div className="booking-text reveal">
          <h2>
            {t('ZAREZERWUJ','BOOK')}<br />
            {t('SWÓJ','YOUR')}<br />
            {t('TERMIN','SLOT')}
          </h2>
          <p>{t('Wizyty walk-in dostępne gdy mamy wolne miejsca. Aby mieć pewność co do wybranego barbera, rezerwuj z wyprzedzeniem.','Walk-ins welcome when available. For guaranteed access to your preferred barber, book ahead.')}</p>
          <div className="booking-info-row">
            <div className="booking-info-item">
              <span className="booking-info-label">{t('Godziny','Hours')}</span>
              {HOURS_SUMMARY.map((slot, i) => (
                <span
                  key={slot.labelEN}
                  className="booking-info-value"
                  style={i === 0 ? undefined : { color:'var(--text-muted-dark)', fontSize:'0.78rem' }}
                >
                  {lang === 'pl' ? slot.shortPL : slot.shortEN}
                </span>
              ))}
            </div>
            <div className="booking-info-item">
              <span className="booking-info-label">{t('Telefon','Phone')}</span>
              <a className="booking-info-link" href="tel:+48513340013">+48 513 340 013</a>
            </div>
            <div className="booking-info-item">
              <span className="booking-info-label">{t('Adres','Location')}</span>
              <span className="booking-info-value">Krzywoustego 27 U4<br />Szczecin</span>
            </div>
          </div>
        </div>

        {/* ── WIZARD ── */}
        <div className="booking-wizard reveal reveal-delay-2">

          {/* Progress */}
          <div className="booking-progress">
            <div className="booking-progress-track">
              <div className="booking-progress-fill" style={{ transform: `scaleX(${stepIdx / (visibleSteps.length - 1)})` }} />
            </div>
            {visibleSteps.map((vs, i) => (
              <div key={vs} className={`bpstep${stepIdx > i ? ' done' : step === vs ? ' active' : ''}`}>
                <div className="bpstep-dot">{stepIdx > i ? '✓' : i + 1}</div>
                <span className="bpstep-label">{stepLabels[vs - 1]}</span>
              </div>
            ))}
          </div>
          {barber && filteredBarberIds?.size === 1 && (
            <div className="bwiz-barber-tag">
              <img src={barber.photo} alt={barber.name} className="bwiz-barber-tag-av" loading="lazy" decoding="async" />
              <span>{barber.name}</span>
            </div>
          )}

          {/* ── STEP 1: Barber ── */}
          {step === 1 && (
            <div className="booking-step-body">
              <div className="bwiz-heading">{t('Wybierz barbera','Choose your barber')}</div>
              <div className="booking-barbers-grid">
                {BARBERS.filter(b => !filteredBarberIds || filteredBarberIds.has(b.id)).map(b => {
                  const suspended = !!b.suspended;
                  return (
                  <button
                    key={b.id}
                    className={`booking-barber-card${barber?.id===b.id?' selected':''}${suspended?' suspended':''}`}
                    disabled={suspended}
                    onClick={() => {
                      if (suspended) return;
                      if (service?.variants?.length) {
                        setService(pickVariantForBarber(service, b.id));
                      } else if (barber?.id !== b.id) {
                        setCategory(null);
                        setService(null);
                      }
                      setBarber(b);
                    }}
                  >
                    <img className="booking-barber-av" src={b.photo} alt={b.name} loading="lazy" decoding="async" />
                    <div className="booking-barber-name">{b.name}</div>
                    <div className="booking-barber-title">{lang==='pl' ? b.titlePL : b.titleEN}</div>
                  </button>);
                })}
              </div>
            </div>
          )}

          {/* ── STEP 2: Category → Service ── */}
          {step === 2 && (
            <div className="booking-step-body">
              {!category ? (
                <>
                  <div className="bwiz-heading">{t('Wybierz kategorię','Choose a category')}</div>
                  <div className="booking-categories-grid">
                    {CATEGORY_DEFS.map((cat, i) => {
                      const empty = ALL_SERVICES.filter(s =>
                        barber && (s.barberIds ?? []).includes(barber.id) && categorize(s) === cat.key
                      ).length === 0;
                      return (
                        <button
                          key={cat.key}
                          type="button"
                          className={`booking-category-card${empty ? ' off' : ''}`}
                          onClick={() => !empty && setCategory(cat.key)}
                          disabled={empty}
                        >
                          <span className="bcat-icon" aria-hidden="true">{cat.icon}</span>
                          <span className="bcat-name">{lang === 'pl' ? cat.namePL : cat.nameEN}</span>
                          <span className="bcat-sub">{lang === 'pl' ? cat.subPL : cat.subEN}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="booking-cat-pill"
                    onClick={() => { setCategory(null); setService(null); }}
                    aria-label={lang==='pl' ? 'Zmień kategorię' : 'Change category'}
                  >
                    <span className="booking-cat-pill-arrow" aria-hidden="true">←</span>
                    <span className="booking-cat-pill-label">{lang==='pl' ? 'Kategoria' : 'Category'}</span>
                    <span className="booking-cat-pill-name">
                      {(() => {
                        const def = CATEGORY_DEFS.find(c => c.key === category);
                        return lang === 'pl' ? def?.namePL : def?.nameEN;
                      })()}
                    </span>
                  </button>
                  <div className="bwiz-heading">{t('Wybierz usługę','Choose a service')}</div>
                  <div className="booking-services-list">
                    {ALL_SERVICES
                      .filter(s => barber && (s.barberIds ?? []).includes(barber.id) && categorize(s) === category)
                      .map(s => (
                        <button
                          key={s.id}
                          className={`booking-service-item${service?.id===s.id?' selected':''}`}
                          onClick={() => setService(s)}
                        >
                          <span className="bsi-name">{lang==='pl' ? s.namePL : s.nameEN}</span>
                          <span className="bsi-meta">
                            <span className="bsi-dur">{s.duration}</span>
                            <span className="bsi-price">{s.price}</span>
                          </span>
                        </button>
                      ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── STEP 3: Date + Time ── */}
          {step === 3 && (
            <div className={`booking-step-body booking-step-body--dt${date && !calOpen ? ' booking-step-body--dt-collapsed' : ''}`}>

              {/* Calendar OR collapsed date chip */}
              {date && !calOpen ? (
                <button
                  type="button"
                  className="booking-date-chip"
                  onClick={() => setCalOpen(true)}
                  aria-label={tChangeDate}
                >
                  <svg className="booking-date-chip-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8"  y1="2" x2="8"  y2="6"/>
                    <line x1="3"  y1="10" x2="21" y2="10"/>
                  </svg>
                  <span className="booking-date-chip-date">{dateChipLabel}</span>
                  <span className="booking-date-chip-change">{tChange}</span>
                </button>
              ) : (
                <div className="booking-cal">
                  <div className="bcal-header">
                    <button type="button" className="bcal-nav" onClick={prevMonth}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <span className="bcal-title">
                      {lang==='pl' ? MONTH_PL[calMonth] : MONTH_EN[calMonth]} {calYear}
                    </span>
                    <button type="button" className="bcal-nav" onClick={nextMonth}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  </div>
                  <div className="bcal-daynames">
                    {(lang==='pl' ? DAYS_PL : DAYS_EN).map(n => <div key={n} className="bcal-dn">{n}</div>)}
                  </div>
                  <div className="bcal-grid">
                    {calDays.map((d, i) => (
                      <button
                        key={i}
                        className={`bcal-day${!d?' empty':''}${d&&isPast(d)?' past':''}${isToday(d)?' today':''}${isSelected(d)?' sel':''}${(!isPast(d)&&(isFullyBooked(d)||isClosed(d)))?' unavail':''}`}
                        onClick={() => pickDay(d)}
                        disabled={!d || isPast(d) || isClosed(d)}
                        title={isClosed(d) ? (lang==='pl' ? 'Zamknięte' : 'Closed') : isFullyBooked(d) ? (lang==='pl' ? 'Brak wolnych terminów' : 'No slots available') : undefined}
                      >{d||''}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Time slots - appears once a date is picked */}
              {date ? (
                <div className="booking-time-col">
                  <div className="bwiz-heading bwiz-heading--slots">
                    {t('Wybierz godzinę','Choose a time')}
                  </div>
                  <BookingTimeWheel
                    slots={slots}
                    unavailable={unavailable}
                    value={slot}
                    onChange={setSlot}
                    loading={loadingAvail}
                    lang={lang}
                  />
                </div>
              ) : (
                <div className="booking-time-prompt">
                  {t('Wybierz dzień','Select a day')}
                </div>
              )}

            </div>
          )}

          {/* ── STEP 4a: Contact form ── */}
          {step === 4 && step4Phase === 'form' && (
            <div className="booking-step-body">
              <div className="bwiz-heading">{t('Twoje dane','Your details')}</div>
              <div className="booking-contact-fields">
                <div className={`form-group${touched.name && !isValidName(name) ? ' form-group--invalid' : ''}`}>
                  <label className="form-label">{t('Imię i nazwisko','Full name')}</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Jan Kowalski"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onBlur={() => setTouched(t => ({ ...t, name: true }))}
                    aria-invalid={touched.name && !isValidName(name) || undefined}
                  />
                  {touched.name && !isValidName(name) && (
                    <span className="form-error" role="alert">
                      {t('Podaj imię (min. 2 znaki).','Enter your name (min 2 characters).')}
                    </span>
                  )}
                </div>
                <div className={`form-group${touched.phone && !isValidPhone(phone) ? ' form-group--invalid' : ''}`}>
                  <label className="form-label">{t('Telefon','Phone')}</label>
                  <input
                    className="form-input"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+48 513 340 013"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    onBlur={() => setTouched(t => ({ ...t, phone: true }))}
                    aria-invalid={touched.phone && !isValidPhone(phone) || undefined}
                  />
                  {touched.phone && !isValidPhone(phone) && (
                    <span className="form-error" role="alert">
                      {t('Podaj poprawny numer (9 cyfr lub +48 i 9 cyfr).','Enter a valid number (9 digits, or +48 followed by 9 digits).')}
                    </span>
                  )}
                </div>
                <div className={`form-group${touched.email && !isValidEmail(email) ? ' form-group--invalid' : ''}`}>
                  <label className="form-label">{t('E-mail','E-mail')}</label>
                  <input
                    className="form-input"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="jan@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onBlur={() => setTouched(t => ({ ...t, email: true }))}
                    aria-invalid={touched.email && !isValidEmail(email) || undefined}
                  />
                  {touched.email && !isValidEmail(email) && (
                    <span className="form-error" role="alert">
                      {t('Podaj poprawny adres e-mail (np. jan@example.com).','Enter a valid email address (e.g. jan@example.com).')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4b: Resume ── */}
          {step === 4 && step4Phase === 'resume' && (
            <div className="booking-step-body">
              <div className="bwiz-heading">{t('Podsumowanie','Summary')}</div>
              <div className="booking-summary-box">
                <div className="bsum-row">
                  <span className="bsum-label">{t('Barber','Barber')}</span>
                  <span className="bsum-val">{barber?.name}</span>
                </div>
                <div className="bsum-row">
                  <span className="bsum-label">{t('Usługa','Service')}</span>
                  <span className="bsum-val">{lang==='pl' ? service?.namePL : service?.nameEN}</span>
                </div>
                <div className="bsum-row">
                  <span className="bsum-label">{t('Termin','Date')}</span>
                  <span className="bsum-val">{dateLabel} · {slot}</span>
                </div>
                <div className="bsum-separator" />
                <div className="bsum-row">
                  <span className="bsum-label">{t('Imię','Name')}</span>
                  <span className="bsum-val">{name}</span>
                </div>
                <div className="bsum-row">
                  <span className="bsum-label">{t('Telefon','Phone')}</span>
                  <span className="bsum-val">{phone}</span>
                </div>
                <div className="bsum-row">
                  <span className="bsum-label">{t('E-mail','E-mail')}</span>
                  <span className="bsum-val">{email}</span>
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="booking-error" role="alert">{errorMsg}</div>
          )}

          {/* Navigation */}
          <div className="booking-wizard-nav" ref={wizardEndRef}>
            {(stepIdx > 0 || (step === 2 && category) || (step === 4 && step4Phase === 'resume'))
              ? <button className="bwiz-back" onClick={goBack} disabled={isSubmitting}>← {t('Wróć','Back')}</button>
              : <span />}
            <button
              className={`bwiz-next${canAdvance[step-1]() && !isSubmitting ? '' : ' off'}`}
              disabled={isSubmitting}
              onClick={goForward}
            >
              {step === 4 && step4Phase === 'resume'
                ? (isSubmitting ? t('Wysyłanie…','Sending…') : t('Wyślij →','Send →'))
                : t('Dalej','Next')}
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
