// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: '/apex/',
  plugins: [react()],
  server: {
    proxy: {
      "/api/ergast": {
        target: "https://ergast.com/api/f1/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ergast\//, ""),
      },
    },
  },
});
