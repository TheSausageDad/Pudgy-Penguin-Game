/**
 * Game Settings for GAME_NAME
 * Centralized configuration for all tunable game parameters
 */

export const GameSettings = {
  debug: true,

  canvas: {
    width: 720,
    // Dynamic height derived from the viewport ratio so Phaser Scale.FIT fills
    // the screen instead of letterboxing. Ceiling raised to 2.2 so tall modern
    // phones (≈2.0–2.16 aspect) are covered edge-to-edge.
    height: Math.round(720 * Math.min(Math.max(window.innerHeight / window.innerWidth, 1.4), 2.2)),
  },
}

export default GameSettings
