# OFF CUT — Landing Page Upgrade: Implementation Plan

Executable task breakdown for the audit findings in `/Users/radix/.claude/plans/peaceful-sniffing-harbor.md`. Ordered by dependency. Every task lists exact file, change, and acceptance check. No new dependencies unless explicitly noted.

**Scope summary**
- Current score: 39/100. Target after Phase 1: 58. After Phase 2: 78. After Phase 3: 85+.
- Tech stack stays: React 19 + Vite 8 + plain CSS (no Tailwind, no libs added except one form endpoint).
- All new user-facing strings must go through `useT(pl, en)` from `src/context/LangContext.jsx`.
- All new sections must use the `section-header` / `section-number` / `section-title` pattern and `useReveal()` hook for animation parity.

---

## Phase 1 — Unbreak the Funnel (target: ~4 hrs)

Goal: every interactive element works, mobile doesn't explode, the form actually sends a lead.

### 1.1 Wire Hero CTAs
**File:** `src/components/Hero.jsx:25-28`
Add a shared scroll helper at top of file:
```jsx
const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
```
Attach to buttons:
```jsx
<button className="btn-primary" onClick={() => scrollTo('booking')}>…</button>
<button className="btn-ghost"   onClick={() => scrollTo('services')}>…</button>
```
**Accept:** clicking either CTA in dev server smoothly scrolls to the correct section.

### 1.2 Wire Nav "Book Now" + active-link scroll
**File:** `src/components/Nav.jsx`
- Convert `<a href="#services">` etc. to use the same scroll helper OR keep `href=` (already works — `html { scroll-behavior: smooth }` is set in `index.css:4`). The hash links already function — confirm in browser before declaring the bug.
- Add `onClick={() => scrollTo('booking')}` on `.nav-book` button.

**Accept:** Nav "Zarezerwuj" scrolls to booking; all four nav links navigate.

### 1.3 Fix dead `section-link` anchors
**Files:** `src/components/Services.jsx:58`, `Barbers.jsx:45`, `Gallery.jsx:13`
All three render `<a className="section-link">` without `href`. Options:
- Services "Full price list →" → `href="#booking"` (no separate pricing page) or remove until a page exists.
- Barbers "Meet the crew →" → `href="#barbers"` (current section) or remove.
- Gallery "Instagram →" → `href="https://instagram.com/offcutbarber"` + `target="_blank" rel="noopener noreferrer"`.

**Accept:** no `<a>` in the DOM has `href="#"` or missing `href`.

### 1.4 Footer link cleanup
**File:** `src/components/Footer.jsx`
- Replace `href="#"` on Instagram/Facebook/Google Maps with real URLs (placeholder to confirm with owner; for now use `https://instagram.com/offcutbarber`, `https://facebook.com/offcutbarber`, `https://maps.app.goo.gl/REPLACE_ME`).
- Add `target="_blank" rel="noopener noreferrer"` to all three.
- Wrap phone in `<a href="tel:+48600000000">`.
- Wrap email in `<a href="mailto:contact@offcut.pl">`.
- Dynamic year: `© {new Date().getFullYear()} Off Cut Barbershop.`

**Accept:** every link navigates to a real destination or opens tel/mail client.

### 1.5 Working booking form (lead capture)
**File:** `src/components/Booking.jsx`
Two-tier approach — ship the free tier now, upgrade later.

**Minimal working path (no dependency):**
```jsx
const [submitting, setSubmitting] = useState(false);
const [status, setStatus] = useState(null); // 'ok' | 'err' | null

async function handleSubmit(e) {
  e.preventDefault();
  setSubmitting(true);
  const data = Object.fromEntries(new FormData(e.target));
  // 1. mailto fallback — no backend required
  const body = encodeURIComponent(
    `Imię: ${data.name}\nUsługa: ${data.service}\nBarber: ${data.barber}\nData: ${data.datetime}\nTelefon: ${data.phone}`
  );
  window.location.href = `mailto:contact@offcut.pl?subject=Rezerwacja%20—%20${encodeURIComponent(data.name)}&body=${body}`;
  setStatus('ok');
  setSubmitting(false);
}
```
Wrap the form fields in `<form onSubmit={handleSubmit}>` and give each input a `name=` attribute matching the keys above. The "Wyślij rezerwację" button becomes `type="submit"`.

