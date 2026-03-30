# EasyCal Resource Timeline

EasyCal now includes a **FullCalendar-like resource timeline** system:
- **X axis** = time slots
- **Y axis** = resources
- events are positioned by **time + resource**

## Architecture

```txt
/src
  /core
    calendarCore.js
    eventModel.js
    resourceModel.js
    timeUtils.js
  /views
    monthView.js
    timeGridView.js
    resourceTimelineView.js
  /layout
    timelineAxis.js
    resourceRows.js
    eventPositioning.js
  /components
    eventRenderer.js
    resourceRenderer.js
  /plugins
    interactionPlugin.js
    popupPlugin.js
  /styles
    base.css
    timeline.css
    resources.css
  index.js
```

## Basic Usage

```js
const calendar = new EasyCal('#calendar', {
  initialView: 'resourceTimeline',
  resources: [
    { id: 'room-1', title: 'Room A' },
    { id: 'room-2', title: 'Room B' }
  ],
  events: [
    {
      id: '1',
      title: 'Meeting',
      start: '2026-03-30T10:00:00',
      end: '2026-03-30T11:30:00',
      resourceId: 'room-1',
      color: '#ef4444'
    }
  ],
  editable: true,
  onEventClick({ event }) {
    console.log(event.title);
  },
  onDateClick({ date, resourceId }) {
    console.log(date, resourceId);
  }
});
```

## Resource Timeline Behavior

- Sticky header for time slots.
- Sticky first column for resource names.
- Horizontal scroll for time axis.
- Vertical scroll for resource rows.
- Event positioning:
  - `left = ((eventStart - viewStart) / totalDuration) * 100%`
  - `width = ((eventEnd - eventStart) / totalDuration) * 100%`
  - `top = resourceIndex * rowHeight + laneOffset`
- Overlap management inside each resource row (lane stacking).

## Popup + Interactions

- `+ Add Event` opens popup.
- Clicking empty timeline cell opens popup prefilled with date/resource.
- Clicking event triggers `onEventClick`.
- Drag event to different time/resource updates event.
- Resize handle updates event duration.

## API

```js
calendar.addEvent(event)
calendar.removeEvent(eventId)
calendar.updateEvent(eventId, patch)
calendar.getEvents()
calendar.next()
calendar.prev()
calendar.today()
calendar.changeView('resourceTimeline')
calendar.destroy()
```
