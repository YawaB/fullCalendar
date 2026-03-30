export function renderResourceColumn(resources, rowHeight) {
  return resources
    .map(resource => `<div class="ec-resource-row" style="height:${rowHeight}px;padding-left:${12 + resource.depth * 18}px" data-resource-id="${resource.id}">${resource.title}</div>`)
    .join('');
}
