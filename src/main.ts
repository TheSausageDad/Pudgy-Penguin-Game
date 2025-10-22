import { StartScene } from "./scenes/StartScene"
import { TutorialScene } from "./scenes/TutorialScene"
import { PudgyGameScene } from "./scenes/PudgyGameScene"
import { initializeRemixSDK, initializeDevelopment } from "./utils/RemixUtils"
import { initializeSDKMock } from "../.remix/mocks/RemixSDKMock"
import GameSettings from "./config/GameSettings"


// Game configuration
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL, // Using WebGL for shader support
  width: GameSettings.canvas.width,
  height: GameSettings.canvas.height,
  scale: {
    mode: Phaser.Scale.FIT,
    parent: document.body,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GameSettings.canvas.width,
    height: GameSettings.canvas.height,
  },
  backgroundColor: "#1a1a1a",
  scene: [StartScene, TutorialScene, PudgyGameScene],
  physics: {
    default: "arcade",
  },
  // Target frame rate
  fps: {
    target: 60,
  },
  // Additional WebGL settings
  pixelArt: false,
  antialias: true,
  // Preserve drawing buffer for underglow effect
  render: {
    preserveDrawingBuffer: true,
  },
}

// Wait for fonts to load before starting the game
async function waitForFonts() {
  try {
    // Wait for all fonts to be loaded
    await document.fonts.ready
    console.log('[MAIN] Fonts loaded successfully')

    // Double-check that Rubik Bubbles is available
    await document.fonts.load('400 16px "Rubik Bubbles"')
    console.log('[MAIN] Rubik Bubbles font verified')
  } catch (error) {
    console.warn('[MAIN] Font loading warning:', error)
    // Continue anyway after a brief delay
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}

// Initialize the application
async function initializeApp() {
  // Wait for fonts to load first
  await waitForFonts()

  // Initialize SDK mock in development
  if (process.env.NODE_ENV !== 'production') {
    await initializeSDKMock()
  }

  // Create the game instance
  const game = new Phaser.Game(config)

  // Expose game globally for performance plugin
  ;(window as any).game = game

  // Initialize Remix SDK and development features
  game.events.once("ready", async () => {
    await initializeRemixSDK(game)

    // Initialize development features (only active in dev mode)
    if (process.env.NODE_ENV !== 'production') {
      initializeDevelopment()
    }
  })
}

// Start the application
initializeApp().catch((error) => {
  console.error('[MAIN] Failed to initialize app:', error)
})
