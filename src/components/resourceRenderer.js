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

  if (typeof resourceRenderer === 'function') {
    const rendered = resourceRenderer(source);
    if (rendered instanceof HTMLElement) return rendered.outerHTML;
    if (typeof rendered === 'string') return rendered;
  }

  const fallbackLabel = source?.title ?? source?.label ?? source?.name ?? resource._resourceLabel ?? resource.id;
  return escapeHtml(fallbackLabel);
}

export function renderResourceColumn(resources, { resourceRenderer } = {}) {
  return resources
    .map(resource => {
      const content = renderResourceContent(resource, resourceRenderer);
      return `<div class="ec-resource-row" style="padding-left:${12 + resource.depth * 18}px" data-resource-id="${resource.id}">${content}</div>`;
    })
    .join('');
}
