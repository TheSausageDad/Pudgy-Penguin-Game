import { defineConfig } from "vite"
import path from "path"

export default defineConfig({
  server: {
    host: true,
    open: true,
    middlewareMode: false,
  },
  plugins: [
    {
      name: 'setup-detection-middleware-bypass',
      configureServer(server) {
        server.middlewares.use('/.remix/.setup_required', (_req, res, _next) => {
          // Always return false for setup required (bypass check)
          res.writeHead(204, {
            'X-Setup-Required': 'false',
            'Content-Type': 'text/plain'
          });
          res.end();
        });
      },
    },
  ],
  build: {
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
    minify: false,
    rollupOptions: {
      external: ["phaser"],
      output: {
        globals: {
          phaser: "Phaser",
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  publicDir: "public",
  optimizeDeps: {
    exclude: ["phaser"],
  },
})