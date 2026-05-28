# Product

## Register

brand

## Users

Men in Szczecin and visitors passing through, roughly mid-twenties to mid-forties, who treat grooming as a deliberate act rather than a chore. Two primary contexts:

1. **First-time visitor** - found Off Cut via Google, Instagram, word of mouth, or while walking past. They are weighing whether the place is for them. They scan, judge by atmosphere, and either book or leave within seconds.
2. **Returning regular** - already convinced. They open the site to rebook with a known barber and want the path back to be short. The hero's "book again with [barber]" affordance exists for them.

The audience is bilingual by default. Polish locals expect Polish copy that does not read as translated. English-speaking visitors (transit, expats, tourists) expect parity, not a token toggle.

## Product Purpose

Off Cut is a barbershop in Szczecin. The site is its digital front door. It exists to do two things at once:

1. **Convert** the right visitor into a booking. The booking flow is embedded; "book" is the dominant action across every section.
2. **Carry the brand**. The site is the longest, most controlled brand exposure most visitors will have before stepping through the actual door. It must read the way the room reads: workshop, not parlour. Premium without varnish.

Success is a booked appointment from someone who would have walked in anyway, plus a booked appointment from someone who had not heard of Off Cut three minutes ago, plus a regular who never has to think about how to come back.

## Brand Personality

**Sharp. Confident. Raw.**

The voice cuts past niceties. It does not announce its premiumness; it demonstrates restraint and lets the visitor draw the conclusion. Copy is short, declarative, occasionally bilingual-bicultural (Polish and English share weight, neither reads as a translation of the other). The interface should feel like a workshop translated into pixels: honest materials, visible hardware, tight rules, no decorative apology.

Adjacent sensibilities to borrow from:

- **Carhartt WIP and heritage workwear.** Industrial restraint, tags-and-numbers detailing, no stylistic apology, materials that earn their patina.
- **Aesop and Le Labo and atelier brands.** Apothecary-precise typography, monospaced labels where they earn it, wide tracking on small caps, paper-and-ink restraint, every element looks weighed.

The combination matters more than either alone: workshop confidence with atelier discipline. Off Cut is not Carhartt; it is not Aesop; it is what happens when a barbershop adopts both their seriousness about craft.

## Anti-references

The following must be refused on sight. If a design choice could be mistaken for any of these, it is wrong and must be redrawn.

- **Vintage barber clichés.** Crossed-scissors and razor logos. Sepia tones. Faux-distressed paper textures. Handlebar-mustache stock photography. Wood-grain backgrounds. "Since 18-something" lockups when the shop opened in 2019. Anything that performs heritage rather than earning it.
- **Generic chain barbershop.** The interchangeable masculine-luxe look every Polish barber chain settles into: dark-grey hero, gold accent, anonymous black-and-white portraiture, gradient-overlaid stock photography. The brief is to be unmistakeable, not safe.
- **Salon and unisex parlour codes.** Soft pinks, script display fonts, ornate floral curls, beauty-salon photography, candle-warm gradients, anything reading feminine-spa. Off Cut has women on staff and welcomes any client, but the visual register is deliberately barbershop, not salon.
- **SaaS landing template.** Gradient hero blob. Identical icon-and-card grids of services. The hero-metric template (big number, small label, gradient accent). Spot illustrations. "Trusted by 10,000+ men" social-proof bars. Generic startup language disguised as a service business.

## Design Principles

1. **Workshop, not parlour.** The site is a place a person walks into, not a brand glossy. Visible rules, hardware, numbers, and materials beat decoration. When a choice is between an ornament and a missing element, leave the missing element.
2. **Craft speaks louder than copy.** Let the work, the room, the precision of the type and spacing do the persuading. Avoid claims the design itself does not back up. If we have to say "premium", we have already lost.
3. **Restraint signals confidence.** One accent, deliberate whitespace, fewer elements doing more work. Adding is the lazy answer; removing usually wins. Density is fine when it earns its weight; sprawl is not.
4. **Both languages are first-class.** Polish and English are equal citizens. Neither reads as a translation of the other. Type, rhythm, and copy length are tested in both. The lang splash is a brand moment, not a setting.
5. **Reward the regular.** The design assumes return. The rebook path is short, recognised, and earned. New visitors are convinced; existing visitors are respected.

## Accessibility & Inclusion

Target: **WCAG 2.2 AA**.

Concrete commitments:

- Text contrast minimum 4.5:1 against its background. UI controls minimum 3:1. The orange accent passes AA on the dark hero but is verified per use; it is not assumed safe on every surface.
- Full keyboard navigation across the site, including the booking flow. Visible focus states are part of the design language, not an accessibility afterthought.
- `prefers-reduced-motion` respected. The brick-fall reviews animation, the marquee, the scissor scroll transitions all degrade gracefully.
- No information conveyed by colour alone. Stars, status, selection, and validation use shape and text in addition to colour.
- Touch targets meet the 44px minimum (already encoded as `--touch-min`).
- Bilingual support (PL/EN) is treated as accessibility, not feature. Language switching does not lose state.
