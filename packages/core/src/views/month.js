import { DateUtils } from '../core/index.js';

export default function renderMonthView(cal) {
    const { currentDate, options, store } = cal;

    const monthStart = DateUtils.startOfMonth(currentDate);
    const monthEnd = DateUtils.endOfMonth(currentDate);
    const days = DateUtils.getDaysInRange(monthStart, monthEnd);
    const events = store.getInRange(monthStart, monthEnd);

    const hours = Array.from({ length: 24 }, (_, i) => i);

    let html = `<div class="ec-month-timeline">`;

    // Header (hours)
    html += `<div class="ec-timeline-header">`;
    html += `<div class="ec-day-label-header"></div>`;
    hours.forEach(h => {
        html += `<div class="ec-time-header">${h}h</div>`;
    });
    html += `</div>`;

    // Rows per day
    days.forEach(day => {
        const isToday = DateUtils.isToday(day);
        const dayStart = DateUtils.startOfDay(day);
        const dayEnd = DateUtils.endOfDay(day);

        const dayEvents = events.filter(e =>
            e.start <= dayEnd && e.end >= dayStart
        );

        html += `<div class="ec-timeline-row">`;

        // Day label
        html += `<div class="ec-day-label ${isToday ? 'ec-today' : ''}">
            ${day.toLocaleDateString(options.locale, { weekday: 'short', day: 'numeric' })}
        </div>`;

        // Timeline grid
        html += `<div class="ec-timeline-grid">`;

        hours.forEach(h => {
            html += `<div class="ec-hour-cell" data-hour="${h}"></div>`;
        });

        // Events positioning
        dayEvents.forEach(ev => {
            const color = ev.color || options.eventColor;
            const textColor = ev.textColor || options.eventTextColor;

            const evStart = ev.start < dayStart ? dayStart : ev.start;
            const evEnd = ev.end > dayEnd ? dayEnd : ev.end;

            const startMin = evStart.getHours() * 60 + evStart.getMinutes();
            const endMin = evEnd.getHours() * 60 + evEnd.getMinutes();

            const left = (startMin / 60) / 24 * 100;
            const width = ((endMin - startMin) / 60) / 24 * 100;

            html += `<div class="ec-event ec-timeline-event"
                data-event-id="${ev.id}"
                style="left:${left}%;width:${width}%;background:${color};color:${textColor}">
                ${ev.title}
            </div>`;
        });

        html += `</div></div>`;
    });

    html += `</div>`;
    return html;
}