import { DateUtils } from '../core/index.js';

export default function renderListView(cal) {
    const { currentDate, options, store } = cal;
    // Show 30 days from the start of the current month
    const rangeStart = DateUtils.startOfMonth(currentDate);
    const rangeEnd = DateUtils.addDays(rangeStart, 29);
    const events = store.getInRange(rangeStart, rangeEnd)
        .sort((a, b) => a.start - b.start);

    let html = `<div class="ec-list-view">`;

    if (events.length === 0) {
        html += `<div class="ec-list-empty">No events to display</div>`;
        html += `</div>`;
        return html;
    }

    // Group by day
    const grouped = {};
    events.forEach(ev => {
        const key = DateUtils.startOfDay(ev.start).toDateString();
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(ev);
    });

    Object.entries(grouped).forEach(([key, dayEvents]) => {
        const day = new Date(key);
        const isToday = DateUtils.isToday(day);

        html += `<div class="ec-list-day">`;
        html += `<div class="ec-list-day-header${isToday ? ' ec-today' : ''}">
      <span class="ec-list-day-name">${day.toLocaleDateString(options.locale, { weekday: 'short' })}</span>
      <span class="ec-list-day-date">${day.toLocaleDateString(options.locale, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
    </div>`;

        dayEvents.forEach(ev => {
            const color = ev.color || options.eventColor;
            const textColor = ev.textColor || options.eventTextColor;
            const timeLabel = ev.allDay
                ? '<span class="ec-list-time">All day</span>'
                : `<span class="ec-list-time">${DateUtils.formatTime(ev.start, options.locale)} – ${DateUtils.formatTime(ev.end, options.locale)}</span>`;

            html += `<div class="ec-list-event" data-event-id="${ev.id}">
        <div class="ec-list-event-dot" style="background:${color}"></div>
        ${timeLabel}
        <span class="ec-list-event-title" style="color:${color}">${ev.title}</span>
      </div>`;
        });

        html += `</div>`;
    });

    html += `</div>`;
    return html;
}