// @ts-check
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      'playwright-report/**',
      'test-results/**',
      'docs/**',
      'packages/db-types/src/database.ts',
      // Deno code is linted and tested by deno (CI check 9), not by the Node toolchain.
      'supabase/functions/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    files: ['apps/**/*.{ts,tsx}', 'packages/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['error', { allowConstantExport: true }],
    },
  },
  {
    // ADR-006: public.svc_* functions are service-role only; browser code must never call them.
    files: ['apps/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.property.name='rpc'] Literal[value=/^svc_/]",
          message: 'svc_* functions are for Edge Functions with the service role only (ADR-006). Call a public RPC instead.',
        },
        {
          selector: "CallExpression[callee.property.name='rpc'] TemplateElement[value.raw=/^svc_/]",
          message: 'svc_* functions are for Edge Functions with the service role only (ADR-006). Call a public RPC instead.',
        },
      ],
    },
  },
  {
    files: ['**/*.{js,cjs,mjs}', '*.config.ts', 'apps/*/*.config.ts', 'e2e/**/*.ts', 'tools/**/*.{js,mjs,ts}'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.cjs'],
    languageOptions: { sourceType: 'commonjs' },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
);
