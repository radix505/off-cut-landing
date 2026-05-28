---
name: Off Cut
description: Razor-edge brutal-masculine grooming, workshop-precise, atelier-disciplined.
colors:
  ink: "#0a0a0a"
  paper: "#f5f3ef"
  pure-white: "#ffffff"
  accent-orange: "#E85A2A"
  accent-warm: "#DC5030"
  line-paper: "#ddd9d0"
  line-paper-soft: "#e8e5df"
  line-ink: "#1a1a1a"
  ink-strong: "#0a0a0a"
  paper-strong: "#fcfaf6"
  ink-weak: "#4a463f"
  text-muted-light: "#7a766f"
  text-muted-dark: "#b3afa8"
typography:
  brand:
    fontFamily: "Let Me Ride, Bebas Neue, sans-serif"
    fontSize: "clamp(22px, min(5vw, 8vh), 64px)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.08em"
  display:
    fontFamily: "Bebas Neue, sans-serif"
    fontSize: "clamp(72px, 11vw, 132px)"
    fontWeight: 400
    lineHeight: 0.88
    letterSpacing: "0.02em"
  display-section:
    fontFamily: "Bebas Neue, sans-serif"
    fontSize: "clamp(36px, 5vw, 60px)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.04em"
  title:
    fontFamily: "Bebas Neue, sans-serif"
    fontSize: "1.6rem"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "0.05em"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "clamp(0.875rem, 0.82rem + 0.3vw, 1rem)"
    fontWeight: 300
    lineHeight: 1.7
    letterSpacing: "0.04em"
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.25em"
  micro-label:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.7rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.3em"
rounded:
  square: "0px"
  pill: "9999px"
spacing:
  section-y: "clamp(3rem, 6vw, 6rem)"
  section-x: "clamp(1rem, 5vw, 3rem)"
  stack-sm: "clamp(0.5rem, 1vw, 0.75rem)"
  stack-md: "clamp(1rem, 2vw, 1.5rem)"
  stack-lg: "clamp(2rem, 4vw, 3rem)"
  touch-min: "44px"
components:
  button-primary:
    backgroundColor: "{colors.accent-orange}"
    textColor: "{colors.ink-strong}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "1rem 2.2rem"
  button-primary-hover:
    backgroundColor: "#ff6a3a"
    textColor: "{colors.ink-strong}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-muted-dark}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "1rem 2.2rem"
  button-ghost-hover:
    backgroundColor: "transparent"
    textColor: "{colors.paper-strong}"
  nav-book:
    backgroundColor: "{colors.paper-strong}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0.6rem 1.4rem"
  service-card-light:
    backgroundColor: "{colors.paper-strong}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "1.6rem 1.5rem"
  service-card-dark:
    backgroundColor: "rgba(255,255,255,0.05)"
    textColor: "{colors.paper-strong}"
    rounded: "{rounded.square}"
    padding: "1.6rem 1.5rem"
  review-card:
    backgroundColor: "{colors.pure-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "1rem 1.05rem"
  spec-tag:
    backgroundColor: "transparent"
    textColor: "{colors.text-muted-dark}"
    typography: "{typography.micro-label}"
    rounded: "{rounded.square}"
    padding: "0.3rem 0.7rem"
---

# Design System: Off Cut

## 1. Overview

**Creative North Star: "The Razor Edge"**

Off Cut is what happens when a barbershop adopts both Carhartt's workshop-honesty and Aesop's atelier-discipline, then sharpens the result until nothing decorative survives. The interface reads like a workbench: hairline rules instead of borders, exposed metadata instead of badges, deliberate uppercase tracking instead of soft sentence case, sharp corners instead of pillowed radii. The orange accent is a foreman's pencil mark on a tag, never a button gradient. Restraint is the loudness; what is left out carries as much weight as what stays.

The system rejects every soft adjacent register: vintage barber pastiche (no sepia, no crossed razors, no faux-distress), generic chain-barbershop dark-grey-with-gold gloss, salon-and-parlour ornament, and the gradient-blob hero of every SaaS template. If the visual could be mistaken for any of those, it is wrong and must be redrawn. The voice of the spec is the voice of a workshop foreman: prescriptions, not preferences. Prohibited, never preferred. Always, never sometimes.

**Key Characteristics:**

