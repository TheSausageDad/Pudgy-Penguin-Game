export interface TowerStats {
  type: number
  name: string
  cost: number
  damage: number
  range: number
  fireRate: number  // attacks per second
  color: number
  upgrades: {
    pathA?: TowerUpgrade[]
    pathB?: TowerUpgrade[]
    pathC?: TowerUpgrade[]
  }
}

export interface TowerUpgrade {
  name: string
  cost: number
  damageBonus?: number
  rangeBonus?: number
  fireRateBonus?: number
  special?: string
}

// Mapping of tower types to their sprite keys, animation prefixes, and mirror behavior
// mirrorDirection: 'right' means flip when facing right, 'left' means flip when facing left
const TOWER_SPRITE_CONFIG: Record<number, { spriteKey: string; animPrefix: string; scale: number; mirrorDirection: 'left' | 'right' } | null> = {
  1: { spriteKey: 'focused-falcon', animPrefix: 'falcon', scale: 0.18, mirrorDirection: 'left' },
  2: { spriteKey: 'ambitious-angel', animPrefix: 'angel', scale: 0.18, mirrorDirection: 'left' },
  3: { spriteKey: 'motivated-monster', animPrefix: 'monster', scale: 0.18, mirrorDirection: 'left' },
  4: { spriteKey: 'thoughtful-harpik', animPrefix: 'harpik', scale: 0.18, mirrorDirection: 'right' },
  5: { spriteKey: 'empathy-elephant', animPrefix: 'elephant', scale: 0.18, mirrorDirection: 'right' },
  6: { spriteKey: 'adaptable-alien', animPrefix: 'alien', scale: 0.18, mirrorDirection: 'left' },
  7: { spriteKey: 'fearless-fairy', animPrefix: 'fairy', scale: 0.18, mirrorDirection: 'left' },
  8: { spriteKey: 'notorious-ninja', animPrefix: 'ninja', scale: 0.18, mirrorDirection: 'left' },
  9: { spriteKey: 'flex-n-fox', animPrefix: 'fox', scale: 0.18, mirrorDirection: 'left' },
  10: { spriteKey: 'driven-dragon', animPrefix: 'dragon', scale: 0.09, mirrorDirection: 'left' }, // Dragon has 1080px wide frames (2x) - use half scale
  11: { spriteKey: 'balanced-beetle', animPrefix: 'beetle', scale: 0.18, mirrorDirection: 'right' },
  12: { spriteKey: 'adventurous-astronaut', animPrefix: 'astronaut', scale: 0.18, mirrorDirection: 'left' },
  13: { spriteKey: 'creative-crab', animPrefix: 'crab', scale: 0.18, mirrorDirection: 'left' },
  14: { spriteKey: 'competitive-clown', animPrefix: 'clown', scale: 0.18, mirrorDirection: 'right' },
  15: { spriteKey: 'cynical-cat', animPrefix: 'cat', scale: 0.18, mirrorDirection: 'right' },
  16: { spriteKey: 'rare-robot', animPrefix: 'robot', scale: 0.18, mirrorDirection: 'left' }
}

export class Tower extends Phaser.GameObjects.Container {
  public stats: TowerStats
  public level: number = 0
  public upgradePath: 'pathA' | 'pathB' | 'pathC' | null = null

  private lastFireTime: number = 0
  private rangeCircle: Phaser.GameObjects.Arc
  private towerGraphic!: Phaser.GameObjects.Shape | Phaser.GameObjects.Sprite
  private target: any = null
  private levelText: Phaser.GameObjects.Text | null = null
  private bodyContainer: Phaser.GameObjects.Container | null = null
  private upgradeEffects: Phaser.GameObjects.GameObject[] = []
  private characterSprite: Phaser.GameObjects.Sprite | null = null
  private animPrefix: string | null = null // Animation prefix for sprite-based towers
  private mirrorDirection: 'left' | 'right' = 'right' // Which direction should use flipX=true
  private monsterSprite: Phaser.GameObjects.Sprite | null = null
  private elephantSprite: Phaser.GameObjects.Sprite | null = null
  private fairySprite: Phaser.GameObjects.Sprite | null = null
  private catSprite: Phaser.GameObjects.Sprite | null = null
  private currentDirection: 'front' | 'back' | 'left' | 'right' = 'front'

