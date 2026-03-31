# EasyCal Monorepo

This repository is now a workspace monorepo with two publishable packages:

- `@brinda_yawa/easycal` (framework-agnostic core)
- `@brinda_yawa/easycal-react` (React wrapper)

## Workspace layout

```txt
packages/
  core/            # @brinda_yawa/easycal
  easycal-react/   # @brinda_yawa/easycal-react
pnpm-workspace.yaml
```

## Install (workspace)

```bash
pnpm install
pnpm build
```

## React wrapper usage

```tsx
import { EasyCal } from '@brinda_yawa/easycal-react';

export function CalendarPage() {
  return (
    <EasyCal
      mode="timeline"
      defaultView="resourceTimelineWeek"
      events={[]}
      resources={[]}
      dateClick={(info) => console.log(info)}
      eventClick={(info) => console.log(info)}
      eventDrop={(info) => console.log(info)}
      eventResize={(info) => console.log(info)}
    />
  );
}
```

## Notes

- Core stays framework-agnostic.
- React package is a thin adapter around the core instance lifecycle.
