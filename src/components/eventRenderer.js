function esc(str) {
  return String(str).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export function renderTimelineEvent(item, options) {
  const { event, leftPx, widthPx, topPx, compact } = item;
  const color = event.color || options.eventColor || '#3b82f6';
  const cls = compact ? 'ec-event ec-event-compact' : 'ec-event';
  return `<div class="${cls}" draggable="${options.editable ? 'true' : 'false'}" data-event-id="${event.id}" data-resource-id="${event.resourceId}" style="left:${leftPx}px;width:${widthPx}px;top:${topPx}px;background:${color};color:${event.textColor || options.eventTextColor || '#fff'}"><span class="ec-event-title">${esc(event.title)}</span>${options.editable ? '<span class="ec-resize-handle" data-resize="1"></span>' : ''}</div>`;
}

export function renderEventBlock(event, options = {}) {
  const color = event.color || options.eventColor || '#3b82f6';
  const textColor = event.textColor || options.eventTextColor || '#ffffff';
  return `<div class="ec-event" data-event-id="${event.id}" style="position:static;background:${color};color:${textColor}"><span class="ec-event-title">${esc(event.title)}</span></div>`;
}
