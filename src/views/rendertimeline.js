import { DateUtils } from '../core/index.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
}

function buildColumns(currentDate, options) {
    const gran = options.timelineGranularity || 'month';
    let rangeStart, rangeEnd;

    if (gran === 'month') {
        rangeStart = DateUtils.startOfMonth(currentDate);
        rangeEnd   = DateUtils.endOfMonth(currentDate);
    } else if (gran === 'week') {
        rangeStart = DateUtils.startOfWeek(currentDate, options.firstDay || 0);
        rangeEnd   = DateUtils.endOfWeek(currentDate, options.firstDay || 0);
    } else {
        // 'day' — show N days starting from currentDate
        const n = options.timelineDays || 14;
        rangeStart = DateUtils.startOfDay(currentDate);
        rangeEnd   = DateUtils.endOfDay(DateUtils.addDays(rangeStart, n - 1));
    }

    return {
        days: DateUtils.getDaysInRange(rangeStart, rangeEnd),
        rangeStart,
        rangeEnd,
    };
}

/**
 * For a given event and a day-column array, compute the left offset (%) and
 * width (%) relative to the visible range.
 */
function eventGeometry(ev, rangeStart, rangeEnd, totalDays) {
    const visStart = ev.start < rangeStart ? rangeStart : ev.start;
    const visEnd   = ev.end   > rangeEnd   ? rangeEnd   : ev.end;

    const rangeMs  = rangeEnd - rangeStart || 1;
    const left     = clamp((visStart - rangeStart) / rangeMs, 0, 1) * 100;
    const right    = clamp((visEnd   - rangeStart) / rangeMs, 0, 1) * 100;
    const width    = Math.max(right - left, 100 / totalDays * 0.5); // min half-column wide

    return { left, width };
}

// ─── Column header rendering ──────────────────────────────────────────────────

function buildColumnHeaders(days, options) {
    const gran = options.timelineGranularity || 'month';
    const locale = options.locale || 'default';

    // For month granularity we group days by week and show week-of-month label
    // then individual day numbers underneath. For week/day we just show day numbers.

    let html = '';

    if (gran === 'month') {
        // Two-row header: week bands + day numbers
        // -- Row 1: Week markers (Mon dd – Sun dd)
        html += `<div class="ec-tl-col-header-weeks">`;
        let i = 0;
        while (i < days.length) {
            // find next Sunday (or end)
            let j = i;
            while (j < days.length && days[j].getDay() !== (options.firstDay === 1 ? 0 : 6)) {
                j++;
            }
            j = Math.min(j, days.length - 1);
            const span = j - i + 1;
            const weekLabel = days[i].toLocaleDateString(locale, { month: 'short', day: 'numeric' });
            html += `<div class="ec-tl-week-band" style="flex:${span}">
                <span>${weekLabel}</span>
            </div>`;
            i = j + 1;
        }
        html += `</div>`;

        // -- Row 2: Day letters + numbers
        html += `<div class="ec-tl-col-header-days">`;
        days.forEach(day => {
            const isToday = DateUtils.isToday(day);
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;
            html += `<div class="ec-tl-col-day${isToday ? ' ec-tl-today-col' : ''}${isWeekend ? ' ec-tl-weekend-col' : ''}" data-date="${day.toISOString()}">
                <span class="ec-tl-day-letter">${day.toLocaleDateString(locale, { weekday: 'narrow' })}</span>
                <span class="ec-tl-day-num${isToday ? ' ec-today-dot' : ''}">${day.getDate()}</span>
            </div>`;
        });
        html += `</div>`;

    } else {
        // Single row
        html += `<div class="ec-tl-col-header-days">`;
        days.forEach(day => {
            const isToday = DateUtils.isToday(day);
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;
            const fmt = gran === 'week'
                ? day.toLocaleDateString(locale, { weekday: 'short', day: 'numeric' })
                : day.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' });
            html += `<div class="ec-tl-col-day${isToday ? ' ec-tl-today-col' : ''}${isWeekend ? ' ec-tl-weekend-col' : ''}" data-date="${day.toISOString()}">
                <span>${fmt}</span>
            </div>`;
        });
        html += `</div>`;
    }

    return html;
}

// ─── Resource row rendering ───────────────────────────────────────────────────

