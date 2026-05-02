import { useMemo } from 'react';
import { useLang } from '../context/LangContext';

const itemsPL = [
  { text: 'PRECYZYJNE STRZYŻENIE', accent: false },
  { text: 'GOLENIE BRZYTWĄ', accent: true },
  { text: 'RZEŹBIENIE BRODY', accent: false },
  { text: 'SKIN FADE', accent: true },
  { text: 'KLASYCZNY GROOMING', accent: false },
  { text: 'ZAŁ. 2019', accent: false },
  { text: 'PREMIUM RZEMIOSŁO', accent: true },
  { text: 'SZCZECIN', accent: false },
];

const itemsEN = [
  { text: 'PRECISION CUTS', accent: false },
  { text: 'HOT TOWEL SHAVE', accent: true },
  { text: 'BEARD SCULPTING', accent: false },
  { text: 'SKIN FADE', accent: true },
  { text: 'CLASSIC GROOMING', accent: false },
  { text: 'EST. 2019', accent: false },
  { text: 'PREMIUM CRAFT', accent: true },
  { text: 'SZCZECIN', accent: false },
];

export default function Marquee() {
  const { lang } = useLang();
  const items = useMemo(() => {
    const base = lang === 'pl' ? itemsPL : itemsEN;
    return [...base, ...base, ...base, ...base];
  }, [lang]);

  return (
    <div className="marquee-section">
      <div className="marquee-track">
        {items.map((item, i) => (
          <div key={i} className={`marquee-item${item.accent ? ' accent' : ''}`}>
            {item.text}<span className="dot" />
          </div>
        ))}
      </div>
    </div>
  );
}
