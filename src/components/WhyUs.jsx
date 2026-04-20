import { useT } from '../context/LangContext';
import { useReveal } from '../hooks/useReveal';

const stats = [
  { num: '7+',  labelPL: 'lat rzemiosła',          labelEN: 'years of craft',          delay: 1 },
  { num: '12K', labelPL: 'wykonanych strzyżeń',    labelEN: 'cuts delivered',          delay: 2 },
  { num: '4.9★', labelPL: 'średnia ocena Google',  labelEN: 'average Google rating',   delay: 3 },
  { num: '60s', labelPL: 'rezerwacja online',       labelEN: 'online booking',          delay: 3 },
];

export default function WhyUs() {
  const ref = useReveal();
  return (
    <section id="why" className="why-section" ref={ref}>
      <div className="why-grid">
        {stats.map((s) => (
          <div key={s.num} className={`why-item reveal reveal-delay-${s.delay}`}>
            <div className="why-num">{s.num}</div>
            <div className="why-label">{useT(s.labelPL, s.labelEN)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
