import { defineConfig } from "vite"
import path from "path"
import fs from "fs"

export default defineConfig({
  server: {
    host: true,
    open: true,
    middlewareMode: false,
  },
  plugins: [
    {
      name: 'setup-detection-middleware',
      configureServer(server) {
        server.middlewares.use('/.remix/.setup_required', (_req, res, _next) => {
          // Check if .remix/.setup_required file actually exists
          const setupRequiredPath = path.join(process.cwd(), '.remix', '.setup_required');
          const fileExists = fs.existsSync(setupRequiredPath);
          
          // Return 204 status with header indicating setup requirement
          res.writeHead(204, {
            'X-Setup-Required': fileExists.toString(),
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
