import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

// Moltbot City - Vite React SPA
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    strictPort: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
  },
})
