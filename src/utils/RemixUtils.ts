// Dev environment info interface
interface DevEnvironmentInfo {
  packageManager: string;
  gameId: string;
  lastUpdated: number;
}

// Function to check if running inside the Remix iframe environment
export function isRemixEnvironment(): boolean {
  try {
    // Check for local development indicators
    const hostname = window.location.hostname
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0'
    
    // If we're on localhost, we're in local dev
    if (isLocalhost) {
      return false
    }
    
    // Otherwise assume we're in Remix environment (production, staging, or Remix iframe)
    return true
  } catch (e) {
    // If we can't determine, assume we're in Remix environment for safety
    return true
  }
}

// Function to get development environment information (only available in dev mode)
export function getDevEnvironmentInfo(): DevEnvironmentInfo | null {
  try {
    const devInfo = (window as any).__remixDevInfo;
    return devInfo || null;
  } catch (e) {
    return null;
  }
}


export async function initializeRemixSDK(game: Phaser.Game): Promise<void> {
  if (!("FarcadeSDK" in window && window.FarcadeSDK)) {
    return
  }

  // Make the game canvas focusable
  game.canvas.setAttribute("tabindex", "-1")

  // Set mute/unmute handler
  window.FarcadeSDK.on("toggle_mute", (data: { isMuted: boolean }) => {
    console.log('[Remix SDK] toggle_mute event received:', data.isMuted)
    game.sound.mute = data.isMuted
    console.log('[Remix SDK] Game sound muted set to:', game.sound.mute)
  })

  // Setup play_again handler
  window.FarcadeSDK.on("play_again", () => {
    // Restart the game by going back to the start scene
    const currentScene = game.scene.getScenes(true)[0]
    if (currentScene) {
      currentScene.scene.start('StartScene')
    }

    // Attempt to bring focus back to the game canvas
    try {
      game.canvas.focus()
    } catch (e) {
      // Could not programmatically focus game canvas
    }
  })

  // Call ready() to signal the SDK that the game is loaded and ready
  // This is required for the SDK to show UI elements like play again button
  try {
    const gameInfo = await window.FarcadeSDK.singlePlayer.actions.ready()
    console.log('[Remix SDK] Game ready, received game info:', gameInfo)
    console.log('[Remix SDK] Checking initial mute state...')
    console.log('[Remix SDK] window.FarcadeSDK.isMuted:', window.FarcadeSDK.isMuted)
    console.log('[Remix SDK] gameInfo.isMuted:', gameInfo?.isMuted)

    // Check and apply initial mute state from SDK
    if (window.FarcadeSDK.isMuted !== undefined) {
      game.sound.mute = window.FarcadeSDK.isMuted
      console.log('[Remix SDK] Applied initial mute state from SDK.isMuted:', window.FarcadeSDK.isMuted)
    } else if (gameInfo && typeof gameInfo.isMuted === 'boolean') {
      game.sound.mute = gameInfo.isMuted
      console.log('[Remix SDK] Applied initial mute state from gameInfo.isMuted:', gameInfo.isMuted)
    } else {
      console.log('[Remix SDK] No initial mute state found, defaulting to unmuted')
      game.sound.mute = false
    }
    console.log('[Remix SDK] Final game.sound.mute value:', game.sound.mute)
  } catch (error) {
    console.error('[Remix SDK] Error calling ready():', error)
  }
}

// Initialize development features (separate from SDK)
export function initializeDevelopment(): void {
  // Listen for dev info messages from the overlay
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'remix_dev_info') {
      (window as any).__remixDevInfo = event.data.data;
    }
  });

  // Load performance monitoring plugin after a short delay to ensure game is ready
  setTimeout(() => {
    loadRemixPerformancePlugin();
  }, 100);
}

// Load and inject the performance monitoring plugin
function loadRemixPerformancePlugin(): void {
  // Only load in development mode
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  try {
    // Fetch the plugin code from the .remix directory
    fetch('/.remix/plugins/performance-plugin.js')
      .then(response => {
        if (!response.ok) {
          throw new Error('Performance plugin not found');
        }
        return response.text();
      })
      .then(pluginCode => {
        // Execute the plugin code in the game context
        const script = document.createElement('script');
        script.textContent = pluginCode;
        document.head.appendChild(script);

        // The plugin code sets window.RemixPerformancePluginCode as a string
        // We need to evaluate it to actually run the plugin
        if ((window as any).RemixPerformancePluginCode) {
          const pluginScript = document.createElement('script');
          pluginScript.textContent = (window as any).RemixPerformancePluginCode;
          document.head.appendChild(pluginScript);
          
          // Clean up
          setTimeout(() => {
            if (pluginScript.parentNode) {
              pluginScript.parentNode.removeChild(pluginScript);
            }
          }, 100);
          
          // Performance plugin loaded successfully
        }

        // Clean up the script element
        setTimeout(() => {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        }, 100);
      })
      .catch(error => {
        // Performance plugin loading failed, but this is non-critical
      });
  } catch (error) {
    // Silently fail if plugin loading fails
  }
}
