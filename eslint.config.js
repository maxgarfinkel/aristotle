import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import boundaries from 'eslint-plugin-boundaries'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'pages',      pattern: 'src/pages/**/*' },
        { type: 'components', pattern: 'src/components/**/*' },
        { type: 'hooks',      pattern: 'src/hooks/**/*' },
        { type: 'context',    pattern: 'src/context/**/*' },
        { type: 'services',   pattern: 'src/services/**/*' },
        { type: 'types',      pattern: 'src/types/**/*' },
      ],
      'boundaries/ignore': ['**/*.test.*', '**/*.spec.*', 'src/test-setup.ts'],
    },
    rules: {
      // Enforce: pages → components → hooks → services
      // types may be imported by any layer
      'boundaries/element-types': ['error', {
        default: 'disallow',
        rules: [
          { from: 'pages',      allow: ['components', 'hooks', 'types'] },
          { from: 'components', allow: ['components', 'hooks', 'types'] },
          { from: 'hooks',      allow: ['context', 'services', 'types'] },
          { from: 'context',    allow: ['context', 'types'] },
          { from: 'services',   allow: ['services', 'types'] },
          { from: 'types',      allow: [] },
        ],
      }],
    },
  },
])
