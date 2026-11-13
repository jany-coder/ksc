import { defineConfig } from 'vitest/config'

// Tests run in plain Node. vite.config.ts is not reused on purpose: it loads the
// Cloudflare plugin, which would run every test inside the Worker runtime.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: { environment: 'node' },
})
