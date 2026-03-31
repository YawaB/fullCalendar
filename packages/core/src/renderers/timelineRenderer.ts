// @ts-nocheck
import resourceTimelineView from '../views/resourceTimelineView';

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

export default class TimelineRenderer {
  constructor(calendar) {
    this.calendar = calendar;
    this.mode = 'timeline';
    this.allowedViews = ['resourceTimelineDay', 'resourceTimelineWeek', 'resourceTimelineMonth'];
  }

  render() {
    const cal = this.calendar;
    const view = this.allowedViews.includes(cal.currentView) ? cal.currentView : 'resourceTimelineDay';
    cal.currentView = view;

    const body = resourceTimelineView(cal);
    const title = titleFor(view, cal.currentDate, cal.options.locale);

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
          <button class="ec-view-btn ${view === 'resourceTimelineDay' ? 'active' : ''}" data-view="resourceTimelineDay">day</button>
          <button class="ec-view-btn ${view === 'resourceTimelineWeek' ? 'active' : ''}" data-view="resourceTimelineWeek">week</button>
          <button class="ec-view-btn ${view === 'resourceTimelineMonth' ? 'active' : ''}" data-view="resourceTimelineMonth">month</button>
        </div>
      </div>
      ${body}
    `;
  }
}
