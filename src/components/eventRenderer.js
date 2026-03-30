import { clamp } from '../core/timeUtils.js';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function renderEventBlock(event, options = {}) {
  const color = event.color || options.eventColor || '#2563eb';
  const textColor = event.textColor || options.eventTextColor || '#ffffff';
  return `<div class="ec-event" data-event-id="${event.id}" style="background:${color};color:${textColor}">${escapeHtml(event.title)}</div>`;
}

export function renderAbsoluteTimelineEvent(event, viewStart, viewEnd, options = {}) {
  const totalDuration = Math.max(viewEnd - viewStart, 1);
  const start = event.start < viewStart ? viewStart : event.start;
  const end = event.end > viewEnd ? viewEnd : event.end;
  const left = clamp(((start - viewStart) / totalDuration) * 100, 0, 100);
  const width = clamp(((end - start) / totalDuration) * 100, 0.2, 100 - left);

  const color = event.color || options.eventColor || '#ef4444';
  const textColor = event.textColor || options.eventTextColor || '#ffffff';

  return `<div class="ec-event ec-timeline-event" data-event-id="${event.id}" style="left:${left}%;width:${width}%;background:${color};color:${textColor}">${escapeHtml(event.title)}</div>`;
}

export function renderResourceTimelineEvent(positioned, options = {}) {
  const { event, left, width, top, laneIndex } = positioned;
  const color = event.color || options.eventColor || '#ef4444';
  const textColor = event.textColor || options.eventTextColor || '#ffffff';

  return `<div class="ec-event ec-rt-event" data-event-id="${event.id}" data-resource-id="${event.resourceId || ''}" data-lane="${laneIndex}" style="left:${left}%;width:${width}%;top:${top}px;background:${color};color:${textColor}">${escapeHtml(event.title)}</div>`;
}
