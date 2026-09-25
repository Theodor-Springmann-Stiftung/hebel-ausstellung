// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://ausstellung.hebel-archiv.de',
  devToolbar: {
    enabled: false
  },
  integrations: [
    sitemap({
      filter(page) {
        const pathname = new URL(page).pathname;

        return !['/404', '/404/', '/404.html'].includes(pathname) && !pathname.endsWith('.json');
      }
    })
  ],
  vite: {
    plugins: [tailwindcss()],
    server: {
      fs: {
        allow: ['.', '../content', '../assets'].map((directory) =>
          fileURLToPath(new URL(directory, import.meta.url))
        )
      }
    }
  }
});
