/**
 * Sprite Sheet Configuration Utility
 *
 * This utility helps ensure sprite sheets are loaded correctly with proper
 * frame dimensions, spacing, and margins to prevent frame bleeding.
 */

export interface SpriteSheetConfig {
  /** The key to use for this sprite sheet */
  key: string
  /** Path to the sprite sheet image */
  path: string
  /** Width of each frame in pixels */
  frameWidth: number
  /** Height of each frame in pixels */
  frameHeight: number
  /** Spacing between frames in pixels (default: 0) */
  spacing?: number
  /** Margin around the entire sprite sheet in pixels (default: 0) */
  margin?: number
  /** Number of columns in the sprite sheet (for validation) */
  columns?: number
  /** Number of rows in the sprite sheet (for validation) */
  rows?: number
  /** Total width of sprite sheet (for validation) */
  totalWidth?: number
  /** Total height of sprite sheet (for validation) */
  totalHeight?: number
}

/**
 * Validates sprite sheet configuration to prevent common issues
 * like frame bleeding and incorrect dimensions.
 */
export function validateSpriteConfig(config: SpriteSheetConfig): {
  valid: boolean
  warnings: string[]
} {
  const warnings: string[] = []

  // Validate dimensions if provided
  if (config.columns && config.rows && config.totalWidth && config.totalHeight) {
    const margin = config.margin || 0
    const spacing = config.spacing || 0

    const expectedWidth = (config.frameWidth * config.columns) +
                          (spacing * (config.columns - 1)) +
                          (margin * 2)

    const expectedHeight = (config.frameHeight * config.rows) +
                           (spacing * (config.rows - 1)) +
                           (margin * 2)

    if (Math.abs(expectedWidth - config.totalWidth) > 1) {
      warnings.push(
        `Width mismatch: Expected ${expectedWidth}px but sprite sheet is ${config.totalWidth}px. ` +
        `Check frameWidth (${config.frameWidth}), columns (${config.columns}), ` +
        `spacing (${spacing}), and margin (${margin}).`
      )
    }

    if (Math.abs(expectedHeight - config.totalHeight) > 1) {
      warnings.push(
        `Height mismatch: Expected ${expectedHeight}px but sprite sheet is ${config.totalHeight}px. ` +
        `Check frameHeight (${config.frameHeight}), rows (${config.rows}), ` +
        `spacing (${spacing}), and margin (${margin}).`
      )
    }
  }

  // Warn about common issues
  if (!config.spacing && !config.margin) {
    warnings.push(
      'No spacing or margin configured. If you see frame bleeding (parts of adjacent frames ' +
      'showing), try adding spacing: 1 or margin: 1 to the configuration.'
    )
  }

  return {
    valid: warnings.length === 0 || warnings.every(w => w.includes('No spacing')),
    warnings
  }
}

/**
 * Creates a Phaser sprite sheet configuration object with proper validation.
 * Use this when loading sprite sheets to ensure correct configuration.
 *
 * @example
 * ```typescript
 * const monsterConfig = createSpriteConfig({
 *   key: 'motivated-monster',
 *   path: '/assets/motivated-monster-spritesheet.png',
 *   frameWidth: 510,
 *   frameHeight: 510,
 *   spacing: 2,
 *   columns: 2,
 *   rows: 3,
 *   totalWidth: 1024,
 *   totalHeight: 1536
 * })
 *
 * this.load.spritesheet(monsterConfig.key, monsterConfig.path, monsterConfig.config)
 * ```
 */
export function createSpriteConfig(config: SpriteSheetConfig) {
  const validation = validateSpriteConfig(config)

  if (validation.warnings.length > 0) {
    console.warn(`[SpriteConfig] Warnings for '${config.key}':`)
    validation.warnings.forEach(warning => console.warn(`  - ${warning}`))
  }

  return {
    key: config.key,
    path: config.path,
    config: {
      frameWidth: config.frameWidth,
      frameHeight: config.frameHeight,
      ...(config.spacing !== undefined && { spacing: config.spacing }),
      ...(config.margin !== undefined && { margin: config.margin })
    }
  }
}

