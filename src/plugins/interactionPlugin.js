export default function interactionPlugin(calendar) {
  return {
    bind(rootEl) {
      rootEl.querySelectorAll('[data-date]').forEach(el => {
        el.onclick = jsEvent => {
          if (calendar.options.onDateClick) {
            calendar.options.onDateClick({
              date: new Date(el.dataset.date),
              el,
              jsEvent,
            });
          }
        };
      });

      rootEl.querySelectorAll('[data-event-id]').forEach(el => {
        el.onclick = jsEvent => {
          const event = calendar.eventModel.byId(el.dataset.eventId);
          if (event && calendar.options.onEventClick) {
            calendar.options.onEventClick({ event, el, jsEvent });
          }
        };
      });

      if (calendar.options.editable) {
        rootEl.querySelectorAll('[data-event-id]').forEach(el => {
          el.setAttribute('draggable', 'true');
          el.ondragstart = e => {
            e.dataTransfer.setData('text/plain', el.dataset.eventId);
          };
        });

        rootEl.querySelectorAll('[data-date]').forEach(el => {
          el.ondragover = e => e.preventDefault();
          el.ondrop = e => {
            e.preventDefault();
            const id = e.dataTransfer.getData('text/plain');
            const event = calendar.eventModel.byId(id);
            if (!event) return;

            const target = new Date(el.dataset.date);
            const duration = event.end - event.start;
            const updated = calendar.updateEvent(id, {
              start: target,
              end: new Date(target.getTime() + duration),
            });

            if (updated && calendar.options.eventDrag) {
              calendar.options.eventDrag({ event: updated, date: target, el });
            }
          };
        });
      }
    },
  };
}
