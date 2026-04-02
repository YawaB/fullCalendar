# @brinda_yawa/easycal

A lightweight, zero-dependency JavaScript calendar library with:

- `mode: 'standard'` for `month`, `week`, and `day` views
- `mode: 'timeline'` for `resourceTimelineDay`, `resourceTimelineWeek`, and `resourceTimelineMonth`

## Installation

```bash
npm install @brinda_yawa/easycal
```

## Quick start

```js
import EasyCal from '@brinda_yawa/easycal';
import '@brinda_yawa/easycal/style.css';

const cal = new EasyCal('#calendar', {
  mode: 'standard',
  defaultView: 'month',
  events: []
});
```

## Resource Basics

Resources work out of the box with a minimal structure:

```js
const cal = new EasyCal('#calendar', {
  mode: 'timeline',
  defaultView: 'resourceTimelineDay',
  resources: [
    { id: 'room-a', title: 'Room A' },
    { id: 'room-b', title: 'Room B' }
  ]
});
```

If no custom renderer is provided, EasyCal renders `title` (fallback: `id`).

## Custom Resource Structure

Resources are fully flexible. You can pass any shape (including nested `children`) as long as each resource resolves to a stable id.

```js
const resources = [
  { id: 'a', label: 'Room A', icon: '🏢', description: 'Main hall' },
  { id: 'b', name: 'Room B', capacity: 50, type: 'conference' },
  {
    id: 'c',
    name: 'Floor C',
    children: [
      { id: 'c1', name: 'Room C1', capacity: 16 }
    ]
  }
];
```

## `resourceRenderer`

Use `resourceRenderer` to fully control each resource row cell:

```js
const cal = new EasyCal('#calendar', {
  mode: 'timeline',
  defaultView: 'resourceTimelineWeek',
  resources,
  resourceRenderer: (resource) => {
    return `
      <div class="my-resource">
        <span>${resource.icon || ''}</span>
        <strong>${resource.label || resource.title || resource.name}</strong>
        <small>${resource.description || ''}</small>
      </div>
    `;
  }
});
```

`resourceRenderer` supports returning either:

- `string` (HTML string)
- `HTMLElement`

## `resourceFieldMap`

Use `resourceFieldMap` when your input data uses different key names:

```js
const cal = new EasyCal('#calendar', {
  mode: 'timeline',
  defaultView: 'resourceTimelineDay',
  resources: [
    { uuid: 'a', name: 'Room A' },
    { uuid: 'b', name: 'Room B' }
  ],
  resourceFieldMap: {
    id: 'uuid',
    label: 'name'
  }
});
```

This lets your events continue using `resourceId` values like `'a'`, `'b'` without pre-transforming resources.

## Best Practices

- Keep resource ids stable across renders (`resourceId` matching depends on this).
- Keep `resourceRenderer` lightweight (avoid heavy DOM work in large timelines).
- Use `resourceFieldMap` to adapt API data instead of cloning/mapping large arrays repeatedly.

## Timeline example

```js
const cal = new EasyCal('#calendar', {
  mode: 'timeline',
  defaultView: 'resourceTimelineWeek',
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

## License

MIT
