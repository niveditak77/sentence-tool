import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/sentence-tool/', // 👈 required for GitHub Pages
  plugins: [react()],
})