/**
 * Common sprite sheet configurations for VeeFriends characters.
 * Add new character sprite configurations here.
 */
export const SPRITE_CONFIGS = {
  // Type 1 - Focused Falcon
  FOCUSED_FALCON: createSpriteConfig({
    key: 'focused-falcon',
    path: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Falcon%20Sprites-7lH5LRxtX4qYbEUKAAT3lI4MdRvBIN.png',
    frameWidth: 540,
    frameHeight: 450,
    spacing: 0,
    margin: 0,
    columns: 2,
    rows: 3,
    totalWidth: 1080,
    totalHeight: 1350
  }),

  // Type 2 - Ambitious Angel
  AMBITIOUS_ANGEL: createSpriteConfig({
    key: 'ambitious-angel',
    path: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Angel%20Sprites-RGwYpX7JAqIRqIvKwv5dlzLq6e0AuH.png',
    frameWidth: 540,
    frameHeight: 450,
    spacing: 0,
    margin: 0,
    columns: 2,
    rows: 3,
    totalWidth: 1080,
    totalHeight: 1350
  }),

  // Type 3 - Motivated Monster
  MOTIVATED_MONSTER: createSpriteConfig({
    key: 'motivated-monster',
    path: '/assets/motivated-monster-spritesheet.png',
    frameWidth: 540,
    frameHeight: 420,
    spacing: 15,
    margin: 0,
    columns: 2,
    rows: 3,
    totalWidth: 1080,
    totalHeight: 1350
  }),

  // Type 5 - Empathy Elephant
  EMPATHY_ELEPHANT: createSpriteConfig({
    key: 'empathy-elephant',
    path: '/assets/empathy-elephant-spritesheet.png',
    frameWidth: 540,
    frameHeight: 450,
    spacing: 0,
    margin: 0,
    columns: 2,
    rows: 3,
    totalWidth: 1080,
    totalHeight: 1350
  }),

  // Type 6 - Adaptable Alien
  ADAPTABLE_ALIEN: createSpriteConfig({
    key: 'adaptable-alien',
    path: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Alien%20Sprite%20Sheet-u2ElLHMwAjwQyjjAmWIKk3h1WUPzpj.png',
    frameWidth: 540,
    frameHeight: 450,
    spacing: 0,
    margin: 0,
    columns: 2,
    rows: 3,
    totalWidth: 1080,
    totalHeight: 1350
  }),

  // Type 7 - Fearless Fairy
  FEARLESS_FAIRY: createSpriteConfig({
    key: 'fearless-fairy',
    path: '/assets/fearless-fairy-spritesheet.png',
    frameWidth: 540,
    frameHeight: 450,
    spacing: 0,
    margin: 0,
    columns: 2,
    rows: 3,
    totalWidth: 1080,
    totalHeight: 1350
  }),

  // Type 10 - Driven Dragon (3 frames in vertical layout)
  DRIVEN_DRAGON: createSpriteConfig({
    key: 'driven-dragon',
    path: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Dragon%20Sprites-QBFIc29QDfsEU6EUvT07w8LhNnPLK0.png',
    frameWidth: 1080,
    frameHeight: 450,
    spacing: 0,
    margin: 0,
    columns: 1,
    rows: 3,
    totalWidth: 1080,
    totalHeight: 1350
  }),

  // Type 11 - Balanced Beetle
  BALANCED_BEETLE: createSpriteConfig({
    key: 'balanced-beetle',
    path: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Beetle%20Sprites-OcyUjcHmiIybiwp0oBUwRPiM1TnKE9.png',
    frameWidth: 540,
    frameHeight: 450,
    spacing: 0,
    margin: 0,
    columns: 2,
    rows: 3,
    totalWidth: 1080,
    totalHeight: 1350
  }),

  // Type 12 - Adventurous Astronaut
  ADVENTUROUS_ASTRONAUT: createSpriteConfig({
    key: 'adventurous-astronaut',
    path: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Astronaut%20Sprites-Y5jy2B236NYK4y0zp1L5vavomKhxCT.png',
    frameWidth: 540,
    frameHeight: 450,
    spacing: 0,
    margin: 0,
    columns: 2,
    rows: 3,
    totalWidth: 1080,
    totalHeight: 1350
  }),

  // Type 13 - Creative Crab
  CREATIVE_CRAB: createSpriteConfig({
    key: 'creative-crab',
    path: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Crab%20Sprites-1vNzzK4FAfDqE5yYRf0F83pL0E3C16.png',
    frameWidth: 540,
    frameHeight: 450,
    spacing: 0,
    margin: 0,
    columns: 2,
    rows: 3,
    totalWidth: 1080,
    totalHeight: 1350
  }),

  // Type 14 - Competitive Clown
  COMPETITIVE_CLOWN: createSpriteConfig({
    key: 'competitive-clown',
    path: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Clown%20Sprites-gMYvajPLcXYGw5NVrHLaDdwo7hIN6S.png',
    frameWidth: 540,
    frameHeight: 450,
    spacing: 0,
    margin: 0,
    columns: 2,
    rows: 3,
    totalWidth: 1080,
    totalHeight: 1350
  }),

  // NEW REPLACEMENTS
  // Type 4 - Thoughtful Harpik (replacing Dialed In Dog)
  THOUGHTFUL_HARPIK: createSpriteConfig({
    key: 'thoughtful-harpik',
    path: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Thoughtful%20Harpik-MVAvpV5s3WB7axS1X5rUDQQWpBlWL5.png',
    frameWidth: 540,
    frameHeight: 450,
    spacing: 0,
    margin: 0,
    columns: 2,
    rows: 3,
    totalWidth: 1080,
    totalHeight: 1350
  }),

  // Type 8 - Notorious Ninja (replacing Patient Panda)
  NOTORIOUS_NINJA: createSpriteConfig({
    key: 'notorious-ninja',
    path: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Notorious%20Ninja%20Sprites-hTCfqWSO9kgSo8vl3gqIVFodFskaBH.png',
    frameWidth: 540,
    frameHeight: 450,
    spacing: 0,
    margin: 0,
    columns: 2,
    rows: 3,
    totalWidth: 1080,
    totalHeight: 1350
  }),

  // Type 9 - Flex N' Fox (replacing Brave Bison)
  FLEX_N_FOX: createSpriteConfig({
    key: 'flex-n-fox',
    path: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Flex%20N%27%20Fox%20Sprites-aN6ZSEYVPgK677AlGVDtofEcn7B1tV.png',
    frameWidth: 540,
    frameHeight: 450,
    spacing: 0,
    margin: 0,
    columns: 2,
    rows: 3,
    totalWidth: 1080,
    totalHeight: 1350
  }),

  // Type 16 - Rare Robot (replacing Helpful Hippo)
  RARE_ROBOT: createSpriteConfig({
    key: 'rare-robot',
    path: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Rare%20robot%20Sprites-ma9dZ6eAzLUiiO01E6T24AQW9oYx2W.png',
    frameWidth: 540,
    frameHeight: 450,
    spacing: 0,
    margin: 0,
    columns: 2,
    rows: 3,
    totalWidth: 1080,
    totalHeight: 1350
  }),

  // Legacy - Cynical Cat (keeping for backward compatibility)
  CYNICAL_CAT: createSpriteConfig({
    key: 'cynical-cat',
    path: '/assets/cynical-cat-spritesheet.png',
    frameWidth: 540,
    frameHeight: 450,
    spacing: 0,
    margin: 0,
    columns: 2,
    rows: 3,
    totalWidth: 1080,
    totalHeight: 1350
  })
}