**Recommended upgrade (when owner has a Formspree/Resend account):** POST to `https://formspree.io/f/{id}` or a Vite serverless function — swap the `mailto:` line for `fetch()`.

**Accept:** submit opens the user's mail client with a prefilled booking email OR posts to the configured endpoint and shows confirmation text.

### 1.6 Mobile breakpoints
**File:** `src/index.css` — append at bottom:
```css
/* TABLET */
@media (max-width: 1024px) {
  nav { padding: 1rem 1.5rem; }
  .nav-links { display: none; } /* replaced by hamburger in task 1.9 */
  section { padding: 4rem 1.5rem; }
  .hero { padding: 0 1.5rem 3rem; min-height: 600px; }
  .hero-year { display: none; }
  .hero-scroll-hint { display: none; }
  .services-grid, .barbers-grid { grid-template-columns: repeat(2, 1fr); }
  .gallery-grid { grid-template-columns: 1fr 1fr; }
  .gallery-cell:first-child { grid-row: auto; }
  .booking-layout { grid-template-columns: 1fr; gap: 2.5rem; }
}

/* MOBILE */
@media (max-width: 640px) {
  section { padding: 3rem 1.25rem; }
  .section-header { flex-direction: column; align-items: flex-start; gap: 1rem; margin-bottom: 2.5rem; }
  .section-title { font-size: clamp(28px, 9vw, 40px); }
  .hero { padding: 6rem 1.25rem 3rem; }
  .hero-cta { flex-direction: column; align-items: stretch; }
  .hero-cta button { width: 100%; }
  .services-grid, .barbers-grid, .gallery-grid { grid-template-columns: 1fr; }
  .booking-info-row { flex-direction: column; gap: 1rem; }
  .footer-top { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
  .footer-bottom { flex-direction: column; gap: 1rem; align-items: flex-start; }
  body { padding-bottom: 72px; } /* space for sticky mobile CTA (task 3.1) */
}
```
**Accept:** DevTools iPhone 12 view has no horizontal scroll; every grid stacks to 1 column; booking form fills width.

### 1.7 Fix location inconsistency
Decide source of truth with the owner. Assumption: **Poznań only** (booking + footer agree).
- `src/components/Hero.jsx:15` — change `'Warsaw — Poznań — Kraków'` → `'Poznań — ul. Twoja 1'`.
- `src/components/Marquee.jsx:11,22` — change city line to `'POZNAŃ — PREMIUM BARBERING'` or remove.

If owner confirms multi-city plan, keep hero/marquee and add all three addresses to the Booking + Footer contact blocks instead.

**Accept:** every location reference in the site matches.

### 1.8 Mobile navigation
**File:** `src/components/Nav.jsx` (new state) + `src/index.css` (new rules)
- Add hamburger button visible only `@media (max-width: 1024px)`.
- Toggle a `.nav-open` class on `<nav>` that slides the `.nav-links` down as a full-width panel.
- Close on link click.

Minimal CSS additions:
```css
.nav-hamburger { display: none; background: transparent; border: none; color: #fff; font-size: 1.2rem; cursor: pointer; }
@media (max-width: 1024px) {
  .nav-hamburger { display: block; }
  nav.nav-open .nav-links {
    display: flex; flex-direction: column; position: absolute; top: 100%; left: 0; right: 0;
    background: rgba(10,10,10,0.98); padding: 1.5rem; gap: 1.5rem;
  }
}
```
**Accept:** mobile viewport shows hamburger; tap opens menu; tapping a link closes menu and scrolls.

### 1.9 Make submit button type correct
Confirm `.form-submit` has `type="submit"` (it currently has no type, defaults to `submit` inside a `<form>`, but explicit is safer).

