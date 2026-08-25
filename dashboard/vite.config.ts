import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

/**
 * Two build targets:
 *  - `npm run build`        → conventional multi-asset bundle in dist/
 *  - `SINGLE_FILE=1 vite build` → one self-contained HTML file (board circulation / artifact)
 */
const singleFile = process.env.SINGLE_FILE === '1'

export default defineConfig({
  plugins: [react(), tailwindcss(), ...(singleFile ? [viteSingleFile()] : [])],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    outDir: singleFile ? 'dist-single' : 'dist',
    emptyOutDir: true,
    ...(singleFile ? { assetsInlineLimit: 100_000_000, cssCodeSplit: false } : {}),
  },
})
