import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Keep the GitHub repository name as: kanban-dashboard
  base: '/kanban-dashboard/',
})