### ✅ Phase 1 verification checklist
- [ ] Every button/link in the DOM does something.
- [ ] Lighthouse mobile emulation: no layout overflow on iPhone 12 / Pixel 7 / iPad.
- [ ] Form submit sends email OR posts to endpoint.
- [ ] All location references match.
- [ ] Copyright year is dynamic.

Commit message: `fix: wire CTAs, add mobile layout, make booking form functional`

---

## Phase 2 — Trust & Clarity (target: ~1.5 days)

Goal: turn the "it looks nice" site into "I believe these people can cut my hair."

### 2.1 Sharper hero headline
**File:** `src/components/Hero.jsx:17-21`
Replace "THE / ART OF / SHARP" with a specific-outcome version. Keep the 3-line typographic rhythm.

Recommended (PL / EN):
```
PRECYZJA.       PRECISION.
RYTUAŁ.         RITUAL.
POZNAŃ.         POZNAŃ.
```
Or more conversion-weighted:
```
ZAREZERWUJ      BOOK A MASTER
MISTRZA.        BARBER IN
60 SEKUND.      60 SECONDS.
```
Store both lines bilingually and let the owner pick. Keep `hero-title-line:nth-child(3)` outlined-text style for visual rhythm.

Update `hero-sub` copy to highlight the concrete promise rather than poetic mood.

**Accept:** headline communicates *what* + *where* (and ideally the ease-of-booking benefit).

### 2.2 Real hero imagery
**File:** `src/assets/hero.png` already exists (unused). Wire it in as a low-opacity texture behind the title.
```css
.hero-bg {
  background: url('/src/assets/hero.png') center/cover no-repeat, #fff;
  opacity: 0.92;
}
.hero-bg::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(to right, #fff 10%, rgba(255,255,255,0.4) 60%, transparent 100%);
}
```
(Adjust gradient so the title stays legible on the left third.) Replace `hero.png` with a real photo later.

**Accept:** hero has tangible visual content, not just typography on white.

### 2.3 Google rating pill in hero eyebrow
**File:** `src/components/Hero.jsx:13-16`
Add a second eyebrow row above the title:
```jsx
<div className="hero-rating">
  <span className="hero-rating-stars">★★★★★</span>
  <span className="hero-rating-text">{useT('4.9 / 5 — 312 opinii Google', '4.9 / 5 — 312 Google reviews')}</span>
</div>
```
CSS (append to `index.css` hero block):
```css
.hero-rating { display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.75rem; font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase; color: #555; }
.hero-rating-stars { color: #d4a24a; letter-spacing: 0.1em; font-size: 0.85rem; }
```
**Important:** numbers must reflect reality. If OFF CUT has 47 reviews and 4.7 stars, show that. Faking trust is a hard exit.

**Accept:** above-the-fold social proof visible on first paint.

### 2.4 New "Why Us" section (value strip)
**File:** create `src/components/WhyUs.jsx`
Four stat tiles between `<Marquee />` and `<Services />` in `App.jsx`.

Structure (reuse existing section classes):
```jsx
<section id="why" className="why-section" ref={useReveal()}>
  <div className="why-grid">
    <div className="why-item"><div className="why-num">7+</div><div className="why-label">{useT('lat rzemiosła', 'years of craft')}</div></div>
    <div className="why-item"><div className="why-num">12K+</div><div className="why-label">{useT('wykonanych strzyżeń', 'cuts delivered')}</div></div>
    <div className="why-item"><div className="why-num">4.9★</div><div className="why-label">{useT('średnia ocena Google', 'average Google rating')}</div></div>
    <div className="why-item"><div className="why-num">60s</div><div className="why-label">{useT('rezerwacja online', 'online booking')}</div></div>
  </div>
</section>
```
CSS:
```css
.why-section { padding: 4rem 3rem; background: #fff; border-bottom: 0.5px solid #e0ddd6; }
.why-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; max-width: 1200px; margin: 0 auto; }
.why-item { text-align: center; }
.why-num { font-family: 'Bebas Neue', sans-serif; font-size: clamp(40px, 5vw, 64px); color: #0a0a0a; line-height: 1; }
.why-label { font-size: 0.65rem; letter-spacing: 0.25em; text-transform: uppercase; color: #888; margin-top: 0.5rem; }
@media (max-width: 640px) { .why-grid { grid-template-columns: repeat(2, 1fr); gap: 2.5rem 1rem; } }
```
**Accept:** between marquee and services, 4 strong stats anchor credibility.

