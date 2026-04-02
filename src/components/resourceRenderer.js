// @ts-nocheck
function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderResourceContent(resource, resourceRenderer) {
  const source = resource._resource || resource;
  const rendererInput = { ...source, _id: resource._id, _label: resource._label };

  if (typeof resourceRenderer === 'function') {
    const rendered = resourceRenderer(rendererInput);
    if (rendered instanceof HTMLElement) return rendered.outerHTML;
    if (typeof rendered === 'string') return rendered;
  }

  return escapeHtml(resource._label || resource._id);
}

export function renderResourceColumn(resources, { resourceRenderer } = {}) {
  return resources
    .map(resource => {
      const content = renderResourceContent(resource, resourceRenderer);
      return `<div class="ec-resource-row" style="padding-left:${12 + resource.depth * 18}px" data-resource-id="${resource._id}">${content}</div>`;
    })
    .join('');
}
