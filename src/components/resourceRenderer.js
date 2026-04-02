export function renderResourceColumn(resources, headerHeight) {
  const rows = resources
    .map(resource => `<div class="ec-resource-row" style="padding-left:${12 + resource.depth * 18}px" data-resource-id="${resource.id}">${resource.title}</div>`)
    .join('');

  return `<div class="ec-resource-header-spacer" style="height:${headerHeight}px"></div>${rows}`;
}