### 2.5 New Testimonials section
**File:** create `src/components/Testimonials.jsx`
Insert in `App.jsx` between `<Barbers />` and `<Gallery />`. 3 testimonial cards minimum.

Card structure per review:
- Quote text (STAR: situation → action → result, 2–3 sentences)
- Client name + occupation
- Service used
- Date
- 5 stars
- Optional: Google review badge

Data array:
```jsx
const reviews = [
  {
    quote: { pl: '…', en: '…' },
    name: 'Marek S.',
    meta: { pl: 'Klient od 2 lat — Fade & Blend', en: 'Client for 2 years — Fade & Blend' },
    date: '2025-09',
  },
  // …2 more
];
```
CSS mirrors `.service-card` with left-side vertical accent line + larger quote font.

**Accept:** 3 believable, specific testimonials (NOT "Great cut! - J."). Use real Google-review text if available.

### 2.6 Replace barber placeholders with real photos
**File:** `src/components/Barbers.jsx:50-59` and `src/assets/barbers/{marcus,daniel,tomas}.jpg` (new)
Replace the `barber-portrait-placeholder` div with an `<img>`:
```jsx
<img className="barber-portrait-img" src={`/src/assets/barbers/${b.slug}.jpg`} alt={`${b.name} — ${useT(b.titlePL, b.titleEN)}`} loading="lazy" />
```
Add `slug: 'marcus'` etc. to the barbers array. If photos aren't available yet, commission them — this is the single biggest trust lift on the page.

**Accept:** three real portraits with consistent framing (3/4 ratio, dark background, shop context).

### 2.7 Replace gallery placeholders
**File:** `src/components/Gallery.jsx:15-26` and `src/assets/gallery/*.jpg` (new, 5 files)
Swap placeholder divs for `<img loading="lazy">`. Pull best 5 cuts from Instagram. Add alt text describing the cut style ("Skin fade with textured top — Marcus K.").

**Accept:** gallery shows actual work, not geometric placeholders.

### 2.8 SEO meta tags
**File:** `index.html`
Replace `<head>` contents with:
```html
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="description" content="OFF CUT — premium barbershop w Poznaniu. Precyzyjne strzyżenie, golenie brzytwą, rzeźbienie brody. Zarezerwuj online w 60 sekund." />
<meta name="theme-color" content="#0a0a0a" />
<link rel="canonical" href="https://offcut.pl/" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:title" content="OFF CUT Barbershop — Poznań" />
<meta property="og:description" content="Precision cuts, hot towel shaves, and beard sculpting. Book a master barber in 60 seconds." />
<meta property="og:image" content="https://offcut.pl/og-image.jpg" />
<meta property="og:url" content="https://offcut.pl/" />
<meta property="og:locale" content="pl_PL" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="OFF CUT Barbershop — Poznań" />
<meta name="twitter:image" content="https://offcut.pl/og-image.jpg" />

<!-- Preconnect to Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<title>OFF CUT — Premium Barbershop w Poznaniu</title>
```
Change `<html lang="en">` → `<html lang="pl">` (primary market is Polish).

Create a 1200×630 `/public/og-image.jpg` with brand wordmark.

**Accept:** view source shows all tags; `metatags.io` preview is clean.

