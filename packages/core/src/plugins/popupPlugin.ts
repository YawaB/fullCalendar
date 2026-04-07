// @ts-nocheck
function ensurePopup() {
  let popup = document.querySelector('.ec-popup-overlay');
  if (popup) return popup;

  popup = document.createElement('div');
  popup.className = 'ec-popup-overlay';
  popup.innerHTML = `
    <div class="ec-popup" role="dialog" aria-modal="true">
      <div class="ec-popup-body"></div>
    </div>
  `;
  document.body.appendChild(popup);
  return popup;
}

function toDatetimeLocalValue(value) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function defaultFormMarkup(context, resources, isTimeline) {
  const isEdit = context.mode === 'edit';
  const selectedResourceId = context.resourceId || resources[0]?._id || '';

  return `
    <form class="ec-popup-form" data-ec-form>
      <h3 class="ec-popup-title">${isEdit ? 'Edit event' : 'Create event'}</h3>

      <label class="ec-popup-field">
        <span>Title</span>
        <input name="title" type="text" value="${context.event?.title || ''}" placeholder="Event title" required />
      </label>

      <div class="ec-popup-grid">
        <label class="ec-popup-field">
          <span>Start</span>
          <input name="start" type="datetime-local" value="${toDatetimeLocalValue(context.event?.start || context.date)}" required />
        </label>

        <label class="ec-popup-field">
          <span>End</span>
          <input name="end" type="datetime-local" value="${toDatetimeLocalValue(context.event?.end || new Date((context.date || new Date()).getTime() + 60 * 60 * 1000))}" required />
        </label>
      </div>

      <label class="ec-popup-field">
        <span>Resource</span>
        <select name="resourceId" ${isTimeline ? '' : 'disabled'}>
          ${resources.length
            ? resources.map(r => `<option value="${r._id}" ${r._id === selectedResourceId ? 'selected' : ''}>${r._label}</option>`).join('')
            : '<option value="">No resource</option>'}
        </select>
      </label>

      <label class="ec-popup-field">
        <span>Color</span>
        <input name="color" type="color" value="${context.event?.color || '#3b82f6'}" />
      </label>

      <p class="ec-popup-error" hidden></p>

      <div class="ec-popup-actions">
        ${isEdit ? '<button type="button" class="ec-btn ec-btn-danger" data-ec-action="delete">Delete</button>' : ''}
        <button type="button" class="ec-btn" data-ec-action="cancel">Cancel</button>
        <button type="submit" class="ec-btn ec-btn-primary" data-ec-action="${isEdit ? 'update' : 'save'}">${isEdit ? 'Update' : 'Save'}</button>
      </div>
    </form>
  `;
}

function coerceRendererOutput(output) {
  if (output instanceof HTMLElement) return output;
  if (typeof output === 'string') {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = output;
    return wrapper;
  }
  return null;
}

export default function popupPlugin(calendar) {
  const overlay = ensurePopup();
  const popup = overlay.querySelector('.ec-popup');
  const body = overlay.querySelector('.ec-popup-body');
  let currentContext = null;

  function close() {
    overlay.classList.remove('open');
    body.innerHTML = '';
    currentContext = null;
  }

  function getFormPayload() {
    const title = body.querySelector('[name="title"]')?.value?.trim?.() || '';
    const startRaw = body.querySelector('[name="start"]')?.value;
    const endRaw = body.querySelector('[name="end"]')?.value;
    const resourceValue = body.querySelector('[name="resourceId"]')?.value || body.querySelector('[name="resource"]')?.value || '';
    const color = body.querySelector('[name="color"]')?.value || '#3b82f6';

    return {
      title,
      start: startRaw ? new Date(startRaw) : null,
      end: endRaw ? new Date(endRaw) : null,
      resourceId: resourceValue || currentContext?.resourceId || null,
      color,
    };
  }

  function setError(message = '') {
    const error = body.querySelector('.ec-popup-error');
    if (!error) return;
    error.hidden = !message;
    error.textContent = message;
  }

  function validatePayload(data) {
    if (!data.title) {
      setError('Title is required.');
      return false;
    }
    if (!(data.start instanceof Date) || Number.isNaN(data.start.getTime())) {
      setError('Start date is invalid.');
      return false;
    }
    if (!(data.end instanceof Date) || Number.isNaN(data.end.getTime())) {
      setError('End date is invalid.');
      return false;
    }
    if (!(data.start < data.end)) {
      setError('End must be after start.');
      return false;
    }
    setError('');
    return true;
  }

  function createContext(mode, partial) {
    const baseContext = {
      mode,
      event: partial.event,
      date: partial.date,
      resourceId: partial.resourceId || null,
      close,
      save: (data) => {
        const payload = data || getFormPayload();
        if (!validatePayload(payload)) return;
        calendar.addEvent({
          ...payload,
          resourceId: calendar.mode === 'timeline' ? payload.resourceId : (payload.resourceId || null),
        });
        close();
      },
      update: (data) => {
        if (!baseContext.event?.id) return;
        const payload = data || getFormPayload();
        if (!validatePayload(payload)) return;
        calendar.updateEvent(baseContext.event.id, {
          ...payload,
          resourceId: calendar.mode === 'timeline' ? payload.resourceId : (payload.resourceId || null),
        });
        close();
      },
      delete: () => {
        if (!baseContext.event?.id) return;
        calendar.removeEvent(baseContext.event.id);
        close();
      },
    };

    return baseContext;
  }

  function renderForm(context) {
    const resources = calendar.resourceModel.flat();
    body.innerHTML = '';

    if (typeof calendar.options.eventFormRenderer === 'function') {
      const customOutput = coerceRendererOutput(calendar.options.eventFormRenderer(context));
      if (customOutput) {
        body.appendChild(customOutput);
      } else {
        body.innerHTML = defaultFormMarkup(context, resources, calendar.mode === 'timeline');
      }
    } else {
      body.innerHTML = defaultFormMarkup(context, resources, calendar.mode === 'timeline');
    }

    const resourceInput = body.querySelector('[name="resourceId"], [name="resource"]');
    if (resourceInput && context.resourceId && !resourceInput.value) {
      resourceInput.value = context.resourceId;
    }

    overlay.classList.add('open');
  }

  function handleAction(action) {
    if (!currentContext) return;
    if (action === 'save') currentContext.save();
    if (action === 'update') currentContext.update();
    if (action === 'delete') currentContext.delete();
    if (action === 'cancel' || action === 'close') currentContext.close();
  }

  function open(date = new Date(), resourceId = '') {
    currentContext = createContext('create', {
      date: new Date(date),
      resourceId: resourceId || null,
    });
    renderForm(currentContext);
  }

  function openEvent(event) {
    currentContext = createContext('edit', {
      event,
      date: new Date(event.start),
      resourceId: event.resourceId || null,
    });
    renderForm(currentContext);
  }

  overlay.onclick = e => {
    if (e.target === overlay) {
      close();
      return;
    }

    const actionEl = e.target.closest('[data-ec-action]');
    if (!actionEl) return;
    handleAction(actionEl.dataset.ecAction);
  };

  popup.addEventListener('submit', e => {
    e.preventDefault();
    if (!currentContext) return;
    if (currentContext.mode === 'edit') currentContext.update();
    else currentContext.save();
  });

  calendar.popupApi = { open, openEvent, close };

  return {
    bind(root) {
      root.querySelectorAll('[data-action="open-popup"]').forEach(btn => {
        btn.onclick = () => open();
      });
    },
    destroy() {
      overlay.remove();
    },
  };
}
