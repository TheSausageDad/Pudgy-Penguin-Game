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
  backgroundColor: "#8ec5e6", // sky-blue letterbox for the dynamic-height canvas
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
  // Disabled for performance on mobile (no underglow effect is used)
  render: {
    preserveDrawingBuffer: false,
  },
}

// Inject the Sunset Reef UI fonts (Fredoka display + Nunito UI) once
function injectUIFonts() {
  if (document.getElementById('sunset-reef-fonts')) return
  const pre1 = document.createElement('link')
  pre1.rel = 'preconnect'
  pre1.href = 'https://fonts.googleapis.com'
  document.head.appendChild(pre1)

  const pre2 = document.createElement('link')
  pre2.rel = 'preconnect'
  pre2.href = 'https://fonts.gstatic.com'
  pre2.crossOrigin = 'anonymous'
  document.head.appendChild(pre2)

  const link = document.createElement('link')
  link.id = 'sunset-reef-fonts'
  link.rel = 'stylesheet'
  link.href = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@600;700;800;900&display=swap'
  document.head.appendChild(link)
}

// Wait for fonts to load before starting the game
async function waitForFonts() {
  try {
    // Make sure the new UI fonts are requested before we wait
    injectUIFonts()

    // Wait for all fonts to be loaded
    await document.fonts.ready
    console.log('[MAIN] Fonts loaded successfully')

    // Double-check that Rubik Bubbles is available
    await document.fonts.load('400 16px "Rubik Bubbles"')

    // Verify the Sunset Reef UI fonts are available
    await Promise.all([
      document.fonts.load('700 32px "Fredoka"'),
      document.fonts.load('600 24px "Fredoka"'),
      document.fonts.load('800 18px "Nunito"'),
      document.fonts.load('900 14px "Nunito"'),
    ])
    console.log('[MAIN] UI fonts (Fredoka, Nunito) verified')
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
