import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@Copy': path.resolve(__dirname, 'src/components/Copyright.jsx'),
      '@OAuthButtons': path.resolve(__dirname, 'src/components/auth/OAuthButtons.jsx'),
      '@api': path.resolve(__dirname, 'src/utils/api.js'),
      '@contexts': path.resolve(__dirname, 'src/contexts'),
      '@hooks': path.resolve(__dirname, 'src/hooks'), 
    },
  },
})
