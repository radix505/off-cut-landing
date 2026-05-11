# Frontend Fix Plan — Off Cut Landing

Source: `$impeccable critique` UX audit (2026-05-08).
Score: **23/40**. Target after this plan: **32+/40**.

Direction: keep the moodboard (black + Bebas + orange + grayscale photo).
Fix the execution. Full sweep, ending with `$impeccable polish`.

Workstreams run in order. Each step lists exact files, line numbers,
and the current → target value where measurable. Check items off as you ship.

---

## 1. Contrast Sweep — `$impeccable colorize`

The dominant defect: 78 of 113 detector findings are low-contrast pairs.
Target: **0 sub-AA pairs on text content; brand-coherent neutrals throughout.**

### 1.1 Define contrast tokens in `:root` (`src/index.css` ~line 1–80)

- [ ] Add semantic neutral tokens tinted toward brand hue (chroma 0.005–0.01 in OKLCH):
  - `--ink: oklch(15% 0.005 40);` (replace `#1a1a1a` body color)
  - `--ink-strong: oklch(8% 0.005 40);` (replace `#0a0a0a` near-black)
  - `--ink-weak: oklch(35% 0.008 40);` (~`#555`, AA on light)
  - `--text-muted-light: oklch(50% 0.006 40);` (≥4.5:1 on `--paper`)
  - `--text-muted-dark: oklch(72% 0.006 40);` (≥4.5:1 on `--ink-strong`)
- [ ] Replace every `#000` and `#fff` literal with `--ink-strong` and `--paper` (or `--paper-strong`).
  Detector flagged 4 `pure-black-white` violations.

### 1.2 Lift dim text to AA (`src/index.css`)

Decorative numbering and price labels currently fail AA hard.
Change values from current → target:

- [ ] `.service-num` (line 269): `color: #ccc` → `var(--text-muted-dark)` on dark bg
- [ ] `.services-section .service-num` (line 302): `#444` → `var(--text-muted-dark)` (1.89:1 → ≥4.5:1)
- [ ] `.services-section .service-price` (line 305): `#444` → `var(--text-muted-dark)`
- [ ] `.service-desc` on light (line 271): `#777` → `oklch(45% 0.006 40)` (~`#555`)
- [ ] `.services-section .section-number` (line 293): `#666` → `var(--text-muted-dark)`
- [ ] `.section-number` (line 248): `#bbb` on light bg → `var(--text-muted-light)` (~`#555`)
- [ ] `.section-link` (line 250): `#aaa` → `var(--text-muted-light)`
- [ ] `.btn-ghost` (line 234): `color: #aaa; border: 0.5px solid #555` → `var(--text-muted-dark)` + `0.5px solid var(--text-muted-dark)`
- [ ] `.nav-links a` (line 187): `#888` → `oklch(78% 0.006 40)` (≥4.5:1 on dark glass)
- [ ] `.nav-book-mobile` (line 192): `#ccc` → `var(--paper)` (AA on transparent)
- [ ] `.bpstep-dot` (line 371): `color: #777; border: 0.5px solid #555` → at least `#aaa` + `#888`
- [ ] `.booking-reset-btn` (line 589): `#888` and `#444` → bump to AA
- [ ] `.bcal-nav` (line 480): `color: #aaa` → `var(--text-muted-dark)`

### 1.3 Reviews — replace Material-palette avatar chips

The biggest single contrast cluster: every `.review-avatar` uses `r.color`
inline (Material yellow/teal/orange/green/red), with white initials on top.
14 chips, all under 4.5:1.

- [ ] **`src/components/Reviews.jsx` line 79**: remove the rainbow palette.
  Two acceptable patterns:
  - **Pattern A (recommended):** monochrome avatars — neutral dark fill (`var(--ink)`),
    cream initials (`var(--paper)`). Single visual rule, no contrast risk.
  - **Pattern B:** keep one per-card brand variant — orange `var(--color-accent)` with `var(--ink-strong)`
    initials (passes ~5.6:1). Use only on every Nth card for rhythm.
