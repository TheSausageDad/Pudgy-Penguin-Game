// Dev environment info interface
interface DevEnvironmentInfo {
  packageManager: string;
  gameId: string;
  lastUpdated: number;
}

// Function to check if running inside the Remix iframe environment
export function isRemixEnvironment(): boolean {
  try {
    // Check SDK object exists AND we are in an iframe
    return "FarcadeSDK" in window && window.top !== window.self
  } catch (e) {
    // Catch potential cross-origin errors if not in an iframe
    // This check might fail if run locally in a sandboxed iframe
    // but should be reliable in the actual Remix environment.
    // Error checking iframe status (this might be expected locally)
    return false
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


export function initializeRemixSDK(game: Phaser.Game): void {
  if (!("FarcadeSDK" in window && window.FarcadeSDK)) {
    return
  }

  // Make the game canvas focusable
  game.canvas.setAttribute("tabindex", "-1")

  // Signal ready state
  window.FarcadeSDK.singlePlayer.actions.ready()

  // Set mute/unmute handler
  window.FarcadeSDK.on("toggle_mute", (data: { isMuted: boolean }) => {
    game.sound.mute = data.isMuted
  })

  // Setup play_again handler
  window.FarcadeSDK.on("play_again", () => {
    // TODO: Restart the game
    // Your game restart logic is called here

    // Attempt to bring focus back to the game canvas
    try {
      game.canvas.focus()
    } catch (e) {
      // Could not programmatically focus game canvas
    }
  })
}

// Initialize development features (separate from SDK)
export function initializeDevelopment(): void {
  // Listen for dev info messages from the overlay
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'remix_dev_info') {
      (window as any).__remixDevInfo = event.data.data;
    }
  });
}
