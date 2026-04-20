import { useT } from '../context/LangContext';
import { useReveal } from '../hooks/useReveal';

const faqs = [
  {
    qPL: 'Ile trwa wizyta?',
    qEN: 'How long does an appointment take?',
    aPL: 'Klasyczne strzyżenie — 45 min. Fade lub broda — 50 min. Pełny pakiet (strzyżenie + broda) — 75 min. Zawsze rezerwujemy pełny slot, bez pośpiechu.',
    aEN: 'Classic cut — 45 min. Fade or beard — 50 min. Full package (cut + beard) — 75 min. We always reserve the full slot — never rushed.',
  },
  {
    qPL: 'Czy przyjmujecie bez rezerwacji (walk-in)?',
    qEN: 'Do you accept walk-ins?',
    aPL: 'Tak, jeśli mamy wolne miejsce. Aby mieć pewność, że trafisz do wybranego barbera, rezerwuj z wyprzedzeniem — najlepiej online.',
    aEN: "Yes, whenever we have a free chair. To guarantee your preferred barber, book ahead — online is fastest.",
  },
  {
    qPL: 'Czy mogę przyjść z dzieckiem?',
    qEN: 'Can I bring my child?',
    aPL: 'Oczywiście. Oferujemy Strzyżenie Junior (30 min, 60 PLN). Tomás i Daniel mają duże doświadczenie z najmłodszymi klientami.',
    aEN: 'Absolutely. We offer a Junior Cut (30 min, 60 PLN). Tomás and Daniel have deep experience with young clients.',
  },
  {
    qPL: 'Jakie są formy płatności?',
    qEN: 'What payment methods do you accept?',
    aPL: 'Karta (Visa / Mastercard / BLIK), Apple Pay, Google Pay, gotówka. Nie pobieramy opłat za kartę.',
    aEN: 'Card (Visa / Mastercard / BLIK), Apple Pay, Google Pay, cash. No card surcharges.',
  },
  {
    qPL: 'Czy mogę odwołać lub zmienić termin?',
    qEN: 'Can I cancel or reschedule?',
    aPL: 'Tak — bezpłatnie, jeśli dasz nam znać co najmniej 2 godziny przed wizytą. Wystarczy telefon lub wiadomość na Instagram.',
    aEN: 'Yes — free of charge if you let us know at least 2 hours before your slot. A phone call or Instagram DM is enough.',
  },
];

export default function FAQ() {
  const ref = useReveal();
  return (
    <section id="faq" className="faq-section" ref={ref}>
      <div className="section-header">
        <div>
          <div className="section-number">FAQ</div>
          <div className="section-title">{useT('Częste pytania', 'Common questions')}</div>
        </div>
      </div>
      <div className="faq-list reveal">
        {faqs.map((f, i) => (
          <details key={i} className="faq-item">
            <summary className="faq-q">{useT(f.qPL, f.qEN)}</summary>
            <div className="faq-a">{useT(f.aPL, f.aEN)}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
