import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    env: {
      VITE_BACKEND_URL: 'http://127.0.0.1:3000/graphql',
    },
    globals: true,
    // `e2e/` belongs to Playwright; Vitest must not pick up its specs.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
