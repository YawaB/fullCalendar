import { MS, formatTime, toDate } from '../core/timeUtils.js';

export function buildTimeAxis(viewStart, viewEnd, options = {}) {
  const slotMinutes = options.slotDurationMinutes || 60;
  const slotMs = slotMinutes * MS.minute;
  const locale = options.locale || 'default';
  const labelFormat = options.slotLabelFormat;

  let cursor = toDate(viewStart);
  const parts = [];

  while (cursor < viewEnd) {
    const next = new Date(cursor.getTime() + slotMs);
    const label = typeof labelFormat === 'function'
      ? labelFormat(cursor)
      : formatTime(cursor, locale);

    parts.push(`<div class="ec-time-axis-slot" data-date="${cursor.toISOString()}"><span>${label}</span></div>`);
    cursor = next;
  }

  return `<div class="ec-time-axis">${parts.join('')}</div>`;
}
