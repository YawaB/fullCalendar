import { EventModel } from './eventModel.js';
import { addDays, addMonths, addWeeks, endOfDay, endOfWeek, mergeOptions, startOfDay, startOfWeek } from './utils.js';
import monthView from '../views/monthView.js';
import timeGridView from '../views/timeGridView.js';
import timelineView from '../views/timelineView.js';
import interactionPlugin from '../plugins/interactionPlugin.js';
import popupPlugin from '../plugins/popupPlugin.js';

const DEFAULT_OPTIONS = {
  initialView: 'month',
  locale: 'default',
  firstDay: 1,
  events: [],
  eventColor: '#2563eb',
  eventTextColor: '#ffffff',
  editable: false,
  selectable: true,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'month,week,day,timeline',
  },
  timelineRange: 'day',
  slotDurationMinutes: 60,
  minTimeHour: 0,
  maxTimeHour: 24,
  plugins: ['interaction', 'popup'],

  onEventClick: null,
  onDateClick: null,
  eventDrag: null,
  eventResize: null,
};

const VIEW_RENDERERS = {
  month: monthView,
  week: timeGridView,
  day: timeGridView,
  timeline: timelineView,
};

function makeTitle(calendar) {
  const { currentDate, currentView, options } = calendar;
  if (currentView === 'month') {
    return currentDate.toLocaleDateString(options.locale, { month: 'long', year: 'numeric' });
  }
  if (currentView === 'timeline' && options.timelineRange !== 'day') {
    const start = options.timelineRange === 'week' ? startOfWeek(currentDate, options.firstDay) : startOfDay(currentDate);
    const end = options.timelineRange === 'week' ? endOfWeek(currentDate, options.firstDay) : endOfDay(addDays(currentDate, 30));
    return `${start.toLocaleDateString(options.locale)} - ${end.toLocaleDateString(options.locale)}`;
  }

  return currentDate.toLocaleDateString(options.locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default class CalendarCore {
  constructor(el, options = {}) {
    this.el = typeof el === 'string' ? document.querySelector(el) : el;
    if (!this.el) throw new Error('[EasyCal] Element not found');

    this.options = mergeOptions(DEFAULT_OPTIONS, options);
    this.currentDate = new Date(options.initialDate || new Date());
    this.currentView = this.options.initialView;
    this.eventModel = new EventModel(this.options.events);

    this.viewRenderers = { ...VIEW_RENDERERS, ...(this.options.views || {}) };
    this.plugins = [];

    this._initPlugins();
    this.render();
  }

  _initPlugins() {
    const active = this.options.plugins || [];
    if (active.includes('interaction')) this.plugins.push(interactionPlugin(this));
    if (active.includes('popup')) this.plugins.push(popupPlugin(this));
  }

  _offsetDate(direction) {
    if (this.currentView === 'month') return addMonths(this.currentDate, direction);
    if (this.currentView === 'week') return addWeeks(this.currentDate, direction);
    if (this.currentView === 'day') return addDays(this.currentDate, direction);

    if (this.options.timelineRange === 'week') return addWeeks(this.currentDate, direction);
    if (this.options.timelineRange === 'month') return addMonths(this.currentDate, direction);
    return addDays(this.currentDate, direction);
  }

  _buildToolbarSection(definition = '') {
    return definition
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(token => {
        if (token === 'prev') return '<button class="ec-btn" data-action="prev">‹</button>';
        if (token === 'next') return '<button class="ec-btn" data-action="next">›</button>';
        if (token === 'today') return '<button class="ec-btn" data-action="today">Today</button>';
        if (token === 'title') return `<span class="ec-title">${makeTitle(this)}</span>`;
        if (this.viewRenderers[token]) {
          const active = token === this.currentView ? 'ec-btn-active' : '';
          return `<button class="ec-btn ${active}" data-action="change-view" data-view="${token}">${token}</button>`;
        }
        return '';
      })
      .join('');
  }

  _buildToolbar() {
    const tb = this.options.headerToolbar;
    if (!tb) return '';

    return `<div class="ec-toolbar">
      <div>${this._buildToolbarSection(tb.left)}</div>
      <div>${this._buildToolbarSection(tb.center)}</div>
      <div>${this._buildToolbarSection(tb.right)}</div>
      <div><button class="ec-btn" data-action="open-add-popup">+ Add Event</button></div>
    </div>`;
  }

  _bindToolbarActions() {
    this.el.querySelectorAll('[data-action="prev"]').forEach(btn => (btn.onclick = () => this.prev()));
    this.el.querySelectorAll('[data-action="next"]').forEach(btn => (btn.onclick = () => this.next()));
    this.el.querySelectorAll('[data-action="today"]').forEach(btn => (btn.onclick = () => this.today()));
    this.el.querySelectorAll('[data-action="change-view"]').forEach(btn => {
      btn.onclick = () => this.changeView(btn.dataset.view);
    });
  }

  render() {
    const renderer = this.viewRenderers[this.currentView];
    if (!renderer) throw new Error(`[EasyCal] Unknown view: ${this.currentView}`);

    this.el.classList.add('easycal');
    this.el.innerHTML = `${this._buildToolbar()}${renderer(this)}`;
    this._bindToolbarActions();
    this.plugins.forEach(plugin => plugin.bind?.(this.el));

    if (this.currentView === 'timeline') {
      const nowIndicator = this.el.querySelector('.ec-now-indicator');
      if (nowIndicator) {
        const container = this.el.querySelector('.ec-timeline-axis-wrap');
        if (container) {
          const scrollLeft = (nowIndicator.offsetLeft || 0) - container.clientWidth / 2;
          container.scrollLeft = Math.max(scrollLeft, 0);
        }
      }
    }
  }

  next() {
    this.currentDate = this._offsetDate(1);
    this.render();
  }

  prev() {
    this.currentDate = this._offsetDate(-1);
    this.render();
  }

  today() {
    this.currentDate = new Date();
    this.render();
  }

  changeView(viewName) {
    if (!this.viewRenderers[viewName]) return;
    this.currentView = viewName;
    this.render();
  }

  addEvent(event) {
    const created = this.eventModel.add(event);
    this.render();
    return created;
  }

  removeEvent(id) {
    this.eventModel.remove(id);
    this.render();
  }

  updateEvent(id, patch) {
    const updated = this.eventModel.update(id, patch);
    this.render();
    return updated;
  }

  getEvents() {
    return this.eventModel.all();
  }

  destroy() {
    this.plugins.forEach(plugin => plugin.destroy?.());
    this.el.innerHTML = '';
    this.el.classList.remove('easycal');
  }
}
