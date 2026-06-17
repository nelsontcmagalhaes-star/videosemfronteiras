import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Headers required for SharedArrayBuffer (used by @ffmpeg/ffmpeg WASM)
const coopCoep = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'credentialless',
}

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '5179'),
    headers: coopCoep,
  },
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
})
