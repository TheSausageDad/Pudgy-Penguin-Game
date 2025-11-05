import { Tower } from '../objects/Tower'
import { Enemy } from '../objects/Enemy'
import { MapConfig } from '../config/MapConfigs'
import { getAllTowerConfigs, getTowerConfig } from '../config/TowerConfigs'
import { getEnemyConfig, getWaveEnemies } from '../config/EnemyConfigs'
import { SPRITE_CONFIGS, ENEMY_SPRITE_CONFIGS } from '../utils/spriteConfig'

export class TowerDefenseScene extends Phaser.Scene {
  private mapId!: number
  private mapConfig!: MapConfig

  // Game state
  private lives: number = 100
  private coins: number = 650
  private currentWave: number = 0
  private isWaveActive: boolean = false
  private gameSpeed: number = 1
  private autoStartWaves: boolean = false

  // Collections
  private towers: Tower[] = []
  private enemies!: Phaser.GameObjects.Group
  private projectiles!: Phaser.GameObjects.Group

  // UI
  private livesText!: Phaser.GameObjects.Text
  private coinsText!: Phaser.GameObjects.Text
  private waveText!: Phaser.GameObjects.Text
  private speedButtonImage!: Phaser.GameObjects.Image
  private autoStartButtonImage!: Phaser.GameObjects.Image

  // Pause menu
  private pauseMenuContainer!: Phaser.GameObjects.Container
  private isPaused: boolean = false

  // Tutorial
  private tutorialContainer!: Phaser.GameObjects.Container
  private hasSeenTutorial: boolean = false

  // Grid and path
  private gridSize: number = 70 // Grid cell size (will be set per map)
  private gridOffsetX: number = 0 // Horizontal offset (will be set per map)
  private gridOffsetY: number = 0 // Vertical offset (will be set per map)
  private placementGrid: boolean[][] = []
  private path: Phaser.Math.Vector2[] = []
  private debugMode: boolean = false // Toggle to show grid visualization

  // Tower selection
  private selectedTowerType: number | null = null
  private hoverTile: Phaser.GameObjects.Rectangle | null = null
  private selectedTower: Tower | null = null
  private sellButton: Phaser.GameObjects.Container | null = null
  private upgradeButtons: Phaser.GameObjects.Container[] = []
  private selectedTowerText: Phaser.GameObjects.Text | null = null
  private currentTowerPage: number = 0
  private towerPageContainers: Phaser.GameObjects.Container[] = []
  private justClickedTower: boolean = false

  // Lazy loading tracking
  private loadedSprites: Set<string> = new Set()
  private loadingSprites: Set<string> = new Set()

  constructor() {
    super({ key: 'TowerDefenseScene' })
  }

  init(data: { mapId: number }) {
    this.mapId = data.mapId
    this.lives = 100
    this.coins = 650 // Starting coins for production
    this.currentWave = 0
    this.isWaveActive = false
    this.gameSpeed = 1
    this.autoStartWaves = false
    this.towers = []
    this.selectedTowerType = null
    this.currentTowerPage = 0
    this.towerPageContainers = []
  }