function buildResourceRow(resource, rowEvents, days, rangeStart, rangeEnd, options) {
    const totalDays = days.length;
    const locale = options.locale || 'default';

    // Left panel – resource info
    const image   = resource.imageUrl
        ? `<img class="ec-tl-res-img" src="${resource.imageUrl}" alt="${resource.title}">`
        : `<div class="ec-tl-res-avatar">${(resource.title || '?')[0].toUpperCase()}</div>`;

    const badge = resource.badgeText
        ? `<span class="ec-tl-res-badge" style="background:${resource.badgeColor || '#22c55e'}">${resource.badgeText}</span>`
        : '';

    const subtitle = resource.subtitle
        ? `<span class="ec-tl-res-subtitle">${resource.subtitle}</span>`
        : '';

    let html = `<div class="ec-tl-row" data-resource-id="${resource.id}">`;

    // ── Resource label ──
    html += `<div class="ec-tl-res-label">
        ${image}
        <div class="ec-tl-res-info">
            <span class="ec-tl-res-title">${resource.title}</span>
            ${subtitle}
            ${badge}
        </div>
    </div>`;

    // ── Grid area ──
    html += `<div class="ec-tl-row-grid" style="--tl-cols:${totalDays}">`;

    // Background grid cells
    days.forEach(day => {
        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
        const isToday   = DateUtils.isToday(day);
        html += `<div class="ec-tl-cell${isWeekend ? ' ec-tl-weekend-cell' : ''}${isToday ? ' ec-tl-today-cell' : ''}" 
            data-date="${day.toISOString()}" 
            data-resource-id="${resource.id}"
            data-action="dateClick"></div>`;
    });

    // Events
    rowEvents.forEach(ev => {
        const { left, width } = eventGeometry(ev, rangeStart, rangeEnd, totalDays);
        const color     = ev.color || options.eventColor || '#3b82f6';
        const textColor = ev.textColor || options.eventTextColor || '#ffffff';
        const timeLabel = ev.allDay
            ? ''
            : `<span class="ec-tl-ev-time">${DateUtils.formatTime(ev.start, locale)}</span>`;

        // Icon (wrench SVG by default — can be customised via ev.extendedProps.icon)
        const iconSvg = ev.extendedProps?.icon || `<svg viewBox="0 0 16 16" fill="currentColor" width="11" height="11">
            <path d="M13.5 1.5a3.12 3.12 0 0 0-3.07 3.73L2.56 13.1a.5.5 0 0 0 0 .71l.63.63a.5.5 0 0 0 .71 0l7.88-7.88A3.12 3.12 0 1 0 13.5 1.5zm0 4.75a1.63 1.63 0 1 1 0-3.25 1.63 1.63 0 0 1 0 3.25z"/>
        </svg>`;

        html += `<div class="ec-tl-event"
            data-event-id="${ev.id}"
            title="${ev.title}"
            style="left:${left.toFixed(3)}%;width:${width.toFixed(3)}%;background:${color};color:${textColor}">
            <span class="ec-tl-ev-icon">${iconSvg}</span>
            ${timeLabel}
            <span class="ec-tl-ev-title">${ev.title}</span>
        </div>`;
    });

    html += `</div>`; // .ec-tl-row-grid
    html += `</div>`; // .ec-tl-row

    return html;
}

// ─── Today needle ─────────────────────────────────────────────────────────────

function buildTodayNeedle(rangeStart, rangeEnd) {
    const now = new Date();
    if (now < rangeStart || now > rangeEnd) return '';
    const pct = ((now - rangeStart) / (rangeEnd - rangeStart)) * 100;
    return `<div class="ec-tl-today-needle" style="left:${pct.toFixed(3)}%"></div>`;
}

// ─── Main renderer ────────────────────────────────────────────────────────────

export function renderTimelineView(cal) {
    const { currentDate, options, store } = cal;
    const resources = options.resources || [];

    const { days, rangeStart, rangeEnd } = buildColumns(currentDate, options);
    const allEvents = store.getInRange(rangeStart, rangeEnd);

    let html = `<div class="ec-timeline-view">`;

    // ── Sticky top-left corner + column headers ──
    html += `<div class="ec-tl-header">`;
    html += `<div class="ec-tl-res-col-header">
        <span>${options.resourceLabel || 'Resources'}</span>
    </div>`;
    html += `<div class="ec-tl-col-headers-wrap">`;
    html += buildColumnHeaders(days, options);
    html += `</div>`; // .ec-tl-col-headers-wrap
    html += `</div>`; // .ec-tl-header

    // ── Body: resource rows ──
    html += `<div class="ec-tl-body">`;

    if (resources.length === 0) {
        html += `<div class="ec-tl-empty">No resources defined. Pass a <code>resources</code> array in options.</div>`;
    } else {
        resources.forEach(resource => {
            const rowEvents = allEvents.filter(ev => ev.resourceId === resource.id || ev.raw?.resourceId === resource.id || ev._raw?.resourceId === resource.id);
            html += buildResourceRow(resource, rowEvents, days, rangeStart, rangeEnd, options);
        });
    }

    // Today needle across the entire body
    html += buildTodayNeedle(rangeStart, rangeEnd);

    html += `</div>`; // .ec-tl-body
    html += `</div>`; // .ec-timeline-view

    return html;
}
