# EasyCal

A lightweight, zero-dependency JavaScript calendar library.

## Features

- 🗓 **4 Views**: Month, Week, Day, List/Agenda
- ⚡ **Zero dependencies** — pure vanilla JS
- 🎨 **Fully themeable** via CSS custom properties
- 📡 **Event API** — add/remove/update events at runtime
- 🌍 **i18n ready** — locale-aware via `Intl` API
- 📦 **UMD + ESM** builds for any environment

## Installation

```bash
npm install easycal
```

Or via CDN:
```html
<link rel="stylesheet" href="https://unpkg.com/easycal/dist/easycal.css">
<script src="https://unpkg.com/easycal/dist/easycal.js"></script>
```

## Quick Start

```html
<link rel="stylesheet" href="easycal.css">
<div id="calendar"></div>
<script src="easycal.js"></script>
<script>
  const cal = new EasyCal('#calendar', {
    view: 'month',
    events: [
      {
        title: 'Team Standup',
        start: '2025-01-15T09:00:00',
        end:   '2025-01-15T09:30:00',
        color: '#3b82f6'
      }
    ]
  });
</script>
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `view` | `string` | `'month'` | Initial view: `month`, `week`, `day`, `list`, `timeline` |
| `date` | `Date` | `new Date()` | Initial date |
| `events` | `array` | `[]` | Array of event objects |
| `locale` | `string` | `'default'` | Locale string for date formatting |
| `firstDay` | `number` | `0` | First day of week (0=Sun, 1=Mon) |
| `eventColor` | `string` | `'#3b82f6'` | Default event background color |
| `eventTextColor` | `string` | `'#ffffff'` | Default event text color |
| `resources` | `array` | `[]` | Resource rows used by `timeline` view |
| `timelineGranularity` | `string` | `'month'` | Timeline date span: `month`, `week`, `day` |
| `headerToolbar` | `object` | See below | Toolbar layout |

### headerToolbar

```js
{
  left:   'prev,next today',
  center: 'title',
  right:  'month,week,day,list,timeline'
}
```

## Event Object

```js
{
  id:         'optional-id',    // auto-generated if omitted
  title:      'My Event',       // required
  start:      '2025-03-10T09:00', // Date or ISO string
  end:        '2025-03-10T10:00', // Date or ISO string
  allDay:     false,
  color:      '#3b82f6',        // overrides eventColor
  textColor:  '#ffffff',
  resourceId: 'vehicle-1',      // optional, used in timeline view
  extendedProps: {}             // custom data
}
```

## Callbacks

```js
const cal = new EasyCal('#calendar', {
  eventClick({ event, el, jsEvent }) {},
  eventMouseEnter({ event, el, jsEvent }) {},
  eventMouseLeave({ event, el, jsEvent }) {},
  dateClick({ date, el, jsEvent }) {},
  datesSet({ view, start, el }) {},
  viewDidMount({ view, date, el }) {},
});
```

## API Methods

```js
cal.changeView('week');          // switch view
cal.today();                     // go to today
cal.prev();                      // previous period
cal.next();                      // next period
cal.gotoDate(new Date());        // jump to date

cal.addEvent({ title, start, end, ... });    // add event → returns event
cal.removeEvent('event-id');     // remove event
cal.updateEvent('event-id', {title: 'New'}); // update event
cal.getEvents();                 // → EventObject[]
cal.getEventById('id');          // → EventObject | null

cal.setOption('eventColor', '#ff0000'); // update option
cal.destroy();                   // cleanup
```

## Theming

EasyCal uses CSS custom properties for easy theming:

```css
#calendar {
  --ec-font:         'Your Font', sans-serif;
  --ec-bg:           #ffffff;
  --ec-border:       #e5e7eb;
  --ec-text:         #111827;
  --ec-text-muted:   #6b7280;
  --ec-today-color:  #2563eb;
  --ec-today-bg:     #eff6ff;
  --ec-hover-bg:     #f3f4f6;
  --ec-header-bg:    #f9fafb;
  --ec-event-radius: 4px;
}
```

## License

MIT
