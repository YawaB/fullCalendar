import { clamp } from '../core/timeUtils.js';

export function positionEventsByResource(events, resources, viewStart, viewEnd, rowHeight = 68) {
  const totalMs = Math.max(viewEnd - viewStart, 1);
  const positioned = [];

  resources.forEach((resource, resourceIndex) => {
    const rowEvents = events
      .filter(event => event.resourceId === resource.id)
      .sort((a, b) => a.start - b.start || a.end - b.end);

    const lanes = [];

    rowEvents.forEach(event => {
      const visibleStart = event.start < viewStart ? viewStart : event.start;
      const visibleEnd = event.end > viewEnd ? viewEnd : event.end;
      if (visibleEnd <= visibleStart) return;

      let laneIndex = lanes.findIndex(laneEnd => laneEnd <= visibleStart);
      if (laneIndex === -1) {
        laneIndex = lanes.length;
        lanes.push(visibleEnd);
      } else {
        lanes[laneIndex] = visibleEnd;
      }

      const left = clamp(((visibleStart - viewStart) / totalMs) * 100, 0, 100);
      const width = clamp(((visibleEnd - visibleStart) / totalMs) * 100, 0.5, 100 - left);
      const top = resourceIndex * rowHeight + laneIndex * 26 + 8;

      positioned.push({ event, left, width, top, laneIndex, resourceIndex });
    });
  });

  return positioned;
}
