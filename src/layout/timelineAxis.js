import { MS, formatTime, toDate } from '../core/timeUtils.js';

export function buildTimelineSlots(viewStart, viewEnd, options = {}) {
  const slotMinutes = options.slotDurationMinutes || 60;
  const slotMs = slotMinutes * MS.minute;
  const locale = options.locale || 'default';
  const formatter = options.slotLabelFormat;

  const slots = [];
  let cursor = toDate(viewStart);
  while (cursor < viewEnd) {
    const label = typeof formatter === 'function' ? formatter(cursor) : formatTime(cursor, locale);
    slots.push({ date: new Date(cursor), label });
    cursor = new Date(cursor.getTime() + slotMs);
  }
  return slots;
}

export function renderTimelineAxis(slots) {
  return `<div class="ec-rt-axis">${slots.map(slot => `<div class="ec-rt-axis-slot" data-date="${slot.date.toISOString()}">${slot.label}</div>`).join('')}</div>`;
}
