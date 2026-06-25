/**
 * Game Settings for GAME_NAME
 * Centralized configuration for all tunable game parameters
 */

export const GameSettings = {
  debug: true,

  canvas: {
    width: 720,
    // Dynamic height derived from the viewport ratio so Phaser Scale.FIT fills
    // tall phones instead of letterboxing. Clamped to a sane portrait range.
    height: Math.round(720 * Math.min(Math.max(window.innerHeight / window.innerWidth, 1.4), 1.85)),
  },
}

export default GameSettings
