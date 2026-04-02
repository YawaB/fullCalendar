import { addDays, endOfDay, endOfMonth, endOfWeek, parseTimeToMinutes, startOfDay, startOfMonth, startOfWeek } from '../core/timeUtils.js';
import { buildAxis, renderAxis } from '../layout/timelineAxis.js';
import { layoutEvents } from '../layout/eventPositioning.js';
import { renderTimelineEvent } from '../components/eventRenderer.js';
import { renderResourceColumn } from '../components/resourceRenderer.js';

function resolveRange(date, viewName, options) {
  const minMinutes = parseTimeToMinutes(options.slotMinTime, 0);
  const maxMinutes = parseTimeToMinutes(options.slotMaxTime, 24 * 60);
  if (viewName === 'resourceTimelineWeek') {
    const start = startOfWeek(date, options.firstDay);
    const viewStart = new Date(start);
    viewStart.setHours(Math.floor(minMinutes / 60), minMinutes % 60, 0, 0);
    const weekEnd = endOfWeek(start, options.firstDay);
    const viewEnd = new Date(weekEnd);
    viewEnd.setHours(Math.floor((maxMinutes - 1) / 60), (maxMinutes - 1) % 60, 59, 999);
    return { viewStart, viewEnd, slotDurationMinutes: 60 };
  }
  if (viewName === 'resourceTimelineMonth') {
    const start = startOfMonth(date);
    return { viewStart: start, viewEnd: endOfMonth(start), slotDurationMinutes: 24 * 60 };
  }

  const start = startOfDay(date);
  const minHours = Math.floor(minMinutes / 60);
  const minMins = minMinutes % 60;
  const maxHours = Math.floor(maxMinutes / 60);
  const maxMins = maxMinutes % 60;
  start.setHours(minHours, minMins, 0, 0);
  const end = new Date(start);
  end.setHours(maxHours, maxMins, 0, 0);
  return { viewStart: start, viewEnd: end, slotDurationMinutes: 60 };
}

export default function resourceTimelineView(calendar) {
  const { currentDate, currentView, options, eventModel, resourceModel } = calendar;
  const resources = resourceModel.flat();
  const rowHeight = options.resourceRowHeight || 44;
  const resourceAreaWidth = typeof options.resourceAreaWidth === 'number'
    ? `${options.resourceAreaWidth}px`
    : (options.resourceAreaWidth || '350px');
  const laneHeight = 20;
  const laneGap = 3;

  const { viewStart, viewEnd, slotDurationMinutes } = resolveRange(currentDate, currentView, options);
  const slotWidth = currentView === 'resourceTimelineDay' ? 92 : currentView === 'resourceTimelineWeek' ? 42 : 72;

  const slots = buildAxis(viewStart, addDays(viewEnd, currentView === 'resourceTimelineMonth' ? 1 : 0), slotDurationMinutes, currentView, options.locale);
  const timelineWidth = Math.max(slots.length * slotWidth, currentView === 'resourceTimelineWeek' ? 2400 : 0);
  const events = eventModel.inRange(viewStart, viewEnd);
  const resourceHeaderLabel = options.resourceAreaHeaderContent || 'Rooms';

  const positioned = layoutEvents({
    events,
    resources,
    viewStart,
    viewEnd,
    rowHeight,
    laneHeight,
    laneGap,
    timelineWidth,
  });

  const gridRows = resources
    .map(resource => `<div class="ec-grid-row" data-resource-id="${resource._id}">${slots.map(slot => `<div class="ec-grid-cell" data-date="${slot.start.toISOString()}" data-resource-id="${resource._id}" style="width:${slotWidth}px"></div>`).join('')}</div>`)
    .join('');

  const nowIndicator = `<div class="ec-now-line"></div>`;

  calendar._viewMetrics = {
    currentView,
    viewStart,
    viewEnd,
    slotDurationMinutes,
    slotWidth,
    timelineWidth,
    rowHeight,
    laneHeight,
    laneGap,
    resources,
  };

  return `
    <div class="ec-body ec-timeline-layout" style="--ec-resource-row-height:${rowHeight}px;--ec-resource-area-width:${resourceAreaWidth}">
      <div class="ec-timeline-header-row">
        <div class="ec-resource-header">${resourceHeaderLabel}</div>
        <div class="ec-time-header-scroller" data-time-header-scroller="1">
          <div class="ec-time-header" style="width:${timelineWidth}px">${renderAxis(slots, slotWidth, currentView)}</div>
        </div>
      </div>
      <div class="ec-timeline-body">
        <div class="ec-resource-column">${renderResourceColumn(resources, { resourceRenderer: options.resourceRenderer })}</div>
        <div class="ec-timeline" data-timeline-root="1">
          <div class="ec-grid-wrap" style="width:${timelineWidth}px;height:${resources.length * rowHeight}px">
            <div class="ec-grid">${gridRows}</div>
            <div class="ec-events-layer" style="width:${timelineWidth}px;height:${resources.length * rowHeight}px">${positioned.map(item => renderTimelineEvent(item, options)).join('')}${nowIndicator}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}
