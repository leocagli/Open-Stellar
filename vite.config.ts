import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [
    react(),
    // Neutralize @cloudflare/vite-plugin if it auto-registers
    {
      name: "block-cloudflare",
      enforce: "pre" as const,
      config(cfg) {
        // Strip any cloudflare plugins that auto-registered
        if (cfg.plugins) {
          cfg.plugins = (cfg.plugins as any[]).filter((p: any) => {
            const name = p?.name || (Array.isArray(p) ? p[0]?.name : "")
            return !String(name).toLowerCase().includes("cloudflare")
          })
        }
        return cfg
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
