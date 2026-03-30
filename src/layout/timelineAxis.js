import { MS, formatTime, toDate } from '../core/timeUtils.js';

export function buildAxis(viewStart, viewEnd, slotDurationMinutes, mode, locale) {
  const slots = [];
  const slotMs = slotDurationMinutes * MS.minute;
  let cursor = toDate(viewStart);

  while (cursor < viewEnd) {
    const start = new Date(cursor);
    const end = new Date(cursor.getTime() + slotMs);
    let label = '';

    if (mode === 'resourceTimelineDay') {
      label = formatTime(start, locale).replace(':00', '');
    } else if (mode === 'resourceTimelineWeek') {
      label = start.toLocaleDateString(locale, { weekday: 'short', month: 'numeric', day: 'numeric' });
    } else {
      label = String(start.getDate());
    }

    slots.push({ start, end, label });
    cursor = end;
  }

  return slots;
}

export function renderAxis(slots, slotWidth) {
  return slots
    .map(slot => `<div class="ec-time-slot" style="width:${slotWidth}px" data-date="${slot.start.toISOString()}">${slot.label}</div>`)
    .join('');
}
