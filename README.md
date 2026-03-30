# EasyCal Resource Timeline

EasyCal now renders a modern FullCalendar-like **resource timeline** with:
- horizontal time axis
- vertical resource rows
- sticky time header + sticky resource column
- pixel-precise event positioning
- overlap lane stacking
- drag/resize/click interactions

## Config

```js
const cal = new EasyCal('#calendar', {
  defaultView: 'resourceTimelineDay',
  views: {
    resourceTimelineDay: {},
    resourceTimelineWeek: {},
    resourceTimelineMonth: {}
  },
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
      color: '#3b82f6'
    }
  ],
  editable: true,
  onEventClick: ({ event }) => console.log(event),
  onDateClick: ({ date, resourceId }) => console.log(date, resourceId)
});
```

## Views

- `resourceTimelineDay`: 6am → 6pm, 1-hour slots
- `resourceTimelineWeek`: 7 days, 1-day slots
- `resourceTimelineMonth`: full month, 1-day slots

Toolbar provides `day / week / month` switching.

## Event format

```js
{
  id: string,
  title: string,
  start: Date | string,
  end: Date | string,
  resourceId: string,
  color?: string
}
```

## Resource format

```js
{
  id: string,
  title: string,
  children?: Resource[]
}
```

## API

```js
cal.addEvent(event)
cal.removeEvent(id)
cal.updateEvent(id, patch)
cal.getEvents()
cal.changeView('resourceTimelineWeek')
cal.next()
cal.prev()
cal.today()
cal.destroy()
```
