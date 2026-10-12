import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// Proxy de /api hacia el backend local, así el cliente funciona desde cualquier
// equipo de la red (Tailscale) sin depender de "localhost" en el navegador.
const apiProxy = {
  '/api': {
    target: 'http://localhost:4000',
    changeOrigin: true,
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    host: true,
    allowedHosts: true,
    proxy: apiProxy,
  },
  preview: {
    host: true,
    allowedHosts: true,
    proxy: apiProxy,
  },
})