  // Character body parts for visual upgrades
  private characterParts: {
    body?: Phaser.GameObjects.Shape
    head?: Phaser.GameObjects.Shape
    eyes?: Phaser.GameObjects.Shape[]
    accessories?: Phaser.GameObjects.Shape[]
    wings?: Phaser.GameObjects.Shape[]
    weapon?: Phaser.GameObjects.Shape
  } = {}

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    stats: TowerStats
  ) {
    super(scene, x, y)

    this.stats = stats
    scene.add.existing(this)
    this.setDepth(20) // Towers above background/path but below UI

    // Create unique visual based on tower type
    this.createTowerVisual(scene)

    // Range indicator (hidden by default)
    this.rangeCircle = scene.add.circle(0, 0, this.stats.range, 0xffffff, 0)
    this.rangeCircle.setStrokeStyle(3, this.stats.color, 0.5)
    this.add(this.rangeCircle)

    // Show range on hover and allow clicks
    this.towerGraphic.setInteractive()
      .on('pointerover', () => {
        this.rangeCircle.setAlpha(0.3)
        this.setScale(1.05)
      })
      .on('pointerout', () => {
        this.rangeCircle.setAlpha(0)
        this.setScale(1)
      })
      .on('pointerdown', () => {
        scene.events.emit('towerClicked', this)
      })

    // Level indicator
    this.updateLevelIndicator()
  }

  // Helper methods for creating 3D color gradients
  private getLighterColor(color: number, amount: number): number {
    const rgb = Phaser.Display.Color.IntegerToColor(color)
    return Phaser.Display.Color.GetColor(
      Math.min(255, rgb.red + amount),
      Math.min(255, rgb.green + amount),
      Math.min(255, rgb.blue + amount)
    )
  }

  private getDarkerColor(color: number, amount: number): number {
    const rgb = Phaser.Display.Color.IntegerToColor(color)
    return Phaser.Display.Color.GetColor(
      Math.max(0, rgb.red - amount),
      Math.max(0, rgb.green - amount),
      Math.max(0, rgb.blue - amount)
    )
  }

  // Helper method to create sprite-based tower
  private createSpriteBasedTower(scene: Phaser.Scene, spriteKey: string, animPrefix: string, scale: number, mainColor: number, mirrorDirection: 'left' | 'right') {
    // Store animation prefix and mirror direction for direction updates
    this.animPrefix = animPrefix
    this.mirrorDirection = mirrorDirection

    // Create body container for consistency
    this.bodyContainer = scene.add.container(0, 0)
    this.add(this.bodyContainer)

    // Per-tower offsets to center the actual character body (not the transparent sprite bounds)
    // These offsets compensate for transparent space in sprite sheets
    const bodyOffsets: Record<number, { x: number; y: number }> = {
      1: { x: 0, y: -21 },    // Focused Falcon
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

    const offset = bodyOffsets[this.stats.type] || { x: 0, y: -5 }

    // Create sprite (frames are 540x450, so scale down)
    this.characterSprite = scene.add.sprite(offset.x, offset.y, spriteKey, 0)
    this.characterSprite.setScale(scale)
    this.characterSprite.setOrigin(0.5, 0.5) // Center origin to show full character
    this.characterSprite.setTexture(spriteKey, 0)
    this.characterSprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST)
    this.bodyContainer.add(this.characterSprite)

    // Set towerGraphic for interaction
    this.towerGraphic = this.characterSprite as any

    // Make the sprite interactive
    this.characterSprite.setInteractive()

    // Play idle animation if it exists
    const idleAnim = `${animPrefix}-idle-front`
    if (scene.anims.exists(idleAnim)) {
      this.characterSprite.play(idleAnim)
    }

    this.addGlow(scene, mainColor, 30)

    // Also store in legacy sprite properties for backward compatibility
    if (animPrefix === 'monster') this.monsterSprite = this.characterSprite
    if (animPrefix === 'elephant') this.elephantSprite = this.characterSprite
    if (animPrefix === 'fairy') this.fairySprite = this.characterSprite
    if (animPrefix === 'cat') this.catSprite = this.characterSprite
  }

  private createTowerVisual(scene: Phaser.Scene) {
    // Base shadow
    const shadow = scene.add.ellipse(0, 5, 45, 20, 0x000000, 0.3)
    this.add(shadow)

    // Check if this tower type has a sprite configuration
    const spriteConfig = TOWER_SPRITE_CONFIG[this.stats.type]

    if (spriteConfig) {
      // Use sprite-based tower
      this.createSpriteBasedTower(
        scene,
        spriteConfig.spriteKey,
        spriteConfig.animPrefix,
        spriteConfig.scale,
        this.stats.color,
        spriteConfig.mirrorDirection
      )
    } else {
      // Fall back to procedural graphics for towers without sprites
      switch (this.stats.type) {
        case 1: this.createFalcon(scene); break
        case 2: this.createAngel(scene); break
        case 3: this.createMonster(scene); break
        case 4: this.createDog(scene); break
        case 5: this.createElephant(scene); break
        case 6: this.createAlien(scene); break
        case 7: this.createFairy(scene); break
        case 8: this.createPanda(scene); break
        case 9: this.createBison(scene); break
        case 10: this.createDragon(scene); break
        case 11: this.createBeetle(scene); break
        case 12: this.createAstronaut(scene); break
        case 13: this.createCrab(scene); break
        case 14: this.createClown(scene); break
        case 15: this.createCat(scene); break
        case 16: this.createHippo(scene); break
        default: this.createDefaultTower(scene); break
      }
    }
  }

  // 1. Focused Falcon - Bird with sharp beak and wings
  private createFalcon(scene: Phaser.Scene) {
    // Create rotating body container
    this.bodyContainer = scene.add.container(0, 0)
    this.add(this.bodyContainer)

    const mainColor = 0x8BC34A // Green
    const darkColor = this.getDarkerColor(mainColor, 50)
    const lightColor = this.getLighterColor(mainColor, 50)
    const chestColor = 0xF5DEB3 // Lighter chest color
    const featherDark = 0x556B2F // Dark olive for feathers
    const beakColor = 0xFFD700 // Gold beak
    const talonColor = 0x8B7355 // Brown talons

    // =========================
    // TAIL FEATHERS (behind body)
    // =========================
    const tailFeathers: Phaser.GameObjects.Shape[] = []
    for (let i = 0; i < 5; i++) {
      const angle = (i - 2) * 0.15
      const xOffset = (i - 2) * 3

      // Shadow
      const tailShadow = scene.add.ellipse(xOffset + 2, 8, 6, 18, 0x000000, 0.2)
      tailShadow.setRotation(angle)
      this.bodyContainer.add(tailShadow)

      // Dark base
      const tailDark = scene.add.ellipse(xOffset + 1, 7, 5.5, 17, featherDark)
      tailDark.setRotation(angle)
      this.bodyContainer.add(tailDark)

      // Main feather
      const tailFeather = scene.add.ellipse(xOffset, 6, 5, 16, darkColor)
      tailFeather.setRotation(angle)
      tailFeather.setStrokeStyle(1, featherDark, 0.8)
      this.bodyContainer.add(tailFeather)

      // Highlight
      const tailHighlight = scene.add.ellipse(xOffset - 1, 4, 3, 10, mainColor, 0.6)
      tailHighlight.setRotation(angle)
      this.bodyContainer.add(tailHighlight)

      tailFeathers.push(tailFeather)
    }

    // =========================
    // LEGS & TALONS
    // =========================
    // Left Leg
    const leftLegUpper = scene.add.rectangle(-5, 8, 3, 8, talonColor)
    this.bodyContainer.add(leftLegUpper)

    const leftLegLower = scene.add.rectangle(-5, 14, 2.5, 6, this.getDarkerColor(talonColor, 30))
    this.bodyContainer.add(leftLegLower)

    // Left talons - 3 forward, 1 back
    const leftTalon1 = scene.add.rectangle(-7, 18, 1.5, 4, this.getDarkerColor(talonColor, 40))
    leftTalon1.setRotation(-0.3)
    this.bodyContainer.add(leftTalon1)

    const leftTalon2 = scene.add.rectangle(-5, 19, 1.5, 4, this.getDarkerColor(talonColor, 40))
    this.bodyContainer.add(leftTalon2)

    const leftTalon3 = scene.add.rectangle(-3, 18, 1.5, 4, this.getDarkerColor(talonColor, 40))
    leftTalon3.setRotation(0.3)
    this.bodyContainer.add(leftTalon3)

    const leftTalonBack = scene.add.rectangle(-7, 14, 1.5, 3, this.getDarkerColor(talonColor, 40))
    leftTalonBack.setRotation(Math.PI)
    this.bodyContainer.add(leftTalonBack)

    // Right Leg
    const rightLegUpper = scene.add.rectangle(5, 8, 3, 8, talonColor)
    this.bodyContainer.add(rightLegUpper)

    const rightLegLower = scene.add.rectangle(5, 14, 2.5, 6, this.getDarkerColor(talonColor, 30))
    this.bodyContainer.add(rightLegLower)

    // Right talons
    const rightTalon1 = scene.add.rectangle(3, 18, 1.5, 4, this.getDarkerColor(talonColor, 40))
    rightTalon1.setRotation(-0.3)
    this.bodyContainer.add(rightTalon1)

    const rightTalon2 = scene.add.rectangle(5, 19, 1.5, 4, this.getDarkerColor(talonColor, 40))
    this.bodyContainer.add(rightTalon2)

    const rightTalon3 = scene.add.rectangle(7, 18, 1.5, 4, this.getDarkerColor(talonColor, 40))
    rightTalon3.setRotation(0.3)
    this.bodyContainer.add(rightTalon3)

    const rightTalonBack = scene.add.rectangle(7, 14, 1.5, 3, this.getDarkerColor(talonColor, 40))
    rightTalonBack.setRotation(Math.PI)
    this.bodyContainer.add(rightTalonBack)

    // =========================
    // BODY - Muscular bird body
    // =========================
    const bodyShadowDeep = scene.add.ellipse(3, -2, 26, 32, 0x000000, 0.3)
    this.bodyContainer.add(bodyShadowDeep)

    const bodyBase1 = scene.add.ellipse(1, -4, 25, 31, darkColor, 0.9)
    this.bodyContainer.add(bodyBase1)

    const body = scene.add.ellipse(0, -5, 24, 30, mainColor)
    body.setStrokeStyle(2, featherDark, 0.8)
    this.bodyContainer.add(body)
    this.towerGraphic = body
    this.characterParts.body = body

    // Chest plumage (lighter color)
    const chestShadow = scene.add.ellipse(1, -2, 14, 20, 0x000000, 0.15)
    this.bodyContainer.add(chestShadow)

    const chest = scene.add.ellipse(0, -3, 13, 19, chestColor)
    this.bodyContainer.add(chest)

    // Feather texture on chest
    for (let i = 0; i < 4; i++) {
      const chestFeather = scene.add.ellipse(0, -8 + i * 4, 10 - i, 5, this.getLighterColor(chestColor, 20), 0.4)
      this.bodyContainer.add(chestFeather)
    }

    // Body highlights
    const bodyHighlight1 = scene.add.ellipse(-5, -9, 10, 14, lightColor, 0.5)
    this.bodyContainer.add(bodyHighlight1)

    const bodySpecular = scene.add.circle(-7, -12, 4, 0xFFFFFF, 0.6)
    this.bodyContainer.add(bodySpecular)

    // =========================
    // WINGS - Individual feathers
    // =========================
    const wingFeathers: Phaser.GameObjects.Shape[] = []

    // Left Wing - Multiple layers of individual feathers
    for (let layer = 0; layer < 3; layer++) {
      for (let i = 0; i < 4; i++) {
        const xPos = -10 - layer * 4 - i * 2
        const yPos = -8 + i * 3 + layer * 2
        const rotation = -0.4 - i * 0.15

        // Feather shadow
        const featherShadow = scene.add.ellipse(xPos + 2, yPos + 1, 6 - layer, 12 - layer, 0x000000, 0.2)
        featherShadow.setRotation(rotation)
        this.bodyContainer.add(featherShadow)

        // Dark base
        const featherDarkLayer = scene.add.ellipse(xPos + 1, yPos, 5.5 - layer, 11.5 - layer, featherDark)
        featherDarkLayer.setRotation(rotation)
        this.bodyContainer.add(featherDarkLayer)

        // Main feather
        const feather = scene.add.ellipse(xPos, yPos, 5 - layer, 11 - layer, darkColor)
        feather.setRotation(rotation)
        feather.setStrokeStyle(1, featherDark, 0.8)
        this.bodyContainer.add(feather)

        // Feather highlight
        const featherHighlight = scene.add.ellipse(xPos - 1, yPos - 2, 3 - layer * 0.5, 7 - layer, lightColor, 0.6)
        featherHighlight.setRotation(rotation)
        this.bodyContainer.add(featherHighlight)

        // Feather spine
        const spine = scene.add.rectangle(xPos, yPos, 0.5, 11 - layer, featherDark, 0.6)
        spine.setRotation(rotation)
        this.bodyContainer.add(spine)

        wingFeathers.push(feather)
      }
    }

    // Right Wing - Mirror of left
    for (let layer = 0; layer < 3; layer++) {
      for (let i = 0; i < 4; i++) {
        const xPos = 10 + layer * 4 + i * 2
        const yPos = -8 + i * 3 + layer * 2
        const rotation = 0.4 + i * 0.15

        const featherShadow = scene.add.ellipse(xPos + 2, yPos + 1, 6 - layer, 12 - layer, 0x000000, 0.2)
        featherShadow.setRotation(rotation)
        this.bodyContainer.add(featherShadow)

        const featherDarkLayer = scene.add.ellipse(xPos + 1, yPos, 5.5 - layer, 11.5 - layer, featherDark)
        featherDarkLayer.setRotation(rotation)
        this.bodyContainer.add(featherDarkLayer)

        const feather = scene.add.ellipse(xPos, yPos, 5 - layer, 11 - layer, darkColor)
        feather.setRotation(rotation)
        feather.setStrokeStyle(1, featherDark, 0.8)
        this.bodyContainer.add(feather)

        const featherHighlight = scene.add.ellipse(xPos + 1, yPos - 2, 3 - layer * 0.5, 7 - layer, lightColor, 0.6)
        featherHighlight.setRotation(rotation)
        this.bodyContainer.add(featherHighlight)

        const spine = scene.add.rectangle(xPos, yPos, 0.5, 11 - layer, featherDark, 0.6)
        spine.setRotation(rotation)
        this.bodyContainer.add(spine)

        wingFeathers.push(feather)
      }
    }

    this.characterParts.wings = wingFeathers

    // =========================
    // NECK
    // =========================
    const neckShadow = scene.add.ellipse(2, -13, 10, 8, 0x000000, 0.3)
    this.bodyContainer.add(neckShadow)

    const neck = scene.add.ellipse(0, -14, 9, 7, mainColor)
    this.bodyContainer.add(neck)

    const neckHighlight = scene.add.ellipse(-2, -15, 5, 4, lightColor, 0.5)
    this.bodyContainer.add(neckHighlight)

    // =========================
    // HEAD - Detailed falcon head
    // =========================
    const headShadowDeep = scene.add.circle(3, -19, 10, 0x000000, 0.3)
    this.bodyContainer.add(headShadowDeep)

    const headDark = scene.add.circle(1, -21, 9.5, darkColor)
    this.bodyContainer.add(headDark)

    const head = scene.add.circle(0, -22, 9, mainColor)
    head.setStrokeStyle(2, featherDark, 0.8)
    this.bodyContainer.add(head)
    this.characterParts.head = head

    // Head markings - distinctive falcon eye stripe
    const eyeStripe = scene.add.ellipse(5, -22, 3, 8, 0x2C3E50)
    eyeStripe.setRotation(0.3)
    this.bodyContainer.add(eyeStripe)

    // Crown feathers
    for (let i = 0; i < 3; i++) {
      const crownFeather = scene.add.ellipse(-2 + i * 2, -28 + i, 2.5, 6, darkColor, 0.8)
      crownFeather.setRotation(-0.2 + i * 0.2)
      this.bodyContainer.add(crownFeather)
    }

    const headHighlight1 = scene.add.circle(-3, -24, 5, lightColor, 0.6)
    this.bodyContainer.add(headHighlight1)

    const headSpecular = scene.add.circle(-4, -25, 2.5, 0xFFFFFF, 0.7)
    this.bodyContainer.add(headSpecular)

    // =========================
    // BEAK - Hooked raptor beak
    // =========================
    // Upper beak (hooked)
    const beakUpperShadow = scene.add.triangle(3, -19, -4, -2, 8, -2, 8, 3, 0x000000, 0.3)
    this.bodyContainer.add(beakUpperShadow)

    const beakUpperDark = scene.add.triangle(2, -20, -4, -2, 8, -2, 8, 3, this.getDarkerColor(beakColor, 40))
    this.bodyContainer.add(beakUpperDark)

    const beakUpper = scene.add.triangle(0, -22, -4, -2, 8, -2, 8, 3, beakColor)
    beakUpper.setStrokeStyle(1.5, this.getDarkerColor(beakColor, 60), 1)
    this.bodyContainer.add(beakUpper)

    // Hooked tip
    const beakHook = scene.add.circle(8, -22, 2, beakColor)
    beakHook.setStrokeStyle(1.5, this.getDarkerColor(beakColor, 60), 1)
    this.bodyContainer.add(beakHook)

    // Lower beak
    const beakLower = scene.add.triangle(0, -22, -2, 2, 6, 2, 6, 5, this.getDarkerColor(beakColor, 20))
    beakLower.setStrokeStyle(1, this.getDarkerColor(beakColor, 60), 1)
    this.bodyContainer.add(beakLower)

    // Nostril
    const nostril = scene.add.circle(2, -22, 0.8, 0x000000)
    this.bodyContainer.add(nostril)

    const beakHighlight = scene.add.triangle(-1, -23, -2, -1, 5, -1, 5, 1, this.getLighterColor(beakColor, 40), 0.7)
    this.bodyContainer.add(beakHighlight)

    this.characterParts.weapon = beakUpper

    // =========================
    // EYES - Sharp, focused raptor eyes
    // =========================
    const eyeWhite = scene.add.circle(5, -22, 3.5, 0xF5F5DC)
    this.bodyContainer.add(eyeWhite)

    const eyeIris = scene.add.circle(5, -22, 2.8, 0xFFD700)
    this.bodyContainer.add(eyeIris)

    const eyePupil = scene.add.circle(5.5, -22, 1.8, 0x000000)
    this.bodyContainer.add(eyePupil)

    const eyeHighlight = scene.add.circle(6, -23, 1, 0xFFFFFF, 0.9)
    this.bodyContainer.add(eyeHighlight)

    const eyeSpecular = scene.add.circle(6.5, -23.5, 0.5, 0xFFFFFF)
    this.bodyContainer.add(eyeSpecular)

    // Eye ridge for fierce look
    const eyeRidge = scene.add.ellipse(5, -24, 4, 2, darkColor, 0.7)
    eyeRidge.setRotation(-0.2)
    this.bodyContainer.add(eyeRidge)

    this.characterParts.eyes = [eyePupil]

    // =========================
    // ANIMATIONS
    // =========================
    // Breathing/bobbing
    scene.tweens.add({
      targets: this.bodyContainer,
      y: this.bodyContainer.y + 2,
      scaleY: 1.02,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Wing feathers subtle movement
    scene.tweens.add({
      targets: wingFeathers,
      scaleY: { from: 1, to: 1.08 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Tail feathers sway
    scene.tweens.add({
      targets: tailFeathers,
      scaleX: { from: 1, to: 1.05 },
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 200
    })

    this.addGlow(scene, mainColor, 30)
  }

  // 2. Ambitious Angel - Angel with halo and wings
  private createAngel(scene: Phaser.Scene) {
    // Create rotating body container
    this.bodyContainer = scene.add.container(0, 0)
    this.add(this.bodyContainer)

    const robeColor = 0xF8F8FF // White/light robe
    const robeDark = this.getDarkerColor(robeColor, 40)
    const skinColor = 0xFFCCBC
    const skinDark = this.getDarkerColor(skinColor, 30)
    const skinLight = this.getLighterColor(skinColor, 30)
    const hairColor = 0xFFD700 // Golden hair
    const wingColor = 0xFFFFFF

    // =========================
    // LEGS & FEET (under robe)
    // =========================
    // Left foot
    const leftFootShadow = scene.add.ellipse(-4, 16, 6, 4, 0x000000, 0.3)
    this.bodyContainer.add(leftFootShadow)
    const leftFoot = scene.add.ellipse(-4, 15, 5, 3, skinColor)
    leftFoot.setStrokeStyle(1, skinDark, 0.8)
    this.bodyContainer.add(leftFoot)

    // Toes on left foot
    for (let i = 0; i < 3; i++) {
      const toe = scene.add.circle(-6 + i * 2, 15, 0.8, skinDark)
      this.bodyContainer.add(toe)
    }

    // Right foot
    const rightFootShadow = scene.add.ellipse(4, 16, 6, 4, 0x000000, 0.3)
    this.bodyContainer.add(rightFootShadow)
    const rightFoot = scene.add.ellipse(4, 15, 5, 3, skinColor)
    rightFoot.setStrokeStyle(1, skinDark, 0.8)
    this.bodyContainer.add(rightFoot)

    // Toes on right foot
    for (let i = 0; i < 3; i++) {
      const toe = scene.add.circle(2 + i * 2, 15, 0.8, skinDark)
      this.bodyContainer.add(toe)
    }

    // =========================
    // ROBE/DRESS - Flowing angelic robe
    // =========================
    const robeShadow = scene.add.ellipse(3, -1, 22, 30, 0x000000, 0.3)
    this.bodyContainer.add(robeShadow)

    // Multiple layers for flowing robe effect
    const robeBase = scene.add.ellipse(1, -3, 21, 29, robeDark, 0.9)
    this.bodyContainer.add(robeBase)

    const robe = scene.add.ellipse(0, -4, 20, 28, robeColor)
    robe.setStrokeStyle(2, robeDark, 0.5)
    this.bodyContainer.add(robe)
    this.towerGraphic = robe
    this.characterParts.body = robe

    // Robe folds/creases for texture
    for (let i = 0; i < 5; i++) {
      const fold = scene.add.ellipse(-2 + i, 2 + i * 3, 18 - i, 3, robeDark, 0.2)
      this.bodyContainer.add(fold)
    }

    // Robe highlights
    const robeHighlight1 = scene.add.ellipse(-4, -6, 10, 16, this.getLighterColor(robeColor, 20), 0.6)
    this.bodyContainer.add(robeHighlight1)

    const robeSpecular = scene.add.circle(-6, -9, 4, 0xFFFFFF, 0.7)
    this.bodyContainer.add(robeSpecular)

    // Waist/Belt - Gold
    const beltShadow = scene.add.rectangle(1, -4, 20, 3, 0x000000, 0.3)
    this.bodyContainer.add(beltShadow)
    const belt = scene.add.rectangle(0, -5, 20, 2.5, hairColor)
    belt.setStrokeStyle(1, this.getDarkerColor(hairColor, 40), 1)
    this.bodyContainer.add(belt)
    const beltHighlight = scene.add.rectangle(-2, -5, 12, 1, this.getLighterColor(hairColor, 40), 0.8)
    this.bodyContainer.add(beltHighlight)

    // =========================
    // TORSO/CHEST (above belt)
    // =========================
    const torsoShadow = scene.add.ellipse(2, -11, 15, 14, 0x000000, 0.2)
    this.bodyContainer.add(torsoShadow)

    const torso = scene.add.ellipse(0, -12, 14, 13, robeColor)
    torso.setStrokeStyle(1, robeDark, 0.5)
    this.bodyContainer.add(torso)

    const torsoHighlight = scene.add.ellipse(-3, -14, 8, 8, this.getLighterColor(robeColor, 20), 0.5)
    this.bodyContainer.add(torsoHighlight)

    // =========================
    // ARMS & HANDS
    // =========================
    // Left arm
    const leftArmShadow = scene.add.rectangle(-11, -8, 4, 14, 0x000000, 0.2)
    leftArmShadow.setRotation(-0.3)
    this.bodyContainer.add(leftArmShadow)

    const leftArm = scene.add.rectangle(-12, -9, 3.5, 13, robeColor)
    leftArm.setRotation(-0.3)
    leftArm.setStrokeStyle(1, robeDark, 0.5)
    this.bodyContainer.add(leftArm)

    // Left hand
    const leftHandShadow = scene.add.circle(-15, -2, 3, 0x000000, 0.3)
    this.bodyContainer.add(leftHandShadow)
    const leftHand = scene.add.circle(-16, -3, 2.5, skinColor)
    leftHand.setStrokeStyle(1, skinDark, 0.8)
    this.bodyContainer.add(leftHand)

    // Left fingers
    for (let i = 0; i < 4; i++) {
      const finger = scene.add.rectangle(-17 - i * 0.5, -3 + i, 0.7, 3, skinColor)
      finger.setRotation(-0.2 - i * 0.1)
      this.bodyContainer.add(finger)
    }

    // Right arm
    const rightArmShadow = scene.add.rectangle(11, -8, 4, 14, 0x000000, 0.2)
    rightArmShadow.setRotation(0.3)
    this.bodyContainer.add(rightArmShadow)

    const rightArm = scene.add.rectangle(12, -9, 3.5, 13, robeColor)
    rightArm.setRotation(0.3)
    rightArm.setStrokeStyle(1, robeDark, 0.5)
    this.bodyContainer.add(rightArm)

    // Right hand
    const rightHandShadow = scene.add.circle(15, -2, 3, 0x000000, 0.3)
    this.bodyContainer.add(rightHandShadow)
    const rightHand = scene.add.circle(16, -3, 2.5, skinColor)
    rightHand.setStrokeStyle(1, skinDark, 0.8)
    this.bodyContainer.add(rightHand)

    // Right fingers
    for (let i = 0; i < 4; i++) {
      const finger = scene.add.rectangle(17 + i * 0.5, -3 + i, 0.7, 3, skinColor)
      finger.setRotation(0.2 + i * 0.1)
      this.bodyContainer.add(finger)
    }

    // =========================
    // NECK
    // =========================
    const neckShadow = scene.add.rectangle(1, -17, 6, 4, 0x000000, 0.2)
    this.bodyContainer.add(neckShadow)
    const neck = scene.add.rectangle(0, -18, 5, 3, skinColor)
    this.bodyContainer.add(neck)

    // =========================
    // HEAD - Detailed human face
    // =========================
    const headShadowDeep = scene.add.circle(3, -22, 9, 0x000000, 0.3)
    this.bodyContainer.add(headShadowDeep)

    const headDark = scene.add.circle(1, -24, 8.5, skinDark)
    this.bodyContainer.add(headDark)

    const head = scene.add.circle(0, -25, 8, skinColor)
    head.setStrokeStyle(1.5, skinDark, 0.7)
    this.bodyContainer.add(head)
    this.characterParts.head = head

    const headHighlight = scene.add.circle(-3, -27, 4, skinLight, 0.7)
    this.bodyContainer.add(headHighlight)

    const headSpecular = scene.add.circle(-4, -28, 2, 0xFFFFFF, 0.6)
    this.bodyContainer.add(headSpecular)

    // EYES - Detailed with iris
    const eyeLWhite = scene.add.ellipse(-3, -25, 3, 2.5, 0xFFFFFF)
    this.bodyContainer.add(eyeLWhite)
    const eyeLIris = scene.add.circle(-3, -25, 1.5, 0x4A90E2)
    this.bodyContainer.add(eyeLIris)
    const eyeLPupil = scene.add.circle(-3, -25, 0.8, 0x000000)
    this.bodyContainer.add(eyeLPupil)
    const eyeLHighlight = scene.add.circle(-2.5, -25.5, 0.5, 0xFFFFFF)
    this.bodyContainer.add(eyeLHighlight)

    const eyeRWhite = scene.add.ellipse(3, -25, 3, 2.5, 0xFFFFFF)
    this.bodyContainer.add(eyeRWhite)
    const eyeRIris = scene.add.circle(3, -25, 1.5, 0x4A90E2)
    this.bodyContainer.add(eyeRIris)
    const eyeRPupil = scene.add.circle(3, -25, 0.8, 0x000000)
    this.bodyContainer.add(eyeRPupil)
    const eyeRHighlight = scene.add.circle(3.5, -25.5, 0.5, 0xFFFFFF)
    this.bodyContainer.add(eyeRHighlight)

    // Eyebrows
    const eyebrowL = scene.add.ellipse(-3, -28, 3.5, 1, this.getDarkerColor(hairColor, 30), 0.8)
    this.bodyContainer.add(eyebrowL)
    const eyebrowR = scene.add.ellipse(3, -28, 3.5, 1, this.getDarkerColor(hairColor, 30), 0.8)
    this.bodyContainer.add(eyebrowR)

    this.characterParts.eyes = [eyeLPupil, eyeRPupil]

    // NOSE
    const nose = scene.add.triangle(0, -24, -1, 0, 1, 0, 0, 3, skinDark, 0.5)
    this.bodyContainer.add(nose)
    const noseHighlight = scene.add.circle(-0.5, -24, 0.8, skinLight, 0.6)
    this.bodyContainer.add(noseHighlight)

    // MOUTH - Gentle smile
    const mouth = scene.add.ellipse(0, -21, 3, 1.5, 0xCC6666, 0.7)
    this.bodyContainer.add(mouth)
    const mouthHighlight = scene.add.ellipse(-0.5, -21.5, 2, 0.8, 0xFF9999, 0.5)
    this.bodyContainer.add(mouthHighlight)

    // =========================
    // HAIR - Golden flowing hair
    // =========================
    // Back hair layer
    for (let i = 0; i < 5; i++) {
      const hairStrand = scene.add.ellipse(-4 + i * 2, -30 + i * 0.5, 3, 12 - i, hairColor, 0.8)
      this.bodyContainer.add(hairStrand)
    }

    // Hair texture/highlights
    for (let i = 0; i < 4; i++) {
      const hairHighlight = scene.add.ellipse(-3 + i * 2, -31, 2, 8, this.getLighterColor(hairColor, 40), 0.5)
      this.bodyContainer.add(hairHighlight)
    }

    // Front hair/bangs
    for (let i = 0; i < 3; i++) {
      const bang = scene.add.ellipse(-2 + i * 2, -29, 2.5, 6, hairColor)
      this.bodyContainer.add(bang)
    }

    // =========================
    // HALO - Glowing golden halo
    // =========================
    const haloGlow = scene.add.circle(0, -34, 16, hairColor, 0.15)
    this.add(haloGlow)

    const haloOuter = scene.add.circle(0, -34, 13, hairColor, 0)
    haloOuter.setStrokeStyle(3, this.getLighterColor(hairColor, 30), 0.6)
    this.add(haloOuter)

    const halo = scene.add.circle(0, -34, 12, hairColor, 0)
    halo.setStrokeStyle(4, hairColor, 1)
    this.add(halo)

    const haloInner = scene.add.circle(0, -34, 11, 0xFFFFFF, 0)
    haloInner.setStrokeStyle(2, 0xFFFFFF, 0.8)
    this.add(haloInner)

    this.characterParts.accessories = [halo]

    // =========================
    // WINGS - Detailed feathered angel wings
    // =========================
    const wingFeathers: Phaser.GameObjects.Shape[] = []

    // Left Wing - Large, layered feathers
    for (let layer = 0; layer < 4; layer++) {
      for (let i = 0; i < 5; i++) {
        const xPos = -8 - layer * 3 - i * 2.5
        const yPos = -12 + i * 4 + layer * 1.5
        const rotation = -0.2 - i * 0.12 - layer * 0.05

        // Feather shadow
        const featherShadow = scene.add.ellipse(xPos + 2, yPos + 1, 7 - layer * 0.5, 14 - layer, 0x000000, 0.15)
        featherShadow.setRotation(rotation)
        this.bodyContainer.add(featherShadow)

        // Dark base
        const featherBase = scene.add.ellipse(xPos + 1, yPos, 6.5 - layer * 0.5, 13.5 - layer, this.getDarkerColor(wingColor, 50))
        featherBase.setRotation(rotation)
        this.bodyContainer.add(featherBase)

        // Main feather
        const feather = scene.add.ellipse(xPos, yPos, 6 - layer * 0.5, 13 - layer, wingColor)
        feather.setRotation(rotation)
        feather.setStrokeStyle(0.8, this.getDarkerColor(wingColor, 60), 0.6)
        this.bodyContainer.add(feather)

        // Feather highlight
        const featherHighlight = scene.add.ellipse(xPos - 1, yPos - 2, 4 - layer * 0.5, 9 - layer, this.getLighterColor(wingColor, 30), 0.7)
        featherHighlight.setRotation(rotation)
        this.bodyContainer.add(featherHighlight)

        // Feather shine
        const featherShine = scene.add.ellipse(xPos - 1.5, yPos - 3, 2 - layer * 0.3, 5 - layer * 0.5, 0xFFFFFF, 0.5)
        featherShine.setRotation(rotation)
        this.bodyContainer.add(featherShine)

        wingFeathers.push(feather)
      }
    }

    // Right Wing - Mirror of left
    for (let layer = 0; layer < 4; layer++) {
      for (let i = 0; i < 5; i++) {
        const xPos = 8 + layer * 3 + i * 2.5
        const yPos = -12 + i * 4 + layer * 1.5
        const rotation = 0.2 + i * 0.12 + layer * 0.05

        const featherShadow = scene.add.ellipse(xPos + 2, yPos + 1, 7 - layer * 0.5, 14 - layer, 0x000000, 0.15)
        featherShadow.setRotation(rotation)
        this.bodyContainer.add(featherShadow)

        const featherBase = scene.add.ellipse(xPos + 1, yPos, 6.5 - layer * 0.5, 13.5 - layer, this.getDarkerColor(wingColor, 50))
        featherBase.setRotation(rotation)
        this.bodyContainer.add(featherBase)

        const feather = scene.add.ellipse(xPos, yPos, 6 - layer * 0.5, 13 - layer, wingColor)
        feather.setRotation(rotation)
        feather.setStrokeStyle(0.8, this.getDarkerColor(wingColor, 60), 0.6)
        this.bodyContainer.add(feather)

        const featherHighlight = scene.add.ellipse(xPos + 1, yPos - 2, 4 - layer * 0.5, 9 - layer, this.getLighterColor(wingColor, 30), 0.7)
        featherHighlight.setRotation(rotation)
        this.bodyContainer.add(featherHighlight)

        const featherShine = scene.add.ellipse(xPos + 1.5, yPos - 3, 2 - layer * 0.3, 5 - layer * 0.5, 0xFFFFFF, 0.5)
        featherShine.setRotation(rotation)
        this.bodyContainer.add(featherShine)

        wingFeathers.push(feather)
      }
    }

    this.characterParts.wings = wingFeathers

    // =========================
    // ANIMATIONS
    // =========================
    // Gentle floating
    scene.tweens.add({
      targets: this.bodyContainer,
      y: this.bodyContainer.y + 3,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Halo pulse
    scene.tweens.add({
      targets: [halo, haloInner, haloOuter],
      scale: { from: 1, to: 1.15 },
      alpha: { from: 1, to: 0.6 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    scene.tweens.add({
      targets: haloGlow,
      scale: { from: 1, to: 1.3 },
      alpha: { from: 0.15, to: 0.05 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Wing feathers gentle movement
    scene.tweens.add({
      targets: wingFeathers,
      scaleY: { from: 1, to: 1.06 },
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Robe sway
    scene.tweens.add({
      targets: robe,
      scaleX: { from: 1, to: 1.03 },
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 300
    })

    this.addGlow(scene, hairColor, 32)
  }

  // 3. Motivated Monster - Monster with horns
  private createMonster(scene: Phaser.Scene) {
    // Use sprite sheet instead of procedural graphics
    const mainColor = 0x5FD363 // Green

    // Create body container for consistency with other towers
    this.bodyContainer = scene.add.container(0, 0)
    this.add(this.bodyContainer)

    // Create sprite (frames are 540x450, so scale down)
    this.monsterSprite = scene.add.sprite(0, -5, 'motivated-monster', 0)
    this.monsterSprite.setScale(0.23) // Scale down from 450px height to ~103px - larger for better visibility
    this.monsterSprite.setOrigin(0.5, 0.5) // Center origin to show full character including feet
    // Set texture to use nearest-neighbor filtering to prevent frame bleeding
    this.monsterSprite.setTexture('motivated-monster', 0)
    this.monsterSprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST)
    this.bodyContainer.add(this.monsterSprite)

    // Set towerGraphic for interaction
    this.towerGraphic = this.monsterSprite as any

    // Make the sprite interactive
    this.monsterSprite.setInteractive()

    // Play idle animation if it exists
    if (scene.anims.exists('monster-idle-front')) {
      this.monsterSprite.play('monster-idle-front')
    }

    this.addGlow(scene, mainColor, 30)
  }

  // 4. Dialed In Dog - Dog with floppy ears
  private createDog(scene: Phaser.Scene) {
    this.bodyContainer = scene.add.container(0, 0)
    this.add(this.bodyContainer)

    const mainColor = 0xB0B0B0 // Gray
    const darkColor = this.getDarkerColor(mainColor, 50)
    const lightColor = this.getLighterColor(mainColor, 50)
    const furColor = 0x9E9E9E // Medium gray for fur
    const pawPadColor = 0xFF69B4 // Pink paw pads
    const tongueColor = 0xFF1744 // Red tongue
    const collarColor = 0xFF5722 // Orange collar
    const tagColor = 0xFFD700 // Gold tag

    // =========================
    // TAIL (behind body) - Wagging tail
    // =========================
    const tailParts: Phaser.GameObjects.Shape[] = []

    // Tail segments
    for (let i = 0; i < 5; i++) {
      const xPos = 10 + i * 3
      const yPos = 0 + i * 1.5
      const size = 6 - i * 0.8

      const tailShadow = scene.add.circle(xPos + 1, yPos + 1, size + 1, 0x000000, 0.3)
      this.bodyContainer.add(tailShadow)

      const tailSegment = scene.add.circle(xPos, yPos, size, darkColor)
      this.bodyContainer.add(tailSegment)

      // Fur texture
      for (let f = 0; f < 3; f++) {
        const angle = (f / 3) * Math.PI * 2
        const furX = xPos + Math.cos(angle) * (size * 0.5)
        const furY = yPos + Math.sin(angle) * (size * 0.5)
        const fur = scene.add.circle(furX, furY, size * 0.3, furColor, 0.6)
        this.bodyContainer.add(fur)
      }

      tailParts.push(tailSegment)
    }

    // Tail tip
    const tailTip = scene.add.ellipse(22, 6, 5, 7, mainColor, 0.8)
    tailTip.setRotation(0.5)
    this.bodyContainer.add(tailTip)
    tailParts.push(tailTip)

    // =========================
    // BACK LEGS (behind body)
    // =========================
    // Back Left Leg
    const backLeftThigh = scene.add.ellipse(-7, 4, 7, 11, mainColor)
    backLeftThigh.setRotation(-0.2)
    this.bodyContainer.add(backLeftThigh)

    const backLeftCalf = scene.add.ellipse(-8, 11, 6, 9, darkColor)
    backLeftCalf.setRotation(-0.3)
    this.bodyContainer.add(backLeftCalf)

    const backLeftPaw = scene.add.ellipse(-9, 17, 7, 5, this.getDarkerColor(darkColor, 20))
    this.bodyContainer.add(backLeftPaw)

    // Paw pads
    const backLeftPad = scene.add.ellipse(-9, 18, 4, 3, pawPadColor, 0.8)
    this.bodyContainer.add(backLeftPad)

    for (let i = 0; i < 4; i++) {
      const pad = scene.add.circle(-11 + i * 1.5, 16, 0.8, pawPadColor, 0.8)
      this.bodyContainer.add(pad)
    }

    // Back Right Leg
    const backRightThigh = scene.add.ellipse(7, 4, 7, 11, mainColor)
    backRightThigh.setRotation(0.2)
    this.bodyContainer.add(backRightThigh)

    const backRightCalf = scene.add.ellipse(8, 11, 6, 9, darkColor)
    backRightCalf.setRotation(0.3)
    this.bodyContainer.add(backRightCalf)

    const backRightPaw = scene.add.ellipse(9, 17, 7, 5, this.getDarkerColor(darkColor, 20))
    this.bodyContainer.add(backRightPaw)

    const backRightPad = scene.add.ellipse(9, 18, 4, 3, pawPadColor, 0.8)
    this.bodyContainer.add(backRightPad)

    for (let i = 0; i < 4; i++) {
      const pad = scene.add.circle(7 + i * 1.5, 16, 0.8, pawPadColor, 0.8)
      this.bodyContainer.add(pad)
    }

    // =========================
    // BODY - Fluffy dog body with fur texture
    // =========================
    const bodyShadowDeep = scene.add.ellipse(3, 0, 24, 22, 0x000000, 0.3)
    this.bodyContainer.add(bodyShadowDeep)

    const bodyBase = scene.add.ellipse(1, -2, 23, 21, darkColor, 0.9)
    this.bodyContainer.add(bodyBase)

    const body = scene.add.ellipse(0, -3, 22, 20, mainColor)
    body.setStrokeStyle(2, darkColor, 0.8)
    this.bodyContainer.add(body)
    this.towerGraphic = body
    this.characterParts.body = body

    // Fur texture - overlapping circles
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        const furX = -9 + col * 6
        const furY = -9 + row * 6
        const furPatch = scene.add.circle(furX, furY, 3.5, furColor, 0.5)
        this.bodyContainer.add(furPatch)
      }
    }

    const bodyHighlight = scene.add.ellipse(-4, -7, 11, 9, lightColor, 0.5)
    this.bodyContainer.add(bodyHighlight)

    const bodySpecular = scene.add.circle(-6, -9, 4, 0xFFFFFF, 0.4)
    this.bodyContainer.add(bodySpecular)

    // =========================
    // FRONT LEGS (in front of body)
    // =========================
    // Front Left Leg
    const frontLeftUpper = scene.add.ellipse(-8, 1, 6, 10, mainColor)
    frontLeftUpper.setRotation(-0.1)
    this.bodyContainer.add(frontLeftUpper)

    const frontLeftLower = scene.add.ellipse(-9, 8, 5, 8, darkColor)
    frontLeftLower.setRotation(-0.2)
    this.bodyContainer.add(frontLeftLower)

    const frontLeftPaw = scene.add.ellipse(-10, 15, 6, 4, this.getDarkerColor(darkColor, 20))
    this.bodyContainer.add(frontLeftPaw)

    const frontLeftPad = scene.add.ellipse(-10, 16, 3, 2, pawPadColor, 0.8)
    this.bodyContainer.add(frontLeftPad)

    for (let i = 0; i < 4; i++) {
      const pad = scene.add.circle(-12 + i * 1.5, 14, 0.7, pawPadColor, 0.8)
      this.bodyContainer.add(pad)
    }

    // Front Right Leg
    const frontRightUpper = scene.add.ellipse(8, 1, 6, 10, mainColor)
    frontRightUpper.setRotation(0.1)
    this.bodyContainer.add(frontRightUpper)

    const frontRightLower = scene.add.ellipse(9, 8, 5, 8, darkColor)
    frontRightLower.setRotation(0.2)
    this.bodyContainer.add(frontRightLower)

    const frontRightPaw = scene.add.ellipse(10, 15, 6, 4, this.getDarkerColor(darkColor, 20))
    this.bodyContainer.add(frontRightPaw)

    const frontRightPad = scene.add.ellipse(10, 16, 3, 2, pawPadColor, 0.8)
    this.bodyContainer.add(frontRightPad)

    for (let i = 0; i < 4; i++) {
      const pad = scene.add.circle(8 + i * 1.5, 14, 0.7, pawPadColor, 0.8)
      this.bodyContainer.add(pad)
    }

    // =========================
    // COLLAR with TAG
    // =========================
    const collarShadow = scene.add.ellipse(1, -11, 18, 6, 0x000000, 0.3)
    this.bodyContainer.add(collarShadow)

    const collar = scene.add.ellipse(0, -12, 17, 5, collarColor)
    collar.setStrokeStyle(1, this.getDarkerColor(collarColor, 30))
    this.bodyContainer.add(collar)

    const collarBuckle = scene.add.rectangle(0, -12, 3, 4, 0xC0C0C0)
    this.bodyContainer.add(collarBuckle)

    // Dog tag
    const tagShadow = scene.add.circle(1, -8, 3, 0x000000, 0.3)
    this.bodyContainer.add(tagShadow)

    const tag = scene.add.circle(0, -9, 2.5, tagColor)
    tag.setStrokeStyle(0.5, this.getDarkerColor(tagColor, 40))
    this.bodyContainer.add(tag)

    this.characterParts.accessories = [collar, tag]

    // =========================
    // HEAD - Rounded dog head
    // =========================
    const headShadowDeep = scene.add.circle(3, -16, 13, 0x000000, 0.3)
    this.bodyContainer.add(headShadowDeep)

    const headDark = scene.add.circle(1, -18, 12.5, darkColor)
    this.bodyContainer.add(headDark)

    const head = scene.add.circle(0, -19, 12, mainColor)
    head.setStrokeStyle(2, darkColor, 0.8)
    this.bodyContainer.add(head)
    this.characterParts.head = head

    const headHighlight = scene.add.circle(-3, -21, 6, lightColor, 0.5)
    this.bodyContainer.add(headHighlight)

    // =========================
    // EARS - Floppy ears
    // =========================
    // Left Ear
    const leftEarShadow = scene.add.ellipse(-8, -18, 9, 16, 0x000000, 0.25)
    leftEarShadow.setRotation(-0.4)
    this.bodyContainer.add(leftEarShadow)

    const leftEarDark = scene.add.ellipse(-10, -20, 8.5, 15.5, this.getDarkerColor(darkColor, 20))
    leftEarDark.setRotation(-0.4)
    this.bodyContainer.add(leftEarDark)

    const leftEar = scene.add.ellipse(-11, -21, 8, 15, darkColor)
    leftEar.setRotation(-0.4)
    leftEar.setStrokeStyle(1, this.getDarkerColor(darkColor, 30))
    this.bodyContainer.add(leftEar)

    const leftEarInner = scene.add.ellipse(-11, -21, 5, 9, 0xFF9999, 0.6)
    leftEarInner.setRotation(-0.4)
    this.bodyContainer.add(leftEarInner)

    const leftEarHighlight = scene.add.ellipse(-12, -24, 4, 7, this.getLighterColor(darkColor, 30), 0.6)
    leftEarHighlight.setRotation(-0.4)
    this.bodyContainer.add(leftEarHighlight)

    // Right Ear
    const rightEarShadow = scene.add.ellipse(8, -18, 9, 16, 0x000000, 0.25)
    rightEarShadow.setRotation(0.4)
    this.bodyContainer.add(rightEarShadow)

    const rightEarDark = scene.add.ellipse(10, -20, 8.5, 15.5, this.getDarkerColor(darkColor, 20))
    rightEarDark.setRotation(0.4)
    this.bodyContainer.add(rightEarDark)

    const rightEar = scene.add.ellipse(11, -21, 8, 15, darkColor)
    rightEar.setRotation(0.4)
    rightEar.setStrokeStyle(1, this.getDarkerColor(darkColor, 30))
    this.bodyContainer.add(rightEar)

    const rightEarInner = scene.add.ellipse(11, -21, 5, 9, 0xFF9999, 0.6)
    rightEarInner.setRotation(0.4)
    this.bodyContainer.add(rightEarInner)

    const rightEarHighlight = scene.add.ellipse(12, -24, 4, 7, this.getLighterColor(darkColor, 30), 0.6)
    rightEarHighlight.setRotation(0.4)
    this.bodyContainer.add(rightEarHighlight)

    // =========================
    // SNOUT/MUZZLE
    // =========================
    const snoutShadow = scene.add.ellipse(2, -14, 11, 9, 0x000000, 0.3)
    this.bodyContainer.add(snoutShadow)

    const snout = scene.add.ellipse(0, -15, 10, 8, this.getLighterColor(mainColor, 20))
    this.bodyContainer.add(snout)

    const snoutHighlight = scene.add.ellipse(-2, -16, 5, 4, lightColor, 0.6)
    this.bodyContainer.add(snoutHighlight)

    // Nose
    const noseShadow = scene.add.circle(1, -14, 3, 0x000000, 0.3)
    this.bodyContainer.add(noseShadow)

    const nose = scene.add.circle(0, -15, 2.5, 0x000000)
    this.bodyContainer.add(nose)

    const noseHighlight = scene.add.circle(-0.5, -15.5, 1, 0x555555, 0.7)
    this.bodyContainer.add(noseHighlight)

    // Nostrils
    const nostrilL = scene.add.ellipse(-0.7, -14.5, 0.7, 1, 0x333333)
    this.bodyContainer.add(nostrilL)

    const nostrilR = scene.add.ellipse(0.7, -14.5, 0.7, 1, 0x333333)
    this.bodyContainer.add(nostrilR)

    // =========================
    // MOUTH - Friendly smile with tongue
    // =========================
    const mouthShadow = scene.add.ellipse(1, -12, 7, 4, 0x000000, 0.3)
    this.bodyContainer.add(mouthShadow)

    const mouth = scene.add.ellipse(0, -13, 6, 3, 0x1A1A1A, 0.8)
    this.bodyContainer.add(mouth)

    // Tongue hanging out
    const tongueShadow = scene.add.ellipse(1, -10, 4, 6, 0x000000, 0.3)
    this.bodyContainer.add(tongueShadow)

    const tongue = scene.add.ellipse(0, -11, 3.5, 5, tongueColor)
    this.bodyContainer.add(tongue)

    const tongueHighlight = scene.add.ellipse(-0.5, -11.5, 2, 3, this.getLighterColor(tongueColor, 40), 0.7)
    this.bodyContainer.add(tongueHighlight)

    // =========================
    // EYES - Friendly dog eyes
    // =========================
    // Left Eye
    const eyeLWhite = scene.add.circle(-4, -20, 3.5, 0xFFFFFF)
    this.bodyContainer.add(eyeLWhite)

    const eyeLIris = scene.add.circle(-4, -20, 2.5, 0x8B4513)
    this.bodyContainer.add(eyeLIris)

    const eyeLPupil = scene.add.circle(-3.5, -20, 1.5, 0x000000)
    this.bodyContainer.add(eyeLPupil)

    const eyeLHighlight = scene.add.circle(-3, -20.5, 1, 0xFFFFFF)
    this.bodyContainer.add(eyeLHighlight)

    // Right Eye
    const eyeRWhite = scene.add.circle(4, -20, 3.5, 0xFFFFFF)
    this.bodyContainer.add(eyeRWhite)

    const eyeRIris = scene.add.circle(4, -20, 2.5, 0x8B4513)
    this.bodyContainer.add(eyeRIris)

    const eyeRPupil = scene.add.circle(4.5, -20, 1.5, 0x000000)
    this.bodyContainer.add(eyeRPupil)

    const eyeRHighlight = scene.add.circle(5, -20.5, 1, 0xFFFFFF)
    this.bodyContainer.add(eyeRHighlight)

    this.characterParts.eyes = [eyeLPupil, eyeRPupil]

    // =========================
    // ANIMATIONS
    // =========================
    // Breathing/panting
    scene.tweens.add({
      targets: this.bodyContainer,
      y: this.bodyContainer.y + 1.5,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Tail wagging
    scene.tweens.add({
      targets: tailParts,
      rotation: { from: -0.2, to: 0.2 },
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Ear flopping
    scene.tweens.add({
      targets: [leftEar, leftEarInner, leftEarHighlight],
      rotation: { from: -0.4, to: -0.5 },
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    scene.tweens.add({
      targets: [rightEar, rightEarInner, rightEarHighlight],
      rotation: { from: 0.4, to: 0.5 },
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 200
    })

    // Tongue panting
    scene.tweens.add({
      targets: [tongue, tongueHighlight],
      scaleY: { from: 1, to: 1.1 },
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    this.addGlow(scene, mainColor, 28)
  }

  // 5. Empathy Elephant - Elephant with trunk and big ears
  private createElephant(scene: Phaser.Scene) {
    // Use sprite sheet instead of procedural graphics
    const mainColor = 0x42A5F5 // Blue

    // Create body container for consistency with other towers
    this.bodyContainer = scene.add.container(0, 0)
    this.add(this.bodyContainer)

    // Create sprite (frames are 540x450, so scale down)
    this.elephantSprite = scene.add.sprite(0, -5, 'empathy-elephant', 0)
    this.elephantSprite.setScale(0.23) // Scale down from 450px height to ~103px - larger for better visibility
    this.elephantSprite.setOrigin(0.5, 0.5) // Center origin to show full character including feet
    // Set texture to use nearest-neighbor filtering to prevent frame bleeding
    this.elephantSprite.setTexture('empathy-elephant', 0)
    this.elephantSprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST)
    this.bodyContainer.add(this.elephantSprite)

    // Set towerGraphic for interaction
    this.towerGraphic = this.elephantSprite as any

    // Make the sprite interactive
    this.elephantSprite.setInteractive()

    // Play idle animation if it exists
    if (scene.anims.exists('elephant-idle-front')) {
      this.elephantSprite.play('elephant-idle-front')
    }

    this.addGlow(scene, mainColor, 32)
  }

  // 6. Adaptable Alien - Alien with big eyes and antennae
  private createAlien(scene: Phaser.Scene) {
    // Create rotating body container
    this.bodyContainer = scene.add.container(0, 0)
    this.add(this.bodyContainer)

    const mainColor = 0xF06292
    const darkColor = this.getDarkerColor(mainColor, 50)
    const lightColor = this.getLighterColor(mainColor, 50)
    const skinColor = 0xE91E63
    const fingerColor = this.getDarkerColor(skinColor, 20)

    // =========================
    // LEGS & FEET (behind body)
    // =========================
    // Left leg
    const leftLegShadow = scene.add.ellipse(-6, 6, 6, 13, 0x000000, 0.3)
    this.bodyContainer.add(leftLegShadow)
    const leftLeg = scene.add.ellipse(-7, 5, 5, 12, mainColor)
    leftLeg.setStrokeStyle(2, darkColor, 0.8)
    this.bodyContainer.add(leftLeg)
    const leftLegHighlight = scene.add.ellipse(-8, 3, 3, 8, lightColor, 0.5)
    this.bodyContainer.add(leftLegHighlight)

    // Left foot - alien-style with 3 toes
    const leftFootShadow = scene.add.ellipse(-7, 13, 6, 4, 0x000000, 0.3)
    this.bodyContainer.add(leftFootShadow)
    const leftFoot = scene.add.ellipse(-7, 12, 5, 3, skinColor)
    leftFoot.setStrokeStyle(1, fingerColor, 0.8)
    this.bodyContainer.add(leftFoot)

    // Left toes with suction cups
    for (let i = 0; i < 3; i++) {
      const toeX = -9 + i * 2
      const toeShadow = scene.add.circle(toeX + 1, 14, 1.5, 0x000000, 0.3)
      this.bodyContainer.add(toeShadow)
      const toe = scene.add.circle(toeX, 13, 1.3, fingerColor)
      toe.setStrokeStyle(1, this.getDarkerColor(fingerColor, 30), 0.8)
      this.bodyContainer.add(toe)
      // Suction cup detail
      const sucCup = scene.add.circle(toeX, 13, 0.7, this.getLighterColor(fingerColor, 30), 0.6)
      this.bodyContainer.add(sucCup)
    }

    // Right leg
    const rightLegShadow = scene.add.ellipse(6, 6, 6, 13, 0x000000, 0.3)
    this.bodyContainer.add(rightLegShadow)
    const rightLeg = scene.add.ellipse(7, 5, 5, 12, mainColor)
    rightLeg.setStrokeStyle(2, darkColor, 0.8)
    this.bodyContainer.add(rightLeg)
    const rightLegHighlight = scene.add.ellipse(8, 3, 3, 8, lightColor, 0.5)
    this.bodyContainer.add(rightLegHighlight)

    // Right foot
    const rightFootShadow = scene.add.ellipse(7, 13, 6, 4, 0x000000, 0.3)
    this.bodyContainer.add(rightFootShadow)
    const rightFoot = scene.add.ellipse(7, 12, 5, 3, skinColor)
    rightFoot.setStrokeStyle(1, fingerColor, 0.8)
    this.bodyContainer.add(rightFoot)

    // Right toes with suction cups
    for (let i = 0; i < 3; i++) {
      const toeX = 5 + i * 2
      const toeShadow = scene.add.circle(toeX + 1, 14, 1.5, 0x000000, 0.3)
      this.bodyContainer.add(toeShadow)
      const toe = scene.add.circle(toeX, 13, 1.3, fingerColor)
      toe.setStrokeStyle(1, this.getDarkerColor(fingerColor, 30), 0.8)
      this.bodyContainer.add(toe)
      // Suction cup detail
      const sucCup = scene.add.circle(toeX, 13, 0.7, this.getLighterColor(fingerColor, 30), 0.6)
      this.bodyContainer.add(sucCup)
    }

    // =========================
    // BODY - Multi-layered 3D effect with texture patterns
    // =========================
    const bodyShadowDeep = scene.add.circle(3, -3, 14, 0x000000, 0.3)
    this.bodyContainer.add(bodyShadowDeep)

    const bodyBase1 = scene.add.circle(1, -4, 13.5, darkColor, 0.9)
    this.bodyContainer.add(bodyBase1)

    const body = scene.add.circle(0, -5, 14, mainColor)
    body.setStrokeStyle(3, 0x000000, 0.8)
    this.bodyContainer.add(body)
    this.towerGraphic = body
    this.characterParts.body = body

    const bodyHighlight1 = scene.add.circle(-2, -7, 8, lightColor, 0.5)
    this.bodyContainer.add(bodyHighlight1)

    const bodyHighlight2 = scene.add.circle(-3, -8, 5, this.getLighterColor(mainColor, 70), 0.6)
    this.bodyContainer.add(bodyHighlight2)

    const bodySpecular = scene.add.circle(-4, -9, 3, 0xFFFFFF, 0.7)
    this.bodyContainer.add(bodySpecular)

    // Alien body texture - bio-luminescent spots
    const spotColor = 0xFF1EFF
    const bioSpots = [
      { x: -4, y: -5 }, { x: 2, y: -3 }, { x: -2, y: 0 },
      { x: 4, y: -7 }, { x: -5, y: 2 }, { x: 3, y: -11 }
    ]
    bioSpots.forEach(spot => {
      const spotGlow = scene.add.circle(spot.x, spot.y, 2.5, spotColor, 0.2)
      this.bodyContainer.add(spotGlow)
      const spotDot = scene.add.circle(spot.x, spot.y, 1.5, spotColor, 0.5)
      this.bodyContainer.add(spotDot)
      const spotCore = scene.add.circle(spot.x - 0.5, spot.y - 0.5, 0.8, this.getLighterColor(spotColor, 60), 0.8)
      this.bodyContainer.add(spotCore)
    })

    // HEAD - Large head with brain-like texture (multiple small bumps)
    const headShadowDeep = scene.add.ellipse(3, -18, 19, 17, 0x000000, 0.3)
    this.bodyContainer.add(headShadowDeep)

    const headDark = scene.add.ellipse(1, -19, 18.5, 16.5, darkColor)
    this.bodyContainer.add(headDark)

    const head = scene.add.ellipse(0, -20, 19, 17, mainColor)
    head.setStrokeStyle(3, 0x000000, 0.8)
    this.bodyContainer.add(head)
    this.characterParts.head = head

    const headHighlight1 = scene.add.ellipse(-3, -23, 10, 9, lightColor, 0.6)
    this.bodyContainer.add(headHighlight1)

    const headHighlight2 = scene.add.ellipse(-4, -24, 7, 6, this.getLighterColor(mainColor, 70), 0.7)
    this.bodyContainer.add(headHighlight2)

    const headSpecular = scene.add.ellipse(-5, -25, 4, 3, 0xFFFFFF, 0.8)
    this.bodyContainer.add(headSpecular)

    // Brain-like bumps
    const bumpPositions = [
      { x: -6, y: -22 }, { x: -3, y: -19 }, { x: 0, y: -26 },
      { x: 3, y: -21 }, { x: 6, y: -23 }
    ]
    bumpPositions.forEach(pos => {
      const bump = scene.add.circle(pos.x, pos.y, 2, this.getDarkerColor(mainColor, 30), 0.4)
      this.bodyContainer?.add(bump)
    })

    // EYES - Big almond eyes with 4 layers and glow
    const eyeColor = 0x00FF41
    const eyeDark = this.getDarkerColor(eyeColor, 30)

    // Left Eye
    const eyeLOuter = scene.add.circle(-5, -20, 6, 0x1A1A1A)
    this.bodyContainer.add(eyeLOuter)

    const eyeL = scene.add.circle(-5, -20, 5, 0x000000)
    this.bodyContainer.add(eyeL)

    const pupilLBase = scene.add.circle(-4, -20, 3, eyeDark)
    this.bodyContainer.add(pupilLBase)

    const pupilL = scene.add.circle(-4, -20, 2.5, eyeColor)
    this.bodyContainer.add(pupilL)

    const pupilLHighlight = scene.add.circle(-3, -21, 1.5, this.getLighterColor(eyeColor, 80), 0.8)
    this.bodyContainer.add(pupilLHighlight)

    const pupilLSpecular = scene.add.circle(-3, -21.5, 0.8, 0xFFFFFF)
    this.bodyContainer.add(pupilLSpecular)

    // Eye glow
    const eyeLGlow = scene.add.circle(-5, -20, 7, eyeColor, 0.2)
    this.bodyContainer.add(eyeLGlow)

    // Right Eye
    const eyeROuter = scene.add.circle(5, -20, 6, 0x1A1A1A)
    this.bodyContainer.add(eyeROuter)

    const eyeR = scene.add.circle(5, -20, 5, 0x000000)
    this.bodyContainer.add(eyeR)

    const pupilRBase = scene.add.circle(6, -20, 3, eyeDark)
    this.bodyContainer.add(pupilRBase)

    const pupilR = scene.add.circle(6, -20, 2.5, eyeColor)
    this.bodyContainer.add(pupilR)

    const pupilRHighlight = scene.add.circle(7, -21, 1.5, this.getLighterColor(eyeColor, 80), 0.8)
    this.bodyContainer.add(pupilRHighlight)

    const pupilRSpecular = scene.add.circle(7, -21.5, 0.8, 0xFFFFFF)
    this.bodyContainer.add(pupilRSpecular)

    const eyeRGlow = scene.add.circle(5, -20, 7, eyeColor, 0.2)
    this.bodyContainer.add(eyeRGlow)

    this.characterParts.eyes = [eyeL, eyeR]

    // =========================
    // ARMS & HANDS (with 4 fingers each - alien style)
    // =========================
    // Left arm
    const leftArmShadow = scene.add.rectangle(-11, -10, 3.5, 12, 0x000000, 0.3)
    leftArmShadow.setRotation(-0.4)
    this.bodyContainer.add(leftArmShadow)
    const leftArm = scene.add.rectangle(-12, -11, 3, 11, mainColor)
    leftArm.setRotation(-0.4)
    leftArm.setStrokeStyle(2, darkColor, 0.8)
    this.bodyContainer.add(leftArm)
    const leftArmHighlight = scene.add.rectangle(-12.5, -12, 1.5, 9, lightColor, 0.6)
    leftArmHighlight.setRotation(-0.4)
    this.bodyContainer.add(leftArmHighlight)

    // Left hand
    const leftHandShadow = scene.add.circle(-15, -4, 3, 0x000000, 0.3)
    this.bodyContainer.add(leftHandShadow)
    const leftHand = scene.add.circle(-16, -5, 2.5, skinColor)
    leftHand.setStrokeStyle(1, fingerColor, 0.8)
    this.bodyContainer.add(leftHand)
    const leftHandHighlight = scene.add.circle(-16.5, -5.5, 1.2, this.getLighterColor(skinColor, 40), 0.7)
    this.bodyContainer.add(leftHandHighlight)

    // Left fingers - 4 long alien fingers
    for (let i = 0; i < 4; i++) {
      const fingerAngle = -0.6 - i * 0.15
      const fingerX = -18 - i * 0.5
      const fingerY = -5 + i * 1.5

      const fingerShadow = scene.add.rectangle(fingerX + 1, fingerY + 1, 1, 4, 0x000000, 0.3)
      fingerShadow.setRotation(fingerAngle)
      this.bodyContainer.add(fingerShadow)

      const finger = scene.add.rectangle(fingerX, fingerY, 0.9, 4, fingerColor)
      finger.setRotation(fingerAngle)
      this.bodyContainer.add(finger)

      // Suction cup on finger tip
      const fingerTip = scene.add.circle(fingerX - Math.sin(fingerAngle) * 2, fingerY + Math.cos(fingerAngle) * 2, 0.8, this.getLighterColor(fingerColor, 30))
      fingerTip.setStrokeStyle(1, this.getDarkerColor(fingerColor, 30), 0.8)
      this.bodyContainer.add(fingerTip)
    }

    // Right arm
    const rightArmShadow = scene.add.rectangle(11, -10, 3.5, 12, 0x000000, 0.3)
    rightArmShadow.setRotation(0.4)
    this.bodyContainer.add(rightArmShadow)
    const rightArm = scene.add.rectangle(12, -11, 3, 11, mainColor)
    rightArm.setRotation(0.4)
    rightArm.setStrokeStyle(2, darkColor, 0.8)
    this.bodyContainer.add(rightArm)
    const rightArmHighlight = scene.add.rectangle(12.5, -12, 1.5, 9, lightColor, 0.6)
    rightArmHighlight.setRotation(0.4)
    this.bodyContainer.add(rightArmHighlight)

    // Right hand
    const rightHandShadow = scene.add.circle(15, -4, 3, 0x000000, 0.3)
    this.bodyContainer.add(rightHandShadow)
    const rightHand = scene.add.circle(16, -5, 2.5, skinColor)
    rightHand.setStrokeStyle(1, fingerColor, 0.8)
    this.bodyContainer.add(rightHand)
    const rightHandHighlight = scene.add.circle(16.5, -5.5, 1.2, this.getLighterColor(skinColor, 40), 0.7)
    this.bodyContainer.add(rightHandHighlight)

    // Right fingers - 4 long alien fingers
    for (let i = 0; i < 4; i++) {
      const fingerAngle = 0.6 + i * 0.15
      const fingerX = 18 + i * 0.5
      const fingerY = -5 + i * 1.5

      const fingerShadow = scene.add.rectangle(fingerX + 1, fingerY + 1, 1, 4, 0x000000, 0.3)
      fingerShadow.setRotation(fingerAngle)
      this.bodyContainer.add(fingerShadow)

      const finger = scene.add.rectangle(fingerX, fingerY, 0.9, 4, fingerColor)
      finger.setRotation(fingerAngle)
      this.bodyContainer.add(finger)

      // Suction cup on finger tip
      const fingerTip = scene.add.circle(fingerX + Math.sin(fingerAngle) * 2, fingerY + Math.cos(fingerAngle) * 2, 0.8, this.getLighterColor(fingerColor, 30))
      fingerTip.setStrokeStyle(1, this.getDarkerColor(fingerColor, 30), 0.8)
      this.bodyContainer.add(fingerTip)
    }

    // ANTENNAE - Multi-layered with pulsing balls
    const antennaColor = 0xFF1EFF

    // Left Antenna
    const antennaLShadow = scene.add.rectangle(-6, -32, 3, 10, 0x000000, 0.3)
    this.bodyContainer.add(antennaLShadow)

    const antennaL = scene.add.rectangle(-7, -32, 3, 10, mainColor)
    antennaL.setStrokeStyle(2, 0x000000, 0.6)
    this.bodyContainer.add(antennaL)

    const antennaLHighlight = scene.add.rectangle(-7.5, -32, 1.5, 10, lightColor, 0.6)
    this.bodyContainer.add(antennaLHighlight)

    // Left Ball with layers
    const ballLShadow = scene.add.circle(-6, -36, 4, 0x000000, 0.3)
    this.bodyContainer.add(ballLShadow)

    const ballLBase = scene.add.circle(-7, -37, 4.5, this.getDarkerColor(antennaColor, 40))
    this.bodyContainer.add(ballLBase)

    const ballL = scene.add.circle(-7, -37, 4, antennaColor)
    ballL.setStrokeStyle(2, 0x000000, 0.8)
    this.bodyContainer.add(ballL)

    const ballLHighlight = scene.add.circle(-8, -38, 2, this.getLighterColor(antennaColor, 60), 0.7)
    this.bodyContainer.add(ballLHighlight)

    const ballLSpecular = scene.add.circle(-8.5, -38.5, 1, 0xFFFFFF, 0.9)
    this.bodyContainer.add(ballLSpecular)

    // Right Antenna
    const antennaRShadow = scene.add.rectangle(6, -32, 3, 10, 0x000000, 0.3)
    this.bodyContainer.add(antennaRShadow)

    const antennaR = scene.add.rectangle(7, -32, 3, 10, mainColor)
    antennaR.setStrokeStyle(2, 0x000000, 0.6)
    this.bodyContainer.add(antennaR)

    const antennaRHighlight = scene.add.rectangle(7.5, -32, 1.5, 10, lightColor, 0.6)
    this.bodyContainer.add(antennaRHighlight)

    // Right Ball with layers
    const ballRShadow = scene.add.circle(6, -36, 4, 0x000000, 0.3)
    this.bodyContainer.add(ballRShadow)

    const ballRBase = scene.add.circle(7, -37, 4.5, this.getDarkerColor(antennaColor, 40))
    this.bodyContainer.add(ballRBase)

    const ballR = scene.add.circle(7, -37, 4, antennaColor)
    ballR.setStrokeStyle(2, 0x000000, 0.8)
    this.bodyContainer.add(ballR)

    const ballRHighlight = scene.add.circle(8, -38, 2, this.getLighterColor(antennaColor, 60), 0.7)
    this.bodyContainer.add(ballRHighlight)

    const ballRSpecular = scene.add.circle(8.5, -38.5, 1, 0xFFFFFF, 0.9)
    this.bodyContainer.add(ballRSpecular)

    this.characterParts.accessories = [antennaL, antennaR, ballL, ballR]

    // IDLE ANIMATION - Floating/hovering
    scene.tweens.add({
      targets: this.bodyContainer,
      y: this.bodyContainer.y + 3,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Pulsing antennae balls
    scene.tweens.add({
      targets: [ballL, ballR, ballLBase, ballRBase, ballLHighlight, ballRHighlight, ballLSpecular, ballRSpecular],
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Eye glow pulse
    scene.tweens.add({
      targets: [eyeLGlow, eyeRGlow],
      alpha: 0.4,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    this.addGlow(scene, 0xFF1EFF, 30)
  }

  // 7. Fearless Fairy - Fairy with wings and wand
  // 7. Fearless Fairy - Fairy with wings and wand
  private createFairy(scene: Phaser.Scene) {
    // Use sprite sheet instead of procedural graphics
    const mainColor = 0xFFEE58 // Yellow

    // Create body container for consistency with other towers
    this.bodyContainer = scene.add.container(0, 0)
    this.add(this.bodyContainer)

    // Create sprite (frames are 540x450, so scale down)
    this.fairySprite = scene.add.sprite(0, -5, 'fearless-fairy', 0)
    this.fairySprite.setScale(0.23) // Scale down from 450px height to ~103px - larger for better visibility
    this.fairySprite.setOrigin(0.5, 0.5) // Center origin
    // Set texture to use nearest-neighbor filtering to prevent frame bleeding
    this.fairySprite.setTexture('fearless-fairy', 0)
    this.fairySprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST)
    this.bodyContainer.add(this.fairySprite)

    // Set towerGraphic for interaction
    this.towerGraphic = this.fairySprite as any

    // Make the sprite interactive
    this.fairySprite.setInteractive()

    // Play idle animation if it exists
    if (scene.anims.exists('fairy-idle-front')) {
      this.fairySprite.play('fairy-idle-front')
    }

    this.addGlow(scene, mainColor, 28)
  }


  // 8. Patient Panda - Panda with round face and ears
  private createPanda(scene: Phaser.Scene) {
    // Create rotating body container
    this.bodyContainer = scene.add.container(0, 0)
    this.add(this.bodyContainer)

    const mainColor = 0xFFFFFF
    const bellyColor = 0x26A69A

    // BODY - Multi-layered white with depth
    const bodyShadowDeep = scene.add.circle(3, -2, 16, 0x000000, 0.25)
    this.bodyContainer.add(bodyShadowDeep)

    const bodyBase1 = scene.add.circle(1, -3, 15.5, 0xEEEEEE)
    this.bodyContainer.add(bodyBase1)

    const body = scene.add.circle(0, -4, 16, mainColor)
    body.setStrokeStyle(3, 0x000000, 0.8)
    this.bodyContainer.add(body)
    this.towerGraphic = body
    this.characterParts.body = body

    const bodyHighlight1 = scene.add.circle(-3, -7, 9, 0xFFFFFF, 0.6)
    this.bodyContainer.add(bodyHighlight1)

    const bodySpecular = scene.add.circle(-4, -8, 5, 0xFFFFFF, 0.8)
    this.bodyContainer.add(bodySpecular)

    // HEAD - Multi-layered sphere
    const headShadowDeep = scene.add.circle(3, -18, 13, 0x000000, 0.25)
    this.bodyContainer.add(headShadowDeep)

    const headBase = scene.add.circle(1, -19, 12.5, 0xEEEEEE)
    this.bodyContainer.add(headBase)

    const head = scene.add.circle(0, -20, 13, mainColor)
    head.setStrokeStyle(3, 0x000000, 0.8)
    this.bodyContainer.add(head)
    this.characterParts.head = head

    const headHighlight1 = scene.add.circle(-2, -23, 7, 0xFFFFFF, 0.6)
    this.bodyContainer.add(headHighlight1)

    const headSpecular = scene.add.circle(-3, -24, 4, 0xFFFFFF, 0.8)
    this.bodyContainer.add(headSpecular)

    // BLACK EARS - Multi-layered
    const earLShadow = scene.add.circle(-8, -26, 6, 0x000000, 0.4)
    this.bodyContainer.add(earLShadow)

    const earL = scene.add.circle(-9, -27, 6, 0x000000)
    earL.setStrokeStyle(2, 0x000000)
    this.bodyContainer.add(earL)

    const earLHighlight = scene.add.circle(-10, -28, 3, 0x333333, 0.5)
    this.bodyContainer.add(earLHighlight)

    const earRShadow = scene.add.circle(8, -26, 6, 0x000000, 0.4)
    this.bodyContainer.add(earRShadow)

    const earR = scene.add.circle(9, -27, 6, 0x000000)
    earR.setStrokeStyle(2, 0x000000)
    this.bodyContainer.add(earR)

    const earRHighlight = scene.add.circle(10, -28, 3, 0x333333, 0.5)
    this.bodyContainer.add(earRHighlight)

    // EYE PATCHES - Gradient from black to gray
    const patchLShadow = scene.add.circle(-4, -20, 5.5, 0x000000, 0.5)
    this.bodyContainer.add(patchLShadow)

    const patchL = scene.add.circle(-5, -21, 5, 0x000000)
    this.bodyContainer.add(patchL)

    const patchLGrad = scene.add.circle(-5.5, -21.5, 3, 0x1A1A1A, 0.6)
    this.bodyContainer.add(patchLGrad)

    const patchRShadow = scene.add.circle(4, -20, 5.5, 0x000000, 0.5)
    this.bodyContainer.add(patchRShadow)

    const patchR = scene.add.circle(5, -21, 5, 0x000000)
    this.bodyContainer.add(patchR)

    const patchRGrad = scene.add.circle(5.5, -21.5, 3, 0x1A1A1A, 0.6)
    this.bodyContainer.add(patchRGrad)

    // EYES - White with highlights
    const eyeLBase = scene.add.circle(-5, -21, 3, 0xDDDDDD)
    this.bodyContainer.add(eyeLBase)

    const eyeL = scene.add.circle(-5, -21, 2.5, mainColor)
    this.bodyContainer.add(eyeL)

    const eyeLPupil = scene.add.circle(-4.5, -21, 1.2, 0x000000)
    this.bodyContainer.add(eyeLPupil)

    const eyeLHighlight = scene.add.circle(-4, -21.5, 0.7, 0xFFFFFF)
    this.bodyContainer.add(eyeLHighlight)

    const eyeRBase = scene.add.circle(5, -21, 3, 0xDDDDDD)
    this.bodyContainer.add(eyeRBase)

    const eyeR = scene.add.circle(5, -21, 2.5, mainColor)
    this.bodyContainer.add(eyeR)

    const eyeRPupil = scene.add.circle(5.5, -21, 1.2, 0x000000)
    this.bodyContainer.add(eyeRPupil)

    const eyeRHighlight = scene.add.circle(6, -21.5, 0.7, 0xFFFFFF)
    this.bodyContainer.add(eyeRHighlight)

    this.characterParts.eyes = [eyeL, eyeR]

    // NOSE - Multi-layered
    const noseShadow = scene.add.circle(1, -16, 2.5, 0x000000, 0.4)
    this.bodyContainer.add(noseShadow)

    const nose = scene.add.circle(0, -17, 2.5, 0x000000)
    this.bodyContainer.add(nose)

    const noseHighlight = scene.add.circle(-0.5, -17.5, 1, 0x333333, 0.6)
    this.bodyContainer.add(noseHighlight)

    // BELLY PATCH - Round with multi-layers (lighter color)
    const bellyShadow = scene.add.circle(2, -1, 7, 0x000000, 0.2)
    this.bodyContainer.add(bellyShadow)

    const bellyBase = scene.add.circle(0, -2, 7.5, this.getDarkerColor(bellyColor, 30))
    this.bodyContainer.add(bellyBase)

    const belly = scene.add.circle(0, -2, 7, bellyColor)
    belly.setStrokeStyle(2, this.getDarkerColor(bellyColor, 50), 0.6)
    this.bodyContainer.add(belly)

    const bellyHighlight = scene.add.circle(-1.5, -3.5, 4, this.getLighterColor(bellyColor, 40), 0.6)
    this.bodyContainer.add(bellyHighlight)

    const bellySpecular = scene.add.circle(-2, -4, 2, this.getLighterColor(bellyColor, 70), 0.7)
    this.bodyContainer.add(bellySpecular)

    // =========================
    // LEGS & FEET (with claws)
    // =========================
    const legColor = 0x000000
    const clawColor = 0x1A1A1A

    // Back Left Leg
    const backLeftLegShadow = scene.add.ellipse(-7, 3, 6.5, 11, 0x000000, 0.3)
    this.bodyContainer.add(backLeftLegShadow)

    const backLeftLeg = scene.add.ellipse(-8, 2, 6, 10, legColor)
    backLeftLeg.setStrokeStyle(2, this.getDarkerColor(legColor, 30), 0.8)
    this.bodyContainer.add(backLeftLeg)

    const backLeftLegHighlight = scene.add.ellipse(-9, 0, 3, 6, 0x333333, 0.4)
    this.bodyContainer.add(backLeftLegHighlight)

    // Back Left Foot
    const backLeftFootShadow = scene.add.ellipse(-7, 9, 7.5, 5, 0x000000, 0.3)
    this.bodyContainer.add(backLeftFootShadow)

    const backLeftFoot = scene.add.ellipse(-8, 8, 7, 4.5, legColor)
    backLeftFoot.setStrokeStyle(2, this.getDarkerColor(legColor, 30), 0.8)
    this.bodyContainer.add(backLeftFoot)

    // Back Left Foot Pad
    const backLeftPad = scene.add.ellipse(-8, 8.5, 4, 2.5, 0xE91E63, 0.7)
    this.bodyContainer.add(backLeftPad)

    // Back Left Claws (3 claws)
    for (let i = 0; i < 3; i++) {
      const clawX = -10 + i * 2
      const clawY = 9.5

      const clawShadow = scene.add.ellipse(clawX + 0.5, clawY + 0.5, 1.2, 2, 0x000000, 0.4)
      this.bodyContainer.add(clawShadow)

      const claw = scene.add.ellipse(clawX, clawY, 1, 1.8, clawColor)
      claw.setStrokeStyle(1, 0x000000, 0.6)
      this.bodyContainer.add(claw)

      const clawHighlight = scene.add.circle(clawX - 0.2, clawY - 0.3, 0.4, 0x666666, 0.8)
      this.bodyContainer.add(clawHighlight)
    }

    // Back Right Leg
    const backRightLegShadow = scene.add.ellipse(7, 3, 6.5, 11, 0x000000, 0.3)
    this.bodyContainer.add(backRightLegShadow)

    const backRightLeg = scene.add.ellipse(8, 2, 6, 10, legColor)
    backRightLeg.setStrokeStyle(2, this.getDarkerColor(legColor, 30), 0.8)
    this.bodyContainer.add(backRightLeg)

    const backRightLegHighlight = scene.add.ellipse(9, 0, 3, 6, 0x333333, 0.4)
    this.bodyContainer.add(backRightLegHighlight)

    // Back Right Foot
    const backRightFootShadow = scene.add.ellipse(7, 9, 7.5, 5, 0x000000, 0.3)
    this.bodyContainer.add(backRightFootShadow)

    const backRightFoot = scene.add.ellipse(8, 8, 7, 4.5, legColor)
    backRightFoot.setStrokeStyle(2, this.getDarkerColor(legColor, 30), 0.8)
    this.bodyContainer.add(backRightFoot)

    // Back Right Foot Pad
    const backRightPad = scene.add.ellipse(8, 8.5, 4, 2.5, 0xE91E63, 0.7)
    this.bodyContainer.add(backRightPad)

    // Back Right Claws (3 claws)
    for (let i = 0; i < 3; i++) {
      const clawX = 6 + i * 2
      const clawY = 9.5

      const clawShadow = scene.add.ellipse(clawX + 0.5, clawY + 0.5, 1.2, 2, 0x000000, 0.4)
      this.bodyContainer.add(clawShadow)

      const claw = scene.add.ellipse(clawX, clawY, 1, 1.8, clawColor)
      claw.setStrokeStyle(1, 0x000000, 0.6)
      this.bodyContainer.add(claw)

      const clawHighlight = scene.add.circle(clawX - 0.2, clawY - 0.3, 0.4, 0x666666, 0.8)
      this.bodyContainer.add(clawHighlight)
    }

    // =========================
    // ARMS & HANDS (with claws)
    // =========================
    const armColor = 0x000000
    const handColor = 0x000000

    // Left Arm
    const leftArmShadow = scene.add.ellipse(-13, -8, 6, 10, 0x000000, 0.3)
    leftArmShadow.setRotation(-0.3)
    this.bodyContainer.add(leftArmShadow)

    const leftArm = scene.add.ellipse(-14, -9, 5.5, 9.5, armColor)
    leftArm.setRotation(-0.3)
    leftArm.setStrokeStyle(2, this.getDarkerColor(armColor, 30), 0.8)
    this.bodyContainer.add(leftArm)

    const leftArmHighlight = scene.add.ellipse(-15, -10, 3, 6, 0x333333, 0.4)
    leftArmHighlight.setRotation(-0.3)
    this.bodyContainer.add(leftArmHighlight)

    // Left Hand
    const leftHandShadow = scene.add.circle(-17, -3, 3.5, 0x000000, 0.3)
    this.bodyContainer.add(leftHandShadow)

    const leftHand = scene.add.circle(-18, -4, 3, handColor)
    leftHand.setStrokeStyle(2, this.getDarkerColor(handColor, 30), 0.8)
    this.bodyContainer.add(leftHand)

    const leftHandHighlight = scene.add.circle(-19, -5, 1.5, 0x333333, 0.5)
    this.bodyContainer.add(leftHandHighlight)

    // Left Hand Pad
    const leftPalm = scene.add.circle(-18, -3.5, 1.5, 0xE91E63, 0.7)
    this.bodyContainer.add(leftPalm)

    // Left Fingers (4 fingers with claws)
    for (let i = 0; i < 4; i++) {
      const fingerAngle = -0.8 + i * 0.35
      const fingerLength = 3.5
      const fingerX = -20 - Math.sin(fingerAngle) * 2
      const fingerY = -4.5 + Math.cos(fingerAngle) * 2

      // Finger base
      const fingerShadow = scene.add.rectangle(fingerX + 0.5, fingerY + 0.5, 1.5, fingerLength, 0x000000, 0.3)
      fingerShadow.setRotation(fingerAngle)
      this.bodyContainer.add(fingerShadow)

      const finger = scene.add.rectangle(fingerX, fingerY, 1.3, fingerLength, handColor)
      finger.setRotation(fingerAngle)
      finger.setStrokeStyle(1, this.getDarkerColor(handColor, 30), 0.6)
      this.bodyContainer.add(finger)

      const fingerHighlight = scene.add.rectangle(fingerX - 0.3, fingerY, 0.6, fingerLength - 0.5, 0x333333, 0.4)
      fingerHighlight.setRotation(fingerAngle)
      this.bodyContainer.add(fingerHighlight)

      // Claw at fingertip
      const clawTipX = fingerX - Math.sin(fingerAngle) * (fingerLength / 2 + 0.5)
      const clawTipY = fingerY + Math.cos(fingerAngle) * (fingerLength / 2 + 0.5)

      const fingerClaw = scene.add.ellipse(clawTipX, clawTipY, 0.8, 1.5, clawColor)
      fingerClaw.setRotation(fingerAngle)
      fingerClaw.setStrokeStyle(0.5, 0x000000, 0.8)
      this.bodyContainer.add(fingerClaw)
    }

    // Right Arm
    const rightArmShadow = scene.add.ellipse(13, -8, 6, 10, 0x000000, 0.3)
    rightArmShadow.setRotation(0.3)
    this.bodyContainer.add(rightArmShadow)

    const rightArm = scene.add.ellipse(14, -9, 5.5, 9.5, armColor)
    rightArm.setRotation(0.3)
    rightArm.setStrokeStyle(2, this.getDarkerColor(armColor, 30), 0.8)
    this.bodyContainer.add(rightArm)

    const rightArmHighlight = scene.add.ellipse(15, -10, 3, 6, 0x333333, 0.4)
    rightArmHighlight.setRotation(0.3)
    this.bodyContainer.add(rightArmHighlight)

    // Right Hand
    const rightHandShadow = scene.add.circle(17, -3, 3.5, 0x000000, 0.3)
    this.bodyContainer.add(rightHandShadow)

    const rightHand = scene.add.circle(18, -4, 3, handColor)
    rightHand.setStrokeStyle(2, this.getDarkerColor(handColor, 30), 0.8)
    this.bodyContainer.add(rightHand)

    const rightHandHighlight = scene.add.circle(19, -5, 1.5, 0x333333, 0.5)
    this.bodyContainer.add(rightHandHighlight)

    // Right Hand Pad
    const rightPalm = scene.add.circle(18, -3.5, 1.5, 0xE91E63, 0.7)
    this.bodyContainer.add(rightPalm)

    // Right Fingers (4 fingers with claws)
    for (let i = 0; i < 4; i++) {
      const fingerAngle = 0.8 - i * 0.35
      const fingerLength = 3.5
      const fingerX = 20 + Math.sin(fingerAngle) * 2
      const fingerY = -4.5 + Math.cos(fingerAngle) * 2

      // Finger base
      const fingerShadow = scene.add.rectangle(fingerX + 0.5, fingerY + 0.5, 1.5, fingerLength, 0x000000, 0.3)
      fingerShadow.setRotation(fingerAngle)
      this.bodyContainer.add(fingerShadow)

      const finger = scene.add.rectangle(fingerX, fingerY, 1.3, fingerLength, handColor)
      finger.setRotation(fingerAngle)
      finger.setStrokeStyle(1, this.getDarkerColor(handColor, 30), 0.6)
      this.bodyContainer.add(finger)

      const fingerHighlight = scene.add.rectangle(fingerX + 0.3, fingerY, 0.6, fingerLength - 0.5, 0x333333, 0.4)
      fingerHighlight.setRotation(fingerAngle)
      this.bodyContainer.add(fingerHighlight)

      // Claw at fingertip
      const clawTipX = fingerX + Math.sin(fingerAngle) * (fingerLength / 2 + 0.5)
      const clawTipY = fingerY + Math.cos(fingerAngle) * (fingerLength / 2 + 0.5)

      const fingerClaw = scene.add.ellipse(clawTipX, clawTipY, 0.8, 1.5, clawColor)
      fingerClaw.setRotation(fingerAngle)
      fingerClaw.setStrokeStyle(0.5, 0x000000, 0.8)
      this.bodyContainer.add(fingerClaw)
    }

    // =========================
    // FRONT LEGS & FEET (in front of body)
    // =========================
    // Front Left Leg
    const frontLeftLegShadow = scene.add.ellipse(-6, 1, 6.5, 12, 0x000000, 0.3)
    this.bodyContainer.add(frontLeftLegShadow)

    const frontLeftLeg = scene.add.ellipse(-7, 0, 6, 11.5, legColor)
    frontLeftLeg.setStrokeStyle(2, this.getDarkerColor(legColor, 30), 0.8)
    this.bodyContainer.add(frontLeftLeg)

    const frontLeftLegHighlight = scene.add.ellipse(-8, -2, 3, 7, 0x333333, 0.4)
    this.bodyContainer.add(frontLeftLegHighlight)

    // Front Left Foot
    const frontLeftFootShadow = scene.add.ellipse(-6, 8, 7.5, 5, 0x000000, 0.3)
    this.bodyContainer.add(frontLeftFootShadow)

    const frontLeftFoot = scene.add.ellipse(-7, 7, 7, 4.5, legColor)
    frontLeftFoot.setStrokeStyle(2, this.getDarkerColor(legColor, 30), 0.8)
    this.bodyContainer.add(frontLeftFoot)

    // Front Left Foot Pad
    const frontLeftPad = scene.add.ellipse(-7, 7.5, 4, 2.5, 0xE91E63, 0.7)
    this.bodyContainer.add(frontLeftPad)

    // Front Left Claws (3 claws)
    for (let i = 0; i < 3; i++) {
      const clawX = -9 + i * 2
      const clawY = 8.5

      const clawShadow = scene.add.ellipse(clawX + 0.5, clawY + 0.5, 1.2, 2, 0x000000, 0.4)
      this.bodyContainer.add(clawShadow)

      const claw = scene.add.ellipse(clawX, clawY, 1, 1.8, clawColor)
      claw.setStrokeStyle(1, 0x000000, 0.6)
      this.bodyContainer.add(claw)

      const clawHighlight = scene.add.circle(clawX - 0.2, clawY - 0.3, 0.4, 0x666666, 0.8)
      this.bodyContainer.add(clawHighlight)
    }

    // Front Right Leg
    const frontRightLegShadow = scene.add.ellipse(6, 1, 6.5, 12, 0x000000, 0.3)
    this.bodyContainer.add(frontRightLegShadow)

    const frontRightLeg = scene.add.ellipse(7, 0, 6, 11.5, legColor)
    frontRightLeg.setStrokeStyle(2, this.getDarkerColor(legColor, 30), 0.8)
    this.bodyContainer.add(frontRightLeg)

    const frontRightLegHighlight = scene.add.ellipse(8, -2, 3, 7, 0x333333, 0.4)
    this.bodyContainer.add(frontRightLegHighlight)

    // Front Right Foot
    const frontRightFootShadow = scene.add.ellipse(6, 8, 7.5, 5, 0x000000, 0.3)
    this.bodyContainer.add(frontRightFootShadow)

    const frontRightFoot = scene.add.ellipse(7, 7, 7, 4.5, legColor)
    frontRightFoot.setStrokeStyle(2, this.getDarkerColor(legColor, 30), 0.8)
    this.bodyContainer.add(frontRightFoot)

    // Front Right Foot Pad
    const frontRightPad = scene.add.ellipse(7, 7.5, 4, 2.5, 0xE91E63, 0.7)
    this.bodyContainer.add(frontRightPad)

    // Front Right Claws (3 claws)
    for (let i = 0; i < 3; i++) {
      const clawX = 5 + i * 2
      const clawY = 8.5

      const clawShadow = scene.add.ellipse(clawX + 0.5, clawY + 0.5, 1.2, 2, 0x000000, 0.4)
      this.bodyContainer.add(clawShadow)

      const claw = scene.add.ellipse(clawX, clawY, 1, 1.8, clawColor)
      claw.setStrokeStyle(1, 0x000000, 0.6)
      this.bodyContainer.add(claw)

      const clawHighlight = scene.add.circle(clawX - 0.2, clawY - 0.3, 0.4, 0x666666, 0.8)
      this.bodyContainer.add(clawHighlight)
    }

    this.characterParts.accessories = [earL, earR, belly]

    // IDLE ANIMATION - Slow, calm breathing
    scene.tweens.add({
      targets: this.bodyContainer,
      y: this.bodyContainer.y + 1.5,
      scaleY: 1.015,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Gentle belly movement
    scene.tweens.add({
      targets: [belly, bellyBase, bellyHighlight, bellySpecular],
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    this.addGlow(scene, 0x26A69A, 28)
  }

  // 9. Brave Bison - Bison with horns and shaggy mane
  private createBison(scene: Phaser.Scene) {
    // Create rotating body container
    this.bodyContainer = scene.add.container(0, 0)
    this.add(this.bodyContainer)

    const mainColor = 0xFFA726
    const darkColor = this.getDarkerColor(mainColor, 50)
    const lightColor = this.getLighterColor(mainColor, 50)
    const maneColor = 0x8D6E63

    // BODY - Muscular, powerful with multi-layers
    const bodyShadowDeep = scene.add.ellipse(3, 0, 24, 26, 0x000000, 0.3)
    this.bodyContainer.add(bodyShadowDeep)

    const bodyBase1 = scene.add.ellipse(1, -1, 23, 25, darkColor, 0.9)
    this.bodyContainer.add(bodyBase1)

    const body = scene.add.ellipse(0, -2, 24, 26, mainColor)
    body.setStrokeStyle(3, 0x000000, 0.8)
    this.bodyContainer.add(body)
    this.towerGraphic = body
    this.characterParts.body = body

    const bodyHighlight1 = scene.add.ellipse(-3, -6, 13, 14, lightColor, 0.5)
    this.bodyContainer.add(bodyHighlight1)

    const bodyHighlight2 = scene.add.ellipse(-4, -7, 9, 10, this.getLighterColor(mainColor, 70), 0.6)
    this.bodyContainer.add(bodyHighlight2)

    const bodySpecular = scene.add.circle(-5, -8, 5, 0xFFFFFF, 0.7)
    this.bodyContainer.add(bodySpecular)

    // HEAD - Powerful
    const headShadowDeep = scene.add.circle(3, -18, 14, 0x000000, 0.3)
    this.bodyContainer.add(headShadowDeep)

    const headDark = scene.add.circle(1, -19, 13.5, darkColor)
    this.bodyContainer.add(headDark)

    const head = scene.add.circle(0, -20, 14, mainColor)
    head.setStrokeStyle(3, 0x000000, 0.8)
    this.bodyContainer.add(head)
    this.characterParts.head = head

    const headHighlight1 = scene.add.circle(-2, -23, 8, lightColor, 0.6)
    this.bodyContainer.add(headHighlight1)

    const headSpecular = scene.add.circle(-3, -24, 4, 0xFFFFFF, 0.8)
    this.bodyContainer.add(headSpecular)

    // SHAGGY MANE - Multiple overlapping circles with depth
    const maneArray: Phaser.GameObjects.Shape[] = []
    const maneDark = this.getDarkerColor(maneColor, 40)

    for (let i = 0; i < 5; i++) {
      const xPos = -8 + i * 4

      // Shadow layer
      const maneShadow = scene.add.circle(xPos + 1, -29, 5, 0x000000, 0.3)
      this.bodyContainer.add(maneShadow)

      // Dark base
      const maneBase = scene.add.circle(xPos, -29.5, 5.5, maneDark)
      this.bodyContainer.add(maneBase)

      // Main mane
      const mane = scene.add.circle(xPos, -30, 5, maneColor)
      mane.setStrokeStyle(2, this.getDarkerColor(maneColor, 60), 0.8)
      this.bodyContainer.add(mane)
      maneArray.push(mane)

      // Highlight
      const maneHighlight = scene.add.circle(xPos - 1, -31, 3, this.getLighterColor(maneColor, 40), 0.6)
      this.bodyContainer.add(maneHighlight)
    }

    // HORNS - Curved triangles with gradient
    const hornColor = 0x1A1A1A

    // Left Horn with gradient
    const hornLShadow = scene.add.arc(-10, -26, 7, 0, 180, false, 0x000000, 0.4)
    hornLShadow.setStrokeStyle(5, 0x000000, 0.3)
    this.bodyContainer.add(hornLShadow)

    const hornLBase = scene.add.arc(-11, -27, 7.5, 0, 180, false, hornColor, 0)
    hornLBase.setStrokeStyle(5, hornColor)
    this.bodyContainer.add(hornLBase)

    const hornL = scene.add.arc(-11, -27, 7, 0, 180, false, 0x000000, 0)
    hornL.setStrokeStyle(4, 0x000000)
    this.bodyContainer.add(hornL)

    const hornLHighlight = scene.add.arc(-12, -28, 5, 0, 180, false, 0x333333, 0)
    hornLHighlight.setStrokeStyle(2, 0x333333, 0.7)
    this.bodyContainer.add(hornLHighlight)

    // Right Horn with gradient
    const hornRShadow = scene.add.arc(10, -26, 7, 0, 180, true, 0x000000, 0.4)
    hornRShadow.setStrokeStyle(5, 0x000000, 0.3)
    this.bodyContainer.add(hornRShadow)

    const hornRBase = scene.add.arc(11, -27, 7.5, 0, 180, true, hornColor, 0)
    hornRBase.setStrokeStyle(5, hornColor)
    this.bodyContainer.add(hornRBase)

    const hornR = scene.add.arc(11, -27, 7, 0, 180, true, 0x000000, 0)
    hornR.setStrokeStyle(4, 0x000000)
    this.bodyContainer.add(hornR)

    const hornRHighlight = scene.add.arc(12, -28, 5, 0, 180, true, 0x333333, 0)
    hornRHighlight.setStrokeStyle(2, 0x333333, 0.7)
    this.bodyContainer.add(hornRHighlight)

    this.characterParts.accessories = [...maneArray, hornL, hornR]

    // EYES - Powerful gaze
    const eyeLBase = scene.add.circle(-5, -21, 3, 0x1A1A1A)
    this.bodyContainer.add(eyeLBase)

    const eyeL = scene.add.circle(-5, -21, 2.5, 0x000000)
    this.bodyContainer.add(eyeL)

    const eyeLHighlight = scene.add.circle(-4.5, -21.5, 1, 0x333333, 0.8)
    this.bodyContainer.add(eyeLHighlight)

    const eyeRBase = scene.add.circle(5, -21, 3, 0x1A1A1A)
    this.bodyContainer.add(eyeRBase)

    const eyeR = scene.add.circle(5, -21, 2.5, 0x000000)
    this.bodyContainer.add(eyeR)

    const eyeRHighlight = scene.add.circle(5.5, -21.5, 1, 0x333333, 0.8)
    this.bodyContainer.add(eyeRHighlight)

    this.characterParts.eyes = [eyeL, eyeR]

    // IDLE ANIMATION - Heavy, powerful breathing
    scene.tweens.add({
      targets: this.bodyContainer,
      y: this.bodyContainer.y + 1.5,
      scaleY: 1.02,
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Mane sway
    scene.tweens.add({
      targets: maneArray,
      y: '-=1',
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 100
    })

    // =========================
    // LEGS & HOOVES - Powerful muscular legs
    // =========================
    const legColor = this.getDarkerColor(mainColor, 30)
    const hoofColor = 0x1A1A1A

    // Back Left Leg
    const backLeftUpperShadow = scene.add.ellipse(-8, 3, 8.5, 13, 0x000000, 0.3)
    this.bodyContainer.add(backLeftUpperShadow)

    const backLeftUpper = scene.add.ellipse(-9, 2, 8, 12, mainColor)
    backLeftUpper.setStrokeStyle(2, darkColor, 0.8)
    this.bodyContainer.add(backLeftUpper)

    const backLeftUpperHighlight = scene.add.ellipse(-10, 0, 4, 8, lightColor, 0.5)
    this.bodyContainer.add(backLeftUpperHighlight)

    const backLeftLowerShadow = scene.add.ellipse(-8, 11, 7.5, 10, 0x000000, 0.3)
    this.bodyContainer.add(backLeftLowerShadow)

    const backLeftLower = scene.add.ellipse(-9, 10, 7, 9, legColor)
    backLeftLower.setStrokeStyle(2, this.getDarkerColor(legColor, 30), 0.8)
    this.bodyContainer.add(backLeftLower)

    // Back Left Hoof - Split hoof detail
    const backLeftHoofShadow = scene.add.ellipse(-8, 17, 8, 5, 0x000000, 0.4)
    this.bodyContainer.add(backLeftHoofShadow)

    const backLeftHoof = scene.add.ellipse(-9, 16, 7.5, 4.5, hoofColor)
    backLeftHoof.setStrokeStyle(2, 0x000000, 0.9)
    this.bodyContainer.add(backLeftHoof)

    // Hoof split
    const backLeftHoofSplit = scene.add.rectangle(-9, 16.5, 0.8, 4, 0x000000, 0.8)
    this.bodyContainer.add(backLeftHoofSplit)

    const backLeftHoofHighlight = scene.add.ellipse(-10, 15, 3, 2, 0x333333, 0.6)
    this.bodyContainer.add(backLeftHoofHighlight)

    // Back Right Leg
    const backRightUpperShadow = scene.add.ellipse(8, 3, 8.5, 13, 0x000000, 0.3)
    this.bodyContainer.add(backRightUpperShadow)

    const backRightUpper = scene.add.ellipse(9, 2, 8, 12, mainColor)
    backRightUpper.setStrokeStyle(2, darkColor, 0.8)
    this.bodyContainer.add(backRightUpper)

    const backRightUpperHighlight = scene.add.ellipse(10, 0, 4, 8, lightColor, 0.5)
    this.bodyContainer.add(backRightUpperHighlight)

    const backRightLowerShadow = scene.add.ellipse(8, 11, 7.5, 10, 0x000000, 0.3)
    this.bodyContainer.add(backRightLowerShadow)

    const backRightLower = scene.add.ellipse(9, 10, 7, 9, legColor)
    backRightLower.setStrokeStyle(2, this.getDarkerColor(legColor, 30), 0.8)
    this.bodyContainer.add(backRightLower)

    // Back Right Hoof
    const backRightHoofShadow = scene.add.ellipse(8, 17, 8, 5, 0x000000, 0.4)
    this.bodyContainer.add(backRightHoofShadow)

    const backRightHoof = scene.add.ellipse(9, 16, 7.5, 4.5, hoofColor)
    backRightHoof.setStrokeStyle(2, 0x000000, 0.9)
    this.bodyContainer.add(backRightHoof)

    // Hoof split
    const backRightHoofSplit = scene.add.rectangle(9, 16.5, 0.8, 4, 0x000000, 0.8)
    this.bodyContainer.add(backRightHoofSplit)

    const backRightHoofHighlight = scene.add.ellipse(10, 15, 3, 2, 0x333333, 0.6)
    this.bodyContainer.add(backRightHoofHighlight)

    // Front Left Leg
    const frontLeftUpperShadow = scene.add.ellipse(-7, 1, 8.5, 14, 0x000000, 0.3)
    this.bodyContainer.add(frontLeftUpperShadow)

    const frontLeftUpper = scene.add.ellipse(-8, 0, 8, 13, mainColor)
    frontLeftUpper.setStrokeStyle(2, darkColor, 0.8)
    this.bodyContainer.add(frontLeftUpper)

    const frontLeftUpperHighlight = scene.add.ellipse(-9, -2, 4, 9, lightColor, 0.5)
    this.bodyContainer.add(frontLeftUpperHighlight)

    const frontLeftLowerShadow = scene.add.ellipse(-7, 10, 7.5, 9, 0x000000, 0.3)
    this.bodyContainer.add(frontLeftLowerShadow)

    const frontLeftLower = scene.add.ellipse(-8, 9, 7, 8, legColor)
    frontLeftLower.setStrokeStyle(2, this.getDarkerColor(legColor, 30), 0.8)
    this.bodyContainer.add(frontLeftLower)

    // Front Left Hoof
    const frontLeftHoofShadow = scene.add.ellipse(-7, 16, 8, 5, 0x000000, 0.4)
    this.bodyContainer.add(frontLeftHoofShadow)

    const frontLeftHoof = scene.add.ellipse(-8, 15, 7.5, 4.5, hoofColor)
    frontLeftHoof.setStrokeStyle(2, 0x000000, 0.9)
    this.bodyContainer.add(frontLeftHoof)

    // Hoof split
    const frontLeftHoofSplit = scene.add.rectangle(-8, 15.5, 0.8, 4, 0x000000, 0.8)
    this.bodyContainer.add(frontLeftHoofSplit)

    const frontLeftHoofHighlight = scene.add.ellipse(-9, 14, 3, 2, 0x333333, 0.6)
    this.bodyContainer.add(frontLeftHoofHighlight)

    // Front Right Leg
    const frontRightUpperShadow = scene.add.ellipse(7, 1, 8.5, 14, 0x000000, 0.3)
    this.bodyContainer.add(frontRightUpperShadow)

    const frontRightUpper = scene.add.ellipse(8, 0, 8, 13, mainColor)
    frontRightUpper.setStrokeStyle(2, darkColor, 0.8)
    this.bodyContainer.add(frontRightUpper)

    const frontRightUpperHighlight = scene.add.ellipse(9, -2, 4, 9, lightColor, 0.5)
    this.bodyContainer.add(frontRightUpperHighlight)

    const frontRightLowerShadow = scene.add.ellipse(7, 10, 7.5, 9, 0x000000, 0.3)
    this.bodyContainer.add(frontRightLowerShadow)

    const frontRightLower = scene.add.ellipse(8, 9, 7, 8, legColor)
    frontRightLower.setStrokeStyle(2, this.getDarkerColor(legColor, 30), 0.8)
    this.bodyContainer.add(frontRightLower)

    // Front Right Hoof
    const frontRightHoofShadow = scene.add.ellipse(7, 16, 8, 5, 0x000000, 0.4)
    this.bodyContainer.add(frontRightHoofShadow)

    const frontRightHoof = scene.add.ellipse(8, 15, 7.5, 4.5, hoofColor)
    frontRightHoof.setStrokeStyle(2, 0x000000, 0.9)
    this.bodyContainer.add(frontRightHoof)

    // Hoof split
    const frontRightHoofSplit = scene.add.rectangle(8, 15.5, 0.8, 4, 0x000000, 0.8)
    this.bodyContainer.add(frontRightHoofSplit)

    const frontRightHoofHighlight = scene.add.ellipse(9, 14, 3, 2, 0x333333, 0.6)
    this.bodyContainer.add(frontRightHoofHighlight)

    // =========================
    // FUR TEXTURE - Additional shaggy fur details
    // =========================
    for (let i = 0; i < 6; i++) {
      const furX = -10 + i * 4
      const furY = -8 + (i % 2) * 2
      const furTuft = scene.add.circle(furX, furY, 2, maneColor, 0.4)
      this.bodyContainer.add(furTuft)
    }

    this.addGlow(scene, 0xFFA726, 30)
  }

  // 10. Driven Dragon - Dragon with wings and fire
  private createDragon(scene: Phaser.Scene) {
    // Create rotating body container
    this.bodyContainer = scene.add.container(0, 0)
    this.add(this.bodyContainer)

    const bodyColor = 0x78909C
    const bodyDark = this.getDarkerColor(bodyColor, 50)
    const bodyLight = this.getLighterColor(bodyColor, 50)
    const wingColor = 0x546E7A
    const wingDark = this.getDarkerColor(wingColor, 40)
    const hornColor = 0xFF7043

    // BODY - Scaled reptilian body with overlapping shapes
    const bodyShadowDeep = scene.add.ellipse(3, -2, 23, 30, 0x000000, 0.35)
    this.bodyContainer.add(bodyShadowDeep)

    // Scale texture with small overlapping ellipses
    const bodyBase1 = scene.add.ellipse(1, -4, 22, 29, bodyDark, 0.9)
    this.bodyContainer.add(bodyBase1)

    const bodyBase2 = scene.add.ellipse(0, -5, 21, 28, this.getDarkerColor(bodyColor, 25))
    this.bodyContainer.add(bodyBase2)

    const body = scene.add.ellipse(0, -5, 21, 28, bodyColor)
    body.setStrokeStyle(3, 0x000000, 0.8)
    this.bodyContainer.add(body)
    this.towerGraphic = body
    this.characterParts.body = body

    // Scale highlights
    const bodyHighlight1 = scene.add.ellipse(-3, -9, 11, 14, bodyLight, 0.5)
    this.bodyContainer.add(bodyHighlight1)

    const bodyHighlight2 = scene.add.ellipse(-4, -11, 8, 10, this.getLighterColor(bodyColor, 70), 0.6)
    this.bodyContainer.add(bodyHighlight2)

    const bodySpecular = scene.add.ellipse(-5, -12, 5, 6, 0xFFFFFF, 0.5)
    this.bodyContainer.add(bodySpecular)

    // Scale details - small overlapping circles
    for (let i = 0; i < 4; i++) {
      const scaleX = -6 + i * 4
      const scaleY = -3 + (i % 2) * 3
      const scale = scene.add.circle(scaleX, scaleY, 3, bodyDark, 0.3)
      this.bodyContainer.add(scale)
    }

    // WINGS - Leathery membrane with triangular shapes
    // Left Wing - Multiple layered triangles for membrane effect
    const wingLShadow = scene.add.triangle(-19, -13, 0, -14, -12, 0, -2, -10, 0x000000, 0.3)
    this.bodyContainer.add(wingLShadow)

    const wingLBase = scene.add.triangle(-20, -14, 0, -14, -12, 0, -2, -10, wingDark)
    this.bodyContainer.add(wingLBase)

    const wingL = scene.add.triangle(-20, -14, 0, -14, -12, 0, -2, -10, wingColor)
    wingL.setStrokeStyle(3, 0x000000, 0.8)
    this.bodyContainer.add(wingL)

    // Wing membrane detail
    const wingLMembrane1 = scene.add.triangle(-18, -13, 0, -10, -8, 0, -2, -9, this.getLighterColor(wingColor, 30), 0.5)
    this.bodyContainer.add(wingLMembrane1)

    const wingLMembrane2 = scene.add.triangle(-16, -12, 0, -8, -6, 0, -2, -8, this.getLighterColor(wingColor, 20), 0.4)
    this.bodyContainer.add(wingLMembrane2)

    // Right Wing
    const wingRShadow = scene.add.triangle(19, -13, 0, -14, 12, 0, 2, -10, 0x000000, 0.3)
    this.bodyContainer.add(wingRShadow)

    const wingRBase = scene.add.triangle(20, -14, 0, -14, 12, 0, 2, -10, wingDark)
    this.bodyContainer.add(wingRBase)

    const wingR = scene.add.triangle(20, -14, 0, -14, 12, 0, 2, -10, wingColor)
    wingR.setStrokeStyle(3, 0x000000, 0.8)
    this.bodyContainer.add(wingR)

    const wingRMembrane1 = scene.add.triangle(18, -13, 0, -10, 8, 0, 2, -9, this.getLighterColor(wingColor, 30), 0.5)
    this.bodyContainer.add(wingRMembrane1)

    const wingRMembrane2 = scene.add.triangle(16, -12, 0, -8, 6, 0, 2, -8, this.getLighterColor(wingColor, 20), 0.4)
    this.bodyContainer.add(wingRMembrane2)

    this.characterParts.wings = [wingL, wingR]

    // NECK - Connecting the body to head
    const neckShadow = scene.add.ellipse(2, -15, 13, 10, 0x000000, 0.3)
    this.bodyContainer.add(neckShadow)

    const neckDark = scene.add.ellipse(1, -16, 12, 9, bodyDark)
    this.bodyContainer.add(neckDark)

    const neck = scene.add.ellipse(0, -16, 12, 9, bodyColor)
    neck.setStrokeStyle(2, 0x000000, 0.7)
    this.bodyContainer.add(neck)

    const neckHighlight = scene.add.ellipse(-2, -18, 6, 5, bodyLight, 0.5)
    this.bodyContainer.add(neckHighlight)

    // HEAD - Reptilian head with 3D depth (positioned closer to neck)
    const headShadowDeep = scene.add.ellipse(2, -23, 18, 15, 0x000000, 0.35)
    this.bodyContainer.add(headShadowDeep)

    const headDark = scene.add.ellipse(1, -24, 17.5, 14.5, bodyDark)
    this.bodyContainer.add(headDark)

    const head = scene.add.ellipse(0, -24, 17, 14, bodyColor)
    head.setStrokeStyle(3, 0x000000, 0.8)
    this.bodyContainer.add(head)
    this.characterParts.head = head

    const headHighlight1 = scene.add.ellipse(-2, -26, 9, 7, bodyLight, 0.6)
    this.bodyContainer.add(headHighlight1)

    const headSpecular = scene.add.ellipse(-3, -27, 5, 4, 0xFFFFFF, 0.6)
    this.bodyContainer.add(headSpecular)

    // SNOUT - 3D protruding snout (adjusted to match head position)
    const snoutShadow = scene.add.rectangle(10, -23, 11, 8, 0x000000, 0.3)
    this.bodyContainer.add(snoutShadow)

    const snoutDark = scene.add.rectangle(9.5, -23.5, 10.5, 7.5, wingDark)
    this.bodyContainer.add(snoutDark)

    const snout = scene.add.rectangle(9, -24, 10, 7, wingColor)
    snout.setStrokeStyle(2, 0x000000, 0.7)
    this.bodyContainer.add(snout)

    const snoutHighlight = scene.add.rectangle(7, -25, 6, 3, this.getLighterColor(wingColor, 40), 0.6)
    this.bodyContainer.add(snoutHighlight)

    // HORNS - Majestic 3D horns (adjusted position)
    const hornDark = this.getDarkerColor(hornColor, 40)
    const hornLight = this.getLighterColor(hornColor, 50)

    // Left Horn
    const horn1Shadow = scene.add.triangle(-4, -33, -3, 0, 3, 0, 0, -8, 0x000000, 0.4)
    this.bodyContainer.add(horn1Shadow)

    const horn1Base = scene.add.triangle(-5, -34, -3, 0, 3, 0, 0, -8, hornDark)
    this.bodyContainer.add(horn1Base)

    const horn1 = scene.add.triangle(-5, -34, -3, 0, 3, 0, 0, -8, hornColor)
    horn1.setStrokeStyle(2, 0x000000, 0.9)
    this.bodyContainer.add(horn1)

    const horn1Highlight = scene.add.triangle(-5.5, -35, -1.5, 0, 1.5, 0, 0, -4, hornLight, 0.8)
    this.bodyContainer.add(horn1Highlight)

    // Right Horn
    const horn2Shadow = scene.add.triangle(4, -33, -3, 0, 3, 0, 0, -8, 0x000000, 0.4)
    this.bodyContainer.add(horn2Shadow)

    const horn2Base = scene.add.triangle(5, -34, -3, 0, 3, 0, 0, -8, hornDark)
    this.bodyContainer.add(horn2Base)

    const horn2 = scene.add.triangle(5, -34, -3, 0, 3, 0, 0, -8, hornColor)
    horn2.setStrokeStyle(2, 0x000000, 0.9)
    this.bodyContainer.add(horn2)

    const horn2Highlight = scene.add.triangle(5.5, -35, -1.5, 0, 1.5, 0, 0, -4, hornLight, 0.8)
    this.bodyContainer.add(horn2Highlight)

    // EYES - Fierce glowing dragon eyes (adjusted position)
    const eyeColor = 0xFF1744

    // Left Eye
    const eyeLGlow = scene.add.circle(-4, -26, 4, eyeColor, 0.3)
    this.bodyContainer.add(eyeLGlow)

    const eyeLBase = scene.add.circle(-4, -26, 3, this.getDarkerColor(eyeColor, 30))
    this.bodyContainer.add(eyeLBase)

    const eyeL = scene.add.circle(-4, -26, 2.5, eyeColor)
    this.bodyContainer.add(eyeL)

    const eyeLHighlight = scene.add.circle(-3.5, -26.5, 1, 0xFFFFFF, 0.9)
    this.bodyContainer.add(eyeLHighlight)

    // Right Eye
    const eyeRGlow = scene.add.circle(4, -26, 4, eyeColor, 0.3)
    this.bodyContainer.add(eyeRGlow)

    const eyeRBase = scene.add.circle(4, -26, 3, this.getDarkerColor(eyeColor, 30))
    this.bodyContainer.add(eyeRBase)

    const eyeR = scene.add.circle(4, -26, 2.5, eyeColor)
    this.bodyContainer.add(eyeR)

    const eyeRHighlight = scene.add.circle(4.5, -26.5, 1, 0xFFFFFF, 0.9)
    this.bodyContainer.add(eyeRHighlight)

    this.characterParts.eyes = [eyeL, eyeR]

    // FIRE BREATH - Multi-layered gradient flames (adjusted position)
    const flameOuter = scene.add.circle(16, -24, 7, 0xFF5722, 0.4)
    this.bodyContainer.add(flameOuter)

    const flameMid = scene.add.circle(16, -24, 6, 0xFF6F00, 0.6)
    this.bodyContainer.add(flameMid)

    const flame = scene.add.circle(16, -24, 5, 0xFF5722, 0.8)
    flame.setStrokeStyle(2, 0xFF6F00, 0.6)
    this.bodyContainer.add(flame)

    const flameCore = scene.add.circle(16, -24, 3, 0xFFD700, 0.9)
    this.bodyContainer.add(flameCore)

    this.characterParts.accessories = [flame, horn1, horn2]

    // IDLE ANIMATION - Powerful breathing
    scene.tweens.add({
      targets: this.bodyContainer,
      y: this.bodyContainer.y + 2,
      scaleY: { from: 1, to: 1.04 },
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Wing flap
    scene.tweens.add({
      targets: [wingL, wingLMembrane1, wingLMembrane2],
      scaleY: { from: 1, to: 1.15 },
      y: { from: wingL.y, to: wingL.y - 2 },
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    scene.tweens.add({
      targets: [wingR, wingRMembrane1, wingRMembrane2],
      scaleY: { from: 1, to: 1.15 },
      y: { from: wingR.y, to: wingR.y - 2 },
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 150
    })

    // Fire breath animation
    scene.tweens.add({
      targets: [flame, flameMid, flameOuter, flameCore],
      scale: { from: 0.8, to: 1.3 },
      alpha: { from: 0.8, to: 0.3 },
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Eye glow
    scene.tweens.add({
      targets: [eyeLGlow, eyeRGlow],
      alpha: { from: 0.3, to: 0.6 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // =========================
    // LEGS & CLAWS - Powerful dragon legs with talons
    // =========================
    const legColor = this.getDarkerColor(bodyColor, 20)
    const clawColor = 0x1A1A1A

    // Back Left Leg
    const backLeftUpperShadow = scene.add.ellipse(-10, 3, 8, 12, 0x000000, 0.3)
    this.bodyContainer.add(backLeftUpperShadow)

    const backLeftUpper = scene.add.ellipse(-11, 2, 7.5, 11, bodyColor)
    backLeftUpper.setStrokeStyle(2, bodyDark, 0.8)
    this.bodyContainer.add(backLeftUpper)

    const backLeftUpperHighlight = scene.add.ellipse(-12, 0, 4, 7, this.getLighterColor(bodyColor, 40), 0.5)
    this.bodyContainer.add(backLeftUpperHighlight)

    // Back Left Knee joint
    const backLeftKneeShadow = scene.add.circle(-10, 9, 4.5, 0x000000, 0.3)
    this.bodyContainer.add(backLeftKneeShadow)

    const backLeftKnee = scene.add.circle(-11, 8, 4, legColor)
    backLeftKnee.setStrokeStyle(2, this.getDarkerColor(legColor, 30), 0.8)
    this.bodyContainer.add(backLeftKnee)

    // Back Left Lower Leg
    const backLeftLowerShadow = scene.add.ellipse(-10, 13, 6.5, 9, 0x000000, 0.3)
    this.bodyContainer.add(backLeftLowerShadow)

    const backLeftLower = scene.add.ellipse(-11, 12, 6, 8, legColor)
    backLeftLower.setStrokeStyle(2, this.getDarkerColor(legColor, 30), 0.8)
    this.bodyContainer.add(backLeftLower)

    // Back Left Foot with talons
    const backLeftFootShadow = scene.add.ellipse(-10, 18, 7, 4, 0x000000, 0.4)
    this.bodyContainer.add(backLeftFootShadow)

    const backLeftFoot = scene.add.ellipse(-11, 17, 6.5, 3.5, this.getDarkerColor(legColor, 20))
    backLeftFoot.setStrokeStyle(2, this.getDarkerColor(legColor, 40), 0.8)
    this.bodyContainer.add(backLeftFoot)

    // Back Left Talons - 3 forward claws
    for (let i = 0; i < 3; i++) {
      const talonX = -13 + i * 2
      const talonY = 18.5
      const talonAngle = -0.3 + i * 0.3

      const talonShadow = scene.add.rectangle(talonX + 0.5, talonY + 0.5, 1, 3, 0x000000, 0.4)
      talonShadow.setRotation(talonAngle)
      this.bodyContainer.add(talonShadow)

      const talon = scene.add.rectangle(talonX, talonY, 0.9, 2.8, clawColor)
      talon.setRotation(talonAngle)
      talon.setStrokeStyle(1, 0x000000, 0.8)
      this.bodyContainer.add(talon)

      const talonSharp = scene.add.circle(talonX - Math.sin(talonAngle) * 1.4, talonY + Math.cos(talonAngle) * 1.4, 0.6, clawColor)
      this.bodyContainer.add(talonSharp)
    }

    // Back Right Leg
    const backRightUpperShadow = scene.add.ellipse(10, 3, 8, 12, 0x000000, 0.3)
    this.bodyContainer.add(backRightUpperShadow)

    const backRightUpper = scene.add.ellipse(11, 2, 7.5, 11, bodyColor)
    backRightUpper.setStrokeStyle(2, bodyDark, 0.8)
    this.bodyContainer.add(backRightUpper)

    const backRightUpperHighlight = scene.add.ellipse(12, 0, 4, 7, this.getLighterColor(bodyColor, 40), 0.5)
    this.bodyContainer.add(backRightUpperHighlight)

    // Back Right Knee joint
    const backRightKneeShadow = scene.add.circle(10, 9, 4.5, 0x000000, 0.3)
    this.bodyContainer.add(backRightKneeShadow)

    const backRightKnee = scene.add.circle(11, 8, 4, legColor)
    backRightKnee.setStrokeStyle(2, this.getDarkerColor(legColor, 30), 0.8)
    this.bodyContainer.add(backRightKnee)

    // Back Right Lower Leg
    const backRightLowerShadow = scene.add.ellipse(10, 13, 6.5, 9, 0x000000, 0.3)
    this.bodyContainer.add(backRightLowerShadow)

    const backRightLower = scene.add.ellipse(11, 12, 6, 8, legColor)
    backRightLower.setStrokeStyle(2, this.getDarkerColor(legColor, 30), 0.8)
    this.bodyContainer.add(backRightLower)

    // Back Right Foot with talons
    const backRightFootShadow = scene.add.ellipse(10, 18, 7, 4, 0x000000, 0.4)
    this.bodyContainer.add(backRightFootShadow)

    const backRightFoot = scene.add.ellipse(11, 17, 6.5, 3.5, this.getDarkerColor(legColor, 20))
    backRightFoot.setStrokeStyle(2, this.getDarkerColor(legColor, 40), 0.8)
    this.bodyContainer.add(backRightFoot)

    // Back Right Talons
    for (let i = 0; i < 3; i++) {
      const talonX = 9 + i * 2
      const talonY = 18.5
      const talonAngle = -0.3 + i * 0.3

      const talonShadow = scene.add.rectangle(talonX + 0.5, talonY + 0.5, 1, 3, 0x000000, 0.4)
      talonShadow.setRotation(talonAngle)
      this.bodyContainer.add(talonShadow)

      const talon = scene.add.rectangle(talonX, talonY, 0.9, 2.8, clawColor)
      talon.setRotation(talonAngle)
      talon.setStrokeStyle(1, 0x000000, 0.8)
      this.bodyContainer.add(talon)

      const talonSharp = scene.add.circle(talonX - Math.sin(talonAngle) * 1.4, talonY + Math.cos(talonAngle) * 1.4, 0.6, clawColor)
      this.bodyContainer.add(talonSharp)
    }

    // =========================
    // FRONT ARMS & CLAWS
    // =========================
    // Front Left Arm
    const frontLeftArmShadow = scene.add.ellipse(-13, -5, 7, 11, 0x000000, 0.3)
    frontLeftArmShadow.setRotation(-0.4)
    this.bodyContainer.add(frontLeftArmShadow)

    const frontLeftArm = scene.add.ellipse(-14, -6, 6.5, 10, bodyColor)
    frontLeftArm.setRotation(-0.4)
    frontLeftArm.setStrokeStyle(2, bodyDark, 0.8)
    this.bodyContainer.add(frontLeftArm)

    const frontLeftArmHighlight = scene.add.ellipse(-15, -8, 3.5, 6, this.getLighterColor(bodyColor, 40), 0.5)
    frontLeftArmHighlight.setRotation(-0.4)
    this.bodyContainer.add(frontLeftArmHighlight)

    // Front Left Forearm
    const frontLeftForearmShadow = scene.add.ellipse(-17, 0, 5.5, 8, 0x000000, 0.3)
    frontLeftForearmShadow.setRotation(-0.5)
    this.bodyContainer.add(frontLeftForearmShadow)

    const frontLeftForearm = scene.add.ellipse(-18, -1, 5, 7, legColor)
    frontLeftForearm.setRotation(-0.5)
    frontLeftForearm.setStrokeStyle(2, this.getDarkerColor(legColor, 30), 0.8)
    this.bodyContainer.add(frontLeftForearm)

    // Front Left Hand
    const frontLeftHandShadow = scene.add.circle(-20, 3, 3.5, 0x000000, 0.3)
    this.bodyContainer.add(frontLeftHandShadow)

    const frontLeftHand = scene.add.circle(-21, 2, 3, this.getDarkerColor(legColor, 20))
    frontLeftHand.setStrokeStyle(2, this.getDarkerColor(legColor, 40), 0.8)
    this.bodyContainer.add(frontLeftHand)

    // Front Left Claws - 4 sharp dragon claws
    for (let i = 0; i < 4; i++) {
      const clawAngle = -0.9 + i * 0.4
      const clawX = -23 - Math.sin(clawAngle) * 1.5
      const clawY = 2.5 + Math.cos(clawAngle) * 1.5

      const clawShadow = scene.add.rectangle(clawX + 0.5, clawY + 0.5, 1, 3.5, 0x000000, 0.4)
      clawShadow.setRotation(clawAngle)
      this.bodyContainer.add(clawShadow)

      const claw = scene.add.rectangle(clawX, clawY, 0.9, 3.2, clawColor)
      claw.setRotation(clawAngle)
      claw.setStrokeStyle(1, 0x000000, 0.9)
      this.bodyContainer.add(claw)

      const clawTip = scene.add.circle(clawX - Math.sin(clawAngle) * 1.6, clawY + Math.cos(clawAngle) * 1.6, 0.7, clawColor)
      this.bodyContainer.add(clawTip)
    }

    // Front Right Arm
    const frontRightArmShadow = scene.add.ellipse(13, -5, 7, 11, 0x000000, 0.3)
    frontRightArmShadow.setRotation(0.4)
    this.bodyContainer.add(frontRightArmShadow)

    const frontRightArm = scene.add.ellipse(14, -6, 6.5, 10, bodyColor)
    frontRightArm.setRotation(0.4)
    frontRightArm.setStrokeStyle(2, bodyDark, 0.8)
    this.bodyContainer.add(frontRightArm)

    const frontRightArmHighlight = scene.add.ellipse(15, -8, 3.5, 6, this.getLighterColor(bodyColor, 40), 0.5)
    frontRightArmHighlight.setRotation(0.4)
    this.bodyContainer.add(frontRightArmHighlight)

    // Front Right Forearm
    const frontRightForearmShadow = scene.add.ellipse(17, 0, 5.5, 8, 0x000000, 0.3)
    frontRightForearmShadow.setRotation(0.5)
    this.bodyContainer.add(frontRightForearmShadow)

    const frontRightForearm = scene.add.ellipse(18, -1, 5, 7, legColor)
    frontRightForearm.setRotation(0.5)
    frontRightForearm.setStrokeStyle(2, this.getDarkerColor(legColor, 30), 0.8)
    this.bodyContainer.add(frontRightForearm)

    // Front Right Hand
    const frontRightHandShadow = scene.add.circle(20, 3, 3.5, 0x000000, 0.3)
    this.bodyContainer.add(frontRightHandShadow)

    const frontRightHand = scene.add.circle(21, 2, 3, this.getDarkerColor(legColor, 20))
    frontRightHand.setStrokeStyle(2, this.getDarkerColor(legColor, 40), 0.8)
    this.bodyContainer.add(frontRightHand)

    // Front Right Claws
    for (let i = 0; i < 4; i++) {
      const clawAngle = 0.9 - i * 0.4
      const clawX = 23 + Math.sin(clawAngle) * 1.5
      const clawY = 2.5 + Math.cos(clawAngle) * 1.5

      const clawShadow = scene.add.rectangle(clawX + 0.5, clawY + 0.5, 1, 3.5, 0x000000, 0.4)
      clawShadow.setRotation(clawAngle)
      this.bodyContainer.add(clawShadow)

      const claw = scene.add.rectangle(clawX, clawY, 0.9, 3.2, clawColor)
      claw.setRotation(clawAngle)
      claw.setStrokeStyle(1, 0x000000, 0.9)
      this.bodyContainer.add(claw)

      const clawTip = scene.add.circle(clawX + Math.sin(clawAngle) * 1.6, clawY + Math.cos(clawAngle) * 1.6, 0.7, clawColor)
      this.bodyContainer.add(clawTip)
    }

    // =========================
    // SCALE TEXTURE - Additional scale details on limbs
    // =========================
    const scalePositions = [
      [-11, 5], [-11, 10], [11, 5], [11, 10],  // Legs
      [-15, -3], [-19, 1], [15, -3], [19, 1]   // Arms
    ]

    scalePositions.forEach(([x, y]) => {
      const scale = scene.add.circle(x, y, 2, bodyDark, 0.4)
      scale.setStrokeStyle(1, this.getDarkerColor(bodyDark, 30), 0.6)
      this.bodyContainer.add(scale)
    })

    this.addGlow(scene, 0xFF5722, 35)
  }

  // 11. Balanced Beetle - Beetle with shell and antennae
  private createBeetle(scene: Phaser.Scene) {
    // Create rotating body container
    this.bodyContainer = scene.add.container(0, 0)
    this.add(this.bodyContainer)

    const mainColor = 0x9CCC65
    const darkColor = this.getDarkerColor(mainColor, 50)
    const lightColor = this.getLighterColor(mainColor, 50)

    // SHELL - Hard shell with segments (3-4 sections) and metallic sheen
    const shellShadowDeep = scene.add.ellipse(3, -6, 21, 26, 0x000000, 0.35)
    this.bodyContainer.add(shellShadowDeep)

    const shellBase1 = scene.add.ellipse(1, -7, 20, 25, darkColor, 0.9)
    this.bodyContainer.add(shellBase1)

    const shell = scene.add.ellipse(0, -8, 21, 26, mainColor)
    shell.setStrokeStyle(3, 0x000000, 0.8)
    this.bodyContainer.add(shell)
    this.towerGraphic = shell
    this.characterParts.body = shell

    // Strong specular highlights for metallic sheen
    const shellHighlight1 = scene.add.ellipse(-3, -12, 12, 14, lightColor, 0.6)
    this.bodyContainer.add(shellHighlight1)

    const shellHighlight2 = scene.add.ellipse(-4, -13, 8, 10, this.getLighterColor(mainColor, 70), 0.7)
    this.bodyContainer.add(shellHighlight2)

    const shellSpecular1 = scene.add.circle(-5, -14, 5, 0xFFFFFF, 0.8)
    this.bodyContainer.add(shellSpecular1)

    const shellSpecular2 = scene.add.circle(-6, -15, 3, 0xFFFFFF, 0.9)
    this.bodyContainer.add(shellSpecular2)

    // Shell segments (3-4 sections)
    const segmentColor = this.getDarkerColor(mainColor, 30)
    const segment1 = scene.add.ellipse(0, -18, 19, 8, segmentColor, 0.4)
    this.bodyContainer.add(segment1)

    const segment2 = scene.add.ellipse(0, -8, 18, 8, segmentColor, 0.4)
    this.bodyContainer.add(segment2)

    const segment3 = scene.add.ellipse(0, 2, 17, 8, segmentColor, 0.4)
    this.bodyContainer.add(segment3)

    // Center line pattern
    const patternShadow = scene.add.rectangle(1, -8, 3, 24, 0x000000, 0.3)
    this.bodyContainer.add(patternShadow)

    const pattern = scene.add.rectangle(0, -8, 3, 24, this.getDarkerColor(mainColor, 60))
    pattern.setStrokeStyle(2, 0x000000, 0.6)
    this.bodyContainer.add(pattern)

    const patternHighlight = scene.add.rectangle(-0.5, -8, 1.5, 24, this.getDarkerColor(mainColor, 40), 0.6)
    this.bodyContainer.add(patternHighlight)

    // HEAD - Multi-layered
    const headColor = this.getDarkerColor(mainColor, 20)
    const headShadow = scene.add.ellipse(2, -25, 12, 10, 0x000000, 0.3)
    this.bodyContainer.add(headShadow)

    const headBase = scene.add.ellipse(0, -26, 12.5, 10.5, this.getDarkerColor(headColor, 30))
    this.bodyContainer.add(headBase)

    const head = scene.add.ellipse(0, -26, 12, 10, headColor)
    head.setStrokeStyle(3, 0x000000, 0.8)
    this.bodyContainer.add(head)
    this.characterParts.head = head

    const headHighlight = scene.add.ellipse(-2, -28, 6, 5, this.getLighterColor(headColor, 50), 0.6)
    this.bodyContainer.add(headHighlight)

    // ANTENNAE - Multi-layered
    const antColor = this.getDarkerColor(mainColor, 40)

    // Left antenna
    const antLShadow = scene.add.rectangle(-4, -33, 3, 10, 0x000000, 0.3)
    this.bodyContainer.add(antLShadow)

    const antL = scene.add.rectangle(-5, -33, 3, 10, antColor)
    antL.setStrokeStyle(2, 0x000000, 0.6)
    this.bodyContainer.add(antL)

    const antLHighlight = scene.add.rectangle(-5.5, -33, 1.5, 10, this.getLighterColor(antColor, 40), 0.6)
    this.bodyContainer.add(antLHighlight)

    // Right antenna
    const antRShadow = scene.add.rectangle(4, -33, 3, 10, 0x000000, 0.3)
    this.bodyContainer.add(antRShadow)

    const antR = scene.add.rectangle(5, -33, 3, 10, antColor)
    antR.setStrokeStyle(2, 0x000000, 0.6)
    this.bodyContainer.add(antR)

    const antRHighlight = scene.add.rectangle(5.5, -33, 1.5, 10, this.getLighterColor(antColor, 40), 0.6)
    this.bodyContainer.add(antRHighlight)

    this.characterParts.accessories = [antL, antR, pattern]

    // LEGS - Segmented legs (3 pairs, highly detailed with multiple segments and clawed feet)
    const legColor = antColor
    const legDark = this.getDarkerColor(legColor, 30)
    const clawColor = 0x1A1A1A
    const legs: Phaser.GameObjects.Shape[] = []

    for (let i = 0; i < 3; i++) {
      const yPos = -14 + i * 6

      // =========================
      // LEFT LEG - Multi-segmented with detail
      // =========================

      // Coxa (hip joint) - attached to body
      const legLCoxaShadow = scene.add.circle(-9, yPos, 2.5, 0x000000, 0.3)
      this.bodyContainer.add(legLCoxaShadow)

      const legLCoxa = scene.add.circle(-10, yPos, 2.2, legColor)
      legLCoxa.setStrokeStyle(1.5, 0x000000, 0.8)
      this.bodyContainer.add(legLCoxa)

      const legLCoxaHighlight = scene.add.circle(-10.5, yPos - 0.5, 1, this.getLighterColor(legColor, 40), 0.7)
      this.bodyContainer.add(legLCoxaHighlight)

      // Femur (upper leg segment)
      const legLFemurShadow = scene.add.rectangle(-13, yPos, 7, 3.5, 0x000000, 0.3)
      legLFemurShadow.setRotation(-0.4)
      this.bodyContainer.add(legLFemurShadow)

      const legLFemur = scene.add.rectangle(-13.5, yPos + 0.5, 6.5, 3, legColor)
      legLFemur.setRotation(-0.5)
      legLFemur.setStrokeStyle(1.5, legDark, 0.8)
      this.bodyContainer.add(legLFemur)
      legs.push(legLFemur)

      const legLFemurHighlight = scene.add.rectangle(-14, yPos + 0.3, 2, 2.5, this.getLighterColor(legColor, 30), 0.6)
      legLFemurHighlight.setRotation(-0.5)
      this.bodyContainer.add(legLFemurHighlight)

      // Knee joint
      const legLKneeShadow = scene.add.circle(-17, yPos + 2, 2.5, 0x000000, 0.3)
      this.bodyContainer.add(legLKneeShadow)

      const legLKnee = scene.add.circle(-17.5, yPos + 2, 2.2, legDark)
      legLKnee.setStrokeStyle(1.5, 0x000000, 0.8)
      this.bodyContainer.add(legLKnee)

      const legLKneeHighlight = scene.add.circle(-18, yPos + 1.5, 1, this.getLighterColor(legColor, 40), 0.7)
      this.bodyContainer.add(legLKneeHighlight)

      // Tibia (lower leg segment)
      const legLTibiaShadow = scene.add.rectangle(-20, yPos + 4, 6, 2.5, 0x000000, 0.3)
      legLTibiaShadow.setRotation(-0.6)
      this.bodyContainer.add(legLTibiaShadow)

      const legLTibia = scene.add.rectangle(-20.5, yPos + 4.5, 5.5, 2.3, legDark)
      legLTibia.setRotation(-0.6)
      legLTibia.setStrokeStyle(1.5, this.getDarkerColor(legDark, 30), 0.8)
      this.bodyContainer.add(legLTibia)

      const legLTibiaHighlight = scene.add.rectangle(-21, yPos + 4.3, 1.5, 2, this.getLighterColor(legColor, 20), 0.6)
      legLTibiaHighlight.setRotation(-0.6)
      this.bodyContainer.add(legLTibiaHighlight)

      // Foot (tarsus) - small segmented foot
      const legLFootShadow = scene.add.ellipse(-23, yPos + 6, 3, 2, 0x000000, 0.3)
      this.bodyContainer.add(legLFootShadow)

      const legLFoot = scene.add.ellipse(-23.5, yPos + 6, 2.8, 1.8, this.getDarkerColor(legDark, 20))
      legLFoot.setStrokeStyle(1, this.getDarkerColor(legDark, 40), 0.8)
      this.bodyContainer.add(legLFoot)

      // Foot claws - 2 small claws
      for (let c = 0; c < 2; c++) {
        const clawX = -25 + c * 1.5
        const clawY = yPos + 6.5
        const clawAngle = -0.4 + c * 0.8

        const clawShadow = scene.add.rectangle(clawX + 0.3, clawY + 0.3, 0.7, 1.5, 0x000000, 0.4)
        clawShadow.setRotation(clawAngle)
        this.bodyContainer.add(clawShadow)

        const claw = scene.add.rectangle(clawX, clawY, 0.6, 1.3, clawColor)
        claw.setRotation(clawAngle)
        claw.setStrokeStyle(0.5, 0x000000, 0.9)
        this.bodyContainer.add(claw)
      }

      // =========================
      // RIGHT LEG - Mirror of left
      // =========================

      // Coxa (hip joint)
      const legRCoxaShadow = scene.add.circle(9, yPos, 2.5, 0x000000, 0.3)
      this.bodyContainer.add(legRCoxaShadow)

      const legRCoxa = scene.add.circle(10, yPos, 2.2, legColor)
      legRCoxa.setStrokeStyle(1.5, 0x000000, 0.8)
      this.bodyContainer.add(legRCoxa)

      const legRCoxaHighlight = scene.add.circle(10.5, yPos - 0.5, 1, this.getLighterColor(legColor, 40), 0.7)
      this.bodyContainer.add(legRCoxaHighlight)

      // Femur (upper leg segment)
      const legRFemurShadow = scene.add.rectangle(13, yPos, 7, 3.5, 0x000000, 0.3)
      legRFemurShadow.setRotation(0.4)
      this.bodyContainer.add(legRFemurShadow)

      const legRFemur = scene.add.rectangle(13.5, yPos + 0.5, 6.5, 3, legColor)
      legRFemur.setRotation(0.5)
      legRFemur.setStrokeStyle(1.5, legDark, 0.8)
      this.bodyContainer.add(legRFemur)
      legs.push(legRFemur)

      const legRFemurHighlight = scene.add.rectangle(14, yPos + 0.3, 2, 2.5, this.getLighterColor(legColor, 30), 0.6)
      legRFemurHighlight.setRotation(0.5)
      this.bodyContainer.add(legRFemurHighlight)

      // Knee joint
      const legRKneeShadow = scene.add.circle(17, yPos + 2, 2.5, 0x000000, 0.3)
      this.bodyContainer.add(legRKneeShadow)

      const legRKnee = scene.add.circle(17.5, yPos + 2, 2.2, legDark)
      legRKnee.setStrokeStyle(1.5, 0x000000, 0.8)
      this.bodyContainer.add(legRKnee)

      const legRKneeHighlight = scene.add.circle(18, yPos + 1.5, 1, this.getLighterColor(legColor, 40), 0.7)
      this.bodyContainer.add(legRKneeHighlight)

      // Tibia (lower leg segment)
      const legRTibiaShadow = scene.add.rectangle(20, yPos + 4, 6, 2.5, 0x000000, 0.3)
      legRTibiaShadow.setRotation(0.6)
      this.bodyContainer.add(legRTibiaShadow)

      const legRTibia = scene.add.rectangle(20.5, yPos + 4.5, 5.5, 2.3, legDark)
      legRTibia.setRotation(0.6)
      legRTibia.setStrokeStyle(1.5, this.getDarkerColor(legDark, 30), 0.8)
      this.bodyContainer.add(legRTibia)

      const legRTibiaHighlight = scene.add.rectangle(21, yPos + 4.3, 1.5, 2, this.getLighterColor(legColor, 20), 0.6)
      legRTibiaHighlight.setRotation(0.6)
      this.bodyContainer.add(legRTibiaHighlight)

      // Foot (tarsus)
      const legRFootShadow = scene.add.ellipse(23, yPos + 6, 3, 2, 0x000000, 0.3)
      this.bodyContainer.add(legRFootShadow)

      const legRFoot = scene.add.ellipse(23.5, yPos + 6, 2.8, 1.8, this.getDarkerColor(legDark, 20))
      legRFoot.setStrokeStyle(1, this.getDarkerColor(legDark, 40), 0.8)
      this.bodyContainer.add(legRFoot)

      // Foot claws
      for (let c = 0; c < 2; c++) {
        const clawX = 23.5 + c * 1.5
        const clawY = yPos + 6.5
        const clawAngle = -0.4 + c * 0.8

        const clawShadow = scene.add.rectangle(clawX + 0.3, clawY + 0.3, 0.7, 1.5, 0x000000, 0.4)
        clawShadow.setRotation(clawAngle)
        this.bodyContainer.add(clawShadow)

        const claw = scene.add.rectangle(clawX, clawY, 0.6, 1.3, clawColor)
        claw.setRotation(clawAngle)
        claw.setStrokeStyle(0.5, 0x000000, 0.9)
        this.bodyContainer.add(claw)
      }
    }

    // IDLE ANIMATION - Subtle breathing
    scene.tweens.add({
      targets: this.bodyContainer,
      y: this.bodyContainer.y + 1,
      scaleY: 1.01,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Shell shimmer animation
    scene.tweens.add({
      targets: [shellSpecular1, shellSpecular2],
      alpha: 0.4,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Leg movement
    scene.tweens.add({
      targets: legs,
      rotation: '+=0.1',
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 150
    })

    this.addGlow(scene, 0x9CCC65, 29)
  }

  // 12. Adventurous Astronaut - Astronaut with helmet
  private createAstronaut(scene: Phaser.Scene) {
    // Create rotating body container
    this.bodyContainer = scene.add.container(0, 0)
    this.add(this.bodyContainer)

    const suitColor = 0xAB47BC
    const helmetColor = 0x26C6DA

    // SUIT BODY - With padding details (ribbed sections)
    const bodyShadow = scene.add.rectangle(2, -3, 19, 24, 0x000000, 0.3)
    this.bodyContainer.add(bodyShadow)

    const bodyBase = scene.add.rectangle(0, -4, 19.5, 24.5, this.getDarkerColor(suitColor, 40))
    this.bodyContainer.add(bodyBase)

    const body = scene.add.rectangle(0, -4, 19, 24, suitColor)
    body.setStrokeStyle(3, 0x000000, 0.8)
    this.bodyContainer.add(body)
    this.towerGraphic = body
    this.characterParts.body = body

    const bodyHighlight = scene.add.rectangle(-2, -8, 10, 12, this.getLighterColor(suitColor, 50), 0.5)
    this.bodyContainer.add(bodyHighlight)

    // Ribbed padding sections
    for (let i = 0; i < 3; i++) {
      const rib = scene.add.rectangle(0, -12 + i * 7, 17, 2, this.getDarkerColor(suitColor, 30), 0.4)
      this.bodyContainer.add(rib)
    }

    // REFLECTIVE HELMET - Strong gradient, glass effect
    const helmetShadow = scene.add.circle(2, -21, 13, 0x000000, 0.25)
    this.bodyContainer.add(helmetShadow)

    const helmetBase = scene.add.circle(0, -22, 13.5, this.getDarkerColor(helmetColor, 30), 0.4)
    this.bodyContainer.add(helmetBase)

    const helmet = scene.add.circle(0, -22, 13, helmetColor, 0.5)
    helmet.setStrokeStyle(4, 0xFFFFFF, 1)
    this.bodyContainer.add(helmet)
    this.characterParts.head = helmet

    // Glass effect layers
    const helmetGlass1 = scene.add.circle(-2, -24, 9, this.getLighterColor(helmetColor, 60), 0.4)
    this.bodyContainer.add(helmetGlass1)

    const helmetGlass2 = scene.add.circle(-3, -25, 6, 0xFFFFFF, 0.5)
    this.bodyContainer.add(helmetGlass2)

    // FACE inside helmet
    const faceShadow = scene.add.circle(1, -21, 8, 0x000000, 0.15)
    this.bodyContainer.add(faceShadow)

    const face = scene.add.circle(0, -22, 8, 0xFFCCBC)
    this.bodyContainer.add(face)

    const faceHighlight = scene.add.circle(-1.5, -24, 4, this.getLighterColor(0xFFCCBC, 30), 0.6)
    this.bodyContainer.add(faceHighlight)

    // Eyes
    const eyeL = scene.add.circle(-2.5, -22, 1.5, 0x000000)
    this.bodyContainer.add(eyeL)

    const eyeR = scene.add.circle(2.5, -22, 1.5, 0x000000)
    this.bodyContainer.add(eyeR)

    // VISOR reflection/glow
    const visor1 = scene.add.arc(-6, -28, 7, 0, 180, false, 0xFFFFFF, 0.7)
    this.bodyContainer.add(visor1)

    const visor2 = scene.add.arc(-5, -27, 6, 0, 180, false, 0xFFFFFF, 0.6)
    this.bodyContainer.add(visor2)

    const visorGlow = scene.add.circle(-5, -26, 4, helmetColor, 0.4)
    this.bodyContainer.add(visorGlow)

    this.characterParts.accessories = [visor2]

    // BACKPACK with details
    const packShadow = scene.add.rectangle(2, 5, 16, 12, 0x000000, 0.3)
    this.bodyContainer.add(packShadow)

    const packBase = scene.add.rectangle(0, 4, 16.5, 12.5, this.getDarkerColor(0x7B1FA2, 30))
    this.bodyContainer.add(packBase)

    const pack = scene.add.rectangle(0, 4, 16, 12, 0x7B1FA2)
    pack.setStrokeStyle(3, 0x000000, 0.7)
    this.bodyContainer.add(pack)

    const packHighlight = scene.add.rectangle(-2, 2, 8, 6, this.getLighterColor(0x7B1FA2, 40), 0.5)
    this.bodyContainer.add(packHighlight)

    // Pack details (vents)
    const vent1 = scene.add.rectangle(-4, 4, 2, 8, this.getDarkerColor(0x7B1FA2, 50), 0.7)
    this.bodyContainer.add(vent1)

    const vent2 = scene.add.rectangle(4, 4, 2, 8, this.getDarkerColor(0x7B1FA2, 50), 0.7)
    this.bodyContainer.add(vent2)

    this.characterParts.accessories.push(pack)

    // ARMS with padding
    const armLShadow = scene.add.rectangle(-11, -5, 7, 14, 0x000000, 0.3)
    this.bodyContainer.add(armLShadow)

    const armL = scene.add.rectangle(-12, -6, 7, 14, suitColor)
    armL.setStrokeStyle(2, 0x000000, 0.7)
    this.bodyContainer.add(armL)

    const armLHighlight = scene.add.rectangle(-13, -8, 4, 8, this.getLighterColor(suitColor, 40), 0.5)
    this.bodyContainer.add(armLHighlight)

    const armRShadow = scene.add.rectangle(11, -5, 7, 14, 0x000000, 0.3)
    this.bodyContainer.add(armRShadow)

    const armR = scene.add.rectangle(12, -6, 7, 14, suitColor)
    armR.setStrokeStyle(2, 0x000000, 0.7)
    this.bodyContainer.add(armR)

    const armRHighlight = scene.add.rectangle(13, -8, 4, 8, this.getLighterColor(suitColor, 40), 0.5)
    this.bodyContainer.add(armRHighlight)

    // =========================
    // GLOVES & FINGERS - Detailed space gloves
    // =========================
    const gloveColor = 0xFFFFFF
    const gloveDark = this.getDarkerColor(gloveColor, 40)
    const fingerColor = this.getDarkerColor(gloveColor, 20)

    // Left Glove
    const leftGloveShadow = scene.add.circle(-11, 3, 4, 0x000000, 0.3)
    this.bodyContainer.add(leftGloveShadow)

    const leftGlove = scene.add.circle(-12, 2, 3.5, gloveColor)
    leftGlove.setStrokeStyle(2, gloveDark, 0.8)
    this.bodyContainer.add(leftGlove)

    const leftGloveHighlight = scene.add.circle(-13, 1, 1.8, this.getLighterColor(gloveColor, 30), 0.6)
    this.bodyContainer.add(leftGloveHighlight)

    // Wrist cuff
    const leftCuff = scene.add.rectangle(-12, 0, 6, 2, this.getDarkerColor(suitColor, 20))
    leftCuff.setStrokeStyle(1, 0x000000, 0.7)
    this.bodyContainer.add(leftCuff)

    // Left Fingers (4 fingers with padding)
    for (let i = 0; i < 4; i++) {
      const fingerAngle = -0.7 + i * 0.35
      const fingerLength = 3
      const fingerX = -14 - Math.sin(fingerAngle) * 2
      const fingerY = 2.5 + Math.cos(fingerAngle) * 2

      // Finger shadow
      const fingerShadow = scene.add.rectangle(fingerX + 0.5, fingerY + 0.5, 1.3, fingerLength, 0x000000, 0.3)
      fingerShadow.setRotation(fingerAngle)
      this.bodyContainer.add(fingerShadow)

      // Finger base
      const finger = scene.add.rectangle(fingerX, fingerY, 1.2, fingerLength, fingerColor)
      finger.setRotation(fingerAngle)
      finger.setStrokeStyle(1, gloveDark, 0.7)
      this.bodyContainer.add(finger)

      // Finger highlight
      const fingerHighlight = scene.add.rectangle(fingerX - 0.3, fingerY, 0.5, fingerLength - 0.5, gloveColor, 0.6)
      fingerHighlight.setRotation(fingerAngle)
      this.bodyContainer.add(fingerHighlight)

      // Finger padding segments
      for (let s = 0; s < 2; s++) {
        const segY = fingerY - fingerLength / 2 + s * (fingerLength / 2)
        const seg = scene.add.rectangle(fingerX, segY, 1.1, 0.5, gloveDark, 0.5)
        seg.setRotation(fingerAngle)
        this.bodyContainer.add(seg)
      }
    }

    // Thumb
    const thumbAngle = -1.2
    const thumbX = -15
    const thumbY = 1

    const thumbShadow = scene.add.rectangle(thumbX + 0.5, thumbY + 0.5, 1.3, 2.5, 0x000000, 0.3)
    thumbShadow.setRotation(thumbAngle)
    this.bodyContainer.add(thumbShadow)

    const thumb = scene.add.rectangle(thumbX, thumbY, 1.2, 2.5, fingerColor)
    thumb.setRotation(thumbAngle)
    thumb.setStrokeStyle(1, gloveDark, 0.7)
    this.bodyContainer.add(thumb)

    // Right Glove
    const rightGloveShadow = scene.add.circle(11, 3, 4, 0x000000, 0.3)
    this.bodyContainer.add(rightGloveShadow)

    const rightGlove = scene.add.circle(12, 2, 3.5, gloveColor)
    rightGlove.setStrokeStyle(2, gloveDark, 0.8)
    this.bodyContainer.add(rightGlove)

    const rightGloveHighlight = scene.add.circle(13, 1, 1.8, this.getLighterColor(gloveColor, 30), 0.6)
    this.bodyContainer.add(rightGloveHighlight)

    // Wrist cuff
    const rightCuff = scene.add.rectangle(12, 0, 6, 2, this.getDarkerColor(suitColor, 20))
    rightCuff.setStrokeStyle(1, 0x000000, 0.7)
    this.bodyContainer.add(rightCuff)

    // Right Fingers
    for (let i = 0; i < 4; i++) {
      const fingerAngle = 0.7 - i * 0.35
      const fingerLength = 3
      const fingerX = 14 + Math.sin(fingerAngle) * 2
      const fingerY = 2.5 + Math.cos(fingerAngle) * 2

      const fingerShadow = scene.add.rectangle(fingerX + 0.5, fingerY + 0.5, 1.3, fingerLength, 0x000000, 0.3)
      fingerShadow.setRotation(fingerAngle)
      this.bodyContainer.add(fingerShadow)

      const finger = scene.add.rectangle(fingerX, fingerY, 1.2, fingerLength, fingerColor)
      finger.setRotation(fingerAngle)
      finger.setStrokeStyle(1, gloveDark, 0.7)
      this.bodyContainer.add(finger)

      const fingerHighlight = scene.add.rectangle(fingerX + 0.3, fingerY, 0.5, fingerLength - 0.5, gloveColor, 0.6)
      fingerHighlight.setRotation(fingerAngle)
      this.bodyContainer.add(fingerHighlight)

      for (let s = 0; s < 2; s++) {
        const segY = fingerY - fingerLength / 2 + s * (fingerLength / 2)
        const seg = scene.add.rectangle(fingerX, segY, 1.1, 0.5, gloveDark, 0.5)
        seg.setRotation(fingerAngle)
        this.bodyContainer.add(seg)
      }
    }

    // Right Thumb
    const thumbRAngle = 1.2
    const thumbRX = 15
    const thumbRY = 1

    const thumbRShadow = scene.add.rectangle(thumbRX + 0.5, thumbRY + 0.5, 1.3, 2.5, 0x000000, 0.3)
    thumbRShadow.setRotation(thumbRAngle)
    this.bodyContainer.add(thumbRShadow)

    const thumbR = scene.add.rectangle(thumbRX, thumbRY, 1.2, 2.5, fingerColor)
    thumbR.setRotation(thumbRAngle)
    thumbR.setStrokeStyle(1, gloveDark, 0.7)
    this.bodyContainer.add(thumbR)

    // =========================
    // LEGS & BOOTS - Space suit legs with detailed boots
    // =========================
    const bootColor = this.getDarkerColor(suitColor, 30)

    // Left Leg
    const leftLegShadow = scene.add.rectangle(-5, 11, 7, 11, 0x000000, 0.3)
    this.bodyContainer.add(leftLegShadow)

    const leftLeg = scene.add.rectangle(-6, 10, 6.5, 10, suitColor)
    leftLeg.setStrokeStyle(2, this.getDarkerColor(suitColor, 40), 0.8)
    this.bodyContainer.add(leftLeg)

    const leftLegHighlight = scene.add.rectangle(-7, 8, 3, 6, this.getLighterColor(suitColor, 40), 0.5)
    this.bodyContainer.add(leftLegHighlight)

    // Knee padding
    const leftKneePad = scene.add.circle(-6, 12, 2.5, this.getDarkerColor(suitColor, 20), 0.6)
    leftKneePad.setStrokeStyle(1, 0x000000, 0.6)
    this.bodyContainer.add(leftKneePad)

    // Left Boot
    const leftBootShadow = scene.add.ellipse(-5, 17, 8, 5, 0x000000, 0.4)
    this.bodyContainer.add(leftBootShadow)

    const leftBoot = scene.add.ellipse(-6, 16, 7.5, 4.5, bootColor)
    leftBoot.setStrokeStyle(2, 0x000000, 0.8)
    this.bodyContainer.add(leftBoot)

    const leftBootHighlight = scene.add.ellipse(-7, 15.5, 3, 2, this.getLighterColor(bootColor, 50), 0.6)
    this.bodyContainer.add(leftBootHighlight)

    // Boot sole with treads
    const leftSole = scene.add.ellipse(-6, 17.5, 7, 2, 0x1A1A1A)
    leftSole.setStrokeStyle(1, 0x000000, 0.9)
    this.bodyContainer.add(leftSole)

    for (let t = 0; t < 3; t++) {
      const tread = scene.add.rectangle(-8 + t * 2.5, 17.5, 1.5, 1.5, 0x000000, 0.7)
      this.bodyContainer.add(tread)
    }

    // Right Leg
    const rightLegShadow = scene.add.rectangle(5, 11, 7, 11, 0x000000, 0.3)
    this.bodyContainer.add(rightLegShadow)

    const rightLeg = scene.add.rectangle(6, 10, 6.5, 10, suitColor)
    rightLeg.setStrokeStyle(2, this.getDarkerColor(suitColor, 40), 0.8)
    this.bodyContainer.add(rightLeg)

    const rightLegHighlight = scene.add.rectangle(7, 8, 3, 6, this.getLighterColor(suitColor, 40), 0.5)
    this.bodyContainer.add(rightLegHighlight)

    // Knee padding
    const rightKneePad = scene.add.circle(6, 12, 2.5, this.getDarkerColor(suitColor, 20), 0.6)
    rightKneePad.setStrokeStyle(1, 0x000000, 0.6)
    this.bodyContainer.add(rightKneePad)

    // Right Boot
    const rightBootShadow = scene.add.ellipse(5, 17, 8, 5, 0x000000, 0.4)
    this.bodyContainer.add(rightBootShadow)

    const rightBoot = scene.add.ellipse(6, 16, 7.5, 4.5, bootColor)
    rightBoot.setStrokeStyle(2, 0x000000, 0.8)
    this.bodyContainer.add(rightBoot)

    const rightBootHighlight = scene.add.ellipse(7, 15.5, 3, 2, this.getLighterColor(bootColor, 50), 0.6)
    this.bodyContainer.add(rightBootHighlight)

    // Boot sole with treads
    const rightSole = scene.add.ellipse(6, 17.5, 7, 2, 0x1A1A1A)
    rightSole.setStrokeStyle(1, 0x000000, 0.9)
    this.bodyContainer.add(rightSole)

    for (let t = 0; t < 3; t++) {
      const tread = scene.add.rectangle(4 + t * 2.5, 17.5, 1.5, 1.5, 0x000000, 0.7)
      this.bodyContainer.add(tread)
    }

    // IDLE ANIMATION - Floating in zero gravity
    scene.tweens.add({
      targets: this.bodyContainer,
      y: this.bodyContainer.y + 3,
      rotation: 0.05,
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Visor glow pulse
    scene.tweens.add({
      targets: [visorGlow, helmetGlass1, helmetGlass2],
      alpha: { from: 0.4, to: 0.7 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    this.addGlow(scene, 0x26C6DA, 30)
  }

  // 13. Creative Crab - Crab with claws and shell
  private createCrab(scene: Phaser.Scene) {
    // Create rotating body container
    this.bodyContainer = scene.add.container(0, 0)
    this.add(this.bodyContainer)

    const shellColor = 0x8D6E63
    const clawColor = 0xFF6E6E

    // SHELL/BODY - Segmented with texture
    const shellShadow = scene.add.ellipse(3, -7, 24, 19, 0x000000, 0.3)
    this.bodyContainer.add(shellShadow)

    const shellBase = scene.add.ellipse(0, -8, 24.5, 19.5, this.getDarkerColor(shellColor, 40))
    this.bodyContainer.add(shellBase)

    const body = scene.add.ellipse(0, -8, 24, 19, shellColor)
    body.setStrokeStyle(3, 0x000000, 0.8)
    this.bodyContainer.add(body)
    this.towerGraphic = body
    this.characterParts.body = body

    const shellHighlight = scene.add.ellipse(-3, -11, 13, 10, this.getLighterColor(shellColor, 40), 0.5)
    this.bodyContainer.add(shellHighlight)

    const shellSpecular = scene.add.circle(-4, -12, 5, this.getLighterColor(shellColor, 70), 0.6)
    this.bodyContainer.add(shellSpecular)

    // Shell pattern with multi-layer dots
    for (let i = 0; i < 4; i++) {
      const xPos = -9 + i * 6
      const dotShadow = scene.add.circle(xPos + 1, -7, 3, 0x000000, 0.3)
      this.bodyContainer.add(dotShadow)

      const dot = scene.add.circle(xPos, -8, 3, this.getDarkerColor(shellColor, 50))
      dot.setStrokeStyle(1, 0x000000, 0.6)
      this.bodyContainer.add(dot)

      const dotHighlight = scene.add.circle(xPos - 0.5, -8.5, 1.5, this.getDarkerColor(shellColor, 30), 0.6)
      this.bodyContainer.add(dotHighlight)
    }

    // EYE STALKS that sway
    const stalks: Phaser.GameObjects.Shape[] = []

    const stalkLShadow = scene.add.rectangle(-6, -16, 2, 6, 0x000000, 0.3)
    this.bodyContainer.add(stalkLShadow)

    const stalkL = scene.add.rectangle(-7, -16, 2, 6, shellColor)
    this.bodyContainer.add(stalkL)
    stalks.push(stalkL)

    const stalkRShadow = scene.add.rectangle(6, -16, 2, 6, 0x000000, 0.3)
    this.bodyContainer.add(stalkRShadow)

    const stalkR = scene.add.rectangle(7, -16, 2, 6, shellColor)
    this.bodyContainer.add(stalkR)
    stalks.push(stalkR)

    // EYES on stalks
    const eyeLShadow = scene.add.circle(-6, -20, 5, 0x000000, 0.3)
    this.bodyContainer.add(eyeLShadow)

    const eyeLBase = scene.add.circle(-7, -21, 5.5, this.getDarkerColor(shellColor, 30))
    this.bodyContainer.add(eyeLBase)

    const eyeL = scene.add.circle(-7, -21, 5, shellColor)
    eyeL.setStrokeStyle(2, 0x000000)
    this.bodyContainer.add(eyeL)

    const pupilL = scene.add.circle(-7, -21, 2.5, 0x000000)
    this.bodyContainer.add(pupilL)

    const eyeLHighlight = scene.add.circle(-8, -22, 1.5, 0xFFFFFF, 0.8)
    this.bodyContainer.add(eyeLHighlight)

    const eyeRShadow = scene.add.circle(6, -20, 5, 0x000000, 0.3)
    this.bodyContainer.add(eyeRShadow)

    const eyeRBase = scene.add.circle(7, -21, 5.5, this.getDarkerColor(shellColor, 30))
    this.bodyContainer.add(eyeRBase)

    const eyeR = scene.add.circle(7, -21, 5, shellColor)
    eyeR.setStrokeStyle(2, 0x000000)
    this.bodyContainer.add(eyeR)

    const pupilR = scene.add.circle(7, -21, 2.5, 0x000000)
    this.bodyContainer.add(pupilR)

    const eyeRHighlight = scene.add.circle(8, -22, 1.5, 0xFFFFFF, 0.8)
    this.bodyContainer.add(eyeRHighlight)

    this.characterParts.eyes = [eyeL, eyeR]

    // CLAWS - Segmented with 3 parts each and joints
    // Left Claw
    const clawLShadow = scene.add.ellipse(-18, -5, 12, 10, 0x000000, 0.3)
    clawLShadow.setRotation(-0.3)
    this.bodyContainer.add(clawLShadow)

    const clawLBase = scene.add.ellipse(-19, -6, 13, 11, this.getDarkerColor(clawColor, 40))
    clawLBase.setRotation(-0.3)
    this.bodyContainer.add(clawLBase)

    const clawL = scene.add.ellipse(-19, -6, 12, 10, clawColor)
    clawL.setStrokeStyle(3, 0x000000, 0.8)
    clawL.setRotation(-0.3)
    this.bodyContainer.add(clawL)

    const clawLHighlight = scene.add.ellipse(-21, -8, 6, 5, this.getLighterColor(clawColor, 50), 0.6)
    clawLHighlight.setRotation(-0.3)
    this.bodyContainer.add(clawLHighlight)

    const clawLSpecular = scene.add.circle(-22, -9, 3, 0xFFFFFF, 0.7)
    this.bodyContainer.add(clawLSpecular)

    // Left claw pinchers
    const pincherL1 = scene.add.triangle(-25, -8, 0, 0, 5, -3, 5, 3, this.getDarkerColor(clawColor, 30))
    pincherL1.setRotation(-0.3)
    this.bodyContainer.add(pincherL1)

    const pincherL2 = scene.add.triangle(-25, -4, 0, 0, 5, -2, 5, 2, this.getDarkerColor(clawColor, 30))
    pincherL2.setRotation(-0.3)
    this.bodyContainer.add(pincherL2)

    // Right Claw
    const clawRShadow = scene.add.ellipse(18, -5, 12, 10, 0x000000, 0.3)
    clawRShadow.setRotation(0.3)
    this.bodyContainer.add(clawRShadow)

    const clawRBase = scene.add.ellipse(19, -6, 13, 11, this.getDarkerColor(clawColor, 40))
    clawRBase.setRotation(0.3)
    this.bodyContainer.add(clawRBase)

    const clawR = scene.add.ellipse(19, -6, 12, 10, clawColor)
    clawR.setStrokeStyle(3, 0x000000, 0.8)
    clawR.setRotation(0.3)
    this.bodyContainer.add(clawR)

    const clawRHighlight = scene.add.ellipse(21, -8, 6, 5, this.getLighterColor(clawColor, 50), 0.6)
    clawRHighlight.setRotation(0.3)
    this.bodyContainer.add(clawRHighlight)

    const clawRSpecular = scene.add.circle(22, -9, 3, 0xFFFFFF, 0.7)
    this.bodyContainer.add(clawRSpecular)

    // Right claw pinchers
    const pincherR1 = scene.add.triangle(25, -8, 0, 0, -5, -3, -5, 3, this.getDarkerColor(clawColor, 30))
    pincherR1.setRotation(0.3)
    this.bodyContainer.add(pincherR1)

    const pincherR2 = scene.add.triangle(25, -4, 0, 0, -5, -2, -5, 2, this.getDarkerColor(clawColor, 30))
    pincherR2.setRotation(0.3)
    this.bodyContainer.add(pincherR2)

    this.characterParts.accessories = [clawL, clawR, stalkL, stalkR]

    // LEGS - 6 detailed crab legs with multiple segments (3 on each side)
    const legs: Phaser.GameObjects.Shape[] = []
    const legColor = this.getDarkerColor(shellColor, 50)
    const legDark = this.getDarkerColor(legColor, 30)
    const legTipColor = this.getDarkerColor(legColor, 40)

    for (let i = 0; i < 3; i++) {
      const yPos = -2 + i * 4
      const segmentRotation = -0.3 + i * 0.15

      // =========================
      // LEFT LEG - Multi-segmented crab leg
      // =========================

      // Coxa (hip joint) - attached to body
      const legLCoxaShadow = scene.add.circle(-10, yPos, 2.5, 0x000000, 0.3)
      this.bodyContainer.add(legLCoxaShadow)

      const legLCoxa = scene.add.circle(-11, yPos, 2.2, legColor)
      legLCoxa.setStrokeStyle(1.5, 0x000000, 0.8)
      this.bodyContainer.add(legLCoxa)

      const legLCoxaHighlight = scene.add.circle(-11.5, yPos - 0.5, 1, this.getLighterColor(legColor, 40), 0.6)
      this.bodyContainer.add(legLCoxaHighlight)

      // Upper leg segment (merus)
      const legLUpper1Shadow = scene.add.rectangle(-14, yPos + 1, 7, 3.5, 0x000000, 0.3)
      legLUpper1Shadow.setRotation(segmentRotation)
      this.bodyContainer.add(legLUpper1Shadow)

      const legLUpper1 = scene.add.rectangle(-15, yPos + 1, 6.5, 3, legColor)
      legLUpper1.setRotation(segmentRotation)
      legLUpper1.setStrokeStyle(1.5, legDark, 0.8)
      this.bodyContainer.add(legLUpper1)
      legs.push(legLUpper1)

      const legLUpper1Highlight = scene.add.rectangle(-15.5, yPos + 0.5, 2, 2.5, this.getLighterColor(legColor, 30), 0.6)
      legLUpper1Highlight.setRotation(segmentRotation)
      this.bodyContainer.add(legLUpper1Highlight)

      // Joint 1
      const legLJoint1Shadow = scene.add.circle(-18, yPos + 2, 2, 0x000000, 0.3)
      this.bodyContainer.add(legLJoint1Shadow)

      const legLJoint1 = scene.add.circle(-18.5, yPos + 2, 1.8, legDark)
      legLJoint1.setStrokeStyle(1, 0x000000, 0.8)
      this.bodyContainer.add(legLJoint1)

      // Middle leg segment (carpus)
      const legLMidShadow = scene.add.rectangle(-21, yPos + 3, 6, 2.5, 0x000000, 0.3)
      legLMidShadow.setRotation(segmentRotation + 0.2)
      this.bodyContainer.add(legLMidShadow)

      const legLMid = scene.add.rectangle(-21.5, yPos + 3, 5.5, 2.3, legDark)
      legLMid.setRotation(segmentRotation + 0.2)
      legLMid.setStrokeStyle(1.5, this.getDarkerColor(legDark, 30), 0.8)
      this.bodyContainer.add(legLMid)

      const legLMidHighlight = scene.add.rectangle(-22, yPos + 2.5, 1.5, 1.8, this.getLighterColor(legColor, 20), 0.6)
      legLMidHighlight.setRotation(segmentRotation + 0.2)
      this.bodyContainer.add(legLMidHighlight)

      // Joint 2
      const legLJoint2Shadow = scene.add.circle(-24, yPos + 4, 1.8, 0x000000, 0.3)
      this.bodyContainer.add(legLJoint2Shadow)

      const legLJoint2 = scene.add.circle(-24.5, yPos + 4, 1.5, legDark)
      legLJoint2.setStrokeStyle(1, 0x000000, 0.8)
      this.bodyContainer.add(legLJoint2)

      // Lower leg segment (propodus) with pointed tip
      const legLLowerShadow = scene.add.rectangle(-26, yPos + 5, 4, 2, 0x000000, 0.3)
      legLLowerShadow.setRotation(segmentRotation + 0.3)
      this.bodyContainer.add(legLLowerShadow)

      const legLLower = scene.add.rectangle(-26.5, yPos + 5, 3.5, 1.8, legTipColor)
      legLLower.setRotation(segmentRotation + 0.3)
      legLLower.setStrokeStyle(1, this.getDarkerColor(legTipColor, 30), 0.8)
      this.bodyContainer.add(legLLower)

      // Leg tip (dactyl) - pointed claw tip
      const legLTipShadow = scene.add.triangle(-28.5, yPos + 5.5, 0, 0, 2, -1, 2, 1, 0x000000, 0.4)
      legLTipShadow.setRotation(segmentRotation + 0.3)
      this.bodyContainer.add(legLTipShadow)

      const legLTip = scene.add.triangle(-29, yPos + 5.5, 0, 0, 2, -0.8, 2, 0.8, legTipColor)
      legLTip.setRotation(segmentRotation + 0.3)
      legLTip.setStrokeStyle(1, 0x000000, 0.9)
      this.bodyContainer.add(legLTip)

      // =========================
      // RIGHT LEG - Mirror of left
      // =========================

      // Coxa (hip joint)
      const legRCoxaShadow = scene.add.circle(10, yPos, 2.5, 0x000000, 0.3)
      this.bodyContainer.add(legRCoxaShadow)

      const legRCoxa = scene.add.circle(11, yPos, 2.2, legColor)
      legRCoxa.setStrokeStyle(1.5, 0x000000, 0.8)
      this.bodyContainer.add(legRCoxa)

      const legRCoxaHighlight = scene.add.circle(11.5, yPos - 0.5, 1, this.getLighterColor(legColor, 40), 0.6)
      this.bodyContainer.add(legRCoxaHighlight)

      // Upper leg segment
      const legRUpper1Shadow = scene.add.rectangle(14, yPos + 1, 7, 3.5, 0x000000, 0.3)
      legRUpper1Shadow.setRotation(-segmentRotation)
      this.bodyContainer.add(legRUpper1Shadow)

      const legRUpper1 = scene.add.rectangle(15, yPos + 1, 6.5, 3, legColor)
      legRUpper1.setRotation(-segmentRotation)
      legRUpper1.setStrokeStyle(1.5, legDark, 0.8)
      this.bodyContainer.add(legRUpper1)
      legs.push(legRUpper1)

      const legRUpper1Highlight = scene.add.rectangle(15.5, yPos + 0.5, 2, 2.5, this.getLighterColor(legColor, 30), 0.6)
      legRUpper1Highlight.setRotation(-segmentRotation)
      this.bodyContainer.add(legRUpper1Highlight)

      // Joint 1
      const legRJoint1Shadow = scene.add.circle(18, yPos + 2, 2, 0x000000, 0.3)
      this.bodyContainer.add(legRJoint1Shadow)

      const legRJoint1 = scene.add.circle(18.5, yPos + 2, 1.8, legDark)
      legRJoint1.setStrokeStyle(1, 0x000000, 0.8)
      this.bodyContainer.add(legRJoint1)

      // Middle leg segment
      const legRMidShadow = scene.add.rectangle(21, yPos + 3, 6, 2.5, 0x000000, 0.3)
      legRMidShadow.setRotation(-segmentRotation - 0.2)
      this.bodyContainer.add(legRMidShadow)

      const legRMid = scene.add.rectangle(21.5, yPos + 3, 5.5, 2.3, legDark)
      legRMid.setRotation(-segmentRotation - 0.2)
      legRMid.setStrokeStyle(1.5, this.getDarkerColor(legDark, 30), 0.8)
      this.bodyContainer.add(legRMid)

      const legRMidHighlight = scene.add.rectangle(22, yPos + 2.5, 1.5, 1.8, this.getLighterColor(legColor, 20), 0.6)
      legRMidHighlight.setRotation(-segmentRotation - 0.2)
      this.bodyContainer.add(legRMidHighlight)

      // Joint 2
      const legRJoint2Shadow = scene.add.circle(24, yPos + 4, 1.8, 0x000000, 0.3)
      this.bodyContainer.add(legRJoint2Shadow)

      const legRJoint2 = scene.add.circle(24.5, yPos + 4, 1.5, legDark)
      legRJoint2.setStrokeStyle(1, 0x000000, 0.8)
      this.bodyContainer.add(legRJoint2)

      // Lower leg segment
      const legRLowerShadow = scene.add.rectangle(26, yPos + 5, 4, 2, 0x000000, 0.3)
      legRLowerShadow.setRotation(-segmentRotation - 0.3)
      this.bodyContainer.add(legRLowerShadow)

      const legRLower = scene.add.rectangle(26.5, yPos + 5, 3.5, 1.8, legTipColor)
      legRLower.setRotation(-segmentRotation - 0.3)
      legRLower.setStrokeStyle(1, this.getDarkerColor(legTipColor, 30), 0.8)
      this.bodyContainer.add(legRLower)

      // Leg tip
      const legRTipShadow = scene.add.triangle(28.5, yPos + 5.5, 0, 0, -2, -1, -2, 1, 0x000000, 0.4)
      legRTipShadow.setRotation(-segmentRotation - 0.3)
      this.bodyContainer.add(legRTipShadow)

      const legRTip = scene.add.triangle(29, yPos + 5.5, 0, 0, -2, -0.8, -2, 0.8, legTipColor)
      legRTip.setRotation(-segmentRotation - 0.3)
      legRTip.setStrokeStyle(1, 0x000000, 0.9)
      this.bodyContainer.add(legRTip)
    }

    // IDLE ANIMATION - Sideways sway
    scene.tweens.add({
      targets: this.bodyContainer,
      x: this.bodyContainer.x + 2,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Eye stalks that sway
    scene.tweens.add({
      targets: stalks,
      rotation: 0.15,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Claw snap animation
    scene.tweens.add({
      targets: [pincherL1, pincherR1],
      y: '+=2',
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    this.addGlow(scene, 0x8D6E63, 30)
  }

  // 14. Competitive Clown - Clown with hat and nose
  private createClown(scene: Phaser.Scene) {
    // Create rotating body container
    this.bodyContainer = scene.add.container(0, 0)
    this.add(this.bodyContainer)

    const bodyColor = 0x5C6BC0
    const hatColor = 0xFF6E40
    const noseColor = 0xFF1744

    // BODY - Colorful costume (multiple bright colors)
    const bodyShadow = scene.add.circle(3, -5, 14, 0x000000, 0.3)
    this.bodyContainer.add(bodyShadow)

    const bodyBase = scene.add.circle(0, -6, 14.5, this.getDarkerColor(bodyColor, 40))
    this.bodyContainer.add(bodyBase)

    const body = scene.add.circle(0, -6, 14, bodyColor)
    body.setStrokeStyle(3, 0x000000, 0.8)
    this.bodyContainer.add(body)
    this.towerGraphic = body
    this.characterParts.body = body

    const bodyHighlight = scene.add.circle(-2, -9, 8, this.getLighterColor(bodyColor, 50), 0.5)
    this.bodyContainer.add(bodyHighlight)

    const bodySpecular = scene.add.circle(-3, -10, 4, 0xFFFFFF, 0.6)
    this.bodyContainer.add(bodySpecular)

    // Colorful stripes on costume
    const stripe1 = scene.add.arc(0, -9, 14, 0, Math.PI, false, 0xFF1EFF, 0.4)
    this.bodyContainer.add(stripe1)

    const stripe2 = scene.add.arc(0, -3, 14, 0, Math.PI, false, 0xFFFF00, 0.4)
    this.bodyContainer.add(stripe2)

    // HEAD
    const headShadow = scene.add.circle(2, -21, 12, 0x000000, 0.25)
    this.bodyContainer.add(headShadow)

    const headBase = scene.add.circle(0, -22, 12.5, this.getDarkerColor(0xFFCCBC, 30))
    this.bodyContainer.add(headBase)

    const head = scene.add.circle(0, -22, 12, 0xFFCCBC)
    head.setStrokeStyle(3, 0x000000, 0.8)
    this.bodyContainer.add(head)
    this.characterParts.head = head

    const headHighlight = scene.add.circle(-2, -25, 6, this.getLighterColor(0xFFCCBC, 30), 0.6)
    this.bodyContainer.add(headHighlight)

    // HAT - Tall hat with stripes
    const hatShadow = scene.add.triangle(1, -37, -10, 0, 10, 0, 0, -14, 0x000000, 0.3)
    this.bodyContainer.add(hatShadow)

    const hatBase = scene.add.triangle(0, -38, -10.5, 0, 10.5, 0, 0, -14.5, this.getDarkerColor(hatColor, 40))
    this.bodyContainer.add(hatBase)

    const hat = scene.add.triangle(0, -38, -10, 0, 10, 0, 0, -14, hatColor)
    hat.setStrokeStyle(3, 0x000000, 0.8)
    this.bodyContainer.add(hat)

    const hatHighlight = scene.add.triangle(-1, -39, -6, 0, 6, 0, 0, -10, this.getLighterColor(hatColor, 50), 0.6)
    this.bodyContainer.add(hatHighlight)

    // Hat stripes
    for (let i = 0; i < 3; i++) {
      const yPos = -32 - i * 3
      const stripe = scene.add.rectangle(0, yPos, 10 - i * 2, 1.5, 0xFFFF00, 0.7)
      this.bodyContainer.add(stripe)
    }

    // Pompom with layers
    const pompomShadow = scene.add.circle(1, -37, 5, 0x000000, 0.3)
    this.bodyContainer.add(pompomShadow)

    const pompomBase = scene.add.circle(0, -38, 5.5, this.getDarkerColor(0xFFFF00, 40))
    this.bodyContainer.add(pompomBase)

    const pompom = scene.add.circle(0, -38, 5, 0xFFFF00)
    pompom.setStrokeStyle(2, 0x000000, 0.8)
    this.bodyContainer.add(pompom)

    const pompomHighlight = scene.add.circle(-1, -39, 3, this.getLighterColor(0xFFFF00, 60), 0.7)
    this.bodyContainer.add(pompomHighlight)

    this.characterParts.accessories = [hat, pompom]

    // BIG RED NOSE - Shiny with highlight
    const noseShadow = scene.add.circle(1, -19, 4, 0x000000, 0.3)
    this.bodyContainer.add(noseShadow)

    const noseBase = scene.add.circle(0, -20, 4.5, this.getDarkerColor(noseColor, 40))
    this.bodyContainer.add(noseBase)

    const nose = scene.add.circle(0, -20, 4, noseColor)
    nose.setStrokeStyle(2, 0x000000, 0.8)
    this.bodyContainer.add(nose)

    const noseHighlight = scene.add.circle(-1, -21, 2, this.getLighterColor(noseColor, 60), 0.8)
    this.bodyContainer.add(noseHighlight)

    const noseSpecular = scene.add.circle(-1.5, -21.5, 1, 0xFFFFFF, 0.9)
    this.bodyContainer.add(noseSpecular)

    this.characterParts.accessories.push(nose)

    // EYES
    const eyeLBase = scene.add.circle(-5, -24, 3, 0x1A1A1A)
    this.bodyContainer.add(eyeLBase)

    const eyeL = scene.add.circle(-5, -24, 2.5, 0x000000)
    this.bodyContainer.add(eyeL)

    const eyeLHighlight = scene.add.circle(-4.5, -24.5, 1, 0xFFFFFF)
    this.bodyContainer.add(eyeLHighlight)

    const eyeRBase = scene.add.circle(5, -24, 3, 0x1A1A1A)
    this.bodyContainer.add(eyeRBase)

    const eyeR = scene.add.circle(5, -24, 2.5, 0x000000)
    this.bodyContainer.add(eyeR)

    const eyeRHighlight = scene.add.circle(5.5, -24.5, 1, 0xFFFFFF)
    this.bodyContainer.add(eyeRHighlight)

    this.characterParts.eyes = [eyeL, eyeR]

    // SMILE
    const mouthShadow = scene.add.arc(0, -16, 7, 0, 180, false, 0x000000, 0.2)
    mouthShadow.setStrokeStyle(3, 0x000000, 0.2)
    this.bodyContainer.add(mouthShadow)

    const mouth = scene.add.arc(0, -17, 7, 0, 180, false, noseColor)
    mouth.setStrokeStyle(3, noseColor)
    this.bodyContainer.add(mouth)

    // BOW TIE
    const bowShadow = scene.add.star(1, -12, 5, 5, 10, 0x000000, 0.3)
    this.bodyContainer.add(bowShadow)

    const bowBase = scene.add.star(0, -13, 5, 5.5, 10.5, this.getDarkerColor(0xFF1EFF, 40))
    this.bodyContainer.add(bowBase)

    const bow = scene.add.star(0, -13, 5, 5, 10, 0xFF1EFF)
    bow.setStrokeStyle(2, 0x000000, 0.8)
    this.bodyContainer.add(bow)

    const bowHighlight = scene.add.star(0, -13, 5, 3, 6, this.getLighterColor(0xFF1EFF, 60), 0.7)
    this.bodyContainer.add(bowHighlight)

    // =========================
    // ARMS & GLOVES - Colorful clown gloves with fingers
    // =========================
    const armColor = this.getDarkerColor(bodyColor, 20)
    const gloveColor = 0xFFFFFF
    const gloveDark = this.getDarkerColor(gloveColor, 40)

    // Left Arm
    const leftArmShadow = scene.add.ellipse(-12, -3, 6, 11, 0x000000, 0.3)
    leftArmShadow.setRotation(-0.3)
    this.bodyContainer.add(leftArmShadow)

    const leftArm = scene.add.ellipse(-13, -4, 5.5, 10, armColor)
    leftArm.setRotation(-0.3)
    leftArm.setStrokeStyle(2, this.getDarkerColor(armColor, 30), 0.8)
    this.bodyContainer.add(leftArm)

    const leftArmHighlight = scene.add.ellipse(-14, -6, 3, 6, this.getLighterColor(armColor, 40), 0.5)
    leftArmHighlight.setRotation(-0.3)
    this.bodyContainer.add(leftArmHighlight)

    // Left Glove
    const leftGloveShadow = scene.add.circle(-15, 3, 4, 0x000000, 0.3)
    this.bodyContainer.add(leftGloveShadow)

    const leftGlove = scene.add.circle(-16, 2, 3.5, gloveColor)
    leftGlove.setStrokeStyle(2, gloveDark, 0.8)
    this.bodyContainer.add(leftGlove)

    const leftGloveHighlight = scene.add.circle(-17, 1, 1.8, this.getLighterColor(gloveColor, 30), 0.6)
    this.bodyContainer.add(leftGloveHighlight)

    // Left Fingers (4 fingers)
    for (let i = 0; i < 4; i++) {
      const fingerAngle = -0.8 + i * 0.4
      const fingerLength = 3
      const fingerX = -18 - Math.sin(fingerAngle) * 1.5
      const fingerY = 2.5 + Math.cos(fingerAngle) * 1.5

      const fingerShadow = scene.add.rectangle(fingerX + 0.5, fingerY + 0.5, 1.2, fingerLength, 0x000000, 0.3)
      fingerShadow.setRotation(fingerAngle)
      this.bodyContainer.add(fingerShadow)

      const finger = scene.add.rectangle(fingerX, fingerY, 1.1, fingerLength, gloveColor)
      finger.setRotation(fingerAngle)
      finger.setStrokeStyle(1, gloveDark, 0.7)
      this.bodyContainer.add(finger)

      const fingerHighlight = scene.add.rectangle(fingerX - 0.3, fingerY, 0.5, fingerLength - 0.5, this.getLighterColor(gloveColor, 30), 0.6)
      fingerHighlight.setRotation(fingerAngle)
      this.bodyContainer.add(fingerHighlight)
    }

    // Right Arm
    const rightArmShadow = scene.add.ellipse(12, -3, 6, 11, 0x000000, 0.3)
    rightArmShadow.setRotation(0.3)
    this.bodyContainer.add(rightArmShadow)

    const rightArm = scene.add.ellipse(13, -4, 5.5, 10, armColor)
    rightArm.setRotation(0.3)
    rightArm.setStrokeStyle(2, this.getDarkerColor(armColor, 30), 0.8)
    this.bodyContainer.add(rightArm)

    const rightArmHighlight = scene.add.ellipse(14, -6, 3, 6, this.getLighterColor(armColor, 40), 0.5)
    rightArmHighlight.setRotation(0.3)
    this.bodyContainer.add(rightArmHighlight)

    // Right Glove
    const rightGloveShadow = scene.add.circle(15, 3, 4, 0x000000, 0.3)
    this.bodyContainer.add(rightGloveShadow)

    const rightGlove = scene.add.circle(16, 2, 3.5, gloveColor)
    rightGlove.setStrokeStyle(2, gloveDark, 0.8)
    this.bodyContainer.add(rightGlove)

    const rightGloveHighlight = scene.add.circle(17, 1, 1.8, this.getLighterColor(gloveColor, 30), 0.6)
    this.bodyContainer.add(rightGloveHighlight)

    // Right Fingers
    for (let i = 0; i < 4; i++) {
      const fingerAngle = 0.8 - i * 0.4
      const fingerLength = 3
      const fingerX = 18 + Math.sin(fingerAngle) * 1.5
      const fingerY = 2.5 + Math.cos(fingerAngle) * 1.5

      const fingerShadow = scene.add.rectangle(fingerX + 0.5, fingerY + 0.5, 1.2, fingerLength, 0x000000, 0.3)
      fingerShadow.setRotation(fingerAngle)
      this.bodyContainer.add(fingerShadow)

      const finger = scene.add.rectangle(fingerX, fingerY, 1.1, fingerLength, gloveColor)
      finger.setRotation(fingerAngle)
      finger.setStrokeStyle(1, gloveDark, 0.7)
      this.bodyContainer.add(finger)

      const fingerHighlight = scene.add.rectangle(fingerX + 0.3, fingerY, 0.5, fingerLength - 0.5, this.getLighterColor(gloveColor, 30), 0.6)
      fingerHighlight.setRotation(fingerAngle)
      this.bodyContainer.add(fingerHighlight)
    }

    // =========================
    // LEGS & OVERSIZED SHOES - Clown shoes
    // =========================
    const legColor = this.getDarkerColor(bodyColor, 30)
    const shoeColor = 0xFFEB3B

    // Left Leg
    const leftLegShadow = scene.add.rectangle(-5, 5, 5, 10, 0x000000, 0.3)
    this.bodyContainer.add(leftLegShadow)

    const leftLeg = scene.add.rectangle(-6, 4, 4.5, 9, legColor)
    leftLeg.setStrokeStyle(2, this.getDarkerColor(legColor, 30), 0.8)
    this.bodyContainer.add(leftLeg)

    const leftLegHighlight = scene.add.rectangle(-7, 2, 2, 5, this.getLighterColor(legColor, 40), 0.5)
    this.bodyContainer.add(leftLegHighlight)

    // Left Oversized Clown Shoe
    const leftShoeShadow = scene.add.ellipse(-5, 11, 10, 5, 0x000000, 0.4)
    this.bodyContainer.add(leftShoeShadow)

    const leftShoe = scene.add.ellipse(-6, 10, 9.5, 4.5, shoeColor)
    leftShoe.setStrokeStyle(2, this.getDarkerColor(shoeColor, 50), 0.8)
    this.bodyContainer.add(leftShoe)

    const leftShoeHighlight = scene.add.ellipse(-8, 9.5, 4, 2, this.getLighterColor(shoeColor, 50), 0.6)
    this.bodyContainer.add(leftShoeHighlight)

    const leftShoeSpecular = scene.add.circle(-9, 9, 1.5, 0xFFFFFF, 0.7)
    this.bodyContainer.add(leftShoeSpecular)

    // Shoe detail - stripes
    for (let i = 0; i < 2; i++) {
      const stripe = scene.add.rectangle(-6, 9 + i * 1.5, 8, 0.8, this.getDarkerColor(shoeColor, 40), 0.6)
      this.bodyContainer.add(stripe)
    }

    // Shoe toe cap
    const leftToeCap = scene.add.ellipse(-10, 10, 3, 2.5, this.getDarkerColor(shoeColor, 30))
    leftToeCap.setStrokeStyle(1, this.getDarkerColor(shoeColor, 60), 0.8)
    this.bodyContainer.add(leftToeCap)

    // Right Leg
    const rightLegShadow = scene.add.rectangle(5, 5, 5, 10, 0x000000, 0.3)
    this.bodyContainer.add(rightLegShadow)

    const rightLeg = scene.add.rectangle(6, 4, 4.5, 9, legColor)
    rightLeg.setStrokeStyle(2, this.getDarkerColor(legColor, 30), 0.8)
    this.bodyContainer.add(rightLeg)

    const rightLegHighlight = scene.add.rectangle(7, 2, 2, 5, this.getLighterColor(legColor, 40), 0.5)
    this.bodyContainer.add(rightLegHighlight)

    // Right Oversized Clown Shoe
    const rightShoeShadow = scene.add.ellipse(5, 11, 10, 5, 0x000000, 0.4)
    this.bodyContainer.add(rightShoeShadow)

    const rightShoe = scene.add.ellipse(6, 10, 9.5, 4.5, shoeColor)
    rightShoe.setStrokeStyle(2, this.getDarkerColor(shoeColor, 50), 0.8)
    this.bodyContainer.add(rightShoe)

    const rightShoeHighlight = scene.add.ellipse(8, 9.5, 4, 2, this.getLighterColor(shoeColor, 50), 0.6)
    this.bodyContainer.add(rightShoeHighlight)

    const rightShoeSpecular = scene.add.circle(9, 9, 1.5, 0xFFFFFF, 0.7)
    this.bodyContainer.add(rightShoeSpecular)

    // Shoe detail - stripes
    for (let i = 0; i < 2; i++) {
      const stripe = scene.add.rectangle(6, 9 + i * 1.5, 8, 0.8, this.getDarkerColor(shoeColor, 40), 0.6)
      this.bodyContainer.add(stripe)
    }

    // Shoe toe cap
    const rightToeCap = scene.add.ellipse(10, 10, 3, 2.5, this.getDarkerColor(shoeColor, 30))
    rightToeCap.setStrokeStyle(1, this.getDarkerColor(shoeColor, 60), 0.8)
    this.bodyContainer.add(rightToeCap)

    // IDLE ANIMATION - Bouncy
    scene.tweens.add({
      targets: this.bodyContainer,
      y: this.bodyContainer.y + 4,
      scaleY: 1.05,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Bounce.easeOut'
    })

    // Pompom bounce
    scene.tweens.add({
      targets: [pompom, pompomBase, pompomHighlight],
      y: '-=3',
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Bounce.easeOut'
    })

    // Nose wiggle
    scene.tweens.add({
      targets: [nose, noseBase, noseHighlight, noseSpecular],
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    this.addGlow(scene, 0xFF1EFF, 30)
  }

  // 15. Genuine Giraffe - Giraffe with long neck and spots
  private createGiraffe(scene: Phaser.Scene) {
    // Create rotating body container
    this.bodyContainer = scene.add.container(0, 0)
    this.add(this.bodyContainer)

    const mainColor = 0xFFEE58
    const spotColor = 0x8D6E63

    // BODY - Graceful, elegant proportions
    const bodyShadow = scene.add.ellipse(3, 3, 19, 21, 0x000000, 0.3)
    this.bodyContainer.add(bodyShadow)

    const bodyBase = scene.add.ellipse(0, 2, 19.5, 21.5, this.getDarkerColor(mainColor, 40))
    this.bodyContainer.add(bodyBase)

    const body = scene.add.ellipse(0, 2, 19, 21, mainColor)
    body.setStrokeStyle(3, 0x000000, 0.8)
    this.bodyContainer.add(body)
    this.towerGraphic = body
    this.characterParts.body = body

    const bodyHighlight = scene.add.ellipse(-2, -2, 10, 12, this.getLighterColor(mainColor, 50), 0.5)
    this.bodyContainer.add(bodyHighlight)

    const bodySpecular = scene.add.circle(-3, -3, 5, this.getLighterColor(mainColor, 70), 0.6)
    this.bodyContainer.add(bodySpecular)

    // LONG NECK - 5-6 stacked ellipses with gradients
    const neckSegments: Phaser.GameObjects.Shape[] = []
    for (let i = 0; i < 5; i++) {
      const yPos = -3 - i * 6
      const width = 10 - i * 0.3

      const segShadow = scene.add.ellipse(2, yPos + 1, width + 1, 6, 0x000000, 0.2)
      this.bodyContainer.add(segShadow)

      const segBase = scene.add.ellipse(0, yPos, width + 0.5, 6.5, this.getDarkerColor(mainColor, 30))
      this.bodyContainer.add(segBase)

      const seg = scene.add.ellipse(0, yPos, width, 6, mainColor)
      seg.setStrokeStyle(2, 0x000000, 0.7)
      this.bodyContainer.add(seg)
      neckSegments.push(seg)

      const segHighlight = scene.add.ellipse(-1, yPos - 1, width - 2, 4, this.getLighterColor(mainColor, 50), 0.5)
      this.bodyContainer.add(segHighlight)
    }

    // HEAD
    const headShadow = scene.add.ellipse(2, -33, 12, 14, 0x000000, 0.3)
    this.bodyContainer.add(headShadow)

    const headBase = scene.add.ellipse(0, -34, 12.5, 14.5, this.getDarkerColor(mainColor, 30))
    this.bodyContainer.add(headBase)

    const head = scene.add.ellipse(0, -34, 12, 14, mainColor)
    head.setStrokeStyle(3, 0x000000, 0.8)
    this.bodyContainer.add(head)
    this.characterParts.head = head

    const headHighlight = scene.add.ellipse(-2, -37, 6, 7, this.getLighterColor(mainColor, 50), 0.6)
    this.bodyContainer.add(headHighlight)

    const headSpecular = scene.add.circle(-3, -38, 3, this.getLighterColor(mainColor, 70), 0.7)
    this.bodyContainer.add(headSpecular)

    // SPOTS PATTERN - Random placement with multi-layers
    const spotArray: Phaser.GameObjects.Shape[] = []
    const spots = [
      { x: -3, y: -26 }, { x: 3, y: -22 }, { x: -4, y: -16 },
      { x: 4, y: -10 }, { x: -5, y: -2 }, { x: 5, y: 3 },
      { x: 2, y: -18 }, { x: -2, y: -12 }, { x: 3, y: 0 }
    ]
    spots.forEach(spot => {
      const spotShadow = scene.add.circle(spot.x + 1, spot.y + 1, 3, 0x000000, 0.3)
      this.bodyContainer?.add(spotShadow)

      const spotBase = scene.add.circle(spot.x, spot.y, 3.5, this.getDarkerColor(spotColor, 30))
      this.bodyContainer?.add(spotBase)

      const s = scene.add.circle(spot.x, spot.y, 3, spotColor)
      s.setStrokeStyle(1, 0x000000, 0.6)
      this.bodyContainer?.add(s)
      spotArray.push(s)

      const spotHighlight = scene.add.circle(spot.x - 0.5, spot.y - 0.5, 1.5, this.getLighterColor(spotColor, 40), 0.6)
      this.bodyContainer?.add(spotHighlight)
    })

    // EARS
    const earLShadow = scene.add.ellipse(-6, -38, 5, 7, 0x000000, 0.25)
    this.bodyContainer.add(earLShadow)

    const earLBase = scene.add.ellipse(-7, -39, 5.5, 7.5, this.getDarkerColor(0xFFD54F, 30))
    this.bodyContainer.add(earLBase)

    const earL = scene.add.ellipse(-7, -39, 5, 7, 0xFFD54F)
    earL.setStrokeStyle(2, 0x000000, 0.6)
    this.bodyContainer.add(earL)

    const earLHighlight = scene.add.ellipse(-7.5, -40, 3, 4, this.getLighterColor(0xFFD54F, 40), 0.6)
    this.bodyContainer.add(earLHighlight)

    const earRShadow = scene.add.ellipse(6, -38, 5, 7, 0x000000, 0.25)
    this.bodyContainer.add(earRShadow)

    const earRBase = scene.add.ellipse(7, -39, 5.5, 7.5, this.getDarkerColor(0xFFD54F, 30))
    this.bodyContainer.add(earRBase)

    const earR = scene.add.ellipse(7, -39, 5, 7, 0xFFD54F)
    earR.setStrokeStyle(2, 0x000000, 0.6)
    this.bodyContainer.add(earR)

    const earRHighlight = scene.add.ellipse(7.5, -40, 3, 4, this.getLighterColor(0xFFD54F, 40), 0.6)
    this.bodyContainer.add(earRHighlight)

    // EYES
    const eyeLBase = scene.add.circle(-4, -35, 3, 0x1A1A1A)
    this.bodyContainer.add(eyeLBase)

    const eyeL = scene.add.circle(-4, -35, 2.5, 0x000000)
    this.bodyContainer.add(eyeL)

    const eyeLHighlight = scene.add.circle(-3.5, -35.5, 1, 0xFFFFFF)
    this.bodyContainer.add(eyeLHighlight)

    const eyeRBase = scene.add.circle(4, -35, 3, 0x1A1A1A)
    this.bodyContainer.add(eyeRBase)

    const eyeR = scene.add.circle(4, -35, 2.5, 0x000000)
    this.bodyContainer.add(eyeR)

    const eyeRHighlight = scene.add.circle(4.5, -35.5, 1, 0xFFFFFF)
    this.bodyContainer.add(eyeRHighlight)

    this.characterParts.eyes = [eyeL, eyeR]

    // OSSICONES (small horns) with texture
    const ossLShadow = scene.add.rectangle(-4, -45, 3, 8, 0x000000, 0.3)
    this.bodyContainer.add(ossLShadow)

    const ossLBase = scene.add.rectangle(-5, -46, 3.5, 8.5, this.getDarkerColor(spotColor, 30))
    this.bodyContainer.add(ossLBase)

    const ossL = scene.add.rectangle(-5, -46, 3, 8, spotColor)
    ossL.setStrokeStyle(2, 0x000000, 0.6)
    this.bodyContainer.add(ossL)

    const ossLHighlight = scene.add.rectangle(-5.5, -46, 1.5, 8, this.getLighterColor(spotColor, 40), 0.6)
    this.bodyContainer.add(ossLHighlight)

    // Ossicone tip
    const ossLTip = scene.add.circle(-5, -50, 2, this.getDarkerColor(spotColor, 20))
    this.bodyContainer.add(ossLTip)

    const ossRShadow = scene.add.rectangle(4, -45, 3, 8, 0x000000, 0.3)
    this.bodyContainer.add(ossRShadow)

    const ossRBase = scene.add.rectangle(5, -46, 3.5, 8.5, this.getDarkerColor(spotColor, 30))
    this.bodyContainer.add(ossRBase)

    const ossR = scene.add.rectangle(5, -46, 3, 8, spotColor)
    ossR.setStrokeStyle(2, 0x000000, 0.6)
    this.bodyContainer.add(ossR)

    const ossRHighlight = scene.add.rectangle(5.5, -46, 1.5, 8, this.getLighterColor(spotColor, 40), 0.6)
    this.bodyContainer.add(ossRHighlight)

    const ossRTip = scene.add.circle(5, -50, 2, this.getDarkerColor(spotColor, 20))
    this.bodyContainer.add(ossRTip)

    this.characterParts.accessories = [...spotArray, ossL, ossR]

    // IDLE ANIMATION - Gentle sway
    scene.tweens.add({
      targets: this.bodyContainer,
      y: this.bodyContainer.y + 2,
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Neck sway
    scene.tweens.add({
      targets: neckSegments,
      x: '+=1.5',
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 100
    })

    // Ossicone slight movement
    scene.tweens.add({
      targets: [ossL, ossR, ossLBase, ossRBase, ossLTip, ossRTip],
      y: '-=0.5',
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // =========================
    // LEGS & HOOVES - Long elegant giraffe legs
    // =========================
    const legColor = this.getDarkerColor(mainColor, 20)
    const legDark = this.getDarkerColor(legColor, 30)
    const hoofColor = 0x1A1A1A

    // Back Left Leg - Long and slender
    const backLeftUpperShadow = scene.add.ellipse(-7, 7, 5, 16, 0x000000, 0.3)
    this.bodyContainer.add(backLeftUpperShadow)

    const backLeftUpper = scene.add.ellipse(-8, 6, 4.5, 15, legColor)
    backLeftUpper.setStrokeStyle(2, legDark, 0.8)
    this.bodyContainer.add(backLeftUpper)

    const backLeftUpperHighlight = scene.add.ellipse(-9, 3, 2, 10, this.getLighterColor(legColor, 40), 0.5)
    this.bodyContainer.add(backLeftUpperHighlight)

    // Leg spots
    const backLeftSpot1 = scene.add.circle(-8, 5, 1.5, spotColor, 0.6)
    this.bodyContainer.add(backLeftSpot1)

    const backLeftSpot2 = scene.add.circle(-8, 10, 1.5, spotColor, 0.6)
    this.bodyContainer.add(backLeftSpot2)

    // Back Left Lower Leg
    const backLeftLowerShadow = scene.add.ellipse(-7, 17, 4.5, 10, 0x000000, 0.3)
    this.bodyContainer.add(backLeftLowerShadow)

    const backLeftLower = scene.add.ellipse(-8, 16, 4, 9, legDark)
    backLeftLower.setStrokeStyle(2, this.getDarkerColor(legDark, 30), 0.8)
    this.bodyContainer.add(backLeftLower)

    // Back Left Hoof
    const backLeftHoofShadow = scene.add.ellipse(-7, 23, 5, 3, 0x000000, 0.4)
    this.bodyContainer.add(backLeftHoofShadow)

    const backLeftHoof = scene.add.ellipse(-8, 22, 4.5, 2.8, hoofColor)
    backLeftHoof.setStrokeStyle(2, 0x000000, 0.9)
    this.bodyContainer.add(backLeftHoof)

    const backLeftHoofHighlight = scene.add.ellipse(-9, 21.5, 2, 1.5, 0x333333, 0.6)
    this.bodyContainer.add(backLeftHoofHighlight)

    // Hoof split
    const backLeftHoofSplit = scene.add.rectangle(-8, 22.5, 0.6, 2, 0x000000, 0.8)
    this.bodyContainer.add(backLeftHoofSplit)

    // Back Right Leg
    const backRightUpperShadow = scene.add.ellipse(7, 7, 5, 16, 0x000000, 0.3)
    this.bodyContainer.add(backRightUpperShadow)

    const backRightUpper = scene.add.ellipse(8, 6, 4.5, 15, legColor)
    backRightUpper.setStrokeStyle(2, legDark, 0.8)
    this.bodyContainer.add(backRightUpper)

    const backRightUpperHighlight = scene.add.ellipse(9, 3, 2, 10, this.getLighterColor(legColor, 40), 0.5)
    this.bodyContainer.add(backRightUpperHighlight)

    // Leg spots
    const backRightSpot1 = scene.add.circle(8, 5, 1.5, spotColor, 0.6)
    this.bodyContainer.add(backRightSpot1)

    const backRightSpot2 = scene.add.circle(8, 10, 1.5, spotColor, 0.6)
    this.bodyContainer.add(backRightSpot2)

    // Back Right Lower Leg
    const backRightLowerShadow = scene.add.ellipse(7, 17, 4.5, 10, 0x000000, 0.3)
    this.bodyContainer.add(backRightLowerShadow)

    const backRightLower = scene.add.ellipse(8, 16, 4, 9, legDark)
    backRightLower.setStrokeStyle(2, this.getDarkerColor(legDark, 30), 0.8)
    this.bodyContainer.add(backRightLower)

    // Back Right Hoof
    const backRightHoofShadow = scene.add.ellipse(7, 23, 5, 3, 0x000000, 0.4)
    this.bodyContainer.add(backRightHoofShadow)

    const backRightHoof = scene.add.ellipse(8, 22, 4.5, 2.8, hoofColor)
    backRightHoof.setStrokeStyle(2, 0x000000, 0.9)
    this.bodyContainer.add(backRightHoof)

    const backRightHoofHighlight = scene.add.ellipse(9, 21.5, 2, 1.5, 0x333333, 0.6)
    this.bodyContainer.add(backRightHoofHighlight)

    // Hoof split
    const backRightHoofSplit = scene.add.rectangle(8, 22.5, 0.6, 2, 0x000000, 0.8)
    this.bodyContainer.add(backRightHoofSplit)

    // Front Left Leg
    const frontLeftUpperShadow = scene.add.ellipse(-6, 5, 5, 17, 0x000000, 0.3)
    this.bodyContainer.add(frontLeftUpperShadow)

    const frontLeftUpper = scene.add.ellipse(-7, 4, 4.5, 16, legColor)
    frontLeftUpper.setStrokeStyle(2, legDark, 0.8)
    this.bodyContainer.add(frontLeftUpper)

    const frontLeftUpperHighlight = scene.add.ellipse(-8, 1, 2, 11, this.getLighterColor(legColor, 40), 0.5)
    this.bodyContainer.add(frontLeftUpperHighlight)

    // Leg spots
    const frontLeftSpot1 = scene.add.circle(-7, 3, 1.5, spotColor, 0.6)
    this.bodyContainer.add(frontLeftSpot1)

    const frontLeftSpot2 = scene.add.circle(-7, 9, 1.5, spotColor, 0.6)
    this.bodyContainer.add(frontLeftSpot2)

    // Front Left Lower Leg
    const frontLeftLowerShadow = scene.add.ellipse(-6, 16, 4.5, 9, 0x000000, 0.3)
    this.bodyContainer.add(frontLeftLowerShadow)

    const frontLeftLower = scene.add.ellipse(-7, 15, 4, 8, legDark)
    frontLeftLower.setStrokeStyle(2, this.getDarkerColor(legDark, 30), 0.8)
    this.bodyContainer.add(frontLeftLower)

    // Front Left Hoof
    const frontLeftHoofShadow = scene.add.ellipse(-6, 22, 5, 3, 0x000000, 0.4)
    this.bodyContainer.add(frontLeftHoofShadow)

    const frontLeftHoof = scene.add.ellipse(-7, 21, 4.5, 2.8, hoofColor)
    frontLeftHoof.setStrokeStyle(2, 0x000000, 0.9)
    this.bodyContainer.add(frontLeftHoof)

    const frontLeftHoofHighlight = scene.add.ellipse(-8, 20.5, 2, 1.5, 0x333333, 0.6)
    this.bodyContainer.add(frontLeftHoofHighlight)

    // Hoof split
    const frontLeftHoofSplit = scene.add.rectangle(-7, 21.5, 0.6, 2, 0x000000, 0.8)
    this.bodyContainer.add(frontLeftHoofSplit)

    // Front Right Leg
    const frontRightUpperShadow = scene.add.ellipse(6, 5, 5, 17, 0x000000, 0.3)
    this.bodyContainer.add(frontRightUpperShadow)

    const frontRightUpper = scene.add.ellipse(7, 4, 4.5, 16, legColor)
    frontRightUpper.setStrokeStyle(2, legDark, 0.8)
    this.bodyContainer.add(frontRightUpper)

    const frontRightUpperHighlight = scene.add.ellipse(8, 1, 2, 11, this.getLighterColor(legColor, 40), 0.5)
    this.bodyContainer.add(frontRightUpperHighlight)

    // Leg spots
    const frontRightSpot1 = scene.add.circle(7, 3, 1.5, spotColor, 0.6)
    this.bodyContainer.add(frontRightSpot1)

    const frontRightSpot2 = scene.add.circle(7, 9, 1.5, spotColor, 0.6)
    this.bodyContainer.add(frontRightSpot2)

    // Front Right Lower Leg
    const frontRightLowerShadow = scene.add.ellipse(6, 16, 4.5, 9, 0x000000, 0.3)
    this.bodyContainer.add(frontRightLowerShadow)

    const frontRightLower = scene.add.ellipse(7, 15, 4, 8, legDark)
    frontRightLower.setStrokeStyle(2, this.getDarkerColor(legDark, 30), 0.8)
    this.bodyContainer.add(frontRightLower)

    // Front Right Hoof
    const frontRightHoofShadow = scene.add.ellipse(6, 22, 5, 3, 0x000000, 0.4)
    this.bodyContainer.add(frontRightHoofShadow)

    const frontRightHoof = scene.add.ellipse(7, 21, 4.5, 2.8, hoofColor)
    frontRightHoof.setStrokeStyle(2, 0x000000, 0.9)
    this.bodyContainer.add(frontRightHoof)

    const frontRightHoofHighlight = scene.add.ellipse(8, 20.5, 2, 1.5, 0x333333, 0.6)
    this.bodyContainer.add(frontRightHoofHighlight)

    // Hoof split
    const frontRightHoofSplit = scene.add.rectangle(7, 21.5, 0.6, 2, 0x000000, 0.8)
    this.bodyContainer.add(frontRightHoofSplit)

    this.addGlow(scene, 0xFFEE58, 32)
  }

  // 15. Cynical Cat - Cat with sprite sheet
  private createCat(scene: Phaser.Scene) {
    // Use sprite sheet instead of procedural graphics
    const mainColor = 0xFF8800 // Orange

    // Create body container for consistency with other towers
    this.bodyContainer = scene.add.container(0, 0)
    this.add(this.bodyContainer)

    // Create sprite (frames are 540x450, so scale down)
    this.catSprite = scene.add.sprite(0, -5, 'cynical-cat', 0)
    this.catSprite.setScale(0.23) // Scale down from 450px height to ~103px - larger for better visibility
    this.catSprite.setOrigin(0.5, 0.5) // Center origin
    // Set texture to use nearest-neighbor filtering to prevent frame bleeding
    this.catSprite.setTexture('cynical-cat', 0)
    this.catSprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST)
    this.bodyContainer.add(this.catSprite)

    // Set towerGraphic for interaction
    this.towerGraphic = this.catSprite as any

    // Make the sprite interactive
    this.catSprite.setInteractive()

    // Play idle animation if it exists
    if (scene.anims.exists('cat-idle-front')) {
      this.catSprite.play('cat-idle-front')
    }

    this.addGlow(scene, mainColor, 28)
  }

  // 16. Helpful Hippo - Hippo with big mouth
  private createHippo(scene: Phaser.Scene) {
    // Create rotating body container
    this.bodyContainer = scene.add.container(0, 0)
    this.add(this.bodyContainer)

    const mainColor = 0xEF5350
    const snoutColor = 0xE53935

    // BODY - Large round body (emphasize size)
    const bodyShadow = scene.add.ellipse(3, 0, 28, 24, 0x000000, 0.3)
    this.bodyContainer.add(bodyShadow)

    const bodyBase = scene.add.ellipse(0, -1, 28.5, 24.5, this.getDarkerColor(mainColor, 40))
    this.bodyContainer.add(bodyBase)

    const body = scene.add.ellipse(0, -2, 28, 24, mainColor)
    body.setStrokeStyle(3, 0x000000, 0.8)
    this.bodyContainer.add(body)
    this.towerGraphic = body
    this.characterParts.body = body

    const bodyHighlight1 = scene.add.ellipse(-3, -6, 15, 13, this.getLighterColor(mainColor, 40), 0.5)
    this.bodyContainer.add(bodyHighlight1)

    const bodyHighlight2 = scene.add.ellipse(-4, -7, 10, 9, this.getLighterColor(mainColor, 60), 0.6)
    this.bodyContainer.add(bodyHighlight2)

    const bodySpecular = scene.add.circle(-5, -8, 6, 0xFFFFFF, 0.5)
    this.bodyContainer.add(bodySpecular)

    // HEAD - Large
    const headShadow = scene.add.ellipse(3, -19, 24, 19, 0x000000, 0.3)
    this.bodyContainer.add(headShadow)

    const headBase = scene.add.ellipse(0, -20, 24.5, 19.5, this.getDarkerColor(mainColor, 30))
    this.bodyContainer.add(headBase)

    const head = scene.add.ellipse(0, -20, 24, 19, mainColor)
    head.setStrokeStyle(3, 0x000000, 0.8)
    this.bodyContainer.add(head)
    this.characterParts.head = head

    const headHighlight1 = scene.add.ellipse(-3, -23, 13, 10, this.getLighterColor(mainColor, 40), 0.5)
    this.bodyContainer.add(headHighlight1)

    const headHighlight2 = scene.add.ellipse(-4, -24, 9, 7, this.getLighterColor(mainColor, 60), 0.6)
    this.bodyContainer.add(headHighlight2)

    const headSpecular = scene.add.circle(-5, -25, 5, 0xFFFFFF, 0.5)
    this.bodyContainer.add(headSpecular)

    // BIG MOUTH/SNOUT - Gradient shading
    const snoutShadow = scene.add.ellipse(2, -12, 19, 12, 0x000000, 0.3)
    this.bodyContainer.add(snoutShadow)

    const snoutBase = scene.add.ellipse(0, -13, 19.5, 12.5, this.getDarkerColor(snoutColor, 40))
    this.bodyContainer.add(snoutBase)

    const snout = scene.add.ellipse(0, -13, 19, 12, snoutColor)
    snout.setStrokeStyle(2, 0x000000, 0.6)
    this.bodyContainer.add(snout)

    const snoutHighlight1 = scene.add.ellipse(-2, -15, 10, 7, this.getLighterColor(snoutColor, 30), 0.5)
    this.bodyContainer.add(snoutHighlight1)

    const snoutHighlight2 = scene.add.ellipse(-3, -16, 6, 4, this.getLighterColor(snoutColor, 50), 0.6)
    this.bodyContainer.add(snoutHighlight2)

    // ROUND NOSTRILS
    const nostrilLShadow = scene.add.circle(-4, -10, 2.5, 0x000000, 0.5)
    this.bodyContainer.add(nostrilLShadow)

    const nostrilL = scene.add.circle(-5, -11, 2.5, 0x000000)
    this.bodyContainer.add(nostrilL)

    const nostrilLHighlight = scene.add.circle(-4.5, -11.5, 1, 0x333333, 0.6)
    this.bodyContainer.add(nostrilLHighlight)

    const nostrilRShadow = scene.add.circle(4, -10, 2.5, 0x000000, 0.5)
    this.bodyContainer.add(nostrilRShadow)

    const nostrilR = scene.add.circle(5, -11, 2.5, 0x000000)
    this.bodyContainer.add(nostrilR)

    const nostrilRHighlight = scene.add.circle(5.5, -11.5, 1, 0x333333, 0.6)
    this.bodyContainer.add(nostrilRHighlight)

    this.characterParts.accessories = [snout, nostrilL, nostrilR]

    // EYES - On top of head
    const eyeLShadow = scene.add.circle(-6, -21, 4, 0x000000, 0.3)
    this.bodyContainer.add(eyeLShadow)

    const eyeLBase = scene.add.circle(-7, -22, 4.5, 0xEEEEEE)
    this.bodyContainer.add(eyeLBase)

    const eyeL = scene.add.circle(-7, -22, 4, 0xFFFFFF)
    eyeL.setStrokeStyle(2, 0x000000)
    this.bodyContainer.add(eyeL)

    const pupilLBase = scene.add.circle(-7, -22, 3, 0x1A1A1A)
    this.bodyContainer.add(pupilLBase)

    const pupilL = scene.add.circle(-7, -22, 2.5, 0x000000)
    this.bodyContainer.add(pupilL)

    const eyeLHighlight = scene.add.circle(-6, -23, 1.5, 0xFFFFFF)
    this.bodyContainer.add(eyeLHighlight)

    const eyeRShadow = scene.add.circle(6, -21, 4, 0x000000, 0.3)
    this.bodyContainer.add(eyeRShadow)

    const eyeRBase = scene.add.circle(7, -22, 4.5, 0xEEEEEE)
    this.bodyContainer.add(eyeRBase)

    const eyeR = scene.add.circle(7, -22, 4, 0xFFFFFF)
    eyeR.setStrokeStyle(2, 0x000000)
    this.bodyContainer.add(eyeR)

    const pupilRBase = scene.add.circle(7, -22, 3, 0x1A1A1A)
    this.bodyContainer.add(pupilRBase)

    const pupilR = scene.add.circle(7, -22, 2.5, 0x000000)
    this.bodyContainer.add(pupilR)

    const eyeRHighlight = scene.add.circle(8, -23, 1.5, 0xFFFFFF)
    this.bodyContainer.add(eyeRHighlight)

    this.characterParts.eyes = [eyeL, eyeR]

    // SMALL EARS
    const earLShadow = scene.add.circle(-13, -24, 5, 0x000000, 0.3)
    this.bodyContainer.add(earLShadow)

    const earLBase = scene.add.circle(-14, -25, 5.5, this.getDarkerColor(snoutColor, 30))
    this.bodyContainer.add(earLBase)

    const earL = scene.add.circle(-14, -25, 5, snoutColor)
    earL.setStrokeStyle(2, 0x000000, 0.6)
    this.bodyContainer.add(earL)

    const earLHighlight = scene.add.circle(-15, -26, 3, this.getLighterColor(snoutColor, 40), 0.6)
    this.bodyContainer.add(earLHighlight)

    const earRShadow = scene.add.circle(13, -24, 5, 0x000000, 0.3)
    this.bodyContainer.add(earRShadow)

    const earRBase = scene.add.circle(14, -25, 5.5, this.getDarkerColor(snoutColor, 30))
    this.bodyContainer.add(earRBase)

    const earR = scene.add.circle(14, -25, 5, snoutColor)
    earR.setStrokeStyle(2, 0x000000, 0.6)
    this.bodyContainer.add(earR)

    const earRHighlight = scene.add.circle(15, -26, 3, this.getLighterColor(snoutColor, 40), 0.6)
    this.bodyContainer.add(earRHighlight)

    this.characterParts.accessories.push(earL, earR)

    // IDLE ANIMATION - Heavy, slow breathing
    scene.tweens.add({
      targets: this.bodyContainer,
      y: this.bodyContainer.y + 1.5,
      scaleY: 1.02,
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Nostril flare (breathing)
    scene.tweens.add({
      targets: [nostrilL, nostrilR, nostrilLShadow, nostrilRShadow],
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Ear wiggle
    scene.tweens.add({
      targets: [earL, earLBase, earLHighlight],
      rotation: 0.1,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    scene.tweens.add({
      targets: [earR, earRBase, earRHighlight],
      rotation: -0.1,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // =========================
    // LEGS & FEET - Thick hippo legs with toes
    // =========================
    const legColor = this.getDarkerColor(mainColor, 25)
    const legDark = this.getDarkerColor(legColor, 30)
    const toeColor = this.getDarkerColor(legColor, 40)

    // Back Left Leg - Short and thick
    const backLeftUpperShadow = scene.add.ellipse(-10, 5, 10, 13, 0x000000, 0.3)
    this.bodyContainer.add(backLeftUpperShadow)

    const backLeftUpper = scene.add.ellipse(-11, 4, 9.5, 12, legColor)
    backLeftUpper.setStrokeStyle(2, legDark, 0.8)
    this.bodyContainer.add(backLeftUpper)

    const backLeftUpperHighlight = scene.add.ellipse(-12, 2, 5, 8, this.getLighterColor(legColor, 40), 0.5)
    this.bodyContainer.add(backLeftUpperHighlight)

    // Back Left Lower Leg
    const backLeftLowerShadow = scene.add.ellipse(-10, 13, 9, 9, 0x000000, 0.3)
    this.bodyContainer.add(backLeftLowerShadow)

    const backLeftLower = scene.add.ellipse(-11, 12, 8.5, 8, legDark)
    backLeftLower.setStrokeStyle(2, this.getDarkerColor(legDark, 30), 0.8)
    this.bodyContainer.add(backLeftLower)

    // Back Left Foot with toes
    const backLeftFootShadow = scene.add.ellipse(-10, 18, 10, 4.5, 0x000000, 0.4)
    this.bodyContainer.add(backLeftFootShadow)

    const backLeftFoot = scene.add.ellipse(-11, 17, 9.5, 4, this.getDarkerColor(legDark, 20))
    backLeftFoot.setStrokeStyle(2, this.getDarkerColor(legDark, 40), 0.8)
    this.bodyContainer.add(backLeftFoot)

    const backLeftFootHighlight = scene.add.ellipse(-12, 16.5, 4, 2, this.getLighterColor(legColor, 30), 0.5)
    this.bodyContainer.add(backLeftFootHighlight)

    // Back Left Toes (4 stubby toes)
    for (let i = 0; i < 4; i++) {
      const toeX = -14 + i * 2
      const toeY = 18.5

      const toeShadow = scene.add.ellipse(toeX + 0.5, toeY + 0.5, 1.5, 2, 0x000000, 0.4)
      this.bodyContainer.add(toeShadow)

      const toe = scene.add.ellipse(toeX, toeY, 1.3, 1.8, toeColor)
      toe.setStrokeStyle(1, this.getDarkerColor(toeColor, 30), 0.8)
      this.bodyContainer.add(toe)

      const toeHighlight = scene.add.circle(toeX - 0.3, toeY - 0.3, 0.5, this.getLighterColor(toeColor, 40), 0.6)
      this.bodyContainer.add(toeHighlight)
    }

    // Back Right Leg
    const backRightUpperShadow = scene.add.ellipse(10, 5, 10, 13, 0x000000, 0.3)
    this.bodyContainer.add(backRightUpperShadow)

    const backRightUpper = scene.add.ellipse(11, 4, 9.5, 12, legColor)
    backRightUpper.setStrokeStyle(2, legDark, 0.8)
    this.bodyContainer.add(backRightUpper)

    const backRightUpperHighlight = scene.add.ellipse(12, 2, 5, 8, this.getLighterColor(legColor, 40), 0.5)
    this.bodyContainer.add(backRightUpperHighlight)

    // Back Right Lower Leg
    const backRightLowerShadow = scene.add.ellipse(10, 13, 9, 9, 0x000000, 0.3)
    this.bodyContainer.add(backRightLowerShadow)

    const backRightLower = scene.add.ellipse(11, 12, 8.5, 8, legDark)
    backRightLower.setStrokeStyle(2, this.getDarkerColor(legDark, 30), 0.8)
    this.bodyContainer.add(backRightLower)

    // Back Right Foot with toes
    const backRightFootShadow = scene.add.ellipse(10, 18, 10, 4.5, 0x000000, 0.4)
    this.bodyContainer.add(backRightFootShadow)

    const backRightFoot = scene.add.ellipse(11, 17, 9.5, 4, this.getDarkerColor(legDark, 20))
    backRightFoot.setStrokeStyle(2, this.getDarkerColor(legDark, 40), 0.8)
    this.bodyContainer.add(backRightFoot)

    const backRightFootHighlight = scene.add.ellipse(12, 16.5, 4, 2, this.getLighterColor(legColor, 30), 0.5)
    this.bodyContainer.add(backRightFootHighlight)

    // Back Right Toes
    for (let i = 0; i < 4; i++) {
      const toeX = 8 + i * 2
      const toeY = 18.5

      const toeShadow = scene.add.ellipse(toeX + 0.5, toeY + 0.5, 1.5, 2, 0x000000, 0.4)
      this.bodyContainer.add(toeShadow)

      const toe = scene.add.ellipse(toeX, toeY, 1.3, 1.8, toeColor)
      toe.setStrokeStyle(1, this.getDarkerColor(toeColor, 30), 0.8)
      this.bodyContainer.add(toe)

      const toeHighlight = scene.add.circle(toeX - 0.3, toeY - 0.3, 0.5, this.getLighterColor(toeColor, 40), 0.6)
      this.bodyContainer.add(toeHighlight)
    }

    // Front Left Leg
    const frontLeftUpperShadow = scene.add.ellipse(-9, 3, 10, 14, 0x000000, 0.3)
    this.bodyContainer.add(frontLeftUpperShadow)

    const frontLeftUpper = scene.add.ellipse(-10, 2, 9.5, 13, legColor)
    frontLeftUpper.setStrokeStyle(2, legDark, 0.8)
    this.bodyContainer.add(frontLeftUpper)

    const frontLeftUpperHighlight = scene.add.ellipse(-11, 0, 5, 9, this.getLighterColor(legColor, 40), 0.5)
    this.bodyContainer.add(frontLeftUpperHighlight)

    // Front Left Lower Leg
    const frontLeftLowerShadow = scene.add.ellipse(-9, 12, 9, 8, 0x000000, 0.3)
    this.bodyContainer.add(frontLeftLowerShadow)

    const frontLeftLower = scene.add.ellipse(-10, 11, 8.5, 7, legDark)
    frontLeftLower.setStrokeStyle(2, this.getDarkerColor(legDark, 30), 0.8)
    this.bodyContainer.add(frontLeftLower)

    // Front Left Foot with toes
    const frontLeftFootShadow = scene.add.ellipse(-9, 17, 10, 4.5, 0x000000, 0.4)
    this.bodyContainer.add(frontLeftFootShadow)

    const frontLeftFoot = scene.add.ellipse(-10, 16, 9.5, 4, this.getDarkerColor(legDark, 20))
    frontLeftFoot.setStrokeStyle(2, this.getDarkerColor(legDark, 40), 0.8)
    this.bodyContainer.add(frontLeftFoot)

    const frontLeftFootHighlight = scene.add.ellipse(-11, 15.5, 4, 2, this.getLighterColor(legColor, 30), 0.5)
    this.bodyContainer.add(frontLeftFootHighlight)

    // Front Left Toes
    for (let i = 0; i < 4; i++) {
      const toeX = -13 + i * 2
      const toeY = 17.5

      const toeShadow = scene.add.ellipse(toeX + 0.5, toeY + 0.5, 1.5, 2, 0x000000, 0.4)
      this.bodyContainer.add(toeShadow)

      const toe = scene.add.ellipse(toeX, toeY, 1.3, 1.8, toeColor)
      toe.setStrokeStyle(1, this.getDarkerColor(toeColor, 30), 0.8)
      this.bodyContainer.add(toe)

      const toeHighlight = scene.add.circle(toeX - 0.3, toeY - 0.3, 0.5, this.getLighterColor(toeColor, 40), 0.6)
      this.bodyContainer.add(toeHighlight)
    }

    // Front Right Leg
    const frontRightUpperShadow = scene.add.ellipse(9, 3, 10, 14, 0x000000, 0.3)
    this.bodyContainer.add(frontRightUpperShadow)

    const frontRightUpper = scene.add.ellipse(10, 2, 9.5, 13, legColor)
    frontRightUpper.setStrokeStyle(2, legDark, 0.8)
    this.bodyContainer.add(frontRightUpper)

    const frontRightUpperHighlight = scene.add.ellipse(11, 0, 5, 9, this.getLighterColor(legColor, 40), 0.5)
    this.bodyContainer.add(frontRightUpperHighlight)

    // Front Right Lower Leg
    const frontRightLowerShadow = scene.add.ellipse(9, 12, 9, 8, 0x000000, 0.3)
    this.bodyContainer.add(frontRightLowerShadow)

    const frontRightLower = scene.add.ellipse(10, 11, 8.5, 7, legDark)
    frontRightLower.setStrokeStyle(2, this.getDarkerColor(legDark, 30), 0.8)
    this.bodyContainer.add(frontRightLower)

    // Front Right Foot with toes
    const frontRightFootShadow = scene.add.ellipse(9, 17, 10, 4.5, 0x000000, 0.4)
    this.bodyContainer.add(frontRightFootShadow)

    const frontRightFoot = scene.add.ellipse(10, 16, 9.5, 4, this.getDarkerColor(legDark, 20))
    frontRightFoot.setStrokeStyle(2, this.getDarkerColor(legDark, 40), 0.8)
    this.bodyContainer.add(frontRightFoot)

    const frontRightFootHighlight = scene.add.ellipse(11, 15.5, 4, 2, this.getLighterColor(legColor, 30), 0.5)
    this.bodyContainer.add(frontRightFootHighlight)

    // Front Right Toes
    for (let i = 0; i < 4; i++) {
      const toeX = 7 + i * 2
      const toeY = 17.5

      const toeShadow = scene.add.ellipse(toeX + 0.5, toeY + 0.5, 1.5, 2, 0x000000, 0.4)
      this.bodyContainer.add(toeShadow)

      const toe = scene.add.ellipse(toeX, toeY, 1.3, 1.8, toeColor)
      toe.setStrokeStyle(1, this.getDarkerColor(toeColor, 30), 0.8)
      this.bodyContainer.add(toe)

      const toeHighlight = scene.add.circle(toeX - 0.3, toeY - 0.3, 0.5, this.getLighterColor(toeColor, 40), 0.6)
      this.bodyContainer.add(toeHighlight)
    }

    this.addGlow(scene, 0xEF5350, 34)
  }

  private createDefaultTower(scene: Phaser.Scene) {
    // Create rotating body container
    this.bodyContainer = scene.add.container(0, 0)
    this.add(this.bodyContainer)

    const shadow = scene.add.circle(2, 2, 25, 0x000000, 0.3)
    this.bodyContainer.add(shadow)
    const base = scene.add.circle(0, 0, 25, this.stats.color)
    base.setStrokeStyle(3, 0x000000, 0.8)
    this.bodyContainer.add(base)
    this.towerGraphic = base
    const highlight = scene.add.circle(-6, -6, 10, 0xFFFFFF, 0.4)
    this.bodyContainer.add(highlight)
    this.addGlow(scene, this.stats.color, 25)
  }

  private addGlow(scene: Phaser.Scene, color: number, size: number) {
    const glow = scene.add.circle(0, -10, size, color, 0.15)
    this.add(glow)
    scene.tweens.add({
      targets: glow,
      scale: { from: 1, to: 1.2 },
      alpha: { from: 0.15, to: 0.05 },
      duration: 1000,
      yoyo: true,
      repeat: -1
    })
  }

  updateLevelIndicator() {
    // Remove old level text and effects
    if (this.levelText) {
      this.levelText.destroy()
    }
    this.upgradeEffects.forEach(effect => effect.destroy())
    this.upgradeEffects = []

    // Only show level if upgraded
    if (this.level > 0) {
      const levelBg = this.scene.add.circle(20, -20, 10, 0x000000, 0.8)
      this.add(levelBg)

      this.levelText = this.scene.add.text(20, -20, `${this.level}`, {
        fontSize: '14px',
        color: '#ffd700',
        fontStyle: 'bold'
      })
      this.levelText.setOrigin(0.5)
      this.add(this.levelText)

      // Add visual upgrade effects
      this.addUpgradeVisuals()
    }
  }

  private addUpgradeVisuals() {
    if (!this.bodyContainer) return

    // Scale up the tower based on level
    if (this.level === 1) {
      this.bodyContainer.setScale(1.15)
    } else if (this.level === 2) {
      this.bodyContainer.setScale(1.3)
    }

    // Apply unique character-specific upgrades
    this.applyCharacterUpgrades()
  }

  private applyCharacterUpgrades() {
    // Call unique upgrade method for each character type
    switch (this.stats.type) {
      case 1: this.upgradeFalcon(); break
      case 2: this.upgradeAngel(); break
      case 3: this.upgradeMonster(); break
      case 4: this.upgradeDog(); break
      case 5: this.upgradeElephant(); break
      case 6: this.upgradeAlien(); break
      case 7: this.upgradeFairy(); break
      case 8: this.upgradePanda(); break
      case 9: this.upgradeBison(); break
      case 10: this.upgradeDragon(); break
      case 11: this.upgradeBeetle(); break
      case 12: this.upgradeAstronaut(); break
      case 13: this.upgradeCrab(); break
      case 14: this.upgradeClown(); break
      case 15: this.upgradeGiraffe(); break
      case 16: this.upgradeHippo(); break
    }
  }

  // 1. Falcon (Focused) - Targeting/precision theme
  private upgradeFalcon() {
    if (!this.bodyContainer) return

    if (this.level === 1) {
      // Level 1: Green targeting reticle, crosshair lines
      const reticle = this.scene.add.circle(0, -10, 30, 0x00FF00, 0)
      reticle.setStrokeStyle(2, 0x00FF00, 0.8)
      this.bodyContainer.add(reticle)
      this.upgradeEffects.push(reticle)

      // Crosshair lines
      const lineH = this.scene.add.rectangle(0, -10, 50, 2, 0x00FF00, 0.6)
      const lineV = this.scene.add.rectangle(0, -10, 2, 50, 0x00FF00, 0.6)
      this.bodyContainer.add([lineH, lineV])
      this.upgradeEffects.push(lineH, lineV)

      // Pulsing animation
      this.scene.tweens.add({
        targets: [reticle, lineH, lineV],
        alpha: { from: 0.8, to: 0.3 },
        duration: 800,
        yoyo: true,
        repeat: -1
      })
    } else if (this.level === 2) {
      // Level 2: Cyan laser eyes, energy wings
      const { eyes, wings } = this.characterParts

      if (eyes) {
        eyes.forEach(eye => {
          eye.setFillStyle(0x00FFFF)
          // Laser beam from eyes
          const laser = this.scene.add.rectangle(eye.x + 15, eye.y, 25, 2, 0x00FFFF, 0.8)
          this.bodyContainer?.add(laser)
          this.upgradeEffects.push(laser)

          this.scene.tweens.add({
            targets: laser,
            alpha: { from: 0.8, to: 0.4 },
            duration: 400,
            yoyo: true,
            repeat: -1
          })
        })
      }

      // Energy wings glow
      if (wings) {
        wings.forEach(wing => {
          wing.setStrokeStyle(3, 0x00FFFF, 1)
          const wingGlow = this.scene.add.circle(wing.x, wing.y, 15, 0x00FFFF, 0.3)
          this.bodyContainer?.add(wingGlow)
          this.upgradeEffects.push(wingGlow)
        })
      }
    }
  }

  // 2. Angel (Ambitious) - Divine/holy theme
  private upgradeAngel() {
    if (!this.bodyContainer) return

    if (this.level === 1) {
      // Level 1: Multiple gold halos, light rays
      for (let i = 0; i < 3; i++) {
        const halo = this.scene.add.circle(0, -30 - i * 5, 20 + i * 5, 0xFFD700, 0)
        halo.setStrokeStyle(2, 0xFFD700, 0.7 - i * 0.2)
        this.bodyContainer.add(halo)
        this.upgradeEffects.push(halo)

        this.scene.tweens.add({
          targets: halo,
          angle: 360,
          duration: 3000 + i * 500,
          repeat: -1
        })
      }

      // Light rays
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6
        const ray = this.scene.add.rectangle(
          Math.cos(angle) * 25,
          Math.sin(angle) * 25 - 10,
          15, 2, 0xFFFFAA, 0.5
        )
        ray.setRotation(angle)
        this.bodyContainer.add(ray)
        this.upgradeEffects.push(ray)
      }
    } else if (this.level === 2) {
      // Level 2: White divine aura, radiant wings
      const aura = this.scene.add.circle(0, -10, 50, 0xFFFFFF, 0.2)
      this.bodyContainer.add(aura)
      this.upgradeEffects.push(aura)

      this.scene.tweens.add({
        targets: aura,
        scale: { from: 1, to: 1.3 },
        alpha: { from: 0.2, to: 0.05 },
        duration: 1000,
        yoyo: true,
        repeat: -1
      })

      const { wings } = this.characterParts
      if (wings) {
        wings.forEach(wing => {
          wing.setStrokeStyle(4, 0xFFFFFF, 1)
          wing.setScale(wing.scaleX * 1.2, wing.scaleY * 1.2)

          // Radiant particles
          for (let i = 0; i < 3; i++) {
            const particle = this.scene.add.star(wing.x, wing.y, 4, 2, 4, 0xFFFFFF, 0.8)
            this.bodyContainer?.add(particle)
            this.upgradeEffects.push(particle)

            this.scene.tweens.add({
              targets: particle,
              y: particle.y - 20,
              alpha: 0,
              duration: 1000,
              delay: i * 300,
              repeat: -1
            })
          }
        })
      }
    }
  }

  // 3. Monster (Motivated) - Energy/power theme
  private upgradeMonster() {
    if (!this.bodyContainer) return

    if (this.level === 1) {
      // Level 1: Green crackling energy sparks, glowing horns
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8
        const spark = this.scene.add.circle(
          Math.cos(angle) * 25,
          Math.sin(angle) * 25 - 10,
          3, 0x00FF00, 0.9
        )
        this.bodyContainer.add(spark)
        this.upgradeEffects.push(spark)

        this.scene.tweens.add({
          targets: spark,
          x: spark.x + Math.cos(angle) * 10,
          y: spark.y + Math.sin(angle) * 10,
          alpha: 0,
          duration: 600,
          delay: i * 75,
          repeat: -1
        })
      }

      // Glowing horns
      const { accessories } = this.characterParts
      if (accessories) {
        accessories.forEach(acc => {
          acc.setStrokeStyle(3, 0x00FF00, 0.8)
        })
      }
    } else if (this.level === 2) {
      // Level 2: Purple/magenta massive power aura, giant horns, red glowing eyes
      const powerAura = this.scene.add.circle(0, -10, 60, 0xFF00FF, 0.25)
      this.bodyContainer.add(powerAura)
      this.upgradeEffects.push(powerAura)

      this.scene.tweens.add({
        targets: powerAura,
        scale: { from: 1, to: 1.4 },
        alpha: { from: 0.25, to: 0.1 },
        duration: 700,
        yoyo: true,
        repeat: -1
      })

      const { eyes, accessories } = this.characterParts
      if (eyes) {
        eyes.forEach(eye => {
          eye.setFillStyle(0xFF0000)
          const eyeGlow = this.scene.add.circle(eye.x, eye.y, 8, 0xFF0000, 0.7)
          this.bodyContainer?.add(eyeGlow)
          this.upgradeEffects.push(eyeGlow)

          this.scene.tweens.add({
            targets: eyeGlow,
            scale: { from: 1, to: 1.5 },
            alpha: { from: 0.7, to: 0.3 },
            duration: 500,
            yoyo: true,
            repeat: -1
          })
        })
      }

      if (accessories) {
        accessories.forEach(acc => {
          acc.setScale(acc.scaleX * 1.3, acc.scaleY * 1.3)
          acc.setStrokeStyle(4, 0xFF00FF, 1)
        })
      }
    }
  }

  // 4. Dog (Dialed In) - Support/healing theme
  private upgradeDog() {
    if (!this.bodyContainer) return

    if (this.level === 1) {
      // Level 1: Green healing pulse rings
      for (let i = 0; i < 3; i++) {
        const ring = this.scene.add.circle(0, -10, 20, 0x00FF00, 0)
        ring.setStrokeStyle(2, 0x00FF00, 0.6)
        this.bodyContainer.add(ring)
        this.upgradeEffects.push(ring)

        this.scene.tweens.add({
          targets: ring,
          scale: { from: 1, to: 2.5 },
          alpha: { from: 0.6, to: 0 },
          duration: 1500,
          delay: i * 500,
          repeat: -1
        })
      }
    } else if (this.level === 2) {
      // Level 2: Gold buff aura with floating "+" symbols
      const buffAura = this.scene.add.circle(0, -10, 45, 0xFFD700, 0.2)
      this.bodyContainer.add(buffAura)
      this.upgradeEffects.push(buffAura)

      this.scene.tweens.add({
        targets: buffAura,
        scale: { from: 1, to: 1.2 },
        duration: 1000,
        yoyo: true,
        repeat: -1
      })

      // Floating + symbols
      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI * 2 * i) / 4
        const plus = this.scene.add.text(
          Math.cos(angle) * 30,
          Math.sin(angle) * 30 - 10,
          '+',
          { fontSize: '20px', color: '#FFD700', fontStyle: 'bold' }
        )
        plus.setOrigin(0.5)
        this.bodyContainer.add(plus)
        this.upgradeEffects.push(plus)

        this.scene.tweens.add({
          targets: plus,
          y: plus.y - 15,
          alpha: { from: 1, to: 0 },
          duration: 1200,
          delay: i * 300,
          repeat: -1
        })
      }
    }
  }

  // 5. Elephant (Empathy) - Execution/pierce theme
  private upgradeElephant() {
    if (!this.bodyContainer) return

    if (this.level === 1) {
      // Level 1: Orange piercing arrows indicators
      for (let i = 0; i < 4; i++) {
        const arrow = this.scene.add.triangle(
          0, -10 - i * 8,
          -5, 5, 5, 5, 0, -5,
          0xFF8C00, 0.7
        )
        this.bodyContainer.add(arrow)
        this.upgradeEffects.push(arrow)

        this.scene.tweens.add({
          targets: arrow,
          y: arrow.y - 15,
          alpha: 0,
          duration: 800,
          delay: i * 200,
          repeat: -1
        })
      }
    } else if (this.level === 2) {
      // Level 2: Red with skull symbol for execute
      const executeCircle = this.scene.add.circle(0, -10, 35, 0xFF0000, 0.3)
      this.bodyContainer.add(executeCircle)
      this.upgradeEffects.push(executeCircle)

      // Skull symbol
      const skull = this.scene.add.circle(0, -10, 12, 0xFFFFFF, 0)
      skull.setStrokeStyle(3, 0xFF0000, 1)
      this.bodyContainer.add(skull)
      this.upgradeEffects.push(skull)

      // Skull eyes
      const eye1 = this.scene.add.circle(-4, -12, 3, 0xFF0000)
      const eye2 = this.scene.add.circle(4, -12, 3, 0xFF0000)
      this.bodyContainer.add([eye1, eye2])
      this.upgradeEffects.push(eye1, eye2)

      this.scene.tweens.add({
        targets: executeCircle,
        scale: { from: 1, to: 1.3 },
        alpha: { from: 0.3, to: 0.1 },
        duration: 800,
        yoyo: true,
        repeat: -1
      })
    }
  }

  // 6. Alien (Adaptable) - Shifting/multi theme
  private upgradeAlien() {
    if (!this.bodyContainer) return

    if (this.level === 1) {
      // Level 1: Color-shifting outlines, floating orbs
      const outline = this.scene.add.circle(0, -10, 35, 0x00FF00, 0)
      outline.setStrokeStyle(3, 0x00FF00, 0.7)
      this.bodyContainer.add(outline)
      this.upgradeEffects.push(outline)

      // Color shift animation
      this.scene.tweens.addCounter({
        from: 0,
        to: 360,
        duration: 3000,
        repeat: -1,
        onUpdate: (tween) => {
          const hue = tween.getValue() ?? 0
          const color = Phaser.Display.Color.HSVToRGB(hue / 360, 1, 1)
          outline.setStrokeStyle(3, color.color, 0.7)
        }
      })

      // Floating orbs
      for (let i = 0; i < 3; i++) {
        const angle = (Math.PI * 2 * i) / 3
        const orb = this.scene.add.circle(
          Math.cos(angle) * 25,
          Math.sin(angle) * 25 - 10,
          5, 0x00FFFF, 0.8
        )
        this.bodyContainer.add(orb)
        this.upgradeEffects.push(orb)

        this.scene.tweens.add({
          targets: orb,
          angle: 360,
          duration: 2000,
          repeat: -1
        })
      }
    } else if (this.level === 2) {
      // Level 2: Purple/magenta with electric arcs
      const electricAura = this.scene.add.circle(0, -10, 50, 0xFF00FF, 0.2)
      this.bodyContainer.add(electricAura)
      this.upgradeEffects.push(electricAura)

      // Electric arcs
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6
        const arc = this.scene.add.line(
          0, -10,
          0, 0,
          Math.cos(angle) * 40, Math.sin(angle) * 40,
          0xFF00FF, 0.8
        )
        arc.setLineWidth(2)
        this.bodyContainer.add(arc)
        this.upgradeEffects.push(arc)

        this.scene.tweens.add({
          targets: arc,
          alpha: { from: 0.8, to: 0.2 },
          duration: 400,
          delay: i * 100,
          yoyo: true,
          repeat: -1
        })
      }
    }
  }

  // 7. Fairy (Fearless) - Magic/control theme
  private upgradeFairy() {
    if (!this.bodyContainer) return

    if (this.level === 1) {
      // Level 1: Purple rotating magic circles, enhanced wand
      for (let i = 0; i < 2; i++) {
        const magicCircle = this.scene.add.circle(0, -10, 25 + i * 10, 0x9C27B0, 0)
        magicCircle.setStrokeStyle(2, 0x9C27B0, 0.7)
        this.bodyContainer.add(magicCircle)
        this.upgradeEffects.push(magicCircle)

        // Runes on circle
        for (let j = 0; j < 4; j++) {
          const angle = (Math.PI * 2 * j) / 4
          const rune = this.scene.add.star(
            Math.cos(angle) * (25 + i * 10),
            Math.sin(angle) * (25 + i * 10),
            4, 2, 4, 0x9C27B0, 0.8
          )
          this.bodyContainer.add(rune)
          this.upgradeEffects.push(rune)
        }

        this.scene.tweens.add({
          targets: magicCircle,
          angle: i === 0 ? 360 : -360,
          duration: 3000,
          repeat: -1
        })
      }

      const { weapon } = this.characterParts
      if (weapon) {
        weapon.setStrokeStyle(3, 0x9C27B0, 1)
      }
    } else if (this.level === 2) {
      // Level 2: Cyan ice/freeze with snowflakes
      const iceAura = this.scene.add.circle(0, -10, 45, 0x00FFFF, 0.25)
      this.bodyContainer.add(iceAura)
      this.upgradeEffects.push(iceAura)

      this.scene.tweens.add({
        targets: iceAura,
        scale: { from: 1, to: 1.2 },
        duration: 1000,
        yoyo: true,
        repeat: -1
      })

      // Snowflakes
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8
        const snowflake = this.scene.add.star(
          Math.cos(angle) * 35,
          Math.sin(angle) * 35 - 10,
          6, 3, 6, 0x00FFFF, 0.9
        )
        this.bodyContainer.add(snowflake)
        this.upgradeEffects.push(snowflake)

        this.scene.tweens.add({
          targets: snowflake,
          angle: 360,
          scale: { from: 1, to: 1.3 },
          duration: 2000,
          delay: i * 250,
          repeat: -1
        })
      }
    }
  }

  // 8. Panda (Patient) - Execute/lifesteal theme
  private upgradePanda() {
    if (!this.bodyContainer) return

    if (this.level === 1) {
      // Level 1: Red HP threshold indicator line
      const thresholdLine = this.scene.add.rectangle(0, -10, 60, 3, 0xFF0000, 0.7)
      this.bodyContainer.add(thresholdLine)
      this.upgradeEffects.push(thresholdLine)

      this.scene.tweens.add({
        targets: thresholdLine,
        alpha: { from: 0.7, to: 0.3 },
        duration: 600,
        yoyo: true,
        repeat: -1
      })

      // HP indicator markers
      for (let i = 0; i < 5; i++) {
        const marker = this.scene.add.rectangle(
          -25 + i * 12.5, -10,
          2, 10, 0xFF0000, 0.6
        )
        this.bodyContainer.add(marker)
        this.upgradeEffects.push(marker)
      }
    } else if (this.level === 2) {
      // Level 2: Pink with floating hearts (lifesteal)
      const lifestealAura = this.scene.add.circle(0, -10, 40, 0xFF69B4, 0.25)
      this.bodyContainer.add(lifestealAura)
      this.upgradeEffects.push(lifestealAura)

      // Floating hearts
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6
        // Create heart shape with two circles and a triangle
        const heartContainer = this.scene.add.container(
          Math.cos(angle) * 30,
          Math.sin(angle) * 30 - 10
        )

        const leftCircle = this.scene.add.circle(-3, -2, 4, 0xFF1493, 0.8)
        const rightCircle = this.scene.add.circle(3, -2, 4, 0xFF1493, 0.8)
        const bottomTriangle = this.scene.add.triangle(0, 2, -6, 0, 6, 0, 0, 8, 0xFF1493, 0.8)

        heartContainer.add([leftCircle, rightCircle, bottomTriangle])
        this.bodyContainer.add(heartContainer)
        this.upgradeEffects.push(heartContainer)

        this.scene.tweens.add({
          targets: heartContainer,
          y: heartContainer.y - 20,
          alpha: { from: 0.8, to: 0 },
          duration: 1500,
          delay: i * 250,
          repeat: -1
        })
      }
    }
  }

  // 9. Bison (Brave) - Speed/charge theme
  private upgradeBison() {
    if (!this.bodyContainer) return

    if (this.level === 1) {
      // Level 1: Gold speed trails, glowing horns
      for (let i = 0; i < 3; i++) {
        const trail = this.scene.add.rectangle(-20 - i * 8, -10, 10, 15, 0xFFD700, 0.6 - i * 0.2)
        this.bodyContainer.add(trail)
        this.upgradeEffects.push(trail)

        this.scene.tweens.add({
          targets: trail,
          x: trail.x - 15,
          alpha: 0,
          duration: 500,
          delay: i * 100,
          repeat: -1
        })
      }

      const { accessories } = this.characterParts
      if (accessories) {
        accessories.forEach(acc => {
          acc.setStrokeStyle(3, 0xFFD700, 1)
          const hornGlow = this.scene.add.circle(acc.x, acc.y, 8, 0xFFD700, 0.5)
          this.bodyContainer?.add(hornGlow)
          this.upgradeEffects.push(hornGlow)
        })
      }
    } else if (this.level === 2) {
      // Level 2: Orange earthquake impact waves
      for (let i = 0; i < 3; i++) {
        const wave = this.scene.add.ellipse(0, 20, 80, 20, 0xFF8C00, 0)
        wave.setStrokeStyle(3, 0xFF8C00, 0.7)
        this.bodyContainer.add(wave)
        this.upgradeEffects.push(wave)

        this.scene.tweens.add({
          targets: wave,
          scaleX: { from: 1, to: 1.5 },
          scaleY: { from: 1, to: 0.5 },
          alpha: { from: 0.7, to: 0 },
          duration: 1000,
          delay: i * 333,
          repeat: -1
        })
      }

      // Impact particles
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8
        const particle = this.scene.add.circle(0, 15, 4, 0xFF8C00, 0.9)
        this.bodyContainer.add(particle)
        this.upgradeEffects.push(particle)

        this.scene.tweens.add({
          targets: particle,
          x: Math.cos(angle) * 40,
          y: 15 + Math.sin(angle) * 10,
          alpha: 0,
          duration: 700,
          delay: i * 100,
          repeat: -1
        })
      }
    }
  }

  // 10. Dragon (Driven) - Fire/command theme
  private upgradeDragon() {
    if (!this.bodyContainer) return

    if (this.level === 1) {
      // Level 1: Gold command aura with star symbols
      const commandAura = this.scene.add.circle(0, -10, 40, 0xFFD700, 0.2)
      this.bodyContainer.add(commandAura)
      this.upgradeEffects.push(commandAura)

      this.scene.tweens.add({
        targets: commandAura,
        scale: { from: 1, to: 1.2 },
        duration: 1000,
        yoyo: true,
        repeat: -1
      })

      // Star symbols
      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5
        const star = this.scene.add.star(
          Math.cos(angle) * 35,
          Math.sin(angle) * 35 - 10,
          5, 4, 8, 0xFFD700, 0.9
        )
        this.bodyContainer.add(star)
        this.upgradeEffects.push(star)

        this.scene.tweens.add({
          targets: star,
          angle: 360,
          scale: { from: 1, to: 1.3 },
          duration: 2000,
          delay: i * 400,
          repeat: -1
        })
      }
    } else if (this.level === 2) {
      // Level 2: Orange/red massive flames, fire particles
      const fireAura = this.scene.add.circle(0, -10, 60, 0xFF4500, 0.3)
      this.bodyContainer.add(fireAura)
      this.upgradeEffects.push(fireAura)

      this.scene.tweens.add({
        targets: fireAura,
        scale: { from: 1, to: 1.3 },
        alpha: { from: 0.3, to: 0.1 },
        duration: 800,
        yoyo: true,
        repeat: -1
      })

      // Fire particles
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 * i) / 12
        const flame = this.scene.add.circle(
          Math.cos(angle) * 35,
          Math.sin(angle) * 35 - 10,
          5, i % 2 === 0 ? 0xFF4500 : 0xFF6600, 0.8
        )
        this.bodyContainer.add(flame)
        this.upgradeEffects.push(flame)

        this.scene.tweens.add({
          targets: flame,
          y: flame.y - 25,
          scaleX: { from: 1, to: 0.5 },
          scaleY: { from: 1, to: 1.5 },
          alpha: 0,
          duration: 1000,
          delay: i * 83,
          repeat: -1
        })
      }
    }
  }

  // 11. Beetle (Balanced) - Equilibrium theme
  private upgradeBeetle() {
    if (!this.bodyContainer) return

    if (this.level === 1) {
      // Level 1: Cyan/orange balance symbols (yin-yang)
      const yinYang = this.scene.add.circle(0, -10, 25, 0x00FFFF, 0.5)
      this.bodyContainer.add(yinYang)
      this.upgradeEffects.push(yinYang)

      const yangHalf = this.scene.add.arc(0, -10, 25, 270, 90, false, 0xFF8C00, 0.5)
      this.bodyContainer.add(yangHalf)
      this.upgradeEffects.push(yangHalf)

      const yinDot = this.scene.add.circle(-8, -10, 5, 0xFF8C00)
      const yangDot = this.scene.add.circle(8, -10, 5, 0x00FFFF)
      this.bodyContainer.add([yinDot, yangDot])
      this.upgradeEffects.push(yinDot, yangDot)

      this.scene.tweens.add({
        targets: [yinYang, yangHalf, yinDot, yangDot],
        angle: 360,
        duration: 4000,
        repeat: -1
      })
    } else if (this.level === 2) {
      // Level 2: Gold rotating harmony symbol
      const harmonyRing = this.scene.add.circle(0, -10, 40, 0xFFD700, 0)
      harmonyRing.setStrokeStyle(4, 0xFFD700, 0.8)
      this.bodyContainer.add(harmonyRing)
      this.upgradeEffects.push(harmonyRing)

      // Eight trigrams
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8
        const trigram = this.scene.add.rectangle(
          Math.cos(angle) * 40,
          Math.sin(angle) * 40 - 10,
          3, 12, 0xFFD700, 0.9
        )
        trigram.setRotation(angle)
        this.bodyContainer.add(trigram)
        this.upgradeEffects.push(trigram)
      }

      this.scene.tweens.add({
        targets: harmonyRing,
        angle: 360,
        duration: 3000,
        repeat: -1
      })

      // Pulsing center
      const center = this.scene.add.circle(0, -10, 15, 0xFFD700, 0.4)
      this.bodyContainer.add(center)
      this.upgradeEffects.push(center)

      this.scene.tweens.add({
        targets: center,
        scale: { from: 1, to: 1.3 },
        alpha: { from: 0.4, to: 0.1 },
        duration: 1000,
        yoyo: true,
        repeat: -1
      })
    }
  }

  // 12. Astronaut (Adventurous) - Space/cosmic theme
  private upgradeAstronaut() {
    if (!this.bodyContainer) return

    if (this.level === 1) {
      // Level 1: Cyan/white twinkling stars
      for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2
        const distance = 20 + Math.random() * 20
        const star = this.scene.add.star(
          Math.cos(angle) * distance,
          Math.sin(angle) * distance - 10,
          4, 2, 4, i % 2 === 0 ? 0x00FFFF : 0xFFFFFF, 0.9
        )
        this.bodyContainer.add(star)
        this.upgradeEffects.push(star)

        this.scene.tweens.add({
          targets: star,
          alpha: { from: 0.9, to: 0.2 },
          scale: { from: 1, to: 1.5 },
          duration: 800 + Math.random() * 400,
          delay: i * 100,
          yoyo: true,
          repeat: -1
        })
      }
    } else if (this.level === 2) {
      // Level 2: Purple nebula aura with orbiting galaxies
      const nebula = this.scene.add.circle(0, -10, 55, 0x9C27B0, 0.3)
      this.bodyContainer.add(nebula)
      this.upgradeEffects.push(nebula)

      this.scene.tweens.add({
        targets: nebula,
        scale: { from: 1, to: 1.2 },
        alpha: { from: 0.3, to: 0.15 },
        duration: 1500,
        yoyo: true,
        repeat: -1
      })

      // Orbiting galaxies
      for (let i = 0; i < 3; i++) {
        const galaxy = this.scene.add.circle(0, -10, 8, 0xFFFFFF, 0.8)
        this.bodyContainer.add(galaxy)
        this.upgradeEffects.push(galaxy)

        const orbitRadius = 35
        const orbitSpeed = 3000 + i * 1000

        this.scene.tweens.add({
          targets: galaxy,
          angle: 360,
          duration: orbitSpeed,
          repeat: -1,
          onUpdate: () => {
            const angle = (galaxy.angle * Math.PI) / 180 + (i * Math.PI * 2) / 3
            galaxy.x = Math.cos(angle) * orbitRadius
            galaxy.y = Math.sin(angle) * orbitRadius - 10
          }
        })
      }
    }
  }

  // 13. Crab (Creative) - Water/wave theme
  private upgradeCrab() {
    if (!this.bodyContainer) return

    if (this.level === 1) {
      // Level 1: Blue water ripples, glowing claws
      for (let i = 0; i < 3; i++) {
        const ripple = this.scene.add.circle(0, -10, 20, 0x2196F3, 0)
        ripple.setStrokeStyle(2, 0x2196F3, 0.6)
        this.bodyContainer.add(ripple)
        this.upgradeEffects.push(ripple)

        this.scene.tweens.add({
          targets: ripple,
          scale: { from: 1, to: 2 },
          alpha: { from: 0.6, to: 0 },
          duration: 1200,
          delay: i * 400,
          repeat: -1
        })
      }

      const { accessories } = this.characterParts
      if (accessories) {
        accessories.forEach(acc => {
          acc.setStrokeStyle(3, 0x00FFFF, 1)
          const clawGlow = this.scene.add.circle(acc.x, acc.y, 6, 0x00FFFF, 0.6)
          this.bodyContainer?.add(clawGlow)
          this.upgradeEffects.push(clawGlow)

          this.scene.tweens.add({
            targets: clawGlow,
            scale: { from: 1, to: 1.4 },
            alpha: { from: 0.6, to: 0.2 },
            duration: 700,
            yoyo: true,
            repeat: -1
          })
        })
      }
    } else if (this.level === 2) {
      // Level 2: Cyan massive wave with enhanced claws
      // Wave shape
      const wavePoints: number[] = []
      for (let i = 0; i <= 10; i++) {
        const x = -40 + i * 8
        const y = 10 + Math.sin((i / 10) * Math.PI * 2) * 8
        wavePoints.push(x, y)
      }

      const wave = this.scene.add.polygon(0, 0, wavePoints, 0x00FFFF, 0.4)
      this.bodyContainer.add(wave)
      this.upgradeEffects.push(wave)

      this.scene.tweens.add({
        targets: wave,
        x: { from: 0, to: 10 },
        duration: 1000,
        yoyo: true,
        repeat: -1
      })

      // Water droplets
      for (let i = 0; i < 8; i++) {
        const droplet = this.scene.add.circle(
          -30 + i * 8,
          -20,
          3, 0x00FFFF, 0.8
        )
        this.bodyContainer.add(droplet)
        this.upgradeEffects.push(droplet)

        this.scene.tweens.add({
          targets: droplet,
          y: 15,
          alpha: 0,
          duration: 800,
          delay: i * 100,
          repeat: -1
        })
      }

      const { accessories } = this.characterParts
      if (accessories) {
        accessories.forEach(acc => {
          acc.setScale(acc.scaleX * 1.3, acc.scaleY * 1.3)
          acc.setStrokeStyle(4, 0x00FFFF, 1)
        })
      }
    }
  }

  // 14. Clown (Competitive) - Victory/confetti theme
  private upgradeClown() {
    if (!this.bodyContainer) return

    if (this.level === 1) {
      // Level 1: Green with rainbow confetti bursts
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 * i) / 12
        const colors = [0xFF0000, 0xFFFF00, 0x00FF00, 0x00FFFF, 0x0000FF, 0xFF00FF]
        const confetti = this.scene.add.rectangle(
          0, -10,
          4, 8,
          colors[i % colors.length],
          0.9
        )
        confetti.setRotation(Math.random() * Math.PI * 2)
        this.bodyContainer.add(confetti)
        this.upgradeEffects.push(confetti)

        this.scene.tweens.add({
          targets: confetti,
          x: Math.cos(angle) * 35,
          y: Math.sin(angle) * 35 - 10,
          angle: confetti.angle + 360,
          alpha: 0,
          duration: 1000,
          delay: i * 83,
          repeat: -1
        })
      }

      const greenGlow = this.scene.add.circle(0, -10, 30, 0x00FF00, 0.2)
      this.bodyContainer.add(greenGlow)
      this.upgradeEffects.push(greenGlow)
    } else if (this.level === 2) {
      // Level 2: Orange explosion particles with giant hat
      const explosion = this.scene.add.circle(0, -10, 50, 0xFF8C00, 0.3)
      this.bodyContainer.add(explosion)
      this.upgradeEffects.push(explosion)

      this.scene.tweens.add({
        targets: explosion,
        scale: { from: 1, to: 1.4 },
        alpha: { from: 0.3, to: 0 },
        duration: 800,
        repeat: -1
      })

      // Explosion particles
      for (let i = 0; i < 16; i++) {
        const angle = (Math.PI * 2 * i) / 16
        const particle = this.scene.add.star(0, -10, 5, 3, 6, 0xFF8C00, 0.9)
        this.bodyContainer.add(particle)
        this.upgradeEffects.push(particle)

        this.scene.tweens.add({
          targets: particle,
          x: Math.cos(angle) * 45,
          y: Math.sin(angle) * 45 - 10,
          scale: { from: 1, to: 0.2 },
          alpha: 0,
          duration: 900,
          delay: i * 56,
          repeat: -1
        })
      }

      // Giant hat
      const { accessories } = this.characterParts
      if (accessories) {
        accessories.forEach(acc => {
          acc.setScale(acc.scaleX * 1.4, acc.scaleY * 1.4)
        })
      }
    }
  }

  // 15. Giraffe (Genuine) - Truth/pierce theme
  private upgradeGiraffe() {
    if (!this.bodyContainer) return

    if (this.level === 1) {
      // Level 1: Gold with balance scale symbol
      const leftScale = this.scene.add.circle(-15, -5, 8, 0xFFD700, 0)
      leftScale.setStrokeStyle(2, 0xFFD700, 0.8)
      const rightScale = this.scene.add.circle(15, -5, 8, 0xFFD700, 0)
      rightScale.setStrokeStyle(2, 0xFFD700, 0.8)
      const scalePole = this.scene.add.rectangle(0, -15, 2, 20, 0xFFD700, 0.8)
      const scaleBeam = this.scene.add.rectangle(0, -15, 35, 2, 0xFFD700, 0.8)

      this.bodyContainer.add([scalePole, scaleBeam, leftScale, rightScale])
      this.upgradeEffects.push(scalePole, scaleBeam, leftScale, rightScale)

      // Balance animation
      this.scene.tweens.add({
        targets: scaleBeam,
        angle: { from: -5, to: 5 },
        duration: 1500,
        yoyo: true,
        repeat: -1
      })

      this.scene.tweens.add({
        targets: leftScale,
        y: { from: -5, to: -8 },
        duration: 1500,
        yoyo: true,
        repeat: -1
      })

      this.scene.tweens.add({
        targets: rightScale,
        y: { from: -5, to: -2 },
        duration: 1500,
        yoyo: true,
        repeat: -1
      })
    } else if (this.level === 2) {
      // Level 2: White divine light beam, glowing spots
      const lightBeam = this.scene.add.rectangle(0, -40, 15, 60, 0xFFFFFF, 0.4)
      this.bodyContainer.add(lightBeam)
      this.upgradeEffects.push(lightBeam)

      this.scene.tweens.add({
        targets: lightBeam,
        alpha: { from: 0.4, to: 0.2 },
        scaleX: { from: 1, to: 1.3 },
        duration: 1000,
        yoyo: true,
        repeat: -1
      })

      // Divine rays
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8
        const ray = this.scene.add.rectangle(
          0, -30,
          3, 30,
          0xFFFFFF, 0.3
        )
        ray.setRotation(angle)
        this.bodyContainer.add(ray)
        this.upgradeEffects.push(ray)
      }

      // Glowing spots on body
      const { body } = this.characterParts
      if (body) {
        for (let i = 0; i < 6; i++) {
          const spot = this.scene.add.circle(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 30 - 10,
            4, 0xFFFFFF, 0.7
          )
          this.bodyContainer.add(spot)
          this.upgradeEffects.push(spot)

          this.scene.tweens.add({
            targets: spot,
            alpha: { from: 0.7, to: 0.3 },
            scale: { from: 1, to: 1.3 },
            duration: 800,
            delay: i * 133,
            yoyo: true,
            repeat: -1
          })
        }
      }
    }
  }

  // 16. Hippo (Helpful) - Fire/support theme
  private upgradeHippo() {
    if (!this.bodyContainer) return

    if (this.level === 1) {
      // Level 1: Red/orange rising fire particles
      for (let i = 0; i < 10; i++) {
        const flame = this.scene.add.circle(
          (Math.random() - 0.5) * 30,
          10,
          4, i % 2 === 0 ? 0xFF0000 : 0xFF8C00, 0.8
        )
        this.bodyContainer.add(flame)
        this.upgradeEffects.push(flame)

        this.scene.tweens.add({
          targets: flame,
          y: flame.y - 40,
          scaleX: { from: 1, to: 0.3 },
          scaleY: { from: 1, to: 1.5 },
          alpha: 0,
          duration: 1200,
          delay: i * 120,
          repeat: -1
        })
      }
    } else if (this.level === 2) {
      // Level 2: Orange massive inferno aura with flame ring
      const inferno = this.scene.add.circle(0, -10, 60, 0xFF4500, 0.3)
      this.bodyContainer.add(inferno)
      this.upgradeEffects.push(inferno)

      this.scene.tweens.add({
        targets: inferno,
        scale: { from: 1, to: 1.3 },
        alpha: { from: 0.3, to: 0.1 },
        duration: 700,
        yoyo: true,
        repeat: -1
      })

      // Flame ring
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 * i) / 12
        const flame = this.scene.add.triangle(
          Math.cos(angle) * 45,
          Math.sin(angle) * 45 - 10,
          -4, 0, 4, 0, 0, -12,
          i % 2 === 0 ? 0xFF4500 : 0xFF6600,
          0.9
        )
        flame.setRotation(angle - Math.PI / 2)
        this.bodyContainer.add(flame)
        this.upgradeEffects.push(flame)

        this.scene.tweens.add({
          targets: flame,
          scaleY: { from: 1, to: 1.4 },
          alpha: { from: 0.9, to: 0.5 },
          duration: 600,
          delay: i * 50,
          yoyo: true,
          repeat: -1
        })
      }

      // Heat waves
      for (let i = 0; i < 3; i++) {
        const wave = this.scene.add.ellipse(0, -10 + i * 15, 50, 10, 0xFF8C00, 0.2)
        this.bodyContainer.add(wave)
        this.upgradeEffects.push(wave)

        this.scene.tweens.add({
          targets: wave,
          y: wave.y - 30,
          scaleX: { from: 1, to: 1.5 },
          alpha: 0,
          duration: 1500,
          delay: i * 500,
          repeat: -1
        })
      }
    }
  }

  update(time: number, delta: number, enemies: Phaser.GameObjects.Group, projectiles: Phaser.GameObjects.Group) {
    // Find target
    this.target = this.findTarget(enemies)

    // Handle sprite-based direction for ALL sprite-based towers
    if (this.target && this.characterSprite && this.animPrefix) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y)
      const degrees = Phaser.Math.RadToDeg(angle)

      // Determine direction based on angle
      let newDirection: 'front' | 'back' | 'left' | 'right' = 'front'

      if (degrees > -45 && degrees <= 45) {
        // Facing right
        newDirection = 'right'
        // Apply mirror based on character's mirrorDirection setting
        this.characterSprite.setFlipX(this.mirrorDirection === 'right')
      } else if (degrees > 45 && degrees <= 135) {
        // Facing down (front)
        newDirection = 'front'
      } else if (degrees > -135 && degrees <= -45) {
        // Facing up (back)
        newDirection = 'back'
      } else {
        // Facing left
        newDirection = 'right'
        // Apply mirror based on character's mirrorDirection setting
        this.characterSprite.setFlipX(this.mirrorDirection === 'left')
      }

      // Update idle animation if direction changed
      if (newDirection !== this.currentDirection) {
        this.currentDirection = newDirection

        // Get the body offset for this tower type (same as in createSpriteBasedTower)
        const bodyOffsets: Record<number, { x: number; y: number }> = {
          1: { x: 0, y: -21 },    // Focused Falcon
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
        const offset = bodyOffsets[this.stats.type] || { x: 0, y: -5 }

        if (newDirection === 'right') {
          this.characterSprite.play(`${this.animPrefix}-idle-right`)
          this.characterSprite.setOrigin(0.5, 0.5)
          this.characterSprite.x = 0  // Center horizontally when facing left/right
          this.characterSprite.y = offset.y
        } else if (newDirection === 'front') {
          this.characterSprite.play(`${this.animPrefix}-idle-front`)
          this.characterSprite.setOrigin(0.5, 0.5)
          this.characterSprite.x = offset.x
          this.characterSprite.y = offset.y
        } else if (newDirection === 'back') {
          this.characterSprite.play(`${this.animPrefix}-idle-back`)
          this.characterSprite.setOrigin(0.5, 0.5)
          this.characterSprite.x = offset.x
          this.characterSprite.y = offset.y
        }
      }
    }
    // Rotate tower body to face target (for non-sprite towers)
    else if (this.target && this.bodyContainer) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y)
      // Smoothly rotate towards target
      const targetRotation = angle + Math.PI / 2 // Add 90 degrees to face forward
      const currentRotation = this.bodyContainer.rotation
      const rotationDiff = Phaser.Math.Angle.Wrap(targetRotation - currentRotation)
      this.bodyContainer.rotation += rotationDiff * 0.2 // Smooth rotation
    }

    // Check if enough time has passed to fire again
    const fireDelay = 1000 / this.stats.fireRate
    if (time - this.lastFireTime < fireDelay) {
      return
    }

    if (this.target) {
      this.fire(projectiles)
      this.lastFireTime = time
    }
  }

  private findTarget(enemies: Phaser.GameObjects.Group): any {
    let closest: any = null
    let closestDist = this.stats.range

    enemies.children.entries.forEach((enemy: any) => {
      if (!enemy.active) return

      const dist = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        enemy.x,
        enemy.y
      )

      if (dist <= this.stats.range && dist < closestDist) {
        closest = enemy
        closestDist = dist
      }
    })

    return closest
  }

  private playThrowAnimation() {
    // Play throw animation for ALL sprite-based towers
    if (this.characterSprite && this.animPrefix) {
      const throwAnim = `${this.animPrefix}-throw-${this.currentDirection === 'right' ? 'right' : this.currentDirection}`
      this.characterSprite.play(throwAnim)
      // Return to idle after throw animation completes
      this.characterSprite.once('animationcomplete', () => {
        const idleAnim = `${this.animPrefix}-idle-${this.currentDirection === 'right' ? 'right' : this.currentDirection}`
        this.characterSprite?.play(idleAnim)
      })
    }
  }

  private fire(projectiles: Phaser.GameObjects.Group) {
    if (!this.target) return

    // Play throw animation for sprite-based towers
    this.playThrowAnimation()

    // Create unique attack based on tower type
    switch (this.stats.type) {
      case 1: // Focused Falcon - Sharp arrow
        this.fireArrow(projectiles)
        break
      case 2: // Ambitious Angel - Fast energy bolts
        this.fireEnergyBolt(projectiles)
        break
      case 3: // Motivated Monster - Heavy rock
        this.fireRock(projectiles)
        break
      case 4: // Dialed In Dog - Rapid bullets
        this.fireBullet(projectiles)
        break
      case 5: // Empathy Elephant - Sniper shot
        this.fireSniperShot(projectiles)
        break
      case 6: // Adaptable Alien - Alien plasma
        this.firePlasma(projectiles)
        break
      case 7: // Fearless Fairy - Magic sparkles
        this.fireMagicSparkle(projectiles)
        break
      case 8: // Patient Panda - Heavy strike
        this.fireHeavyStrike(projectiles)
        break
      case 9: // Brave Bison - Charging energy
        this.fireChargeShot(projectiles)
        break
      case 10: // Driven Dragon - FIRE BREATH!
        this.fireFlames(projectiles)
        break
      case 11: // Balanced Beetle - Energy orb
        this.fireEnergyOrb(projectiles)
        break
      case 12: // Adventurous Astronaut - Cosmic beam
        this.fireCosmicBeam(projectiles)
        break
      case 13: // Creative Crab - Water bubbles
        this.fireWaterBubble(projectiles)
        break
      case 14: // Competitive Clown - Explosive ball
        this.fireExplosiveBall(projectiles)
        break
      case 15: // Cynical Cat - Laser beam
        this.fireLaser(projectiles)
        break
      case 16: // Helpful Hippo - Massive fireball
        this.fireMassiveFireball(projectiles)
        break
      default:
        this.fireBasicProjectile(projectiles)
    }
  }

  private createMuzzleFlash(size: number = 15, color: number = 0xffffff) {
    const flash = this.scene.add.circle(this.x, this.y - 10, size, color, 0.8)
    this.scene.tweens.add({
      targets: flash,
      scale: 1.5,
      alpha: 0,
      duration: 150,
      onComplete: () => flash.destroy()
    })
  }

  private createHitEffect(x: number, y: number, color: number, size: number = 15, particles: number = 6) {
    const hitFlash = this.scene.add.circle(x, y, size, color, 0.8)
    this.scene.tweens.add({
      targets: hitFlash,
      scale: 2,
      alpha: 0,
      duration: 200,
      onComplete: () => hitFlash.destroy()
    })

    for (let i = 0; i < particles; i++) {
      const hitAngle = (Math.PI * 2 * i) / particles
      const hitParticle = this.scene.add.circle(x, y, 2, color)
      this.scene.tweens.add({
        targets: hitParticle,
        x: x + Math.cos(hitAngle) * 20,
        y: y + Math.sin(hitAngle) * 20,
        alpha: 0,
        duration: 300,
        onComplete: () => hitParticle.destroy()
      })
    }
  }

  // 1. Focused Falcon - Sharp arrow
  private fireArrow(projectiles: Phaser.GameObjects.Group) {
    const projectile = this.scene.add.container(this.x, this.y)

    if (this.level === 0) {
      // Base arrow
      this.createMuzzleFlash(10, 0x8BC34A)
      const arrow = this.scene.add.triangle(0, 0, -8, 0, 8, -3, 8, 3, 0x8BC34A)
      const arrowTip = this.scene.add.circle(8, 0, 3, 0xffff00)
      projectile.add([arrow, arrowTip])
      this.setupProjectile(projectile, projectiles, 600, true)
    } else if (this.level === 1) {
      // Enhanced arrow - bigger, golden, with trail
      this.createMuzzleFlash(15, 0xFFD700)
      const arrow = this.scene.add.triangle(0, 0, -12, 0, 12, -5, 12, 5, 0xFFD700)
      const arrowTip = this.scene.add.circle(12, 0, 5, 0xFFFF00)
      const glow = this.scene.add.circle(0, 0, 15, 0xFFD700, 0.4)
      projectile.add([glow, arrow, arrowTip])
      this.setupProjectile(projectile, projectiles, 700, true)
    } else {
      // Level 2 - Powerful piercing arrow with energy trail
      this.createMuzzleFlash(20, 0xFF00FF)
      const arrow = this.scene.add.triangle(0, 0, -16, 0, 16, -6, 16, 6, 0xFF00FF)
      const arrowTip = this.scene.add.circle(16, 0, 6, 0xFFFFFF)
      const glow = this.scene.add.circle(0, 0, 20, 0xFF00FF, 0.5)
      const trail = this.scene.add.rectangle(-8, 0, 12, 3, 0xFF00FF, 0.6)
      projectile.add([glow, trail, arrow, arrowTip])

      // Add sparkle trail
      this.scene.tweens.add({
        targets: trail,
        alpha: { from: 0.6, to: 0 },
        scaleX: { from: 1, to: 0.5 },
        duration: 200,
        repeat: -1
      })

      this.setupProjectile(projectile, projectiles, 800, true)
    }
  }

  // 2. Ambitious Angel - Fast energy bolt
  private fireEnergyBolt(projectiles: Phaser.GameObjects.Group) {
    if (this.level === 0) {
      // Base energy bolt
      this.createMuzzleFlash(12, 0xFF5722)
      const projectile = this.scene.add.container(this.x, this.y)
      const bolt = this.scene.add.star(0, 0, 4, 3, 8, 0xFF5722)
      const glow = this.scene.add.circle(0, 0, 10, 0xFF5722, 0.4)
      projectile.add([glow, bolt])
      this.setupProjectile(projectile, projectiles, 700, true)
    } else if (this.level === 1) {
      // Level 1 - Bigger holy bolt with white glow
      this.createMuzzleFlash(16, 0xFFFFFF)
      const projectile = this.scene.add.container(this.x, this.y)
      const bolt = this.scene.add.star(0, 0, 5, 4, 10, 0xFFFFFF)
      const glow = this.scene.add.circle(0, 0, 14, 0xFFFFFF, 0.5)
      const innerGlow = this.scene.add.circle(0, 0, 8, 0xFFFF00, 0.6)
      projectile.add([glow, innerGlow, bolt])
      this.setupProjectile(projectile, projectiles, 750, true)
    } else {
      // Level 2 - Divine energy burst (shoots 2 bolts)
      this.createMuzzleFlash(20, 0xFF00FF)

      for (let i = 0; i < 2; i++) {
        const angle = (i - 0.5) * 0.2
        const proj = this.scene.add.container(this.x, this.y)
        const bolt = this.scene.add.star(0, 0, 6, 5, 12, 0xFF00FF)
        const glow = this.scene.add.circle(0, 0, 18, 0xFF00FF, 0.6)
        const sparkle = this.scene.add.star(0, 0, 4, 2, 4, 0xFFFFFF)
        proj.add([glow, bolt, sparkle])

        this.scene.tweens.add({
          targets: sparkle,
          angle: 360,
          duration: 500,
          repeat: -1
        })

        this.setupProjectile(proj, projectiles, 800, true, angle)
      }
    }
  }

  // 3. Motivated Monster - Heavy rock
  private fireRock(projectiles: Phaser.GameObjects.Group) {
    // Trigger throw animation for Motivated Monster sprite
    if (this.monsterSprite) {
      const throwAnim = this.currentDirection === 'back' ? 'monster-throw-back' :
                        this.currentDirection === 'right' ? 'monster-throw-right' :
                        'monster-throw-front'

      this.monsterSprite.play(throwAnim)

      // Maintain proper Y position and origin during throw animation
      this.monsterSprite.setOrigin(0.5, 0.5)
      this.monsterSprite.y = -5

      // Return to idle after throw animation
      this.monsterSprite.once('animationcomplete', () => {
        const idleAnim = this.currentDirection === 'back' ? 'monster-idle-back' :
                         this.currentDirection === 'right' ? 'monster-idle-right' :
                         'monster-idle-front'
        this.monsterSprite?.play(idleAnim)
      })
    }

    // Trigger throw animation for Empathy Elephant sprite
    if (this.elephantSprite) {
      const throwAnim = this.currentDirection === 'back' ? 'elephant-throw-back' :
                        this.currentDirection === 'right' ? 'elephant-throw-right' :
                        'elephant-throw-front'

      this.elephantSprite.play(throwAnim)

      // Maintain proper Y position and origin during throw animation
      this.elephantSprite.setOrigin(0.5, 0.5)
      this.elephantSprite.y = -5

      // Return to idle after throw animation
      this.elephantSprite.once('animationcomplete', () => {
        const idleAnim = this.currentDirection === 'back' ? 'elephant-idle-back' :
                         this.currentDirection === 'right' ? 'elephant-idle-right' :
                         'elephant-idle-front'
        this.elephantSprite?.play(idleAnim)
      })
    }

    // Trigger throw animation for Fearless Fairy sprite
    if (this.fairySprite) {
      const throwAnim = this.currentDirection === 'back' ? 'fairy-throw-back' :
                        this.currentDirection === 'right' ? 'fairy-throw-right' :
                        'fairy-throw-front'

      this.fairySprite.play(throwAnim)

      // Maintain proper Y position and origin during throw animation
      this.fairySprite.setOrigin(0.5, 0.5)
      this.fairySprite.y = -5

      // Return to idle after throw animation
      this.fairySprite.once('animationcomplete', () => {
        const idleAnim = this.currentDirection === 'back' ? 'fairy-idle-back' :
                         this.currentDirection === 'right' ? 'fairy-idle-right' :
                         'fairy-idle-front'
        this.fairySprite?.play(idleAnim)
      })
    }

    const projectile = this.scene.add.container(this.x, this.y)

    if (this.level === 0) {
      // Base rock
      this.createMuzzleFlash(15, 0x4CAF50)
      const rock = this.scene.add.circle(0, 0, 8, 0x4CAF50)
      rock.setStrokeStyle(2, 0x2E7D32)
      const crack1 = this.scene.add.rectangle(-3, 0, 6, 2, 0x2E7D32)
      const crack2 = this.scene.add.rectangle(3, 0, 6, 2, 0x2E7D32)
      crack2.setRotation(Math.PI / 2)
      projectile.add([rock, crack1, crack2])
      this.setupProjectile(projectile, projectiles, 400, false)
    } else if (this.level === 1) {
      // Level 1 - Spiked boulder
      this.createMuzzleFlash(18, 0x66BB6A)
      const rock = this.scene.add.circle(0, 0, 11, 0x66BB6A)
      rock.setStrokeStyle(3, 0x2E7D32)
      // Add spikes
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6
        const spike = this.scene.add.triangle(
          Math.cos(angle) * 11,
          Math.sin(angle) * 11,
          -2, 0, 2, 0, 0, -6,
          0x2E7D32
        )
        spike.setRotation(angle - Math.PI / 2)
        projectile.add(spike)
      }
      projectile.add(rock)
      this.setupProjectile(projectile, projectiles, 350, false)
    } else {
      // Level 2 - Massive flaming boulder
      this.createMuzzleFlash(25, 0xFF4500)
      const rock = this.scene.add.circle(0, 0, 15, 0x8B4513)
      rock.setStrokeStyle(4, 0x654321)
      const fireGlow = this.scene.add.circle(0, 0, 20, 0xFF4500, 0.5)
      projectile.add([fireGlow, rock])

      // Add fire particles
      for (let i = 0; i < 4; i++) {
        const flame = this.scene.add.circle(
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 15,
          3,
          0xFF6600,
          0.8
        )
        projectile.add(flame)
        this.scene.tweens.add({
          targets: flame,
          alpha: { from: 0.8, to: 0.2 },
          scale: { from: 1, to: 1.5 },
          duration: 300,
          yoyo: true,
          repeat: -1,
          delay: i * 100
        })
      }

      this.setupProjectile(projectile, projectiles, 300, false)
    }
  }

  // 4. Dialed In Dog - Rapid bullet
  private fireBullet(projectiles: Phaser.GameObjects.Group) {
    const projectile = this.scene.add.container(this.x, this.y)

    if (this.level === 0) {
      // Base bullet
      this.createMuzzleFlash(8, 0x9E9E9E)
      const bullet = this.scene.add.ellipse(0, 0, 8, 4, 0xFFFF00)
      bullet.setStrokeStyle(1, 0xFF6600)
      projectile.add(bullet)
      this.setupProjectile(projectile, projectiles, 800, true)
    } else if (this.level === 1) {
      // Level 1 - Enhanced bullets with trail
      this.createMuzzleFlash(12, 0xFFD700)
      const bullet = this.scene.add.ellipse(0, 0, 10, 5, 0xFFD700)
      bullet.setStrokeStyle(2, 0xFF9800)
      const glow = this.scene.add.circle(0, 0, 8, 0xFFFF00, 0.4)
      projectile.add([glow, bullet])
      this.setupProjectile(projectile, projectiles, 850, true)
    } else {
      // Level 2 - Explosive rounds with sparks
      this.createMuzzleFlash(16, 0xFF00FF)
      const bullet = this.scene.add.ellipse(0, 0, 12, 6, 0xFF00FF)
      bullet.setStrokeStyle(3, 0xFFFFFF)
      const glow = this.scene.add.circle(0, 0, 12, 0xFF00FF, 0.5)
      const core = this.scene.add.circle(0, 0, 4, 0xFFFFFF)
      projectile.add([glow, bullet, core])

      // Add sparks
      for (let i = 0; i < 2; i++) {
        const spark = this.scene.add.circle((i - 0.5) * 8, 0, 2, 0xFFFF00)
        projectile.add(spark)
        this.scene.tweens.add({
          targets: spark,
          alpha: { from: 1, to: 0.3 },
          duration: 150,
          yoyo: true,
          repeat: -1
        })
      }

      this.setupProjectile(projectile, projectiles, 900, true)
    }
  }

  // 5. Empathy Elephant - Sniper shot
  private fireSniperShot(projectiles: Phaser.GameObjects.Group) {
    const projectile = this.scene.add.container(this.x, this.y)

    if (this.level === 0) {
      // Base sniper beam
      this.createMuzzleFlash(20, 0x2196F3)
      const beam = this.scene.add.rectangle(0, 0, 15, 3, 0x00FFFF)
      const glow = this.scene.add.rectangle(0, 0, 15, 6, 0x2196F3, 0.5)
      projectile.add([glow, beam])
      this.setupProjectile(projectile, projectiles, 900, true)
    } else if (this.level === 1) {
      // Level 1 - Enhanced precision shot
      this.createMuzzleFlash(25, 0x00FFFF)
      const beam = this.scene.add.rectangle(0, 0, 20, 4, 0x00FFFF)
      const glow = this.scene.add.rectangle(0, 0, 20, 8, 0x00FFFF, 0.6)
      const core = this.scene.add.rectangle(0, 0, 15, 2, 0xFFFFFF)
      projectile.add([glow, beam, core])
      this.setupProjectile(projectile, projectiles, 950, true)
    } else {
      // Level 2 - Devastating railgun shot
      this.createMuzzleFlash(35, 0xFF00FF)
      const beam = this.scene.add.rectangle(0, 0, 30, 6, 0xFF00FF)
      const outerGlow = this.scene.add.rectangle(0, 0, 35, 12, 0xFF00FF, 0.4)
      const innerGlow = this.scene.add.rectangle(0, 0, 30, 8, 0xFFFFFF, 0.7)
      const core = this.scene.add.rectangle(0, 0, 25, 3, 0xFFFFFF)

      projectile.add([outerGlow, innerGlow, beam, core])

      // Add electric particles
      for (let i = 0; i < 3; i++) {
        const spark = this.scene.add.circle(
          (i - 1) * 8,
          (Math.random() - 0.5) * 8,
          2,
          0x00FFFF
        )
        projectile.add(spark)
        this.scene.tweens.add({
          targets: spark,
          alpha: { from: 1, to: 0 },
          y: spark.y + (Math.random() - 0.5) * 10,
          duration: 200,
          repeat: -1
        })
      }

      this.setupProjectile(projectile, projectiles, 1000, true)
    }
  }

  // 6. Adaptable Alien - Alien plasma
  private firePlasma(projectiles: Phaser.GameObjects.Group) {
    const projectile = this.scene.add.container(this.x, this.y)

    if (this.level === 0) {
      // Base plasma
      this.createMuzzleFlash(10, 0xE91E63)
      const plasma = this.scene.add.star(0, 0, 5, 5, 10, 0xE91E63)
      const core = this.scene.add.circle(0, 0, 4, 0xFF00FF, 0.8)
      projectile.add([plasma, core])

      this.scene.tweens.add({
        targets: projectile,
        angle: 360,
        duration: 500,
        repeat: -1
      })

      this.setupProjectile(projectile, projectiles, 650, true)
    } else if (this.level === 1) {
      // Level 1 - Charged plasma with glow
      this.createMuzzleFlash(14, 0xFF00FF)
      const plasma = this.scene.add.star(0, 0, 6, 6, 12, 0xFF00FF)
      const glow = this.scene.add.circle(0, 0, 12, 0xFF00FF, 0.5)
      const core = this.scene.add.circle(0, 0, 5, 0x00FF00, 0.9)
      projectile.add([glow, plasma, core])

      this.scene.tweens.add({
        targets: projectile,
        angle: 360,
        duration: 400,
        repeat: -1
      })

      this.setupProjectile(projectile, projectiles, 700, true)
    } else {
      // Level 2 - Unstable plasma burst
      this.createMuzzleFlash(18, 0x00FFFF)
      const plasma = this.scene.add.star(0, 0, 8, 8, 16, 0x00FFFF)
      const outerGlow = this.scene.add.circle(0, 0, 18, 0xFF00FF, 0.4)
      const innerGlow = this.scene.add.circle(0, 0, 12, 0x00FFFF, 0.6)
      const core = this.scene.add.circle(0, 0, 6, 0xFFFFFF)
      projectile.add([outerGlow, innerGlow, plasma, core])

      this.scene.tweens.add({
        targets: projectile,
        angle: 360,
        duration: 300,
        repeat: -1
      })

      this.scene.tweens.add({
        targets: outerGlow,
        scale: { from: 1, to: 1.3 },
        alpha: { from: 0.4, to: 0.1 },
        duration: 200,
        yoyo: true,
        repeat: -1
      })

      this.setupProjectile(projectile, projectiles, 750, true)
    }
  }

  // 7. Fearless Fairy - Magic sparkles
  private fireMagicSparkle(projectiles: Phaser.GameObjects.Group) {
    const projectile = this.scene.add.container(this.x, this.y)

    if (this.level === 0) {
      // Base magic sparkle
      this.createMuzzleFlash(15, 0xFFEB3B)
      const sparkle1 = this.scene.add.star(0, 0, 4, 3, 8, 0xFFEB3B)
      const sparkle2 = this.scene.add.star(0, 0, 4, 5, 10, 0xFFFFFF, 0.5)
      sparkle2.setRotation(Math.PI / 4)
      const glow = this.scene.add.circle(0, 0, 12, 0xFFEB3B, 0.3)
      projectile.add([glow, sparkle2, sparkle1])

      this.scene.tweens.add({
        targets: [sparkle1, sparkle2],
        scale: { from: 1, to: 1.5 },
        duration: 200,
        yoyo: true,
        repeat: -1
      })

      this.setupProjectile(projectile, projectiles, 550, true)
    } else if (this.level === 1) {
      // Level 1 - Enhanced magic with multiple stars
      this.createMuzzleFlash(18, 0xFFD700)
      const sparkle1 = this.scene.add.star(0, 0, 5, 4, 10, 0xFFD700)
      const sparkle2 = this.scene.add.star(0, 0, 5, 6, 12, 0xFFFFFF, 0.6)
      sparkle2.setRotation(Math.PI / 4)
      const glow = this.scene.add.circle(0, 0, 16, 0xFFD700, 0.4)
      projectile.add([glow, sparkle2, sparkle1])

      this.scene.tweens.add({
        targets: [sparkle1, sparkle2],
        scale: { from: 1, to: 1.6 },
        angle: { from: 0, to: 180 },
        duration: 200,
        yoyo: true,
        repeat: -1
      })

      this.setupProjectile(projectile, projectiles, 600, true)
    } else {
      // Level 2 - Powerful fairy nova
      this.createMuzzleFlash(22, 0xFF00FF)
      const sparkle1 = this.scene.add.star(0, 0, 6, 5, 12, 0xFF00FF)
      const sparkle2 = this.scene.add.star(0, 0, 6, 7, 14, 0xFFFFFF, 0.7)
      sparkle2.setRotation(Math.PI / 4)
      const outerGlow = this.scene.add.circle(0, 0, 20, 0xFF00FF, 0.3)
      const innerGlow = this.scene.add.circle(0, 0, 14, 0xFFFFFF, 0.5)
      projectile.add([outerGlow, innerGlow, sparkle2, sparkle1])

      // Add orbiting particles
      for (let i = 0; i < 3; i++) {
        const angle = (Math.PI * 2 * i) / 3
        const orb = this.scene.add.star(
          Math.cos(angle) * 10,
          Math.sin(angle) * 10,
          4, 2, 4, 0xFFFF00
        )
        projectile.add(orb)
        this.scene.tweens.add({
          targets: orb,
          angle: 360,
          duration: 500,
          repeat: -1
        })
      }

      this.scene.tweens.add({
        targets: [sparkle1, sparkle2],
        scale: { from: 1, to: 1.7 },
        angle: { from: 0, to: 180 },
        duration: 180,
        yoyo: true,
        repeat: -1
      })

      this.setupProjectile(projectile, projectiles, 650, true)
    }
  }

  // 8. Patient Panda - Heavy strike
  private fireHeavyStrike(projectiles: Phaser.GameObjects.Group) {
    const projectile = this.scene.add.container(this.x, this.y)

    if (this.level === 0) {
      // Base heavy strike
      this.createMuzzleFlash(18, 0x009688)
      const strike = this.scene.add.circle(0, 0, 10, 0x009688)
      strike.setStrokeStyle(3, 0x004D40)
      const inner = this.scene.add.circle(0, 0, 5, 0x004D40)
      projectile.add([strike, inner])
      this.setupProjectile(projectile, projectiles, 350, false)
    } else if (this.level === 1) {
      // Level 1 - Empowered strike with ring
      this.createMuzzleFlash(22, 0x00BCD4)
      const strike = this.scene.add.circle(0, 0, 13, 0x00BCD4)
      strike.setStrokeStyle(4, 0x004D40)
      const ring = this.scene.add.circle(0, 0, 18, 0x00BCD4, 0)
      ring.setStrokeStyle(3, 0x00BCD4, 0.6)
      const inner = this.scene.add.circle(0, 0, 7, 0xFFFFFF, 0.8)
      projectile.add([ring, strike, inner])

      this.scene.tweens.add({
        targets: ring,
        scale: { from: 0.8, to: 1.2 },
        alpha: { from: 0.6, to: 0.2 },
        duration: 300,
        repeat: -1
      })

      this.setupProjectile(projectile, projectiles, 320, false)
    } else {
      // Level 2 - Devastating impact
      this.createMuzzleFlash(28, 0xFF00FF)
      const strike = this.scene.add.circle(0, 0, 16, 0xFF00FF)
      strike.setStrokeStyle(5, 0xFFFFFF)
      const outerRing = this.scene.add.circle(0, 0, 24, 0xFF00FF, 0)
      outerRing.setStrokeStyle(4, 0xFF00FF, 0.5)
      const innerRing = this.scene.add.circle(0, 0, 20, 0xFFFFFF, 0)
      innerRing.setStrokeStyle(3, 0xFFFFFF, 0.7)
      const core = this.scene.add.circle(0, 0, 10, 0xFFFFFF)
      projectile.add([outerRing, innerRing, strike, core])

      this.scene.tweens.add({
        targets: [outerRing, innerRing],
        scale: { from: 0.7, to: 1.3 },
        alpha: { from: 0.7, to: 0.1 },
        duration: 250,
        repeat: -1
      })

      this.setupProjectile(projectile, projectiles, 300, false)
    }
  }

  // 9. Brave Bison - Charging energy
  private fireChargeShot(projectiles: Phaser.GameObjects.Group) {
    const projectile = this.scene.add.container(this.x, this.y)

    if (this.level === 0) {
      // Base charge shot
      this.createMuzzleFlash(15, 0xFF9800)
      const charge1 = this.scene.add.circle(0, 0, 8, 0xFF9800)
      const charge2 = this.scene.add.circle(0, 0, 12, 0xFFAA00, 0.4)
      const charge3 = this.scene.add.circle(0, 0, 16, 0xFF6600, 0.2)
      projectile.add([charge3, charge2, charge1])

      this.scene.tweens.add({
        targets: [charge2, charge3],
        scale: { from: 1, to: 1.3 },
        alpha: { from: 0.4, to: 0 },
        duration: 300,
        repeat: -1
      })

      this.setupProjectile(projectile, projectiles, 600, true)
    } else if (this.level === 1) {
      // Level 1 - Enhanced charge with lightning
      this.createMuzzleFlash(18, 0xFFD700)
      const charge1 = this.scene.add.circle(0, 0, 10, 0xFFD700)
      const charge2 = this.scene.add.circle(0, 0, 14, 0xFFFF00, 0.5)
      const charge3 = this.scene.add.circle(0, 0, 18, 0xFFAA00, 0.3)
      projectile.add([charge3, charge2, charge1])

      // Add electric sparks
      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI * 2 * i) / 4
        const spark = this.scene.add.circle(
          Math.cos(angle) * 12,
          Math.sin(angle) * 12,
          2, 0xFFFFFF
        )
        projectile.add(spark)
        this.scene.tweens.add({
          targets: spark,
          alpha: { from: 1, to: 0.2 },
          duration: 200,
          yoyo: true,
          repeat: -1,
          delay: i * 50
        })
      }

      this.scene.tweens.add({
        targets: [charge2, charge3],
        scale: { from: 1, to: 1.4 },
        alpha: { from: 0.5, to: 0.1 },
        duration: 250,
        repeat: -1
      })

      this.setupProjectile(projectile, projectiles, 650, true)
    } else {
      // Level 2 - Thunderous charge
      this.createMuzzleFlash(22, 0xFF00FF)
      const charge1 = this.scene.add.circle(0, 0, 12, 0xFF00FF)
      const charge2 = this.scene.add.circle(0, 0, 16, 0xFFFFFF, 0.6)
      const charge3 = this.scene.add.circle(0, 0, 20, 0xFF00FF, 0.4)
      const core = this.scene.add.circle(0, 0, 6, 0xFFFFFF)
      projectile.add([charge3, charge2, charge1, core])

      // Add electric arcs
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6
        const arc = this.scene.add.circle(
          Math.cos(angle) * 14,
          Math.sin(angle) * 14,
          3, 0x00FFFF
        )
        projectile.add(arc)
        this.scene.tweens.add({
          targets: arc,
          alpha: { from: 1, to: 0 },
          scale: { from: 1, to: 1.5 },
          duration: 180,
          yoyo: true,
          repeat: -1,
          delay: i * 30
        })
      }

      this.scene.tweens.add({
        targets: [charge2, charge3],
        scale: { from: 1, to: 1.5 },
        alpha: { from: 0.6, to: 0.1 },
        duration: 200,
        repeat: -1
      })

      this.setupProjectile(projectile, projectiles, 700, true)
    }
  }

  // 10. Driven Dragon - FIRE BREATH!
  private fireFlames(projectiles: Phaser.GameObjects.Group) {
    this.createMuzzleFlash(20, 0xFF4500)

    // Create multiple fire particles
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const projectile = this.scene.add.container(this.x, this.y)

        const flame = this.scene.add.circle(0, 0, 8 + Math.random() * 4,
          Phaser.Math.Between(0, 1) ? 0xFF4500 : 0xFF6600)
        const glow = this.scene.add.circle(0, 0, 15, 0xFFAA00, 0.6)
        projectile.add([glow, flame])

        // Flickering animation
        this.scene.tweens.add({
          targets: flame,
          scale: { from: 1, to: 0.7 },
          alpha: { from: 1, to: 0.8 },
          duration: 100,
          yoyo: true,
          repeat: -1
        })

        this.setupProjectile(projectile, projectiles, 500, true, i * 5)
      }, i * 50)
    }
  }

  // 11. Balanced Beetle - Energy orb
  private fireEnergyOrb(projectiles: Phaser.GameObjects.Group) {
    this.createMuzzleFlash(12, 0x8BC34A)
    const projectile = this.scene.add.container(this.x, this.y)

    const orb = this.scene.add.circle(0, 0, 7, 0x8BC34A)
    const ring1 = this.scene.add.circle(0, 0, 10, 0x689F38, 0)
    ring1.setStrokeStyle(2, 0x689F38, 0.8)
    const ring2 = this.scene.add.circle(0, 0, 13, 0x558B2F, 0)
    ring2.setStrokeStyle(2, 0x558B2F, 0.5)
    projectile.add([ring2, ring1, orb])

    this.setupProjectile(projectile, projectiles, 600, true)
  }

  // 12. Adventurous Astronaut - Cosmic beam
  private fireCosmicBeam(projectiles: Phaser.GameObjects.Group) {
    this.createMuzzleFlash(15, 0x9C27B0)
    const projectile = this.scene.add.container(this.x, this.y)

    const beam = this.scene.add.rectangle(0, 0, 12, 4, 0x9C27B0)
    const star1 = this.scene.add.star(6, 0, 4, 2, 5, 0xFFFFFF, 0.8)
    const star2 = this.scene.add.star(-6, 0, 4, 2, 5, 0xFFFFFF, 0.6)
    const glow = this.scene.add.circle(0, 0, 10, 0x9C27B0, 0.4)
    projectile.add([glow, beam, star1, star2])

    this.setupProjectile(projectile, projectiles, 700, true)
  }

  // 13. Creative Crab - Water bubbles
  private fireWaterBubble(projectiles: Phaser.GameObjects.Group) {
    this.createMuzzleFlash(12, 0x795548)
    const projectile = this.scene.add.container(this.x, this.y)

    const bubble = this.scene.add.circle(0, 0, 8, 0x2196F3, 0.6)
    bubble.setStrokeStyle(2, 0x00FFFF, 0.8)
    const shine = this.scene.add.circle(-3, -3, 3, 0xFFFFFF, 0.7)
    projectile.add([bubble, shine])

    // Wobble animation
    this.scene.tweens.add({
      targets: bubble,
      scaleX: { from: 1, to: 1.1 },
      scaleY: { from: 1, to: 0.9 },
      duration: 300,
      yoyo: true,
      repeat: -1
    })

    this.setupProjectile(projectile, projectiles, 450, true)
  }

  // 14. Competitive Clown - Explosive ball
  private fireExplosiveBall(projectiles: Phaser.GameObjects.Group) {
    this.createMuzzleFlash(15, 0x3F51B5)
    const projectile = this.scene.add.container(this.x, this.y)

    const ball = this.scene.add.circle(0, 0, 9, 0x3F51B5)
    ball.setStrokeStyle(2, 0xFF0000)
    const fuse = this.scene.add.rectangle(0, -10, 2, 8, 0x000000)
    const spark = this.scene.add.circle(0, -14, 3, 0xFFFF00)
    projectile.add([ball, fuse, spark])

    // Spark animation
    this.scene.tweens.add({
      targets: spark,
      alpha: { from: 1, to: 0.3 },
      scale: { from: 1, to: 1.5 },
      duration: 200,
      yoyo: true,
      repeat: -1
    })

    this.setupProjectile(projectile, projectiles, 550, true)
  }

  // 15. Genuine Giraffe - Laser beam
  private fireLaser(projectiles: Phaser.GameObjects.Group) {
    this.createMuzzleFlash(10, 0x000000)
    const projectile = this.scene.add.container(this.x, this.y)

    const laser = this.scene.add.rectangle(0, 0, 20, 2, 0xFF0000)
    const glow1 = this.scene.add.rectangle(0, 0, 20, 4, 0xFF0000, 0.5)
    const glow2 = this.scene.add.rectangle(0, 0, 20, 6, 0xFFAA00, 0.3)
    projectile.add([glow2, glow1, laser])

    this.setupProjectile(projectile, projectiles, 1000, true)
  }

  // 16. Helpful Hippo - Massive fireball
  private fireMassiveFireball(projectiles: Phaser.GameObjects.Group) {
    this.createMuzzleFlash(25, 0xF44336)
    const projectile = this.scene.add.container(this.x, this.y)

    const fireball = this.scene.add.circle(0, 0, 15, 0xF44336)
    const flames1 = this.scene.add.circle(0, 0, 20, 0xFF6600, 0.7)
    const flames2 = this.scene.add.circle(0, 0, 25, 0xFFAA00, 0.4)
    const core = this.scene.add.circle(0, 0, 8, 0xFFFFFF, 0.8)
    projectile.add([flames2, flames1, fireball, core])

    // Intense fire animation
    this.scene.tweens.add({
      targets: [flames1, flames2],
      scale: { from: 1, to: 1.2 },
      alpha: { from: 0.7, to: 0.3 },
      duration: 150,
      yoyo: true,
      repeat: -1
    })

    this.setupProjectile(projectile, projectiles, 450, true)
  }

  // Fallback basic projectile
  private fireBasicProjectile(projectiles: Phaser.GameObjects.Group) {
    this.createMuzzleFlash()
    const projectile = this.scene.add.container(this.x, this.y)

    const projGlow = this.scene.add.circle(0, 0, 8, this.stats.color, 0.4)
    const projCore = this.scene.add.circle(0, 0, 5, 0xffffff)
    projectile.add([projGlow, projCore])

    this.setupProjectile(projectile, projectiles, 500, true)
  }

  private setupProjectile(
    projectile: Phaser.GameObjects.Container,
    projectiles: Phaser.GameObjects.Group,
    speed: number,
    hasTrail: boolean,
    angleOffset: number = 0
  ) {
    projectiles.add(projectile)
    projectile.setDepth(26) // Projectiles above enemies but below UI

    const trail: Phaser.GameObjects.Arc[] = []

    ;(projectile as any).target = this.target
    ;(projectile as any).damage = this.stats.damage
    ;(projectile as any).speed = speed
    ;(projectile as any).trail = trail
    ;(projectile as any).hasTrail = hasTrail

    ;(projectile as any).update = (time: number, delta: number) => {
      const proj = projectile as any

      if (!proj.target || !proj.target.active) {
        proj.trail.forEach((t: any) => t.destroy())
        proj.destroy()
        return
      }

      // Create trail particle
      if (hasTrail && Math.random() > 0.7) {
        const trailParticle = this.scene.add.circle(proj.x, proj.y, 3, this.stats.color, 0.4)
        trailParticle.setDepth(26)
        proj.trail.push(trailParticle)
        this.scene.tweens.add({
          targets: trailParticle,
          alpha: 0,
          scale: 0.5,
          duration: 300,
          onComplete: () => {
            trailParticle.destroy()
            const index = proj.trail.indexOf(trailParticle)
            if (index > -1) proj.trail.splice(index, 1)
          }
        })
      }

      // Move towards target
      const angle = Phaser.Math.Angle.Between(proj.x, proj.y, proj.target.x, proj.target.y) + (angleOffset * Math.PI / 180)
      proj.x += Math.cos(angle) * proj.speed * (delta / 1000)
      proj.y += Math.sin(angle) * proj.speed * (delta / 1000)

      // Rotate projectile to face direction
      proj.setRotation(angle)

      // Check collision
      const dist = Phaser.Math.Distance.Between(proj.x, proj.y, proj.target.x, proj.target.y)
      if (dist < 10) {
        this.createHitEffect(proj.x, proj.y, this.stats.color)
        proj.target.takeDamage(proj.damage)
        proj.trail.forEach((t: any) => t.destroy())
        proj.destroy()
      }
    }
  }

  getSellValue(): number {
    return Math.floor(this.stats.cost * 0.7) // 70% refund
  }
}
