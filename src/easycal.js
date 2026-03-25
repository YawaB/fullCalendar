/**
 * EasyCal v1.0.0 - A lightweight calendar library
 * MIT License
 */

'use strict';
import './easycal.css';

// ─── EasyCal Core ─────────────────────────────────────────────────────────────

const DEFAULT_OPTIONS = {
    view: 'month',
    date: new Date(),
    locale: 'default',
    firstDay: 0, // 0=Sun, 1=Mon
    height: 'auto',
    events: [],
    headerToolbar: {
        left: 'prev,next,today',
        center: 'title',
        right: 'month,week,day,list',
    },
    eventColor: '#3b82f6',
    eventTextColor: '#ffffff',
    selectable: false,
    editable: false,
    // Callbacks
    eventClick: null,
    eventMouseEnter: null,
    eventMouseLeave: null,
    dateClick: null,
    select: null,
    eventDrop: null,
    eventResize: null,
    viewDidMount: null,
    datesSet: null,
    eventDidMount: null,
};

// ─── Date Utilities ───────────────────────────────────────────────────────────

const DateUtils = {
    startOfDay(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    },
    endOfDay(date) {
        const d = new Date(date);
        d.setHours(23, 59, 59, 999);
        return d;
    },
    startOfWeek(date, firstDay = 0) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = (day - firstDay + 7) % 7;
        d.setDate(d.getDate() - diff);
        return this.startOfDay(d);
    },
    endOfWeek(date, firstDay = 0) {
        const start = this.startOfWeek(date, firstDay);
        const d = new Date(start);
        d.setDate(d.getDate() + 6);
        return this.endOfDay(d);
    },
    startOfMonth(date) {
        return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
    },
    endOfMonth(date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    },
    addDays(date, days) {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        return d;
    },
    addMonths(date, months) {
        const d = new Date(date);
        d.setMonth(d.getMonth() + months);
        return d;
    },
    addWeeks(date, weeks) {
        return this.addDays(date, weeks * 7);
    },
    isSameDay(a, b) {
        return a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate();
    },
    isSameMonth(a, b) {
        return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
    },
    isToday(date) {
        return this.isSameDay(date, new Date());
    },
    isWithinRange(date, start, end) {
        return date >= start && date <= end;
    },
    formatTime(date, locale = 'default') {
        return date.toLocaleTimeString(locale, {hour: '2-digit', minute: '2-digit', hour12: true});
    },
    formatDate(date, options = {}, locale = 'default') {
        return date.toLocaleDateString(locale, options);
    },
    getDaysInRange(start, end) {
        const days = [];
        const d = new Date(start);
        while (d <= end) {
            days.push(new Date(d));
            d.setDate(d.getDate() + 1);
        }
        return days;
    },
};

// ─── Event Store ──────────────────────────────────────────────────────────────

class EventStore {
    constructor() {
        this._events = [];
        this._id = 1;
    }

    _normalize(event) {
        return {
            id: event.id ?? `ec-${this._id++}`,
            title: event.title ?? '(No title)',
            start: event.start instanceof Date ? event.start : new Date(event.start),
            end: event.end
                ? (event.end instanceof Date ? event.end : new Date(event.end))
                : DateUtils.endOfDay(event.start instanceof Date ? event.start : new Date(event.start)),
            allDay: event.allDay ?? false,
            color: event.color ?? event.backgroundColor ?? null,
            textColor: event.textColor ?? null,
            extendedProps: event.extendedProps ?? {},
            _raw: event,
        };
    }

    load(events) {
        this._events = events.map(e => this._normalize(e));
    }

    add(event) {
        const e = this._normalize(event);
        this._events.push(e);
        return e;
    }

    remove(id) {
        this._events = this._events.filter(e => e.id !== id);
    }

    update(id, changes) {
        const idx = this._events.findIndex(e => e.id === id);
        if (idx !== -1) {
            this._events[idx] = {...this._events[idx], ...this._normalize({...this._events[idx]._raw, ...changes})};
        }
    }

    getAll() {
        return this._events;
    }

    getInRange(start, end) {
        return this._events.filter(e => e.start <= end && e.end >= start);
    }

    getById(id) {
        return this._events.find(e => e.id === id) ?? null;
    }
}

// ─── View Renderers ───────────────────────────────────────────────────────────

