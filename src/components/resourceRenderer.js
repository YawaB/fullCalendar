function esc(v) {
  return String(v)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export function renderResourceLabel(resource, index) {
  return `<div class="ec-rt-resource" data-resource-id="${resource.id}" data-resource-index="${index}">${esc(resource.title)}</div>`;
}
