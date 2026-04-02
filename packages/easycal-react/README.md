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

const resources = [
  { uuid: 'a', label: 'Room A', icon: '🏢', description: 'Main hall' },
  { uuid: 'b', label: 'Room B', icon: '🎤', description: 'Event space' },
];

export default function CalendarPage() {
  return (
    <EasyCal
      mode="timeline"
      defaultView="resourceTimelineWeek"
      resources={resources}
      resourceFieldMap={{ id: 'uuid', label: 'label' }}
      resourceRenderer={(r) => (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span>{r.icon}</span>
          <div>
            <strong>{r.label}</strong>
            <small style={{ display: 'block', color: '#6b7280' }}>{r.description}</small>
          </div>
        </div>
      )}
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

## Props

`EasyCal` accepts all core options plus React-friendly props:

- `className?: string`
- `style?: React.CSSProperties`
- `resources?: any[]`
- `resourceFieldMap?: { id?: string; label?: string }`
- `resourceRenderer?: (resource) => ReactNode | HTMLElement | string`
- `dateClick?: (info) => void`
- `onDateChange?: (info) => void`
- `eventClick?: (info) => void`
- `eventDrop?: (info) => void`
- `eventResize?: (info) => void`

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
