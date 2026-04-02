// @ts-nocheck
export function renderResourceColumn(resources) {
  return resources
    .map(resource => `<div class="ec-resource-row" style="padding-left:${12 + resource.depth * 18}px" data-resource-id="${resource.id}">${resource.title}</div>`)
    .join('');
}
