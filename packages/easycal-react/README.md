# @brinda_yawa/easycal-react

React wrapper for `@brinda_yawa/easycal`.

## Installation

```bash
npm install @brinda_yawa/easycal @brinda_yawa/easycal-react
```

> `react` and `react-dom` 18+ are required peer dependencies.

## Usage

```tsx
import { EasyCal } from '@brinda_yawa/easycal-react';
import '@brinda_yawa/easycal/style.css';

export default function CalendarPage() {
  return (
    <EasyCal
      mode="timeline"
      defaultView="resourceTimelineWeek"
      resources={[
        { id: 'a', title: 'Room A' },
        { id: 'b', title: 'Room B' },
      ]}
      events={[
        {
          id: 'evt-1',
          title: 'Team Meeting',
          start: '2026-03-31T10:00:00',
          end: '2026-03-31T11:00:00',
          resourceId: 'a',
        },
      ]}
    />
  );
}
```

## Event Form Customization

`eventFormRenderer` accepts JSX/ReactNode. It is converted to static markup for the core popup while EasyCal retains internal save/update/delete behavior.

```tsx
<EasyCal
  mode="timeline"
  defaultView="resourceTimelineDay"
  eventFormRenderer={(context) => (
    <form data-ec-form style={{ display: 'grid', gap: 10 }}>
      <h3>{context.mode === 'edit' ? 'Edit event' : 'Create event'}</h3>
      <input name="title" defaultValue={(context.event as any)?.title || ''} placeholder="Title" required />
      <input name="start" type="datetime-local" required />
      <input name="end" type="datetime-local" required />
      <select name="resourceId" />
      <p className="ec-popup-error" hidden />
      {context.mode === 'edit' && (
        <button type="button" data-ec-action="delete">Delete</button>
      )}
      <button type="button" data-ec-action="cancel">Cancel</button>
      <button type="submit" data-ec-action={context.mode === 'edit' ? 'update' : 'save'}>
        {context.mode === 'edit' ? 'Update' : 'Save'}
      </button>
    </form>
  )}
/>
```

### Context Object Explained

```ts
type EasyCalEventFormContext = {
  mode: 'create' | 'edit';
  event?: any;
  date?: Date;
  resourceId?: string | null;
  save: (data?: any) => void;
  update: (data?: any) => void;
  delete: () => void;
  close: () => void;
};
```

- `dateClick` opens create mode with `date` + `resourceId`.
- `eventClick` opens edit mode with `event`.
- `resourceId` payloads are normalized across core and React callbacks.

## Hooks

- `dateClick(info)`
- `eventClick(info)`
- `eventDrop(info)`
- `eventResize(info)`
- `onDateChange(info)`

All can be passed as React props and remain synced without re-initializing the core instance.

## Demo patterns

### Resource-aware creation

```tsx
<EasyCal
  mode="timeline"
  defaultView="resourceTimelineWeek"
  dateClick={(info) => console.log('create on resource', info.resourceId)}
/>
```

### Edit + delete

```tsx
<EasyCal
  eventClick={(info) => console.log('editing', info.event)}
  eventFormRenderer={(ctx) => (
    <div>
      <button type="button" data-ec-action="delete">Delete</button>
      <button type="button" data-ec-action="close">Close</button>
    </div>
  )}
/>
```

## Ref / imperative API

```tsx
const ref = useRef<EasyCalRef>(null);

ref.current?.next();
ref.current?.gotoDate('2026-04-10');
ref.current?.changeView('resourceTimelineDay');
```

## Build

From repository root:

```bash
pnpm --filter @brinda_yawa/easycal-react build
```

## License

MIT
