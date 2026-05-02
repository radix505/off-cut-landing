import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { useT, useLang } from '../context/LangContext';
import { useRouter } from '../context/RouterContext';
import { useIsDark } from '../hooks/useIsDark';

const content = {
  pl: {
    eyebrow: 'Off Cut — Barbershop',
    title: 'Polityka prywatności',
    updated: 'Ostatnia aktualizacja: 1 maja 2025',
    sections: [
      {
        heading: '1. Administrator danych',
        body: `Administratorem Twoich danych osobowych jest Off Cut Barbershop, ul. Bolesława Krzywoustego 27 U4, 70-316 Szczecin, e-mail: offcutszczecin@gmail.com (dalej: „Administrator").`,
      },
      {
        heading: '2. Jakie dane zbieramy',
        body: `W ramach korzystania z formularza rezerwacji online zbieramy następujące dane:\n• imię i nazwisko,\n• numer telefonu.\n\nDane te są niezbędne wyłącznie do potwierdzenia i realizacji wizyty. Nie zbieramy adresów e-mail, danych płatniczych ani żadnych danych wrażliwych.`,
      },
      {
        heading: '3. Cel i podstawa prawna przetwarzania',
        body: `Twoje dane przetwarzamy w celu:\n• realizacji rezerwacji wizyty — podstawa prawna: art. 6 ust. 1 lit. b RODO (wykonanie umowy),\n• kontaktu w celu potwierdzenia lub zmiany wizyty — podstawa prawna: art. 6 ust. 1 lit. b RODO,\n• ewentualnego dochodzenia roszczeń — podstawa prawna: art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes Administratora).`,
      },
      {
        heading: '4. Okres przechowywania danych',
        body: `Dane przechowujemy przez okres niezbędny do realizacji wizyty, a następnie przez czas wynikający z przepisów prawa (co do zasady do 3 lat ze względu na możliwe roszczenia cywilne). Po upływie tego okresu dane są trwale usuwane.`,
      },
      {
        heading: '5. Odbiorcy danych',
        body: `Twoje dane nie są sprzedawane ani udostępniane podmiotom trzecim w celach marketingowych. Mogą być przekazywane wyłącznie podmiotom świadczącym usługi techniczne niezbędne do działania strony (hosting, serwer aplikacji) — wyłącznie w zakresie koniecznym i na podstawie umów powierzenia przetwarzania danych.`,
      },
      {
        heading: '6. Twoje prawa',
        body: `Na podstawie RODO przysługują Ci następujące prawa:\n• prawo dostępu do danych,\n• prawo do sprostowania danych,\n• prawo do usunięcia danych („prawo do bycia zapomnianym"),\n• prawo do ograniczenia przetwarzania,\n• prawo do przenoszenia danych,\n• prawo do wniesienia sprzeciwu wobec przetwarzania,\n• prawo do wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa).\n\nAby skorzystać z powyższych praw, skontaktuj się z nami: offcutszczecin@gmail.com.`,
      },
      {
        heading: '7. Bezpieczeństwo danych',
        body: `Stosujemy odpowiednie środki techniczne i organizacyjne w celu ochrony Twoich danych przed nieuprawnionym dostępem, utratą lub zniszczeniem. Dane rezerwacji przechowywane są na zabezpieczonym serwerze.`,
      },
      {
        heading: '8. Zmiany polityki prywatności',
        body: `Zastrzegamy sobie prawo do zmiany niniejszej polityki. O wszelkich istotnych zmianach poinformujemy poprzez aktualizację daty na górze dokumentu. Zachęcamy do regularnego zapoznawania się z jego treścią.`,
      },
    ],
  },
  en: {
    eyebrow: 'Off Cut — Barbershop',
    title: 'Privacy Policy',
    updated: 'Last updated: 1 May 2025',
    sections: [
      {
        heading: '1. Data Controller',
        body: `The controller of your personal data is Off Cut Barbershop, ul. Bolesława Krzywoustego 27 U4, 70-316 Szczecin, Poland. Email: offcutszczecin@gmail.com (hereinafter: "Controller").`,
      },
      {
        heading: '2. What data we collect',
        body: `When you use our online booking form, we collect the following data:\n• full name,\n• phone number.\n\nThis information is used solely to confirm and fulfil your appointment. We do not collect email addresses, payment data, or any sensitive personal data.`,
      },
      {
        heading: '3. Purpose and legal basis',
        body: `We process your data for the following purposes:\n• to process your appointment booking — legal basis: Art. 6(1)(b) GDPR (performance of a contract),\n• to contact you to confirm or reschedule your visit — legal basis: Art. 6(1)(b) GDPR,\n• to pursue or defend legal claims where necessary — legal basis: Art. 6(1)(f) GDPR (legitimate interest).`,
      },
      {
        heading: '4. Data retention',
        body: `We retain your data for the period necessary to fulfil the appointment, and thereafter for the period required by applicable law (generally up to 3 years in connection with potential civil claims). After this period, your data is permanently deleted.`,
      },
      {
        heading: '5. Data recipients',
        body: `Your data is not sold or shared with third parties for marketing purposes. It may be shared only with technical service providers necessary for the operation of this website (hosting, application server) — solely to the extent necessary and under data processing agreements.`,
      },
      {
        heading: '6. Your rights',
        body: `Under the GDPR, you have the following rights:\n• right of access to your data,\n• right to rectification,\n• right to erasure ("right to be forgotten"),\n• right to restriction of processing,\n• right to data portability,\n• right to object to processing,\n• right to lodge a complaint with a supervisory authority.\n\nTo exercise any of these rights, contact us at: offcutszczecin@gmail.com.`,
      },
      {
        heading: '7. Data security',
        body: `We apply appropriate technical and organisational measures to protect your data against unauthorised access, loss, or destruction. Booking data is stored on a secured server.`,
      },
      {
        heading: '8. Changes to this policy',
        body: `We reserve the right to update this policy. Any significant changes will be communicated by updating the date at the top of this document. We encourage you to review it periodically.`,
      },
    ],
  },
};

export default function PrivacyPage() {
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
