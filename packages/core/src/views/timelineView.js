import { addDays, clamp, endOfDay, endOfWeek, getDaysInRange, isToday, MS, startOfDay, startOfMonth, startOfWeek } from '../core/utils.js';
import { renderAbsoluteTimelineEvent } from '../components/eventRenderer.js';
import { buildTimeAxis } from '../components/timeAxis.js';

function computeRange(date, options) {
  const mode = options.timelineRange || 'day';
  if (mode === 'month') {
    const start = startOfMonth(date);
    return { start, end: endOfDay(addDays(start, 30)) };
  }
  if (mode === 'week') {
    return { start: startOfWeek(date, options.firstDay), end: endOfWeek(date, options.firstDay) };
  }

  const minHour = options.minTimeHour ?? 0;
  const maxHour = options.maxTimeHour ?? 24;
  const start = startOfDay(date);
  start.setHours(minHour, 0, 0, 0);
  const end = startOfDay(date);
  end.setHours(maxHour, 0, 0, 0);
  return { start, end };
}

export default function timelineView(calendar) {
  const { currentDate, options, eventModel } = calendar;
  const { start, end } = computeRange(currentDate, options);
  const events = eventModel.inRange(start, end);
  const resources = options.resources || [];
  const slotMs = (options.slotDurationMinutes || 60) * MS.minute;
  const slotCount = Math.max(Math.ceil((end - start) / slotMs), 1);

  let html = '<div class="ec-timeline-view">';
  html += `<div class="ec-timeline-axis-wrap">${buildTimeAxis(start, end, options)}</div>`;

  if (resources.length > 0) {
    html += '<div class="ec-timeline-resources">';
    resources.forEach(resource => {
      const rowEvents = events.filter(e => e.resourceId === resource.id || e.raw?.resourceId === resource.id);
      html += `<div class="ec-timeline-row">`;
      html += `<div class="ec-timeline-resource">${resource.title}</div>`;
      html += `<div class="ec-timeline-lane" style="--slots:${slotCount}">`;
      for (let i = 0; i < slotCount; i += 1) html += '<div class="ec-timeline-slot"></div>';
      rowEvents.forEach(event => {
        html += renderAbsoluteTimelineEvent(event, start, end, options);
      });
      html += '</div></div>';
    });
    html += '</div>';
  } else {
    html += `<div class="ec-timeline-lane ec-no-resource" style="--slots:${slotCount}">`;
    for (let i = 0; i < slotCount; i += 1) html += '<div class="ec-timeline-slot"></div>';
    events.forEach(event => {
      html += renderAbsoluteTimelineEvent(event, start, end, options);
    });
    html += '</div>';
  }

  const now = new Date();
  if (now >= start && now <= end) {
    const pct = clamp(((now - start) / (end - start || 1)) * 100, 0, 100);
    html += `<div class="ec-now-indicator" style="left:${pct}%"></div>`;
  }

  if (options.timelineRange !== 'day') {
    const dayTicks = getDaysInRange(start, end);
    html += '<div class="ec-timeline-dayticks">';
    dayTicks.forEach(day => {
      html += `<div class="ec-daytick ${isToday(day) ? 'ec-today' : ''}">${day.getDate()}</div>`;
    });
    html += '</div>';
  }

  html += '</div>';
  return html;
}
