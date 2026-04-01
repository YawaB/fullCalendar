// @ts-nocheck
import { clamp } from '../core/timeUtils';

export function layoutEvents({ events, resources, viewStart, viewEnd, rowHeight, laneHeight, laneGap, timelineWidth }) {
  const totalMs = Math.max(viewEnd - viewStart, 1);
  const byResource = new Map(resources.map((r, i) => [r.id, { resource: r, index: i, events: [] }]));

  events.forEach(event => {
    const bucket = byResource.get(event.resourceId);
    if (bucket) bucket.events.push(event);
  });

  const positioned = [];

  byResource.forEach(({ index, events: rowEvents }) => {
    rowEvents.sort((a, b) => a.start - b.start || a.end - b.end);
    const laneEnds = [];

    rowEvents.forEach(event => {
      const visibleStart = event.start < viewStart ? viewStart : event.start;
      const visibleEnd = event.end > viewEnd ? viewEnd : event.end;
      if (visibleEnd <= visibleStart) return;

      let lane = laneEnds.findIndex(end => end <= visibleStart);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(visibleEnd);
      } else {
        laneEnds[lane] = visibleEnd;
      }

      const startRatio = clamp((visibleStart - viewStart) / totalMs, 0, 1);
      const endRatio = clamp((visibleEnd - viewStart) / totalMs, 0, 1);

      const leftPx = startRatio * timelineWidth;
      const widthPx = Math.max((endRatio - startRatio) * timelineWidth, 12);
      const topPx = index * rowHeight + 6 + lane * (laneHeight + laneGap);

      positioned.push({
        event,
        lane,
        leftPx,
        widthPx,
        topPx,
        compact: lane >= 4,
      });
    });
  });

  return positioned;
}
