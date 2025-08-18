import { GameScene } from "./scenes/GameScene"
import { initializeRemixSDK, initializeDevelopment } from "./utils/RemixUtils"
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
  backgroundColor: "#111111",
  scene: [GameScene],
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
}

// Create the game instance
const game = new Phaser.Game(config)

// Initialize Remix SDK and development features
game.events.once("ready", () => {
  initializeRemixSDK(game)
  
  // Initialize development features (only active in dev mode)
  if (process.env.NODE_ENV !== 'production') {
    initializeDevelopment()
  }
})
