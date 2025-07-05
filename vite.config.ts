import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/day-planner/', // <-- match GitHub Pages repo name
  plugins: [react()],
});
