import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import featureBoundaries from './eslint-rules/feature-boundaries.js'

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'playwright-report', 'test-results'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    // SPEC §3.2: a feature never imports from another feature (also via ../../ paths).
    files: ['src/features/**/*.{ts,tsx}'],
    plugins: { ijzer: { rules: { 'feature-boundaries': featureBoundaries } } },
    rules: { 'ijzer/feature-boundaries': 'error' },
  },
  {
    // SPEC §3.2: domain/ is pure TypeScript.
    files: ['src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-*', '**/features/*', '**/ui/*', '**/data/*'],
              message: 'domain/ must stay pure: no React, UI, data or feature imports.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['scripts/**/*.mjs', 'eslint-rules/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
  },
)