function renderMonthView(cal) {
    const {currentDate, options, store} = cal;
    const firstDay = options.firstDay;
    const monthStart = DateUtils.startOfMonth(currentDate);
    const monthEnd = DateUtils.endOfMonth(currentDate);
    const gridStart = DateUtils.startOfWeek(monthStart, firstDay);
    const gridEnd = DateUtils.endOfWeek(monthEnd, firstDay);
    const days = DateUtils.getDaysInRange(gridStart, gridEnd);
    const events = store.getInRange(gridStart, gridEnd);

    // Day-of-week headers
    const dayNames = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(gridStart);
        d.setDate(d.getDate() + i);
        dayNames.push(d.toLocaleDateString(options.locale, {weekday: 'short'}));
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

function renderWeekView(cal) {
    const {currentDate, options, store} = cal;
    const firstDay = options.firstDay;
    const weekStart = DateUtils.startOfWeek(currentDate, firstDay);
    const weekEnd = DateUtils.endOfWeek(currentDate, firstDay);
    const days = DateUtils.getDaysInRange(weekStart, weekEnd);
    const events = store.getInRange(weekStart, weekEnd);

    const hours = Array.from({length: 24}, (_, i) => i);

    let html = `<div class="ec-week-view">`;

    // All-day row
    const allDayEvents = events.filter(e => e.allDay);

    html += `<div class="ec-week-header">`;
    html += `<div class="ec-time-gutter"></div>`;
    days.forEach(day => {
        const isToday = DateUtils.isToday(day);
        html += `<div class="ec-col-header${isToday ? ' ec-today' : ''}">
      <span class="ec-col-header-day">${day.toLocaleDateString(options.locale, {weekday: 'short'})}</span>
      <span class="ec-col-header-date${isToday ? ' ec-today-dot' : ''}">${day.getDate()}</span>
    </div>`;
    });
    html += `</div>`;

    // All-day events strip
    if (allDayEvents.length > 0) {
        html += `<div class="ec-allday-row">`;
        html += `<div class="ec-time-gutter ec-allday-label">all-day</div>`;
        days.forEach(day => {
            const dayAllDay = allDayEvents.filter(e =>
                DateUtils.isWithinRange(day, DateUtils.startOfDay(e.start), DateUtils.endOfDay(e.end))
            );
            html += `<div class="ec-allday-cell" data-date="${day.toISOString()}">`;
            dayAllDay.forEach(ev => {
                const color = ev.color || options.eventColor;
                const textColor = ev.textColor || options.eventTextColor;
                html += `<div class="ec-event" data-event-id="${ev.id}" style="background:${color};color:${textColor}">${ev.title}</div>`;
            });
            html += `</div>`;
        });
        html += `</div>`;
    }

    // Time grid
    html += `<div class="ec-time-grid-scroll"><div class="ec-time-grid">`;

    // Time labels
    html += `<div class="ec-time-labels">`;
    hours.forEach(h => {
        const label = h === 0 ? '' : `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? 'am' : 'pm'}`;
        html += `<div class="ec-time-label">${label}</div>`;
    });
    html += `</div>`;

    // Columns
    days.forEach(day => {
        const isToday = DateUtils.isToday(day);
        const dayStart = DateUtils.startOfDay(day);
        const dayEnd = DateUtils.endOfDay(day);
        const dayEvents = events.filter(e => !e.allDay &&
            e.start <= dayEnd && e.end >= dayStart
        );

        html += `<div class="ec-day-col${isToday ? ' ec-today-col' : ''}" data-date="${day.toISOString()}" data-action="dateClick">`;

        // Hour slots
        hours.forEach(h => {
            html += `<div class="ec-hour-slot" data-hour="${h}"></div>`;
        });

        // Place events
        dayEvents.forEach(ev => {
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
        <span class="ec-event-time">${DateUtils.formatTime(ev.start, options.locale)}</span>
      </div>`;
        });

        html += `</div>`;
    });

    html += `</div></div>`;
    html += `</div>`;

    return html;
}

function renderDayView(cal) {
    const {currentDate, options, store} = cal;
    const dayStart = DateUtils.startOfDay(currentDate);
    const dayEnd = DateUtils.endOfDay(currentDate);
    const events = store.getInRange(dayStart, dayEnd);
    const hours = Array.from({length: 24}, (_, i) => i);
    const isToday = DateUtils.isToday(currentDate);

    let html = `<div class="ec-day-view">`;

    // Header
    html += `<div class="ec-week-header">`;
    html += `<div class="ec-time-gutter"></div>`;
    html += `<div class="ec-col-header${isToday ? ' ec-today' : ''}">
    <span class="ec-col-header-day">${currentDate.toLocaleDateString(options.locale, {weekday: 'long'})}</span>
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

function renderListView(cal) {
    const {currentDate, options, store} = cal;
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
      <span class="ec-list-day-name">${day.toLocaleDateString(options.locale, {weekday: 'short'})}</span>
      <span class="ec-list-day-date">${day.toLocaleDateString(options.locale, {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })}</span>
    </div>`;

        dayEvents.forEach(ev => {
            const color = ev.color || options.eventColor;
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

// ─── View Registry ────────────────────────────────────────────────────────────

const VIEW_RENDERERS = {
    month: renderMonthView,
    week: renderWeekView,
    day: renderDayView,
    list: renderListView,
};

const VIEW_LABELS = {
    month: 'Month',
    week: 'Week',
    day: 'Day',
    list: 'List',
};

// ─── EasyCal Class ────────────────────────────────────────────────────────────

class EasyCal {
    constructor(el, options = {}) {
        if (typeof el === 'string') el = document.querySelector(el);
        if (!el) throw new Error('[EasyCal] Element not found');

        this._el = el;
        this.options = {...DEFAULT_OPTIONS, ...options};
        this.currentDate = this.options.date instanceof Date ? this.options.date : new Date(this.options.date);
        this.currentView = this.options.view;
        this.store = new EventStore();

        if (Array.isArray(this.options.events)) {
            this.store.load(this.options.events);
        }

        this._el.classList.add('easycal');
        this._render();
        this._bindEvents();
    }

    // ─── Public API ──────────────────────────────────────────────────────────

    changeView(view) {
        if (!VIEW_RENDERERS[view]) return;
        this.currentView = view;
        this._render();
    }

    today() {
        this.currentDate = new Date();
        this._render();
    }

    prev() {
        this.currentDate = this._offsetDate(-1);
        this._render();
    }

    next() {
        this.currentDate = this._offsetDate(1);
        this._render();
    }

    gotoDate(date) {
        this.currentDate = date instanceof Date ? date : new Date(date);
        this._render();
    }

    addEvent(event) {
        const e = this.store.add(event);
        this._render();
        return e;
    }

    removeEvent(id) {
        this.store.remove(id);
        this._render();
    }

    updateEvent(id, changes) {
        this.store.update(id, changes);
        this._render();
    }

    getEvents() {
        return this.store.getAll();
    }

    getEventById(id) {
        return this.store.getById(id);
    }

    setOption(key, value) {
        this.options[key] = value;
        this._render();
    }

    destroy() {
        this._el.innerHTML = '';
        this._el.classList.remove('easycal');
    }

    // ─── Internal ────────────────────────────────────────────────────────────

    _offsetDate(direction) {
        const d = new Date(this.currentDate);
        switch (this.currentView) {
            case 'month':
                return DateUtils.addMonths(d, direction);
            case 'week':
                return DateUtils.addWeeks(d, direction);
            case 'day':
                return DateUtils.addDays(d, direction);
            case 'list':
                return DateUtils.addMonths(d, direction);
            default:
                return d;
        }
    }

    _getTitle() {
        const d = this.currentDate;
        const locale = this.options.locale;
        switch (this.currentView) {
            case 'month':
                return d.toLocaleDateString(locale, {month: 'long', year: 'numeric'});
            case 'week': {
                const start = DateUtils.startOfWeek(d, this.options.firstDay);
                const end = DateUtils.endOfWeek(d, this.options.firstDay);
                if (start.getMonth() === end.getMonth()) {
                    return `${start.toLocaleDateString(locale, {month: 'long'})} ${start.getDate()} – ${end.getDate()}, ${start.getFullYear()}`;
                }
                return `${start.toLocaleDateString(locale, {
                    month: 'short',
                    day: 'numeric'
                })} – ${end.toLocaleDateString(locale, {month: 'short', day: 'numeric', year: 'numeric'})}`;
            }
            case 'day':
                return d.toLocaleDateString(locale, {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'});
            case 'list':
                return d.toLocaleDateString(locale, {month: 'long', year: 'numeric'});
            default:
                return '';
        }
    }

    _buildToolbar() {
        const tb = this.options.headerToolbar;
        if (!tb) return '';

        const buildSection = (section) => {
            if (!section) return '';
            const parts = section.split(/[\s,]+/);
            let html = '';

            const views = ['month', 'week', 'day', 'list'];
            const viewParts = parts.filter(p => views.includes(p));
            const nonViewParts = parts.filter(p => !views.includes(p));

            // Non-view buttons
            nonViewParts.forEach(part => {
                switch (part.trim()) {
                    case 'prev':
                        html += `<button class="ec-btn" data-action="prev">&#8249;</button>`;
                        break;
                    case 'next':
                        html += `<button class="ec-btn" data-action="next">&#8250;</button>`;
                        break;
                    case 'today':
                        html += `<button class="ec-btn" data-action="today">Today</button>`;
                        break;
                    case 'title':
                        html += `<span class="ec-title">${this._getTitle()}</span>`;
                        break;
                }
            });

            // View buttons grouped
            if (viewParts.length > 0) {
                html += `<div class="ec-btn-group">`;
                viewParts.forEach(v => {
                    const active = v === this.currentView ? ' ec-btn-active' : '';
                    html += `<button class="ec-btn${active}" data-action="changeView" data-view="${v}">${VIEW_LABELS[v]}</button>`;
                });
                html += `</div>`;
            }

            return html;
        };

        const left = buildSection(tb.left);
        const center = buildSection(tb.center || 'title');
        const right = buildSection(tb.right);

        return `<div class="ec-toolbar">
      <div class="ec-toolbar-left">${left}</div>
      <div class="ec-toolbar-center">${center}</div>
      <div class="ec-toolbar-right">${right}</div>
    </div>`;
    }

    _render() {
        const renderer = VIEW_RENDERERS[this.currentView];
        if (!renderer) return;

        const toolbar = this._buildToolbar();
        const viewHTML = renderer(this);

        this._el.innerHTML = toolbar + viewHTML;
        this._bindEvents();

        if (this.options.viewDidMount) {
            this.options.viewDidMount({view: this.currentView, date: this.currentDate, el: this._el});
        }
        if (this.options.datesSet) {
            this.options.datesSet({view: this.currentView, start: this.currentDate, el: this._el});
        }
    }

    _bindEvents() {
        // Toolbar buttons
        this._el.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                if (action === 'prev') this.prev();
                else if (action === 'next') this.next();
                else if (action === 'today') this.today();
                else if (action === 'changeView') this.changeView(btn.dataset.view);
                else if (action === 'dateClick') this._handleDateClick(btn, e);
            });
        });

        // Day cells (month view)
        this._el.querySelectorAll('.ec-day-cell').forEach(cell => {
            cell.addEventListener('click', (e) => {
                if (e.target.closest('.ec-event') || e.target.closest('.ec-more-events')) return;
                this._handleDateClick(cell, e);
            });
        });

        // Day columns (week/day views)
        this._el.querySelectorAll('.ec-day-col').forEach(col => {
            col.addEventListener('click', (e) => {
                if (e.target.closest('.ec-event')) return;
                this._handleDateClick(col, e);
            });
        });

        // Event clicks
        this._el.querySelectorAll('.ec-event').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = el.dataset.eventId;
                const event = this.store.getById(id);
                if (event && this.options.eventClick) {
                    this.options.eventClick({event, el, jsEvent: e});
                }
            });

            el.addEventListener('mouseenter', (e) => {
                const id = el.dataset.eventId;
                const event = this.store.getById(id);
                if (event && this.options.eventMouseEnter) {
                    this.options.eventMouseEnter({event, el, jsEvent: e});
                }
            });

            el.addEventListener('mouseleave', (e) => {
                const id = el.dataset.eventId;
                const event = this.store.getById(id);
                if (event && this.options.eventMouseLeave) {
                    this.options.eventMouseLeave({event, el, jsEvent: e});
                }
            });
        });

        // List view event clicks
        this._el.querySelectorAll('.ec-list-event').forEach(el => {
            el.addEventListener('click', (e) => {
                const id = el.dataset.eventId;
                const event = this.store.getById(id);
                if (event && this.options.eventClick) {
                    this.options.eventClick({event, el, jsEvent: e});
                }
            });
        });
    }

    _handleDateClick(el, jsEvent) {
        const iso = el.dataset.date;
        if (iso && this.options.dateClick) {
            this.options.dateClick({date: new Date(iso), el, jsEvent});
        }
    }
}

// ─── Auto-attach to window in browser ────────────────────────────────────────

if (typeof window !== 'undefined') {
    window.EasyCal = EasyCal;
}

export default EasyCal;