import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true, // Esto permite que React Router maneje las rutas
  },
  base: '/',  // Ajusta esto si tu aplicación no está en la raíz del dominio
});
