import { useState } from 'react';
import { useT } from '../context/LangContext';
import { useRouter } from '../context/RouterContext';

export default function CookieBanner() {
  const [visible, setVisible] = useState(() => !localStorage.getItem('offcut-consent'));
  const { navigate } = useRouter();

  if (!visible) return null;

  function accept() {
    localStorage.setItem('offcut-consent', 'accepted');
    setVisible(false);
  }

  function decline() {
    localStorage.setItem('offcut-consent', 'declined');
    setVisible(false);
  }

  return (
    <div className="cookie-banner">
      <p className="cookie-banner-text">
        {useT(
          'Używamy niezbędnych plików cookie do poprawnego działania strony.',
          'We use essential cookies to keep this site running.'
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
