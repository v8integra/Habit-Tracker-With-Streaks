import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative asset paths, so the built app works at a domain root
  // (Netlify, Vercel, Cloudflare Pages) and under a sub-path
  // (GitHub Pages: /<repo>/) without changes. Screens use the URL hash,
  // so no server rewrite rules are needed either.
  base: './',
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
