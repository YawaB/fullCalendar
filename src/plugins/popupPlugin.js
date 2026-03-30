function ensurePopup() {
  let overlay = document.querySelector('.ec-popup-overlay');
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.className = 'ec-popup-overlay';
  overlay.innerHTML = `
    <div class="ec-popup">
      <h3>Add Event</h3>
      <label>Title<input type="text" name="title"></label>
      <label>Start<input type="datetime-local" name="start"></label>
      <label>End<input type="datetime-local" name="end"></label>
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

  function close() {
    overlay.classList.remove('open');
  }

  function open(initialDate) {
    const title = overlay.querySelector('input[name="title"]');
    const start = overlay.querySelector('input[name="start"]');
    const end = overlay.querySelector('input[name="end"]');
    const color = overlay.querySelector('input[name="color"]');
    const error = overlay.querySelector('.ec-popup-error');

    const base = initialDate || new Date();
    const defaultStart = new Date(base);
    defaultStart.setMinutes(0, 0, 0);
    const defaultEnd = new Date(defaultStart.getTime() + 60 * 60 * 1000);

    title.value = '';
    start.value = defaultStart.toISOString().slice(0, 16);
    end.value = defaultEnd.toISOString().slice(0, 16);
    color.value = '#ef4444';
    error.hidden = true;
    error.textContent = '';

    overlay.classList.add('open');
  }

  function save() {
    const title = overlay.querySelector('input[name="title"]').value.trim();
    const start = new Date(overlay.querySelector('input[name="start"]').value);
    const end = new Date(overlay.querySelector('input[name="end"]').value);
    const color = overlay.querySelector('input[name="color"]').value;
    const error = overlay.querySelector('.ec-popup-error');

    if (!title || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      error.hidden = false;
      error.textContent = 'Please provide a title, start, and end date.';
      return;
    }

    if (end <= start) {
      error.hidden = false;
      error.textContent = 'End date/time must be after start date/time.';
      return;
    }

    calendar.addEvent({ title, start, end, color });
    close();
  }

  overlay.addEventListener('click', e => {
    if (e.target === overlay) close();
  });

  overlay.querySelector('[data-action="cancel"]').onclick = close;
  overlay.querySelector('[data-action="save"]').onclick = save;

  return {
    bind(rootEl) {
      rootEl.querySelectorAll('[data-action="open-add-popup"]').forEach(button => {
        button.onclick = () => open();
      });
    },
    destroy() {
      overlay.remove();
    },
  };
}
