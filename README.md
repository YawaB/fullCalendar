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

If you hit missing-module errors from Rollup/TypeScript bins, use Node LTS (20.x) and do a clean reinstall:

```bash
nvm use 20.19.0
rm -rf node_modules packages/*/node_modules pnpm-lock.yaml
pnpm store prune
pnpm install
pnpm --filter @brinda_yawa/easycal build
pnpm --filter @brinda_yawa/easycal-react build
```

The workspace now enforces Node 20.x during install (`preinstall` + `engine-strict`) so unsupported versions such as Node 23 fail fast with a clear recovery message.

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
