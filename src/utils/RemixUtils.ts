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
    console.warn(
      "Error checking iframe status (this might be expected locally):",
      e
    )
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

// Function to get package manager-specific instructions
export function getPackageManagerInstructions(): { install: string; dev: string; build: string } {
  const devInfo = getDevEnvironmentInfo();
  const pm = devInfo?.packageManager || 'npm';
  
  return {
    install: `${pm} install`,
    dev: `${pm} run dev`,
    build: `${pm} run build`
  };
}

export function initializeRemixSDK(game: Phaser.Game): void {
  if (!("FarcadeSDK" in window && window.FarcadeSDK)) {
    console.warn("Remix SDK not found.")
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
      console.warn("Could not programmatically focus game canvas:", e)
    }
  })
}

// Initialize development features (separate from SDK)
export function initializeDevelopment(): void {
  // Listen for dev info messages from the overlay
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'remix_dev_info') {
      (window as any).__remixDevInfo = event.data.data;
      console.log('[Game] Dev environment info received:', event.data.data);
      
      // Example: Display package manager instructions in console
      const instructions = getPackageManagerInstructions();
      console.log(`[Game] To install dependencies: ${instructions.install}`);
      console.log(`[Game] To start dev server: ${instructions.dev}`);
      console.log(`[Game] To build for production: ${instructions.build}`);
    }
  });
}