- [ ] If review data carries `r.color` from `src/data/reviews.json`, drop the field —
  color is a presentation concern, not data.

### 1.4 Tint scrollbar (`src/index.css` line 82)

- [ ] `scrollbar-color: #333 transparent` → `var(--ink-strong) transparent`
  (cosmetic — but no `#333` literals stay if we're being honest about tokens).

### Acceptance

- [ ] Re-run detector: `npx impeccable detect --json http://localhost:5174/`
- [ ] `low-contrast` count: 78 → **0** (or ≤3 with documented exemptions)
- [ ] `pure-black-white` count: 4 → **0**

---

## 2. Typography Discipline — `$impeccable typeset`

**Goal:** uppercase tracked-out reserved for ONE element class (the eyebrow).
Body copy is sentence-case with normal tracking. No body line over 75ch.

### 2.1 Hero subhead — the worst offender

- [ ] **`src/index.css` line 214 `.hero-sub`**: this is a paragraph styled like signage.
  - `font-size: 0.95rem` → `1rem` (16px)
  - `letter-spacing: 0.12em` → `normal`
  - `text-transform: uppercase` → **remove**
  - `line-height: 1.8` → `1.55`
  - `color: #ccc` → `var(--text-muted-dark)` (already done in workstream 1)
  - `max-width: 320px` → `420px` (gives it room to breathe at 1.55 line-height)
- [ ] **`src/components/Hero.jsx` lines 6–7**: copy stays as-is content-wise
  (the period+linebreak structure already reads clean once it's not all-caps).

### 2.2 Wide-tracking sweep (13 detector hits)

Reduce extreme `letter-spacing` values. Anything > 0.25em should only exist on:
the eyebrow, the section-number, the marquee. Not on running text.

- [ ] `.marquee-item` (line 240): `0.3em` is fine — single-row marquee.
- [ ] `.hero-year` (line 201): `0.3em` ok (vertical signage).
- [ ] `.section-number` (line 248): `0.3em` ok.
- [ ] `.nav-logo-sub` (line 185): `0.4em` → `0.3em`.
- [ ] `.splash-sub` (line 102): `0.45em` → `0.3em`.
- [ ] `.splash-lang-hint` (line 105): `0.3em` ok, but **lift opacity** from `0.35` → `0.7`
  (it currently fails contrast AND tracking is fine).
- [ ] Audit any other `letter-spacing` >`0.3em` in `src/index.css` — clip to `0.3em` ceiling.

### 2.3 All-caps body (2 detector hits)

The detector flagged uppercase runs of 83 and 54 chars. Hero subhead
(workstream 2.1) is the 83-char one. Find the 54-char run:

- [ ] Grep for any other multi-sentence body copy with `text-transform: uppercase`.
  Footer credit line, marquee item, or service description — uppercase one full
  sentence is a label; uppercase a paragraph is signage.
- [ ] Rule of thumb to apply across `src/index.css`: `text-transform: uppercase`
  is allowed when `font-size <= 0.7rem` AND content fits one line. Otherwise drop it.

### 2.4 Tiny text (8 detector hits at 10.88px / 11.52px)

Body text floor: 12px. Find every `font-size` below `0.75rem`:

- [ ] `.service-barber-tag` (line 273): `0.5rem` (8px) → `0.65rem` (10.4px) is still
  too small. Raise to `0.75rem` (12px) and shrink padding so the chip shape stays.
- [ ] `.splash-sub`, `.splash-lang-hint`: `clamp(8px,…,9px)` — these are decorative.
  Acceptable only because users see the splash for ~1 second; document the exemption.
- [ ] `.btn-primary`, `.btn-ghost` (lines 232, 234): `0.65rem` (10.4px) — bump to `0.72rem`.
- [ ] `.nav-book` (line 194): `0.65rem` → `0.72rem`.
- [ ] `.nav-book-mobile` (line 192): `0.62rem` → `0.72rem`.
- [ ] `.hero-scroll-hint` (line 202): `0.6rem` → `0.7rem`.
- [ ] Any other font-size below `0.7rem` — sweep and lift.

### 2.5 Line length (1 detector hit at ~190 chars)

Body content cap: **65–75ch**.

- [ ] Add a global utility `--measure: 70ch` and apply `max-width: var(--measure)`
  to every running-text container: blog post body, privacy/cookies pages,
  FAQ blocks, booking left-column copy.
- [ ] Likely culprits: `.privacy-content`, `.cookies-content`, `.blog-post-body`,
  `.booking-info-text`. Audit each for unbounded `max-width`.

### 2.6 Inter monotony (overused-font: 92%)

Two display fonts (Bebas, Let Me Ride) but body voice is 100% Inter.
Not strictly a fix — but if you want a more characterful body register,
consider a humanist body face like **Söhne**, **Inter Display**, or **Söhne Mono**
for one specific surface (e.g., service descriptions or testimonial body) to break
the monotone. Optional; defer if scope-tight.

### Acceptance

- [ ] `wide-tracking` count: 13 → ≤3
- [ ] `tiny-text` count: 8 → 0
- [ ] `all-caps-body` count: 2 → 0
- [ ] `line-length` count: 1 → 0

---

## 3. Mobile UX — `$impeccable adapt`

**P0 issues blocking real users on mobile.**

### 3.1 Cookie banner blocks hero CTA at 375×812

The banner is `position: fixed; bottom: 0` with full width and ~108px height.
On mobile, it overlaps the secondary "Zobacz usługi" CTA at y=711–757.

- [ ] **`src/components/CookieBanner.jsx`**: add a `<body>` class while open
  (e.g., `body.cookie-open`) so layout can react.
- [ ] **`src/index.css` line 1306 `.cookie-banner`**: at `max-width: 768px`, switch to
  a slim variant: smaller padding (`0.6rem 1rem`), text on one line, accept-only
  default with "options" link. Or move to `top: 0` toast on mobile.
- [ ] **`src/index.css` `.hero` selector**: `body.cookie-open .hero { padding-bottom: calc(env(safe-area-inset-bottom) + 120px); }`.
  Once banner is dismissed (state persists in localStorage), padding releases.
- [ ] Verify at 320, 360, 375, 414, 768 widths that **both** hero CTAs are tappable
  with the banner mounted.

### 3.2 Wrap phone number in `tel:`

`src/components/Map.jsx:36` already does it correctly. Two more spots miss it:

- [ ] **`src/components/Booking.jsx:335`**: `<span className="booking-info-value">+48 513 340 013</span>`
  → wrap in `<a href="tel:+48513340013" className="booking-info-link">` (re-use map link styling).
- [ ] **`src/components/Footer.jsx`**: search for `+48 513 340 013` — if displayed,
  wrap. If only `mailto:` is wired, add the matching `tel:`.

### 3.3 Touch targets — enforce `--touch-min: 44px`

Project defines a 44px token but several controls violate it:

- [ ] **`src/index.css` line 256 `.view-toggle-btn`**: `width: 28px; height: 28px`
  → `width: 44px; height: 44px` (or use `padding: 10px` to keep visual size while
  expanding hit area). Inner SVG can stay at 13px.
- [ ] **`src/index.css` line 371 `.bpstep-dot`**: `width: 26px; height: 26px`
  → at minimum wrap in a 44×44 click area (a `<button>` with padding around the dot
  visually 26px but the button is 44px hit zone).
- [ ] **`src/index.css` line 480 `.bcal-nav`**: `padding: 0.35rem 0.6rem` → `padding: 0.7rem 0.9rem`.
- [ ] **`src/components/Nav.jsx`**: `.lang-flag-btn` and `.nav-hamburger` — verify ≥44×44.
- [ ] **`src/index.css` `.scroll-top-btn`** (whatever its dimensions are) — verify ≥44×44.
- [ ] Sweep all `.*-btn`, `.*-icon-btn` selectors against the 44px floor.

### 3.4 Mobile booking — barber row clips Julia at 375px

3 barbers in a row at 375 wide cut off the third avatar.

- [ ] **`src/index.css` `.booking-barber-card` / `.booking-barber-grid`**: at <`480px`,
  switch to a horizontal scroll with snap-points OR a 1-column stack. A 1×3 stack
  at small width is the simplest, most predictable answer.

### 3.5 Mobile primary nav

- [ ] **`src/components/Nav.jsx`**: verify hamburger menu opens above z-index of
  cookie banner. With `z-index: 9000` on `.cookie-banner` and `100` on `nav`,
  open mobile menu likely *under* the banner. Lift `.nav-links--open` to `z-index: 9500`
  or drop the cookie banner to `z-index: 80`.

### Acceptance

- [ ] Both hero CTAs tappable at 320/375/414 with banner mounted.
- [ ] All interactive elements ≥44×44 (or have a 44px hit-zone wrapper).
- [ ] Tap-to-call works from booking section and footer.

---

## 4. Copy Clarity — `$impeccable clarify`

### 4.1 Booking section has 3 layers saying "Zarezerwuj"

Section eyebrow "REZERWACJA" + section title "Zarezerwuj fotel" + display headline "ZAREZERWUJ SWÓJ TERMIN."

- [ ] **`src/components/Booking.jsx`**: locate the section title element rendering
  "Zarezerwuj fotel" and **delete** it. Keep the eyebrow ("05 / REZERWACJA")
  and the display headline.
- [ ] If "Zarezerwuj fotel" was a deliberate poetic line, it belongs as a single
  decorative line on a sub-page, not stacked between eyebrow and H1.

### 4.2 Decide on "fotel" vs "termin/wizyta"

- [ ] Settle the language: in Polish, "fotel" = armchair; "krzesło fryzjerskie" = barber chair;
  "termin / wizyta" = appointment. If "fotel" was intentional craft (the chair as ritual),
  document that decision and use it consistently. If not, use "termin" or "wizyta" everywhere.
- [ ] Sweep `src/components/*.jsx` and `src/data/*` for "fotel" — settle on one term.

### 4.3 Scan for other restated headings

- [ ] Repeat the eyebrow/title/display check for every section: Services, Barbers,
  Gallery, Reviews, Blog. If two layers say the same thing, drop one.

### 4.4 Microcopy review

- [ ] Booking error states (the `errorMsg` path in `Booking.jsx`) — write user-facing
  messages in plain Polish. "Wystąpił błąd" is too vague. Tell the user what happened
  and what they should do.
- [ ] Loading states — "Sprawdzam dostępność…" beats a spinner without label.
- [ ] Form field placeholders should not double as labels (current "+48 513 340 013"
  in the phone field — ok as example, but ensure label exists above).

---

## 5. Calm the First Viewport — `$impeccable quieter`

### 5.1 Trim nav

Hero faces 6 destinations + Book button + Language flag + Hamburger = 9 hits.

- [ ] **`src/components/Nav.jsx`**: remove `Lokalizacja` and `Blog` from the desktop
  top-nav. Keep them in the mobile drawer and footer. Result: 4 desktop nav items
  (Usługi, Ekipa, Galeria, Kontakt) + Book + Lang.
- [ ] If you keep all 6, increase right-side spacing so Book button doesn't crowd Lang flag.

### 5.2 Calm the CTA pulse

The throbbing orange CTA is a "premium" anti-pattern.

- [ ] **`src/index.css` line 232 `.btn-primary`**: remove `animation: ctaPulse 1.9s ease-in-out infinite`.
- [ ] **`src/index.css` line 228 `@keyframes ctaPulse`**: delete the keyframes block.
- [ ] Keep the shimmer-on-hover (`background-position` transition) — that's a
  craft moment that triggers on intent.
- [ ] Replace pulse confidence with type confidence: bump `.btn-primary` to `font-weight: 600`.

### 5.3 Marquee duplication

The track is rendered 4× in source for an infinite-loop illusion.

- [ ] **`src/components/Marquee.jsx` line 30**: `[...base, ...base, ...base, ...base]`
  → `[...base, ...base]` (one duplicate is enough for seamless looping if the
  CSS animation translates by exactly half the track width).
- [ ] If the visual loop breaks at 2×, debug the animation distance —
  4× is the brute-force fix, not the right fix.

### 5.4 Hero grid-lines + scroll-scissors

Two simultaneous decorative effects compete for attention.

- [ ] **`src/components/Hero.jsx` line 12 `<div className="hero-grid-lines" />`**:
  consider removing on the homepage hero (it reads as SaaS template). Keep elsewhere
  if it's a design-system motif used in 3+ sections.
- [ ] **`src/components/ScrollScissors.jsx`**: review whether the moving cursor-following
  scissors during scroll on the *barbers section* (which is meant to highlight people)
  competes with portrait recognition. Options:
  - Keep but slow it (friction-feel, not distraction).
  - Restrict to a "credits" or "intro" band, not over photos.
  - Drop entirely — the section title and `.nav-scissors` SVG already do scissor identity.

### 5.5 Layout-transition violations (5 detector hits)

Animating layout properties is on the impeccable absolute-bans.

- [ ] **`src/index.css:177` `nav`**: `transition: padding 0.3s, …` →
  drop `padding`. The size change between scrolled/unscrolled is fine to be instant
  OR animate `transform: scale()` instead.
- [ ] **`src/index.css:182` `.nav-logo-icon`**: `transition: height 0.3s` →
  use `transform: scale()` (animate the visual, not layout).
- [ ] **`src/index.css:369` `.booking-progress-fill`**: `transition: width 0.5s` →
  `transform: scaleX()` with `transform-origin: left`.
- [ ] **`src/index.css:1230` `.barber-bio-hover`**: `transition: max-height 0.4s` →
  this is the trickiest. Options:
  - Use `grid-template-rows: 0fr → 1fr` transition (modern, animatable).
  - Pre-render at full height and use `transform: translateY()` + `clip-path`.
  - Accept the violation as a documented exception (max-height is a known compromise
    for unknown-content reveals).
- [ ] Run detector again to confirm `layout-transition` count goes from 5 → ≤1.

### 5.6 Glass nav

Detector didn't flag this directly, but it's a noted "premium template" tell.

- [ ] **`src/index.css:177` `nav`**: keep `backdrop-filter: blur(10px)` on dark scroll state
  (it's purposeful — readability over photo content). But on the LIGHT scrolled state
  (`nav.nav-scrolled` line 178 — `rgba(10,10,10,0.92)`), drop the blur (it's
  near-opaque already, so the blur does nothing).

---

## 6. Hardening — `$impeccable harden`

### 6.1 Persist language pre-render

Returning user pain point: the splash flashes on every visit if `localStorage.lang`
isn't read before the splash mounts.

- [ ] **`src/context/LangContext.jsx`**: read `localStorage.getItem('lang')` in the
  initial state, NOT in a `useEffect`. If a value exists, set `splashShown: true`
  by default so `<LangSplash />` returns null on mount.
- [ ] **`src/components/LangSplash.jsx`**: short-circuit render when `splashShown` already true.

### 6.2 "Rebook last visit" affordance

- [ ] On successful booking completion in `Booking.jsx`, persist to localStorage:
  `lastBooking: { barberId, serviceId, completedAt }`.
- [ ] In `Hero.jsx`, when `lastBooking` exists and `< 60 days old`, show a subtle
  `<button className="hero-rebook">Umów ponownie u {barberName} →</button>`
  beside the primary CTA. Pre-populate `navState.preselectedBarber` and `preselectedService`
  on click. Reuses existing preselect logic.
- [ ] If `lastBooking` is older than 60 days, don't show — feels stale.

### 6.3 Booking error states

- [ ] Audit `Booking.jsx` for every `errorMsg` set. Each path should:
  - Render an inline error block (not a banner that pushes layout).
  - Tell user *what* happened ("Termin właśnie został zajęty przez kogoś innego")
    AND *what to do* ("Wybierz inny termin poniżej").
  - Provide a recovery action when possible.
- [ ] Add a global error boundary at `App.jsx` so a render error in one lazy page
  doesn't blank the screen.

### 6.4 Map UX

- [ ] **`src/components/Map.jsx`**: alongside the iframe, add a prominent
  "Get directions →" link (`https://www.google.com/maps/dir/?api=1&destination=Bolesława+Krzywoustego+27,+Szczecin`).
  Most users plan their visit *outside* the page — give them the exit.
- [ ] Consider downsizing the iframe height on mobile (current is large; 280–320px
  is plenty when "Directions" is the real CTA).

### 6.5 Reviews authenticity

- [ ] **`src/data/reviews.json`** (if reviews are static): verify whether they're
  real Google reviews or mock data. If real, fine. If mock, add a code comment
  flagging it. Static 5★ wall reads less authentic than a mix.
- [ ] Consider a single visible 4★ review (if any genuine ones exist) — adds trust.
- [ ] OR: drop per-card stars and rely on the aggregate "5.0 Google Rating" header.

### 6.6 Footer email link

- [ ] **`src/components/Footer.jsx`**: ensure phone gets `tel:` (workstream 3.2)
  and email keeps `mailto:`. Symmetry of action affordances matters.

---

## 7. Polish — `$impeccable polish`

Final pass after 1–6 ship.

- [ ] Re-run `npx impeccable detect --json http://localhost:5174/`. Target:
  - low-contrast: 0
  - wide-tracking: ≤3
  - tiny-text: 0
  - layout-transition: ≤1 (with documented exception)
  - pure-black-white: 0
  - all-caps-body: 0
  - dark-glow: review (orange-on-dark glow may be a brand thing)
  - line-length: 0
  - overused-font: review (dropping below 90% is OK; not required)
- [ ] Re-run `$impeccable critique`. Target: **32+/40**.
- [ ] Lighthouse mobile pass on `/`: a11y ≥95, perf ≥85, SEO ≥95.
- [ ] Keyboard test: tab through hero → nav → booking. Every interactive element
  reachable, focus ring visible, focus order matches visual order.
- [ ] Reduced-motion test: `prefers-reduced-motion: reduce` should disable
  the marquee, scroll-scissors, ctaPulse (already removed in 5.2), grid-line
  reveal animation, scroll-line animation.
- [ ] Dark/light splash: confirm splash works correctly when system prefers dark.
- [ ] Screen reader smoke test on hero, booking flow, map.
- [ ] Final visual diff at 320 / 375 / 414 / 768 / 1024 / 1440 / 1920.

---

## Out-of-scope (deferred / questions)

- The brand register itself stays — black + Bebas Neue + orange + grayscale
  photo. We chose "fix execution," not "redirect brand."
- The "Created by corelaners.eu" footer credit logo: judgment call;
  acceptable on a credit line.
- Adding a body display font beyond Inter: optional under workstream 2.6.
- A blog content strategy: out of scope for this plan.

## Done definition

All boxes checked AND `$impeccable critique` reports ≥32/40 AND
`npx impeccable detect` reports zero low-contrast, zero tiny-text,
zero pure-black-white, zero all-caps-body, zero line-length issues.
