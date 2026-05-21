import { useEffect, useState } from 'react';
import { useT } from '../context/LangContext';
import { useRouter } from '../context/RouterContext';
import { updateConsent } from '../lib/analytics';

export default function CookieBanner() {
  const [visible, setVisible] = useState(() => !localStorage.getItem('offcut-consent'));
  const { navigate } = useRouter();

  useEffect(() => {
    if (visible) {
      document.body.classList.add('cookie-open');
      return () => document.body.classList.remove('cookie-open');
    }
  }, [visible]);

  if (!visible) return null;

  function accept() {
    localStorage.setItem('offcut-consent', 'accepted');
    updateConsent(true);
    setVisible(false);
  }

  function decline() {
    localStorage.setItem('offcut-consent', 'declined');
    updateConsent(false);
    setVisible(false);
  }

  return (
    <div className="cookie-banner">
      <p className="cookie-banner-text">
        {useT(
          'Używamy plików cookie do działania strony i — za Twoją zgodą — do anonimowej statystyki ruchu (Google Analytics).',
          'We use cookies to keep this site running and — with your consent — for anonymous traffic analytics (Google Analytics).',
        )}{' '}
        <button className="cookie-banner-link" onClick={() => navigate('/cookies')}>
          {useT('Dowiedz się więcej', 'Learn more')}
        </button>
      </p>
      <div className="cookie-banner-actions">
        <button className="cookie-banner-decline" onClick={decline}>
          {useT('Odrzuć', 'Decline')}
        </button>
        <button className="cookie-banner-accept" onClick={accept}>
          {useT('Akceptuję', 'Accept')}
        </button>
      </div>
    </div>
  );
}
