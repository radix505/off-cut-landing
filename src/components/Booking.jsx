import { useState, useMemo } from 'react';
import { useT, useLang } from '../context/LangContext';
import { useReveal } from '../hooks/useReveal';

const BARBERS = [
  { id: 'aleksander', name: 'Aleksander', photo: '/team/Aleksander.jpeg', titlePL: 'Senior Barber', titleEN: 'Senior Barber' },
  { id: 'julia', name: 'Julia', photo: '/team/Julia.jpeg', titlePL: 'Barber & Broda', titleEN: 'Barber & Beard' },
  { id: 'nico',  name: 'Nico',  photo: '/team/Nico.jpeg',  titlePL: 'Master Barber',  titleEN: 'Master Barber' },
];

const SERVICES = [
  { id: 's1', namePL: 'Strzyżenie Krótkie',        nameEN: 'Short Cut',             duration: '45 min',    price: '100 PLN' },
  { id: 's2', namePL: 'Strzyżenie Długie',          nameEN: 'Long Cut',              duration: '55 min',    price: '110 PLN' },
  { id: 's3', namePL: 'Trymowanie Brody',           nameEN: 'Beard Trim',            duration: '30 min',    price: '80 PLN'  },
  { id: 's4', namePL: 'Strzyżenie + Broda',         nameEN: 'Cut & Beard',           duration: '1h 15min',  price: '140 PLN' },
  { id: 's5', namePL: 'Golenie Głowy',              nameEN: 'Head Shave',            duration: '30 min',    price: '50 PLN'  },
  { id: 's6', namePL: 'Golenie Głowy + Broda',      nameEN: 'Head Shave + Beard',    duration: '50 min',    price: '100 PLN' },
  { id: 's7', namePL: 'Cięcie + Broda + Brzytwa',   nameEN: 'Cut + Beard + Razor',   duration: '1h 20min',  price: '170 PLN' },
];

const MONTH_PL = ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
const MONTH_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_PL  = ['Pon','Wt','Śr','Czw','Pt','Sob','Nie'];
const DAYS_EN  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const UNAVAILABLE = new Set(['09:30','11:00','13:30','15:00','17:00']);

function buildCalDays(year, month) {
  const first = new Date(year, month, 1).getDay();
  const offset = first === 0 ? 6 : first - 1;
  const total  = new Date(year, month + 1, 0).getDate();
  const days   = Array(offset).fill(null);
  for (let d = 1; d <= total; d++) days.push(d);
  return days;
}

function buildSlots(date) {
  if (!date) return [];
  const sun = date.getDay() === 0;
  const [sh, eh] = sun ? [10, 15] : [9, 19];
  const slots = [];
  for (let h = sh; h <= eh; h++)
    for (let m = 0; m < 60; m += 30) {
      if (h === eh && m > 0) break;
      slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
    }
  return slots;
}

export default function Booking() {
  const ref = useReveal();
  const { lang } = useLang();

  const [step,      setStep]      = useState(1);
  const [barber,    setBarber]    = useState(null);
  const [service,   setService]   = useState(null);
  const [date,      setDate]      = useState(null);
  const [slot,      setSlot]      = useState(null);
  const [calBase,   setCalBase]   = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [name,      setName]      = useState('');
  const [phone,     setPhone]     = useState('');
  const [submitted, setSubmitted] = useState(false);

  const calYear  = calBase.getFullYear();
  const calMonth = calBase.getMonth();
  const calDays  = useMemo(() => buildCalDays(calYear, calMonth), [calYear, calMonth]);
  const slots    = useMemo(() => buildSlots(date), [date]);

  const today = new Date(); today.setHours(0, 0, 0, 0);

  function prevMonth() { setCalBase(b => { const d = new Date(b); d.setMonth(d.getMonth()-1); return d; }); setDate(null); setSlot(null); }
  function nextMonth() { setCalBase(b => { const d = new Date(b); d.setMonth(d.getMonth()+1); return d; }); setDate(null); setSlot(null); }

  function pickDay(d) {
    if (!d) return;
    const picked = new Date(calYear, calMonth, d);
    if (picked < today) return;
    setDate(picked); setSlot(null);
  }

  const isPast     = d => d && new Date(calYear, calMonth, d) < today;
  const isToday    = d => { const n = new Date(); return d && n.getFullYear()===calYear && n.getMonth()===calMonth && n.getDate()===d; };
  const isSelected = d => date && d && date.getFullYear()===calYear && date.getMonth()===calMonth && date.getDate()===d;

  const canAdvance = [
    () => !!barber,
    () => !!service,
    () => !!date && !!slot,
    () => name.trim().length > 1 && phone.trim().length > 5,
  ];

  function reset() { setStep(1); setBarber(null); setService(null); setDate(null); setSlot(null); setName(''); setPhone(''); setSubmitted(false); }

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
              <div className="booking-progress-fill" style={{ width: `${((step-1)/3)*100}%` }} />
            </div>
            {stepLabels.map((label, i) => (
              <div key={i} className={`bpstep${step > i+1 ? ' done' : step === i+1 ? ' active' : ''}`}>
                <div className="bpstep-dot">{step > i+1 ? '✓' : i+1}</div>
                <span className="bpstep-label">{label}</span>
              </div>
            ))}
          </div>

          {/* ── STEP 1: Barber ── */}
          {step === 1 && (
            <div className="booking-step-body">
              <div className="bwiz-heading">{useT('Wybierz barbera','Choose your barber')}</div>
              <div className="booking-barbers-grid">
                {BARBERS.map(b => (
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
                {SERVICES.map(s => (
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
                      className={`bcal-day${!d?' empty':''}${d&&isPast(d)?' past':''}${isToday(d)?' today':''}${isSelected(d)?' sel':''}`}
                      onClick={() => pickDay(d)}
                      disabled={!d || isPast(d)}
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
                  <div className="bslots-grid">
                    {slots.map(s => (
                      <button
                        key={s}
                        className={`bslot${UNAVAILABLE.has(s)?' unavail':''}${slot===s?' sel':''}`}
                        onClick={() => !UNAVAILABLE.has(s) && setSlot(s)}
                        disabled={UNAVAILABLE.has(s)}
                      >{s}</button>
                    ))}
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

          {/* Navigation */}
          <div className="booking-wizard-nav">
            {step > 1
              ? <button className="bwiz-back" onClick={() => setStep(s => s-1)}>← {useT('Wróć','Back')}</button>
              : <span />}
            <button
              className={`bwiz-next${canAdvance[step-1]() ? '' : ' off'}`}
              onClick={() => canAdvance[step-1]() && (step < 4 ? setStep(s => s+1) : setSubmitted(true))}
            >
              {step < 4 ? useT('Dalej','Next') : useT('Wyślij →','Send →')}
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
