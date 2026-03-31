# EasyCal

EasyCal supports two independent rendering systems:

- `mode: 'standard'` → classic calendar (`month`, `week`, `day`)
- `mode: 'timeline'` → resource timeline (`resourceTimelineDay`, `resourceTimelineWeek`, `resourceTimelineMonth`)

## Basic usage

```js
const cal = new EasyCal('#calendar', {
  mode: 'standard', // default
  defaultView: 'month',
  events: []
});
```

## Timeline usage

```js
const cal = new EasyCal('#calendar', {
  mode: 'timeline',
  defaultView: 'resourceTimelineDay',
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
      resourceId: 'room-1'
    }
  ]
});
```

## Config

```js
{
  mode: 'standard' | 'timeline',
  defaultView: 'month' | 'week' | 'day' | 'resourceTimelineDay' | 'resourceTimelineWeek' | 'resourceTimelineMonth',
  views: {
    month: {},
    week: {},
    day: {},
    resourceTimelineDay: {},
    resourceTimelineWeek: {},
    resourceTimelineMonth: {}
  },
  events: [],
  resources: [],
  editable: true,
  onEventClick: fn,
  onDateClick: fn,
  slotMinTime: '00:00:00',
  slotMaxTime: '24:00:00'
}
```

## API

```js
cal.addEvent(event)
cal.removeEvent(id)
cal.updateEvent(id, patch)
cal.getEvents()
cal.changeView(viewName)
cal.next()
cal.prev()
cal.today()
cal.destroy()
```

## Notes

- Toolbar always includes `prev`, `next`, and `Today`.
- In `standard` mode, `resourceId` is ignored.
- In `timeline` mode, events are positioned by both time and `resourceId`.
- Clicking empty cells triggers `onDateClick` and opens create popup (prefilled start/end/resource).
- Clicking events triggers `onEventClick` and opens edit popup.
