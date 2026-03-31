// @ts-nocheck
import monthView from '../views/monthView';
import timeGridView from '../views/timeGridView';
import { startOfWeek, endOfWeek } from '../core/timeUtils';

const VIEWS = {
  month: monthView,
  week: timeGridView,
  day: timeGridView,
};

function titleFor(view, date, locale, firstDay) {
  if (view === 'month') return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  if (view === 'week') {
    const start = startOfWeek(date, firstDay);
    const end = endOfWeek(date, firstDay);
    return `${start.toLocaleDateString(locale)} - ${end.toLocaleDateString(locale)}`;
  }
  return date.toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' });
}

export default class StandardRenderer {
  constructor(calendar) {
    this.calendar = calendar;
    this.mode = 'standard';
    this.allowedViews = ['month', 'week', 'day'];
  }

  render() {
    const cal = this.calendar;
    const view = this.allowedViews.includes(cal.currentView) ? cal.currentView : 'month';
    cal.currentView = view;

    const body = VIEWS[view](cal);
    const title = titleFor(view, cal.currentDate, cal.options.locale, cal.options.firstDay);

    return `
      <div class="ec-header">
        <div class="ec-header-left">
          <button class="ec-nav-btn" data-action="prev">‹</button>
          <button class="ec-nav-btn" data-action="next">›</button>
          <button class="ec-nav-btn" data-action="today">Today</button>
          <button class="ec-nav-btn" data-action="open-popup">+</button>
        </div>
        <div class="ec-header-center">${title}</div>
        <div class="ec-header-right">
          <button class="ec-view-btn ${view === 'month' ? 'active' : ''}" data-view="month">month</button>
          <button class="ec-view-btn ${view === 'week' ? 'active' : ''}" data-view="week">week</button>
          <button class="ec-view-btn ${view === 'day' ? 'active' : ''}" data-view="day">day</button>
        </div>
      </div>
      <div class="ec-standard-body">${body}</div>
    `;
  }
}
