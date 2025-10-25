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

export class Tower extends Phaser.GameObjects.Container {
  public stats: TowerStats
  public level: number = 0
  public upgradePath: 'pathA' | 'pathB' | 'pathC' | null = null

  private lastFireTime: number = 0
  private rangeCircle: Phaser.GameObjects.Arc
  private towerGraphic: Phaser.GameObjects.Shape
  private target: any = null
  private levelText: Phaser.GameObjects.Text | null = null
  private bodyContainer: Phaser.GameObjects.Container | null = null
  private upgradeEffects: Phaser.GameObjects.GameObject[] = []

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

  private createTowerVisual(scene: Phaser.Scene) {
    // Base shadow
    const shadow = scene.add.ellipse(0, 5, 45, 20, 0x000000, 0.3)
    this.add(shadow)

    // Create character-specific visuals
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
      case 15: this.createGiraffe(scene); break
      case 16: this.createHippo(scene); break
      default: this.createDefaultTower(scene); break
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
    // Create rotating body container
    this.bodyContainer = scene.add.container(0, 0)
    this.add(this.bodyContainer)

    const mainColor = 0x5FD363 // Green
    const darkColor = this.getDarkerColor(mainColor, 50)
    const lightColor = this.getLighterColor(mainColor, 50)
    const furColor = 0x4CAF50 // Medium green for fur
    const clawColor = 0x37474F // Dark gray for claws
    const tongueColor = 0xFF1744 // Red tongue
    const teethColor = 0xF5F5DC // Beige teeth

    // =========================
    // TAIL (behind body) - Furry tail
    // =========================
    const tailParts: Phaser.GameObjects.Shape[] = []

    // Tail segments with fur texture
    for (let i = 0; i < 6; i++) {
      const xPos = 8 + i * 3
      const yPos = 2 + i * 2
      const size = 8 - i * 1.2

      // Tail shadow
      const tailShadow = scene.add.ellipse(xPos + 2, yPos + 1, size + 2, size + 2, 0x000000, 0.3)
      this.bodyContainer.add(tailShadow)

      // Tail segment
      const tailSegment = scene.add.circle(xPos, yPos, size, darkColor)
      this.bodyContainer.add(tailSegment)

      // Fur texture on tail - overlapping circles
      for (let f = 0; f < 4; f++) {
        const angle = (f / 4) * Math.PI * 2
        const furX = xPos + Math.cos(angle) * (size * 0.6)
        const furY = yPos + Math.sin(angle) * (size * 0.6)
        const fur = scene.add.circle(furX, furY, size * 0.4, furColor, 0.6)
        this.bodyContainer.add(fur)
      }

      tailParts.push(tailSegment)
    }

    // Tail tuft
    for (let i = 0; i < 5; i++) {
      const angle = (i - 2) * 0.3
      const tuft = scene.add.ellipse(23 + i * 2, 14, 4, 8, mainColor, 0.8)
      tuft.setRotation(angle + 0.5)
      this.bodyContainer.add(tuft)
    }

    // =========================
    // BACK LEGS (behind body)
    // =========================
    // Back Left Leg
    const backLeftThigh = scene.add.ellipse(-8, 5, 7, 12, darkColor)
    backLeftThigh.setRotation(-0.3)
    this.bodyContainer.add(backLeftThigh)

    const backLeftCalf = scene.add.ellipse(-10, 12, 6, 10, this.getDarkerColor(darkColor, 20))
    backLeftCalf.setRotation(-0.5)
    this.bodyContainer.add(backLeftCalf)

    // Paw
    const backLeftPaw = scene.add.ellipse(-11, 18, 8, 6, darkColor)
    this.bodyContainer.add(backLeftPaw)

    // Claws
    for (let i = 0; i < 4; i++) {
      const claw = scene.add.ellipse(-13 + i * 2, 20, 1.5, 4, clawColor)
      claw.setRotation(0.2)
      this.bodyContainer.add(claw)
    }

    // Back Right Leg
    const backRightThigh = scene.add.ellipse(8, 5, 7, 12, darkColor)
    backRightThigh.setRotation(0.3)
    this.bodyContainer.add(backRightThigh)

    const backRightCalf = scene.add.ellipse(10, 12, 6, 10, this.getDarkerColor(darkColor, 20))
    backRightCalf.setRotation(0.5)
    this.bodyContainer.add(backRightCalf)

    const backRightPaw = scene.add.ellipse(11, 18, 8, 6, darkColor)
    this.bodyContainer.add(backRightPaw)

    for (let i = 0; i < 4; i++) {
      const claw = scene.add.ellipse(9 + i * 2, 20, 1.5, 4, clawColor)
      claw.setRotation(-0.2)
      this.bodyContainer.add(claw)
    }

    // =========================
    // BODY - Muscular beast body with fur texture
    // =========================
    const bodyShadowDeep = scene.add.ellipse(3, 0, 28, 24, 0x000000, 0.3)
    this.bodyContainer.add(bodyShadowDeep)

    const bodyBase = scene.add.ellipse(1, -2, 27, 23, darkColor, 0.9)
    this.bodyContainer.add(bodyBase)

    const body = scene.add.ellipse(0, -3, 26, 22, mainColor)
    body.setStrokeStyle(2, darkColor, 0.8)
    this.bodyContainer.add(body)
    this.towerGraphic = body
    this.characterParts.body = body

    // Fur texture - overlapping circles across body
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        const furX = -10 + col * 6
        const furY = -10 + row * 6
        const furPatch = scene.add.circle(furX, furY, 4, furColor, 0.5)
        this.bodyContainer.add(furPatch)
      }
    }

    // Body highlights
    const bodyHighlight = scene.add.ellipse(-5, -8, 12, 10, lightColor, 0.5)
    this.bodyContainer.add(bodyHighlight)

    const bodySpecular = scene.add.circle(-7, -10, 5, 0xFFFFFF, 0.4)
    this.bodyContainer.add(bodySpecular)

    // =========================
    // FRONT LEGS (in front of body)
    // =========================
    // Front Left Leg
    const frontLeftUpper = scene.add.ellipse(-9, 0, 6, 11, mainColor)
    frontLeftUpper.setRotation(-0.2)
    this.bodyContainer.add(frontLeftUpper)

    const frontLeftLower = scene.add.ellipse(-11, 8, 5, 9, darkColor)
    frontLeftLower.setRotation(-0.3)
    this.bodyContainer.add(frontLeftLower)

    const frontLeftPaw = scene.add.ellipse(-12, 15, 7, 5, this.getDarkerColor(darkColor, 20))
    this.bodyContainer.add(frontLeftPaw)

    // Front paw claws
    for (let i = 0; i < 4; i++) {
      const claw = scene.add.ellipse(-14 + i * 2, 17, 1.5, 4, clawColor)
      this.bodyContainer.add(claw)
    }

    // Front Right Leg
    const frontRightUpper = scene.add.ellipse(9, 0, 6, 11, mainColor)
    frontRightUpper.setRotation(0.2)
    this.bodyContainer.add(frontRightUpper)

    const frontRightLower = scene.add.ellipse(11, 8, 5, 9, darkColor)
    frontRightLower.setRotation(0.3)
    this.bodyContainer.add(frontRightLower)

    const frontRightPaw = scene.add.ellipse(12, 15, 7, 5, this.getDarkerColor(darkColor, 20))
    this.bodyContainer.add(frontRightPaw)

    for (let i = 0; i < 4; i++) {
      const claw = scene.add.ellipse(10 + i * 2, 17, 1.5, 4, clawColor)
      this.bodyContainer.add(claw)
    }

    // =========================
    // NECK
    // =========================
    const neckShadow = scene.add.ellipse(2, -12, 16, 10, 0x000000, 0.3)
    this.bodyContainer.add(neckShadow)

    const neck = scene.add.ellipse(0, -13, 15, 9, mainColor)
    this.bodyContainer.add(neck)

    // Neck fur
    for (let i = 0; i < 3; i++) {
      const furPatch = scene.add.circle(-4 + i * 4, -13, 3, furColor, 0.6)
      this.bodyContainer.add(furPatch)
    }

    // =========================
    // HEAD - Menacing beast head
    // =========================
    const headShadowDeep = scene.add.ellipse(3, -19, 20, 18, 0x000000, 0.3)
    this.bodyContainer.add(headShadowDeep)

    const headDark = scene.add.ellipse(1, -21, 19, 17, darkColor)
    this.bodyContainer.add(headDark)

    const head = scene.add.ellipse(0, -22, 18, 16, mainColor)
    head.setStrokeStyle(2, darkColor, 0.8)
    this.bodyContainer.add(head)
    this.characterParts.head = head

    const headHighlight = scene.add.ellipse(-4, -25, 9, 8, lightColor, 0.5)
    this.bodyContainer.add(headHighlight)

    // =========================
    // EARS - Pointed beast ears
    // =========================
    // Left Ear
    const leftEarShadow = scene.add.triangle(-7, -28, -3, 0, 3, 0, 0, -8, 0x000000, 0.3)
    this.bodyContainer.add(leftEarShadow)

    const leftEar = scene.add.triangle(-8, -30, -3, 0, 3, 0, 0, -8, darkColor)
    leftEar.setStrokeStyle(1, this.getDarkerColor(darkColor, 30))
    this.bodyContainer.add(leftEar)

    const leftEarInner = scene.add.triangle(-8, -30, -2, 0, 2, 0, 0, -5, 0xFF69B4, 0.6)
    this.bodyContainer.add(leftEarInner)

    // Right Ear
    const rightEarShadow = scene.add.triangle(7, -28, -3, 0, 3, 0, 0, -8, 0x000000, 0.3)
    this.bodyContainer.add(rightEarShadow)

    const rightEar = scene.add.triangle(8, -30, -3, 0, 3, 0, 0, -8, darkColor)
    rightEar.setStrokeStyle(1, this.getDarkerColor(darkColor, 30))
    this.bodyContainer.add(rightEar)

    const rightEarInner = scene.add.triangle(8, -30, -2, 0, 2, 0, 0, -5, 0xFF69B4, 0.6)
    this.bodyContainer.add(rightEarInner)

    // =========================
    // HORNS - Large curved horns
    // =========================
    const hornColor = 0x424242

    // Left Horn - curved segments
    for (let i = 0; i < 4; i++) {
      const xPos = -9 - i * 2
      const yPos = -30 + i * 1.5
      const hornSegment = scene.add.ellipse(xPos, yPos, 4 - i * 0.5, 6 - i * 0.8, hornColor)
      hornSegment.setRotation(-0.3 - i * 0.2)
      this.bodyContainer.add(hornSegment)

      const hornHighlight = scene.add.ellipse(xPos - 1, yPos - 1, 2, 3, this.getLighterColor(hornColor, 40), 0.6)
      hornHighlight.setRotation(-0.3 - i * 0.2)
      this.bodyContainer.add(hornHighlight)
    }

    // Right Horn
    for (let i = 0; i < 4; i++) {
      const xPos = 9 + i * 2
      const yPos = -30 + i * 1.5
      const hornSegment = scene.add.ellipse(xPos, yPos, 4 - i * 0.5, 6 - i * 0.8, hornColor)
      hornSegment.setRotation(0.3 + i * 0.2)
      this.bodyContainer.add(hornSegment)

      const hornHighlight = scene.add.ellipse(xPos + 1, yPos - 1, 2, 3, this.getLighterColor(hornColor, 40), 0.6)
      hornHighlight.setRotation(0.3 + i * 0.2)
      this.bodyContainer.add(hornHighlight)
    }

    // =========================
    // SNOUT/MUZZLE
    // =========================
    const snoutShadow = scene.add.ellipse(2, -18, 11, 9, 0x000000, 0.3)
    this.bodyContainer.add(snoutShadow)

    const snout = scene.add.ellipse(0, -19, 10, 8, this.getLighterColor(mainColor, 20))
    this.bodyContainer.add(snout)

    // Nostrils
    const nostrilL = scene.add.ellipse(-2, -18, 2, 3, 0x000000)
    this.bodyContainer.add(nostrilL)

    const nostrilR = scene.add.ellipse(2, -18, 2, 3, 0x000000)
    this.bodyContainer.add(nostrilR)

    // =========================
    // MOUTH - Open with teeth and tongue
    // =========================
    const mouthShadow = scene.add.ellipse(2, -15, 13, 7, 0x000000, 0.4)
    this.bodyContainer.add(mouthShadow)

    const mouthOpen = scene.add.ellipse(0, -16, 12, 6, 0x1A1A1A)
    this.bodyContainer.add(mouthOpen)

    // Tongue
    const tongueShadow = scene.add.ellipse(2, -14, 7, 5, 0x000000, 0.3)
    this.bodyContainer.add(tongueShadow)

    const tongue = scene.add.ellipse(0, -15, 6, 4, tongueColor)
    this.bodyContainer.add(tongue)

    const tongueHighlight = scene.add.ellipse(-1, -15.5, 3, 2, this.getLighterColor(tongueColor, 40), 0.7)
    this.bodyContainer.add(tongueHighlight)

    // Upper Teeth
    for (let i = 0; i < 5; i++) {
      const toothX = -5 + i * 2.5
      const tooth = scene.add.triangle(toothX, -18, -1, 0, 1, 0, 0, 3, teethColor)
      this.bodyContainer.add(tooth)
    }

    // Lower Teeth (fangs)
    const fangL = scene.add.triangle(-4, -16, -1.5, 0, 1.5, 0, 0, -5, teethColor)
    this.bodyContainer.add(fangL)

    const fangR = scene.add.triangle(4, -16, -1.5, 0, 1.5, 0, 0, -5, teethColor)
    this.bodyContainer.add(fangR)

    // =========================
    // EYES - Fierce glowing eyes
    // =========================
    const eyeColor = 0xFFD700 // Gold

    // Left Eye
    const eyeLGlow = scene.add.circle(-5, -22, 5, eyeColor, 0.3)
    this.bodyContainer.add(eyeLGlow)

    const eyeLWhite = scene.add.ellipse(-5, -22, 4.5, 5, 0xFFFFFF)
    this.bodyContainer.add(eyeLWhite)

    const eyeLIris = scene.add.circle(-5, -22, 3, eyeColor)
    this.bodyContainer.add(eyeLIris)

    const eyeLPupil = scene.add.ellipse(-4.5, -22, 2, 2.5, 0x000000)
    this.bodyContainer.add(eyeLPupil)

    const eyeLHighlight = scene.add.circle(-4, -23, 1.2, 0xFFFFFF)
    this.bodyContainer.add(eyeLHighlight)

    // Right Eye
    const eyeRGlow = scene.add.circle(5, -22, 5, eyeColor, 0.3)
    this.bodyContainer.add(eyeRGlow)

    const eyeRWhite = scene.add.ellipse(5, -22, 4.5, 5, 0xFFFFFF)
    this.bodyContainer.add(eyeRWhite)

    const eyeRIris = scene.add.circle(5, -22, 3, eyeColor)
    this.bodyContainer.add(eyeRIris)

    const eyeRPupil = scene.add.ellipse(5.5, -22, 2, 2.5, 0x000000)
    this.bodyContainer.add(eyeRPupil)

    const eyeRHighlight = scene.add.circle(6, -23, 1.2, 0xFFFFFF)
    this.bodyContainer.add(eyeRHighlight)

    this.characterParts.eyes = [eyeLPupil, eyeRPupil]

    // =========================
    // ANIMATIONS
    // =========================
    // Breathing
    scene.tweens.add({
      targets: this.bodyContainer,
      y: this.bodyContainer.y + 2,
      scaleX: { from: 1, to: 1.03 },
      scaleY: { from: 1, to: 1.02 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Tail wagging
    scene.tweens.add({
      targets: tailParts,
      rotation: { from: -0.1, to: 0.1 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Eye glow pulse
    scene.tweens.add({
      targets: [eyeLGlow, eyeRGlow],
      alpha: { from: 0.3, to: 0.6 },
      scale: { from: 1, to: 1.2 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

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
    // Create rotating body container
    this.bodyContainer = scene.add.container(0, 0)
    this.add(this.bodyContainer)

    const mainColor = 0x42A5F5 // Blue
    const darkColor = this.getDarkerColor(mainColor, 50)
    const lightColor = this.getLighterColor(mainColor, 50)
    const tuskColor = 0xF5F5DC // Ivory
    const toeNailColor = 0x616161 // Dark gray

    // =========================
    // TAIL (behind body)
    // =========================
    const tailParts: Phaser.GameObjects.Shape[] = []

    // Tail segments
    for (let i = 0; i < 4; i++) {
      const xPos = 12 + i * 2.5
      const yPos = 3 + i * 1
      const width = 3 - i * 0.5
      const height = 8 - i * 1.5

      const tailSegment = scene.add.ellipse(xPos, yPos, width, height, darkColor)
      this.bodyContainer.add(tailSegment)
      tailParts.push(tailSegment)
    }

    // Tail tuft
    for (let i = 0; i < 4; i++) {
      const tuft = scene.add.ellipse(21 + i, 6 + i * 0.5, 2, 5, this.getDarkerColor(darkColor, 30), 0.8)
      tuft.setRotation((i - 1.5) * 0.3)
      this.bodyContainer.add(tuft)
    }

    // =========================
    // BACK LEGS (behind body)
    // =========================
    // Back Left Leg
    const backLeftUpper = scene.add.ellipse(-8, 4, 8, 13, mainColor)
    this.bodyContainer.add(backLeftUpper)

    const backLeftLower = scene.add.ellipse(-8, 13, 9, 10, darkColor)
    this.bodyContainer.add(backLeftLower)

    const backLeftFoot = scene.add.ellipse(-8, 19, 10, 5, this.getDarkerColor(darkColor, 20))
    this.bodyContainer.add(backLeftFoot)

    // Toes on back left foot
    for (let i = 0; i < 3; i++) {
      const toeNail = scene.add.ellipse(-10 + i * 3, 20, 2, 1.5, toeNailColor)
      this.bodyContainer.add(toeNail)
    }

    // Back Right Leg
    const backRightUpper = scene.add.ellipse(8, 4, 8, 13, mainColor)
    this.bodyContainer.add(backRightUpper)

    const backRightLower = scene.add.ellipse(8, 13, 9, 10, darkColor)
    this.bodyContainer.add(backRightLower)

    const backRightFoot = scene.add.ellipse(8, 19, 10, 5, this.getDarkerColor(darkColor, 20))
    this.bodyContainer.add(backRightFoot)

    for (let i = 0; i < 3; i++) {
      const toeNail = scene.add.ellipse(6 + i * 3, 20, 2, 1.5, toeNailColor)
      this.bodyContainer.add(toeNail)
    }

    // =========================
    // BODY - Large elephant body with textured skin
    // =========================
    const bodyShadowDeep = scene.add.ellipse(3, 0, 30, 26, 0x000000, 0.3)
    this.bodyContainer.add(bodyShadowDeep)

    const bodyBase = scene.add.ellipse(1, -2, 29, 25, darkColor, 0.9)
    this.bodyContainer.add(bodyBase)

    const body = scene.add.ellipse(0, -3, 28, 24, mainColor)
    body.setStrokeStyle(2, darkColor, 0.8)
    this.bodyContainer.add(body)
    this.towerGraphic = body
    this.characterParts.body = body

    // Skin texture - wrinkles and creases
    for (let i = 0; i < 5; i++) {
      const wrinkle = scene.add.ellipse(-8 + i * 4, -8 + i * 2, 12 - i, 3, darkColor, 0.3)
      wrinkle.setRotation(0.1)
      this.bodyContainer.add(wrinkle)
    }

    const bodyHighlight = scene.add.ellipse(-6, -9, 14, 12, lightColor, 0.5)
    this.bodyContainer.add(bodyHighlight)

    const bodySpecular = scene.add.circle(-8, -11, 5, 0xFFFFFF, 0.4)
    this.bodyContainer.add(bodySpecular)

    // =========================
    // FRONT LEGS (in front of body)
    // =========================
    // Front Left Leg
    const frontLeftUpper = scene.add.ellipse(-9, 2, 8, 12, mainColor)
    this.bodyContainer.add(frontLeftUpper)

    const frontLeftLower = scene.add.ellipse(-9, 11, 9, 9, darkColor)
    this.bodyContainer.add(frontLeftLower)

    const frontLeftFoot = scene.add.ellipse(-9, 18, 10, 5, this.getDarkerColor(darkColor, 20))
    this.bodyContainer.add(frontLeftFoot)

    for (let i = 0; i < 3; i++) {
      const toeNail = scene.add.ellipse(-11 + i * 3, 19, 2, 1.5, toeNailColor)
      this.bodyContainer.add(toeNail)
    }

    // Front Right Leg
    const frontRightUpper = scene.add.ellipse(9, 2, 8, 12, mainColor)
    this.bodyContainer.add(frontRightUpper)

    const frontRightLower = scene.add.ellipse(9, 11, 9, 9, darkColor)
    this.bodyContainer.add(frontRightLower)

    const frontRightFoot = scene.add.ellipse(9, 18, 10, 5, this.getDarkerColor(darkColor, 20))
    this.bodyContainer.add(frontRightFoot)

    for (let i = 0; i < 3; i++) {
      const toeNail = scene.add.ellipse(7 + i * 3, 19, 2, 1.5, toeNailColor)
      this.bodyContainer.add(toeNail)
    }

    // =========================
    // HEAD - Large elephant head
    // =========================
    const headShadowDeep = scene.add.circle(3, -16, 15, 0x000000, 0.3)
    this.bodyContainer.add(headShadowDeep)

    const headDark = scene.add.circle(1, -18, 14.5, darkColor)
    this.bodyContainer.add(headDark)

    const head = scene.add.circle(0, -19, 14, mainColor)
    head.setStrokeStyle(2, darkColor, 0.8)
    this.bodyContainer.add(head)
    this.characterParts.head = head

    const headHighlight = scene.add.circle(-4, -22, 7, lightColor, 0.5)
    this.bodyContainer.add(headHighlight)

    // =========================
    // EARS - Large fan-shaped ears
    // =========================
    // Left Ear
    const leftEarShadow = scene.add.ellipse(-17, -16, 16, 23, 0x000000, 0.25)
    this.bodyContainer.add(leftEarShadow)

    const leftEarDark = scene.add.ellipse(-18, -17, 15.5, 22.5, this.getDarkerColor(darkColor, 20))
    this.bodyContainer.add(leftEarDark)

    const leftEar = scene.add.ellipse(-19, -18, 15, 22, darkColor)
    leftEar.setStrokeStyle(2, this.getDarkerColor(darkColor, 30))
    this.bodyContainer.add(leftEar)

    const leftEarInner = scene.add.ellipse(-19, -18, 10, 15, 0xE91E63, 0.4)
    this.bodyContainer.add(leftEarInner)

    const leftEarHighlight = scene.add.ellipse(-21, -21, 8, 12, this.getLighterColor(darkColor, 30), 0.6)
    this.bodyContainer.add(leftEarHighlight)

    // Right Ear
    const rightEarShadow = scene.add.ellipse(17, -16, 16, 23, 0x000000, 0.25)
    this.bodyContainer.add(rightEarShadow)

    const rightEarDark = scene.add.ellipse(18, -17, 15.5, 22.5, this.getDarkerColor(darkColor, 20))
    this.bodyContainer.add(rightEarDark)

    const rightEar = scene.add.ellipse(19, -18, 15, 22, darkColor)
    rightEar.setStrokeStyle(2, this.getDarkerColor(darkColor, 30))
    this.bodyContainer.add(rightEar)

    const rightEarInner = scene.add.ellipse(19, -18, 10, 15, 0xE91E63, 0.4)
    this.bodyContainer.add(rightEarInner)

    const rightEarHighlight = scene.add.ellipse(21, -21, 8, 12, this.getLighterColor(darkColor, 30), 0.6)
    this.bodyContainer.add(rightEarHighlight)

    // =========================
    // TRUNK - Segmented with wrinkles
    // =========================
    const trunkSegments: Phaser.GameObjects.Shape[] = []

    // Trunk starts at head and extends downward
    for (let i = 0; i < 8; i++) {
      const yPos = -13 + i * 2.5
      const xPos = i * 0.5
      const width = 7 - i * 0.3
      const height = 5 - i * 0.2

      // Wrinkle ring
      const wrinkleRing = scene.add.ellipse(xPos + 1, yPos, width + 1, 2, darkColor, 0.5)
      this.bodyContainer.add(wrinkleRing)

      // Trunk segment
      const segmentShadow = scene.add.ellipse(xPos + 1, yPos + 1, width + 1, height + 1, 0x000000, 0.2)
      this.bodyContainer.add(segmentShadow)

      const segment = scene.add.ellipse(xPos, yPos, width, height, mainColor)
      segment.setStrokeStyle(1, darkColor, 0.6)
      this.bodyContainer.add(segment)
      trunkSegments.push(segment)

      const segmentHighlight = scene.add.ellipse(xPos - 1, yPos - 0.5, width - 2, height - 1, lightColor, 0.4)
      this.bodyContainer.add(segmentHighlight)
    }

    // Trunk tip with nostrils
    const trunkTipShadow = scene.add.ellipse(5, 6, 6, 5, 0x000000, 0.3)
    this.bodyContainer.add(trunkTipShadow)

    const trunkTip = scene.add.ellipse(4, 5, 5.5, 4.5, mainColor)
    trunkTip.setStrokeStyle(1, darkColor)
    this.bodyContainer.add(trunkTip)
    trunkSegments.push(trunkTip)

    // Nostrils at trunk tip
    const nostrilL = scene.add.ellipse(3, 5, 1.5, 2, 0x000000)
    this.bodyContainer.add(nostrilL)

    const nostrilR = scene.add.ellipse(5, 5, 1.5, 2, 0x000000)
    this.bodyContainer.add(nostrilR)

    // =========================
    // TUSKS - Curved ivory tusks
    // =========================
    // Left Tusk
    for (let i = 0; i < 3; i++) {
      const xPos = -8 - i * 2
      const yPos = -12 + i * 3
      const tuskSegment = scene.add.ellipse(xPos, yPos, 3 - i * 0.3, 8 - i * 1, tuskColor)
      tuskSegment.setRotation(-0.5 - i * 0.1)
      tuskSegment.setStrokeStyle(1, this.getDarkerColor(tuskColor, 40), 0.8)
      this.bodyContainer.add(tuskSegment)

      const tuskHighlight = scene.add.ellipse(xPos - 0.5, yPos - 1, 1.5, 4, 0xFFFFFF, 0.6)
      tuskHighlight.setRotation(-0.5 - i * 0.1)
      this.bodyContainer.add(tuskHighlight)
    }

    // Right Tusk
    for (let i = 0; i < 3; i++) {
      const xPos = 8 + i * 2
      const yPos = -12 + i * 3
      const tuskSegment = scene.add.ellipse(xPos, yPos, 3 - i * 0.3, 8 - i * 1, tuskColor)
      tuskSegment.setRotation(0.5 + i * 0.1)
      tuskSegment.setStrokeStyle(1, this.getDarkerColor(tuskColor, 40), 0.8)
      this.bodyContainer.add(tuskSegment)

      const tuskHighlight = scene.add.ellipse(xPos + 0.5, yPos - 1, 1.5, 4, 0xFFFFFF, 0.6)
      tuskHighlight.setRotation(0.5 + i * 0.1)
      this.bodyContainer.add(tuskHighlight)
    }

    this.characterParts.accessories = [...trunkSegments, leftEar, rightEar]

    // =========================
    // EYES - Wise, gentle eyes
    // =========================
    // Left Eye
    const eyeLWhite = scene.add.ellipse(-6, -21, 4, 4.5, 0xFFFFFF)
    this.bodyContainer.add(eyeLWhite)

    const eyeLIris = scene.add.circle(-6, -21, 2.5, 0x8B4513)
    this.bodyContainer.add(eyeLIris)

    const eyeLPupil = scene.add.circle(-5.5, -21, 1.5, 0x000000)
    this.bodyContainer.add(eyeLPupil)

    const eyeLHighlight = scene.add.circle(-5, -21.5, 0.8, 0xFFFFFF)
    this.bodyContainer.add(eyeLHighlight)

    // Eyelashes
    for (let i = 0; i < 3; i++) {
      const lash = scene.add.rectangle(-7 + i, -23, 0.5, 2, 0x000000, 0.8)
      lash.setRotation(-0.3 + i * 0.3)
      this.bodyContainer.add(lash)
    }

    // Right Eye
    const eyeRWhite = scene.add.ellipse(6, -21, 4, 4.5, 0xFFFFFF)
    this.bodyContainer.add(eyeRWhite)

    const eyeRIris = scene.add.circle(6, -21, 2.5, 0x8B4513)
    this.bodyContainer.add(eyeRIris)

    const eyeRPupil = scene.add.circle(6.5, -21, 1.5, 0x000000)
    this.bodyContainer.add(eyeRPupil)

    const eyeRHighlight = scene.add.circle(7, -21.5, 0.8, 0xFFFFFF)
    this.bodyContainer.add(eyeRHighlight)

    for (let i = 0; i < 3; i++) {
      const lash = scene.add.rectangle(5 + i, -23, 0.5, 2, 0x000000, 0.8)
      lash.setRotation(-0.3 + i * 0.3)
      this.bodyContainer.add(lash)
    }

    this.characterParts.eyes = [eyeLPupil, eyeRPupil]

    // =========================
    // ANIMATIONS
    // =========================
    // Breathing
    scene.tweens.add({
      targets: this.bodyContainer,
      y: this.bodyContainer.y + 2,
      scaleY: 1.02,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Trunk swaying
    scene.tweens.add({
      targets: trunkSegments,
      x: '+=3',
      rotation: '+=0.05',
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Ear flapping
    scene.tweens.add({
      targets: [leftEar, leftEarInner, leftEarHighlight],
      scaleX: { from: 1, to: 1.05 },
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    scene.tweens.add({
      targets: [rightEar, rightEarInner, rightEarHighlight],
      scaleX: { from: 1, to: 1.05 },
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 300
    })

    // Tail swishing
    scene.tweens.add({
      targets: tailParts,
      rotation: { from: -0.1, to: 0.1 },
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

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

    // BODY - Multi-layered 3D effect
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
      this.bodyContainer.add(bump)
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
  private createFairy(scene: Phaser.Scene) {
    // Create rotating body container
    this.bodyContainer = scene.add.container(0, 0)
    this.add(this.bodyContainer)

    const mainColor = 0xFFEE58
    const darkColor = this.getDarkerColor(mainColor, 50)
    const lightColor = this.getLighterColor(mainColor, 50)
    const wingColor = 0xFFD600

    // BODY - Delicate small body with magical glow
    const bodyShadowDeep = scene.add.circle(3, -6, 10, 0x000000, 0.25)
    this.bodyContainer.add(bodyShadowDeep)

    const bodyBase1 = scene.add.circle(1, -7, 9.5, darkColor, 0.9)
    this.bodyContainer.add(bodyBase1)

    const body = scene.add.circle(0, -8, 10, mainColor)
    body.setStrokeStyle(3, 0x000000, 0.8)
    this.bodyContainer.add(body)
    this.towerGraphic = body
    this.characterParts.body = body

    const bodyHighlight1 = scene.add.circle(-2, -10, 6, lightColor, 0.6)
    this.bodyContainer.add(bodyHighlight1)

    const bodyHighlight2 = scene.add.circle(-3, -11, 4, this.getLighterColor(mainColor, 70), 0.7)
    this.bodyContainer.add(bodyHighlight2)

    const bodySpecular = scene.add.circle(-3.5, -11.5, 2, 0xFFFFFF, 0.8)
    this.bodyContainer.add(bodySpecular)

    // Magical glow around body
    const magicGlow = scene.add.circle(0, -8, 14, mainColor, 0.15)
    this.bodyContainer.add(magicGlow)

    // HEAD - Delicate
    const headShadowDeep = scene.add.circle(2, -19, 7, 0x000000, 0.25)
    this.bodyContainer.add(headShadowDeep)

    const headDark = scene.add.circle(1, -19.5, 6.5, this.getDarkerColor(0xFFE082, 40))
    this.bodyContainer.add(headDark)

    const head = scene.add.circle(0, -20, 7, 0xFFE082)
    head.setStrokeStyle(3, 0x000000, 0.8)
    this.bodyContainer.add(head)
    this.characterParts.head = head

    const headHighlight1 = scene.add.circle(-1.5, -22, 4, this.getLighterColor(0xFFE082, 50), 0.6)
    this.bodyContainer.add(headHighlight1)

    const headSpecular = scene.add.circle(-2, -22.5, 2, 0xFFFFFF, 0.8)
    this.bodyContainer.add(headSpecular)

    // EYES - Sparkling
    const eyeL = scene.add.circle(-2, -20, 1.5, 0x000000)
    this.bodyContainer.add(eyeL)

    const eyeR = scene.add.circle(2, -20, 1.5, 0x000000)
    this.bodyContainer.add(eyeR)

    const eyeLHighlight = scene.add.circle(-1.5, -20.5, 0.7, 0xFFFFFF)
    this.bodyContainer.add(eyeLHighlight)

    const eyeRHighlight = scene.add.circle(2.5, -20.5, 0.7, 0xFFFFFF)
    this.bodyContainer.add(eyeRHighlight)

    this.characterParts.eyes = [eyeL, eyeR]

    // WINGS - Translucent with 4-5 layers and shimmer
    const wingArray: Phaser.GameObjects.Shape[] = []

    // Left Wing - Multi-layered translucent
    const wingLShadow = scene.add.ellipse(-10, -12, 10, 17, 0x000000, 0.15)
    wingLShadow.setRotation(-0.2)
    this.bodyContainer.add(wingLShadow)

    const wingLBase = scene.add.ellipse(-12, -14, 11, 18, this.getDarkerColor(wingColor, 40), 0.3)
    wingLBase.setRotation(-0.2)
    this.bodyContainer.add(wingLBase)

    const wingL1 = scene.add.ellipse(-12, -14, 10, 17, 0xFFFFFF, 0.7)
    wingL1.setStrokeStyle(3, wingColor, 0.9)
    wingL1.setRotation(-0.2)
    this.bodyContainer.add(wingL1)
    wingArray.push(wingL1)

    const wingL2 = scene.add.ellipse(-13, -15, 8, 14, this.getLighterColor(wingColor, 60), 0.5)
    wingL2.setRotation(-0.2)
    this.bodyContainer.add(wingL2)

    const wingL3 = scene.add.ellipse(-14, -16, 6, 11, 0xFFFFFF, 0.6)
    wingL3.setRotation(-0.2)
    this.bodyContainer.add(wingL3)

    const wingLShimmer = scene.add.ellipse(-15, -17, 4, 8, this.getLighterColor(wingColor, 80), 0.7)
    wingLShimmer.setRotation(-0.2)
    this.bodyContainer.add(wingLShimmer)
    wingArray.push(wingLShimmer)

    // Right Wing - Mirror of left
    const wingRShadow = scene.add.ellipse(10, -12, 10, 17, 0x000000, 0.15)
    wingRShadow.setRotation(0.2)
    this.bodyContainer.add(wingRShadow)

    const wingRBase = scene.add.ellipse(12, -14, 11, 18, this.getDarkerColor(wingColor, 40), 0.3)
    wingRBase.setRotation(0.2)
    this.bodyContainer.add(wingRBase)

    const wingR1 = scene.add.ellipse(12, -14, 10, 17, 0xFFFFFF, 0.7)
    wingR1.setStrokeStyle(3, wingColor, 0.9)
    wingR1.setRotation(0.2)
    this.bodyContainer.add(wingR1)
    wingArray.push(wingR1)

    const wingR2 = scene.add.ellipse(13, -15, 8, 14, this.getLighterColor(wingColor, 60), 0.5)
    wingR2.setRotation(0.2)
    this.bodyContainer.add(wingR2)

    const wingR3 = scene.add.ellipse(14, -16, 6, 11, 0xFFFFFF, 0.6)
    wingR3.setRotation(0.2)
    this.bodyContainer.add(wingR3)

    const wingRShimmer = scene.add.ellipse(15, -17, 4, 8, this.getLighterColor(wingColor, 80), 0.7)
    wingRShimmer.setRotation(0.2)
    this.bodyContainer.add(wingRShimmer)
    wingArray.push(wingRShimmer)

    this.characterParts.wings = [wingL1, wingR1]

    // WAND - Magic wand with particle trail effect
    const wandShadow = scene.add.rectangle(13, -9, 3, 14, 0x000000, 0.3)
    wandShadow.setRotation(0.4)
    this.bodyContainer.add(wandShadow)

    const wandBase = scene.add.rectangle(14, -10, 3, 14, this.getDarkerColor(0x8D6E63, 30))
    wandBase.setRotation(0.4)
    this.bodyContainer.add(wandBase)

    const wand = scene.add.rectangle(14, -10, 3, 14, 0x8D6E63)
    wand.setRotation(0.4)
    wand.setStrokeStyle(2, 0x000000, 0.8)
    this.bodyContainer.add(wand)
    this.characterParts.weapon = wand

    const wandHighlight = scene.add.rectangle(13.5, -10, 1.5, 14, 0xA1887F, 0.7)
    wandHighlight.setRotation(0.4)
    this.bodyContainer.add(wandHighlight)

    // Star with multi-layers
    const starShadow = scene.add.star(17, -15, 5, 4, 8, 0x000000, 0.3)
    this.bodyContainer.add(starShadow)

    const starBase = scene.add.star(18, -16, 5, 5, 9, this.getDarkerColor(0xFFFF00, 40))
    this.bodyContainer.add(starBase)

    const star = scene.add.star(18, -16, 5, 4, 8, 0xFFFF00)
    star.setStrokeStyle(2, wingColor, 1)
    this.bodyContainer.add(star)

    const starHighlight = scene.add.star(18, -16, 5, 2, 4, 0xFFFFFF, 0.8)
    this.bodyContainer.add(starHighlight)

    // Magic particles
    const particles: Phaser.GameObjects.Shape[] = []
    for (let i = 0; i < 3; i++) {
      const particle = scene.add.circle(18 + i * 3, -16 - i * 2, 1.5, 0xFFFF00, 0.7)
      this.bodyContainer.add(particle)
      particles.push(particle)
    }

    // IDLE ANIMATIONS - Flutter/hover
    scene.tweens.add({
      targets: this.bodyContainer,
      y: this.bodyContainer.y + 3,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Wing flutter
    scene.tweens.add({
      targets: [wingL1, wingL2, wingL3, wingLShimmer],
      rotation: '-=0.3',
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    scene.tweens.add({
      targets: [wingR1, wingR2, wingR3, wingRShimmer],
      rotation: '+=0.3',
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Star sparkle
    scene.tweens.add({
      targets: [star, starHighlight],
      scaleX: 1.3,
      scaleY: 1.3,
      rotation: '+=3.14',
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Magic glow pulse
    scene.tweens.add({
      targets: magicGlow,
      alpha: 0.3,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Particle trail
    scene.tweens.add({
      targets: particles,
      alpha: 0.2,
      y: '-=5',
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: scene.tweens.stagger(200)
    })

    this.addGlow(scene, 0xFFEE58, 28)
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
      delay: scene.tweens.stagger(100)
    })

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

    // LEGS - Segmented legs (3 circles per leg)
    const legColor = antColor
    const legs: Phaser.GameObjects.Shape[] = []

    for (let i = 0; i < 3; i++) {
      const yPos = -14 + i * 6

      // Left leg with segments
      const legLJoint1 = scene.add.circle(-10, yPos, 2, legColor)
      legLJoint1.setStrokeStyle(1, 0x000000, 0.6)
      this.bodyContainer.add(legLJoint1)

      const legLSeg = scene.add.rectangle(-14, yPos, 10, 3, legColor)
      legLSeg.setRotation(-0.5)
      legLSeg.setStrokeStyle(1, 0x000000, 0.6)
      this.bodyContainer.add(legLSeg)
      legs.push(legLSeg)

      const legLJoint2 = scene.add.circle(-18, yPos + 2, 2, legColor)
      legLJoint2.setStrokeStyle(1, 0x000000, 0.6)
      this.bodyContainer.add(legLJoint2)

      // Right leg with segments
      const legRJoint1 = scene.add.circle(10, yPos, 2, legColor)
      legRJoint1.setStrokeStyle(1, 0x000000, 0.6)
      this.bodyContainer.add(legRJoint1)

      const legRSeg = scene.add.rectangle(14, yPos, 10, 3, legColor)
      legRSeg.setRotation(0.5)
      legRSeg.setStrokeStyle(1, 0x000000, 0.6)
      this.bodyContainer.add(legRSeg)
      legs.push(legRSeg)

      const legRJoint2 = scene.add.circle(18, yPos + 2, 2, legColor)
      legRJoint2.setStrokeStyle(1, 0x000000, 0.6)
      this.bodyContainer.add(legRJoint2)
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
      delay: scene.tweens.stagger(150)
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

    // LEGS - Multiple legs with joints
    const legs: Phaser.GameObjects.Shape[] = []
    const legColor = this.getDarkerColor(shellColor, 50)

    for (let i = 0; i < 3; i++) {
      const yPos = -2 + i * 4

      // Left leg
      const legLJoint = scene.add.circle(-9, yPos, 2, legColor)
      this.bodyContainer.add(legLJoint)

      const legL = scene.add.rectangle(-12, yPos, 10, 3, legColor)
      legL.setStrokeStyle(1, 0x000000, 0.6)
      this.bodyContainer.add(legL)
      legs.push(legL)

      // Right leg
      const legRJoint = scene.add.circle(9, yPos, 2, legColor)
      this.bodyContainer.add(legRJoint)

      const legR = scene.add.rectangle(12, yPos, 10, 3, legColor)
      legR.setStrokeStyle(1, 0x000000, 0.6)
      this.bodyContainer.add(legR)
      legs.push(legR)
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
      this.bodyContainer.add(spotShadow)

      const spotBase = scene.add.circle(spot.x, spot.y, 3.5, this.getDarkerColor(spotColor, 30))
      this.bodyContainer.add(spotBase)

      const s = scene.add.circle(spot.x, spot.y, 3, spotColor)
      s.setStrokeStyle(1, 0x000000, 0.6)
      this.bodyContainer.add(s)
      spotArray.push(s)

      const spotHighlight = scene.add.circle(spot.x - 0.5, spot.y - 0.5, 1.5, this.getLighterColor(spotColor, 40), 0.6)
      this.bodyContainer.add(spotHighlight)
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
      delay: scene.tweens.stagger(100)
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

    this.addGlow(scene, 0xFFEE58, 32)
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
          const hue = tween.getValue()
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

    // Rotate tower body to face target
    if (this.target && this.bodyContainer) {
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

  private fire(projectiles: Phaser.GameObjects.Group) {
    if (!this.target) return

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
      case 15: // Genuine Giraffe - Laser beam
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
