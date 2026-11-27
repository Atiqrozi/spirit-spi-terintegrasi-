import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue() as never],
  test: { environment: 'jsdom', include: ['src/**/*.spec.ts'] },
})
