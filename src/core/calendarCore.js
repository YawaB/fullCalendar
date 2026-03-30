import { EventModel } from './eventModel.js';
import { ResourceModel } from './resourceModel.js';
import { addDays, addMonths, addWeeks, endOfWeek, mergeOptions, startOfDay, startOfWeek } from './timeUtils.js';
import monthView from '../views/monthView.js';
import timeGridView from '../views/timeGridView.js';
import resourceTimelineView from '../views/resourceTimelineView.js';
import interactionPlugin from '../plugins/interactionPlugin.js';
import popupPlugin from '../plugins/popupPlugin.js';

const DEFAULT_OPTIONS = {
  initialView: 'resourceTimeline',
  locale: 'default',
  firstDay: 1,
  resources: [],
  events: [],
  eventColor: '#ef4444',
  eventTextColor: '#ffffff',
  editable: true,
  selectable: true,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'resourceTimeline,month,week,day',
  },
  resourceTimelineRange: 'day',
  slotDurationMinutes: 60,
  minTimeHour: 0,
  maxTimeHour: 24,
  resourceRowHeight: 68,
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
  resourceTimeline: resourceTimelineView,
};

function makeTitle(cal) {
  if (cal.currentView === 'month') {
    return cal.currentDate.toLocaleDateString(cal.options.locale, { month: 'long', year: 'numeric' });
  }
  if (cal.currentView === 'week') {
    const start = startOfWeek(cal.currentDate, cal.options.firstDay);
    const end = endOfWeek(cal.currentDate, cal.options.firstDay);
    return `${start.toLocaleDateString(cal.options.locale)} - ${end.toLocaleDateString(cal.options.locale)}`;
  }

  return cal.currentDate.toLocaleDateString(cal.options.locale, {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
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
    this.resourceModel = new ResourceModel(this.options.resources);
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

    if (this.options.resourceTimelineRange === 'week') return addWeeks(this.currentDate, direction);
    if (this.options.resourceTimelineRange === 'days') return addDays(this.currentDate, (this.options.visibleDays || 3) * direction);
    return addDays(this.currentDate, direction);
  }

  _toolbarSection(def = '') {
    return def
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
      <div>${this._toolbarSection(tb.left)}</div>
      <div>${this._toolbarSection(tb.center)}</div>
      <div>${this._toolbarSection(tb.right)}</div>
      <div><button class="ec-btn" data-action="open-add-popup">+ Add Event</button></div>
    </div>`;
  }

  _bindToolbar() {
    this.el.querySelectorAll('[data-action="prev"]').forEach(el => (el.onclick = () => this.prev()));
    this.el.querySelectorAll('[data-action="next"]').forEach(el => (el.onclick = () => this.next()));
    this.el.querySelectorAll('[data-action="today"]').forEach(el => (el.onclick = () => this.today()));
    this.el.querySelectorAll('[data-action="change-view"]').forEach(el => {
      el.onclick = () => this.changeView(el.dataset.view);
    });
  }

  render() {
    const renderer = this.viewRenderers[this.currentView];
    if (!renderer) throw new Error(`Unknown view: ${this.currentView}`);

    this.el.classList.add('easycal');
    this.el.innerHTML = `${this._buildToolbar()}${renderer(this)}`;
    this._bindToolbar();
    this.plugins.forEach(plugin => plugin.bind?.(this.el));

    if (this.currentView === 'resourceTimeline') {
      const axis = this.el.querySelector('.ec-rt-header-axis');
      const now = this.el.querySelector('.ec-rt-now');
      if (axis && now) axis.scrollLeft = Math.max(now.offsetLeft - axis.clientWidth / 2, 0);
    }
  }

  next() { this.currentDate = this._offsetDate(1); this.render(); }
  prev() { this.currentDate = this._offsetDate(-1); this.render(); }
  today() { this.currentDate = startOfDay(new Date()); this.render(); }

  changeView(view) {
    if (!this.viewRenderers[view]) return;
    this.currentView = view;
    this.render();
  }

  addEvent(event) { const out = this.eventModel.add(event); this.render(); return out; }
  removeEvent(id) { this.eventModel.remove(id); this.render(); }
  updateEvent(id, patch) { const out = this.eventModel.update(id, patch); this.render(); return out; }
  getEvents() { return this.eventModel.all(); }

  destroy() {
    this.plugins.forEach(plugin => plugin.destroy?.());
    this.el.innerHTML = '';
    this.el.classList.remove('easycal');
  }
}
