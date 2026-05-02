import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { useT, useLang } from '../context/LangContext';
import { useRouter } from '../context/RouterContext';
import { useIsDark } from '../hooks/useIsDark';

const content = {
  pl: {
    eyebrow: 'Off Cut — Barbershop',
    title: 'Polityka cookies',
    updated: 'Ostatnia aktualizacja: 1 maja 2025',
    sections: [
      {
        heading: '1. Czym są pliki cookie?',
        body: `Pliki cookie (ciasteczka) to małe pliki tekstowe zapisywane na Twoim urządzeniu (komputerze, smartfonie, tablecie) podczas odwiedzania stron internetowych. Umożliwiają one zapamiętywanie Twoich preferencji i poprawiają działanie serwisu.`,
      },
      {
        heading: '2. Jakie pliki cookie stosujemy?',
        body: `Na naszej stronie używamy wyłącznie niezbędnych plików cookie (sesyjnych), które służą do:\n• zapamiętania wybranego języka strony (PL / EN),\n• prawidłowego działania formularza rezerwacji,\n• zapewnienia bezpieczeństwa sesji użytkownika.\n\nNie stosujemy plików cookie analitycznych, marketingowych ani śledzących. Nie korzystamy z narzędzi takich jak Google Analytics, Meta Pixel ani żadnych systemów remarketingowych.`,
      },
      {
        heading: '3. Czas przechowywania',
        body: `Pliki cookie niezbędne (sesyjne) są usuwane automatycznie po zakończeniu sesji przeglądarki lub w ciągu 24 godzin. Plik cookie przechowujący wybór języka wygasa po 365 dniach.`,
      },
      {
        heading: '4. Zarządzanie plikami cookie',
        body: `Możesz w dowolnym momencie zarządzać plikami cookie za pomocą ustawień swojej przeglądarki. Poniżej znajdziesz instrukcje dla najpopularniejszych przeglądarek:\n• Chrome: Ustawienia → Prywatność i bezpieczeństwo → Pliki cookie\n• Firefox: Opcje → Prywatność i bezpieczeństwo → Ciasteczka\n• Safari: Preferencje → Prywatność\n• Edge: Ustawienia → Prywatność, wyszukiwanie i usługi\n\nZwróć uwagę, że wyłączenie niezbędnych plików cookie może uniemożliwić prawidłowe działanie strony, w tym systemu rezerwacji.`,
      },
      {
        heading: '5. Zgoda na pliki cookie',
        body: `Korzystanie z naszej strony internetowej jest równoznaczne z wyrażeniem zgody na stosowanie niezbędnych plików cookie opisanych w niniejszej polityce. Nie wymagamy odrębnej zgody na pliki cookie niezbędne — są one konieczne do działania serwisu.`,
      },
      {
        heading: '6. Zmiany polityki',
        body: `Zastrzegamy sobie prawo do aktualizacji niniejszej polityki. Wszelkie zmiany będą publikowane na tej stronie z nową datą aktualizacji. Zachęcamy do regularnego zapoznawania się z treścią dokumentu.`,
      },
      {
        heading: '7. Kontakt',
        body: `W razie pytań dotyczących polityki cookies skontaktuj się z nami:\nOff Cut Barbershop\nul. Bolesława Krzywoustego 27 U4, 70-316 Szczecin\noffcutszczecin@gmail.com`,
      },
    ],
  },
  en: {
    eyebrow: 'Off Cut — Barbershop',
    title: 'Cookie Policy',
    updated: 'Last updated: 1 May 2025',
    sections: [
      {
        heading: '1. What are cookies?',
        body: `Cookies are small text files stored on your device (computer, smartphone, tablet) when you visit websites. They allow the site to remember your preferences and improve its functionality.`,
      },
      {
        heading: '2. What cookies do we use?',
        body: `We use only strictly necessary (session) cookies, which serve to:\n• remember your chosen language preference (PL / EN),\n• ensure the booking form works correctly,\n• maintain the security of your session.\n\nWe do not use analytics, marketing, or tracking cookies. We do not use tools such as Google Analytics, Meta Pixel, or any remarketing systems.`,
      },
      {
        heading: '3. Storage duration',
        body: `Necessary session cookies are deleted automatically when you close your browser or within 24 hours. The cookie storing your language preference expires after 365 days.`,
      },
      {
        heading: '4. Managing cookies',
        body: `You can manage or delete cookies at any time through your browser settings. Instructions for the most popular browsers:\n• Chrome: Settings → Privacy and security → Cookies\n• Firefox: Options → Privacy & Security → Cookies\n• Safari: Preferences → Privacy\n• Edge: Settings → Privacy, search and services\n\nPlease note that disabling necessary cookies may prevent the website and booking system from functioning correctly.`,
      },
      {
        heading: '5. Consent',
        body: `By using our website, you agree to the use of the necessary cookies described in this policy. We do not require separate consent for strictly necessary cookies as they are essential for the site to function.`,
      },
      {
        heading: '6. Policy updates',
        body: `We reserve the right to update this policy. Any changes will be published on this page with a new update date. We encourage you to review this document periodically.`,
      },
      {
        heading: '7. Contact',
        body: `If you have any questions about this cookie policy, please contact us:\nOff Cut Barbershop\nul. Bolesława Krzywoustego 27 U4, 70-316 Szczecin, Poland\noffcutszczecin@gmail.com`,
      },
    ],
  },
};

export default function CookiesPage() {
  const { lang } = useLang();
  const { navigate } = useRouter();
  const isDark = useIsDark();
  const btnStyle = isDark
    ? { background: 'rgba(255,255,255,0.13)', borderColor: 'rgba(255,255,255,0.35)', color: '#fff' }
    : {};
  const c = content[lang];

  return (
    <>
      <Nav />
      <div className="prices-page-hero legal-hero">
        <div className="blog-page-eyebrow">{c.eyebrow}</div>
        <h1 className="blog-page-title">{c.title}</h1>
        <p className="blog-page-sub legal-updated">{c.updated}</p>
      </div>
      <section className="legal-section">
        <div className="legal-content">
          {c.sections.map(s => (
            <div key={s.heading} className="legal-block">
              <h2 className="legal-heading">{s.heading}</h2>
              <div className="legal-body">
                {s.body.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
      <button
        className="prices-back-circle-btn"
        style={btnStyle}
        onClick={() => navigate('/')}
        aria-label={useT('Powrót', 'Back')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
    </>
  );
}
