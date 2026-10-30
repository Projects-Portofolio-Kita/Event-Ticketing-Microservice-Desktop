import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// @ts-expect-error type error without @types/node package
import process from "node:process";
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(() => ({
  plugins: [react()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
    proxy: {
      "/api/auth": {
        target: "http://localhost:8081",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/auth/, "/api/v1/auth"),
      },
      "/api/booking": {
        target: "http://localhost:8083",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/booking/, "/api/v1"),
      },
      "/api/payment": {
        target: "http://localhost:8084",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/payment/, "/api/v1"),
      },
      "/api/catalog": {
        target: "http://localhost:8082",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/catalog/, "/api/v1"),
      },
      "/health/booking": {
        target: "http://localhost:8083",
        changeOrigin: true,
        rewrite: () => "/health",
      },
      "/health/payment": {
        target: "http://localhost:8084",
        changeOrigin: true,
        rewrite: () => "/health",
      },
      "/health/catalog": {
        target: "http://localhost:8082",
        changeOrigin: true,
        rewrite: () => "/health",
      },
    },
  },
}));
