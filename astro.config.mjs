import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import { statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataFilePath = join(__dirname, 'src/data/constituencies.json');
const dataStats = statSync(dataFilePath);
const buildTime = new Date().toISOString();
const dataTime = dataStats.mtime.toISOString();

export default defineConfig({
  base: '/KLA2026',
  output: 'static',
  build: {
    format: 'file'
  },
  server: {
    host: true
  },
  integrations: [svelte()],
  vite: {
    define: {
      'import.meta.env.APP_VERSION': JSON.stringify(buildTime),
      'import.meta.env.DATA_VERSION': JSON.stringify(dataTime)
    }
  }
});
