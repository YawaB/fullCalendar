export const MS = {
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
};

export function toDate(input) {
  if (input instanceof Date) return new Date(input);
  return new Date(input);
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

export function startOfWeek(date, firstDay = 0) {
  const d = startOfDay(date);
  const diff = (d.getDay() - firstDay + 7) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

export function endOfWeek(date, firstDay = 0) {
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

export function addDays(date, days) {
  const d = toDate(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addWeeks(date, weeks) {
  return addDays(date, weeks * 7);
}

export function addMonths(date, months) {
  const d = toDate(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function formatTime(date, locale = 'default') {
  return toDate(date).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function isSameDay(a, b) {
  const da = toDate(a);
  const db = toDate(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

export function isToday(date) {
  return isSameDay(date, new Date());
}

export function getDaysInRange(start, end) {
  const days = [];
  const cursor = startOfDay(start);
  const until = endOfDay(end);
  while (cursor <= until) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
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
