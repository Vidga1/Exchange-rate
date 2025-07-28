import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      '/api/nbkr': {
        target: 'https://www.nbkr.kg',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nbkr/, '/XML/daily.xml'),
      },
    },
  },
})
