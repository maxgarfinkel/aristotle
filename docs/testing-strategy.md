# Testing Strategy

## Stack

- **Vitest** — test runner (Jest-compatible API, Vite-native)
- **React Testing Library** — component and hook testing
- **jsdom** — browser environment for Vitest
- **@testing-library/jest-dom** — DOM matchers (auto-imported via `src/test-setup.ts`)
- **@testing-library/user-event** — simulating user interactions

## Commands

```bash
npm test                 # Watch mode
npm run test:coverage    # Single run with coverage report
```

## Coverage Target

80% minimum (lines, functions, branches, statements). Enforced by Vitest's coverage thresholds — the run will fail if any threshold is not met.

## By Layer

### Components & Pages — React Testing Library

Test through RTL. Assert on rendered output and user interactions, not implementation details. Use `userEvent` over `fireEvent` for interaction simulation.

### Hooks — React Testing Library

Use `renderHook` from RTL to test hooks in isolation.

### Services — Vitest

Services are plain TypeScript functions with no React dependencies. Test with pure Vitest unit tests (same API as Jest). Mock external integrations (API clients, etc.) at the service boundary using `vi.mock`.

### Types

No tests — types have no runtime behavior.

## What Not to Test

- Internal component state directly
- Implementation details that don't affect rendered output or return values

## File Conventions

Place test files adjacent to the file under test using the `.test.ts` / `.test.tsx` suffix:

```
src/components/Button/Button.tsx
src/components/Button/Button.test.tsx
```
