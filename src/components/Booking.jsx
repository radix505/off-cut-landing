import { useState, useMemo, useEffect } from 'react';
import { useT, useLang } from '../context/LangContext';
import { useReveal } from '../hooks/useReveal';
import { useRouter } from '../context/RouterContext';
import { buildSlots } from '../data/booking-config';
import { useCatalog } from '../context/CatalogContext';

const MONTH_PL = ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
const MONTH_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_PL  = ['Pon','Wt','Śr','Czw','Pt','Sob','Nie'];
const DAYS_EN  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function toISODate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function buildCalDays(year, month) {
  const first = new Date(year, month, 1).getDay();
  const offset = first === 0 ? 6 : first - 1;
  const total  = new Date(year, month + 1, 0).getDate();
  const days   = Array(offset).fill(null);
  for (let d = 1; d <= total; d++) days.push(d);
  return days;
}

export default function Booking() {
  const ref = useReveal();
  const { lang } = useLang();
  const { navState, clearNavState } = useRouter();
  const { barbers: BARBERS, services: ALL_SERVICES } = useCatalog();

  const [step,      setStep]      = useState(1);
  const [barber,    setBarber]    = useState(null);
  const [service,   setService]   = useState(null);
  const [date,      setDate]      = useState(null);
  const [slot,      setSlot]      = useState(null);
  const [calBase,   setCalBase]   = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [name,      setName]      = useState('');
  const [phone,     setPhone]     = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [unavailable,  setUnavailable]  = useState(() => new Set());
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [fullyBookedDates, setFullyBookedDates] = useState(() => new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg,     setErrorMsg]     = useState('');
  const [filteredBarberIds, setFilteredBarberIds] = useState(null);

  const calYear  = calBase.getFullYear();
  const calMonth = calBase.getMonth();
  const calDays  = useMemo(() => buildCalDays(calYear, calMonth), [calYear, calMonth]);
  const slots    = useMemo(() => buildSlots(date), [date]);

  useEffect(() => {
    if (!barber || !date) { setUnavailable(new Set()); return; }
    const iso = toISODate(date);
    const ctrl = new AbortController();
    setLoadingAvail(true);
    fetch(`/api/availability?barberId=${encodeURIComponent(barber.id)}&date=${iso}`, { signal: ctrl.signal })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(data => setUnavailable(new Set(data.unavailable ?? [])))
      .catch(err => { if (err.name !== 'AbortError') setUnavailable(new Set()); })
      .finally(() => setLoadingAvail(false));
    return () => ctrl.abort();
  }, [barber?.id, date]);

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

  const today = new Date(); today.setHours(0, 0, 0, 0);

  useEffect(() => {
    if (!navState?.preselectedService) return;
    if (BARBERS.length === 0) return;
    const pre = navState.preselectedService;
    clearNavState();
    setService(pre);
    const eligibleIds = new Set(pre.barberIds ?? []);
    const eligible = BARBERS.filter(b => eligibleIds.has(b.id));
    if (eligible.length === 1) {
      setBarber(eligible[0]);
      setFilteredBarberIds(new Set(eligible.map(b => b.id)));
      setStep(3);
    } else {
      setFilteredBarberIds(new Set(eligible.map(b => b.id)));
      setStep(1);
    }
  }, [navState, BARBERS]);

  const visibleSteps = useMemo(() => {
    if (!filteredBarberIds) return [1, 2, 3, 4];
    const steps = [1, 3, 4]; // service (2) always skipped when preselected
    if (filteredBarberIds.size <= 1) return [3, 4]; // single barber, skip 1 too
    return steps;
  }, [filteredBarberIds]);

  const stepIdx = visibleSteps.indexOf(step);

  function goBack() {
    if (stepIdx <= 0) return;
    setStep(visibleSteps[stepIdx - 1]);
  }

  function goForward() {
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
    if (fullyBookedDates.has(isoFromDay(d))) return;
    setDate(picked); setSlot(null);
  }

  const isPast        = d => d && new Date(calYear, calMonth, d) < today;
  const isToday       = d => { const n = new Date(); return d && n.getFullYear()===calYear && n.getMonth()===calMonth && n.getDate()===d; };
  const isSelected    = d => date && d && date.getFullYear()===calYear && date.getMonth()===calMonth && date.getDate()===d;
  const isFullyBooked = d => d && fullyBookedDates.has(isoFromDay(d));

  const canAdvance = [
    () => !!barber,
    () => !!service,
    () => !!date && !!slot,
    () => name.trim().length > 1 && phone.trim().length > 5,
  ];

  function reset() {
    setStep(1); setBarber(null); setService(null); setDate(null); setSlot(null);
    setName(''); setPhone(''); setSubmitted(false);
    setUnavailable(new Set()); setIsSubmitting(false); setErrorMsg('');
    setFilteredBarberIds(null);
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
        }),
      });
      if (res.ok) { setSubmitted(true); return; }
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
    useT('Barber','Barber'), useT('Usługa','Service'), useT('Termin','Date'), useT('Dane','Details')
  ];

  const dateLabel = date
    ? date.toLocaleDateString(lang==='pl'?'pl-PL':'en-GB', { weekday:'short', day:'numeric', month:'short' })
    : '';

  if (submitted) return (
    <section id="booking" className="booking-section" ref={ref}>
      <div className="section-header">
        <div>
          <div className="section-number">{useT('05 / REZERWACJA','05 / BOOKING')}</div>
          <div className="section-title">{useT('Zarezerwuj fotel','Reserve your chair')}</div>
        </div>
      </div>
      <div className="booking-success reveal">
        <div className="booking-success-icon">✓</div>
        <div className="booking-success-title">{useT('Prośba wysłana!','Request Sent!')}</div>
        <p className="booking-success-text">
          {useT('Potwierdzimy Twoją wizytę telefonicznie lub SMS-em.','We\'ll confirm your appointment by phone or SMS.')}
        </p>
        <div className="booking-success-summary">
          <span>{barber?.name}</span><span className="bss-dot">·</span>
          <span>{lang==='pl' ? service?.namePL : service?.nameEN}</span><span className="bss-dot">·</span>
          <span>{dateLabel}</span><span className="bss-dot">·</span>
          <span>{slot}</span>
        </div>
        <button className="booking-reset-btn" onClick={reset}>{useT('Nowa rezerwacja','New booking')}</button>
      </div>
    </section>
  );

  return (
    <section id="booking" className="booking-section" ref={ref}>
      <div className="section-header">
        <div>
          <div className="section-number">{useT('05 / REZERWACJA','05 / BOOKING')}</div>
          <div className="section-title">{useT('Zarezerwuj fotel','Reserve your chair')}</div>
        </div>
      </div>

      <div className="booking-layout">

        {/* ── LEFT INFO ── */}
        <div className="booking-text reveal">
          <h2>
            {useT('ZAREZERWUJ','BOOK')}<br />
            {useT('SWÓJ','YOUR')}<br />
            {useT('TERMIN','SLOT')}
          </h2>
          <p>{useT('Wizyty walk-in dostępne gdy mamy wolne miejsca. Aby mieć pewność co do wybranego barbera, rezerwuj z wyprzedzeniem.','Walk-ins welcome when available. For guaranteed access to your preferred barber, book ahead.')}</p>
          <div className="booking-info-row">
            <div className="booking-info-item">
              <span className="booking-info-label">{useT('Godziny','Hours')}</span>
              <span className="booking-info-value">{useT('Pon–Sob 9–20','Mon–Sat 9–20')}</span>
              <span className="booking-info-value" style={{ color:'#555', fontSize:'0.7rem' }}>{useT('Nie 10–16','Sun 10–16')}</span>
            </div>
            <div className="booking-info-item">
              <span className="booking-info-label">{useT('Telefon','Phone')}</span>
              <span className="booking-info-value">+48 513 340 013</span>
            </div>
            <div className="booking-info-item">
              <span className="booking-info-label">{useT('Adres','Location')}</span>
              <span className="booking-info-value">Krzywoustego 27 U4<br />Szczecin</span>
            </div>
          </div>
        </div>

        {/* ── WIZARD ── */}
        <div className="booking-wizard reveal reveal-delay-2">

          {/* Progress */}
          <div className="booking-progress">
            <div className="booking-progress-track">
              <div className="booking-progress-fill" style={{ width: `${(stepIdx / (visibleSteps.length - 1)) * 100}%` }} />
            </div>
            {visibleSteps.map((vs, i) => (
              <div key={vs} className={`bpstep${stepIdx > i ? ' done' : step === vs ? ' active' : ''}`}>
                <div className="bpstep-dot">{stepIdx > i ? '✓' : i + 1}</div>
                <span className="bpstep-label">{stepLabels[vs - 1]}</span>
              </div>
            ))}
          </div>

          {/* ── STEP 1: Barber ── */}
          {step === 1 && (
            <div className="booking-step-body">
              <div className="bwiz-heading">{useT('Wybierz barbera','Choose your barber')}</div>
              <div className="booking-barbers-grid">
                {BARBERS.filter(b => !filteredBarberIds || filteredBarberIds.has(b.id)).map(b => (
                  <button key={b.id} className={`booking-barber-card${barber?.id===b.id?' selected':''}`} onClick={() => setBarber(b)}>
                    <img className="booking-barber-av" src={b.photo} alt={b.name} />
                    <div className="booking-barber-name">{b.name}</div>
                    <div className="booking-barber-title">{lang==='pl' ? b.titlePL : b.titleEN}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 2: Service ── */}
          {step === 2 && (
            <div className="booking-step-body">
              <div className="bwiz-heading">{useT('Wybierz usługę','Choose a service')}</div>
              <div className="booking-services-list">
                {ALL_SERVICES.filter(s => barber && (s.barberIds ?? []).includes(barber.id)).map(s => (
                  <button key={s.id} className={`booking-service-item${service?.id===s.id?' selected':''}`} onClick={() => setService(s)}>
                    <span className="bsi-name">{lang==='pl' ? s.namePL : s.nameEN}</span>
                    <span className="bsi-meta">
                      <span className="bsi-dur">{s.duration}</span>
                      <span className="bsi-price">{s.price}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 3: Date + Time ── */}
          {step === 3 && (
            <div className="booking-step-body booking-step-body--dt">

              <div className="booking-cal">
                <div className="bcal-header">
                  <button className="bcal-nav" onClick={prevMonth}>‹</button>
                  <span className="bcal-title">
                    {lang==='pl' ? MONTH_PL[calMonth] : MONTH_EN[calMonth]} {calYear}
                  </span>
                  <button className="bcal-nav" onClick={nextMonth}>›</button>
                </div>
                <div className="bcal-daynames">
                  {(lang==='pl' ? DAYS_PL : DAYS_EN).map(n => <div key={n} className="bcal-dn">{n}</div>)}
                </div>
                <div className="bcal-grid">
                  {calDays.map((d, i) => (
                    <button
                      key={i}
                      className={`bcal-day${!d?' empty':''}${d&&isPast(d)?' past':''}${isToday(d)?' today':''}${isSelected(d)?' sel':''}${isFullyBooked(d)?' unavail':''}`}
                      onClick={() => pickDay(d)}
                      disabled={!d || isPast(d) || isFullyBooked(d)}
                      title={isFullyBooked(d) ? (lang==='pl' ? 'Brak wolnych terminów' : 'No slots available') : undefined}
                    >{d||''}</button>
                  ))}
                </div>
              </div>

              <div className="booking-slots">
                <div className="bwiz-heading bwiz-heading--slots">
                  {date
                    ? useT('Wybierz godzinę','Choose a time')
                    : useT('Najpierw wybierz dzień','Select a day first')}
                </div>
                {date && (
                  <div className="bslots-grid" aria-busy={loadingAvail || undefined}>
                    {slots.map(s => {
                      const taken = unavailable.has(s);
                      return (
                        <button
                          key={s}
                          className={`bslot${taken?' unavail':''}${slot===s?' sel':''}`}
                          onClick={() => !taken && setSlot(s)}
                          disabled={taken || loadingAvail}
                        >{s}</button>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ── STEP 4: Details ── */}
          {step === 4 && (
            <div className="booking-step-body">
              <div className="bwiz-heading">{useT('Twoje dane','Your details')}</div>
              <div className="booking-summary-box">
                {[
                  [useT('Barber','Barber'), barber?.name],
                  [useT('Usługa','Service'), lang==='pl' ? service?.namePL : service?.nameEN],
                  [useT('Termin','Date'), `${dateLabel} · ${slot}`],
                ].map(([label, val]) => (
                  <div key={label} className="bsum-row">
                    <span className="bsum-label">{label}</span>
                    <span className="bsum-val">{val}</span>
                  </div>
                ))}
              </div>
              <div className="booking-contact-fields">
                <div className="form-group">
                  <label className="form-label">{useT('Imię i nazwisko','Full name')}</label>
                  <input className="form-input" type="text" placeholder="Jan Kowalski" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">{useT('Telefon','Phone')}</label>
                  <input className="form-input" type="tel" placeholder="+48 513 340 013" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="booking-error" role="alert">{errorMsg}</div>
          )}

          {/* Navigation */}
          <div className="booking-wizard-nav">
            {stepIdx > 0
              ? <button className="bwiz-back" onClick={goBack} disabled={isSubmitting}>← {useT('Wróć','Back')}</button>
              : <span />}
            <button
              className={`bwiz-next${canAdvance[step-1]() && !isSubmitting ? '' : ' off'}`}
              disabled={isSubmitting}
              onClick={goForward}
            >
              {stepIdx < visibleSteps.length - 1
                ? useT('Dalej','Next')
                : isSubmitting ? useT('Wysyłanie…','Sending…') : useT('Wyślij →','Send →')}
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