- Two surfaces, two registers: warm `#f5f3ef` paper carrying brand and content, near-black `#0a0a0a` ink carrying conversion (services, gallery, booking).
- Hairline rules everywhere: 0.5px borders and dividers are the connective tissue. Heavier rules are reserved for moments that earn weight.
- Sharp corners by default. `border-radius: 0` is the rule; circles are the only exception, reserved for avatars, status dots, and small-iconographic affordances.
- Section numbers (`01 / SERVICES`, `04 / OPINIE`) treat content like inventory. Workshop tagging, not editorial flourish.
- Letter-spacing carries as much hierarchy as size: 0.02em for display, 0.04em for body, 0.15em for emphasis labels, 0.25–0.35em for uppercase metadata. Small text gets more air, not less.
- One accent. Off Cut Orange (`#E85A2A`) carries every primary action, every "now" moment, and nothing else. It must read as an event when it appears.
- Motion is exponential ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`) for entrances and choreographed reveals, never bounce, never elastic.
- Density is fine when it earns its weight. Sprawl is not. The brick-fall reviews wall, the gallery, the marquee all earn density through tight rhythm and shared baseline grids.

## 2. Colors

A two-surface palette with one accent. Restrained on the spectrum of color strategy. The brief is for color to behave like material: paper is paper, ink is ink, orange is the workshop's only colored mark.

### Primary

- **Off Cut Orange** (`#E85A2A`, oklch ≈ 65% 0.17 38): the only accent. Carries the primary CTA (`Zarezerwuj wizytę`), the hero scroll-hint pulse, the rule that draws under the hero title, the booking selection state (its slightly warmer sibling, `#DC5030`), the footer credit. **Used on ≤8% of any visible surface.** When it appears, the eye must be drawn to it as the action. Hover lifts to `#ff6a3a`.

### Neutral

- **Workshop Ink** (`#0a0a0a`, oklch ≈ 8% 0.005 40): the dark surface. Not pure black; tinted toward the brand's warm hue with chroma 0.005 so it never goes blue under cool light. Used as the surface for services, gallery, booking, footer. The places where the visitor decides.
- **Bench Paper** (`#f5f3ef`, oklch ≈ 95% 0.005 40): the light surface. Warm, low-chroma, off-white-leaning-cream. Carries brand, content, and reviews. Reads as paper under workshop light, never as a screen background.
- **Paper Strong** (`#fcfaf6`): the brighter sibling of paper, used as button-primary fill and inverted text on dark surfaces. Approximately oklch(98% 0.006 40). Tinted, never `#fff`.
- **Pure White** (`#ffffff`): permitted only inside the Reviews brick wall (review card surfaces), where each card is a Google-Maps citation tile and pure white is part of the reference. No other surface uses it.
- **Line Paper** (`#ddd9d0`): the hairline divider on paper surfaces. Lives in section-header underlines, service-grid gutters, prices-table row separators.
- **Line Paper Soft** (`#e8e5df`): a step lighter, for secondary divisions inside cards or grouped lists.
- **Line Ink** (`#1a1a1a`): the hairline divider on ink surfaces. Just bright enough to register as a rule against `#0a0a0a`, never bright enough to read as a border.
- **Text Muted Light** (`oklch(50% 0.006 40)`, ≈ `#7a766f`): muted body and label color on paper. Verified ≥4.5:1 against `--paper`.
- **Text Muted Dark** (`oklch(72% 0.006 40)`, ≈ `#b3afa8`): muted body and label color on ink. Verified ≥4.5:1 against `--ink-strong`.
- **Ink Weak** (`oklch(35% 0.008 40)`): paragraph body color on paper surfaces (legal pages, content pages). Carries longer reading without going to full ink.

### Named Rules

**The One Accent Rule.** The Off Cut Orange is used on ≤8% of any given screen. Its rarity is the point. When it appears on more than one element above the fold, the design is wrong. Hover-states, focus rings, links, and decorative flourishes do not get to use it. Only conversion and event moments do.

**The No Pure Black, No Pure White Rule.** `#000` and `#fff` are forbidden as surfaces. Every neutral is tinted toward the warm hue (chroma 0.005–0.01). The two exceptions are explicit and named: review-card backgrounds (which cite Google Maps tiles by reference) and Bebas Neue text on the dark hero (`paper-strong`, not pure white).

