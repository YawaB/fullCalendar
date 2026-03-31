import { MS } from '../core/timeUtils.js';

export default function interactionPlugin(calendar) {
  function parseCell(cell) {
    return {
      date: new Date(cell.dataset.date),
      resourceId: cell.dataset.resourceId,
    };
  }

  function bindCellClicks(root) {
    root.querySelectorAll('.ec-grid-cell, [data-date]').forEach(cell => {
      if (cell.closest('.ec-event')) return;
      if (cell.classList.contains('ec-time-slot') || cell.classList.contains('ec-timegrid-col-head')) return;
      cell.onclick = e => {
        const { date, resourceId } = parseCell(cell);
        calendar.options.onDateClick?.({ date, resourceId, el: cell, jsEvent: e });
        if (calendar.popupApi) calendar.popupApi.open(date, resourceId);
      };
    });
  }

  function bindEventClicks(root) {
    root.querySelectorAll('.ec-event').forEach(el => {
      el.onclick = e => {
        e.stopPropagation();
        const event = calendar.eventModel.byId(el.dataset.eventId);
        if (event) {
          calendar.options.onEventClick?.({ event, el, jsEvent: e });
          calendar.popupApi?.openEvent(event);
        }
      };
    });
  }

  function bindDrag(root) {
    if (!calendar.options.editable) return;

    root.querySelectorAll('.ec-event').forEach(el => {
      el.ondragstart = ev => {
        ev.dataTransfer.setData('event-id', el.dataset.eventId);
      };
    });

    root.querySelectorAll('.ec-grid-cell').forEach(cell => {
      cell.ondragover = e => e.preventDefault();
      cell.ondrop = e => {
        e.preventDefault();
        const id = e.dataTransfer.getData('event-id');
        const event = calendar.eventModel.byId(id);
        if (!event) return;

        const { date, resourceId } = parseCell(cell);
        const duration = event.end - event.start;
        const updated = calendar.updateEvent(id, {
          start: date,
          end: new Date(date.getTime() + duration),
          resourceId,
        });

        if (updated) calendar.options.eventDrag?.({ event: updated, date, resourceId });
      };
    });
  }

  function bindResize(root) {
    if (!calendar.options.editable) return;
    const metrics = calendar._viewMetrics;
    if (!metrics) return;

    root.querySelectorAll('.ec-resize-handle').forEach(handle => {
      handle.onmousedown = startEvent => {
        startEvent.preventDefault();
        startEvent.stopPropagation();

        const eventEl = handle.closest('.ec-event');
        const eventId = eventEl.dataset.eventId;
        const original = calendar.eventModel.byId(eventId);
        if (!original) return;

        const originX = startEvent.clientX;
        const originEnd = original.end;
        const pxPerMs = metrics.timelineWidth / (metrics.viewEnd - metrics.viewStart || 1);

        const move = moveEvent => {
          const deltaPx = moveEvent.clientX - originX;
          const deltaMs = deltaPx / pxPerMs;
          const snappedMs = Math.round(deltaMs / (metrics.slotDurationMinutes * MS.minute)) * metrics.slotDurationMinutes * MS.minute;
          const newEnd = new Date(originEnd.getTime() + snappedMs);
          if (newEnd <= original.start) return;

          const updated = calendar.updateEvent(eventId, { end: newEnd });
          if (updated) calendar.options.eventResize?.({ event: updated, end: newEnd });
        };

        const up = () => {
          window.removeEventListener('mousemove', move);
          window.removeEventListener('mouseup', up);
        };

        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', up);
      };
    });
  }

  return {
    bind(root) {
      bindCellClicks(root);
      bindEventClicks(root);
      bindDrag(root);
      bindResize(root);
    },
  };
}
