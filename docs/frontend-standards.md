# Frontend Standards

## Styling

This project uses **Tailwind CSS v4** via `@tailwindcss/vite`. The `@import "tailwindcss"` directive is at the top of `src/index.css`.

- Use Tailwind utility classes for all styling.
- No inline styles — ever.
- No custom CSS unless a utility class genuinely cannot cover the case (e.g. complex `transform` chains, SVG-specific properties). Custom CSS goes in a colocated `.css` file, not a `style` attribute.
- CSS custom properties (design tokens) defined in `src/index.css` remain valid and can be referenced from Tailwind's `@theme` block or used directly in custom CSS.

## Components

- Functional components only — no class components.
- A component's only external dependencies are props and hooks. It must not import from `src/services/` directly.
- Props should be typed with an explicit interface defined in the component file or in `src/types/`.
- Compose complex UI by combining smaller components rather than growing a single component.

## Hooks

- Hooks are the only place where service calls are triggered from the React tree.
- A hook should encapsulate one cohesive unit of behavior (e.g. `useUser`, `useProductList`).
- Hooks must not render JSX or contain presentational logic.

## Services

- Pure TypeScript modules — no React imports, no hooks.
- Each service encapsulates one domain (e.g. `authService`, `productService`).
- Services return typed values; all return types must reference interfaces from `src/types/`.

## Types

- All shared data models live in `src/types/`.
- Prefer `interface` for object shapes, `type` for unions and aliases.
- No runtime logic in `src/types/` — types and interfaces only.
- Avoid `any`. Use `unknown` when the shape is genuinely unknown and narrow it explicitly.
