import { addDays, clamp, endOfDay, endOfWeek, MS, startOfDay, startOfWeek } from '../core/timeUtils.js';
import { buildTimelineSlots, renderTimelineAxis } from '../layout/timelineAxis.js';
import { renderResourceRows } from '../layout/resourceRows.js';
import { positionEventsByResource } from '../layout/eventPositioning.js';
import { renderResourceTimelineEvent } from '../components/eventRenderer.js';

function getRange(date, options) {
  const mode = options.resourceTimelineRange || 'day';
  if (mode === 'week') {
    return { viewStart: startOfWeek(date, options.firstDay), viewEnd: endOfWeek(date, options.firstDay) };
  }
  if (mode === 'days') {
    const days = options.visibleDays || 3;
    const viewStart = startOfDay(date);
    return { viewStart, viewEnd: endOfDay(addDays(viewStart, days - 1)) };
  }

  const minHour = options.minTimeHour ?? 0;
  const maxHour = options.maxTimeHour ?? 24;
  const viewStart = startOfDay(date);
  viewStart.setHours(minHour, 0, 0, 0);
  const viewEnd = startOfDay(date);
  viewEnd.setHours(maxHour, 0, 0, 0);
  return { viewStart, viewEnd };
}

export default function resourceTimelineView(calendar) {
  const { currentDate, options, eventModel, resourceModel } = calendar;
  const resources = resourceModel.all();
  const rowHeight = options.resourceRowHeight || 68;
  const { viewStart, viewEnd } = getRange(currentDate, options);
  const slots = buildTimelineSlots(viewStart, viewEnd, options);
  const events = eventModel.inRange(viewStart, viewEnd);
  const positionedEvents = positionEventsByResource(events, resources, viewStart, viewEnd, rowHeight);

  let html = '<div class="ec-resource-timeline">';
  html += '<div class="ec-rt-header">';
  html += '<div class="ec-rt-header-resource">Resources</div>';
  html += `<div class="ec-rt-header-axis">${renderTimelineAxis(slots)}</div>`;
  html += '</div>';

  html += '<div class="ec-rt-body">';
  html += renderResourceRows(resources);

  html += `<div class="ec-rt-grid" style="--rt-slots:${slots.length};--rt-row-height:${rowHeight}px">`;
  resources.forEach((resource, index) => {
    html += `<div class="ec-rt-row" data-resource-id="${resource.id}" data-resource-index="${index}">`;
    for (let i = 0; i < slots.length; i += 1) {
      const slot = slots[i];
      html += `<div class="ec-rt-cell" data-date="${slot.date.toISOString()}" data-resource-id="${resource.id}"></div>`;
    }
    html += '</div>';
  });

  positionedEvents.forEach(item => {
    html += renderResourceTimelineEvent(item, options);
  });

  const now = new Date();
  if (now >= viewStart && now <= viewEnd) {
    const left = clamp(((now - viewStart) / (viewEnd - viewStart || MS.minute)) * 100, 0, 100);
    html += `<div class="ec-rt-now" style="left:${left}%"></div>`;
  }

  html += '</div></div></div>';

  return html;
}
