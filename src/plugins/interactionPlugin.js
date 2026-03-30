import { MS } from '../core/timeUtils.js';

export default function interactionPlugin(calendar) {
  function bindDateClicks(root) {
    root.querySelectorAll('[data-date]').forEach(el => {
      el.onclick = jsEvent => {
        const payload = {
          date: new Date(el.dataset.date),
          resourceId: el.dataset.resourceId || null,
          el,
          jsEvent,
        };
        calendar.options.onDateClick?.(payload);
        if (calendar.popupApi && el.classList.contains('ec-rt-cell')) {
          calendar.popupApi.open(payload.date, payload.resourceId);
        }
      };
    });
  }

  function bindEventClicks(root) {
    root.querySelectorAll('[data-event-id]').forEach(el => {
      el.onclick = jsEvent => {
        jsEvent.stopPropagation();
        const event = calendar.eventModel.byId(el.dataset.eventId);
        if (event) calendar.options.onEventClick?.({ event, el, jsEvent });
      };
    });
  }

  function bindDrag(root) {
    if (!calendar.options.editable) return;

    root.querySelectorAll('.ec-rt-event').forEach(el => {
      el.setAttribute('draggable', 'true');
      el.ondragstart = e => e.dataTransfer.setData('event-id', el.dataset.eventId);
    });

    root.querySelectorAll('.ec-rt-cell').forEach(cell => {
      cell.ondragover = e => e.preventDefault();
      cell.ondrop = e => {
        e.preventDefault();
        const id = e.dataTransfer.getData('event-id');
        const event = calendar.eventModel.byId(id);
        if (!event) return;

        const start = new Date(cell.dataset.date);
        const end = new Date(start.getTime() + (event.end - event.start));
        const updated = calendar.updateEvent(id, { start, end, resourceId: cell.dataset.resourceId });
        if (updated) calendar.options.eventDrag?.({ event: updated, date: start, resourceId: cell.dataset.resourceId });
      };
    });
  }

  function bindResize(root) {
    if (!calendar.options.editable) return;

    root.querySelectorAll('.ec-rt-event').forEach(el => {
      const handle = document.createElement('span');
      handle.className = 'ec-rt-resize-handle';
      el.appendChild(handle);

      handle.onmousedown = startEvt => {
        startEvt.stopPropagation();
        startEvt.preventDefault();
        const id = el.dataset.eventId;
        const original = calendar.eventModel.byId(id);
        if (!original) return;

        const startX = startEvt.clientX;
        const startEnd = original.end;

        const move = moveEvt => {
          const deltaPx = moveEvt.clientX - startX;
          const slotWidth = 80;
          const slotMinutes = calendar.options.slotDurationMinutes || 60;
          const deltaMinutes = Math.round(deltaPx / slotWidth) * slotMinutes;
          const newEnd = new Date(startEnd.getTime() + deltaMinutes * MS.minute);
          if (newEnd <= original.start) return;
          calendar.updateEvent(id, { end: newEnd });
          calendar.options.eventResize?.({ event: calendar.eventModel.byId(id), end: newEnd });
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
    bind(rootEl) {
      bindDateClicks(rootEl);
      bindEventClicks(rootEl);
      bindDrag(rootEl);
      bindResize(rootEl);
    },
  };
}
