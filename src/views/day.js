import { DateUtils } from '../core/index.js';

export function renderDayView(cal) {
    const { currentDate, options, store } = cal;
    const dayStart = DateUtils.startOfDay(currentDate);
    const dayEnd = DateUtils.endOfDay(currentDate);
    const events = store.getInRange(dayStart, dayEnd);
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const isToday = DateUtils.isToday(currentDate);

    let html = `<div class="ec-day-view">`;

    // Header
    html += `<div class="ec-week-header">`;
    html += `<div class="ec-time-gutter"></div>`;
    html += `<div class="ec-col-header${isToday ? ' ec-today' : ''}">
    <span class="ec-col-header-day">${currentDate.toLocaleDateString(options.locale, { weekday: 'long' })}</span>
    <span class="ec-col-header-date${isToday ? ' ec-today-dot' : ''}">${currentDate.getDate()}</span>
  </div>`;
    html += `</div>`;

    // All-day row
    const allDayEvents = events.filter(e => e.allDay);
    if (allDayEvents.length > 0) {
        html += `<div class="ec-allday-row">`;
        html += `<div class="ec-time-gutter ec-allday-label">all-day</div>`;
        html += `<div class="ec-allday-cell">`;
        allDayEvents.forEach(ev => {
            const color = ev.color || options.eventColor;
            const textColor = ev.textColor || options.eventTextColor;
            html += `<div class="ec-event" data-event-id="${ev.id}" style="background:${color};color:${textColor}">${ev.title}</div>`;
        });
        html += `</div></div>`;
    }

    // Time grid
    html += `<div class="ec-time-grid-scroll"><div class="ec-time-grid ec-time-grid-day">`;

    html += `<div class="ec-time-labels">`;
    hours.forEach(h => {
        const label = h === 0 ? '' : `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? 'am' : 'pm'}`;
        html += `<div class="ec-time-label">${label}</div>`;
    });
    html += `</div>`;

    const timedEvents = events.filter(e => !e.allDay);
    html += `<div class="ec-day-col${isToday ? ' ec-today-col' : ''}" data-date="${currentDate.toISOString()}" data-action="dateClick">`;
    hours.forEach(h => {
        html += `<div class="ec-hour-slot" data-hour="${h}"></div>`;
    });

    timedEvents.forEach(ev => {
        const color = ev.color || options.eventColor;
        const textColor = ev.textColor || options.eventTextColor;
        const evStart = ev.start < dayStart ? dayStart : ev.start;
        const evEnd = ev.end > dayEnd ? dayEnd : ev.end;
        const startMin = evStart.getHours() * 60 + evStart.getMinutes();
        const endMin = evEnd.getHours() * 60 + evEnd.getMinutes();
        const top = (startMin / 1440) * 100;
        const height = Math.max(((endMin - startMin) / 1440) * 100, 1.5);

        html += `<div class="ec-event ec-timed-event" 
      data-event-id="${ev.id}"
      style="top:${top}%;height:${height}%;background:${color};color:${textColor}">
      <span class="ec-event-title">${ev.title}</span>
      <span class="ec-event-time">${DateUtils.formatTime(ev.start, options.locale)} – ${DateUtils.formatTime(ev.end, options.locale)}</span>
    </div>`;
    });

    html += `</div></div></div></div>`;

    return html;
}