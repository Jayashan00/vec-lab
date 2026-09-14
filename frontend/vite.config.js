import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Standard Vite + React config. The dev server proxies /api calls to the
// backend so the frontend can just call relative paths like "/api/courses".
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
