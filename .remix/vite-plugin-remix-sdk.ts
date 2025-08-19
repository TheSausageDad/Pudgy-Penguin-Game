import type { Plugin } from 'vite';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

function detectPackageManager(): string {
  // Check multiple environment variables that indicate the package manager
  const userAgent = process.env.npm_config_user_agent || '';
  const execPath = process.env.npm_execpath || '';
  const lifecycle = process.env.npm_lifecycle_script || '';
  
  // Check npm_config_user_agent first
  if (userAgent.includes('pnpm')) return 'pnpm';
  if (userAgent.includes('yarn')) return 'yarn';
  if (userAgent.includes('bun')) return 'bun';
  if (userAgent.includes('npm')) return 'npm';
  
  // Check npm_execpath for package manager binary
  if (execPath.includes('pnpm')) return 'pnpm';
  if (execPath.includes('yarn')) return 'yarn';
  if (execPath.includes('bun')) return 'bun';
  if (execPath.includes('npm')) return 'npm';
  
  // Check process.argv for package manager
  const argv = process.argv.join(' ');
  if (argv.includes('pnpm')) return 'pnpm';
  if (argv.includes('yarn')) return 'yarn';
  if (argv.includes('bun')) return 'bun';
  
  // Check for lock files as fallback, prioritizing most recently used
  const lockFiles = [
    { file: 'pnpm-lock.yaml', manager: 'pnpm' },
    { file: 'yarn.lock', manager: 'yarn' },
    { file: 'bun.lockb', manager: 'bun' },
    { file: 'package-lock.json', manager: 'npm' }
  ];
  
  // Find the most recently modified lock file
  let mostRecentManager = 'npm';
  let mostRecentTime = 0;
  
  for (const { file, manager } of lockFiles) {
    if (existsSync(file)) {
      try {
        const { mtimeMs } = require('fs').statSync(file);
        if (mtimeMs > mostRecentTime) {
          mostRecentTime = mtimeMs;
          mostRecentManager = manager;
        }
      } catch (e) {
        // If we can't stat the file, just use it if it's the first found
        if (mostRecentTime === 0) {
          mostRecentManager = manager;
        }
      }
    }
  }
  
  return mostRecentManager;
}

/**
 * Vite plugin that provides Remix SDK emulation during development
 */
export function remixSDKPlugin(options: { packageManager?: string } = {}): Plugin {
  // Use provided package manager or detect from environment
  const packageManager = options.packageManager || detectPackageManager();
  
  return {
    name: 'remix-sdk-emulation',
    
    configureServer(server) {
      // Add middleware to serve package manager info
      server.middlewares.use('/.remix/package-manager', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ packageManager }));
      });
      
      // Add middleware to serve the game iframe content
      server.middlewares.use('/game.html', (req, res, next) => {
        try {
          // Read the original index.html
          const indexPath = join(server.config.root, 'index.html');
          let html = readFileSync(indexPath, 'utf-8');

          // Transform the HTML for iframe use
          html = transformForIframe(html);

          // Apply Vite's HTML transformations
          server.transformIndexHtml('/game.html', html)
            .then((transformedHtml) => {
              res.setHeader('Content-Type', 'text/html');
              res.end(transformedHtml);
            })
            .catch(next);
        } catch (error) {
          next(error);
        }
      });
    },

    transformIndexHtml: {
      order: 'pre',
      handler(html, context) {
        // Transform the main index.html in development
        if (context.server) {
          return transformMainHTML(html);
        }
        return html;
      }
    },

    // Remove the load hook - we'll handle SDK injection in the iframe HTML transform
  };
}

