import { Tower } from '../objects/Tower'
import { Enemy } from '../objects/Enemy'
import { MapConfig } from '../config/MapConfigs'
import { getAllTowerConfigs, getTowerConfig } from '../config/TowerConfigs'
import { getEnemyConfig, getWaveEnemies } from '../config/EnemyConfigs'
import { SPRITE_CONFIGS } from '../utils/spriteConfig'

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
  private speedButtonText!: Phaser.GameObjects.Text
  private autoStartButtonText!: Phaser.GameObjects.Text

  // Grid and path
  private gridSize: number = 70 // Grid cell size
  private gridOffsetX: number = 0 // Will be set based on map (35 for interior paths, 0 for edge paths)
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
    this.coins = 999999 // Unlimited money for testing
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
    // With lazy loading, we don't load sprites here
    // They'll be loaded on-demand when towers are selected
    console.log('[TowerDefenseScene] Using lazy loading - sprites will load on demand')

    // Load map background images
    this.load.image('meadow-map-bg', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Meadow%20Map-jgDQzJNQmX1jeqFdews23JXHhdRNyE.png')
    this.load.image('jungle-map-bg', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Jungle%20path-rZBIekbd1UvXB4I3zndaghbXwZUBlm.png')
    this.load.image('sand-map-bg', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Sand%20Map-pN86hXgXGFP4S5PhrqTJAgwi8r9wE4.png')
    this.load.image('mountain-map-bg', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Mountain%20Map-bttUnesTDSS0bc67vY8vSXjdMWZN2C.png')
    this.load.image('lava-map-bg', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Lava%20Map-aVyuoUovzbcS8SQ6v67YyhZx25cGEA.png')
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
      // Wait for the existing load to complete
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.loadedSprites.has(spriteKey)) {
            clearInterval(checkInterval)
            resolve()
          }
        }, 100)
      })
    }

    // Mark as loading
    this.loadingSprites.add(spriteKey)

    return new Promise((resolve, reject) => {
      // Load the sprite sheet
      this.load.spritesheet(config.key, config.path, config.config)

      // Handle load complete
      this.load.once('complete', () => {
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
        if (file.key === spriteKey) {
          console.error(`[LazyLoad] Failed to load sprite: ${spriteKey}`)
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

    // Set grid offset based on map type
    // Maps 1-2 (Meadow, Jungle) have interior winding paths, use margins
    // Maps 3-6 (Desert, Mountain, Lava, Ice) have edge-to-edge paths, no margins
    if (this.mapId === 1 || this.mapId === 2) {
      this.gridOffsetX = 35 // Half-tile margins for interior paths
    } else {
      this.gridOffsetX = 0 // No margins for edge-to-edge paths
    }

    // Create layered background with depth
    if (this.mapId === 1 || this.mapId === 2 || this.mapId === 3 || this.mapId === 4 || this.mapId === 5) {
      // Use image background for Meadow, Jungle, Sand, Mountain, and Lava maps
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

    const { width, height } = this.cameras.main
    const menuHeight = 300
    const menuY = height - menuHeight

    // Get available upgrade paths
    const availablePaths = this.getAvailableUpgradePaths(tower)

    // Position upgrade UI at the bottom over tower selection
    const centerX = width / 2

    // Tower name header
    const headerText = this.add.text(centerX, menuY + 30, `${tower.stats.name} - Level ${tower.level}`, {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    })
    headerText.setOrigin(0.5)
    headerText.setDepth(600)
    this.upgradeButtons.push(headerText as any)

    // Create upgrade buttons if available
    if (availablePaths.length > 0) {
      const upgradeY = menuY + 110
      availablePaths.forEach((pathInfo, index) => {
        const xOffset = (index - (availablePaths.length - 1) / 2) * 160
        const upgradeBtn = this.createButton(
          centerX + xOffset,
          upgradeY,
          150,
          70,
          `${pathInfo.name}\n$${pathInfo.cost}`,
          0x4CAF50,
          () => {
            this.upgradeTower(tower, pathInfo.path)
          }
        )
        upgradeBtn.setDepth(600)
        this.upgradeButtons.push(upgradeBtn)
      })
    }

    // Create sell button
    const sellValue = tower.getSellValue()
    this.sellButton = this.createButton(
      centerX,
      menuY + 220,
      180,
      60,
      `Sell for $${sellValue}`,
      0xFF5722,
      () => {
        this.sellTower(tower)
      }
    )
    this.sellButton.setDepth(600)
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
    const gridY = Math.floor(tower.y / this.gridSize)

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
  }

  private setupPath() {
    // Get path from map config
    this.path = this.mapConfig.path
  }

  private setupGrid() {
    const { width, height } = this.cameras.main
    const usableWidth = width - (this.gridOffsetX * 2) // Account for half-tile margins
    const cols = Math.floor(usableWidth / this.gridSize)
    const rows = Math.floor(height / this.gridSize)

    // Initialize all tiles as placeable
    this.placementGrid = Array(rows).fill(null).map(() => Array(cols).fill(true))

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
          const centerGridY = Math.floor(y / this.gridSize)

          // Create a buffer zone around the path (prevents placement right at edge)
          const bufferRadius = 0.6 // tiles on each side (reduced from 1.2 for more placeable space)
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
  }

  private drawPath() {
    const graphics = this.add.graphics()
    graphics.setDepth(-90)
    const pathWidth = 32 // Fixed path width (67% of grid size for cleaner layout)

    // Make path invisible for Map 1 (Meadow), Map 2 (Jungle), Map 3 (Sand), Map 4 (Mountain), and Map 5 (Lava) since the background images have the path
    if (this.mapId === 1 || this.mapId === 2 || this.mapId === 3 || this.mapId === 4 || this.mapId === 5) {
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
    const cols = Math.floor(usableWidth / this.gridSize)
    const rows = Math.floor(height / this.gridSize)

    // Draw half-tile margins on left and right (only if margins exist)
    if (this.gridOffsetX > 0) {
      this.debugGraphics.fillStyle(0x0000ff, 0.1)
      this.debugGraphics.fillRect(0, 0, this.gridOffsetX, height) // Left margin
      this.debugGraphics.fillRect(width - this.gridOffsetX, 0, this.gridOffsetX, height) // Right margin
    }

    // Draw grid cells
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = this.gridOffsetX + col * this.gridSize
        const y = row * this.gridSize
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
    const { width } = this.cameras.main

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

    // Wave
    this.waveText = this.add.text(width - 20, 25, `Wave: ${this.currentWave}/118`, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(1, 0)
    this.waveText.setDepth(101)

    // Start Wave button (top right, more accessible)
    const startWaveBtn = this.createButton(width - 120, 65, 200, 50, 'START WAVE', 0x4CAF50, () => {
      this.startNextWave()
    })
    startWaveBtn.setDepth(101)

    // Back to menu button (top left)
    const menuBtn = this.createButton(360, 25, 120, 40, 'MENU', 0x666666, () => {
      this.scene.start('LevelSelectionScene')
    })
    menuBtn.setDepth(101)

    // Speed button (next to menu button)
    const speedBtn = this.createButton(500, 25, 100, 40, '1x', 0xFF9800, () => {
      this.toggleSpeed()
    })
    speedBtn.setDepth(101)

    // Store reference to speed button text for updates
    this.speedButtonText = speedBtn.list[1] as Phaser.GameObjects.Text

    // Auto-start button (next to speed button)
    const autoStartBtn = this.createButton(620, 25, 100, 40, 'AUTO: OFF', 0x9C27B0, () => {
      this.toggleAutoStart()
    })
    autoStartBtn.setDepth(101)

    // Store reference to auto-start button text for updates
    this.autoStartButtonText = autoStartBtn.list[1] as Phaser.GameObjects.Text

    // Selected tower indicator (will be updated when tower is selected)
    this.selectedTowerText = this.add.text(width / 2, 25, '', {
      fontSize: '20px',
      color: '#00ff00',
      fontStyle: 'bold',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    })
    this.selectedTowerText.setOrigin(0.5, 0)
    this.selectedTowerText.setDepth(101)
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
    const buttonWidth = 180
    const buttonHeight = 200
    const buttonGap = 20
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
        const nameText = this.add.text(0, -75, nameParts[0], {
          fontSize: '16px',
          color: '#ffffff',
          fontStyle: 'bold',
          align: 'center',
          stroke: '#000000',
          strokeThickness: 3
        })
        nameText.setOrigin(0.5)

        const nameText2 = this.add.text(0, -57, nameParts[1] || '', {
          fontSize: '16px',
          color: '#ffffff',
          fontStyle: 'bold',
          align: 'center',
          stroke: '#000000',
          strokeThickness: 3
        })
        nameText2.setOrigin(0.5)

        // Tower icon/preview using sprite sheet (first frame)
        const iconContainer = this.createTowerSpriteIcon(towerConfig.type, 0, -10)

        // Add glow to icon
        const glow = this.add.circle(0, -10, 35, towerConfig.color, 0.3)

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
                this.selectedTowerText.setText(`Selected: ${towerConfig.name} ($${towerConfig.cost}) - Click map to place or ESC to cancel`)
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

    // Page indicator
    const pageText = this.add.text(width / 2, menuY + 265, `Page ${this.currentTowerPage + 1}/${totalPages}`, {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    })
    pageText.setOrigin(0.5)
    pageText.setDepth(202)

    // Left arrow
    const leftArrow = this.createArrowButton(100, menuY + 150, 'left', () => {
      this.changeTowerPage(-1, pageText, totalPages)
    })
    leftArrow.setDepth(202)

    // Right arrow
    const rightArrow = this.createArrowButton(width - 100, menuY + 150, 'right', () => {
      this.changeTowerPage(1, pageText, totalPages)
    })
    rightArrow.setDepth(202)
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

  private changeTowerPage(direction: number, pageText: Phaser.GameObjects.Text, totalPages: number) {
    // Hide current page
    this.towerPageContainers[this.currentTowerPage].setVisible(false)

    // Update page number with wrapping
    this.currentTowerPage = (this.currentTowerPage + direction + totalPages) % totalPages

    // Show new page
    this.towerPageContainers[this.currentTowerPage].setVisible(true)

    // Update page text
    pageText.setText(`Page ${this.currentTowerPage + 1}/${totalPages}`)
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
  }

  private cancelTowerSelection() {
    this.selectedTowerType = null

    if (this.hoverTile) {
      this.hoverTile.destroy()
      this.hoverTile = null
    }

    if (this.selectedTowerText) {
      this.selectedTowerText.setText('')
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
    const gridY = Math.floor(pointer.y / this.gridSize)

    if (this.hoverTile) {
      this.hoverTile.destroy()
    }

    const canPlace = this.canPlaceTower(gridX, gridY)
    const color = canPlace ? 0x00ff00 : 0xff0000

    this.hoverTile = this.add.rectangle(
      this.gridOffsetX + gridX * this.gridSize + this.gridSize / 2,
      gridY * this.gridSize + this.gridSize / 2,
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
    const gridY = Math.floor(pointer.y / this.gridSize)

    if (!this.canPlaceTower(gridX, gridY)) return
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
    const worldY = gridY * this.gridSize + this.gridSize / 2
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

    const { width, height } = this.cameras.main

    // Dark overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8)
    overlay.setDepth(1000)

    // Game Over text
    const gameOverText = this.add.text(width / 2, height / 3, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold'
    })
    gameOverText.setOrigin(0.5)
    gameOverText.setDepth(1001)

    // Stats
    const statsText = this.add.text(width / 2, height / 2,
      `Wave Reached: ${this.currentWave}\nCoins Earned: ${this.coins}`,
      {
        fontSize: '24px',
        color: '#ffffff',
        align: 'center'
      }
    )
    statsText.setOrigin(0.5)
    statsText.setDepth(1001)

    // Restart button
    const restartBtn = this.createButton(width / 2, height * 0.65, 200, 60, 'Restart', 0x4CAF50, () => {
      this.scene.restart()
    })
    restartBtn.setDepth(1001)

    // Menu button
    const menuBtn = this.createButton(width / 2, height * 0.75, 200, 60, 'Main Menu', 0x666666, () => {
      this.scene.start('LevelSelectionScene')
    })
    menuBtn.setDepth(1001)
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
      // EASY MAP 1: Meadow Spiral - Matches background image path
      1: {
        id: 1,
        name: 'Meadow Spiral',
        backgroundColor: 0x7EC850,
        path: [
          // Start at row 3, col 1
          new Phaser.Math.Vector2(48, 120),  // (3,1) - start position
          new Phaser.Math.Vector2(48, 312),  // (7,1) - down before diagonal
          new Phaser.Math.Vector2(96, 336),  // (7.5,2) - diagonal down-right
          new Phaser.Math.Vector2(144, 336), // (7.5,3) - diagonal continue
          new Phaser.Math.Vector2(192, 336), // (7.5,4) - diagonal continue
          new Phaser.Math.Vector2(240, 312), // (7,5) - arrive at turn end
          new Phaser.Math.Vector2(240, 288), // (6.5,5) - ease into up turn
          new Phaser.Math.Vector2(240, 264), // (6,5) - corner cell
          new Phaser.Math.Vector2(264, 264), // (6,5.5) - ease into right turn
          new Phaser.Math.Vector2(528, 264), // (6,11) - right 6 cells
          new Phaser.Math.Vector2(528, 288), // (6.5,11) - ease into down turn
          new Phaser.Math.Vector2(528, 600), // (13,11) - down 7 cells
          new Phaser.Math.Vector2(504, 600), // (13,10.5) - ease into left turn
          new Phaser.Math.Vector2(336, 600), // (13,7) - left 4 cells
          new Phaser.Math.Vector2(336, 576), // (12.5,7) - ease into up turn
          new Phaser.Math.Vector2(336, 408), // (9,7) - up 4 cells
          new Phaser.Math.Vector2(360, 408), // (9,7.5) - ease into right turn
          new Phaser.Math.Vector2(672, 408), // (9,14) - right 7 cells
          new Phaser.Math.Vector2(672, 432), // (9.5,14) - ease into down turn
          new Phaser.Math.Vector2(672, 696), // (15,14) - down 6 cells
          new Phaser.Math.Vector2(648, 696), // (15,13.5) - ease into left turn
          new Phaser.Math.Vector2(624, 696), // (15,13) - left 1 cell
          new Phaser.Math.Vector2(600, 720), // (15.5,12.5) - ease into diagonal
          new Phaser.Math.Vector2(576, 744), // (16,12) - diagonal down-left 1 cell
          new Phaser.Math.Vector2(552, 744), // (16,11.5) - ease out of diagonal
          new Phaser.Math.Vector2(480, 744), // (16,10) - left 2 cells
          new Phaser.Math.Vector2(480, 768), // (16.5,10) - ease into final down
          new Phaser.Math.Vector2(480, 840)  // (18,10) - down 2 cells
        ]
      },
      // EASY MAP 2: Jungle - Matches background image path (high waypoint density for smooth curves)
      2: {
        id: 2,
        name: 'Forest Loop',
        backgroundColor: 0x4A7C59,
        path: [
          // Start at 4,1
          new Phaser.Math.Vector2(350, 105),
          // Down to 4,2 (add intermediates)
          new Phaser.Math.Vector2(350, 125),
          new Phaser.Math.Vector2(350, 145),
          new Phaser.Math.Vector2(350, 165),
          new Phaser.Math.Vector2(350, 175),
          // Diagonal curve to 3,3 (many intermediates)
          new Phaser.Math.Vector2(342, 183),
          new Phaser.Math.Vector2(333, 192),
          new Phaser.Math.Vector2(324, 201),
          new Phaser.Math.Vector2(315, 210),
          new Phaser.Math.Vector2(306, 219),
          new Phaser.Math.Vector2(297, 228),
          new Phaser.Math.Vector2(288, 237),
          new Phaser.Math.Vector2(280, 245),
          // Left to 2,3 (intermediates)
          new Phaser.Math.Vector2(262, 245),
          new Phaser.Math.Vector2(245, 245),
          new Phaser.Math.Vector2(228, 245),
          new Phaser.Math.Vector2(210, 245),
          // Smooth curve around 1,3 to 1,4 (many intermediates)
          new Phaser.Math.Vector2(198, 248),
          new Phaser.Math.Vector2(186, 252),
          new Phaser.Math.Vector2(175, 260),
          new Phaser.Math.Vector2(165, 268),
          new Phaser.Math.Vector2(155, 277),
          new Phaser.Math.Vector2(147, 287),
          new Phaser.Math.Vector2(140, 297),
          new Phaser.Math.Vector2(140, 308),
          new Phaser.Math.Vector2(140, 315),
          // Curve around 1,5 to 2,5 (many intermediates)
          new Phaser.Math.Vector2(140, 330),
          new Phaser.Math.Vector2(140, 345),
          new Phaser.Math.Vector2(140, 360),
          new Phaser.Math.Vector2(140, 375),
          new Phaser.Math.Vector2(140, 385),
          new Phaser.Math.Vector2(145, 385),
          new Phaser.Math.Vector2(152, 385),
          new Phaser.Math.Vector2(160, 385),
          new Phaser.Math.Vector2(175, 385),
          new Phaser.Math.Vector2(193, 385),
          new Phaser.Math.Vector2(210, 385),
          // Slight diagonal from 2,5 to 6,5 (add more intermediates)
          new Phaser.Math.Vector2(228, 385),
          new Phaser.Math.Vector2(245, 385),
          new Phaser.Math.Vector2(262, 385),
          new Phaser.Math.Vector2(280, 385),
          new Phaser.Math.Vector2(298, 385),
          new Phaser.Math.Vector2(315, 385),
          new Phaser.Math.Vector2(333, 385),
          new Phaser.Math.Vector2(350, 385),
          new Phaser.Math.Vector2(368, 385),
          new Phaser.Math.Vector2(385, 385),
          new Phaser.Math.Vector2(403, 385),
          new Phaser.Math.Vector2(420, 385),
          new Phaser.Math.Vector2(438, 385),
          new Phaser.Math.Vector2(455, 385),
          new Phaser.Math.Vector2(473, 385),
          new Phaser.Math.Vector2(490, 385),
          // Diagonal curve to 7,6 (many intermediates)
          new Phaser.Math.Vector2(500, 395),
          new Phaser.Math.Vector2(510, 405),
          new Phaser.Math.Vector2(520, 415),
          new Phaser.Math.Vector2(530, 425),
          new Phaser.Math.Vector2(540, 435),
          new Phaser.Math.Vector2(550, 445),
          new Phaser.Math.Vector2(560, 455),
          // Down and around 7,7 to 6,7 (smooth curve)
          new Phaser.Math.Vector2(560, 468),
          new Phaser.Math.Vector2(560, 480),
          new Phaser.Math.Vector2(560, 493),
          new Phaser.Math.Vector2(560, 505),
          new Phaser.Math.Vector2(560, 518),
          new Phaser.Math.Vector2(560, 525),
          new Phaser.Math.Vector2(553, 525),
          new Phaser.Math.Vector2(545, 525),
          new Phaser.Math.Vector2(537, 525),
          new Phaser.Math.Vector2(528, 525),
          new Phaser.Math.Vector2(520, 525),
          new Phaser.Math.Vector2(510, 525),
          new Phaser.Math.Vector2(500, 525),
          new Phaser.Math.Vector2(490, 525),
          // 6,7 to 4,7 (slight downward angle, many intermediates)
          new Phaser.Math.Vector2(473, 526),
          new Phaser.Math.Vector2(456, 527),
          new Phaser.Math.Vector2(438, 528),
          new Phaser.Math.Vector2(421, 529),
          new Phaser.Math.Vector2(404, 528),
          new Phaser.Math.Vector2(387, 527),
          new Phaser.Math.Vector2(370, 526),
          new Phaser.Math.Vector2(350, 525),
          // 4,7 to 2,7 (slight upward angle, many intermediates)
          new Phaser.Math.Vector2(333, 524),
          new Phaser.Math.Vector2(315, 523),
          new Phaser.Math.Vector2(298, 522),
          new Phaser.Math.Vector2(280, 521),
          new Phaser.Math.Vector2(262, 522),
          new Phaser.Math.Vector2(245, 523),
          new Phaser.Math.Vector2(228, 524),
          new Phaser.Math.Vector2(210, 525),
          // Curve downward around 1,7 (smooth curve)
          new Phaser.Math.Vector2(195, 529),
          new Phaser.Math.Vector2(182, 535),
          new Phaser.Math.Vector2(170, 542),
          new Phaser.Math.Vector2(158, 550),
          new Phaser.Math.Vector2(148, 560),
          new Phaser.Math.Vector2(142, 570),
          new Phaser.Math.Vector2(140, 580),
          // Diagonal curve: 1,8 → 2,8 → 3,9 → 4,9 (smooth S-curve)
          new Phaser.Math.Vector2(140, 595),
          new Phaser.Math.Vector2(142, 605),
          new Phaser.Math.Vector2(148, 612),
          new Phaser.Math.Vector2(157, 618),
          new Phaser.Math.Vector2(168, 620),
          new Phaser.Math.Vector2(180, 618),
          new Phaser.Math.Vector2(192, 612),
          new Phaser.Math.Vector2(203, 605),
          new Phaser.Math.Vector2(210, 595),
          new Phaser.Math.Vector2(218, 603),
          new Phaser.Math.Vector2(227, 612),
          new Phaser.Math.Vector2(238, 622),
          new Phaser.Math.Vector2(250, 632),
          new Phaser.Math.Vector2(262, 642),
          new Phaser.Math.Vector2(273, 652),
          new Phaser.Math.Vector2(283, 660),
          new Phaser.Math.Vector2(295, 665),
          new Phaser.Math.Vector2(308, 665),
          new Phaser.Math.Vector2(322, 665),
          new Phaser.Math.Vector2(337, 665),
          new Phaser.Math.Vector2(350, 665),
          // Down to 4,10 (intermediates)
          new Phaser.Math.Vector2(350, 682),
          new Phaser.Math.Vector2(350, 700),
          new Phaser.Math.Vector2(350, 718),
          new Phaser.Math.Vector2(350, 735),
          // Down to 4,11 (disappear - intermediates)
          new Phaser.Math.Vector2(350, 753),
          new Phaser.Math.Vector2(350, 770),
          new Phaser.Math.Vector2(350, 788),
          new Phaser.Math.Vector2(350, 805)
        ]
      },
      // MEDIUM MAP 1: S-Curve
      3: {
        id: 3,
        name: 'Desert Winds',
        backgroundColor: 0xE0AC69,
        path: [
          new Phaser.Math.Vector2(30, height * 0.25),
          new Phaser.Math.Vector2(width * 0.38, height * 0.25),
          new Phaser.Math.Vector2(width * 0.38, height * 0.42),
          new Phaser.Math.Vector2(width * 0.68, height * 0.42),
          new Phaser.Math.Vector2(width * 0.68, height * 0.6),
          new Phaser.Math.Vector2(width - 30, height * 0.6)
        ]
      },
      // MEDIUM MAP 2: Zigzag
      4: {
        id: 4,
        name: 'Mountain Zigzag',
        backgroundColor: 0x8B7355,
        path: [
          new Phaser.Math.Vector2(30, height * 0.2),
          new Phaser.Math.Vector2(width * 0.45, height * 0.2),
          new Phaser.Math.Vector2(width * 0.45, height * 0.42),
          new Phaser.Math.Vector2(width * 0.18, height * 0.42),
          new Phaser.Math.Vector2(width * 0.18, height * 0.65),
          new Phaser.Math.Vector2(width * 0.65, height * 0.65),
          new Phaser.Math.Vector2(width * 0.65, height * 0.48),
          new Phaser.Math.Vector2(width - 30, height * 0.48)
        ]
      },
      // HARD MAP 1: L-Shape - Quick direct path (right to left)
      5: {
        id: 5,
        name: 'Volcanic Rush',
        backgroundColor: 0x5C2E2E,
        path: [
          new Phaser.Math.Vector2(width - 30, height * 0.25),
          new Phaser.Math.Vector2(width * 0.45, height * 0.25),
          new Phaser.Math.Vector2(width * 0.45, height * 0.58),
          new Phaser.Math.Vector2(30, height * 0.58)
        ]
      },
      // HARD MAP 2: Almost straight line (top to bottom)
      6: {
        id: 6,
        name: 'Ice Highway',
        backgroundColor: 0x5E7C8C,
        path: [
          new Phaser.Math.Vector2(width * 0.5, 130),
          new Phaser.Math.Vector2(width * 0.5, height * 0.38),
          new Phaser.Math.Vector2(width * 0.62, height * 0.52),
          new Phaser.Math.Vector2(width * 0.62, height * 0.7)
        ]
      }
    }

    return configs[mapId] || configs[1]
  }

  private toggleSpeed() {
    // Toggle between 1x and 2x speed
    if (this.gameSpeed === 1) {
      this.gameSpeed = 2
      this.speedButtonText.setText('2x')
      this.physics.world.timeScale = 1 // Physics runs at normal speed
      this.time.timeScale = 2 // Time events run at 2x
    } else {
      this.gameSpeed = 1
      this.speedButtonText.setText('1x')
      this.physics.world.timeScale = 1
      this.time.timeScale = 1
    }
  }

  private toggleAutoStart() {
    // Toggle auto-start waves on/off
    this.autoStartWaves = !this.autoStartWaves
    this.autoStartButtonText.setText(this.autoStartWaves ? 'AUTO: ON' : 'AUTO: OFF')
    console.log(`Auto-start waves: ${this.autoStartWaves ? 'ON' : 'OFF'}`)
  }

  private createTowerSpriteIcon(type: number, x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y)

    // Sprite should already be loaded by setupTowerMenu preload

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
      // Create sprite showing first frame (frame 0)
      const sprite = this.add.sprite(0, 0, config.key, 0)
      sprite.setScale(0.12) // Match tower display scale
      sprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST)
      container.add(sprite)
    } else {
      // Fallback to old icon if no sprite config
      return this.createTowerIcon(type, x, y)
    }

    return container
  }

  private createTowerIcon(type: number, x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y)
    const scale = 1.5 // Icon base scale

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

      case 8: // Patient Panda
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

      case 15: // Genuine Giraffe
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
