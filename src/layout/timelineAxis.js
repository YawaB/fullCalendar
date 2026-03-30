import { MS, formatTime, toDate } from '../core/timeUtils.js';

export function buildAxis(viewStart, viewEnd, slotDurationMinutes, mode, locale) {
  const slots = [];
  const slotMs = slotDurationMinutes * MS.minute;
  let cursor = toDate(viewStart);

  while (cursor < viewEnd) {
    const start = new Date(cursor);
    const end = new Date(cursor.getTime() + slotMs);
    let label = '';
    let dayLabel = '';

    if (mode === 'resourceTimelineDay') {
      label = formatTime(start, locale).replace(':00', '');
    } else if (mode === 'resourceTimelineWeek') {
      label = start.toLocaleTimeString(locale, { hour: 'numeric' }).toLowerCase();
      dayLabel = start.toLocaleDateString(locale, { weekday: 'short', month: 'numeric', day: 'numeric' });
    } else {
      label = String(start.getDate());
    }

    slots.push({ start, end, label, dayLabel });
    cursor = end;
  }

  return slots;
}

export function renderAxis(slots, slotWidth, mode) {
  if (mode !== 'resourceTimelineWeek') {
    return `<div class="ec-time-header-bottom">${slots
      .map(slot => `<div class="ec-time-slot" style="width:${slotWidth}px" data-date="${slot.start.toISOString()}">${slot.label}</div>`)
      .join('')}</div>`;
  }

  const days = [];
  for (let i = 0; i < slots.length; i += 24) {
    const chunk = slots.slice(i, i + 24);
    if (chunk.length) days.push(chunk);
  }

  const top = `<div class="ec-time-header-top">${days
    .map(day => `<div class="ec-day-slot" style="width:${day.length * slotWidth}px">${day[0].dayLabel}</div>`)
    .join('')}</div>`;
  const bottom = `<div class="ec-time-header-bottom">${slots
    .map(slot => `<div class="ec-time-slot" style="width:${slotWidth}px" data-date="${slot.start.toISOString()}">${slot.label}</div>`)
    .join('')}</div>`;
  return `${top}${bottom}`;
}
