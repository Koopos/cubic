import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/cubic',  // 默认，表示部署在根路径
  build: {
    outDir: 'docs',
  },
  plugins: [react()],
})
