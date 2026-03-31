# @brinda_yawa/easycal-react

React wrapper for `@brinda_yawa/easycal`.

## Install

```bash
npm install @brinda_yawa/easycal @brinda_yawa/easycal-react
```

> `react` and `react-dom` 18+ are required peer dependencies.

## Usage (JavaScript)

```jsx
import { EasyCal } from '@brinda_yawa/easycal-react';
import '@brinda_yawa/easycal/style.css';

export default function CalendarPage() {
  return (
    <EasyCal
      mode="timeline"
      defaultView="resourceTimelineWeek"
      resources={[
        { id: 'room-1', title: 'Room A' },
        { id: 'room-2', title: 'Room B' },
      ]}
      events={[
        {
          id: 'evt-1',
          title: 'Team Meeting',
          start: '2026-03-31T10:00:00',
          end: '2026-03-31T11:00:00',
          resourceId: 'room-1',
        },
      ]}
      dateClick={(info) => console.log('dateClick', info)}
      eventClick={(info) => console.log('eventClick', info)}
      eventDrop={(info) => console.log('eventDrop', info)}
      eventResize={(info) => console.log('eventResize', info)}
    />
  );
}
```

## TypeScript

Type definitions are published with the package (`dist/index.d.ts`).

## Props

`EasyCal` accepts all core EasyCal options plus these React-friendly props:

- `className?: string`
- `style?: React.CSSProperties`
- `dateClick?: (info) => void`
- `eventClick?: (info) => void`
- `eventDrop?: (info) => void`
- `eventResize?: (info) => void`

## Build

From repository root:

```bash
pnpm --filter @brinda_yawa/easycal-react build
```

## License
