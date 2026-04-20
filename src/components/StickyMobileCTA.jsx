import { useT } from '../context/LangContext';

export default function StickyMobileCTA() {
  return (
    <a className="sticky-cta" href="#booking">
      {useT('Zarezerwuj wizytę →', 'Book Appointment →')}
    </a>
  );
}
