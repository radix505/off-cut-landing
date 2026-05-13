import { useEffect, useId, useRef, useCallback } from 'react';

const ITEM_HEIGHT = 44;
const VISIBLE_ROWS = 5;
const PADDING_ROWS = (VISIBLE_ROWS - 1) / 2;

export default function BookingTimeWheel({
  slots,
  unavailable,
  value,
  onChange,
  loading = false,
  lang = 'pl',
}) {
  const scrollerRef = useRef(null);
  const rafRef = useRef(0);
  const userScrollingRef = useRef(false);
  const userScrollTimerRef = useRef(0);
  const lastReportedRef = useRef(value);
  const idBase = useId();

  const indexOf = useCallback((s) => slots.indexOf(s), [slots]);

  const scrollToIndex = useCallback((idx, smooth = true) => {
    const el = scrollerRef.current;
    if (!el || idx < 0) return;
    el.scrollTo({ top: idx * ITEM_HEIGHT, behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  // Pre-select first available when slots change (date change / availability load)
  useEffect(() => {
    if (!slots.length) return;
    const valueIdx = value ? indexOf(value) : -1;
    const valueIsValid = valueIdx >= 0 && !unavailable.has(value);
    if (valueIsValid) {
      scrollToIndex(valueIdx, false);
      return;
    }
    const firstFree = slots.findIndex((s) => !unavailable.has(s));
    if (firstFree === -1) {
      if (value !== null) {
        lastReportedRef.current = null;
        onChange(null);
      }
      return;
    }
    scrollToIndex(firstFree, false);
    lastReportedRef.current = slots[firstFree];
    onChange(slots[firstFree]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots, unavailable]);

  // Sync wheel position when value changes externally (and user isn't scrolling)
  useEffect(() => {
    if (userScrollingRef.current) return;
    if (!value) return;
    const idx = indexOf(value);
    if (idx < 0) return;
    const el = scrollerRef.current;
    if (!el) return;
    const currentIdx = Math.round(el.scrollTop / ITEM_HEIGHT);
    if (currentIdx !== idx) scrollToIndex(idx, true);
  }, [value, indexOf, scrollToIndex]);

  const handleScroll = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const el = scrollerRef.current;
      if (!el || !slots.length) return;
      const idx = Math.max(0, Math.min(slots.length - 1, Math.round(el.scrollTop / ITEM_HEIGHT)));
      const next = slots[idx];
      if (next && next !== lastReportedRef.current) {
        lastReportedRef.current = next;
        onChange(next);
      }
    });
  };

  const markUserScrolling = () => {
    userScrollingRef.current = true;
    if (userScrollTimerRef.current) clearTimeout(userScrollTimerRef.current);
    userScrollTimerRef.current = setTimeout(() => {
      userScrollingRef.current = false;
    }, 250);
  };

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (userScrollTimerRef.current) clearTimeout(userScrollTimerRef.current);
  }, []);

  const onItemClick = (idx) => () => scrollToIndex(idx, true);

  const onKeyDown = (e) => {
    if (!slots.length) return;
    const el = scrollerRef.current;
    if (!el) return;
    const cur = Math.round(el.scrollTop / ITEM_HEIGHT);
    let next = cur;
    if (e.key === 'ArrowDown') next = Math.min(slots.length - 1, cur + 1);
    else if (e.key === 'ArrowUp') next = Math.max(0, cur - 1);
    else if (e.key === 'PageDown') next = Math.min(slots.length - 1, cur + 5);
    else if (e.key === 'PageUp') next = Math.max(0, cur - 5);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = slots.length - 1;
    else return;
    e.preventDefault();
    markUserScrolling();
    scrollToIndex(next, true);
  };

  const ariaLabel = lang === 'pl' ? 'Wybór godziny' : 'Choose time';

  if (!slots.length) {
    return (
      <div className="btime-wheel-empty">
        {lang === 'pl' ? 'Brak godzin tego dnia' : 'No times this day'}
      </div>
    );
  }

  const allBooked = slots.every((s) => unavailable.has(s));
  const centerIdx = value ? Math.max(0, indexOf(value)) : 0;

  return (
    <div className={`btime-wheel${loading ? ' btime-wheel-loading' : ''}`}>
      <div className="btime-wheel-band" aria-hidden="true" />
      <div
        ref={scrollerRef}
        className="btime-wheel-scroller"
        role="listbox"
        aria-label={ariaLabel}
        aria-busy={loading || undefined}
        aria-activedescendant={`${idBase}-${centerIdx}`}
        tabIndex={0}
        onScroll={handleScroll}
        onPointerDown={markUserScrolling}
        onTouchStart={markUserScrolling}
        onWheel={markUserScrolling}
        onKeyDown={onKeyDown}
      >
        <div className="btime-wheel-track">
          {slots.map((s, i) => {
            const taken = unavailable.has(s);
            const selected = i === centerIdx;
            return (
              <button
                key={s}
                id={`${idBase}-${i}`}
                type="button"
                role="option"
                aria-selected={selected}
                aria-disabled={taken || undefined}
                className={
                  'btime-wheel-item' +
                  (selected ? ' is-selected' : '') +
                  (taken ? ' is-unavailable' : '')
                }
                onClick={onItemClick(i)}
                tabIndex={-1}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>
      {allBooked && (
        <div className="btime-wheel-allbooked" aria-live="polite">
          {lang === 'pl' ? 'Wszystkie godziny zajęte' : 'All times booked'}
        </div>
      )}
    </div>
  );
}
