# EasyCal (Modular Edition)

EasyCal is a lightweight calendar package with a modular architecture inspired by FullCalendar:
- `month` view (grid)
- `week`/`day` time-grid view
- premium-style `timeline` view with horizontal time axis
- plugin hooks for interactions and popup-based event creation

## Folder Structure

```txt
/src
  /core
    calendarCore.js
    eventModel.js
    utils.js
  /views
    monthView.js
    timeGridView.js
    timelineView.js
  /plugins
    interactionPlugin.js
    popupPlugin.js
  /components
    eventRenderer.js
    timeAxis.js
  /styles
    base.css
    month.css
    timegrid.css
    timeline.css
  index.js
```

## Quick Start

```html
<link rel="stylesheet" href="https://unpkg.com/easycal/dist/easycal.css" />
<div id="calendar"></div>
<script src="https://unpkg.com/easycal/dist/easycal.umd.js"></script>
<script>
  const cal = new EasyCal('#calendar', {
    initialView: 'month',
    events: [
      {
        title: 'Team Standup',
        start: '2026-03-30T09:00:00',
        end: '2026-03-30T09:30:00',
        color: '#3b82f6'
      }
    ]
  });
</script>
```

## Options

| Option | Type | Default |
|---|---|---|
| `initialView` | `month \| week \| day \| timeline` | `month` |
| `views` | `Record<string, fn>` | `{}` |
| `events` | `array` | `[]` |
| `editable` | `boolean` | `false` |
| `selectable` | `boolean` | `true` |
| `onEventClick` | `function` | `null` |
| `onDateClick` | `function` | `null` |
| `slotDurationMinutes` | `number` | `60` |
| `slotLabelFormat` | `function` | `null` |
| `minTimeHour` / `maxTimeHour` | `number` | `0 / 24` |
| `timelineRange` | `day \| week \| month` | `day` |
| `resources` | `array` | `[]` |

## Event Model

All events are normalized to:

```js
{
  id,
  title,
  start,
  end,
  color,
  textColor,
  allDay
}
```

`resourceId` is also supported for timeline rows.

## Timeline View Example

```js
const cal = new EasyCal('#calendar', {
  initialView: 'timeline',
  timelineRange: 'day',
  slotDurationMinutes: 30,
  minTimeHour: 6,
  maxTimeHour: 22,
  resources: [
    { id: 'veh-1', title: 'AB-123-CD4' },
    { id: 'veh-2', title: 'CN191011234' }
  ],
  events: [
    {
      title: 'Immobilisation',
      start: '2026-03-30T08:00:00',
      end: '2026-03-30T12:30:00',
      resourceId: 'veh-1',
      color: '#ef4444'
    }
  ]
});
```

## Interaction Handlers

```js
const cal = new EasyCal('#calendar', {
  onEventClick({ event }) {
    console.log('event', event.id, event.title);
  },
  onDateClick({ date }) {
    console.log('date', date);
  },
  editable: true
});
```

## API

```js
cal.next();
cal.prev();
cal.today();
cal.changeView('timeline');

cal.addEvent({ title, start, end });
cal.removeEvent('id');
cal.updateEvent('id', { title: 'Updated' });
cal.getEvents();
cal.destroy();
```

## Notes

- Timeline events are positioned with:
  - `left = ((event.start - viewStart) / viewDuration) * 100%`
  - `width = (eventDuration / viewDuration) * 100%`
- Timeline auto-scrolls toward the current time indicator when available.

## License

MIT
