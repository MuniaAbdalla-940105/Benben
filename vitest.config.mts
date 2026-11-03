import { defineConfig } from 'vitest/config';

// One Vitest run for the whole monorepo; each package declares its own project config.
export default defineConfig({
  test: {
    projects: ['apps/*', 'packages/shared'],
    passWithNoTests: false,
  },
});