**The Tinted Neutrals Rule.** Every grey, every divider, every muted text colour is OKLCH with the warm hue (40°) baked in. There are no neutral neutrals in this system. A reviewer should be able to feel the warmth in `var(--text-muted-light)` next to a stock `#7a766f`.

## 3. Typography

**Brand Font:** Let Me Ride (custom workshop-stencil, fallback Bebas Neue, sans-serif)
**Display Font:** Bebas Neue (sans-serif, condensed)
**Body & Label Font:** Inter (weights 300 / 400 / 500)

**Character.** Let Me Ride is the Off Cut wordmark, used only at the language splash and in the nav logo. It carries the place's name and nothing else. Bebas Neue does the heavy lifting for hierarchy: condensed, all-caps, tightly drawn, reads as workshop signage. Inter is the discipline: precise, low-personality, weight 300 for body so the type colour stays workshop-quiet against warm paper. The pairing is intentional: a stencil for identity, signage for hierarchy, an industrial sans for working text.

### Hierarchy

- **Brand** (Let Me Ride 400, `clamp(22px, min(5vw, 8vh), 64px)`, `letter-spacing: 0.08em`): wordmark only. Splash screen, nav logo. Never used for content.
- **Display Hero** (Bebas Neue 400, `clamp(72px, 11vw, 132px)`, `line-height: 0.88`, `letter-spacing: 0.02em`): the hero `THE / SHARP / ART` lockup. The middle line is `-webkit-text-stroke: 1px rgba(255,255,255,0.7)` outline-only - the system's signature display detail. Never reused for non-hero content.
- **Display Section** (Bebas Neue 400, `clamp(36px, 5vw, 60px)`, `line-height: 1`, `letter-spacing: 0.04em`): every section title (`Co robimy`, `Załoga`, `Co mówią klienci`, `Umów wizytę`). Always paired with a tracked section number above (`01 / USŁUGI`).
- **Title** (Bebas Neue 400, `1.1–1.6rem`, `letter-spacing: 0.05–0.12em`): service names, barber names, prices, calendar month. The condensed all-caps voice for inline emphasis.
- **Body** (Inter 300, `clamp(0.875rem, 0.82rem + 0.3vw, 1rem)`, `line-height: 1.6–1.7`, `letter-spacing: 0.02–0.04em`): all running text. Capped at `--measure: 70ch` for legal content and booking prose. Never below weight 300; never above 500 except for inverted text on ink.
- **Label** (Inter 500, `0.72rem`, `letter-spacing: 0.20–0.25em`, uppercase): every CTA, button, nav link, eyebrow, "back" button. The system's primary affordance language.
- **Micro-label** (Inter 400, `0.65–0.70rem`, `letter-spacing: 0.25–0.35em`, uppercase): metadata. Section numbers, "EST. 2019 - PREMIUM GROOMING", barber subtitles, prices-page row dur. The smallest type in the system, gets the widest tracking.

### Named Rules

**The Wider-On-Smaller Rule.** Letter-spacing scales inversely to font size. Body sits at 0.04em, 0.85rem labels at 0.20em, 0.70rem metadata at 0.30em, and `0.55rem` micro-tags at 0.35em. The smaller the text, the more breath it gets. The reverse is forbidden: never tighten a 0.65rem label.

**The Uppercase Label Rule.** All affordances (buttons, nav, links, eyebrows, section numbers) are uppercase. Sentence-case is reserved for body, headings, and proper nouns. There is no in-between, no SemiCase, no Title Case. Either ALL CAPS with tracking or sentence case with normal letter-spacing.

**The Display-Only Bebas Rule.** Bebas Neue is for display, titles, and prices. It is forbidden for body, paragraphs, or anything longer than ~6 words. Inter does paragraphs.

**The Tiny-Text Floor Rule.** Below 9px on touch devices, label legibility breaks. The CSS already has a `(max-width: 768px), (pointer: coarse)` floor that promotes 0.55rem labels to 0.625rem. Any new micro-label must be auditable against this floor.

## 4. Elevation

**Off Cut is flat by default.** Depth is conveyed by tonal layering (paper vs. ink, white vs. paper-strong) and hairline rules, not by shadows. Three exceptions are deliberate and named:

