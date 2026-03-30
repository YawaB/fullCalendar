import { endOfDay, toDate } from './timeUtils.js';

export function normalizeEvent(event, idFactory) {
  const start = toDate(event.start);
  const end = event.end ? toDate(event.end) : endOfDay(start);

  return {
    id: event.id ?? idFactory(),
    title: event.title ?? '(No title)',
    start,
    end,
    color: event.color ?? event.backgroundColor ?? null,
    textColor: event.textColor ?? null,
    allDay: event.allDay ?? false,
    resourceId: event.resourceId ?? null,
    raw: event,
  };
}

export class EventModel {
  constructor(events = []) {
    this._id = 1;
    this._events = [];
    this.load(events);
  }

  _nextId = () => `ec-${this._id++}`;

  load(events = []) {
    this._events = events.map(e => normalizeEvent(e, this._nextId));
  }

  add(event) {
    const normalized = normalizeEvent(event, this._nextId);
    this._events.push(normalized);
    return normalized;
  }

  remove(id) {
    this._events = this._events.filter(e => e.id !== id);
  }

  update(id, patch) {
    const idx = this._events.findIndex(e => e.id === id);
    if (idx === -1) return null;
    const mergedRaw = { ...this._events[idx].raw, ...patch, id };
    const normalized = normalizeEvent(mergedRaw, this._nextId);
    this._events[idx] = normalized;
    return normalized;
  }

  all() {
    return this._events;
  }

  byId(id) {
    return this._events.find(e => e.id === id) || null;
  }

  inRange(start, end) {
    return this._events.filter(e => e.start <= end && e.end >= start);
  }
}
