import { EventModel } from './eventModel.js';
import { ResourceModel } from './resourceModel.js';
import { addDays, addMonths, addWeeks, mergeOptions, startOfDay } from './timeUtils.js';
import resourceTimelineView from '../views/resourceTimelineView.js';
import monthView from '../views/monthView.js';
import timeGridView from '../views/timeGridView.js';
import interactionPlugin from '../plugins/interactionPlugin.js';
import popupPlugin from '../plugins/popupPlugin.js';

const DEFAULT_OPTIONS = {
  defaultView: 'resourceTimelineDay',
  initialView: null,
  locale: 'default',
  firstDay: 1,
  resources: [],
  events: [],
  editable: true,
  selectable: true,
  eventColor: '#3b82f6',
  eventTextColor: '#ffffff',
  resourceRowHeight: 44,
  views: {
    resourceTimelineDay: {},
    resourceTimelineWeek: {},
    resourceTimelineMonth: {},
  },
  onEventClick: null,
  onDateClick: null,
  eventDrag: null,
  eventResize: null,
  plugins: ['interaction', 'popup'],
};

const VIEW_RENDERERS = {
  resourceTimelineDay: resourceTimelineView,
  resourceTimelineWeek: resourceTimelineView,
  resourceTimelineMonth: resourceTimelineView,
  month: monthView,
  week: timeGridView,
  day: timeGridView,
};

function titleFor(view, date, locale) {
  if (view === 'resourceTimelineDay') {
    return date.toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' });
  }
  if (view === 'resourceTimelineWeek') {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 6);
    return `${start.toLocaleDateString(locale, { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }
  return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
}

export default class CalendarCore {
  constructor(el, options = {}) {
    this.el = typeof el === 'string' ? document.querySelector(el) : el;
    if (!this.el) throw new Error('[EasyCal] element not found');

    this.options = mergeOptions(DEFAULT_OPTIONS, options);
    this.currentView = this.options.initialView || this.options.defaultView;
    this.currentDate = startOfDay(options.initialDate || new Date());

    this.eventModel = new EventModel(this.options.events);
    this.resourceModel = new ResourceModel(this.options.resources);
    this.viewRenderers = { ...VIEW_RENDERERS };

    this.plugins = [];
    this._nowTimer = null;
    this._initPlugins();
    this.render();
  }

  _initPlugins() {
    if ((this.options.plugins || []).includes('interaction')) this.plugins.push(interactionPlugin(this));
    if ((this.options.plugins || []).includes('popup')) this.plugins.push(popupPlugin(this));
  }

  _offset(direction) {
    if (this.currentView === 'resourceTimelineMonth') return addMonths(this.currentDate, direction);
    if (this.currentView === 'resourceTimelineWeek') return addWeeks(this.currentDate, direction);
    return addDays(this.currentDate, direction);
  }

  _buildHeader() {
    const title = titleFor(this.currentView, this.currentDate, this.options.locale);
    const active = this.currentView;
    return `<div class="ec-header">
      <div class="ec-header-left">
        <button class="ec-nav-btn" data-action="prev">‹</button>
        <button class="ec-nav-btn" data-action="next">›</button>
        <button class="ec-nav-btn" data-action="open-popup">+</button>
      </div>
      <div class="ec-header-center">${title}</div>
      <div class="ec-header-right">
        <button class="ec-view-btn ${active === 'resourceTimelineDay' ? 'active' : ''}" data-view="resourceTimelineDay">day</button>
        <button class="ec-view-btn ${active === 'resourceTimelineWeek' ? 'active' : ''}" data-view="resourceTimelineWeek">week</button>
        <button class="ec-view-btn ${active === 'resourceTimelineMonth' ? 'active' : ''}" data-view="resourceTimelineMonth">month</button>
      </div>
    </div>`;
  }

  _bindHeader() {
    this.el.querySelector('[data-action="prev"]').onclick = () => this.prev();
    this.el.querySelector('[data-action="next"]').onclick = () => this.next();
    this.el.querySelectorAll('[data-view]').forEach(btn => {
      btn.onclick = () => this.changeView(btn.dataset.view);
    });
  }

  _wireScrollSync() {
    const timeline = this.el.querySelector('.ec-timeline');
    const resourceCol = this.el.querySelector('.ec-resource-column');
    if (!timeline || !resourceCol) return;

    timeline.addEventListener('scroll', () => {
      resourceCol.scrollTop = timeline.scrollTop;
    });
  }

  _startNowIndicator() {
    clearInterval(this._nowTimer);
    const update = () => {
      const metrics = this._viewMetrics;
      if (!metrics) return;
      const nowEl = this.el.querySelector('.ec-now-line');
      if (!nowEl) return;
      const now = new Date();
      if (now < metrics.viewStart || now > metrics.viewEnd) {
        nowEl.style.display = 'none';
        return;
      }
      nowEl.style.display = 'block';
      const left = ((now - metrics.viewStart) / (metrics.viewEnd - metrics.viewStart || 1)) * metrics.timelineWidth;
      nowEl.style.left = `${left}px`;
    };

    update();
    this._nowTimer = setInterval(update, 60 * 1000);
  }

  render() {
    const renderer = this.viewRenderers[this.currentView];
    if (!renderer) throw new Error(`Unknown view ${this.currentView}`);

    this.el.className = 'ec';
    this.el.innerHTML = `${this._buildHeader()}${renderer(this)}`;
    this._bindHeader();
    this._wireScrollSync();
    this._startNowIndicator();

    this.plugins.forEach(plugin => plugin.bind?.(this.el));
  }

  next() { this.currentDate = this._offset(1); this.render(); }
  prev() { this.currentDate = this._offset(-1); this.render(); }
  today() { this.currentDate = startOfDay(new Date()); this.render(); }

  changeView(view) {
    if (!this.viewRenderers[view]) return;
    this.currentView = view;
    this.render();
  }

  addEvent(event) { const e = this.eventModel.add(event); this.render(); return e; }
  removeEvent(id) { this.eventModel.remove(id); this.render(); }
  updateEvent(id, patch) { const e = this.eventModel.update(id, patch); this.render(); return e; }
  getEvents() { return this.eventModel.all(); }

  destroy() {
    clearInterval(this._nowTimer);
    this.plugins.forEach(plugin => plugin.destroy?.());
    this.el.innerHTML = '';
    this.el.className = '';
  }
}