function transformMainHTML(html: string): string {
  // Transform the main HTML to show the dev overlay instead of the game directly
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Remix Development Environment</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <script type="module" src="/src/dev-main.ts"></script>
</body>
</html>
  `;
}

function transformForIframe(html: string): string {
  // Transform HTML for iframe usage - inject SDK mock initialization
  
  // Add SDK mock script that initializes before the main game
  const sdkMockScript = `
    <script type="module">
      // Inline SDK mock for iframe
      class RemixSDKMock {
        constructor() {
          this.eventListeners = new Map();
          this.isReady = false;
          this.isMuted = false;
        }

        singlePlayer = {
          actions: {
            ready: () => {
              console.log('[Remix SDK Mock] Game ready');
              this.isReady = true;
              this.emit('ready', {});
              this.postToParent('ready');
            },
            
            gameOver: (data = {}) => {
              console.log('[Remix SDK Mock] Game over', data);
              this.emit('game_over', data);
              this.postToParent('game_over', data);
            }
          }
        };

        on(eventType, listener) {
          if (!this.eventListeners.has(eventType)) {
            this.eventListeners.set(eventType, []);
          }
          this.eventListeners.get(eventType).push(listener);
          console.log('[Remix SDK Mock] Registered listener for', eventType);
        }

        off(eventType, listener) {
          const listeners = this.eventListeners.get(eventType);
          if (listeners) {
            const index = listeners.indexOf(listener);
            if (index !== -1) {
              listeners.splice(index, 1);
            }
          }
        }

        emit(eventType, data) {
          const listeners = this.eventListeners.get(eventType);
          if (listeners) {
            const event = { type: eventType, data };
            listeners.forEach(listener => {
              try {
                listener(event);
              } catch (error) {
                console.error('[Remix SDK Mock] Error in listener:', error);
              }
            });
          }
        }

        postToParent(eventType, data) {
          if (window.parent !== window) {
            try {
              window.parent.postMessage({
                type: 'remix_sdk_event',
                event: { type: eventType, data }
              }, '*');
            } catch (error) {
              console.warn('[Remix SDK Mock] Could not post to parent:', error);
            }
          }
        }

        triggerPlayAgain() {
          console.log('[Remix SDK Mock] Play again triggered');
          this.emit('play_again', {});
        }

        triggerMute(isMuted) {
          console.log('[Remix SDK Mock] Mute toggled:', isMuted);
          this.isMuted = isMuted;
          this.emit('toggle_mute', { isMuted });
        }
      }

      // Initialize the mock SDK
      if (!('FarcadeSDK' in window)) {
        const mockSDK = new RemixSDKMock();
        window.FarcadeSDK = mockSDK;
        window.__remixSDKMock = mockSDK;
        
        console.log('[Remix SDK Mock] Initialized development SDK');
        
        // Listen for messages from parent window (dev UI)
        window.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'remix_dev_command') {
            const { command, data } = event.data;
            
            switch (command) {
              case 'play_again':
                mockSDK.triggerPlayAgain();
                break;
              case 'toggle_mute':
                mockSDK.triggerMute(data.isMuted);
                break;
            }
          }
        });
      }
    </script>
  `;

  // Insert before the main script tag
  if (html.includes('<script type="module" src="/src/main.ts"></script>')) {
    html = html.replace(
      '<script type="module" src="/src/main.ts"></script>',
      sdkMockScript + '\n    <script type="module" src="/src/main.ts"></script>'
    );
  } else if (html.includes('</head>')) {
    html = html.replace('</head>', `  ${sdkMockScript}\n  </head>`);
  }

  // Remove the game-frame wrapper since we're now inside an iframe
  html = html.replace(
    /<div class="game-frame">[\s\S]*?<\/div>/,
    '<div class="game-container" id="gameContainer"><canvas id="gameCanvas"></canvas></div>'
  );

  // Update styles for iframe context
  const iframeStyles = `
    <style>
      body {
        margin: 0;
        padding: 0;
        background: #000;
        font-family: "Arial", sans-serif;
        overflow: hidden;
        width: 393px;
        height: 695px;
        position: relative;
      }
      .game-container {
        position: absolute;
        inset: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
      }
      #gameCanvas {
        width: 100%;
        height: 100%;
        max-width: 393px;
        max-height: 695px;
        object-fit: contain;
      }
      canvas:focus {
        outline: none;
      }
    </style>
  `;

  // Replace existing styles
  html = html.replace(/<style>[\s\S]*?<\/style>/, iframeStyles);

  return html;
}