  preload() {
    // With lazy loading, we don't load tower sprites here
    // They'll be loaded on-demand when towers are selected
    console.log('[TowerDefenseScene] Using lazy loading for towers - sprites will load on demand')

    // Load UI button images
    this.load.image('menu-button', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Menu%20Button-Yq6zJRqINxQgosRgRYe24R5IL82GtM.png')
    this.load.image('auto-on-button', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Auto%3A%20On%20Button-F05N0EvEnTstRIJP2rlwHcfN954oVm.png')
    this.load.image('auto-off-button', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Auto%20OFF%20Button-a56obIb6D5SFeS9n32XmHtpAfuzB3p.png')
    this.load.image('1x-button', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/1x%20Button-usvxFAGriZXaJSjfJpnDnlJa3vl6aT.png')
    this.load.image('2x-button', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/2x%20Button-85LJbcru8GZAWg76PZrRSNnXtehOS6.png')
    this.load.image('3x-button', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/3x%20Button-lp9wuMiygciPVEywdjSFmQ5pWR69Yy.png')
    this.load.image('start-wave-button', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Start%20Wave-m9R6w6gUvYWUJ5Y7BcztPyvd8R5v5f.png')
    this.load.image('end-game-button', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/End%20Game%20Button-4da3DgEQn6uKGc09nu2tZOchZqaKtw.png')
    this.load.image('level-select-button', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Level%20Select-Kz46ddSyt67hZYImSnfwdDQhGv0KU2.png')

    // Load background music
    this.load.audio('bgMusic', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Music%20Loop-yPYC7cMLmOtbATLHj8PF8HxkCyoDqo.mp3')

    // Load map background images
    this.load.image('meadow-map-bg', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Meadow%20Map-jgDQzJNQmX1jeqFdews23JXHhdRNyE.png')
    this.load.image('jungle-map-bg', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Jungle%20path-rZBIekbd1UvXB4I3zndaghbXwZUBlm.png')
    this.load.image('sand-map-bg', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Sand%20Map-pN86hXgXGFP4S5PhrqTJAgwi8r9wE4.png')
    this.load.image('mountain-map-bg', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Mountain%20MAp-N5MfCtrKm0Yy8ivp0rbjdB2h8tGdRc.png')
    this.load.image('lava-map-bg', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Lava%20map-jUpQQ95jaogKpiZ6teG4tPnP7uvbkQ.png')
    this.load.image('ice-map-bg', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Ice%20Level-XLgGa9w5UFsvJpGi1UIxlvOOvAvJfu.png')

    // Load enemy sprites (all carrot types) - these are needed for wave spawning
    this.load.spritesheet(ENEMY_SPRITE_CONFIGS.ORANGE_CARROT.key, ENEMY_SPRITE_CONFIGS.ORANGE_CARROT.path, ENEMY_SPRITE_CONFIGS.ORANGE_CARROT.config)
    this.load.spritesheet(ENEMY_SPRITE_CONFIGS.YELLOW_CARROT.key, ENEMY_SPRITE_CONFIGS.YELLOW_CARROT.path, ENEMY_SPRITE_CONFIGS.YELLOW_CARROT.config)
    this.load.spritesheet(ENEMY_SPRITE_CONFIGS.PURPLE_CARROT.key, ENEMY_SPRITE_CONFIGS.PURPLE_CARROT.path, ENEMY_SPRITE_CONFIGS.PURPLE_CARROT.config)
    this.load.spritesheet(ENEMY_SPRITE_CONFIGS.BLACK_CARROT.key, ENEMY_SPRITE_CONFIGS.BLACK_CARROT.path, ENEMY_SPRITE_CONFIGS.BLACK_CARROT.config)
    this.load.spritesheet(ENEMY_SPRITE_CONFIGS.STEEL_CARROT.key, ENEMY_SPRITE_CONFIGS.STEEL_CARROT.path, ENEMY_SPRITE_CONFIGS.STEEL_CARROT.config)
    this.load.spritesheet(ENEMY_SPRITE_CONFIGS.WHITE_CARROT.key, ENEMY_SPRITE_CONFIGS.WHITE_CARROT.path, ENEMY_SPRITE_CONFIGS.WHITE_CARROT.config)
    this.load.spritesheet(ENEMY_SPRITE_CONFIGS.BLUE_CARROT.key, ENEMY_SPRITE_CONFIGS.BLUE_CARROT.path, ENEMY_SPRITE_CONFIGS.BLUE_CARROT.config)
    this.load.spritesheet(ENEMY_SPRITE_CONFIGS.FIRE_CARROT.key, ENEMY_SPRITE_CONFIGS.FIRE_CARROT.path, ENEMY_SPRITE_CONFIGS.FIRE_CARROT.config)
    this.load.spritesheet(ENEMY_SPRITE_CONFIGS.ICY_CARROT.key, ENEMY_SPRITE_CONFIGS.ICY_CARROT.path, ENEMY_SPRITE_CONFIGS.ICY_CARROT.config)
    this.load.spritesheet(ENEMY_SPRITE_CONFIGS.GREEN_CARROT.key, ENEMY_SPRITE_CONFIGS.GREEN_CARROT.path, ENEMY_SPRITE_CONFIGS.GREEN_CARROT.config)
  }

  /**
   * Lazy load a sprite sheet on demand
   * @param spriteKey The key of the sprite to load
   * @param config The sprite configuration
   * @returns Promise that resolves when sprite is loaded
   */
  private async lazyLoadSprite(spriteKey: string, config: any): Promise<void> {
    // Check if already loaded
    if (this.loadedSprites.has(spriteKey)) {
      return Promise.resolve()
    }

    // Check if currently loading
    if (this.loadingSprites.has(spriteKey)) {
      // Wait for the existing load to complete with timeout
      return new Promise((resolve, reject) => {
        let attempts = 0
        const maxAttempts = 50 // 5 seconds max
        const checkInterval = setInterval(() => {
          attempts++
          if (this.loadedSprites.has(spriteKey)) {
            clearInterval(checkInterval)
            resolve()
          } else if (attempts >= maxAttempts) {
            clearInterval(checkInterval)
            reject(new Error(`Timeout waiting for sprite: ${spriteKey}`))
          }
        }, 100)
      })
    }

    // Mark as loading
    this.loadingSprites.add(spriteKey)

    return new Promise((resolve, reject) => {
      // Set a timeout for the load
      const loadTimeout = setTimeout(() => {
        console.error(`[LazyLoad] Timeout loading sprite: ${spriteKey}`)
        this.loadingSprites.delete(spriteKey)
        reject(new Error(`Timeout loading sprite: ${spriteKey}`))
      }, 10000) // 10 second timeout

      // Load the sprite sheet
      this.load.spritesheet(config.key, config.path, config.config)

      // Handle load complete
      this.load.once('complete', () => {
        clearTimeout(loadTimeout)

        // Set texture filtering
        const texture = this.textures.get(config.key)
        if (texture) {
          texture.setFilter(Phaser.Textures.FilterMode.NEAREST)
        }

        // Mark as loaded
        this.loadedSprites.add(spriteKey)
        this.loadingSprites.delete(spriteKey)

        console.log(`[LazyLoad] Loaded sprite: ${spriteKey}`)
        resolve()
      })

      // Handle load error
      this.load.once('loaderror', (file: any) => {
        clearTimeout(loadTimeout)
        if (file.key === spriteKey) {
          console.error(`[LazyLoad] Failed to load sprite: ${spriteKey}`, file)
          this.loadingSprites.delete(spriteKey)
          reject(new Error(`Failed to load sprite: ${spriteKey}`))
        }
      })

      // Start loading
      this.load.start()
    })
  }

  /**
   * Get sprite config for a tower type and ensure it's loaded
   */
  private async ensureTowerSpriteLoaded(towerType: number): Promise<void> {
    const spriteConfigs: Record<number, any> = {
      1: SPRITE_CONFIGS.FOCUSED_FALCON,
      2: SPRITE_CONFIGS.AMBITIOUS_ANGEL,
      3: SPRITE_CONFIGS.MOTIVATED_MONSTER,
      4: SPRITE_CONFIGS.THOUGHTFUL_HARPIK,
      5: SPRITE_CONFIGS.EMPATHY_ELEPHANT,
      6: SPRITE_CONFIGS.ADAPTABLE_ALIEN,
      7: SPRITE_CONFIGS.FEARLESS_FAIRY,
      8: SPRITE_CONFIGS.NOTORIOUS_NINJA,
      9: SPRITE_CONFIGS.FLEX_N_FOX,
      10: SPRITE_CONFIGS.DRIVEN_DRAGON,
      11: SPRITE_CONFIGS.BALANCED_BEETLE,
      12: SPRITE_CONFIGS.ADVENTUROUS_ASTRONAUT,
      13: SPRITE_CONFIGS.CREATIVE_CRAB,
      14: SPRITE_CONFIGS.COMPETITIVE_CLOWN,
      15: SPRITE_CONFIGS.CYNICAL_CAT,
      16: SPRITE_CONFIGS.RARE_ROBOT
    }

    const config = spriteConfigs[towerType]
    if (!config) {
      return Promise.resolve()
    }

    try {
      await this.lazyLoadSprite(config.key, config)

      // Create animations if they don't exist
      const animPrefixes: Record<number, string> = {
        1: 'falcon', 2: 'angel', 3: 'monster', 4: 'harpik',
        5: 'elephant', 6: 'alien', 7: 'fairy', 8: 'ninja',
        9: 'fox', 10: 'dragon', 11: 'beetle', 12: 'astronaut',
        13: 'crab', 14: 'clown', 15: 'cat', 16: 'robot'
      }

      const animPrefix = animPrefixes[towerType]
      if (animPrefix && !this.anims.exists(`${animPrefix}-idle-front`)) {
        // Dragon uses 3-frame layout, others use standard 6-frame layout
        if (towerType === 10) {
          this.createSimple3FrameAnimations(config.key, animPrefix)
        } else {
          this.createCharacterAnimations(config.key, animPrefix)
        }
      }
    } catch (error) {
      console.warn(`[TowerDefenseScene] Failed to load sprite for tower ${towerType}, will use fallback graphics:`, error)
      // Don't throw - let the game continue with fallback graphics
      return Promise.resolve()
    }
  }

  private createCharacterAnimations(spriteKey: string, animPrefix: string) {
    // Standard sprite sheet layout:
    // Frame 0: idle-front, Frame 1: throw-front
    // Frame 2: idle-right, Frame 3: throw-right
    // Frame 4: idle-back, Frame 5: throw-back

    // Front animations
    if (!this.anims.exists(`${animPrefix}-idle-front`)) {
      this.anims.create({
        key: `${animPrefix}-idle-front`,
        frames: [{ key: spriteKey, frame: 0 }],
        frameRate: 1,
        repeat: -1
      })
    }
    if (!this.anims.exists(`${animPrefix}-throw-front`)) {
      this.anims.create({
        key: `${animPrefix}-throw-front`,
        frames: [
          { key: spriteKey, frame: 1, duration: 200 },
          { key: spriteKey, frame: 0, duration: 100 }
        ],
        frameRate: 10,
        repeat: 0
      })
    }

    // Right animations
    if (!this.anims.exists(`${animPrefix}-idle-right`)) {
      this.anims.create({
        key: `${animPrefix}-idle-right`,
        frames: [{ key: spriteKey, frame: 2 }],
        frameRate: 1,
        repeat: -1
      })
    }
    if (!this.anims.exists(`${animPrefix}-throw-right`)) {
      this.anims.create({
        key: `${animPrefix}-throw-right`,
        frames: [
          { key: spriteKey, frame: 3, duration: 200 },
          { key: spriteKey, frame: 2, duration: 100 }
        ],
        frameRate: 10,
        repeat: 0
      })
    }

    // Back animations
    if (!this.anims.exists(`${animPrefix}-idle-back`)) {
      this.anims.create({
        key: `${animPrefix}-idle-back`,
        frames: [{ key: spriteKey, frame: 4 }],
        frameRate: 1,
        repeat: -1
      })
    }
    if (!this.anims.exists(`${animPrefix}-throw-back`)) {
      this.anims.create({
        key: `${animPrefix}-throw-back`,
        frames: [
          { key: spriteKey, frame: 5, duration: 200 },
          { key: spriteKey, frame: 4, duration: 100 }
        ],
        frameRate: 10,
        repeat: 0
      })
    }
  }

  private createSimple3FrameAnimations(spriteKey: string, animPrefix: string) {
    // Simple 3-frame layout (no idle/throw variations):
    // Frame 0: front
    // Frame 1: right
    // Frame 2: back

    // Front animations (use same frame for both idle and throw)
    if (!this.anims.exists(`${animPrefix}-idle-front`)) {
      this.anims.create({
        key: `${animPrefix}-idle-front`,
        frames: [{ key: spriteKey, frame: 0 }],
        frameRate: 1,
        repeat: -1
      })
    }
    if (!this.anims.exists(`${animPrefix}-throw-front`)) {
      this.anims.create({
        key: `${animPrefix}-throw-front`,
        frames: [{ key: spriteKey, frame: 0 }],
        frameRate: 1,
        repeat: 0
      })
    }

    // Right animations
    if (!this.anims.exists(`${animPrefix}-idle-right`)) {
      this.anims.create({
        key: `${animPrefix}-idle-right`,
        frames: [{ key: spriteKey, frame: 1 }],
        frameRate: 1,
        repeat: -1
      })
    }
    if (!this.anims.exists(`${animPrefix}-throw-right`)) {
      this.anims.create({
        key: `${animPrefix}-throw-right`,
        frames: [{ key: spriteKey, frame: 1 }],
        frameRate: 1,
        repeat: 0
      })
    }

    // Back animations
    if (!this.anims.exists(`${animPrefix}-idle-back`)) {
      this.anims.create({
        key: `${animPrefix}-idle-back`,
        frames: [{ key: spriteKey, frame: 2 }],
        frameRate: 1,
        repeat: -1
      })
    }
    if (!this.anims.exists(`${animPrefix}-throw-back`)) {
      this.anims.create({
        key: `${animPrefix}-throw-back`,
        frames: [{ key: spriteKey, frame: 2 }],
        frameRate: 1,
        repeat: 0
      })
    }
  }

  async create() {
    const { width, height } = this.cameras.main

    // Animations will be created lazily when sprites are loaded
    // Load map configuration
    this.mapConfig = this.getMapConfig(this.mapId)

    // Apply grid configuration from map config
    this.gridSize = this.mapConfig.grid.cellSize
    this.gridOffsetX = this.mapConfig.grid.offsetX
    this.gridOffsetY = this.mapConfig.grid.offsetY

    // Create layered background with depth
    if (this.mapId === 1 || this.mapId === 2 || this.mapId === 3 || this.mapId === 4 || this.mapId === 5 || this.mapId === 6) {
      // Use image background for all maps
      // Position image in playable area only (between top menu and bottom tower selection)
      const topMenuHeight = 100 // Height of top UI
      const bottomMenuHeight = 300 // Height of tower selection menu
      const playableHeight = height - topMenuHeight - bottomMenuHeight
      const playableCenterY = topMenuHeight + (playableHeight / 2)

      let bgImageKey = 'meadow-map-bg'
      if (this.mapId === 2) bgImageKey = 'jungle-map-bg'
      if (this.mapId === 3) bgImageKey = 'sand-map-bg'
      if (this.mapId === 4) bgImageKey = 'mountain-map-bg'
      if (this.mapId === 5) bgImageKey = 'lava-map-bg'
      if (this.mapId === 6) bgImageKey = 'ice-map-bg'

      const bgImage = this.add.image(width / 2, playableCenterY, bgImageKey)
      bgImage.setDisplaySize(width, playableHeight)
      bgImage.setDepth(-100)
    } else {
      // Use procedural background for other maps
      // Base layer
      const bg = this.add.rectangle(width / 2, height / 2, width, height, this.mapConfig.backgroundColor)
      bg.setDepth(-100)

      // Add subtle gradient overlay for depth
      const gradientGraphics = this.add.graphics()
      gradientGraphics.setDepth(-99)
      gradientGraphics.fillStyle(0x000000, 0.1)
      gradientGraphics.fillRect(0, height * 0.6, width, height * 0.4)

      // Add organic texture pattern (grass/ground)
      const bgGraphics = this.add.graphics()
      bgGraphics.setDepth(-98)

      // Draw subtle grid for terrain
      bgGraphics.lineStyle(1, 0x000000, 0.03)
      const baseColorObj = Phaser.Display.Color.IntegerToColor(this.mapConfig.backgroundColor)
      for (let x = 0; x < width; x += 60) {
        const offset = (x / 60) % 2 === 0 ? 0 : 30
        for (let y = offset; y < height; y += 60) {
          // Small patches of slightly different color
          const variance = 10
          const newColor = Phaser.Display.Color.GetColor(
            Math.max(0, Math.min(255, baseColorObj.red + (Math.random() - 0.5) * variance)),
            Math.max(0, Math.min(255, baseColorObj.green + (Math.random() - 0.5) * variance)),
            Math.max(0, Math.min(255, baseColorObj.blue + (Math.random() - 0.5) * variance))
          )
          bgGraphics.fillStyle(newColor, 0.15)
          bgGraphics.fillCircle(x, y, 20 + Math.random() * 15)
        }
      }

      // Add some decorative elements based on map theme
      this.addBackgroundDecorations()
    }

    // Initialize groups
    this.enemies = this.add.group({
      classType: Enemy,
      runChildUpdate: false  // We manually update enemies to apply game speed
    })

    this.projectiles = this.add.group()

    // Setup path
    this.setupPath()

    // Setup grid
    this.setupGrid()

    // Draw path
    this.drawPath()

    // Setup UI
    this.setupUI()

    // Setup input
    this.setupInput()

    // Setup tower menu
    await this.setupTowerMenu()

    // Check if this is the first time playing and show tutorial
    this.checkAndShowTutorial()

    // Listen for enemy kills to award coins
    this.events.on('enemyKilled', (reward: number) => {
      this.coins += reward
      this.updateUI()
    })

    // Listen for tower clicks
    this.events.on('towerClicked', (tower: Tower) => {
      this.justClickedTower = true
      this.showTowerOptions(tower)
    })

    // Check if music is already playing (from StartScene)
    // If not, start it here as a fallback
    if (!this.sound.get('bgMusic')) {
      this.time.delayedCall(100, () => {
        try {
          const music = this.sound.add('bgMusic', {
            loop: true,
            volume: 0.7
          })
          music.play()
          console.log('Background music started (fallback)')
        } catch (error) {
          console.error('Failed to play background music:', error)
        }
      })
    }

    console.log(`Map ${this.mapId} loaded: ${this.mapConfig.name}`)
  }

  private showTowerOptions(tower: Tower) {
    // Clear previous selection
    if (this.sellButton) {
      this.sellButton.destroy()
      this.sellButton = null
    }
    this.upgradeButtons.forEach(btn => btn.destroy())
    this.upgradeButtons = []

    this.selectedTower = tower

    // Hide tower selection pages
    this.towerPageContainers.forEach(container => container.setVisible(false))

    // Hide tower selection text
    if (this.selectedTowerText) {
      this.selectedTowerText.setVisible(false)
    }

    const { width, height } = this.cameras.main
    const menuHeight = 300
    const menuY = height - menuHeight

    // Get available upgrade paths
    const availablePaths = this.getAvailableUpgradePaths(tower)

    // Create dark overlay background for upgrade panel
    const panelBg = this.add.rectangle(width / 2, menuY + menuHeight / 2, width, menuHeight, 0x000000, 0.95)
    panelBg.setDepth(599)
    this.upgradeButtons.push(panelBg as any)

    // Tower info panel at top
    const infoPanelY = menuY + 15
    const infoPanelHeight = 90

    // Info panel background
    const infoPanel = this.add.rectangle(width / 2, infoPanelY + infoPanelHeight / 2, width - 40, infoPanelHeight, 0x1a1a1a, 1)
    infoPanel.setStrokeStyle(3, 0x4CAF50, 1)
    infoPanel.setDepth(600)
    this.upgradeButtons.push(infoPanel as any)

    // Tower name and level
    const headerText = this.add.text(width / 2, infoPanelY + 25, tower.stats.name, {
      fontSize: '32px',
      color: '#4CAF50',
      fontStyle: 'bold'
    })
    headerText.setOrigin(0.5)
    headerText.setDepth(601)
    this.upgradeButtons.push(headerText as any)

    const levelText = this.add.text(width / 2, infoPanelY + 60, `Level ${tower.level}`, {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    })
    levelText.setOrigin(0.5)
    levelText.setDepth(601)
    this.upgradeButtons.push(levelText as any)

    // Stats info (smaller text on sides)
    const statsLeft = this.add.text(60, infoPanelY + 45,
      `Damage: ${Math.round(tower.stats.damage)}\nRange: ${Math.round(tower.stats.range)}`, {
      fontSize: '16px',
      color: '#cccccc',
      align: 'left'
    })
    statsLeft.setDepth(601)
    this.upgradeButtons.push(statsLeft as any)

    const statsRight = this.add.text(width - 60, infoPanelY + 45,
      `Fire Rate: ${tower.stats.fireRate.toFixed(1)}/s\nSell: $${tower.getSellValue()}`, {
      fontSize: '16px',
      color: '#cccccc',
      align: 'right'
    })
    statsRight.setOrigin(1, 0)
    statsRight.setDepth(601)
    this.upgradeButtons.push(statsRight as any)

    // Upgrade buttons area
    const upgradeAreaY = menuY + 115

    if (availablePaths.length > 0) {
      // Title for upgrade section
      const upgradeTitle = this.add.text(width / 2, upgradeAreaY, 'UPGRADE PATHS', {
        fontSize: '18px',
        color: '#888888',
        fontStyle: 'bold'
      })
      upgradeTitle.setOrigin(0.5)
      upgradeTitle.setDepth(601)
      this.upgradeButtons.push(upgradeTitle as any)

      // Create upgrade path buttons
      const buttonY = upgradeAreaY + 70
      const buttonWidth = 200
      const buttonHeight = 80
      const buttonGap = 20

      availablePaths.forEach((pathInfo, index) => {
        const totalWidth = availablePaths.length * buttonWidth + (availablePaths.length - 1) * buttonGap
        const startX = (width - totalWidth) / 2
        const x = startX + index * (buttonWidth + buttonGap) + buttonWidth / 2

        // Can afford check
        const canAfford = this.coins >= pathInfo.cost

        // Path-specific colors
        let pathColor = 0x2E7D32  // Default green
        let pathStroke = 0x4CAF50
        let pathHover = 0x43A047

        if (pathInfo.path === 'pathA') {
          // Blue colors for Path A
          pathColor = 0x1565C0
          pathStroke = 0x1E88E5
          pathHover = 0x1976D2
        } else if (pathInfo.path === 'pathB') {
          // Red/Orange colors for Path B
          pathColor = 0xD84315
          pathStroke = 0xFF5722
          pathHover = 0xE64A19
        } else if (pathInfo.path === 'pathC') {
          // Purple colors for Path C
          pathColor = 0x6A1B9A
          pathStroke = 0x9C27B0
          pathHover = 0x7B1FA2
        }

        // Button container
        const btnContainer = this.add.container(x, buttonY)
        btnContainer.setDepth(600)

        // Button background
        const btnBg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, canAfford ? pathColor : 0x424242)
        btnBg.setStrokeStyle(3, canAfford ? pathStroke : 0x666666, 1)

        // Path name
        const pathName = this.add.text(0, -20, pathInfo.name, {
          fontSize: '18px',
          color: '#ffffff',
          fontStyle: 'bold',
          align: 'center',
          wordWrap: { width: buttonWidth - 20 }
        })
        pathName.setOrigin(0.5)

        // Cost
        const costText = this.add.text(0, 15, `$${pathInfo.cost}`, {
          fontSize: '24px',
          color: canAfford ? '#FFD700' : '#888888',
          fontStyle: 'bold'
        })
        costText.setOrigin(0.5)

        btnContainer.add([btnBg, pathName, costText])

        if (canAfford) {
          btnBg.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
              btnBg.setFillStyle(pathHover)
              btnContainer.setScale(1.05)
            })
            .on('pointerout', () => {
              btnBg.setFillStyle(pathColor)
              btnContainer.setScale(1)
            })
            .on('pointerdown', () => {
              this.upgradeTower(tower, pathInfo.path)
            })
        }

        this.upgradeButtons.push(btnContainer as any)
      })
    } else {
      // Max level message
      const maxLevelText = this.add.text(width / 2, upgradeAreaY + 30, 'MAX LEVEL REACHED', {
        fontSize: '24px',
        color: '#FFD700',
        fontStyle: 'bold'
      })
      maxLevelText.setOrigin(0.5)
      maxLevelText.setDepth(601)
      this.upgradeButtons.push(maxLevelText as any)
    }

    // Sell button at bottom
    const sellValue = tower.getSellValue()
    const sellY = menuY + 270

    const sellContainer = this.add.container(width / 2, sellY)
    sellContainer.setDepth(600)

    const sellBg = this.add.rectangle(0, 0, 220, 50, 0xD32F2F)
    sellBg.setStrokeStyle(3, 0xFF5252, 1)

    const sellText = this.add.text(0, 0, `SELL FOR $${sellValue}`, {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    })
    sellText.setOrigin(0.5)

    sellContainer.add([sellBg, sellText])

    sellBg.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        sellBg.setFillStyle(0xE53935)
        sellContainer.setScale(1.05)
      })
      .on('pointerout', () => {
        sellBg.setFillStyle(0xD32F2F)
        sellContainer.setScale(1)
      })
      .on('pointerdown', () => {
        this.sellTower(tower)
      })

    this.sellButton = sellContainer
  }

  private getAvailableUpgradePaths(tower: Tower): Array<{path: string, name: string, cost: number}> {
    const upgrades = tower.stats.upgrades
    const result: Array<{path: string, name: string, cost: number}> = []

    // If no upgrade path chosen yet, show all available paths
    if (tower.upgradePath === null) {
      if (upgrades.pathA && upgrades.pathA.length > 0) {
        result.push({
          path: 'pathA',
          name: upgrades.pathA[0].name,
          cost: upgrades.pathA[0].cost
        })
      }
      if (upgrades.pathB && upgrades.pathB.length > 0) {
        result.push({
          path: 'pathB',
          name: upgrades.pathB[0].name,
          cost: upgrades.pathB[0].cost
        })
      }
      if (upgrades.pathC && upgrades.pathC.length > 0) {
        result.push({
          path: 'pathC',
          name: upgrades.pathC[0].name,
          cost: upgrades.pathC[0].cost
        })
      }
    } else {
      // Continue on chosen path
      const pathUpgrades = upgrades[tower.upgradePath]
      if (pathUpgrades && tower.level < pathUpgrades.length) {
        const nextUpgrade = pathUpgrades[tower.level]
        result.push({
          path: tower.upgradePath,
          name: nextUpgrade.name,
          cost: nextUpgrade.cost
        })
      }
    }

    return result
  }

  private upgradeTower(tower: Tower, path: string) {
    const pathKey = path as 'pathA' | 'pathB' | 'pathC'
    const pathUpgrades = tower.stats.upgrades[pathKey]

    if (!pathUpgrades) return

    // Set path if not chosen
    if (tower.upgradePath === null) {
      tower.upgradePath = pathKey
    }

    const upgrade = pathUpgrades[tower.level]
    if (!upgrade) return

    // Check if player has enough coins
    if (this.coins < upgrade.cost) {
      console.log('Not enough coins for upgrade!')
      return
    }

    // Deduct cost
    this.coins -= upgrade.cost

    // Track upgrade cost for sell value calculation
    tower.totalUpgradeCost += upgrade.cost

    // Apply upgrade bonuses
    if (upgrade.damageBonus) {
      tower.stats.damage += upgrade.damageBonus
    }
    if (upgrade.rangeBonus) {
      tower.stats.range += upgrade.rangeBonus
    }
    if (upgrade.fireRateBonus) {
      tower.stats.fireRate += upgrade.fireRateBonus
    }

    // Increment level
    tower.level++

    // Update tower visual indicator
    tower.updateLevelIndicator()

    // Update UI
    this.updateUI()

    // Clear and refresh tower options
    if (this.sellButton) {
      this.sellButton.destroy()
      this.sellButton = null
    }
    this.upgradeButtons.forEach(btn => btn.destroy())
    this.upgradeButtons = []

    // Show new options
    this.showTowerOptions(tower)

    console.log(`Upgraded ${tower.stats.name} to level ${tower.level} (${upgrade.name})`)
  }

  private sellTower(tower: Tower) {
    // Refund coins
    const sellValue = tower.getSellValue()
    this.coins += sellValue

    // Find grid position
    const gridX = Math.floor((tower.x - this.gridOffsetX) / this.gridSize)
    const gridY = Math.floor((tower.y - this.gridOffsetY) / this.gridSize)

    // Mark grid as available again
    if (gridY >= 0 && gridY < this.placementGrid.length &&
        gridX >= 0 && gridX < this.placementGrid[0].length) {
      this.placementGrid[gridY][gridX] = true
    }

    // Remove tower from array
    const index = this.towers.indexOf(tower)
    if (index > -1) {
      this.towers.splice(index, 1)
    }

    // Destroy tower
    tower.destroy()

    // Clear buttons
    if (this.sellButton) {
      this.sellButton.destroy()
      this.sellButton = null
    }
    this.upgradeButtons.forEach(btn => btn.destroy())
    this.upgradeButtons = []

    this.selectedTower = null

    // Show tower selection menu again
    if (this.towerPageContainers.length > 0) {
      this.towerPageContainers[this.currentTowerPage].setVisible(true)
    }

    // Show tower selection text again
    if (this.selectedTowerText) {
      this.selectedTowerText.setVisible(true)
    }

    this.updateUI()

    console.log(`Sold tower for ${sellValue} coins`)
  }

  update(time: number, delta: number) {
    // Apply game speed multiplier to delta
    const adjustedDelta = delta * this.gameSpeed

    // Update towers
    this.towers.forEach(tower => {
      if (tower.active) {
        tower.update(time, adjustedDelta, this.enemies, this.projectiles)
      }
    })

    // Update projectiles
    this.projectiles.children.entries.forEach((proj: any) => {
      if (proj.active) {
        proj.update(time, adjustedDelta)
      }
    })

    // Manually update enemies with adjusted delta
    this.enemies.children.entries.forEach((enemy: any) => {
      if (enemy.active) {
        enemy.update(time, adjustedDelta)
      }
    })

    // Check for enemies reaching the end
    this.enemies.children.entries.forEach((enemy: any) => {
      if (enemy.active && enemy.hasReachedEnd()) {
        this.lives -= enemy.damage
        enemy.destroy()
        this.updateUI()

        if (this.lives <= 0) {
          this.gameOver()
        }
      }
    })

    // Update mouse coordinates display in path creation mode
    if (this.pathCreationMode) {
      const pointer = this.input.activePointer

      // Create or update coordinate text
      if (!this.mouseCoordText) {
        this.mouseCoordText = this.add.text(10, 50, '', {
          fontSize: '20px',
          color: '#00ff00',
          backgroundColor: '#000000',
          padding: { x: 10, y: 5 },
          fontStyle: 'bold'
        })
        this.mouseCoordText.setDepth(1000)
      }

      // Update text with current mouse position
      const x = Math.round(pointer.x)
      const y = Math.round(pointer.y)
      this.mouseCoordText.setText(`Mouse: (${x}, ${y})\nClick to log coordinate`)
    }
  }

  private setupPath() {
    // Get path from map config
    this.path = this.mapConfig.path
  }

  private setupGrid() {
    console.log(`[SETUP GRID] Called with mapId: ${this.mapId}`)
    const { width, height } = this.cameras.main
    const usableWidth = width - (this.gridOffsetX * 2) // Account for X margins
    const usableHeight = height - this.gridOffsetY // Account for Y offset (top menu)
    const cols = Math.floor(usableWidth / this.gridSize)
    const rows = Math.floor(usableHeight / this.gridSize)

    // Initialize all tiles as placeable
    this.placementGrid = Array(rows).fill(null).map(() => Array(cols).fill(true))

    // Block specific cells for Meadow level
    if (this.mapId === 1) {
      // Note: placementGrid is [row][col], so format is [row, col]
      const blockedCells = [
        [6,6], [7,6], [8,6], [9,6], [10,6],  // column 6, rows 6-10
        [0,0], [1,0], [2,0], [3,0],  // column 0, rows 0-3
        [4,5],  // grid position 5,4
        [11,13], // grid position 13,11
        [12,11], // grid position 11,12
        [13,9]   // grid position 9,13
      ]
      blockedCells.forEach(([row, col]) => {
        if (row >= 0 && row < rows && col >= 0 && col < cols) {
          this.placementGrid[row][col] = false
        }
      })
    }

    // Mark path tiles and buffer zone as non-placeable
    // We'll trace along the path and mark tiles in a wider area
    if (this.path.length > 1) {
      for (let i = 0; i < this.path.length - 1; i++) {
        const start = this.path[i]
        const end = this.path[i + 1]
        const distance = Phaser.Math.Distance.Between(start.x, start.y, end.x, end.y)
        const steps = Math.ceil(distance / (this.gridSize / 2))

        for (let s = 0; s <= steps; s++) {
          const t = s / steps
          const x = start.x + (end.x - start.x) * t
          const y = start.y + (end.y - start.y) * t

          // Mark the path tile and surrounding buffer zone
          const centerGridX = Math.floor((x - this.gridOffsetX) / this.gridSize)
          const centerGridY = Math.floor((y - this.gridOffsetY) / this.gridSize)

          // Create a small buffer zone around the path
          const bufferRadius = 0.5 // tiles on each side
          const bufferRadiusInt = Math.ceil(bufferRadius)
          for (let dy = -bufferRadiusInt; dy <= bufferRadiusInt; dy++) {
            for (let dx = -bufferRadiusInt; dx <= bufferRadiusInt; dx++) {
              const gridX = centerGridX + dx
              const gridY = centerGridY + dy

              // Calculate distance from center to determine if in buffer
              const distFromCenter = Math.sqrt(dx * dx + dy * dy)
              if (distFromCenter <= bufferRadius) {
                if (gridY >= 0 && gridY < rows && gridX >= 0 && gridX < cols) {
                  this.placementGrid[gridY][gridX] = false
                }
              }
            }
          }
        }
      }
    }

    // Mountain level: unblock some cells and block others
    if (this.mapId === 4) {
      // Unblock cells at grid positions (2,9) and (3,9)
      const unblockedCells = [
        [9,2],  // grid position 2,9
        [9,3]   // grid position 3,9
      ]
      unblockedCells.forEach(([row, col]) => {
        if (row >= 0 && row < rows && col >= 0 && col < cols) {
          this.placementGrid[row][col] = true
        }
      })

      // Block cells at grid positions (2,10) and (3,10)
      const blockedCells = [
        [10,2],  // grid position 2,10
        [10,3]   // grid position 3,10
      ]
      blockedCells.forEach(([row, col]) => {
        if (row >= 0 && row < rows && col >= 0 && col < cols) {
          this.placementGrid[row][col] = false
        }
      })
    }
  }

  private drawPath() {
    const graphics = this.add.graphics()
    graphics.setDepth(-90)
    const pathWidth = 32 // Fixed path width (67% of grid size for cleaner layout)

    // Make path invisible for all maps since the background images have the path
    if (this.mapId === 1 || this.mapId === 2 || this.mapId === 3 || this.mapId === 4 || this.mapId === 5 || this.mapId === 6) {
      graphics.setAlpha(0)
      return
    }

    // Draw outer border (darker edge)
    graphics.lineStyle(pathWidth + 8, 0x3d2817, 1) // Reduced border from +20 to +8
    if (this.path.length > 0) {
      graphics.beginPath()
      graphics.moveTo(this.path[0].x, this.path[0].y)
      for (let i = 1; i < this.path.length; i++) {
        graphics.lineTo(this.path[i].x, this.path[i].y)
      }
      graphics.strokePath()
    }

    // Draw path shadow
    graphics.lineStyle(pathWidth + 5, 0x000000, 0.3) // Reduced shadow from +10 to +5
    if (this.path.length > 0) {
      graphics.beginPath()
      graphics.moveTo(this.path[0].x, this.path[0].y + 2)
      for (let i = 1; i < this.path.length; i++) {
        graphics.lineTo(this.path[i].x, this.path[i].y + 2)
      }
      graphics.strokePath()
    }

    // Draw main path base (dirt/ground color)
    graphics.lineStyle(pathWidth, 0x8B7355, 1)
    if (this.path.length > 0) {
      graphics.beginPath()
      graphics.moveTo(this.path[0].x, this.path[0].y)
      for (let i = 1; i < this.path.length; i++) {
        graphics.lineTo(this.path[i].x, this.path[i].y)
      }
      graphics.strokePath()
    }

    // Draw path texture with slight variation
    graphics.lineStyle(pathWidth - 3, 0x9B8365, 0.7) // Reduced from -5 to -3
    if (this.path.length > 0) {
      graphics.beginPath()
      graphics.moveTo(this.path[0].x, this.path[0].y)
      for (let i = 1; i < this.path.length; i++) {
        graphics.lineTo(this.path[i].x, this.path[i].y)
      }
      graphics.strokePath()
    }

    // Draw center highlight/worn path
    graphics.lineStyle(pathWidth - 10, 0xA0826D, 0.5) // Reduced from -20 to -10
    if (this.path.length > 0) {
      graphics.beginPath()
      graphics.moveTo(this.path[0].x, this.path[0].y)
      for (let i = 1; i < this.path.length; i++) {
        graphics.lineTo(this.path[i].x, this.path[i].y)
      }
      graphics.strokePath()
    }

    // Add decorative stones/pebbles along the path
    if (this.path.length > 1) {
      for (let i = 0; i < this.path.length - 1; i++) {
        const start = this.path[i]
        const end = this.path[i + 1]
        const distance = Phaser.Math.Distance.Between(start.x, start.y, end.x, end.y)
        const steps = Math.floor(distance / 25)

        for (let s = 0; s < steps; s++) {
          const t = s / steps
          const x = start.x + (end.x - start.x) * t
          const y = start.y + (end.y - start.y) * t

          // Random pebbles on sides of path
          if (Math.random() > 0.7) {
            const offsetX = (Math.random() - 0.5) * (pathWidth * 0.7)
            const offsetY = (Math.random() - 0.5) * (pathWidth * 0.7)
            const size = 2 + Math.random() * 3
            const pebble = this.add.circle(x + offsetX, y + offsetY, size, 0x6B5A4D, 0.6)
            pebble.setDepth(-89)
          }
        }
      }
    }

    // Draw start marker with glow
    if (this.path.length > 0) {
      const start = this.path[0]
      const startGlow = this.add.circle(start.x, start.y, 40, 0x00ff00, 0.2)
      startGlow.setDepth(-88)
      const startCircle = this.add.circle(start.x, start.y, 30, 0x00ff00, 0.6)
      startCircle.setDepth(-88)
      startCircle.setStrokeStyle(3, 0xffffff, 0.8)

      const startText = this.add.text(start.x, start.y, 'START', {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5)
      startText.setDepth(-87)

      // Pulse animation
      this.tweens.add({
        targets: startGlow,
        scale: { from: 1, to: 1.3 },
        alpha: { from: 0.2, to: 0 },
        duration: 1500,
        repeat: -1
      })
    }

    // Draw end marker with glow
    if (this.path.length > 1) {
      const end = this.path[this.path.length - 1]
      const endGlow = this.add.circle(end.x, end.y, 40, 0xff0000, 0.2)
      endGlow.setDepth(-88)
      const endCircle = this.add.circle(end.x, end.y, 30, 0xff0000, 0.6)
      endCircle.setDepth(-88)
      endCircle.setStrokeStyle(3, 0xffffff, 0.8)

      const endText = this.add.text(end.x, end.y, 'END', {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5)
      endText.setDepth(-87)

      // Pulse animation
      this.tweens.add({
        targets: endGlow,
        scale: { from: 1, to: 1.3 },
        alpha: { from: 0.2, to: 0 },
        duration: 1500,
        repeat: -1
      })
    }
  }

  private debugGraphics: Phaser.GameObjects.Graphics | null = null
  private pathCreationMode: boolean = false
  private mouseCoordText: Phaser.GameObjects.Text | null = null

  private drawDebugGrid() {
    // Remove existing debug graphics if any
    if (this.debugGraphics) {
      // Also destroy the info text if it exists
      if ((this.debugGraphics as any).infoText) {
        (this.debugGraphics as any).infoText.destroy()
      }
      // Destroy coordinate text labels
      if ((this.debugGraphics as any).coordTexts) {
        (this.debugGraphics as any).coordTexts.forEach((text: Phaser.GameObjects.Text) => text.destroy())
      }
      this.debugGraphics.destroy()
      this.debugGraphics = null
    }

    if (!this.debugMode) {
      return // Debug mode is off, don't draw anything
    }

    // Create new debug graphics
    this.debugGraphics = this.add.graphics()
    this.debugGraphics.setDepth(500) // Above most things but below UI

    const { width, height } = this.cameras.main
    const usableWidth = width - (this.gridOffsetX * 2)
    const usableHeight = height - this.gridOffsetY
    const cols = Math.floor(usableWidth / this.gridSize)
    const rows = Math.floor(usableHeight / this.gridSize)

    // Draw top margin (Y offset for top menu)
    if (this.gridOffsetY > 0) {
      this.debugGraphics.fillStyle(0x0000ff, 0.1)
      this.debugGraphics.fillRect(0, 0, width, this.gridOffsetY) // Top margin
    }

    // Draw half-tile margins on left and right (only if margins exist)
    if (this.gridOffsetX > 0) {
      this.debugGraphics.fillStyle(0x0000ff, 0.1)
      this.debugGraphics.fillRect(0, this.gridOffsetY, this.gridOffsetX, height - this.gridOffsetY) // Left margin
      this.debugGraphics.fillRect(width - this.gridOffsetX, this.gridOffsetY, this.gridOffsetX, height - this.gridOffsetY) // Right margin
    }

    // Draw grid cells
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = this.gridOffsetX + col * this.gridSize
        const y = this.gridOffsetY + row * this.gridSize
        const canPlace = this.placementGrid[row] && this.placementGrid[row][col]

        // Color coding: green = placeable, red = blocked
        const fillColor = canPlace ? 0x00ff00 : 0xff0000
        const strokeColor = 0xffffff

        // Draw cell with semi-transparent fill
        this.debugGraphics.fillStyle(fillColor, 0.15)
        this.debugGraphics.fillRect(x, y, this.gridSize, this.gridSize)

        // Draw cell border
        this.debugGraphics.lineStyle(1, strokeColor, 0.3)
        this.debugGraphics.strokeRect(x, y, this.gridSize, this.gridSize)

        // Draw coordinate label in cell
        const coordText = this.add.text(
          x + this.gridSize / 2,
          y + this.gridSize / 2,
          `${col},${row}`,
          {
            fontSize: '10px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 2, y: 1 }
          }
        )
        coordText.setOrigin(0.5)
        coordText.setDepth(501)

        // Store reference to clean up later
        if (!(this.debugGraphics as any).coordTexts) {
          (this.debugGraphics as any).coordTexts = []
        }
        (this.debugGraphics as any).coordTexts.push(coordText)
      }
    }

    // Draw grid info text
    const marginInfo = this.gridOffsetX > 0 ? ` | Margins: ${this.gridOffsetX}px` : ' | Edge-to-edge'
    const infoText = this.add.text(
      10,
      height - 30,
      `Grid: ${cols}×${rows} (${cols * rows} cells) | Cell Size: ${this.gridSize}px${marginInfo} | Press G to toggle`,
      {
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
      }
    )
    infoText.setDepth(501)

    // Store reference so we can destroy it when toggling off
    if (this.debugGraphics) {
      (this.debugGraphics as any).infoText = infoText
    }
  }

  private addBackgroundDecorations() {
    const { width, height } = this.cameras.main

    // Get map theme colors - convert to RGB
    const baseColor = this.mapConfig.backgroundColor
    const baseColorObj = Phaser.Display.Color.IntegerToColor(baseColor)
    const darkColor = Phaser.Display.Color.GetColor(
      Math.max(0, baseColorObj.red - 30),
      Math.max(0, baseColorObj.green - 30),
      Math.max(0, baseColorObj.blue - 30)
    )
    const lighterColor = Phaser.Display.Color.GetColor(
      Math.min(255, baseColorObj.red + 30),
      Math.min(255, baseColorObj.green + 30),
      Math.min(255, baseColorObj.blue + 30)
    )

    // Add themed decorations based on map
    // Trees/bushes
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width
      const y = Math.random() * height

      // Avoid path area (rough check)
      let tooCloseToPath = false
      if (this.path && this.path.length > 0) {
        for (const point of this.path) {
          if (Phaser.Math.Distance.Between(x, y, point.x, point.y) < 80) {
            tooCloseToPath = true
            break
          }
        }
      }

      if (!tooCloseToPath) {
        // Create small bush/tree
        const size = 15 + Math.random() * 25

        // Shadow
        const shadow = this.add.ellipse(x + 3, y + size * 0.3, size * 1.2, size * 0.4, 0x000000, 0.2)
        shadow.setDepth(-97)

        // Bush base
        const bushBase = this.add.circle(x, y, size, darkColor, 0.4)
        bushBase.setDepth(-97)

        // Bush highlight
        const bushHighlight = this.add.circle(x - size * 0.2, y - size * 0.2, size * 0.7, lighterColor, 0.3)
        bushHighlight.setDepth(-97)
      }
    }

    // Add rocks
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * width
      const y = Math.random() * height

      // Avoid path area
      let tooCloseToPath = false
      if (this.path && this.path.length > 0) {
        for (const point of this.path) {
          if (Phaser.Math.Distance.Between(x, y, point.x, point.y) < 60) {
            tooCloseToPath = true
            break
          }
        }
      }

      if (!tooCloseToPath) {
        const size = 3 + Math.random() * 8
        const rockColor = 0x808080

        // Rock shadow
        const rockShadow = this.add.circle(x + 1, y + 1, size, 0x000000, 0.2)
        rockShadow.setDepth(-96)

        // Rock
        const rock = this.add.circle(x, y, size, rockColor, 0.4)
        rock.setDepth(-96)

        // Rock highlight
        const rockHighlight = this.add.circle(x - size * 0.3, y - size * 0.3, size * 0.4, 0xA0A0A0, 0.5)
        rockHighlight.setDepth(-96)
      }
    }

    // Add grass tufts (small detail)
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * width
      const y = Math.random() * height

      const grassColor = lighterColor
      const tuftSize = 2 + Math.random() * 3

      // Simple grass tuft (3 small lines)
      for (let g = 0; g < 3; g++) {
        const angle = (g - 1) * 0.3
        const line = this.add.line(
          x, y,
          0, 0,
          Math.cos(angle) * tuftSize, -Math.sin(angle) * tuftSize,
          grassColor,
          0.3
        )
        line.setLineWidth(1)
        line.setDepth(-95)
      }
    }
  }

  private createHeartIcon(x: number, y: number, size: number, color: number) {
    // Create heart shape using circles and triangle
    const container = this.add.container(x, y)

    // Left circle
    const leftCircle = this.add.circle(-size * 0.35, -size * 0.2, size * 0.5, color)
    container.add(leftCircle)

    // Right circle
    const rightCircle = this.add.circle(size * 0.35, -size * 0.2, size * 0.5, color)
    container.add(rightCircle)

    // Bottom triangle
    const triangle = this.add.triangle(
      0,
      size * 0.3,
      0,
      -size * 0.5,
      -size * 0.85,
      size * 0.2,
      size * 0.85,
      size * 0.2,
      color
    )
    container.add(triangle)

    // Highlight
    const highlight = this.add.circle(-size * 0.25, -size * 0.35, size * 0.25, 0xffffff, 0.5)
    container.add(highlight)

    container.setDepth(101)

    // Subtle pulse animation
    this.tweens.add({
      targets: container,
      scale: { from: 1, to: 1.1 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    return container
  }

  private createCoinIcon(x: number, y: number, size: number, color: number) {
    const container = this.add.container(x, y)

    // Outer ring
    const outer = this.add.circle(0, 0, size, color)
    outer.setStrokeStyle(2, 0xFFAA00)
    container.add(outer)

    // Inner ring for depth
    const inner = this.add.circle(0, 0, size * 0.7, Phaser.Display.Color.GetColor(
      Math.min(255, Phaser.Display.Color.IntegerToColor(color).red + 30),
      Math.min(255, Phaser.Display.Color.IntegerToColor(color).green + 30),
      Math.min(255, Phaser.Display.Color.IntegerToColor(color).blue + 30)
    ))
    container.add(inner)

    // Shine effect
    const shine = this.add.circle(-size * 0.3, -size * 0.3, size * 0.4, 0xffffff, 0.6)
    container.add(shine)

    // Dollar sign-like shape using rectangles
    const line1 = this.add.rectangle(0, 0, size * 0.2, size * 1.2, 0xFFAA00)
    container.add(line1)

    const line2 = this.add.rectangle(0, -size * 0.3, size * 0.8, size * 0.2, 0xFFAA00)
    container.add(line2)

    const line3 = this.add.rectangle(0, size * 0.3, size * 0.8, size * 0.2, 0xFFAA00)
    container.add(line3)

    container.setDepth(101)

    // Rotation animation
    this.tweens.add({
      targets: container,
      angle: { from: -5, to: 5 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    return container
  }

  private setupUI() {
    const { width, height } = this.cameras.main

    // Top bar background
    const topBar = this.add.rectangle(width / 2, 50, width, 100, 0x000000, 0.8)
    topBar.setDepth(100)

    // Heart icon for lives
    this.createHeartIcon(30, 30, 12, 0xff0000)

    // Lives text
    this.livesText = this.add.text(50, 20, `${this.lives}`, {
      fontSize: '28px',
      color: '#ff0000',
      fontStyle: 'bold'
    })
    this.livesText.setDepth(101)

    // Coin icon
    this.createCoinIcon(30, 65, 12, 0xffd700)

    // Coins text
    this.coinsText = this.add.text(50, 55, `${this.coins}`, {
      fontSize: '28px',
      color: '#ffd700',
      fontStyle: 'bold'
    })
    this.coinsText.setDepth(101)

    // Wave (top right corner)
    this.waveText = this.add.text(width - 10, 10, `Wave: ${this.currentWave}/118`, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(1, 0)
    this.waveText.setDepth(101)

    // All buttons scaled down to 0.25 size for better fit
    const buttonScale = 0.25

    // Start Wave button (top right, slightly bigger)
    const startWaveBtnScale = 0.35
    const startWaveBtn = this.add.image(width - 100, 65, 'start-wave-button')
      .setScale(startWaveBtnScale)
      .setInteractive({ useHandCursor: true })
      .setDepth(101)
      .on('pointerover', () => startWaveBtn.setScale(startWaveBtnScale * 1.05))
      .on('pointerout', () => startWaveBtn.setScale(startWaveBtnScale))
      .on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation()
        this.startNextWave()
      })

    // Bottom buttons (in tower menu area)
    const bottomButtonY = height - 270 // Just above tower menu
    const buttonSpacing = 85

    // Speed button (bottom left)
    const speedButtonScale = buttonScale * 0.75
    this.speedButtonImage = this.add.image(50, bottomButtonY, '1x-button')
      .setScale(speedButtonScale)
      .setInteractive({ useHandCursor: true })
      .setDepth(201) // Above tower menu
      .on('pointerover', () => this.speedButtonImage.setScale(speedButtonScale * 1.05))
      .on('pointerout', () => this.speedButtonImage.setScale(speedButtonScale))
      .on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation()
        this.toggleSpeed()
      })

    // Auto-start button (bottom left)
    const autoButtonScale = buttonScale * 0.85
    this.autoStartButtonImage = this.add.image(50 + buttonSpacing, bottomButtonY, 'auto-off-button')
      .setScale(autoButtonScale)
      .setInteractive({ useHandCursor: true })
      .setDepth(201) // Above tower menu
      .on('pointerover', () => this.autoStartButtonImage.setScale(autoButtonScale * 1.05))
      .on('pointerout', () => this.autoStartButtonImage.setScale(autoButtonScale))
      .on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation()
        this.toggleAutoStart()
      })

    // Menu button (center top) - Opens pause menu
    const menuBtnScale = 0.27
    const menuBtn = this.add.image(width / 2, 30, 'menu-button')
      .setScale(menuBtnScale)
      .setInteractive({ useHandCursor: true })
      .setDepth(101)
      .on('pointerover', () => menuBtn.setScale(menuBtnScale * 1.05))
      .on('pointerout', () => menuBtn.setScale(menuBtnScale))
      .on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation()
        this.togglePauseMenu()
      })

    // Selected tower indicator (will be updated when tower is selected)
    this.selectedTowerText = this.add.text(width / 2, 90, '', {
      fontSize: '20px',
      color: '#00ff00',
      fontStyle: 'bold',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    })
    this.selectedTowerText.setOrigin(0.5, 0)
    this.selectedTowerText.setDepth(101)
    this.selectedTowerText.setVisible(false) // Hide initially

    // Create pause menu (initially hidden)
    this.createPauseMenu()
  }

  private createPauseMenu() {
    const { width, height } = this.cameras.main

    // Create container for pause menu
    this.pauseMenuContainer = this.add.container(0, 0)
    this.pauseMenuContainer.setDepth(500) // Very high depth to be on top of everything
    this.pauseMenuContainer.setVisible(false)

    // Semi-transparent dark overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
    overlay.setInteractive() // Block clicks to game below

    // Menu panel background
    const panelWidth = 400
    const panelHeight = 300
    const panel = this.add.rectangle(width / 2, height / 2, panelWidth, panelHeight, 0x1a1a1a, 0.95)
    panel.setStrokeStyle(4, 0xffd700)

    // X button (close/resume)
    const xButton = this.add.text(width / 2 + panelWidth / 2 - 30, height / 2 - panelHeight / 2 + 15, 'X', {
      fontSize: '32px',
      color: '#ff6b6b',
      fontStyle: 'bold'
    })
    xButton.setInteractive({ useHandCursor: true })
      .on('pointerover', () => xButton.setScale(1.1))
      .on('pointerout', () => xButton.setScale(1))
      .on('pointerdown', () => this.togglePauseMenu())

    // Pause title
    const pauseTitle = this.add.text(width / 2, height / 2 - 80, 'PAUSED', {
      fontSize: '48px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    // Button scale
    const buttonScale = 0.35

    // End Game button (centered)
    const endGameBtn = this.add.image(width / 2, height / 2 + 20, 'end-game-button')
      .setScale(buttonScale)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => endGameBtn.setScale(buttonScale * 1.05))
      .on('pointerout', () => endGameBtn.setScale(buttonScale))
      .on('pointerup', () => {
        this.input.enabled = false
        this.togglePauseMenu()
        this.gameOver()
      })

    // Add all to container
    this.pauseMenuContainer.add([overlay, panel, xButton, pauseTitle, endGameBtn])
  }

  private checkAndShowTutorial() {
    // Check localStorage to see if tutorial has been seen
    const tutorialSeen = localStorage.getItem('towerDefenseTutorialSeen')

    if (!tutorialSeen) {
      // Show tutorial after a short delay
      this.time.delayedCall(500, () => {
        this.showTutorial()
      })
    }
  }

  private showTutorial() {
    const { width, height } = this.cameras.main

    // Create tutorial container
    this.tutorialContainer = this.add.container(0, 0)
    this.tutorialContainer.setDepth(600) // Above everything else

    // Semi-transparent dark overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8)
    overlay.setInteractive() // Block clicks below

    // Highlight area for tower menu (bottom area)
    const menuHighlightY = height - 150
    const menuHighlightHeight = 300

    // Create a bright rectangle to highlight the tower menu area
    const highlight = this.add.rectangle(width / 2, menuHighlightY, width, menuHighlightHeight, 0xffd700, 0.3)
    highlight.setStrokeStyle(4, 0xffd700, 1)

    // Pulsing animation for highlight
    this.tweens.add({
      targets: highlight,
      alpha: { from: 0.3, to: 0.6 },
      duration: 1000,
      yoyo: true,
      repeat: -1
    })

    // Tutorial text panel
    const panelY = height / 2 - 100
    const textPanel = this.add.rectangle(width / 2, panelY, width - 80, 200, 0x1a1a1a, 0.95)
    textPanel.setStrokeStyle(3, 0xffd700)

    // Title
    const title = this.add.text(width / 2, panelY - 70, 'WELCOME!', {
      fontSize: '36px',
      color: '#ffd700',
      fontStyle: 'bold',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5)

    // Instructions - split into two separate texts
    const tapText = this.add.text(width / 2, panelY - 5,
      'TAP towers at the bottom to select', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5)

    const swipeText = this.add.text(width / 2, panelY + 25,
      'Tap the dots at the bottom or swipe to see more towers!', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5)

    // Hand icon pointing down (using text emoji/arrow)
    const handIcon = this.add.text(width / 2, panelY + 60, '👇', {
      fontSize: '48px'
    }).setOrigin(0.5)

    // Bouncing animation for hand
    this.tweens.add({
      targets: handIcon,
      y: panelY + 70,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Got it button
    const buttonBg = this.add.rectangle(width / 2, height - 60, 200, 60, 0x00aa00)
    buttonBg.setStrokeStyle(3, 0x00ff00)
    buttonBg.setInteractive({ useHandCursor: true })
      .on('pointerover', () => buttonBg.setScale(1.05))
      .on('pointerout', () => buttonBg.setScale(1))
      .on('pointerup', () => this.closeTutorial())

    const buttonText = this.add.text(width / 2, height - 60, 'GOT IT!', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5)

    // Add all to container
    this.tutorialContainer.add([
      overlay,
      highlight,
      textPanel,
      title,
      tapText,
      swipeText,
      handIcon,
      buttonBg,
      buttonText
    ])
  }

  private closeTutorial() {
    // Mark tutorial as seen
    localStorage.setItem('towerDefenseTutorialSeen', 'true')
    this.hasSeenTutorial = true

    // Destroy tutorial container
    if (this.tutorialContainer) {
      this.tutorialContainer.destroy()
    }
  }

  private togglePauseMenu() {
    this.isPaused = !this.isPaused
    this.pauseMenuContainer.setVisible(this.isPaused)

    if (this.isPaused) {
      // Pause the game completely (physics, tweens, time, but keep input active)
      this.physics.pause()
      this.tweens.pauseAll()
      this.time.paused = true
    } else {
      // Resume the game
      this.physics.resume()
      this.tweens.resumeAll()
      this.time.paused = false
    }
  }

  private async setupTowerMenu() {
    const { width, height } = this.cameras.main
    const menuHeight = 300
    const menuY = height - menuHeight

    // Get all towers
    const allTowers = getAllTowerConfigs()

    // Preload all tower sprites
    for (const towerConfig of allTowers) {
      await this.ensureTowerSpriteLoaded(towerConfig.type)
    }

    // Menu background
    const menuBg = this.add.rectangle(width / 2, menuY + menuHeight / 2, width, menuHeight, 0x000000, 0.9)
    menuBg.setDepth(200)

    // Title
    const title = this.add.text(width / 2, menuY + 10, 'SELECT TOWER', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    })
    title.setOrigin(0.5, 0)
    title.setDepth(201)

    const towersPerPage = 4
    const totalPages = Math.ceil(allTowers.length / towersPerPage)

    // Tower buttons - 4 per page
    const buttonWidth = 160
    const buttonHeight = 180
    const buttonGap = 10
    const startX = (width - (towersPerPage * buttonWidth + (towersPerPage - 1) * buttonGap)) / 2

    // Create all pages
    for (let page = 0; page < totalPages; page++) {
      const pageContainer = this.add.container(0, 0)
      pageContainer.setDepth(201)
      pageContainer.setVisible(page === 0) // Only first page visible initially
      this.towerPageContainers.push(pageContainer)

      const startIndex = page * towersPerPage
      const endIndex = Math.min(startIndex + towersPerPage, allTowers.length)

      for (let i = startIndex; i < endIndex; i++) {
        const towerConfig = allTowers[i]
        const localIndex = i - startIndex
        const x = startX + localIndex * (buttonWidth + buttonGap) + buttonWidth / 2
        const y = menuY + 150

        const container = this.add.container(x, y)

        // Button background with gradient effect
        const bg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, towerConfig.color)
        bg.setStrokeStyle(4, 0xffffff, 0.9)

        // Darker overlay for depth
        const overlay = this.add.rectangle(0, 40, buttonWidth, buttonHeight / 2, 0x000000, 0.2)

        // Tower full name (split into two lines if needed)
        const nameParts = towerConfig.name.split(' ')
        // Show first word on line 1
        const nameText = this.add.text(0, -75, nameParts[0], {
          fontSize: '16px',
          color: '#ffffff',
          fontStyle: 'bold',
          align: 'center',
          stroke: '#000000',
          strokeThickness: 3
        })
        nameText.setOrigin(0.5)

        // Show remaining words on line 2
        const remainingName = nameParts.slice(1).join(' ')
        const nameText2 = this.add.text(0, -57, remainingName, {
          fontSize: '16px',
          color: '#ffffff',
          fontStyle: 'bold',
          align: 'center',
          stroke: '#000000',
          strokeThickness: 3
        })
        nameText2.setOrigin(0.5)

        // Tower icon/preview using sprite sheet (first frame)
        const iconContainer = this.createTowerSpriteIcon(towerConfig.type, 0, 5)

        // Add glow to icon
        const glow = this.add.circle(0, 5, 50, towerConfig.color, 0.3)

        // Cost with background
        const costBg = this.add.rectangle(0, 70, buttonWidth - 20, 35, 0x000000, 0.8)
        const cost = this.add.text(0, 70, `$${towerConfig.cost}`, {
          fontSize: '22px',
          color: '#ffd700',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 3
        })
        cost.setOrigin(0.5)

        container.add([bg, overlay, glow, iconContainer, nameText, nameText2, costBg, cost])
        container.setSize(buttonWidth, buttonHeight)

        // Make interactive
        bg.setInteractive({ useHandCursor: true })
          .on('pointerover', () => {
            bg.setStrokeStyle(5, 0xffff00, 1)
            container.setScale(1.05)
          })
          .on('pointerout', () => {
            bg.setStrokeStyle(4, 0xffffff, 0.9)
            container.setScale(1)
          })
          .on('pointerdown', () => {
            if (this.coins >= towerConfig.cost) {
              this.selectedTowerType = towerConfig.type
              bg.setStrokeStyle(6, 0x00ff00, 1)

              // Update selected tower text
              if (this.selectedTowerText) {
                this.selectedTowerText.setText('TAP MAP TO PLACE')
                this.selectedTowerText.setVisible(true)
              }

              console.log(`Selected tower: ${towerConfig.name}`)
            } else {
              // Flash red if can't afford
              bg.setFillStyle(0xff0000)
              this.time.delayedCall(200, () => {
                bg.setFillStyle(towerConfig.color)
              })
            }
          })

        pageContainer.add(container)
      }
    }

    // Page dots indicator (clickable navigation)
    const dotsContainer = this.add.container(width / 2, menuY + 265)
    dotsContainer.setDepth(202)
    const dotSpacing = 30 // Increased spacing for better touch targets
    const dotStartX = -(totalPages - 1) * dotSpacing / 2

    const pageDots: Phaser.GameObjects.Circle[] = []
    for (let i = 0; i < totalPages; i++) {
      const dot = this.add.circle(dotStartX + i * dotSpacing, 0, 8, 0xffffff, i === 0 ? 1 : 0.3)
      dot.setStrokeStyle(2, 0x000000, 0.5)

      // Make dots interactive and clickable
      dot.setInteractive({ useHandCursor: true })
        .on('pointerover', () => {
          if (this.currentTowerPage !== i) {
            dot.setScale(1.2)
          }
        })
        .on('pointerout', () => {
          dot.setScale(1)
        })
        .on('pointerdown', () => {
          this.goToTowerPage(i, pageDots)
        })

      dotsContainer.add(dot)
      pageDots.push(dot)
    }

    // Add swipe detection for mobile
    this.setupTowerMenuSwipe(pageDots, totalPages, menuY, menuHeight)
  }

  private createArrowButton(x: number, y: number, direction: 'left' | 'right', onClick: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y)

    // Background circle
    const bg = this.add.circle(0, 0, 35, 0x444444)
    bg.setStrokeStyle(3, 0xffffff, 0.8)

    // Arrow triangle
    const arrowSize = 20
    const triangle = this.add.triangle(
      direction === 'left' ? -3 : 3,
      0,
      0,
      -arrowSize,
      arrowSize,
      0,
      0,
      arrowSize,
      0xffffff
    )
    if (direction === 'left') {
      triangle.setRotation(Math.PI)
    }

    container.add([bg, triangle])

    // Make interactive
    bg.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        bg.setFillStyle(0x666666)
        container.setScale(1.1)
      })
      .on('pointerout', () => {
        bg.setFillStyle(0x444444)
        container.setScale(1)
      })
      .on('pointerdown', () => {
        container.setScale(0.95)
      })
      .on('pointerup', () => {
        container.setScale(1.1)
        onClick()
      })

    return container
  }

  private goToTowerPage(pageIndex: number, pageDots: Phaser.GameObjects.Circle[]) {
    if (pageIndex === this.currentTowerPage) return

    // Hide current page
    this.towerPageContainers[this.currentTowerPage].setVisible(false)

    // Update to new page
    this.currentTowerPage = pageIndex

    // Show new page
    this.towerPageContainers[this.currentTowerPage].setVisible(true)

    // Update all dots - fade out inactive, highlight active
    pageDots.forEach((dot, index) => {
      if (index === this.currentTowerPage) {
        dot.setAlpha(1)
        dot.setFillStyle(0xffffff, 1)
      } else {
        dot.setAlpha(0.3)
        dot.setFillStyle(0xffffff, 0.3)
      }
      dot.setScale(1) // Reset scale
    })
  }

  private changeTowerPage(direction: number, pageDots: Phaser.GameObjects.Circle[], totalPages: number) {
    // Calculate new page with wrapping
    const newPage = (this.currentTowerPage + direction + totalPages) % totalPages
    this.goToTowerPage(newPage, pageDots)
  }

  private setupTowerMenuSwipe(pageDots: Phaser.GameObjects.Circle[], totalPages: number, menuY: number, menuHeight: number) {
    let swipeStartX = 0
    let swipeStartY = 0
    let swipeStartTime = 0
    const swipeThreshold = 50 // Minimum distance for swipe
    const swipeTimeLimit = 300 // Maximum time for swipe (ms)

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Only detect swipes in tower menu area
      if (pointer.y >= menuY && pointer.y <= menuY + menuHeight) {
        swipeStartX = pointer.x
        swipeStartY = pointer.y
        swipeStartTime = Date.now()
      }
    })

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      // Only process if swipe started in menu area
      if (swipeStartTime === 0) return

      const swipeEndX = pointer.x
      const swipeEndY = pointer.y
      const swipeTime = Date.now() - swipeStartTime
      const deltaX = swipeEndX - swipeStartX
      const deltaY = swipeEndY - swipeStartY

      // Reset swipe tracking
      swipeStartTime = 0

      // Check if it's a valid horizontal swipe
      if (swipeTime < swipeTimeLimit && Math.abs(deltaX) > swipeThreshold && Math.abs(deltaY) < Math.abs(deltaX)) {
        if (deltaX < 0) {
          // Swipe left - go to next page
          this.changeTowerPage(1, pageDots, totalPages)
        } else {
          // Swipe right - go to previous page
          this.changeTowerPage(-1, pageDots, totalPages)
        }
      }
    })
  }

  private setupInput() {
    const { height } = this.cameras.main
    const menuHeight = 300
    const menuY = height - menuHeight

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.selectedTowerType !== null) {
        this.updateHoverTile(pointer)
      }
    })

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Path creation mode - log coordinates on click
      if (this.pathCreationMode) {
        const x = Math.round(pointer.x)
        const y = Math.round(pointer.y)
        console.log(`%c[PATH] new Phaser.Math.Vector2(${x}, ${y}),`, 'color: #00ff00; font-weight: bold')
        return
      }

