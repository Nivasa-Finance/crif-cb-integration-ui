import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/devapi": {
        target: "https://9hxc3kom41.execute-api.ap-south-1.amazonaws.com/prod",
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/devapi/, ""),
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            const loc = proxyRes.headers['location'];
            if (typeof loc === 'string') {
              // Force relative path to stay on same origin
              proxyRes.headers['location'] = loc.replace(/^https?:\/\/[^/]+/, '');
            }
          });
        }
      },
    },
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