1. **The Scroll-To-Top Glass Bubble.** Fixed bottom-right, `background: rgba(10,10,10,0.55)` with `backdrop-filter: blur(8px)` and a 0.5px white-translucent border. The only intentional glassmorphism in the system. Earned because it floats over both ink and paper and must remain legible on either.
2. **The Reviews Brick Hover Lift.** A `box-shadow: 0 6px 22px rgba(0,0,0,0.14)` was previously used and has been deliberately removed: the brick wall is non-interactive background. No shadow; depth comes from the brick-drop animation alone.
3. **The Avatar Stack.** Service-row and prices-row barber avatars use `box-shadow: 0 0 0 0.5px #ddd` as a hairline ring, not as elevation. It reads as a stamped tag, not as a lifted chip.

There is no other shadow vocabulary. There is no "card lifted on hover" pattern. Hover changes background tint (`background 0.4s`) or border colour, never elevation.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat. Shadows are forbidden as decoration; they appear only as a response to a specific state (the floating scroll-to-top bubble) or as a hairline ring (avatar stamps), never to imply hierarchy. If you reach for a `box-shadow` to make something "pop", redraw the element with a hairline border or a tonal step.

**The Backdrop-Blur Reservation.** `backdrop-filter: blur(...)` exists in three places and only three: the nav background when not scrolled, the scroll-to-top bubble, and the dark service cards. Anywhere else, blur is forbidden.

## 5. Components

Every component carries its character first, mechanics second. Shape is square unless explicitly circular. Borders are 0.5px unless explicitly heavier.

### Buttons

The system has three variants. All share `letter-spacing: 0.20–0.25em`, all-caps, `font-family: Inter`, weight 500–600.

- **Shape.** Square. `border-radius: 0`. Never rounded.
- **Primary** (`btn-primary`): Off Cut Orange fill (`#E85A2A`) on ink-strong text. Padding `1rem 2.2rem`. Carries a deliberate diagonal sheen via `linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%)` that sweeps left-to-right on hover (`background-position` transition over 0.7s with `cubic-bezier(0.4, 0, 0.2, 1)`). Hover also lifts the surface 2px (`translateY(-2px)`) and brightens the orange to `#ff6a3a`. The sheen is the only sanctioned ornamental moment in the system; it is not reusable.
- **Ghost** (`btn-ghost`): transparent background, 0.5px text-muted-dark border, text-muted-dark label. Hover swaps both border and text to paper-strong. Used as the secondary alongside primary in the hero.
- **Nav Book** (`nav-book`): inverted - paper-strong fill on ink text. Hover inverts to transparent on paper-strong border. The desktop nav's primary CTA. Mobile gets `nav-book-mobile`, a transparent ghost variant.
- **Page Back** (`page-back-btn`): solid paper-strong on ink text, fixed top-left, ≤44px tall. Used on full-page sub-routes (`/prices`, `/blog`, `/cookies`).

### Cards

- **Service Card (light)**: paper-strong background, sharp corners, padding `1.6rem 1.5rem`. Top edge gets a `linear-gradient(to right, transparent, var(--text-muted-light), transparent)` `::before` rule that draws on hover via `transform: scaleX(0) → 1` over 0.4s. Background warms to `#f9f8f5` on hover. No border; the hover-rule is the entire affordance.
- **Service Card (dark)**: `rgba(255,255,255,0.05)` glass on ink, with a 0.5px white-translucent border, `backdrop-filter: blur(8px)`, and a `radial-gradient` dot pattern background (`background-image: radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px); background-size: 18px 18px`). The dot grid is a workshop-blueprint cue, not a decoration. Hover brightens to `rgba(255,255,255,0.09)`.
- **Review Card (brick)**: `#ffffff` (one of the two pure-white exceptions, by reference to Google Maps tiles), 0.5px `#e8eaed` border, sharp corners, `padding: 1rem 1.05rem`. Falls into place on viewport reveal via `brick-drop` keyframe (translate3d(-150vh) → 0, staggered `--step: 70ms` per cell, column-major bottom-up order). Non-interactive: `pointer-events: none`. The whole grid is decorative background; the only clickable affordances live in the centred overlay.
- **Booking Barber Card**: ink-tinted glass (`rgba(255,255,255,0.03)`), 0.5px white-translucent border, vertical stack (avatar → name → title). Selected state swaps to `rgba(220, 80, 48, 0.1)` background and `var(--color-accent-warm)` 1px border, plus the avatar removes its `grayscale(0.3)` filter. The greyscale-on-default, full-colour-on-selected is intentional: only the chosen barber gets to be in colour.
- **Booking Category Card**: same glass-on-ink container, with a tracked metadata layout: `bcat-num` top-right, central icon, title, subtitle, count divider. The `::before` and `::after` lines on `bcat-count` (14px hairlines flanking the count text) are the system's most explicit workshop-tag detail.

