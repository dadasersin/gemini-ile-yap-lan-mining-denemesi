
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    // Render varsayılan olarak 'build' klasörünü beklediği için outDir güncellendi
    outDir: 'build',
    emptyOutDir: true,
  }
});
