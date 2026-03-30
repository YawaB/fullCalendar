/**
 * EasyCal v1.0.0 - A lightweight calendar library
 * MIT License
 */

'use strict';

import './easycal.css';

// ─── Views ───────────────────────────────────────────────────────────────────

import renderMonthView from './views/month.js';
import renderWeekView from './views/week.js';
import renderDayView from './views/day.js';
import renderListView from './views/list.js';

// Registry
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

// ─── Default Options ──────────────────────────────────────────────────────────

const DEFAULT_OPTIONS = {
    view: 'month',
    date: new Date(),
    locale: 'default',
    firstDay: 0,
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

    // callbacks
    eventClick: null,
    eventMouseEnter: null,
    eventMouseLeave: null,
    dateClick: null,
    viewDidMount: null,
    datesSet: null,
};

// ─── Date Utils ───────────────────────────────────────────────────────────────

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
        const diff = (d.getDay() - firstDay + 7) % 7;
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
        return new Date(date.getFullYear(), date.getMonth(), 1);
    },
    endOfMonth(date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    },
    addDays(date, days) {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        return d;
    },
    addWeeks(date, weeks) {
        return this.addDays(date, weeks * 7);
    },
    addMonths(date, months) {
        const d = new Date(date);
        d.setMonth(d.getMonth() + months);
        return d;
    },
    isToday(date) {
        const now = new Date();
        return (
            date.getFullYear() === now.getFullYear() &&
            date.getMonth() === now.getMonth() &&
            date.getDate() === now.getDate()
        );
    },
    formatTime(date, locale = 'default') {
        return date.toLocaleTimeString(locale, {
            hour: '2-digit',
            minute: '2-digit',
        });
    },
};

// ─── Event Store ──────────────────────────────────────────────────────────────

class EventStore {
    constructor() {
        this.events = [];
        this.id = 1;
    }

    normalize(event) {
        return {
            id: event.id ?? `ec-${this.id++}`,
            title: event.title ?? '(No title)',
            start: new Date(event.start),
            end: event.end ? new Date(event.end) : new Date(event.start),
            allDay: event.allDay ?? false,
            color: event.color ?? null,
            textColor: event.textColor ?? null,
            raw: event,
        };
    }

    load(events) {
        this.events = events.map(e => this.normalize(e));
    }

    add(event) {
        const e = this.normalize(event);
        this.events.push(e);
        return e;
    }

    remove(id) {
        this.events = this.events.filter(e => e.id !== id);
    }

    getAll() {
        return this.events;
    }

    getInRange(start, end) {
        return this.events.filter(e => e.start <= end && e.end >= start);
    }

    getById(id) {
        return this.events.find(e => e.id === id) || null;
    }
}

// ─── EasyCal Core ─────────────────────────────────────────────────────────────

class EasyCal {
    constructor(el, options = {}) {
        if (typeof el === 'string') el = document.querySelector(el);
        if (!el) throw new Error('[EasyCal] Element not found');

        this.el = el;
        this.options = { ...DEFAULT_OPTIONS, ...options };
        this.currentDate = new Date(this.options.date);
        this.currentView = this.options.view;

        this.store = new EventStore();

        if (Array.isArray(this.options.events)) {
            this.store.load(this.options.events);
        }

        this.el.classList.add('easycal');

        this.render();
        this.bindEvents();
    }

    // ─── Public API ──────────────────────────────────────────────────────────

    changeView(view) {
        if (!VIEW_RENDERERS[view]) return;
        this.currentView = view;
        this.render();
    }

    today() {
        this.currentDate = new Date();
        this.render();
    }

    next() {
        this.currentDate = this.offsetDate(1);
        this.render();
    }

    prev() {
        this.currentDate = this.offsetDate(-1);
        this.render();
    }

    addEvent(event) {
        const e = this.store.add(event);
        this.render();
        return e;
    }

    removeEvent(id) {
        this.store.remove(id);
        this.render();
    }

    getEvents() {
        return this.store.getAll();
    }

    destroy() {
        this.el.innerHTML = '';
        this.el.classList.remove('easycal');
    }

    // ─── Internal ────────────────────────────────────────────────────────────

    offsetDate(direction) {
        const d = new Date(this.currentDate);

        switch (this.currentView) {
            case 'month':
                return DateUtils.addMonths(d, direction);
            case 'week':
                return DateUtils.addWeeks(d, direction);
            case 'day':
                return DateUtils.addDays(d, direction);
            default:
                return d;
        }
    }

    buildToolbar() {
        const tb = this.options.headerToolbar;
        if (!tb) return '';

        const buildSection = (section) => {
            if (!section) return '';

            const parts = section.split(/[\s,]+/);
            let html = '';

            const views = ['month', 'week', 'day', 'list'];

            parts.forEach(part => {
                if (part === 'prev') {
                    html += `<button data-action="prev">‹</button>`;
                }
                if (part === 'next') {
                    html += `<button data-action="next">›</button>`;
                }
                if (part === 'today') {
                    html += `<button data-action="today">Today</button>`;
                }
                if (part === 'title') {
                    html += `<span>${this.currentDate.toDateString()}</span>`;
                }
                if (views.includes(part)) {
                    const active = part === this.currentView ? 'active' : '';
                    html += `<button class="${active}" data-action="changeView" data-view="${part}">${VIEW_LABELS[part]}</button>`;
                }
            });

            return html;
        };

        return `
            <div class="ec-toolbar">
                <div>${buildSection(tb.left)}</div>
                <div>${buildSection(tb.center)}</div>
                <div>${buildSection(tb.right)}</div>
            </div>
        `;
    }

    render() {
        const renderer = VIEW_RENDERERS[this.currentView];
        if (!renderer) return;

        const toolbar = this.buildToolbar();
        const view = renderer(this);

        this.el.innerHTML = toolbar + view;

        this.bindEvents();
    }

    bindEvents() {
        this.el.querySelectorAll('[data-action]').forEach(btn => {
            btn.onclick = (e) => {
                const action = btn.dataset.action;

                if (action === 'prev') this.prev();
                if (action === 'next') this.next();
                if (action === 'today') this.today();
                if (action === 'changeView') this.changeView(btn.dataset.view);
            };
        });

        this.el.querySelectorAll('.ec-event').forEach(el => {
            el.onclick = (e) => {
                const event = this.store.getById(el.dataset.eventId);
                if (event && this.options.eventClick) {
                    this.options.eventClick({ event, el, jsEvent: e });
                }
            };
        });

        this.el.querySelectorAll('[data-date]').forEach(el => {
            el.onclick = (e) => {
                if (this.options.dateClick) {
                    this.options.dateClick({
                        date: new Date(el.dataset.date),
                        el,
                        jsEvent: e,
                    });
                }
            };
        });
    }
}

// ─── Global Export ───────────────────────────────────────────────────────────

if (typeof window !== 'undefined') {
    window.EasyCal = EasyCal;
}

export default EasyCal;