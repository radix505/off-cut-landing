import { useEffect, useRef } from 'react';
import { useRouter } from '../context/RouterContext';
import { trackPageview } from '../lib/analytics';

// Fires a `page_view` dataLayer event on every navigation handled by
// RouterContext (the custom pushState router). The initial mount counts too
// — for GTM to register the very first landing, the GA4 Config tag should
// not have its own `send_page_view` flag set; we own the pageviews.
//
// Drop it once inside any component below RouterProvider (App.jsx mounts it).
export function useAnalyticsPageview() {
  const { page, crewSlug } = useRouter();
  // The router updates `page` slightly after `window.history.pushState`
  // (450 ms `setTimeout` for the cut transition). By the time this effect
  // runs the URL has already been updated, so reading window.location is
  // safe and gives the canonical path.
  const prevKey = useRef(null);
  useEffect(() => {
    const key = `${page}|${crewSlug ?? ''}`;
    if (prevKey.current === key) return;
    prevKey.current = key;
    const path = typeof window !== 'undefined' ? window.location.pathname : '/';
    const title = typeof document !== 'undefined' ? document.title : '';
    trackPageview(path, title);
  }, [page, crewSlug]);
}
