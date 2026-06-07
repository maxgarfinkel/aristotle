# Architecture

## Directory Structure

```
src/
  pages/       # Route-level components — compose page layouts from components
  components/  # Reusable UI components — no direct service calls
  hooks/       # Custom React hooks — bridge between components and services
  services/    # Business logic, data fetching, external integrations
  types/       # Shared TypeScript types and interfaces — no runtime logic
```

## Dependency Boundaries

Data and control flow in one direction only:

```
pages → components → hooks → services
```

- **Pages** orchestrate layout and pass data down to components.
- **Components** are purely presentational; they call hooks, never services directly.
- **Hooks** encapsulate stateful logic and call services.
- **Services** are plain functions with no React dependencies (no hooks, no JSX).
- **Types** are imported by any layer but define no behavior.

Crossing a boundary (e.g. a component importing directly from `services/`, or a service importing from `hooks/`) is an architecture violation and will be caught as an ESLint error by `eslint-plugin-boundaries`.

Permitted imports per layer:

| Layer        | May import from               |
| ------------ | ----------------------------- |
| `pages`      | `components`, `hooks`, `types` |
| `components` | `hooks`, `types`              |
| `hooks`      | `services`, `types`           |
| `services`   | `types`                       |
| `types`      | —                             |

## Key Principles

- **Composability**: components are small, single-purpose, and assembled into larger units at the page level.
- **Separation of concerns**: UI state lives in components/hooks; business logic lives in services; shape of data lives in types.
- **Functional components only**: no class components.
- **Strong typing**: every data model has an explicit interface or type in `src/types/`. Avoid `any`; avoid inferring types from implementation details.
