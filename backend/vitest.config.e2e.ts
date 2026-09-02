import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    env: {
      JWT_AUDIENCE: 'financy-web',
      JWT_EXPIRES_IN: '15m',
      JWT_ISSUER: 'financy-api',
      JWT_SECRET: 'ci-only-secret-with-at-least-32-characters',
    },
  },
});
