import { defineConfig } from 'astro/config';

export default defineConfig({
  base: '/KLA2026',
  output: 'static',
  build: {
    format: 'file'
  },
  server: {
    host: true
  }
});
