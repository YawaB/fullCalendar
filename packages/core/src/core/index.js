// ─── EasyCal Core ─────────────────────────────────────────────────────────────

export const DEFAULT_OPTIONS = {
    view: 'month',
    date: new Date(),
    locale: 'default',
    firstDay: 0, // 0=Sun, 1=Mon
    height: 'auto',
    events: [],
    headerToolbar: {
        left: 'prev,next today',
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

export const DateUtils = {
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
        return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: true });
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

export class EventStore {
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
            this._events[idx] = { ...this._events[idx], ...this._normalize({ ...this._events[idx]._raw, ...changes }) };
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