### 2.9 LocalBusiness JSON-LD schema
**File:** `index.html` — append inside `<head>`:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BarberShop",
  "name": "OFF CUT Barbershop",
  "image": "https://offcut.pl/og-image.jpg",
  "url": "https://offcut.pl/",
  "telephone": "+48600000000",
  "priceRange": "60-150 PLN",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "ul. Twoja 1",
    "addressLocality": "Poznań",
    "postalCode": "60-000",
    "addressCountry": "PL"
  },
  "geo": { "@type": "GeoCoordinates", "latitude": 52.4064, "longitude": 16.9252 },
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], "opens": "09:00", "closes": "20:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Sunday", "opens": "10:00", "closes": "16:00" }
  ],
  "sameAs": [
    "https://instagram.com/offcutbarber",
    "https://facebook.com/offcutbarber"
  ],
  "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "312" }
}
</script>
```
Phone/address/coordinates/ratings must reflect reality before deploy.

**Accept:** Google Rich Results test passes with no warnings; `BarberShop` type recognized.

### 2.10 Language splash: SEO-safe default
**File:** `src/context/LangContext.jsx`
Change initial state to detect language instead of blocking:
```jsx
const initialLang = (navigator.language || 'pl').startsWith('pl') ? 'pl' : 'en';
const [lang, setLang] = useState(initialLang);
const [splashVisible, setSplashVisible] = useState(() => !localStorage.getItem('lang-chosen'));

