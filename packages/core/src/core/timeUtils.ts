// @ts-nocheck
export const MS = {
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
};

export function toDate(value) {
  if (value instanceof Date) return new Date(value);
  return new Date(value);
}

export function startOfDay(date) {
  const d = toDate(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date) {
  const d = toDate(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function startOfWeek(date, firstDay = 1) {
  const d = startOfDay(date);
  const diff = (d.getDay() - firstDay + 7) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

export function endOfWeek(date, firstDay = 1) {
  const start = startOfWeek(date, firstDay);
  return endOfDay(addDays(start, 6));
}

export function startOfMonth(date) {
  const d = toDate(date);
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

export function endOfMonth(date) {
  const d = toDate(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function addDays(date, amount) {
  const d = toDate(date);
  d.setDate(d.getDate() + amount);
  return d;
}

export function addWeeks(date, amount) {
  return addDays(date, amount * 7);
}

export function addMonths(date, amount) {
  const d = toDate(date);
  d.setMonth(d.getMonth() + amount);
  return d;
}

export function formatTime(date, locale = 'default') {
  return toDate(date).toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function isToday(date) {
  const d = toDate(date);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export function getDaysInRange(start, end) {
  const days = [];
  const cursor = startOfDay(start);
  const finish = endOfDay(end);
  while (cursor <= finish) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export function mergeOptions(defaults, overrides) {
  return {
    ...defaults,
    ...overrides,
    headerToolbar: {
      ...defaults.headerToolbar,
      ...(overrides?.headerToolbar || {}),
    },
  };
}

export function parseTimeToMinutes(value, fallbackMinutes) {
  if (!value || typeof value !== 'string') return fallbackMinutes;
  const parts = value.split(':').map(Number);
  if (parts.length < 2 || parts.some(n => Number.isNaN(n))) return fallbackMinutes;
  const [hours, minutes = 0, seconds = 0] = parts;
  return (hours * 60) + minutes + (seconds > 0 ? 1 : 0);
}
