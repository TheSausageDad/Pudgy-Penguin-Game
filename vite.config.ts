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

        // Add middleware to serve package manager info
        server.middlewares.use('/.remix/package-manager', (_req, res) => {
          // Detect package manager
          const userAgent = process.env.npm_config_user_agent || '';
          const execPath = process.env.npm_execpath || '';
          
          let packageManager = 'npm';
          
          // Check more specific package managers first (pnpm, yarn, bun) before npm
          if (userAgent.includes('pnpm') || execPath.includes('pnpm')) {
            packageManager = 'pnpm';
          } else if (userAgent.includes('yarn') || execPath.includes('yarn')) {
            packageManager = 'yarn';
          } else if (userAgent.includes('bun') || execPath.includes('bun')) {
            packageManager = 'bun';
          } else if (userAgent.includes('npm') && !userAgent.includes('pnpm')) {
            packageManager = 'npm';
          } else if (fs.existsSync('pnpm-lock.yaml')) {
            packageManager = 'pnpm';
          } else if (fs.existsSync('yarn.lock')) {
            packageManager = 'yarn';
          } else if (fs.existsSync('bun.lockb')) {
            packageManager = 'bun';
          }
          
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ packageManager }));
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