### Chips & Tags

- **Spec Tag** (`spec-tag`): 0.5px text-muted-dark border on transparent, micro-label typography (Inter 0.72rem, 0.15em tracked, uppercase), `padding: 0.3rem 0.7rem`. Used on barber cards to label specialties. Sharp corners. Never rounded into a pill.
- **Service Barber Tag** (`service-barber-tag`): same square-tag treatment, on light service-card surface. The 0.5px border colour shifts to `#ccc` for the lighter surface.
- **Group Badge / Marquee Item**: Bebas Neue 0.95rem, 0.30em tracked, paired with a 3px circular dot separator. Not a chip; an inline-rhythm mark.

### Inputs / Wizard Atoms

The booking wizard is the system's input vocabulary.

- **Calendar Day** (`bcal-day`): `aspect-ratio: 1`, circular (`border-radius: 50%` is the only place radius leaves zero), `font-family: Inter`, `font-size: 0.82rem`. Default state has no border. Hover lifts to `rgba(255,255,255,0.1)`. Selected state fills with `var(--color-accent-warm)`. Today gets a 3px accent-warm dot bottom-centre, never a ring. Past days are dimmed to `#2e2e2e` and `cursor: default` - they are not interactive, they are visible history.
- **Time Wheel** (`btime-wheel`): an Apple-style picker with `scroll-snap-type: y mandatory`, 220px tall, masked top and bottom by linear-gradient mask images (`-webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 28%, #000 72%, transparent 100%)`). Items are 44px tall (the touch floor). Centred item is the selected slot. The mask is the affordance; no separate selection ring needed.
- **Progress Step** (`bpstep`): a 26px-circle dot (1px border, no fill at default; paper-strong fill when active; rgba(255,255,255,0.2) fill when done) above a tracked 0.7rem uppercase label. The circle changes, the label changes colour, the spacing stays.

### Navigation

- **Top Nav**: fixed, full-width, `padding: 0.85rem 3rem 0.85rem 1.2rem`. Initial state is `rgba(10,10,10,0.35)` with `backdrop-filter: blur(10px)` (one of the three sanctioned blur uses). Scrolled state collapses to `rgba(10,10,10,0.96)` and removes the blur. Logo icon scales to `0.68` when scrolled - a subtle tightening, not a vanish.
- **Nav Links**: `font-size: 0.72rem`, `letter-spacing: 0.20em`, uppercase, default colour `oklch(78% 0.006 40)` (a warm grey on dark). Active link gets a 3px dot indicator below the text, centred. Hover swaps to paper-strong.
- **Lang Switch**: PL/EN buttons with a single hairline separator. Touch targets ≥36px on coarse pointers.

### Signature Components

Three custom patterns earn documentation because they carry the brand.

1. **Lang Splash** (`#lang-splash`): a full-viewport diagonal split (clip-path polygons), dark on the left, light on the right, with the Off Cut wordmark centred and applying `mix-blend-mode: difference` so it auto-inverts across the seam. On phones the split rotates to horizontal. The split-and-crash exit animation is the only place in the system that uses rotate transforms on logos. Mandatory on every visit; never gated on stored preference (per user feedback memory).
2. **Marquee** (`marquee-section`): horizontal scroller with Bebas Neue 0.95rem items, 0.30em tracked, paired with 3px dot separators. 16s linear loop, `transform: translateX(0 → -50%)`. Bordered top and bottom with 0.5px hairlines on `#e0ddd6`. Reads as a workshop banner, not a ticker.
3. **Reviews Brick Wall**: column-major bottom-up brick-drop on viewport reveal, `--step: 70ms` per cell, `--fall-duration: 0.7s`. Decorative background only - `pointer-events: none`. The centred overlay carries the title, the 5.0 score, and the only clickable affordances. The grid resizes responsively via `ResizeObserver`-backed `useGridDims`.
4. **Scissors Cut Transition** (`scissors-overlay`): a horizontal scissors-mover crosses the viewport while a hairline rule draws underneath it (`scaleX(0) → 1` over 0.88s). Used as a page transition between routes. The blades open and close on a 0.22s loop. This is the system's signature motion; nothing else is allowed to move scissors.
5. **Hero Vertical Year** (`hero-year`): `writing-mode: vertical-rl`, `letter-spacing: 0.30em`, "EST. 2019 - PREMIUM GROOMING". Reads as a workshop nameplate fixed to the wall.

