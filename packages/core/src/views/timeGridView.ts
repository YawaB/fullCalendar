// @ts-nocheck
import { addDays, endOfDay, endOfWeek, formatTime, getDaysInRange, isToday, startOfDay, startOfWeek } from '../core/timeUtils';

function renderDayColumn(day, events, options) {
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);
  const dayEvents = events.filter(e => e.start <= dayEnd && e.end >= dayStart);

  let html = `<div class="ec-timegrid-col"><div class="ec-timegrid-col-head ${isToday(day) ? 'ec-today' : ''}" data-date="${day.toISOString()}">`;
  html += `${day.toLocaleDateString(options.locale, { weekday: 'short', month: 'short', day: 'numeric' })}</div>`;
  html += '<div class="ec-timegrid-slots">';

  for (let hour = 0; hour < 24; hour += 1) {
    html += `<div class="ec-timegrid-slot" data-date="${new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour).toISOString()}"></div>`;
  }

  dayEvents.forEach(event => {
    const eventStart = event.start < dayStart ? dayStart : event.start;
    const eventEnd = event.end > dayEnd ? dayEnd : event.end;
    const startMinutes = eventStart.getHours() * 60 + eventStart.getMinutes();
    const endMinutes = eventEnd.getHours() * 60 + eventEnd.getMinutes();
    const top = (startMinutes / (24 * 60)) * 100;
    const height = Math.max(((endMinutes - startMinutes) / (24 * 60)) * 100, 2);
    const color = event.color || options.eventColor;
    const textColor = event.textColor || options.eventTextColor;

    html += `<div class="ec-event ec-timegrid-event" data-event-id="${event.id}" style="top:${top}%;height:${height}%;background:${color};color:${textColor}">`;
    html += `<strong>${event.title}</strong><span>${formatTime(eventStart, options.locale)}</span></div>`;
  });

  html += '</div></div>';
  return html;
}

export default function timeGridView(calendar) {
  const { currentDate, currentView, options, eventModel } = calendar;
  const viewStart = currentView === 'day' ? startOfDay(currentDate) : startOfWeek(currentDate, options.firstDay);
  const viewEnd = currentView === 'day' ? endOfDay(currentDate) : endOfWeek(currentDate, options.firstDay);
  const days = currentView === 'day' ? [viewStart] : getDaysInRange(viewStart, addDays(viewStart, 6));
  const events = eventModel.inRange(viewStart, viewEnd);

  let html = '<div class="ec-timegrid-view">';
  html += '<div class="ec-timegrid-layout">';
  html += '<div class="ec-timegrid-gutter"><div class="ec-timegrid-gutter-head"></div>';
  for (let hour = 0; hour < 24; hour += 1) {
    const hourDate = new Date(2026, 0, 1, hour);
    html += `<div class="ec-timegrid-gutter-slot">${formatTime(hourDate, options.locale)}</div>`;
  }
  html += '</div>';
  html += `<div class="ec-timegrid-body ec-cols-${days.length}">`;
  days.forEach(day => {
    html += renderDayColumn(day, events, options);
  });
  html += '</div></div></div>';

  return html;
}
