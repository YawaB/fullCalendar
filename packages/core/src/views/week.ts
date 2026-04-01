// @ts-nocheck
import { DateUtils } from '../core/index';

export default function renderMonthView(cal) {
    const { currentDate, options, store } = cal;
    const firstDay = options.firstDay;
    const monthStart = DateUtils.startOfMonth(currentDate);
    const monthEnd = DateUtils.endOfMonth(currentDate);
    const gridStart = DateUtils.startOfWeek(monthStart, firstDay);
    const gridEnd = DateUtils.endOfWeek(monthEnd, firstDay);
    const days = DateUtils.getDaysInRange(gridStart, gridEnd);
    const events = store.getInRange(gridStart, gridEnd);
    const today = new Date();

    // Day-of-week headers
    const dayNames = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(gridStart);
        d.setDate(d.getDate() + i);
        dayNames.push(d.toLocaleDateString(options.locale, { weekday: 'short' }));
    }

    let html = `<div class="ec-month-view">`;

    // Header row
    html += `<div class="ec-month-header">`;
    dayNames.forEach(name => {
        html += `<div class="ec-col-header">${name}</div>`;
    });
    html += `</div>`;

    // Grid
    html += `<div class="ec-month-grid">`;
    for (let i = 0; i < days.length; i += 7) {
        html += `<div class="ec-week-row">`;
        for (let j = 0; j < 7; j++) {
            const day = days[i + j];
            const isToday = DateUtils.isToday(day);
            const isOtherMonth = !DateUtils.isSameMonth(day, currentDate);
            const dayEvents = events.filter(e =>
                DateUtils.isWithinRange(day, DateUtils.startOfDay(e.start), DateUtils.endOfDay(e.end))
            );

            html += `<div class="ec-day-cell${isToday ? ' ec-today' : ''}${isOtherMonth ? ' ec-other-month' : ''}" 
        data-date="${day.toISOString()}" data-action="dateClick">`;
            html += `<div class="ec-day-number">${isToday ? `<span class="ec-today-dot">${day.getDate()}</span>` : day.getDate()}</div>`;
            html += `<div class="ec-day-events">`;
            dayEvents.slice(0, 3).forEach(ev => {
                const color = ev.color || options.eventColor;
                const textColor = ev.textColor || options.eventTextColor;
                html += `<div class="ec-event" 
          data-event-id="${ev.id}"
          style="background:${color};color:${textColor}"
          title="${ev.title}">
          <span class="ec-event-title">${ev.allDay ? '' : `<span class="ec-event-time">${DateUtils.formatTime(ev.start, options.locale)}</span>`}${ev.title}</span>
        </div>`;
            });
            if (dayEvents.length > 3) {
                html += `<div class="ec-more-events" data-date="${day.toISOString()}">+${dayEvents.length - 3} more</div>`;
            }
            html += `</div></div>`;
        }
        html += `</div>`;
    }
    html += `</div></div>`;
    return html;
}