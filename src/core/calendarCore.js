import { EventModel } from './eventModel.js';
import { ResourceModel } from './resourceModel.js';
import { addDays, addMonths, addWeeks, mergeOptions, startOfDay } from './timeUtils.js';
import StandardRenderer from '../renderers/standardRenderer.js';
import TimelineRenderer from '../renderers/timelineRenderer.js';
import interactionPlugin from '../plugins/interactionPlugin.js';
import popupPlugin from '../plugins/popupPlugin.js';

const DEFAULT_OPTIONS = {
  mode: 'standard',
  defaultView: 'month',
  initialView: null,
  locale: 'default',
  firstDay: 1,
  resources: [],
  events: [],
  editable: true,
  selectable: true,
  eventColor: '#3b82f6',
  eventTextColor: '#ffffff',
  slotMinTime: '00:00:00',
  slotMaxTime: '24:00:00',
  resourceRowHeight: 44,
  views: {
    month: {},
    week: {},
    day: {},
    resourceTimelineDay: {},
    resourceTimelineWeek: {},
    resourceTimelineMonth: {},
  },
  onEventClick: null,
  onDateClick: null,
  onDateChange: null,
  eventDrag: null,
  eventResize: null,
  plugins: ['interaction', 'popup'],
};

export default class CalendarCore {
  constructor(el, options = {}) {
    this.el = typeof el === 'string' ? document.querySelector(el) : el;
    if (!this.el) throw new Error('[EasyCal] element not found');

    this.options = mergeOptions(DEFAULT_OPTIONS, options);
    this.mode = this.options.mode || 'standard';

    this.renderer = this.mode === 'timeline' ? new TimelineRenderer(this) : new StandardRenderer(this);

    const initialView = this.options.initialView || this.options.defaultView;
    this.currentView = this.renderer.allowedViews.includes(initialView)
      ? initialView
      : this.renderer.allowedViews[0];

    this.currentDate = startOfDay(options.initialDate || new Date());
    this.eventModel = new EventModel(this.options.events);
    this.resourceModel = new ResourceModel(this.options.resources);

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
    if (this.currentView === 'month') return addMonths(this.currentDate, direction);
    if (this.currentView === 'week') return addWeeks(this.currentDate, direction);
    if (this.currentView === 'resourceTimelineMonth') return addMonths(this.currentDate, direction);
    if (this.currentView === 'resourceTimelineWeek') return addWeeks(this.currentDate, direction);
    return addDays(this.currentDate, direction);
  }

  _setCurrentDate(nextDate, source = 'api') {
    const normalizedDate = startOfDay(nextDate);
    this.currentDate = normalizedDate;
    this.options.onDateChange?.({ date: normalizedDate, source, view: this.currentView });
    this.render();
  }

  _bindHeader() {
    this.el.querySelector('[data-action="prev"]').onclick = () => this.prev();
    this.el.querySelector('[data-action="next"]').onclick = () => this.next();
    this.el.querySelector('[data-action="today"]').onclick = () => this.today();

    const datePickerButton = this.el.querySelector('[data-action="toggle-date-picker"]');
    const datePickerInput = this.el.querySelector('[data-action="date-picker-input"]');

    if (datePickerButton && datePickerInput) {
      datePickerButton.onclick = () => {
        datePickerInput.value = this.currentDate.toISOString().slice(0, 10);
        datePickerInput.classList.add('open');
        if (typeof datePickerInput.showPicker === 'function') {
          datePickerInput.showPicker();
        } else {
          datePickerInput.focus();
          datePickerInput.click();
        }
      };

      datePickerInput.onchange = (event) => {
        const selectedDate = event.target.value;
        if (selectedDate) this.gotoDate(selectedDate, 'date-picker');
        datePickerInput.classList.remove('open');
      };

      datePickerInput.onblur = () => datePickerInput.classList.remove('open');
    }

    this.el.querySelectorAll('[data-view]').forEach(btn => {
      btn.onclick = () => this.changeView(btn.dataset.view);
    });
  }

  _wireScrollSync() {
    if (this.mode !== 'timeline') return;
    const timeline = this.el.querySelector('.ec-timeline');
    const resourceCol = this.el.querySelector('.ec-resource-column');
    if (!timeline || !resourceCol) return;
    timeline.addEventListener('scroll', () => {
      resourceCol.scrollTop = timeline.scrollTop;
    });
  }

  _startNowIndicator() {
    clearInterval(this._nowTimer);
    if (this.mode !== 'timeline') return;

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
    this.el.className = 'ec';
    this.el.innerHTML = this.renderer.render();

    this._bindHeader();
    this._wireScrollSync();
    this._startNowIndicator();
    this.plugins.forEach(plugin => plugin.bind?.(this.el));
  }

  gotoDate(date, source = 'api') {
    const parsedDate = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return;
    this._setCurrentDate(parsedDate, source);
  }

  next() { this.gotoDate(this._offset(1), 'next'); }
  prev() { this.gotoDate(this._offset(-1), 'prev'); }
  today() { this.gotoDate(new Date(), 'today'); }

  changeView(view) {
    if (!this.renderer.allowedViews.includes(view)) return;
    this.currentView = view;
    this.render();
  }

  addEvent(event) { const e = this.eventModel.add(event); this.render(); return e; }
  removeEvent(id) { this.eventModel.remove(id); this.render(); }
  updateEvent(id, patch) { const e = this.eventModel.update(id, patch); this.render(); return e; }
  getEvents() { return this.eventModel.all(); }

  setOptions(nextOptions = {}) {
    const previousMode = this.mode;
    this.options = mergeOptions(this.options, nextOptions);
    this.mode = this.options.mode || this.mode;

    if (nextOptions.events) this.eventModel.load(nextOptions.events);
    if (nextOptions.resources) this.resourceModel.load(nextOptions.resources);

    if (previousMode !== this.mode) {
      this.renderer = this.mode === 'timeline' ? new TimelineRenderer(this) : new StandardRenderer(this);
      this.currentView = this.renderer.allowedViews[0];
    }

    this.render();
  }

  destroy() {
    clearInterval(this._nowTimer);
    this.plugins.forEach(plugin => plugin.destroy?.());
    this.el.innerHTML = '';
    this.el.className = '';
  }
}