## 6. Do's and Don'ts

### Do:

- **Do** keep `border-radius: 0` as the system default. Circles (avatars, dots, status, the calendar day) are the only sanctioned exception.
- **Do** use 0.5px borders for hairline rules. Use 1px only when the rule must read as deliberate weight (selected booking-barber-card, hero-rule) and 2px only for the hero accent rule.
- **Do** scale letter-spacing inversely with font size. Smaller text gets wider tracking (0.30em+ for ≤0.70rem labels).
- **Do** use Bebas Neue for display, titles, and prices only. Inter does paragraphs.
- **Do** treat Off Cut Orange (`#E85A2A`) as a foreman's pencil mark. ≤8% of any visible surface.
- **Do** tint every neutral toward the warm hue (oklch chroma 0.005–0.01 at hue 40°). Pure greys are forbidden.
- **Do** ease motion with `cubic-bezier(0.16, 1, 0.3, 1)` (the system's `--ease-out-expo`) for entrances, reveals, and slide-ups. Use `cubic-bezier(0.165, 0.84, 0.44, 1)` (`--ease-out-quart`) for state transitions.
- **Do** test type and rhythm in both Polish and English. They are first-class siblings; neither is a translation of the other.
- **Do** label content with section numbers (`01 / USŁUGI`, `04 / OPINIE`). Workshop tagging is the brand.
- **Do** hold to WCAG 2.2 AA: 4.5:1 text, 3:1 UI, visible focus rings, full keyboard nav, `prefers-reduced-motion` respected on every animation.

### Don't:

- **Don't** use `border-radius` greater than 0 except for explicitly circular elements. No "subtle 4px radius" anywhere. No "softened corners". No pill chips.
- **Don't** use `#000` or `#fff` as a surface, ever. The two pure-white exceptions are review-card and one specific hero text-stroke; they are named, they are not generalisable.
- **Don't** apply Off Cut Orange to anything that is not a primary action, a booking selection, or the hero accent rule. No orange links, no orange hover states, no orange text emphasis. The accent is rare or it is dead.
- **Don't** use `border-left` or `border-right` greater than 1px as a coloured stripe on cards, list items, or callouts. Side-stripe borders are forbidden in this system regardless of context.
- **Don't** use gradient text (`background-clip: text`). Off Cut never reaches for gradient text. Emphasis comes from weight, scale, or letter-spacing, never from a gradient.
- **Don't** add glassmorphism beyond the three sanctioned uses (top nav, scroll-to-top, dark service cards). New `backdrop-filter` decorations require a deliberate review against this rule.
- **Don't** reach for `box-shadow` to imply elevation. The system is flat. Hover changes tint, not depth.
- **Don't** introduce new fonts. Bebas Neue + Inter + Let Me Ride is the complete vocabulary. No Cormorant, no Playfair, no display serifs, no monospace as decoration.
- **Don't** use bouncy or elastic easings. Exponential ease-out only. No `cubic-bezier(0.68, -0.55, 0.265, 1.55)`, no `ease-in-out` overshoot.
- **Don't** lay out identical icon-and-text card grids that repeat without rhythm. The services grid earns its repetition through dense metadata (number, name, description, barber stack, duration, price); a sparser grid would read as SaaS template.
- **Don't** perform heritage. No "Established 1872" lockups when the shop opened in 2019. No sepia. No crossed scissors logos. No faux-distressed paper textures. No woodgrain. No handlebar-mustache stock photography.
- **Don't** import salon codes. No script display fonts. No floral curls. No soft-pink accents. No candle-warm gradients. The visual register is barbershop-workshop, not salon-parlour.
- **Don't** drift toward generic chain-barbershop dark-grey-with-gold gloss. If a colour change makes the palette read as "anonymous masculine-luxe", undo it.
- **Don't** import SaaS landing tropes. No gradient hero blob, no hero-metric template (big number + small label + supporting stat), no spot illustrations, no "trusted by 10,000+ men" social-proof bars, no identical icon-card grids.
- **Don't** use em dashes or `--`. Use commas, colons, semicolons, periods, or parentheses.
