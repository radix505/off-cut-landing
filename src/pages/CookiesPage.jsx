import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { useT, useLang } from '../context/LangContext';
import { useRouter } from '../context/RouterContext';
import { useIsDark } from '../hooks/useIsDark';

const content = {
  pl: {
    eyebrow: 'Off Cut - Barbershop',
    title: 'Polityka cookies',
    updated: 'Ostatnia aktualizacja: 1 maja 2025',
    sections: [
      {
        heading: '1. Czym są pliki cookie?',
        body: `Pliki cookie (ciasteczka) to małe pliki tekstowe zapisywane na Twoim urządzeniu (komputerze, smartfonie, tablecie) podczas odwiedzania stron internetowych. Umożliwiają one zapamiętywanie Twoich preferencji i poprawiają działanie serwisu.`,
      },
      {
        heading: '2. Jakie pliki cookie stosujemy?',
        body: `Używamy dwóch kategorii plików cookie.\n\nNiezbędne (zawsze aktywne):\n• zapamiętanie wybranego języka strony (PL / EN),\n• prawidłowe działanie formularza rezerwacji,\n• zapewnienie bezpieczeństwa sesji,\n• zapamiętanie Twojej decyzji w bannerze cookie.\n\nAnalityczne (tylko po Twojej akceptacji w bannerze):\n• Google Analytics 4 - anonimowa statystyka ruchu (które strony są popularne, jak goście trafiają na naszą stronę).\n\nDopóki nie klikniesz „Akceptuję" w bannerze, żadne pliki analityczne się nie zapisują. Tryb Google Consent Mode v2 utrzymuje analytics_storage i ad_storage w stanie „denied" do momentu uzyskania Twojej zgody.\n\nNie stosujemy plików marketingowych ani remarketingowych. Nie używamy Meta Pixela.`,
      },
      {
        heading: '3. Czas przechowywania',
        body: `Niezbędne pliki sesyjne usuwane są automatycznie po zakończeniu sesji przeglądarki. Plik z wyborem języka wygasa po 365 dniach. Plik zapamiętujący Twój wybór w bannerze cookie utrzymuje się do czasu wyczyszczenia danych przeglądarki.\n\nPliki Google Analytics (_ga, _ga_*) wygasają po 2 latach od ostatniej wizyty i są zapisywane wyłącznie po Twojej akceptacji.`,
      },
      {
        heading: '4. Zarządzanie plikami cookie',
        body: `Możesz w dowolnym momencie zarządzać plikami cookie za pomocą ustawień swojej przeglądarki. Poniżej znajdziesz instrukcje dla najpopularniejszych przeglądarek:\n• Chrome: Ustawienia → Prywatność i bezpieczeństwo → Pliki cookie\n• Firefox: Opcje → Prywatność i bezpieczeństwo → Ciasteczka\n• Safari: Preferencje → Prywatność\n• Edge: Ustawienia → Prywatność, wyszukiwanie i usługi\n\nZwróć uwagę, że wyłączenie niezbędnych plików cookie może uniemożliwić prawidłowe działanie strony, w tym systemu rezerwacji.`,
      },
      {
        heading: '5. Zgoda na pliki cookie',
        body: `Pliki niezbędne instalujemy bez odrębnej zgody - są one konieczne do działania strony. Pliki analityczne (Google Analytics) instalujemy wyłącznie po Twojej wyraźnej akceptacji w bannerze cookie. Możesz cofnąć zgodę w dowolnym momencie usuwając dane przeglądarki dla tej domeny - banner pojawi się ponownie i pozwoli Ci wybrać inną opcję.`,
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
    eyebrow: 'Off Cut - Barbershop',
    title: 'Cookie Policy',
    updated: 'Last updated: 1 May 2025',
    sections: [
      {
        heading: '1. What are cookies?',
        body: `Cookies are small text files stored on your device (computer, smartphone, tablet) when you visit websites. They allow the site to remember your preferences and improve its functionality.`,
      },
      {
        heading: '2. What cookies do we use?',
        body: `We use two categories of cookies.\n\nStrictly necessary (always on):\n• remember your chosen language preference (PL / EN),\n• keep the booking form working,\n• maintain session security,\n• remember your choice in the cookie banner.\n\nAnalytics (only after you click Accept):\n• Google Analytics 4 - anonymous traffic statistics (which pages are popular, how visitors arrive).\n\nUntil you click "Accept" in the banner, no analytics cookies are written. Google Consent Mode v2 keeps analytics_storage and ad_storage in the "denied" state until you grant consent.\n\nWe do not use marketing or remarketing cookies. We do not use Meta Pixel.`,
      },
      {
        heading: '3. Storage duration',
        body: `Strictly necessary session cookies are deleted automatically when you close your browser. The language preference cookie expires after 365 days. The cookie storing your banner choice persists until you clear your browser data.\n\nGoogle Analytics cookies (_ga, _ga_*) expire 2 years after your last visit and are only written if you have given consent.`,
      },
      {
        heading: '4. Managing cookies',
        body: `You can manage or delete cookies at any time through your browser settings. Instructions for the most popular browsers:\n• Chrome: Settings → Privacy and security → Cookies\n• Firefox: Options → Privacy & Security → Cookies\n• Safari: Preferences → Privacy\n• Edge: Settings → Privacy, search and services\n\nPlease note that disabling necessary cookies may prevent the website and booking system from functioning correctly.`,
      },
      {
        heading: '5. Consent',
        body: `Strictly necessary cookies are installed without separate consent - they are essential for the site to function. Analytics cookies (Google Analytics) are only installed after you click Accept in the cookie banner. You can withdraw consent at any time by clearing your browser data for this domain - the banner will reappear and let you choose differently.`,
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
