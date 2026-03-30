import { renderResourceLabel } from '../components/resourceRenderer.js';

export function renderResourceRows(resources) {
  return `<div class="ec-rt-resource-col">${resources.map((resource, index) => renderResourceLabel(resource, index)).join('')}</div>`;
}