function selectLang(l) {
  setLang(l);
  setSplashVisible(false);
  localStorage.setItem('lang-chosen', l);
}
```
Also add a small language toggle in the Nav/Footer so users can switch without revisiting splash.

**Accept:** returning visitors skip splash; crawlers (no JS interaction) still see full content because React hydrates immediately — confirm with View Source + `curl` on prod URL.

### ✅ Phase 2 verification checklist
- [ ] Real photos in Hero/Barbers/Gallery.
- [ ] Testimonials section live with 3+ real reviews.
- [ ] WhyUs section with accurate stats.
- [ ] Meta description / OG / JSON-LD in HTML source.
- [ ] Google Rich Results test: green.
- [ ] Lighthouse SEO ≥ 95.
- [ ] Splash doesn't re-show for returning users.

Commit: `feat: add social proof, SEO, real imagery, stronger hero`

---

## Phase 3 — Conversion Polish (target: ~1 day)

### 3.1 Sticky mobile CTA
**File:** create `src/components/StickyMobileCTA.jsx`
```jsx
import { useT } from '../context/LangContext';
export default function StickyMobileCTA() {
  return (
    <a className="sticky-cta" href="#booking">
      {useT('Zarezerwuj wizytę →', 'Book Appointment →')}
    </a>
  );
}
```
Import in `App.jsx` after `<Footer />`.
CSS:
```css
.sticky-cta {
  display: none; position: fixed; left: 0; right: 0; bottom: 0; z-index: 90;
  background: #0a0a0a; color: #fff; text-align: center; padding: 1.1rem 1.25rem;
  font-family: 'Inter', sans-serif; font-weight: 500; font-size: 0.7rem;
  letter-spacing: 0.25em; text-transform: uppercase; text-decoration: none;
  box-shadow: 0 -2px 20px rgba(0,0,0,0.08);
}
@media (max-width: 640px) { .sticky-cta { display: block; } }
```
(Body already has `padding-bottom: 72px` at mobile breakpoint from task 1.6.)

**Accept:** mobile viewport always shows CTA; doesn't overlap form at bottom.

### 3.2 Reduce booking form fields
**File:** `src/components/Booking.jsx`
Cut from 5 → 3 fields initially: **Name, Phone, Service**. Move date & barber selection to a confirmation call or step 2.
Add a smaller line below the button: *"We'll call to confirm date + barber within 15 min (Mon–Sat 9–20)."*

**Accept:** form length halved; submit still works.

### 3.3 FAQ / objection handling
**File:** create `src/components/FAQ.jsx`, insert between Gallery and Booking.
5 questions minimum, each as `<details>`:
- How long does a cut take?
- Do you accept walk-ins?
- Can I come with my kid?
- What payment methods do you accept?
- Can I cancel or reschedule?

**Accept:** answers each kill one objection to booking.

### 3.4 Accessibility pass
- Every `<button>` with icon-only content: add `aria-label`.
- Every `<img>`: meaningful `alt`.
- `.hero-scroll-hint` gets `aria-hidden="true"` (decorative).
- `.barber-silhouette`, `.eyebrow-line`, `.splash-divider`: `role="presentation"` or wrapper with `aria-hidden`.
- Keyboard focus outlines: ensure `.btn-primary:focus-visible` and `.nav-links a:focus-visible` have visible outlines — current CSS strips them implicitly.

**Accept:** axe DevTools: 0 critical issues.

### 3.5 Performance polish
- Add `loading="lazy"` to gallery/barber imgs (already in tasks 2.6–2.7, re-verify).
- Add `fetchpriority="high"` to hero image if added.
- Self-host `Bebas Neue` + `Inter` with `font-display: swap` (Fontsource package) OR add `&display=swap` param to the Google Fonts URL in `index.css:1`.
- Run `vite build && vite preview` → Lighthouse mobile Performance ≥ 90.

### 3.6 Analytics (optional)
- Drop Plausible or Umami snippet in `index.html`.
- Track `click:book_cta` events on each Book button.
- Track `form:booking_submit` in `handleSubmit`.

### ✅ Phase 3 verification checklist
- [ ] Sticky CTA present and clickable on mobile.
- [ ] Form down to 3 fields.
- [ ] FAQ section answers key objections.
- [ ] axe DevTools: clean.
- [ ] Lighthouse mobile: Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- [ ] Re-run audit → target score 80+/100.

Commit: `polish: sticky CTA, shorter form, FAQ, a11y, perf`

---

## New files created (summary)
- `src/components/WhyUs.jsx`
- `src/components/Testimonials.jsx`
- `src/components/FAQ.jsx`
- `src/components/StickyMobileCTA.jsx`
- `src/assets/barbers/marcus.jpg`, `daniel.jpg`, `tomas.jpg`
- `src/assets/gallery/01.jpg`…`05.jpg`
- `public/og-image.jpg`

## Files modified (summary)
- `index.html` (meta, OG, JSON-LD, lang, preconnect)
- `src/App.jsx` (wire new components)
- `src/context/LangContext.jsx` (auto-detect lang, persist choice)
- `src/components/Hero.jsx` (headline, rating, working CTAs)
- `src/components/Nav.jsx` (hamburger, functional book button)
- `src/components/Booking.jsx` (form handler, reduced fields)
- `src/components/Barbers.jsx` (real photos)
- `src/components/Gallery.jsx` (real photos)
- `src/components/Footer.jsx` (real links, dynamic year)
- `src/components/Marquee.jsx` (location consistency)
- `src/index.css` (media queries, new section styles, sticky CTA, rating pill)

## Dependencies added
None required. Optional later:
- `@fontsource/bebas-neue` + `@fontsource/inter` (perf).
- Formspree / Resend / custom API (form backend upgrade).
- Analytics: Plausible/Umami script (no npm package).

## Decisions owner must confirm
1. Is OFF CUT **Poznań-only** or multi-city (Warsaw/Kraków)?
2. Real Google rating + review count?
3. Real phone number, address, coordinates?
4. Formspree account ID *or* email address for lead delivery?
5. Real social media URLs?
6. Can we get professional photos of barbers + 5–10 cut examples?
7. 3 real client testimonials (with permission to publish)?

These unblock Phase 2. Phase 1 can proceed immediately — it's pure wiring/responsive work.

## End-to-end verification

After all phases:
```
npm run lint
npm run build && npm run preview
# Open http://localhost:4173 in Chrome + iPhone emulator
# Test checklist from the three phase verification blocks above.
```
Then re-run the 100-point audit from `/Users/radix/.claude/skills/landing-page-mastery/references/audit-checklist.md` and confirm score ≥ 80.
