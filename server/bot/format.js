const STATUS = {
  pending:   { emoji: '🕒', label: 'oczekuje' },
  confirmed: { emoji: '✅', label: 'potwierdzona' },
  cancelled: { emoji: '❌', label: 'anulowana' },
};

const DOW_PL = ['niedz', 'pon', 'wt', 'śr', 'czw', 'pt', 'sob'];
const MONTHS_PL = ['stycznia','lutego','marca','kwietnia','maja','czerwca',
  'lipca','sierpnia','września','października','listopada','grudnia'];
const MONTHS_PL_NOM = ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec',
  'Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
const DOW_PL_SHORT = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd']; // Mon-first ordering

export function escapeHtml(s) {
  return String(s ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
}

export function todayInWarsaw() {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Warsaw',
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
  return fmt.format(new Date());
}

export function addDaysIso(iso, days) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

export function isoToHumanPl(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dow = DOW_PL[dt.getUTCDay()];
  return `${dow}, ${d} ${MONTHS_PL[m - 1]} ${y}`;
}

export function formatStatus(status) {
  const s = STATUS[status] ?? { emoji: '•', label: status };
  return `${s.emoji} ${s.label}`;
}

function addMinutesToSlot(slot, minutes) {
  const [h, m] = slot.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

// Collapse runs of back-to-back blocks for the same barber into a single
// virtual entry with summed duration. Non-block items pass through untouched.
// The merged entry carries `_merged_count` (>1) so the renderer can suppress
// the per-block id (since multiple ids would have collapsed).
export function mergeAdjacentBlocks(items) {
  const byBarber = new Map();
  for (const b of items) {
    const key = b.barber_id ?? '_';
    if (!byBarber.has(key)) byBarber.set(key, []);
    byBarber.get(key).push(b);
  }
  const out = [];
  for (const group of byBarber.values()) {
    const sorted = [...group].sort((a, b) => a.slot.localeCompare(b.slot));
    let i = 0;
    while (i < sorted.length) {
      const cur = sorted[i];
      if (!cur.is_block) { out.push(cur); i++; continue; }
      let totalDur = cur.duration_min;
      let endSlot = addMinutesToSlot(cur.slot, cur.duration_min);
      let j = i + 1;
      while (j < sorted.length && sorted[j].is_block && sorted[j].slot === endSlot) {
        totalDur += sorted[j].duration_min;
        endSlot = addMinutesToSlot(endSlot, sorted[j].duration_min);
        j++;
      }
      out.push(j > i + 1
        ? { ...cur, duration_min: totalDur, _merged_count: j - i }
        : cur);
      i = j;
    }
  }
  out.sort((a, b) => a.slot.localeCompare(b.slot));
  return out;
}

function formatBookingLine(b, { prefix } = { prefix: `#${b.id}` }) {
  const head = prefix ? `${prefix} ` : '';
  if (b.is_block) {
    const endSlot = addMinutesToSlot(b.slot, b.duration_min);
    const merged = (b._merged_count ?? 1) > 1;
    const tail = (prefix && !merged) ? ` · ${prefix}` : '';
    return `🚫 <b>${escapeHtml(b.slot)}–${escapeHtml(endSlot)}</b> <i>${escapeHtml(b.duration_min)}min</i> · <i>Zablokowane</i>${tail}`;
  }
  const parts = [
    `${STATUS[b.status]?.emoji ?? '•'} <b>${escapeHtml(b.slot)}</b>`,
    `<i>${escapeHtml(b.duration_min)}min</i>`,
    `${escapeHtml(b.service_name ?? b.service_id)}`,
    `· ${escapeHtml(b.customer_name)}`,
    `· <code>${escapeHtml(b.phone)}</code>`,
  ];
  return `${head}${parts.join(' ')}`;
}

export function formatDayOverview(isoDate, bookings) {
  if (bookings.length === 0) {
    return `📅 <b>${escapeHtml(isoToHumanPl(isoDate))}</b>\n\n<i>Brak rezerwacji.</i>`;
  }
  const byBarber = new Map();
  for (const b of bookings) {
    if (!byBarber.has(b.barber_id)) {
      byBarber.set(b.barber_id, { name: b.barber_name, items: [] });
    }
    byBarber.get(b.barber_id).items.push(b);
  }
  const lines = [`📅 <b>${escapeHtml(isoToHumanPl(isoDate))}</b>`];
  for (const { name, items } of byBarber.values()) {
    lines.push('');
    lines.push(`✂️ <b>${escapeHtml(name)}</b> — ${items.length}`);
    for (const b of mergeAdjacentBlocks(items)) lines.push(formatBookingLine(b));
  }
  return lines.join('\n');
}

export function formatRangeOverview(bookings, headerLabel) {
  if (bookings.length === 0) {
    return `📅 <b>${escapeHtml(headerLabel)}</b>\n\n<i>Brak rezerwacji.</i>`;
  }
  const byDate = new Map();
  for (const b of bookings) {
    if (!byDate.has(b.date)) byDate.set(b.date, []);
    byDate.get(b.date).push(b);
  }
  const lines = [`📅 <b>${escapeHtml(headerLabel)}</b>`];
  for (const [date, items] of byDate) {
    lines.push('');
    lines.push(`<b>${escapeHtml(isoToHumanPl(date))}</b> — ${items.length}`);
    for (const b of mergeAdjacentBlocks(items)) {
      lines.push(`${formatBookingLine(b, { prefix: '' })} · ✂️ ${escapeHtml(b.barber_name)}`);
    }
  }
  return lines.join('\n');
}

export function formatBookingCard(b) {
  return [
    `🧾 <b>Rezerwacja #${b.id}</b> — ${formatStatus(b.status)}`,
    ``,
    `📅 <b>${escapeHtml(isoToHumanPl(b.date))}</b> · ⏰ <b>${escapeHtml(b.slot)}</b> (${b.duration_min}min)`,
    `✂️ ${escapeHtml(b.barber_name)}`,
    `💈 ${escapeHtml(b.service_name ?? b.service_id)}`,
    `👤 ${escapeHtml(b.customer_name)}`,
    `📞 <code>${escapeHtml(b.phone)}</code>`,
  ].join('\n');
}

export function formatNewBookingNotification(b) {
  return [
    `🔔 <b>Nowa rezerwacja</b>`,
    ``,
    `📅 <b>${escapeHtml(isoToHumanPl(b.date))}</b> · ⏰ <b>${escapeHtml(b.slot)}</b> (${b.duration_min}min)`,
    `✂️ ${escapeHtml(b.barber_name)}`,
    `💈 ${escapeHtml(b.service_name ?? b.service_id)}`,
    `👤 ${escapeHtml(b.customer_name)}`,
    `📞 <code>${escapeHtml(b.phone)}</code>`,
    ``,
    `<i>ID: #${b.id}</i>`,
  ].join('\n');
}

export function formatStats(label, stats) {
  const total = stats.pending + stats.confirmed + stats.cancelled;
  const active = stats.pending + stats.confirmed;
  return [
    `📊 <b>${escapeHtml(label)}</b>`,
    ``,
    `Łącznie: <b>${total}</b>`,
    `🕒 Oczekuje: <b>${stats.pending}</b>`,
    `✅ Potwierdzone: <b>${stats.confirmed}</b>`,
    `❌ Anulowane: <b>${stats.cancelled}</b>`,
    ``,
    `💰 Aktywny przychód: <b>${stats.revenuePln} PLN</b> (${active} rez.)`,
  ].join('\n');
}

export function formatBarbers(barbers) {
  if (barbers.length === 0) return '<i>Brak aktywnych fryzjerów.</i>';
  const lines = ['✂️ <b>Fryzjerzy</b>', ''];
  for (const b of barbers) {
    lines.push(`#${b.id} · <b>${escapeHtml(b.name)}</b> — ${escapeHtml(b.title_pl)}`);
  }
  return lines.join('\n');
}

export function formatServices(services) {
  if (services.length === 0) return '<i>Brak aktywnych usług.</i>';
  const lines = ['💈 <b>Usługi</b>', ''];
  for (const s of services) {
    lines.push(`<code>${escapeHtml(s.id)}</code> · <b>${escapeHtml(s.name_pl)}</b> — ${escapeHtml(s.duration_label)} · ${s.price_pln} PLN`);
  }
  return lines.join('\n');
}

export function helpMessage() {
  return [
    `🤖 <b>Off-Cut Manager Bot</b>`,
    ``,
    `<b>Kalendarz:</b>`,
    `/calendar — interaktywny kalendarz (przegląd, blokowanie czasu)`,
    ``,
    `<b>Rezerwacje:</b>`,
    `/today — dziś`,
    `/tomorrow — jutro`,
    `/week — następne 7 dni`,
    `/date YYYY-MM-DD — wybrana data`,
    `/pending — oczekujące (z przyciskami)`,
    `/find &lt;imię/telefon&gt; — szukaj`,
    `/booking &lt;id&gt; — pokaż rezerwację`,
    ``,
    `<b>Statystyki / katalog:</b>`,
    `/stats — dziś + 7 dni`,
    `/barbers — lista fryzjerów`,
    `/services — cennik`,
    ``,
    `<b>Pomoc:</b>`,
    `/help — ta wiadomość`,
  ].join('\n');
}

export function monthHeaderPl(year, month) {
  return `${MONTHS_PL_NOM[month - 1]} ${year}`;
}

export function dowHeaderRowPl() {
  return DOW_PL_SHORT;
}

export function formatCalendarDayView({ isoDate, barberName, bookings, freeSlots, isClosed }) {
  const header = `📅 <b>${escapeHtml(isoToHumanPl(isoDate))}</b> · ✂️ ${escapeHtml(barberName)}`;
  if (isClosed) {
    return `${header}\n\n<i>Lokal zamknięty.</i>`;
  }
  const lines = [header, ''];
  if (bookings.length === 0) {
    lines.push('<i>Brak rezerwacji ani blokad.</i>');
  } else {
    for (const b of mergeAdjacentBlocks(bookings)) lines.push(formatBookingLine(b));
  }
  lines.push('');
  if (freeSlots.length === 0) {
    lines.push('<i>Brak wolnych slotów.</i>');
  } else {
    lines.push(`🟢 <b>Wolne sloty (${freeSlots.length}):</b> ${freeSlots.join(', ')}`);
  }
  return lines.join('\n');
}

export function formatRescheduleConfirm(b, newIsoDate, newSlot) {
  return [
    `🔄 <b>Przełożenie rezerwacji #${b.id}</b>`,
    ``,
    `Z: <s>${escapeHtml(isoToHumanPl(b.date))} · ${escapeHtml(b.slot)}</s>`,
    `Na: <b>${escapeHtml(isoToHumanPl(newIsoDate))} · ${escapeHtml(newSlot)}</b> (${b.duration_min}min)`,
    ``,
    `✂️ ${escapeHtml(b.barber_name)}   👤 ${escapeHtml(b.customer_name)}`,
    `💈 ${escapeHtml(b.service_name ?? b.service_id)}`,
  ].join('\n');
}

export function formatBlockConfirm({ isoDate, barberName, slot, durationMin }) {
  return [
    `🚫 <b>Zablokować czas?</b>`,
    ``,
    `📅 <b>${escapeHtml(isoToHumanPl(isoDate))}</b>`,
    `✂️ ${escapeHtml(barberName)}`,
    `⏰ <b>${escapeHtml(slot)}</b> · ${durationMin} min`,
  ].join('\n');
}

export function isoDateParts(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m, d };
}

export function buildIso(y, m, d) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

export function jsDayOfWeek(year, month, day) {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}