      // Check if tower was just clicked, if so don't clear options
      if (this.justClickedTower) {
        this.justClickedTower = false
        return
      }

      // Right click to cancel
      if (pointer.rightButtonDown()) {
        this.cancelTowerSelection()
        this.clearTowerOptions()
        return
      }

      // Don't place towers if clicking in UI areas
      if (pointer.y < 100) return // Top UI bar
      if (pointer.y > menuY) return // Bottom tower menu

      if (this.selectedTowerType !== null) {
        this.placeTower(pointer)
      } else {
        // Clear tower options when clicking on empty space
        this.clearTowerOptions()
      }
    })

    // ESC key to cancel tower selection
    this.input.keyboard?.on('keydown-ESC', () => {
      this.cancelTowerSelection()
    })

    // G key to toggle grid debug visualization
    this.input.keyboard?.on('keydown-G', () => {
      this.debugMode = !this.debugMode
      this.drawDebugGrid()
      console.log(`[DEBUG] Grid visualization: ${this.debugMode ? 'ON' : 'OFF'}`)
    })

    // P key to toggle path creation mode (shows mouse coordinates)
    this.input.keyboard?.on('keydown-P', () => {
      this.pathCreationMode = !this.pathCreationMode
      if (!this.pathCreationMode && this.mouseCoordText) {
        this.mouseCoordText.destroy()
        this.mouseCoordText = null
      }
      console.log(`[DEBUG] Path creation mode: ${this.pathCreationMode ? 'ON' : 'OFF'}`)
      console.log(this.pathCreationMode ? '[DEBUG] Hover over the map to see pixel coordinates. Click to log coordinates to console.' : '')
    })
  }

  private cancelTowerSelection() {
    this.selectedTowerType = null

    if (this.hoverTile) {
      this.hoverTile.destroy()
      this.hoverTile = null
    }

    if (this.selectedTowerText) {
      this.selectedTowerText.setText('')
      this.selectedTowerText.setVisible(false)
    }

    console.log('Tower selection cancelled')
  }

  private clearTowerOptions() {
    if (this.sellButton) {
      this.sellButton.destroy()
      this.sellButton = null
    }
    this.upgradeButtons.forEach(btn => btn.destroy())
    this.upgradeButtons = []
    this.selectedTower = null

    // Show tower selection menu again
    if (this.towerPageContainers.length > 0) {
      this.towerPageContainers[this.currentTowerPage].setVisible(true)
    }
  }

  private updateHoverTile(pointer: Phaser.Input.Pointer) {
    const { height } = this.cameras.main
    const menuHeight = 250
    const menuY = height - menuHeight

    // Don't show hover tile in UI areas
    if (pointer.y < 100 || pointer.y > menuY) {
      if (this.hoverTile) {
        this.hoverTile.destroy()
        this.hoverTile = null
      }
      return
    }

    const gridX = Math.floor((pointer.x - this.gridOffsetX) / this.gridSize)
    const gridY = Math.floor((pointer.y - this.gridOffsetY) / this.gridSize)

    if (this.hoverTile) {
      this.hoverTile.destroy()
    }

    const canPlace = this.canPlaceTower(gridX, gridY)
    const color = canPlace ? 0x00ff00 : 0xff0000

    this.hoverTile = this.add.rectangle(
      this.gridOffsetX + gridX * this.gridSize + this.gridSize / 2,
      this.gridOffsetY + gridY * this.gridSize + this.gridSize / 2,
      this.gridSize,
      this.gridSize,
      color,
      0.3
    )
    this.hoverTile.setDepth(50)
  }

  private canPlaceTower(gridX: number, gridY: number): boolean {
    if (gridY < 0 || gridY >= this.placementGrid.length) return false
    if (gridX < 0 || gridX >= this.placementGrid[0].length) return false
    return this.placementGrid[gridY][gridX]
  }

  private async placeTower(pointer: Phaser.Input.Pointer) {
    const gridX = Math.floor((pointer.x - this.gridOffsetX) / this.gridSize)
    const gridY = Math.floor((pointer.y - this.gridOffsetY) / this.gridSize)

    console.log(`[PlaceTower] Attempting to place at grid (${gridX}, ${gridY})`)
    if (!this.canPlaceTower(gridX, gridY)) {
      console.log(`[PlaceTower] Cannot place at (${gridX}, ${gridY})`)
      return
    }
    if (this.selectedTowerType === null) return

    // Get tower config
    const towerConfig = getTowerConfig(this.selectedTowerType)
    if (!towerConfig) return

    // Check if player has enough coins
    if (this.coins < towerConfig.cost) {
      console.log('Not enough coins!')
      return
    }

    // Show loading indicator
    const loadingText = this.add.text(
      pointer.x,
      pointer.y - 40,
      'Loading...',
      {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
      }
    )
    loadingText.setDepth(1000)
    loadingText.setOrigin(0.5)

    // Lazy load the sprite for this tower type before creating it
    await this.ensureTowerSpriteLoaded(this.selectedTowerType)

    // Remove loading indicator
    loadingText.destroy()

    // Deduct cost
    this.coins -= towerConfig.cost

    // Create tower at grid position
    const worldX = this.gridOffsetX + gridX * this.gridSize + this.gridSize / 2
    const worldY = this.gridOffsetY + gridY * this.gridSize + this.gridSize / 2
    const tower = new Tower(this, worldX, worldY, towerConfig)
    this.towers.push(tower)

    // Mark grid as occupied
    this.placementGrid[gridY][gridX] = false

    // Update UI
    this.updateUI()

    // Clear selection
    this.selectedTowerType = null
    if (this.hoverTile) {
      this.hoverTile.destroy()
      this.hoverTile = null
    }

    if (this.selectedTowerText) {
      this.selectedTowerText.setText('')
      this.selectedTowerText.setVisible(false)
    }

    console.log(`Placed ${towerConfig.name} at (${gridX}, ${gridY})`)
  }

  private startNextWave() {
    if (this.isWaveActive) return

    this.currentWave++
    this.isWaveActive = true
    this.updateUI()

    // Spawn enemies for this wave
    this.spawnWave()
  }

  private spawnWave() {
    console.log(`Spawning wave ${this.currentWave}`)

    const waveEnemies = getWaveEnemies(this.currentWave)
    let totalEnemies = 0
    let enemiesSpawned = 0

    // Count total enemies
    waveEnemies.forEach(group => {
      totalEnemies += group.count
    })

    // Spawn enemies over time
    let spawnDelay = 0
    const spawnInterval = 1000 // milliseconds between spawns (slower = easier to handle)

    waveEnemies.forEach(group => {
      const enemyConfig = getEnemyConfig(group.type)
      if (!enemyConfig) return

      for (let i = 0; i < group.count; i++) {
        this.time.delayedCall(spawnDelay, () => {
          const enemy = new Enemy(this, this.path, enemyConfig)
          this.enemies.add(enemy)
          enemiesSpawned++

          // Check if all enemies spawned
          if (enemiesSpawned >= totalEnemies) {
            this.checkWaveComplete()
          }
        })
        spawnDelay += spawnInterval
      }
    })
  }

  private checkWaveComplete() {
    // Check every second if all enemies are dead
    const checkInterval = this.time.addEvent({
      delay: 1000,
      callback: () => {
        const aliveEnemies = this.enemies.getChildren().filter((e: any) => e.active).length
        if (aliveEnemies === 0) {
          this.isWaveActive = false
          checkInterval.remove()
          console.log(`Wave ${this.currentWave} complete!`)

          // Auto-start next wave if enabled
          if (this.autoStartWaves) {
            this.time.delayedCall(1000, () => {
              this.startNextWave()
            })
          }
        }
      },
      loop: true
    })
  }

  private updateUI() {
    this.livesText.setText(`${this.lives}`)
    this.coinsText.setText(`${this.coins}`)

    const waveDisplay = this.currentWave > 118 ? `Wave: ${this.currentWave} (ENDLESS)` : `Wave: ${this.currentWave}/118`
    this.waveText.setText(waveDisplay)
  }

  private gameOver() {
    console.log('Game Over!')
    this.scene.pause()

    // Call Remix SDK game over with the wave number as score
    if (window.FarcadeSDK?.singlePlayer?.actions?.gameOver) {
      window.FarcadeSDK.singlePlayer.actions.gameOver({ score: this.currentWave })
    } else {
      console.warn('FarcadeSDK not available')
    }
  }

  private createButton(
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    color: number,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y)

    const bg = this.add.rectangle(0, 0, width, height, color)
    bg.setStrokeStyle(3, 0xffffff)

    const buttonText = this.add.text(0, 0, text, {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    })
    buttonText.setOrigin(0.5)

    container.add([bg, buttonText])
    container.setSize(width, height)

    bg.setInteractive({ useHandCursor: true })
      .on('pointerover', () => container.setScale(1.05))
      .on('pointerout', () => container.setScale(1))
      .on('pointerdown', () => container.setScale(0.95))
      .on('pointerup', () => {
        container.setScale(1.05)
        callback()
      })

    return container
  }

  private getMapConfig(mapId: number): MapConfig {
    const { width, height } = this.cameras.main

    const configs: { [key: number]: MapConfig } = {
      // EASY MAP 1: Meadow Spiral - Freeform pixel path following background image
      1: {
        id: 1,
        name: 'Meadow Spiral',
        backgroundColor: 0x7EC850,
        grid: {
          cellSize: 48,    // Grid for tower placement only
          offsetX: 0,      // Start at left edge
          offsetY: 100     // Start below top menu (100px)
        },
        path: [
          new Phaser.Math.Vector2(53, 105),
          new Phaser.Math.Vector2(53, 138),
          new Phaser.Math.Vector2(51, 173),
          new Phaser.Math.Vector2(55, 202),
          new Phaser.Math.Vector2(50, 226),
          new Phaser.Math.Vector2(50, 261),
          new Phaser.Math.Vector2(53, 276),
          new Phaser.Math.Vector2(61, 296),
          new Phaser.Math.Vector2(68, 305),
          new Phaser.Math.Vector2(73, 314),
          new Phaser.Math.Vector2(81, 321),
          new Phaser.Math.Vector2(88, 325),
          new Phaser.Math.Vector2(107, 329),
          new Phaser.Math.Vector2(125, 332),
          new Phaser.Math.Vector2(138, 334),
          new Phaser.Math.Vector2(156, 338),
          new Phaser.Math.Vector2(178, 342),
          new Phaser.Math.Vector2(195, 340),
          new Phaser.Math.Vector2(224, 340),
          new Phaser.Math.Vector2(228, 334),
          new Phaser.Math.Vector2(228, 321),
          new Phaser.Math.Vector2(231, 316),
          new Phaser.Math.Vector2(233, 303),
          new Phaser.Math.Vector2(237, 292),
          new Phaser.Math.Vector2(244, 283),
          new Phaser.Math.Vector2(250, 274),
          new Phaser.Math.Vector2(263, 261),
          new Phaser.Math.Vector2(270, 252),
          new Phaser.Math.Vector2(279, 252),
          new Phaser.Math.Vector2(327, 250),
          new Phaser.Math.Vector2(371, 250),
          new Phaser.Math.Vector2(408, 248),
          new Phaser.Math.Vector2(446, 250),
          new Phaser.Math.Vector2(474, 252),
          new Phaser.Math.Vector2(503, 253),
          new Phaser.Math.Vector2(520, 272),
          new Phaser.Math.Vector2(525, 303),
          new Phaser.Math.Vector2(525, 334),
          new Phaser.Math.Vector2(525, 356),
          new Phaser.Math.Vector2(527, 404),
          new Phaser.Math.Vector2(523, 430),
          new Phaser.Math.Vector2(520, 487),
          new Phaser.Math.Vector2(518, 529),
          new Phaser.Math.Vector2(511, 553),
          new Phaser.Math.Vector2(509, 579),
          new Phaser.Math.Vector2(503, 584),
          new Phaser.Math.Vector2(490, 591),
          new Phaser.Math.Vector2(472, 595),
          new Phaser.Math.Vector2(439, 599),
          new Phaser.Math.Vector2(410, 599),
          new Phaser.Math.Vector2(375, 595),
          new Phaser.Math.Vector2(362, 593),
          new Phaser.Math.Vector2(349, 588),
          new Phaser.Math.Vector2(345, 580),
          new Phaser.Math.Vector2(343, 566),
          new Phaser.Math.Vector2(347, 555),
          new Phaser.Math.Vector2(349, 529),
          new Phaser.Math.Vector2(347, 500),
          new Phaser.Math.Vector2(343, 461),
          new Phaser.Math.Vector2(345, 432),
          new Phaser.Math.Vector2(353, 422),
          new Phaser.Math.Vector2(369, 424),
          new Phaser.Math.Vector2(378, 419),
          new Phaser.Math.Vector2(395, 417),
          new Phaser.Math.Vector2(424, 415),
          new Phaser.Math.Vector2(439, 415),
          new Phaser.Math.Vector2(467, 415),
          new Phaser.Math.Vector2(514, 417),
          new Phaser.Math.Vector2(538, 417),
          new Phaser.Math.Vector2(553, 415),
          new Phaser.Math.Vector2(577, 415),
          new Phaser.Math.Vector2(613, 417),
          new Phaser.Math.Vector2(641, 421),
          new Phaser.Math.Vector2(656, 422),
          new Phaser.Math.Vector2(674, 432),
          new Phaser.Math.Vector2(674, 478),
          new Phaser.Math.Vector2(678, 490),
          new Phaser.Math.Vector2(685, 525),
          new Phaser.Math.Vector2(683, 551),
          new Phaser.Math.Vector2(685, 593),
          new Phaser.Math.Vector2(681, 652),
          new Phaser.Math.Vector2(672, 672),
          new Phaser.Math.Vector2(658, 689),
          new Phaser.Math.Vector2(647, 703),
          new Phaser.Math.Vector2(634, 707),
          new Phaser.Math.Vector2(617, 714),
          new Phaser.Math.Vector2(597, 720),
          new Phaser.Math.Vector2(579, 724),
          new Phaser.Math.Vector2(558, 726),
          new Phaser.Math.Vector2(534, 727),
          new Phaser.Math.Vector2(518, 727),
          new Phaser.Math.Vector2(496, 733),
          new Phaser.Math.Vector2(492, 744),
          new Phaser.Math.Vector2(489, 749),
          new Phaser.Math.Vector2(487, 759),
          new Phaser.Math.Vector2(485, 764),
          new Phaser.Math.Vector2(478, 782)
        ]
      },
      // EASY MAP 2: Jungle - Matches background image path (high waypoint density for smooth curves)
      2: {
        id: 2,
        name: 'Forest Loop',
        backgroundColor: 0x4A7C59,
        grid: {
          cellSize: 48,    // Smaller cells to allow more towers
          offsetX: 24,     // Adjusted for smaller cell size
          offsetY: 100     // Start below top menu (100px)
        },
        path: [
          new Phaser.Math.Vector2(354, 105),
          new Phaser.Math.Vector2(349, 132),
          new Phaser.Math.Vector2(342, 174),
          new Phaser.Math.Vector2(329, 198),
          new Phaser.Math.Vector2(303, 217),
          new Phaser.Math.Vector2(287, 224),
          new Phaser.Math.Vector2(263, 230),
          new Phaser.Math.Vector2(242, 235),
          new Phaser.Math.Vector2(202, 241),
          new Phaser.Math.Vector2(182, 252),
          new Phaser.Math.Vector2(151, 266),
          new Phaser.Math.Vector2(143, 283),
          new Phaser.Math.Vector2(145, 301),
          new Phaser.Math.Vector2(152, 323),
          new Phaser.Math.Vector2(160, 338),
          new Phaser.Math.Vector2(167, 349),
          new Phaser.Math.Vector2(178, 353),
          new Phaser.Math.Vector2(191, 358),
          new Phaser.Math.Vector2(222, 373),
          new Phaser.Math.Vector2(261, 380),
          new Phaser.Math.Vector2(276, 384),
          new Phaser.Math.Vector2(303, 384),
          new Phaser.Math.Vector2(323, 388),
          new Phaser.Math.Vector2(353, 393),
          new Phaser.Math.Vector2(380, 393),
          new Phaser.Math.Vector2(410, 393),
          new Phaser.Math.Vector2(446, 397),
          new Phaser.Math.Vector2(492, 406),
          new Phaser.Math.Vector2(531, 428),
          new Phaser.Math.Vector2(547, 437),
          new Phaser.Math.Vector2(558, 461),
          new Phaser.Math.Vector2(560, 498),
          new Phaser.Math.Vector2(551, 516),
          new Phaser.Math.Vector2(512, 520),
          new Phaser.Math.Vector2(498, 525),
          new Phaser.Math.Vector2(489, 534),
          new Phaser.Math.Vector2(463, 538),
          new Phaser.Math.Vector2(446, 540),
          new Phaser.Math.Vector2(435, 544),
          new Phaser.Math.Vector2(419, 547),
          new Phaser.Math.Vector2(373, 542),
          new Phaser.Math.Vector2(347, 534),
          new Phaser.Math.Vector2(318, 531),
          new Phaser.Math.Vector2(303, 523),
          new Phaser.Math.Vector2(285, 522),
          new Phaser.Math.Vector2(263, 516),
          new Phaser.Math.Vector2(239, 507),
          new Phaser.Math.Vector2(213, 503),
          new Phaser.Math.Vector2(189, 505),
          new Phaser.Math.Vector2(162, 512),
          new Phaser.Math.Vector2(140, 525),
          new Phaser.Math.Vector2(141, 540),
          new Phaser.Math.Vector2(145, 553),
          new Phaser.Math.Vector2(154, 571),
          new Phaser.Math.Vector2(167, 580),
          new Phaser.Math.Vector2(174, 591),
          new Phaser.Math.Vector2(204, 612),
          new Phaser.Math.Vector2(235, 626),
          new Phaser.Math.Vector2(257, 637),
          new Phaser.Math.Vector2(285, 652),
          new Phaser.Math.Vector2(310, 672),
          new Phaser.Math.Vector2(340, 707),
          new Phaser.Math.Vector2(345, 738),
          new Phaser.Math.Vector2(349, 771),
          new Phaser.Math.Vector2(351, 788)
        ]
      },
      // MEDIUM MAP 1: Desert Winds - Freeform pixel path
      3: {
        id: 3,
        name: 'Desert Winds',
        backgroundColor: 0xE0AC69,
        grid: {
          cellSize: 40,    // Even smaller cells for desert map
          offsetX: 0,      // Edge-to-edge (path starts at left edge)
          offsetY: 100     // Start below top menu (100px)
        },
        path: [
          new Phaser.Math.Vector2(354, 781),
          new Phaser.Math.Vector2(356, 766),
          new Phaser.Math.Vector2(354, 678),
          new Phaser.Math.Vector2(354, 643),
          new Phaser.Math.Vector2(356, 610),
          new Phaser.Math.Vector2(367, 597),
          new Phaser.Math.Vector2(391, 591),
          new Phaser.Math.Vector2(422, 588),
          new Phaser.Math.Vector2(448, 588),
          new Phaser.Math.Vector2(487, 590),
          new Phaser.Math.Vector2(523, 588),
          new Phaser.Math.Vector2(564, 588),
          new Phaser.Math.Vector2(582, 590),
          new Phaser.Math.Vector2(612, 579),
          new Phaser.Math.Vector2(608, 542),
          new Phaser.Math.Vector2(610, 533),
          new Phaser.Math.Vector2(612, 505),
          new Phaser.Math.Vector2(610, 478),
          new Phaser.Math.Vector2(608, 457),
          new Phaser.Math.Vector2(602, 422),
          new Phaser.Math.Vector2(591, 413),
          new Phaser.Math.Vector2(579, 402),
          new Phaser.Math.Vector2(571, 402),
          new Phaser.Math.Vector2(549, 402),
          new Phaser.Math.Vector2(520, 402),
          new Phaser.Math.Vector2(500, 402),
          new Phaser.Math.Vector2(481, 402),
          new Phaser.Math.Vector2(476, 400),
          new Phaser.Math.Vector2(472, 395),
          new Phaser.Math.Vector2(474, 375),
          new Phaser.Math.Vector2(474, 358),
          new Phaser.Math.Vector2(468, 343),
          new Phaser.Math.Vector2(465, 329),
          new Phaser.Math.Vector2(426, 321),
          new Phaser.Math.Vector2(389, 318),
          new Phaser.Math.Vector2(360, 318),
          new Phaser.Math.Vector2(320, 316),
          new Phaser.Math.Vector2(298, 312),
          new Phaser.Math.Vector2(296, 294),
          new Phaser.Math.Vector2(298, 281),
          new Phaser.Math.Vector2(296, 261),
          new Phaser.Math.Vector2(290, 241),
          new Phaser.Math.Vector2(279, 224),
          new Phaser.Math.Vector2(250, 222),
          new Phaser.Math.Vector2(217, 222),
          new Phaser.Math.Vector2(180, 222),
          new Phaser.Math.Vector2(154, 224),
          new Phaser.Math.Vector2(136, 231),
          new Phaser.Math.Vector2(134, 253),
          new Phaser.Math.Vector2(136, 281),
          new Phaser.Math.Vector2(136, 303),
          new Phaser.Math.Vector2(136, 316),
          new Phaser.Math.Vector2(136, 329),
          new Phaser.Math.Vector2(136, 345),
          new Phaser.Math.Vector2(134, 364),
          new Phaser.Math.Vector2(125, 364),
          new Phaser.Math.Vector2(97, 366),
          new Phaser.Math.Vector2(73, 364),
          new Phaser.Math.Vector2(37, 362),
          new Phaser.Math.Vector2(9, 362)
        ]
      },
      // MEDIUM MAP 2: Mountain Zigzag - Freeform pixel path
      4: {
        id: 4,
        name: 'Mountain Zigzag',
        backgroundColor: 0x8B7355,
        grid: {
          cellSize: 48,    // Smaller cells to allow more towers
          offsetX: 0,      // Edge-to-edge
          offsetY: 100     // Start below top menu (100px)
        },
        path: [
          new Phaser.Math.Vector2(4, 364),
          new Phaser.Math.Vector2(17, 362),
          new Phaser.Math.Vector2(39, 362),
          new Phaser.Math.Vector2(62, 364),
          new Phaser.Math.Vector2(86, 364),
          new Phaser.Math.Vector2(123, 364),
          new Phaser.Math.Vector2(184, 364),
          new Phaser.Math.Vector2(244, 360),
          new Phaser.Math.Vector2(285, 362),
          new Phaser.Math.Vector2(342, 360),
          new Phaser.Math.Vector2(364, 345),
          new Phaser.Math.Vector2(377, 314),
          new Phaser.Math.Vector2(377, 288),
          new Phaser.Math.Vector2(373, 270),
          new Phaser.Math.Vector2(373, 250),
          new Phaser.Math.Vector2(366, 233),
          new Phaser.Math.Vector2(345, 230),
          new Phaser.Math.Vector2(329, 226),
          new Phaser.Math.Vector2(301, 226),
          new Phaser.Math.Vector2(274, 226),
          new Phaser.Math.Vector2(248, 230),
          new Phaser.Math.Vector2(222, 230),
          new Phaser.Math.Vector2(211, 244),
          new Phaser.Math.Vector2(211, 272),
          new Phaser.Math.Vector2(209, 316),
          new Phaser.Math.Vector2(209, 366),
          new Phaser.Math.Vector2(215, 410),
          new Phaser.Math.Vector2(213, 457),
          new Phaser.Math.Vector2(215, 489),
          new Phaser.Math.Vector2(211, 520),
          new Phaser.Math.Vector2(211, 553),
          new Phaser.Math.Vector2(202, 566),
          new Phaser.Math.Vector2(184, 571),
          new Phaser.Math.Vector2(165, 579),
          new Phaser.Math.Vector2(140, 579),
          new Phaser.Math.Vector2(119, 579),
          new Phaser.Math.Vector2(108, 569),
          new Phaser.Math.Vector2(99, 546),
          new Phaser.Math.Vector2(94, 533),
          new Phaser.Math.Vector2(90, 520),
          new Phaser.Math.Vector2(88, 478),
          new Phaser.Math.Vector2(92, 461),
          new Phaser.Math.Vector2(108, 457),
          new Phaser.Math.Vector2(140, 454),
          new Phaser.Math.Vector2(165, 456),
          new Phaser.Math.Vector2(191, 456),
          new Phaser.Math.Vector2(230, 457),
          new Phaser.Math.Vector2(285, 463),
          new Phaser.Math.Vector2(323, 463),
          new Phaser.Math.Vector2(367, 461),
          new Phaser.Math.Vector2(430, 456),
          new Phaser.Math.Vector2(457, 446),
          new Phaser.Math.Vector2(487, 433),
          new Phaser.Math.Vector2(500, 408),
          new Phaser.Math.Vector2(500, 375),
          new Phaser.Math.Vector2(507, 334),
          new Phaser.Math.Vector2(518, 310),
          new Phaser.Math.Vector2(547, 307),
          new Phaser.Math.Vector2(579, 309),
          new Phaser.Math.Vector2(606, 327),
          new Phaser.Math.Vector2(606, 345),
          new Phaser.Math.Vector2(601, 386),
          new Phaser.Math.Vector2(610, 444),
          new Phaser.Math.Vector2(610, 468),
          new Phaser.Math.Vector2(599, 479),
          new Phaser.Math.Vector2(593, 503),
          new Phaser.Math.Vector2(582, 529),
          new Phaser.Math.Vector2(568, 534),
          new Phaser.Math.Vector2(553, 538),
          new Phaser.Math.Vector2(527, 547),
          new Phaser.Math.Vector2(512, 547),
          new Phaser.Math.Vector2(483, 547),
          new Phaser.Math.Vector2(448, 546),
          new Phaser.Math.Vector2(397, 546),
          new Phaser.Math.Vector2(371, 546),
          new Phaser.Math.Vector2(338, 544),
          new Phaser.Math.Vector2(325, 555),
          new Phaser.Math.Vector2(323, 569),
          new Phaser.Math.Vector2(323, 586),
          new Phaser.Math.Vector2(318, 606),
          new Phaser.Math.Vector2(316, 648),
          new Phaser.Math.Vector2(318, 692),
          new Phaser.Math.Vector2(318, 724),
          new Phaser.Math.Vector2(318, 749),
          new Phaser.Math.Vector2(318, 773),
          new Phaser.Math.Vector2(316, 784)
        ]
      },
      // HARD MAP 1: Volcanic Rush - Freeform pixel path
      5: {
        id: 5,
        name: 'Volcanic Rush',
        backgroundColor: 0x5C2E2E,
        grid: {
          cellSize: 40,    // Even smaller cells for lava map
          offsetX: 0,      // Edge-to-edge
          offsetY: 120     // Start a bit lower (120px below top)
        },
        path: [
          new Phaser.Math.Vector2(6, 527),
          new Phaser.Math.Vector2(84, 527),
          new Phaser.Math.Vector2(169, 529),
          new Phaser.Math.Vector2(220, 523),
          new Phaser.Math.Vector2(266, 525),
          new Phaser.Math.Vector2(310, 527),
          new Phaser.Math.Vector2(323, 533),
          new Phaser.Math.Vector2(338, 540),
          new Phaser.Math.Vector2(336, 562),
          new Phaser.Math.Vector2(336, 601),
          new Phaser.Math.Vector2(336, 634),
          new Phaser.Math.Vector2(342, 645),
          new Phaser.Math.Vector2(367, 645),
          new Phaser.Math.Vector2(389, 645),
          new Phaser.Math.Vector2(411, 643),
          new Phaser.Math.Vector2(435, 643),
          new Phaser.Math.Vector2(468, 643),
          new Phaser.Math.Vector2(522, 641),
          new Phaser.Math.Vector2(564, 645),
          new Phaser.Math.Vector2(617, 647),
          new Phaser.Math.Vector2(641, 641),
          new Phaser.Math.Vector2(656, 626),
          new Phaser.Math.Vector2(652, 560),
          new Phaser.Math.Vector2(650, 487),
          new Phaser.Math.Vector2(658, 415),
          new Phaser.Math.Vector2(652, 397),
          new Phaser.Math.Vector2(639, 391),
          new Phaser.Math.Vector2(623, 389),
          new Phaser.Math.Vector2(608, 386),
          new Phaser.Math.Vector2(588, 382),
          new Phaser.Math.Vector2(568, 382),
          new Phaser.Math.Vector2(546, 384),
          new Phaser.Math.Vector2(538, 397),
          new Phaser.Math.Vector2(540, 432),
          new Phaser.Math.Vector2(542, 512),
          new Phaser.Math.Vector2(540, 536),
          new Phaser.Math.Vector2(522, 547),
          new Phaser.Math.Vector2(500, 547),
          new Phaser.Math.Vector2(472, 547),
          new Phaser.Math.Vector2(454, 538),
          new Phaser.Math.Vector2(448, 512),
          new Phaser.Math.Vector2(446, 457),
          new Phaser.Math.Vector2(448, 386),
          new Phaser.Math.Vector2(452, 343),
          new Phaser.Math.Vector2(448, 321),
          new Phaser.Math.Vector2(441, 303),
          new Phaser.Math.Vector2(424, 296),
          new Phaser.Math.Vector2(391, 298),
          new Phaser.Math.Vector2(366, 299),
          new Phaser.Math.Vector2(349, 301),
          new Phaser.Math.Vector2(354, 323),
          new Phaser.Math.Vector2(358, 351),
          new Phaser.Math.Vector2(356, 375),
          new Phaser.Math.Vector2(351, 406),
          new Phaser.Math.Vector2(351, 426),
          new Phaser.Math.Vector2(338, 426),
          new Phaser.Math.Vector2(329, 424),
          new Phaser.Math.Vector2(320, 426),
          new Phaser.Math.Vector2(296, 430),
          new Phaser.Math.Vector2(283, 417),
          new Phaser.Math.Vector2(279, 399),
          new Phaser.Math.Vector2(279, 375),
          new Phaser.Math.Vector2(277, 349),
          new Phaser.Math.Vector2(276, 327),
          new Phaser.Math.Vector2(277, 321),
          new Phaser.Math.Vector2(279, 312),
          new Phaser.Math.Vector2(272, 296),
          new Phaser.Math.Vector2(252, 294),
          new Phaser.Math.Vector2(224, 296),
          new Phaser.Math.Vector2(200, 298),
          new Phaser.Math.Vector2(187, 305),
          new Phaser.Math.Vector2(189, 320),
          new Phaser.Math.Vector2(193, 338),
          new Phaser.Math.Vector2(193, 358),
          new Phaser.Math.Vector2(189, 377),
          new Phaser.Math.Vector2(182, 393),
          new Phaser.Math.Vector2(182, 404),
          new Phaser.Math.Vector2(180, 415),
          new Phaser.Math.Vector2(167, 419),
          new Phaser.Math.Vector2(162, 421),
          new Phaser.Math.Vector2(149, 424),
          new Phaser.Math.Vector2(136, 424),
          new Phaser.Math.Vector2(119, 426),
          new Phaser.Math.Vector2(108, 422),
          new Phaser.Math.Vector2(99, 413),
          new Phaser.Math.Vector2(90, 375),
          new Phaser.Math.Vector2(90, 351),
          new Phaser.Math.Vector2(94, 314),
          new Phaser.Math.Vector2(94, 292),
          new Phaser.Math.Vector2(94, 261),
          new Phaser.Math.Vector2(94, 246),
          new Phaser.Math.Vector2(96, 228),
          new Phaser.Math.Vector2(99, 202),
          new Phaser.Math.Vector2(99, 193),
          new Phaser.Math.Vector2(99, 182),
          new Phaser.Math.Vector2(112, 171),
          new Phaser.Math.Vector2(130, 171),
          new Phaser.Math.Vector2(160, 171),
          new Phaser.Math.Vector2(178, 169),
          new Phaser.Math.Vector2(209, 165),
          new Phaser.Math.Vector2(231, 165),
          new Phaser.Math.Vector2(261, 163),
          new Phaser.Math.Vector2(279, 163),
          new Phaser.Math.Vector2(314, 163),
          new Phaser.Math.Vector2(329, 162),
          new Phaser.Math.Vector2(354, 162),
          new Phaser.Math.Vector2(388, 163),
          new Phaser.Math.Vector2(410, 165),
          new Phaser.Math.Vector2(430, 165),
          new Phaser.Math.Vector2(454, 165),
          new Phaser.Math.Vector2(481, 167),
          new Phaser.Math.Vector2(501, 167),
          new Phaser.Math.Vector2(531, 171),
          new Phaser.Math.Vector2(542, 186),
          new Phaser.Math.Vector2(547, 206),
          new Phaser.Math.Vector2(544, 226),
          new Phaser.Math.Vector2(542, 241),
          new Phaser.Math.Vector2(551, 270),
          new Phaser.Math.Vector2(564, 268),
          new Phaser.Math.Vector2(595, 270),
          new Phaser.Math.Vector2(621, 270),
          new Phaser.Math.Vector2(636, 268),
          new Phaser.Math.Vector2(643, 252),
          new Phaser.Math.Vector2(647, 224),
          new Phaser.Math.Vector2(647, 193),
          new Phaser.Math.Vector2(647, 154),
          new Phaser.Math.Vector2(658, 129),
          new Phaser.Math.Vector2(652, 110),
          new Phaser.Math.Vector2(648, 103)
        ]
      },
      // HARD MAP 2: Ice Highway - Freeform pixel path
      6: {
        id: 6,
        name: 'Ice Highway',
        backgroundColor: 0x5E7C8C,
        grid: {
          cellSize: 60,    // Larger cells for ice level
          offsetX: 0,      // Edge-to-edge
          offsetY: 100     // Start below top menu (100px)
        },
        path: [
          new Phaser.Math.Vector2(2, 435),
          new Phaser.Math.Vector2(17, 435),
          new Phaser.Math.Vector2(48, 433),
          new Phaser.Math.Vector2(79, 433),
          new Phaser.Math.Vector2(108, 432),
          new Phaser.Math.Vector2(125, 424),
          new Phaser.Math.Vector2(132, 413),
          new Phaser.Math.Vector2(138, 393),
          new Phaser.Math.Vector2(138, 364),
          new Phaser.Math.Vector2(136, 347),
          new Phaser.Math.Vector2(138, 292),
          new Phaser.Math.Vector2(140, 272),
          new Phaser.Math.Vector2(156, 253),
          new Phaser.Math.Vector2(195, 248),
          new Phaser.Math.Vector2(230, 248),
          new Phaser.Math.Vector2(263, 250),
          new Phaser.Math.Vector2(296, 253),
          new Phaser.Math.Vector2(314, 270),
          new Phaser.Math.Vector2(316, 299),
          new Phaser.Math.Vector2(316, 338),
          new Phaser.Math.Vector2(323, 391),
          new Phaser.Math.Vector2(321, 432),
          new Phaser.Math.Vector2(323, 454),
          new Phaser.Math.Vector2(320, 505),
          new Phaser.Math.Vector2(321, 533),
          new Phaser.Math.Vector2(325, 573),
          new Phaser.Math.Vector2(318, 595),
          new Phaser.Math.Vector2(299, 610),
          new Phaser.Math.Vector2(281, 612),
          new Phaser.Math.Vector2(263, 613),
          new Phaser.Math.Vector2(182, 612),
          new Phaser.Math.Vector2(147, 613),
          new Phaser.Math.Vector2(112, 612),
          new Phaser.Math.Vector2(94, 615),
          new Phaser.Math.Vector2(77, 647),
          new Phaser.Math.Vector2(77, 674),
          new Phaser.Math.Vector2(75, 700),
          new Phaser.Math.Vector2(84, 718),
          new Phaser.Math.Vector2(125, 718),
          new Phaser.Math.Vector2(160, 716),
          new Phaser.Math.Vector2(209, 718),
          new Phaser.Math.Vector2(259, 718),
          new Phaser.Math.Vector2(294, 716),
          new Phaser.Math.Vector2(382, 718),
          new Phaser.Math.Vector2(439, 714),
          new Phaser.Math.Vector2(507, 713),
          new Phaser.Math.Vector2(551, 714),
          new Phaser.Math.Vector2(579, 714),
          new Phaser.Math.Vector2(613, 713),
          new Phaser.Math.Vector2(637, 709),
          new Phaser.Math.Vector2(647, 681),
          new Phaser.Math.Vector2(647, 645),
          new Phaser.Math.Vector2(647, 610),
          new Phaser.Math.Vector2(641, 579),
          new Phaser.Math.Vector2(641, 547),
          new Phaser.Math.Vector2(623, 531),
          new Phaser.Math.Vector2(591, 531),
          new Phaser.Math.Vector2(551, 533),
          new Phaser.Math.Vector2(501, 533),
          new Phaser.Math.Vector2(470, 531),
          new Phaser.Math.Vector2(468, 507),
          new Phaser.Math.Vector2(474, 443),
          new Phaser.Math.Vector2(470, 386),
          new Phaser.Math.Vector2(476, 375),
          new Phaser.Math.Vector2(511, 373),
          new Phaser.Math.Vector2(546, 373),
          new Phaser.Math.Vector2(582, 369),
          new Phaser.Math.Vector2(628, 364),
          new Phaser.Math.Vector2(650, 347),
          new Phaser.Math.Vector2(650, 318),
          new Phaser.Math.Vector2(650, 283),
          new Phaser.Math.Vector2(650, 248),
          new Phaser.Math.Vector2(647, 224),
          new Phaser.Math.Vector2(645, 191),
          new Phaser.Math.Vector2(637, 186),
          new Phaser.Math.Vector2(617, 176),
          new Phaser.Math.Vector2(597, 174),
          new Phaser.Math.Vector2(569, 174),
          new Phaser.Math.Vector2(531, 173),
          new Phaser.Math.Vector2(498, 174),
          new Phaser.Math.Vector2(459, 178),
          new Phaser.Math.Vector2(441, 178),
          new Phaser.Math.Vector2(419, 180),
          new Phaser.Math.Vector2(397, 182),
          new Phaser.Math.Vector2(397, 152),
          new Phaser.Math.Vector2(400, 130),
          new Phaser.Math.Vector2(393, 108),
          new Phaser.Math.Vector2(395, 103)
        ]
      }
    }

    return configs[mapId] || configs[1]
  }

  private toggleSpeed() {
    // Cycle through 1x, 2x, and 3x speed
    if (this.gameSpeed === 1) {
      this.gameSpeed = 2
      this.speedButtonImage.setTexture('2x-button')
      this.physics.world.timeScale = 1 // Physics runs at normal speed
      this.time.timeScale = 2 // Time events run at 2x
    } else if (this.gameSpeed === 2) {
      this.gameSpeed = 3
      this.speedButtonImage.setTexture('3x-button')
      this.physics.world.timeScale = 1
      this.time.timeScale = 3 // Time events run at 3x
    } else {
      this.gameSpeed = 1
      this.speedButtonImage.setTexture('1x-button')
      this.physics.world.timeScale = 1
      this.time.timeScale = 1
    }
  }

  private toggleAutoStart() {
    // Toggle auto-start waves on/off
    this.autoStartWaves = !this.autoStartWaves
    this.autoStartButtonImage.setTexture(this.autoStartWaves ? 'auto-on-button' : 'auto-off-button')
    console.log(`Auto-start waves: ${this.autoStartWaves ? 'ON' : 'OFF'}`)
  }

  private createTowerSpriteIcon(type: number, x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y)

    // Get sprite configuration
    const spriteConfigs: Record<number, any> = {
      1: SPRITE_CONFIGS.FOCUSED_FALCON,
      2: SPRITE_CONFIGS.AMBITIOUS_ANGEL,
      3: SPRITE_CONFIGS.MOTIVATED_MONSTER,
      4: SPRITE_CONFIGS.THOUGHTFUL_HARPIK,
      5: SPRITE_CONFIGS.EMPATHY_ELEPHANT,
      6: SPRITE_CONFIGS.ADAPTABLE_ALIEN,
      7: SPRITE_CONFIGS.FEARLESS_FAIRY,
      8: SPRITE_CONFIGS.NOTORIOUS_NINJA,
      9: SPRITE_CONFIGS.FLEX_N_FOX,
      10: SPRITE_CONFIGS.DRIVEN_DRAGON,
      11: SPRITE_CONFIGS.BALANCED_BEETLE,
      12: SPRITE_CONFIGS.ADVENTUROUS_ASTRONAUT,
      13: SPRITE_CONFIGS.CREATIVE_CRAB,
      14: SPRITE_CONFIGS.COMPETITIVE_CLOWN,
      15: SPRITE_CONFIGS.CYNICAL_CAT,
      16: SPRITE_CONFIGS.RARE_ROBOT
    }

    const config = spriteConfigs[type]
    if (config) {
      // Check if the texture exists before trying to use it
      if (!this.textures.exists(config.key)) {
        console.warn(`Texture ${config.key} not loaded, using fallback icon`)
        return this.createTowerIcon(type, x, y)
      }

      try {
        // Per-tower offsets to center the actual character body (not the transparent sprite bounds)
        // These offsets compensate for transparent space in sprite sheets
        const bodyOffsets: Record<number, { x: number; y: number }> = {
          1: { x: 22, y: -21 },    // Focused Falcon
          2: { x: 10, y: -10 },   // Ambitious Angel
          3: { x: 5, y: -18 },     // Motivated Monster
          4: { x: 12, y: -5 },     // Thoughtful Harpik
          5: { x: -7, y: -5 },     // Empathy Elephant
          6: { x: 12, y: -10 },    // Adaptable Alien
          7: { x: -5, y: -5 },     // Fearless Fairy
          8: { x: 5, y: 0 },     // Notorious Ninja
          9: { x: 0, y: -15 },     // Flex N' Fox
          10: { x: -5, y: 0 },    // Driven Dragon
          11: { x: 0, y: -15 },    // Balanced Beetle
          12: { x: 0, y: -10 },   // Adventurous Astronaut
          13: { x: 18, y: -5 },    // Creative Crab
          14: { x: 15, y: -15 },    // Competitive Clown
          15: { x: 5, y: -5 },    // Cynical Cat
          16: { x: 0, y: -5 }    // Rare Robot
        }

        const offset = bodyOffsets[type] || { x: 0, y: 0 }

        // Create sprite showing first frame (frame 0)
        const sprite = this.add.sprite(offset.x, offset.y, config.key, 0)
        sprite.setOrigin(0.5, 0.5) // Center the sprite
        sprite.setScale(0.25) // Tower selection display scale
        sprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST)
        container.add(sprite)
      } catch (error) {
        console.error(`Error creating sprite icon for tower ${type}:`, error)
        return this.createTowerIcon(type, x, y)
      }
    } else {
      // Fallback to old icon if no sprite config
      return this.createTowerIcon(type, x, y)
    }

    return container
  }

  private createTowerIcon(type: number, x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y)
    const scale = 2.5 // Icon base scale

    switch (type) {
      case 1: // Focused Falcon
        {
          const body = this.add.ellipse(0, 0, 12 * scale, 16 * scale, 0xFFD700)
          const beak = this.add.triangle(14 * scale, 0, 0, -4 * scale, 8 * scale, 0, 0, 4 * scale, 0xFFA500)
          const wingL = this.add.ellipse(-8 * scale, 0, 8 * scale, 12 * scale, 0xFFC107)
          wingL.setRotation(-0.3)
          const wingR = this.add.ellipse(8 * scale, 0, 8 * scale, 12 * scale, 0xFFC107)
          wingR.setRotation(0.3)
          container.add([wingL, wingR, body, beak])
        }
        break

      case 2: // Ambitious Angel
        {
          const body = this.add.circle(0, 0, 10 * scale, 0xFFFFFF)
          const halo = this.add.ellipse(0, -18 * scale, 14 * scale, 4 * scale, 0xFFD700)
          const wingL = this.add.star(-12 * scale, 0, 4, 6 * scale, 12 * scale, 0xFFFFFF)
          const wingR = this.add.star(12 * scale, 0, 4, 6 * scale, 12 * scale, 0xFFFFFF)
          container.add([wingL, wingR, body, halo])
        }
        break

      case 3: // Motivated Monster
        {
          const body = this.add.ellipse(0, 2 * scale, 16 * scale, 20 * scale, 0x4CAF50)
          const hornL = this.add.triangle(-8 * scale, -10 * scale, -2 * scale, 0, 0, -10 * scale, -4 * scale, 0, 0x2E7D32)
          const hornR = this.add.triangle(8 * scale, -10 * scale, 2 * scale, 0, 0, -10 * scale, 4 * scale, 0, 0x2E7D32)
          const eyeL = this.add.circle(-4 * scale, -2 * scale, 2 * scale, 0xFF0000)
          const eyeR = this.add.circle(4 * scale, -2 * scale, 2 * scale, 0xFF0000)
          container.add([body, hornL, hornR, eyeL, eyeR])
        }
        break

      case 4: // Dialed In Dog
        {
          const body = this.add.ellipse(0, 2 * scale, 14 * scale, 18 * scale, 0xA0826D)
          const earL = this.add.ellipse(-10 * scale, -6 * scale, 8 * scale, 12 * scale, 0x8B6F47)
          const earR = this.add.ellipse(10 * scale, -6 * scale, 8 * scale, 12 * scale, 0x8B6F47)
          const snout = this.add.ellipse(0, 8 * scale, 8 * scale, 6 * scale, 0xC8A882)
          const nose = this.add.circle(0, 8 * scale, 2 * scale, 0x000000)
          container.add([earL, earR, body, snout, nose])
        }
        break

      case 5: // Empathy Elephant
        {
          const body = this.add.ellipse(0, 0, 18 * scale, 20 * scale, 0x90A4AE)
          const earL = this.add.ellipse(-14 * scale, -2 * scale, 12 * scale, 16 * scale, 0x78909C)
          const earR = this.add.ellipse(14 * scale, -2 * scale, 12 * scale, 16 * scale, 0x78909C)
          const trunk = this.add.rectangle(0, 16 * scale, 6 * scale, 16 * scale, 0x90A4AE)
          trunk.setRotation(0.2)
          container.add([earL, earR, body, trunk])
        }
        break

      case 6: // Adaptable Alien
        {
          const head = this.add.ellipse(0, 0, 16 * scale, 20 * scale, 0x9C27B0)
          const eyeL = this.add.ellipse(-4 * scale, 0, 6 * scale, 8 * scale, 0x000000)
          const eyeR = this.add.ellipse(4 * scale, 0, 6 * scale, 8 * scale, 0x000000)
          const pupilL = this.add.circle(-4 * scale, 0, 2 * scale, 0x00FF00)
          const pupilR = this.add.circle(4 * scale, 0, 2 * scale, 0x00FF00)
          const antennaL = this.add.rectangle(-6 * scale, -14 * scale, 2 * scale, 8 * scale, 0x7B1FA2)
          const antennaR = this.add.rectangle(6 * scale, -14 * scale, 2 * scale, 8 * scale, 0x7B1FA2)
          const ballL = this.add.circle(-6 * scale, -18 * scale, 3 * scale, 0xE1BEE7)
          const ballR = this.add.circle(6 * scale, -18 * scale, 3 * scale, 0xE1BEE7)
          container.add([head, antennaL, antennaR, ballL, ballR, eyeL, eyeR, pupilL, pupilR])
        }
        break

      case 7: // Fearless Fairy
        {
          const body = this.add.circle(0, 0, 8 * scale, 0xFFB6C1)
          const wingL = this.add.ellipse(-10 * scale, 0, 10 * scale, 14 * scale, 0xFFE4E1, 0.6)
          const wingR = this.add.ellipse(10 * scale, 0, 10 * scale, 14 * scale, 0xFFE4E1, 0.6)
          const wand = this.add.rectangle(12 * scale, -8 * scale, 2 * scale, 12 * scale, 0xFFD700)
          wand.setRotation(0.4)
          const star = this.add.star(16 * scale, -14 * scale, 4, 2 * scale, 4 * scale, 0xFFFF00)
          container.add([wingL, wingR, body, wand, star])
        }
        break

      case 8: // Notorious Ninja
        {
          const body = this.add.circle(0, 0, 14 * scale, 0xFFFFFF)
          const earL = this.add.circle(-10 * scale, -10 * scale, 5 * scale, 0x000000)
          const earR = this.add.circle(10 * scale, -10 * scale, 5 * scale, 0x000000)
          const eyePatchL = this.add.ellipse(-5 * scale, -2 * scale, 6 * scale, 8 * scale, 0x000000)
          const eyePatchR = this.add.ellipse(5 * scale, -2 * scale, 6 * scale, 8 * scale, 0x000000)
          const belly = this.add.ellipse(0, 6 * scale, 10 * scale, 8 * scale, 0x4DD0E1)
          container.add([body, earL, earR, eyePatchL, eyePatchR, belly])
        }
        break

      case 9: // Brave Bison
        {
          const body = this.add.ellipse(0, 0, 18 * scale, 16 * scale, 0x8B4513)
          const mane = this.add.circle(-8 * scale, -6 * scale, 10 * scale, 0x654321)
          const hornL = this.add.arc(-8 * scale, -10 * scale, 6 * scale, 0, Math.PI, false, 0x000000)
          const hornR = this.add.arc(8 * scale, -10 * scale, 6 * scale, 0, Math.PI, false, 0x000000)
          container.add([mane, body, hornL, hornR])
        }
        break

      case 10: // Driven Dragon
        {
          const body = this.add.ellipse(0, 0, 14 * scale, 18 * scale, 0x607D8B)
          const wingL = this.add.triangle(-14 * scale, -4 * scale, 0, -8 * scale, -8 * scale, 0, -2 * scale, -6 * scale, 0x455A64)
          const wingR = this.add.triangle(14 * scale, -4 * scale, 0, -8 * scale, 8 * scale, 0, 2 * scale, -6 * scale, 0x455A64)
          const head = this.add.ellipse(0, -12 * scale, 10 * scale, 8 * scale, 0x607D8B)
          const snout = this.add.rectangle(8 * scale, -12 * scale, 6 * scale, 4 * scale, 0x78909C)
          const flame = this.add.circle(14 * scale, -12 * scale, 3 * scale, 0xFF4500, 0.7)
          container.add([wingL, wingR, body, head, snout, flame])
        }
        break

      case 11: // Balanced Beetle
        {
          const shell = this.add.ellipse(0, 0, 16 * scale, 20 * scale, 0x4CAF50)
          const pattern = this.add.ellipse(0, 0, 10 * scale, 14 * scale, 0x2E7D32)
          const head = this.add.circle(0, -14 * scale, 6 * scale, 0x1B5E20)
          const antennaL = this.add.rectangle(-3 * scale, -18 * scale, 1 * scale, 6 * scale, 0x000000)
          const antennaR = this.add.rectangle(3 * scale, -18 * scale, 1 * scale, 6 * scale, 0x000000)
          container.add([shell, pattern, head, antennaL, antennaR])
        }
        break

      case 12: // Adventurous Astronaut
        {
          const suit = this.add.ellipse(0, 4 * scale, 14 * scale, 18 * scale, 0x9C27B0)
          const helmet = this.add.circle(0, -8 * scale, 10 * scale, 0x00BCD4, 0.6)
          const visor = this.add.ellipse(0, -8 * scale, 8 * scale, 6 * scale, 0x80DEEA, 0.5)
          const face = this.add.circle(0, -8 * scale, 4 * scale, 0xFFDBAC)
          const backpack = this.add.rectangle(0, 10 * scale, 10 * scale, 8 * scale, 0x7B1FA2)
          container.add([suit, backpack, helmet, visor, face])
        }
        break

      case 13: // Creative Crab
        {
          const body = this.add.ellipse(0, 0, 16 * scale, 12 * scale, 0xD84315)
          const eyeL = this.add.rectangle(-6 * scale, -10 * scale, 2 * scale, 8 * scale, 0xE64A19)
          const eyeR = this.add.rectangle(6 * scale, -10 * scale, 2 * scale, 8 * scale, 0xE64A19)
          const eyeballL = this.add.circle(-6 * scale, -12 * scale, 2 * scale, 0x000000)
          const eyeballR = this.add.circle(6 * scale, -12 * scale, 2 * scale, 0x000000)
          const clawL = this.add.ellipse(-14 * scale, 0, 6 * scale, 8 * scale, 0xFF5722)
          const clawR = this.add.ellipse(14 * scale, 0, 6 * scale, 8 * scale, 0xFF5722)
          container.add([body, eyeL, eyeR, eyeballL, eyeballR, clawL, clawR])
        }
        break

      case 14: // Competitive Clown
        {
          const body = this.add.circle(0, 2 * scale, 12 * scale, 0xFFEB3B)
          const hat = this.add.rectangle(0, -14 * scale, 14 * scale, 10 * scale, 0xFF5722)
          const pompom = this.add.circle(0, -18 * scale, 4 * scale, 0xFFD700)
          const nose = this.add.circle(0, 2 * scale, 3 * scale, 0xFF0000)
          const mouth = this.add.arc(0, 6 * scale, 6 * scale, 0, Math.PI, false, 0xFF0000)
          container.add([body, hat, pompom, nose, mouth])
        }
        break

      case 15: // Cynical Cat
        {
          const body = this.add.ellipse(0, 6 * scale, 14 * scale, 16 * scale, 0xFFD54F)
          const neck = this.add.rectangle(0, -12 * scale, 6 * scale, 24 * scale, 0xFFD54F)
          const head = this.add.ellipse(0, -20 * scale, 8 * scale, 10 * scale, 0xFFD54F)
          const spot1 = this.add.circle(-3 * scale, -8 * scale, 2 * scale, 0x8D6E63)
          const spot2 = this.add.circle(3 * scale, 4 * scale, 2 * scale, 0x8D6E63)
          const ossiconeL = this.add.rectangle(-3 * scale, -26 * scale, 2 * scale, 6 * scale, 0x8D6E63)
          const ossiconeR = this.add.rectangle(3 * scale, -26 * scale, 2 * scale, 6 * scale, 0x8D6E63)
          container.add([body, neck, spot1, spot2, head, ossiconeL, ossiconeR])
        }
        break

      case 16: // Helpful Hippo
        {
          const body = this.add.ellipse(0, 2 * scale, 20 * scale, 18 * scale, 0x78909C)
          const snout = this.add.rectangle(0, 12 * scale, 16 * scale, 10 * scale, 0x90A4AE)
          snout.setRotation(0.1)
          const nostrilL = this.add.circle(-4 * scale, 14 * scale, 2 * scale, 0x455A64)
          const nostrilR = this.add.circle(4 * scale, 14 * scale, 2 * scale, 0x455A64)
          const earL = this.add.ellipse(-12 * scale, -6 * scale, 6 * scale, 4 * scale, 0x607D8B)
          const earR = this.add.ellipse(12 * scale, -6 * scale, 6 * scale, 4 * scale, 0x607D8B)
          container.add([body, earL, earR, snout, nostrilL, nostrilR])
        }
        break

      default:
        // Fallback to simple circle
        const fallback = this.add.circle(0, 0, 20 * scale, 0x999999)
        container.add(fallback)
    }

    container.setScale(1.8) // Scale up the entire icon
    return container
  }
}
