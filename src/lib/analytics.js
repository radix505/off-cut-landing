// Thin wrapper around the GTM dataLayer. All analytics calls flow through
// here so the rest of the app never touches `window.dataLayer` directly.
//
// GTM itself is injected by the inline scripts in index.html (gated on the
// Vite-time `%VITE_GTM_ID%` placeholder). Consent Mode v2 is defaulted to
// `denied` inline before GTM loads — see <head> of index.html.
//
// Consumers:
//   - CookieBanner.jsx → updateConsent('granted' | 'denied') on accept/decline
//   - useAnalyticsPageview hook → trackPageview(path, title) on route change
//   - Booking.jsx → trackEvent('booking_submitted', {...}) after successful POST

const CONSENT_KEYS = [
  'ad_storage',
  'analytics_storage',
  'ad_user_data',
  'ad_personalization',
];

function pushToDataLayer(payload) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

function gtag(...args) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  // GTM looks for `arguments` literal pushed onto the dataLayer; an array
  // spread normalises identically (the inline gtag() in index.html does the
  // same thing).
  window.dataLayer.push(args);
}

// Called by the cookie banner after the user makes a choice. Maps a simple
// boolean (consented to analytics + ads) onto all four GA4-required signals.
export function updateConsent(granted) {
  const value = granted ? 'granted' : 'denied';
  const update = {};
  for (const key of CONSENT_KEYS) update[key] = value;
  gtag('consent', 'update', update);
}

export function trackPageview(path, title) {
  pushToDataLayer({
    event: 'page_view',
    page_path: path,
    page_title: title,
    page_location: typeof window !== 'undefined' ? window.location.href : path,
  });
}

export function trackEvent(name, params = {}) {
  pushToDataLayer({ event: name, ...params });
}
