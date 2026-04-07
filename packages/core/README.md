# @brinda_yawa/easycal

A lightweight, zero-dependency JavaScript calendar library with:

- `mode: 'standard'` for `month`, `week`, and `day` views
- `mode: 'timeline'` for `resourceTimelineDay`, `resourceTimelineWeek`, and `resourceTimelineMonth`
- Built-in event form logic that can now be fully customized

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

## Event Form Customization

Use `eventFormRenderer` to override create/edit form UI while keeping EasyCal's internal create/update/delete logic:

```js
const cal = new EasyCal('#calendar', {
  mode: 'timeline',
  defaultView: 'resourceTimelineWeek',
  eventFormRenderer: (context) => {
    return `
      <form data-ec-form>
        <h3>${context.mode === 'edit' ? 'Edit event' : 'Create event'}</h3>
        <input name="title" value="${context.event?.title || ''}" placeholder="Title" required />
        <input name="start" type="datetime-local" required />
        <input name="end" type="datetime-local" required />
        <select name="resourceId"></select>
        <p class="ec-popup-error" hidden></p>
        <button type="button" data-ec-action="cancel">Cancel</button>
        ${context.mode === 'edit' ? '<button type="button" data-ec-action="delete">Delete</button>' : ''}
        <button type="submit" data-ec-action="${context.mode === 'edit' ? 'update' : 'save'}">
          ${context.mode === 'edit' ? 'Update' : 'Save'}
        </button>
      </form>
    `;
  }
});
```

### Context Object Explained

`eventFormRenderer` receives:

```ts
{
  mode: 'create' | 'edit',
  event?: EventObject,
  date?: Date,
  resourceId?: string,
  save: (data?) => void,
  update: (data?) => void,
  delete: () => void,
  close: () => void,
}
```

Behavior:

- `dateClick` opens **create mode** with prefilled `date` and `resourceId`.
- `eventClick` opens **edit mode** with the selected `event`.
- `resourceId` is normalized and passed in standard/timeline payloads.
- Internal event lifecycle stays centralized in EasyCal (`addEvent`, `updateEvent`, `removeEvent`).

## Event hooks

All hooks are supported and normalized:

- `dateClick(info)` (alias: `onDateClick`)
- `eventClick(info)` (alias: `onEventClick`)
- `eventDrop(info)` (alias: `eventDrag`)
- `onDateChange(info)`

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

## Best practices

- Keep resource ids stable across renders (`resourceId` matching depends on this).
- Keep custom renderers lightweight.
- Use `resourceFieldMap` for API adaptation.
- In custom forms, prefer `data-ec-form` + `data-ec-action` to reuse built-in validation + persistence.

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
