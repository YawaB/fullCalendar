import { endOfMonth, endOfWeek, getDaysInRange, isToday, startOfMonth, startOfWeek } from '../core/utils.js';
import { renderEventBlock } from '../components/eventRenderer.js';

export default function monthView(calendar) {
  const { currentDate, options, eventModel } = calendar;
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const rangeStart = startOfWeek(monthStart, options.firstDay);
  const rangeEnd = endOfWeek(monthEnd, options.firstDay);
  const days = getDaysInRange(rangeStart, rangeEnd);
  const events = eventModel.inRange(rangeStart, rangeEnd);

  let html = '<div class="ec-month-view">';
  html += '<div class="ec-month-weekdays">';
  for (let i = 0; i < 7; i += 1) {
    const date = new Date(2026, 2, 1 + ((i + options.firstDay) % 7));
    html += `<div>${date.toLocaleDateString(options.locale, { weekday: 'short' })}</div>`;
  }
  html += '</div><div class="ec-month-grid">';

  days.forEach(day => {
    const dayEvents = events.filter(e => e.start <= day && e.end >= day);
    const muted = day.getMonth() !== currentDate.getMonth() ? 'ec-muted' : '';
    const today = isToday(day) ? 'ec-today' : '';

    html += `<div class="ec-month-cell ${muted} ${today}" data-date="${day.toISOString()}">`;
    html += `<div class="ec-month-date">${day.getDate()}</div>`;
    html += '<div class="ec-month-events">';
    dayEvents.slice(0, 3).forEach(event => {
      html += renderEventBlock(event, options);
    });
    if (dayEvents.length > 3) {
      html += `<div class="ec-more">+${dayEvents.length - 3} more</div>`;
    }
    html += '</div></div>';
  });

  html += '</div></div>';
  return html;
}
