import { addDays, endOfDay, endOfMonth, endOfWeek, startOfDay, startOfMonth, startOfWeek } from '../core/timeUtils.js';
import { buildAxis, renderAxis } from '../layout/timelineAxis.js';
import { layoutEvents } from '../layout/eventPositioning.js';
import { renderTimelineEvent } from '../components/eventRenderer.js';
import { renderResourceColumn } from '../components/resourceRenderer.js';

function resolveRange(date, viewName, firstDay) {
  if (viewName === 'resourceTimelineWeek') {
    const start = startOfWeek(date, firstDay);
    return { viewStart: start, viewEnd: endOfWeek(start, firstDay), slotDurationMinutes: 24 * 60 };
  }
  if (viewName === 'resourceTimelineMonth') {
    const start = startOfMonth(date);
    return { viewStart: start, viewEnd: endOfMonth(start), slotDurationMinutes: 24 * 60 };
  }

  const start = startOfDay(date);
  start.setHours(6, 0, 0, 0);
  const end = new Date(start);
  end.setHours(18, 0, 0, 0);
  return { viewStart: start, viewEnd: end, slotDurationMinutes: 60 };
}

export default function resourceTimelineView(calendar) {
  const { currentDate, currentView, options, eventModel, resourceModel } = calendar;
  const resources = resourceModel.flat();
  const rowHeight = options.resourceRowHeight || 44;
  const laneHeight = 20;
  const laneGap = 3;

  const { viewStart, viewEnd, slotDurationMinutes } = resolveRange(currentDate, currentView, options.firstDay);
  const slotWidth = currentView === 'resourceTimelineDay' ? 92 : 72;

  const slots = buildAxis(viewStart, addDays(viewEnd, currentView === 'resourceTimelineMonth' ? 1 : 0), slotDurationMinutes, currentView, options.locale);
  const timelineWidth = slots.length * slotWidth;
  const events = eventModel.inRange(viewStart, viewEnd);

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
    .map(resource => `<div class="ec-grid-row" style="height:${rowHeight}px" data-resource-id="${resource.id}">${slots.map(slot => `<div class="ec-grid-cell" data-date="${slot.start.toISOString()}" data-resource-id="${resource.id}" style="width:${slotWidth}px"></div>`).join('')}</div>`)
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
    <div class="ec-body">
      <div class="ec-resource-column">${renderResourceColumn(resources, rowHeight)}</div>
      <div class="ec-timeline" data-timeline-root="1">
        <div class="ec-time-header" style="width:${timelineWidth}px">${renderAxis(slots, slotWidth)}</div>
        <div class="ec-grid" style="width:${timelineWidth}px">${gridRows}</div>
        <div class="ec-events-layer" style="width:${timelineWidth}px;height:${resources.length * rowHeight}px">${positioned.map(item => renderTimelineEvent(item, options)).join('')}${nowIndicator}</div>
      </div>
    </div>
  `;
}