/**
 * Enemy sprite sheet configurations
 * All carrot sprites have 3 frames: right-facing, center/left-facing, right-facing (mirror)
 * Frame layout: 2 columns x 3 rows (same as tower sprites)
 */
export const ENEMY_SPRITE_CONFIGS = {
  // Type 1 - Orange Carrot (most basic)
  ORANGE_CARROT: createSpriteConfig({
    key: 'orange-carrot',
    path: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Orange%20Carrot-Mo5BvDjfQSG5r6QWKkTUeJ8OMnn7Hm.png',
    frameWidth: 1080,
    frameHeight: 450,
    spacing: 0,
    margin: 0,
    columns: 1,
    rows: 3,
    totalWidth: 1080,
    totalHeight: 1350
  }),

  // Type 2 - Yellow Carrot
  YELLOW_CARROT: createSpriteConfig({
    key: 'yellow-carrot',
    path: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Yellow%20Carrot-ZQUlY9oYkGAOXtMAYuUZNmEbSpyea2.png',
    frameWidth: 1080,
    frameHeight: 450,
    spacing: 0,
    margin: 0,
    columns: 1,
    rows: 3,
    totalWidth: 1080,
    totalHeight: 1350
  }),

  // Type 3 - Purple Carrot
  PURPLE_CARROT: createSpriteConfig({
    key: 'purple-carrot',
    path: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Purple%20Carrot-6hmABU3cE8o8NhQkYOK4DXbRJ8OnPX.png',
    frameWidth: 1080,
    frameHeight: 450,
    spacing: 0,
    margin: 0,
    columns: 1,
    rows: 3,
    totalWidth: 1080,
    totalHeight: 1350
  }),

  // Type 4 - Black Carrot
  BLACK_CARROT: createSpriteConfig({
    key: 'black-carrot',
    path: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Black%20Carrot-o5edLQq2S3zeWAikc2kdPf29zocfG6.png',
    frameWidth: 1080,
    frameHeight: 450,
    spacing: 0,
    margin: 0,
    columns: 1,
    rows: 3,
    totalWidth: 1080,
    totalHeight: 1350
  }),

  // Type 5 - Steel Carrot
  STEEL_CARROT: createSpriteConfig({
    key: 'steel-carrot',
    path: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Steel%20CArrot-Vpu2PUCbDNj8RIW6qksfOO3NCgVKRK.png',
    frameWidth: 1080,
    frameHeight: 450,
    spacing: 0,
    margin: 0,
    columns: 1,
    rows: 3,
    totalWidth: 1080,
    totalHeight: 1350
  }),

  // Type 6 - White Carrot
  WHITE_CARROT: createSpriteConfig({
    key: 'white-carrot',
    path: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/White%20Carrot-c8sBT9nmaWGmpX6McMyky2V3pEGmD2.png',
    frameWidth: 1080,
    frameHeight: 450,
    spacing: 0,
    margin: 0,
    columns: 1,
    rows: 3,
    totalWidth: 1080,
    totalHeight: 1350
  }),

  // Type 7 - Blue Carrot
  BLUE_CARROT: createSpriteConfig({
    key: 'blue-carrot',
    path: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Blue%20Carrot-QeEh2rRC5b1skyC3LktMwQroeQoIp0.png',
    frameWidth: 1080,
    frameHeight: 450,
    spacing: 0,
    margin: 0,
    columns: 1,
    rows: 3,
    totalWidth: 1080,
    totalHeight: 1350
  }),

  // Type 8 - Fire Carrot
  FIRE_CARROT: createSpriteConfig({
    key: 'fire-carrot',
    path: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Fire%20Carrot-OAC2dnyvF1BPvnHQ5o6yDU9Vo5DCHq.png',
    frameWidth: 1080,
    frameHeight: 450,
    spacing: 0,
    margin: 0,
    columns: 1,
    rows: 3,
    totalWidth: 1080,
    totalHeight: 1350
  }),

  // Type 9 - Icy Carrot
  ICY_CARROT: createSpriteConfig({
    key: 'icy-carrot',
    path: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Icy%20Carrot-qgBYmPaZgo0R4UVh7tQ6MpfioXRDrD.png',
    frameWidth: 1080,
    frameHeight: 450,
    spacing: 0,
    margin: 0,
    columns: 1,
    rows: 3,
    totalWidth: 1080,
    totalHeight: 1350
  }),

  // Type 10 - Green Carrot
  GREEN_CARROT: createSpriteConfig({
    key: 'green-carrot',
    path: 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Green%20Carrot-eThSPmI2Q1kZ0ZOL9c4r5ChaED5clm.png',
    frameWidth: 1080,
    frameHeight: 450,
    spacing: 0,
    margin: 0,
    columns: 1,
    rows: 3,
    totalWidth: 1080,
    totalHeight: 1350
  })
}
