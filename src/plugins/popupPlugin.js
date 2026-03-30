function ensurePopup() {
  let overlay = document.querySelector('.ec-popup-overlay');
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.className = 'ec-popup-overlay';
  overlay.innerHTML = `
    <div class="ec-popup">
      <h3>Event</h3>
      <label>Title<input type="text" name="title"></label>
      <label>Start<input type="datetime-local" name="start"></label>
      <label>End<input type="datetime-local" name="end"></label>
      <label>Resource<select name="resource"></select></label>
      <label>Color<input type="color" name="color" value="#ef4444"></label>
      <div class="ec-popup-actions">
        <button type="button" data-action="cancel">Cancel</button>
        <button type="button" data-action="save">Save</button>
      </div>
      <p class="ec-popup-error" hidden></p>
    </div>`;
  document.body.appendChild(overlay);
  return overlay;
}

export default function popupPlugin(calendar) {
  const overlay = ensurePopup();
  const titleInput = overlay.querySelector('input[name="title"]');
  const startInput = overlay.querySelector('input[name="start"]');
  const endInput = overlay.querySelector('input[name="end"]');
  const resourceInput = overlay.querySelector('select[name="resource"]');
  const colorInput = overlay.querySelector('input[name="color"]');
  const error = overlay.querySelector('.ec-popup-error');

  function setResources(selectedId = '') {
    const resources = calendar.resourceModel.all();
    resourceInput.innerHTML = `<option value="">No resource</option>${resources.map(r => `<option value="${r.id}">${r.title}</option>`).join('')}`;
    resourceInput.value = selectedId || '';
  }

  function open(initialDate, resourceId = '') {
    const start = initialDate ? new Date(initialDate) : new Date();
    start.setMinutes(0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    titleInput.value = '';
    startInput.value = start.toISOString().slice(0, 16);
    endInput.value = end.toISOString().slice(0, 16);
    colorInput.value = '#ef4444';
    setResources(resourceId);
    error.hidden = true;
    error.textContent = '';
    overlay.classList.add('open');
  }

  function close() {
    overlay.classList.remove('open');
  }

  function save() {
    const title = titleInput.value.trim();
    const start = new Date(startInput.value);
    const end = new Date(endInput.value);

    if (!title || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      error.hidden = false;
      error.textContent = 'Title/start/end are required.';
      return;
    }
    if (end <= start) {
      error.hidden = false;
      error.textContent = 'End must be after start.';
      return;
    }

    calendar.addEvent({
      title,
      start,
      end,
      resourceId: resourceInput.value || null,
      color: colorInput.value,
    });
    close();
  }

  overlay.addEventListener('click', e => {
    if (e.target === overlay) close();
  });

  overlay.querySelector('[data-action="cancel"]').onclick = close;
  overlay.querySelector('[data-action="save"]').onclick = save;

  calendar.popupApi = { open };

  return {
    bind(root) {
      root.querySelectorAll('[data-action="open-add-popup"]').forEach(btn => {
        btn.onclick = () => open();
      });
    },
    destroy() {
      overlay.remove();
    },
  };
}
