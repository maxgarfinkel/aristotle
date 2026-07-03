# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev            # Start dev server with HMR
npm run build          # Type-check (tsc -b) then bundle with Vite
npm run lint           # ESLint
npm run preview        # Preview production build locally
npm test               # Vitest in watch mode
npm run test:coverage  # Single run with coverage report (80% thresholds enforced)
npm run check          # Full quality gate: lint + build + test:coverage
```

## Definition of Done

**`npm run check` must pass before any feature is considered finished.** Run it and fix all failures before marking work complete.

## Code Quality Rules

Every change must leave the codebase in this state:

- `npm run build` passes with no errors
- `npm run lint` passes with zero warnings
- No TypeScript errors
- New logic has tests
- No ESLint rules are disabled (`// eslint-disable` comments are forbidden)
- No inline styles — use Tailwind utility classes
- No duplicate components — check `src/components/` before creating anything new
- Follow existing patterns in the surrounding code

## Architecture

This is a React 19 + TypeScript + Vite app. Entry point: `src/main.tsx` → `src/App.tsx`.

The project has `headroom-ai` (v0.22.4) installed as a runtime dependency but not yet used. TypeScript config is split across `tsconfig.json` (project references root), `tsconfig.app.json` (browser source), and `tsconfig.node.json` (Vite config).

### Layer boundaries

```
pages → components → hooks → services
```

| Layer | Lives in | Rule |
|---|---|---|
| Pages | `src/pages/` | Orchestrate layout; compose from components |
| Components | `src/components/` | Presentational only; call hooks, never services |
| Hooks | `src/hooks/` | Stateful logic; the only place services are called from the React tree |
| Services | `src/services/` | Pure TS functions; no React imports, no hooks, no JSX |
| Types | `src/types/` | Interfaces and type aliases only; no runtime logic; importable by any layer |

Boundary violations are **ESLint errors** enforced by `eslint-plugin-boundaries` — `npm run lint` will fail on any illegal import within `src/`.

### Styling

Tailwind CSS v4 is configured via `@tailwindcss/vite`. Use Tailwind utility classes for all styling. Custom CSS is only acceptable when a utility class genuinely cannot cover the case (e.g. complex transforms). No inline styles.

### Component rules

- Functional components only — no class components
- Props typed with an explicit interface
- Compose complex UI from smaller components rather than growing one large component
- Before creating a component, confirm no equivalent exists in `src/components/`

### Type rules

- Prefer `interface` for object shapes, `type` for unions and aliases
- Avoid `any` — use `unknown` and narrow explicitly when the shape is genuinely unknown
- Every service return type must reference an interface from `src/types/`

## Testing

Coverage target: **80% minimum** (enforced by Vitest thresholds — `npm run test:coverage` fails if not met).

| Layer | Tool |
| --- | --- |
| Components & Pages | React Testing Library — assert on rendered output and interactions |
| Hooks | RTL `renderHook` |
| Services | Vitest unit tests (Jest-compatible API) — mock at the service boundary with `vi.mock` |
| Types | None |

Test files live adjacent to the source file: `Button.tsx` → `Button.test.tsx`. Do not test internal state or implementation details.

Full details: [`docs/architecture.md`](docs/architecture.md), [`docs/frontend-standards.md`](docs/frontend-standards.md), [`docs/testing-strategy.md`](docs/testing-strategy.md).

