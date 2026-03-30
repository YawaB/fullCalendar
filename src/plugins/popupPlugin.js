function ensurePopup() {
  let popup = document.querySelector('.ec-popup-overlay');
  if (popup) return popup;

  popup = document.createElement('div');
  popup.className = 'ec-popup-overlay';
  popup.innerHTML = `
    <div class="ec-popup">
      <h3>Create event</h3>
      <label>Title<input name="title" type="text" /></label>
      <label>Start<input name="start" type="datetime-local" /></label>
      <label>End<input name="end" type="datetime-local" /></label>
      <label>Resource<select name="resource"></select></label>
      <label>Color<input name="color" type="color" value="#3b82f6" /></label>
      <p class="ec-popup-error" hidden></p>
      <div class="ec-popup-actions">
        <button data-action="cancel">Cancel</button>
        <button data-action="save">Save</button>
      </div>
    </div>
  `;
  document.body.appendChild(popup);
  return popup;
}

export default function popupPlugin(calendar) {
  const overlay = ensurePopup();
  const title = overlay.querySelector('[name="title"]');
  const start = overlay.querySelector('[name="start"]');
  const end = overlay.querySelector('[name="end"]');
  const resource = overlay.querySelector('[name="resource"]');
  const color = overlay.querySelector('[name="color"]');
  const error = overlay.querySelector('.ec-popup-error');

  function open(date = new Date(), resourceId = '') {
    const base = new Date(date);
    const endDate = new Date(base.getTime() + 60 * 60 * 1000);

    title.value = '';
    start.value = base.toISOString().slice(0, 16);
    end.value = endDate.toISOString().slice(0, 16);

    resource.innerHTML = calendar.resourceModel.flat().map(r => `<option value="${r.id}">${r.title}</option>`).join('');
    resource.value = resourceId || calendar.resourceModel.flat()[0]?.id || '';

    error.hidden = true;
    error.textContent = '';
    overlay.classList.add('open');
  }

  function close() {
    overlay.classList.remove('open');
  }

  function save() {
    const startDate = new Date(start.value);
    const endDate = new Date(end.value);

    if (!title.value.trim()) {
      error.hidden = false;
      error.textContent = 'Title is required.';
      return;
    }
    if (!(startDate < endDate)) {
      error.hidden = false;
      error.textContent = 'End must be after start.';
      return;
    }

    calendar.addEvent({
      title: title.value.trim(),
      start: startDate,
      end: endDate,
      resourceId: resource.value,
      color: color.value,
    });

    close();
  }

  overlay.querySelector('[data-action="cancel"]').onclick = close;
  overlay.querySelector('[data-action="save"]').onclick = save;
  overlay.onclick = e => {
    if (e.target === overlay) close();
  };

  calendar.popupApi = { open };

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
