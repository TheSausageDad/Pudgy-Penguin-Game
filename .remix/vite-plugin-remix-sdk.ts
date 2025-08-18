import type { Plugin } from 'vite';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Vite plugin that provides Remix SDK emulation during development
 */
export function remixSDKPlugin(): Plugin {
  return {
    name: 'remix-sdk-emulation',
    
    configureServer(server) {
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
          console.log('[Vite Plugin] Transforming HTML for path:', context.path);
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