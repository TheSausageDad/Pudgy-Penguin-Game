// Item types
enum ItemType {
  BLUE_FISH = 'blue_fish',
  RED_FISH = 'red_fish',
  GOLDEN_FISH = 'golden_fish',
  TRASH = 'trash',
  HEART = 'heart',
  REVIVE = 'revive',
  SHIELD = 'shield',
  BIRD = 'bird',
  FALLING_BIRD = 'falling_bird',
  MISSILE = 'missile'
}

interface FallingItem extends Phaser.GameObjects.Sprite {
  itemType: ItemType
  velocity: number
  horizontalVelocity?: number
  isSpinning?: boolean
}

export class PudgyGameScene extends Phaser.Scene {
  // Player
  private player!: Phaser.GameObjects.Sprite
  private playerSpeed: number = 400
  private basePlayerSpeed: number = 400
  private waddleTween!: Phaser.Tweens.Tween

  // Controls
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private aKey!: Phaser.Input.Keyboard.Key
  private dKey!: Phaser.Input.Keyboard.Key
  private touchLeft: boolean = false
  private touchRight: boolean = false

  // Game state
  private score: number = 0
  private lives: number = 3
  private hasRevive: boolean = false
  private isInvincible: boolean = false
  private invincibilityTimeLeft: number = 0
  private gameTime: number = 0 // in seconds

  // Frenzy system
  private consecutiveFish: number = 0
  private frenzyProgress: number = 0 // 0-20
  private frenzyMultiplier: number = 1 // 1-5
  private isFrenzyMode: boolean = false
  private frenzyTimeLeft: number = 0

  // Golden fish multiplier
  private goldenMultiplier: number = 1
  private goldenTimeLeft: number = 0

  // Items
  private itemPool!: Phaser.GameObjects.Group
  private activeItems: FallingItem[] = []
  private birds: FallingItem[] = []
  private missiles: FallingItem[] = []

  // Spawning
  private spawnTimer: number = 0
  private currentSpawnInterval: number = 2 // seconds

  // Missile warning system
  private missileWarningActive: boolean = false
  private missileWarningTimer: number = 0
  private missileWarningX: number = 0
  private missileSpawnTimer: number = 0
  private nextMissileSpawn: number = 15 // seconds until first missile
  private warningSignTop!: Phaser.GameObjects.Image

  // UI
  private scoreText!: Phaser.GameObjects.Text
  private livesText!: Phaser.GameObjects.Text
  private heartIcons: Phaser.GameObjects.Image[] = []
  private frenzyBar!: Phaser.GameObjects.Graphics
  private frenzyMultiplierText!: Phaser.GameObjects.Text
  private goldenMultiplierText!: Phaser.GameObjects.Text
  private reviveIcon!: Phaser.GameObjects.Image
  private shieldText!: Phaser.GameObjects.Text
  private frenzyPopup!: Phaser.GameObjects.Text
  private background!: Phaser.GameObjects.Image

  // Game bounds
  private playableLeft: number = 50
  private playableRight: number = 670
  private playableBottom: number = 1020

  // Debug
  private debugGraphics!: Phaser.GameObjects.Graphics

  constructor() {
    super({ key: 'PudgyGameScene' })
  }

  preload() {
    // Load background image
    this.load.image('game_background', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/Background-3EIPuXBlKw45qHiCmeh2PccLohitwr.jpg?y9qA')

    // Load player sprite
    this.load.image('player', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/Penguin-pa081jGQgZll7Q8pPekZuLmbJ71fms.png?8KmQ')

    // Load bird animation frames
    this.load.image('bird_down', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/Bird%20Wings%20down-o11NxDC63bJz45FovR83rXaI63VLgE.png')
    this.load.image('bird_up', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/Bird%20Wings%20Up-VPTGgD0mcodEzgxuG5pGR4SlvbKbAY.png')

    // Load fish sprites
    this.load.image('blue_fish', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/Blue%20Fish-sg15xOysFaz1zmk5kkMJeDCEqC6xOn.png?MSgz')
    this.load.image('red_fish', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/Red%20Fish-F03ziigEosFvisjUrY7Sa3DzGmqD16.png?NZce')
    this.load.image('golden_fish', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/Gold%20Fish-HNiwNVRRu8mbsE2NLMJNGDdyKsAEMu.png?I4n9')

    // Load trash sprites
    this.load.image('trash_red', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/Red%20can-co5Cdw1tnJEPIXbInrcNi5jR5WhHWQ.png?puEM')
    this.load.image('trash_grey', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/Greycan-zxFLkUAUwUIy3TLyGltr0SBsgtNG78.png?hZSN')

    // Load revive sprite
    this.load.image('revive', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/Revive-nb5BBApRBW7vXUxZM81ZtJ2v8zNH7p.png?p8xe')

    // Load shield sprite
    this.load.image('shield', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/Shield-VZ6oLsks0cW74YTVKp4V2cdoTptTAW.png?e3nn')

    // Load heart sprite
    this.load.image('heart', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/Heart%20Icon-fc39joAk7HCFWigWLk58XSNhGBgCnS.png?oUeF')

    // Load shark/missile sprites
    this.load.image('missile', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/Shark-fqx2CahgWiWMW2C7sjxkFNYtKoGDMc.png?tldy')
    this.load.image('shark_warning', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/Shark%20sign-R84ZKLTd6IKWWbNrQxrIEYOtj21VC5.png?G9nf')

    // Load frenzy bar border
    this.load.image('frenzy_border', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/Multi%20Border-oX3r0n1I4iRifgtrMUfRPiXz79cS0w.png?6v2T')
  }

  create() {
    const { width, height } = this.cameras.main

    // Background - scale to cover screen while maintaining aspect ratio
    this.background = this.add.image(width / 2, height / 2, 'game_background')

    // Scale to cover the screen (use larger scale to ensure full coverage)
    const scaleX = width / this.background.width
    const scaleY = height / this.background.height
    const scale = Math.max(scaleX, scaleY)
    this.background.setScale(scale)

    // Create bird animation
    this.anims.create({
      key: 'bird_fly',
      frames: [
        { key: 'bird_down' },
        { key: 'bird_up' }
      ],
      frameRate: 8,
      repeat: -1
    })

    // Create player with placeholder
    this.player = this.add.sprite(width / 2, this.playableBottom - 40, 'player')
    this.player.setDisplaySize(160, 250)

    // Add waddle animation (starts paused)
    this.waddleTween = this.tweens.add({
      targets: this.player,
      rotation: 0.1,
      duration: 300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      paused: true
    })

    // Setup controls
    this.setupControls()

    // Setup item pool
    this.itemPool = this.add.group({
      maxSize: 50,
      createCallback: (item) => {
        const sprite = item as Phaser.GameObjects.Sprite
        sprite.setActive(false).setVisible(false)
      }
    })

    // Setup UI
    this.setupUI()

    // Setup debug graphics
    this.debugGraphics = this.add.graphics()
    this.debugGraphics.lineStyle(2, 0xff0000, 1)

    // Setup warning indicator at top of screen
    this.warningSignTop = this.add.image(0, 170, 'shark_warning')
    this.warningSignTop.setDisplaySize(120, 120)
    this.warningSignTop.setVisible(false)

    // Countdown
    this.startCountdown()
  }

  private setupControls() {
    // Keyboard
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.aKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A)
    this.dKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D)

    // Touch/Mouse
    const { width } = this.cameras.main
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.x < width / 2) {
        this.touchLeft = true
        this.touchRight = false
      } else {
        this.touchRight = true
        this.touchLeft = false
      }
    })

    this.input.on('pointerup', () => {
      this.touchLeft = false
      this.touchRight = false
    })
  }

  private setupUI() {
    const { width } = this.cameras.main

    // Score
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontFamily: '"Rubik Bubbles"',
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    })

    // Lives - create 3 heart icons
    for (let i = 0; i < 3; i++) {
      const heart = this.add.image(20 + (i * 50), 70, 'heart')
      heart.setDisplaySize(45, 45)
      heart.setOrigin(0, 0)
      this.heartIcons.push(heart)
    }

    // Keep text for compatibility (hidden)
    this.livesText = this.add.text(20, 60, '', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    })
    this.livesText.setVisible(false)

    // Frenzy bar border image (proportional scaling) - positioned on right, aligned with score
    const frenzyBorder = this.add.image(width - 350, 5, 'frenzy_border')
    frenzyBorder.setOrigin(0.5, 0) // Top center anchor
    const targetBorderWidth = 400
    const borderScale = targetBorderWidth / frenzyBorder.width
    frenzyBorder.setScale(borderScale)

    // Frenzy bar
    this.frenzyBar = this.add.graphics()

    // Frenzy multiplier - positioned to the right of bar, aligned with score
    this.frenzyMultiplierText = this.add.text(width - 140, 5, '1x', {
      fontFamily: '"Rubik Bubbles"',
      fontSize: '32px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 4
    })
    this.frenzyMultiplierText.setOrigin(1, 0)

    // Golden multiplier (shown when active)
    this.goldenMultiplierText = this.add.text(width / 2, 180, '', {
      fontFamily: '"Rubik Bubbles"',
      fontSize: '28px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 3
    })
    this.goldenMultiplierText.setOrigin(0.5)

    // Revive icon (hidden initially)
    this.reviveIcon = this.add.image(width - 20, 75, 'revive')
    this.reviveIcon.setDisplaySize(70, 70)
    this.reviveIcon.setOrigin(1, 0)
    this.reviveIcon.setVisible(false)

    // Shield timer text (hidden initially)
    this.shieldText = this.add.text(width / 2, 220, '', {
      fontFamily: '"Rubik Bubbles"',
      fontSize: '28px',
      color: '#00FFFF',
      stroke: '#000000',
      strokeThickness: 3
    })
    this.shieldText.setOrigin(0.5)

    // Frenzy popup (hidden initially)
    this.frenzyPopup = this.add.text(width / 2, 400, 'FRENZY MODE!!', {
      fontFamily: '"Rubik Bubbles"',
      fontSize: '64px',
      color: '#FFD700',
      stroke: '#FF0000',
      strokeThickness: 8
    })
    this.frenzyPopup.setOrigin(0.5)
    this.frenzyPopup.setVisible(false)
  }

  private startCountdown() {
    const { width, height } = this.cameras.main

    let count = 3
    const countdownText = this.add.text(width / 2, height / 2, '3', {
      fontFamily: '"Rubik Bubbles"',
      fontSize: '128px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 8
    })
    countdownText.setOrigin(0.5)

    const countdownTimer = this.time.addEvent({
      delay: 1000,
      repeat: 2,
      callback: () => {
        count--
        if (count > 0) {
          countdownText.setText(count.toString())
        } else {
          countdownText.setText('GO!')
          this.time.delayedCall(500, () => {
            countdownText.destroy()
            this.startGame()
          })
        }
      }
    })
  }

  private startGame() {
    // Game is now active
  }

  update(time: number, delta: number) {
    const deltaSeconds = delta / 1000

    // Update game time
    this.gameTime += deltaSeconds

    // Update player movement
    this.updatePlayer(deltaSeconds)

    // Update timers
    this.updateTimers(deltaSeconds)

    // Update items
    this.updateItems(deltaSeconds)

    // Check collisions
    this.checkCollisions()

    // Spawn items
    this.updateSpawning(deltaSeconds)

    // Update missile warning system
    this.updateMissileSystem(deltaSeconds)

    // Update missiles
    this.updateMissiles(deltaSeconds)

    // Update UI
    this.updateUI()

    // Draw debug hitboxes
    this.drawDebugHitboxes()
  }

  private drawDebugHitboxes() {
    this.debugGraphics.clear()
    this.debugGraphics.lineStyle(2, 0xff0000, 1)

    // Draw player hitbox
    const playerBounds = this.player.getBounds()
    const margin = playerBounds.width * 0.15
    this.debugGraphics.strokeRect(
      playerBounds.x + margin,
      playerBounds.y + margin,
      playerBounds.width - margin * 2,
      playerBounds.height - margin * 2
    )

    // Draw item hitboxes with appropriate margins (fixed size, ignores rotation)
    this.activeItems.forEach(item => {
      const displayWidth = item.displayWidth
      const displayHeight = item.displayHeight
      let marginPercent = 0.15 // Default margin for all items

      // Add extra margin for trash and birds to show actual collision box
      if (item.itemType === ItemType.TRASH || item.itemType === ItemType.FALLING_BIRD) {
        marginPercent = 0.2
      }

      const itemMargin = displayWidth * marginPercent

      this.debugGraphics.strokeRect(
        item.x - displayWidth / 2 + itemMargin,
        item.y - displayHeight / 2 + itemMargin,
        displayWidth - itemMargin * 2,
        displayHeight - itemMargin * 2
      )
    })

    // Draw bird hitboxes with margin
    this.birds.forEach(bird => {
      const displayWidth = bird.displayWidth
      const displayHeight = bird.displayHeight
      const marginPercent = 0.2 // Same margin as obstacles
      const birdMargin = displayWidth * marginPercent

      this.debugGraphics.strokeRect(
        bird.x - displayWidth / 2 + birdMargin,
        bird.y - displayHeight / 2 + birdMargin,
        displayWidth - birdMargin * 2,
        displayHeight - birdMargin * 2
      )
    })

    // Draw missile hitboxes
    this.missiles.forEach(missile => {
      const displayWidth = missile.displayWidth
      const displayHeight = missile.displayHeight
      const marginPercent = 0.1
      const missileMargin = displayWidth * marginPercent

      this.debugGraphics.strokeRect(
        missile.x - displayWidth / 2 + missileMargin,
        missile.y - displayHeight / 2 + missileMargin,
        displayWidth - missileMargin * 2,
        displayHeight - missileMargin * 2
      )
    })
  }

  private updatePlayer(delta: number) {
    let moveX = 0

    // Keyboard input
    if (this.cursors.left.isDown || this.aKey.isDown || this.touchLeft) {
      moveX = -1
      this.player.setFlipX(true) // Face left
    } else if (this.cursors.right.isDown || this.dKey.isDown || this.touchRight) {
      moveX = 1
      this.player.setFlipX(false) // Face right
    }

    // Control waddle animation based on movement
    if (moveX !== 0) {
      if (!this.waddleTween.isPlaying()) {
        this.waddleTween.play()
      }
    } else {
      if (this.waddleTween.isPlaying()) {
        this.waddleTween.pause()
        // Reset rotation to upright
        this.player.setRotation(0)
      }
    }

    // Apply movement
    const newX = this.player.x + moveX * this.playerSpeed * delta
    this.player.x = Phaser.Math.Clamp(newX, this.playableLeft, this.playableRight)
  }

  private updateTimers(delta: number) {
    // Golden fish multiplier timer
    if (this.goldenTimeLeft > 0) {
      this.goldenTimeLeft -= delta
      if (this.goldenTimeLeft <= 0) {
        this.goldenMultiplier = 1
        this.goldenTimeLeft = 0
      }
    }

    // Frenzy mode timer
    if (this.isFrenzyMode && this.frenzyTimeLeft > 0) {
      this.frenzyTimeLeft -= delta
      if (this.frenzyTimeLeft <= 0) {
        this.endFrenzyMode()
      }
    }

    // Invincibility timer
    if (this.invincibilityTimeLeft > 0) {
      this.invincibilityTimeLeft -= delta
      if (this.invincibilityTimeLeft <= 0) {
        this.invincibilityTimeLeft = 0
        this.isInvincible = false
        this.player.setAlpha(1)
      }
    }
  }

  private updateItems(delta: number) {
    const itemsToRemove: FallingItem[] = []

    // Update active items
    this.activeItems.forEach(item => {
      item.y += item.velocity * delta

      // Spin if marked as spinning
      if (item.isSpinning) {
        item.rotation += 5 * delta
      }

      // Remove if off screen
      if (item.y > this.playableBottom + 50) {
        itemsToRemove.push(item)
      }
    })

    // Update birds (they fly horizontally)
    this.birds.forEach(bird => {
      if (bird.itemType === ItemType.BIRD) {
        bird.x += bird.velocity * delta

        // Remove if off screen
        if (bird.x < -50 || bird.x > this.cameras.main.width + 50) {
          itemsToRemove.push(bird)
          this.birds = this.birds.filter(b => b !== bird)
        }

        // Check if fish hits bird - use fixed hitboxes
        this.activeItems.forEach(item => {
          if ((item.itemType === ItemType.BLUE_FISH ||
               item.itemType === ItemType.RED_FISH ||
               item.itemType === ItemType.GOLDEN_FISH)) {

            // Fixed hitbox for bird
            const birdDisplayWidth = bird.displayWidth
            const birdDisplayHeight = bird.displayHeight
            const birdMargin = birdDisplayWidth * 0.2
            const birdBounds = new Phaser.Geom.Rectangle(
              bird.x - birdDisplayWidth / 2 + birdMargin,
              bird.y - birdDisplayHeight / 2 + birdMargin,
              birdDisplayWidth - birdMargin * 2,
              birdDisplayHeight - birdMargin * 2
            )

            // Fixed hitbox for fish
            const fishDisplayWidth = item.displayWidth
            const fishDisplayHeight = item.displayHeight
            const fishMargin = fishDisplayWidth * 0.15
            const fishBounds = new Phaser.Geom.Rectangle(
              item.x - fishDisplayWidth / 2 + fishMargin,
              item.y - fishDisplayHeight / 2 + fishMargin,
              fishDisplayWidth - fishMargin * 2,
              fishDisplayHeight - fishMargin * 2
            )

            if (Phaser.Geom.Intersects.RectangleToRectangle(fishBounds, birdBounds)) {
              // Fish bounces
              item.isSpinning = true
              item.x += (item.x < bird.x ? -50 : 50) // Bounce away

              // Bird falls
              bird.itemType = ItemType.FALLING_BIRD
              bird.isSpinning = true
              bird.velocity = 200 // Fall velocity
              this.birds = this.birds.filter(b => b !== bird)
              this.activeItems.push(bird)
            }
          }
        })
      }
    })

    // Remove items
    itemsToRemove.forEach(item => {
      this.removeItem(item)
    })
  }

  private checkCollisions() {
    const playerBounds = this.player.getBounds()
    // Make hitbox more forgiving (70% size - tighter)
    const margin = playerBounds.width * 0.15
    const forgivingBounds = new Phaser.Geom.Rectangle(
      playerBounds.x + margin,
      playerBounds.y + margin,
      playerBounds.width - margin * 2,
      playerBounds.height - margin * 2
    )

    this.activeItems.forEach(item => {
      // Use fixed hitbox based on display size (ignores rotation)
      const displayWidth = item.displayWidth
      const displayHeight = item.displayHeight
      let marginPercent = 0.15 // Default margin for all items

      // Extra margin for trash and birds to make hitbox even tighter
      if (item.itemType === ItemType.TRASH || item.itemType === ItemType.FALLING_BIRD) {
        marginPercent = 0.2
      }

      const itemMargin = displayWidth * marginPercent

      // Create fixed rectangle centered on sprite position
      const tightItemBounds = new Phaser.Geom.Rectangle(
        item.x - displayWidth / 2 + itemMargin,
        item.y - displayHeight / 2 + itemMargin,
        displayWidth - itemMargin * 2,
        displayHeight - itemMargin * 2
      )

      if (Phaser.Geom.Intersects.RectangleToRectangle(forgivingBounds, tightItemBounds)) {
        this.collectItem(item)
      }
    })
  }

  private collectItem(item: FallingItem) {
    const itemType = item.itemType

    switch (itemType) {
      case ItemType.BLUE_FISH:
        this.collectFish(10)
        break
      case ItemType.RED_FISH:
        this.collectFish(15)
        break
      case ItemType.GOLDEN_FISH:
        this.collectFish(50)
        this.activateGoldenMultiplier()
        break
      case ItemType.HEART:
        if (this.lives < 3) {
          this.lives++
        } else {
          this.addScore(75)
        }
        break
      case ItemType.REVIVE:
        if (!this.hasRevive) {
          this.hasRevive = true
          this.reviveIcon.setVisible(true)
        } else {
          this.addScore(250)
        }
        break
      case ItemType.SHIELD:
        this.activateShield()
        break
      case ItemType.TRASH:
      case ItemType.FALLING_BIRD:
        if (!this.isInvincible) {
          this.hitObstacle()
        }
        break
    }

    this.removeItem(item)
  }

  private collectFish(points: number) {
    this.addScore(points)

    // Only count fish towards frenzy bar when NOT in frenzy mode
    if (!this.isFrenzyMode) {
      this.consecutiveFish++
      this.frenzyProgress = Math.min(20, this.consecutiveFish)

      // Check if frenzy bar is full
      if (this.frenzyProgress >= 20) {
        this.activateFrenzyMode()
      }
    }
  }

  private hitObstacle() {
    console.log('Hit obstacle! Lives before:', this.lives, 'Score:', this.score)

    // Reset frenzy
    this.consecutiveFish = 0
    this.frenzyProgress = 0
    this.frenzyMultiplier = 1

    // Take damage
    this.lives--
    console.log('Lives after hit:', this.lives)

    // Become invincible temporarily (only if not already shielded)
    if (this.invincibilityTimeLeft === 0) {
      this.isInvincible = true
      this.invincibilityTimeLeft = 1
      this.player.setAlpha(0.5)
    }

    // Check game over
    if (this.lives <= 0) {
      if (this.hasRevive) {
        console.log('Using revive!')
        this.hasRevive = false
        this.lives = 1
        this.reviveIcon.setVisible(false)
      } else {
        console.log('Game Over triggered! Final lives:', this.lives)
        this.gameOver()
      }
    }
  }

  private activateShield() {
    this.isInvincible = true
    this.invincibilityTimeLeft = 5
    this.player.setTint(0x00FFFF) // Cyan tint to show shield
  }

  private activateGoldenMultiplier() {
    this.goldenMultiplier = 3
    this.goldenTimeLeft = 7
  }

  private activateFrenzyMode() {
    this.isFrenzyMode = true
    this.frenzyTimeLeft = 10
    this.consecutiveFish = 0
    this.frenzyProgress = 0
    this.frenzyMultiplier = Math.min(5, this.frenzyMultiplier + 1)

    // Increase player speed
    this.playerSpeed = this.basePlayerSpeed * 1.5

    // Clear ALL items (fish, trash, everything) so only new fast-moving fish spawn
    this.activeItems.forEach(item => {
      this.removeItem(item)
    })
    this.activeItems = []

    // Clear any active birds
    this.birds.forEach(bird => {
      bird.destroy()
    })
    this.birds = []

    // Clear any active sharks
    this.missiles.forEach(missile => {
      missile.destroy()
    })
    this.missiles = []

    // Hide warning signs
    this.warningSignTop.setVisible(false)
    this.missileWarningActive = false

    // Show popup
    this.frenzyPopup.setVisible(true)
    this.time.delayedCall(1000, () => {
      this.frenzyPopup.setVisible(false)
    })
  }

  private endFrenzyMode() {
    this.isFrenzyMode = false
    this.frenzyTimeLeft = 0
    this.playerSpeed = this.basePlayerSpeed
  }

  private addScore(points: number) {
    const totalMultiplier = this.goldenMultiplier * this.frenzyMultiplier
    this.score += points * totalMultiplier
  }

  private updateSpawning(delta: number) {
    // Update spawn interval based on game time - faster ramp up
    const maxDifficulty = 3 * 60 // 3 minutes in seconds
    const difficulty = Math.min(1, this.gameTime / maxDifficulty)
    this.currentSpawnInterval = Phaser.Math.Linear(2, 0.8, difficulty)

    this.spawnTimer += delta
    if (this.spawnTimer >= this.currentSpawnInterval) {
      this.spawnTimer = 0
      this.spawnWave()
    }
  }

  private spawnWave() {
    const { width } = this.cameras.main

    // Determine what items can spawn based on score
    const canSpawnRed = this.score >= 150
    const canSpawnGolden = this.score >= 200
    const canSpawnHearts = this.score >= 250
    const canSpawnShield = this.score >= 500
    const canSpawnRevive = this.score >= 1000

    // Calculate trash percentage based on game time - lower trash spawn
    const maxDifficulty = 3 * 60 // Match spawn difficulty
    const difficulty = Math.min(1, this.gameTime / maxDifficulty)
    const trashPercentage = Phaser.Math.Linear(0.08, 0.30, difficulty) // Reduced from 15-40% to 8-30%

    // Spawn 1-3 items per wave
    const itemCount = this.isFrenzyMode ? Phaser.Math.Between(3, 5) : Phaser.Math.Between(1, 3)

    // Create a diagonal line pattern for this wave (position only, not movement)
    const waveStartX = Phaser.Math.Between(this.playableLeft + 50, this.playableRight - 50)
    const waveDirection = Math.random() < 0.5 ? -1 : 1 // -1 for left, 1 for right
    const horizontalSpacing = 60 * waveDirection // Space between items horizontally

    for (let i = 0; i < itemCount; i++) {
      let itemType: ItemType

      if (this.isFrenzyMode) {
        // Only fish during frenzy
        const fishTypes = [ItemType.BLUE_FISH]
        if (canSpawnRed) fishTypes.push(ItemType.RED_FISH)
        if (canSpawnGolden) fishTypes.push(ItemType.GOLDEN_FISH)
        itemType = Phaser.Utils.Array.GetRandom(fishTypes)
      } else {
        // Determine item type
        const rand = Math.random()
        if (rand < trashPercentage) {
          itemType = ItemType.TRASH
        } else if (rand < trashPercentage + 0.05 && canSpawnHearts) {
          itemType = ItemType.HEART
        } else if (rand < trashPercentage + 0.08 && canSpawnShield) {
          itemType = ItemType.SHIELD
        } else if (rand < trashPercentage + 0.10 && canSpawnRevive) {
          itemType = ItemType.REVIVE
        } else {
          const fishTypes = [ItemType.BLUE_FISH]
          if (canSpawnRed) fishTypes.push(ItemType.RED_FISH)
          if (canSpawnGolden) fishTypes.push(ItemType.GOLDEN_FISH)
          itemType = Phaser.Utils.Array.GetRandom(fishTypes)
        }
      }

      this.spawnItem(itemType, waveStartX + (i * horizontalSpacing), i)
    }

    // Occasionally spawn birds (not during frenzy)
    if (!this.isFrenzyMode && Math.random() < 0.2) {
      this.spawnBird()
    }
  }

  private spawnItem(itemType: ItemType, startX?: number, index?: number) {
    const { width } = this.cameras.main

    // Use provided startX or random position (with margin to keep items fully inside bounds)
    const itemMargin = 50 // Half of item size to keep it fully in bounds
    let x = startX !== undefined ? startX : Phaser.Math.Between(this.playableLeft + itemMargin, this.playableRight - itemMargin)

    // Clamp to playable area with margins
    x = Phaser.Math.Clamp(x, this.playableLeft + itemMargin, this.playableRight - itemMargin)

    // Stagger the spawn vertically so items form a diagonal line
    const y = index !== undefined ? -50 - (index * 100) : -50

    // For trash, randomly select from available trash sprites
    let spriteKey = itemType
    if (itemType === ItemType.TRASH) {
      const trashSprites = ['trash_red', 'trash_grey']
      spriteKey = Phaser.Utils.Array.GetRandom(trashSprites)
    }

    const item = this.add.sprite(x, y, spriteKey) as FallingItem
    item.itemType = itemType
    item.velocity = this.isFrenzyMode ? 400 : 200

    // Smaller size for trash to make hitbox tighter
    if (itemType === ItemType.TRASH) {
      item.setDisplaySize(70, 70)
    } else {
      item.setDisplaySize(85, 85)
    }

    this.activeItems.push(item)
  }

  private spawnBird() {
    const { width } = this.cameras.main
    const startFromLeft = Math.random() < 0.5
    const x = startFromLeft ? -50 : width + 50
    const y = 150 // Near top of screen
    const velocity = startFromLeft ? 100 : -100

    const bird = this.add.sprite(x, y, 'bird_down') as FallingItem
    bird.itemType = ItemType.BIRD
    bird.velocity = velocity
    bird.setDisplaySize(85, 85) // Bigger size for visibility

    // Play flying animation
    bird.play('bird_fly')

    // Flip bird horizontally based on direction
    if (startFromLeft) {
      // Flying left to right - flip horizontally
      bird.setFlipX(true)
    }
    // Flying right to left - no flip needed

    this.birds.push(bird)
  }

  private removeItem(item: FallingItem) {
    this.activeItems = this.activeItems.filter(i => i !== item)
    item.destroy()
  }

  private updateUI() {
    this.scoreText.setText(`Score: ${this.score}`)

    // Update heart icons visibility based on lives
    this.heartIcons.forEach((heart, index) => {
      heart.setVisible(index < this.lives)
    })

    this.frenzyMultiplierText.setText(`${this.frenzyMultiplier}x`)

    // Update frenzy bar
    this.frenzyBar.clear()
    this.frenzyBar.fillStyle(0xFFD700, 1)

    // During frenzy mode, show time remaining; otherwise show progress
    let barWidth: number
    if (this.isFrenzyMode) {
      barWidth = (this.frenzyTimeLeft / 10) * 380 // 10 seconds max
    } else {
      barWidth = (this.frenzyProgress / 20) * 380
    }

    this.frenzyBar.fillRect(this.cameras.main.width - 540, 10, barWidth, 24)

    // Update golden multiplier text
    if (this.goldenTimeLeft > 0) {
      this.goldenMultiplierText.setText(`Golden 3x: ${Math.ceil(this.goldenTimeLeft)}s`)
      this.goldenMultiplierText.setVisible(true)
    } else {
      this.goldenMultiplierText.setVisible(false)
    }

    // Update shield text
    if (this.invincibilityTimeLeft > 1) { // Only show shield timer, not damage invincibility
      this.shieldText.setText(`🛡️ Shield: ${Math.ceil(this.invincibilityTimeLeft)}s`)
      this.shieldText.setVisible(true)
    } else {
      this.shieldText.setVisible(false)
      if (this.invincibilityTimeLeft === 0) {
        this.player.clearTint() // Remove shield tint when it expires
      }
    }
  }

  private updateMissileSystem(delta: number) {
    // Don't spawn missiles until score >= 300
    if (this.score < 300) return

    // Don't spawn sharks during frenzy mode
    if (this.isFrenzyMode) return

    this.missileSpawnTimer += delta

    // Handle active warning
    if (this.missileWarningActive) {
      this.missileWarningTimer -= delta

      // Flash warning indicator
      const flashInterval = 0.2
      const shouldShow = Math.floor(this.missileWarningTimer / flashInterval) % 2 === 0
      this.warningSignTop.setVisible(shouldShow)

      // Spawn missile when warning ends
      if (this.missileWarningTimer <= 0) {
        this.spawnMissile()
        this.missileWarningActive = false
        this.warningSignTop.setVisible(false)

        // Schedule next missile - ramps up with difficulty
        // At low score: 15-20 seconds
        // At high score: 8-12 seconds
        const difficulty = Math.min(1, this.score / 2000)
        const minInterval = Phaser.Math.Linear(15, 8, difficulty)
        const maxInterval = Phaser.Math.Linear(20, 12, difficulty)
        this.nextMissileSpawn = Phaser.Math.Between(minInterval, maxInterval)
        this.missileSpawnTimer = 0
      }
    } else if (this.missileSpawnTimer >= this.nextMissileSpawn) {
      // Start warning
      this.startMissileWarning()
    }
  }

  private startMissileWarning() {
    this.missileWarningActive = true
    this.missileWarningTimer = 1.5 // 1.5 second warning

    // Random X position in playable area (with margin to keep shark fully inside bounds)
    const sharkMargin = 130 // Half of shark width (250px) to keep it fully in bounds
    this.missileWarningX = Phaser.Math.Between(this.playableLeft + sharkMargin, this.playableRight - sharkMargin)

    // Position warning sign at correct X
    this.warningSignTop.x = this.missileWarningX
  }

  private spawnMissile() {
    const startY = -400 // Start above screen (increased for bigger sprite)
    const velocity = 700 // Fast vertical speed!

    const missile = this.add.sprite(this.missileWarningX, startY, 'missile') as FallingItem
    missile.itemType = ItemType.MISSILE
    missile.velocity = velocity
    missile.setDisplaySize(250, 500) // HUGE for maximum visibility

    this.missiles.push(missile)
  }

  private updateMissiles(delta: number) {
    const missilesToRemove: FallingItem[] = []
    const itemsToRemove: FallingItem[] = []

    this.missiles.forEach(missile => {
      missile.y += missile.velocity * delta

      // Remove if off screen (below playable area)
      if (missile.y > this.playableBottom + 100) {
        missilesToRemove.push(missile)
      }

      // Check collision with items (shark eats everything in its path)
      this.activeItems.forEach(item => {
        const missileDisplayWidth = missile.displayWidth
        const missileDisplayHeight = missile.displayHeight
        const missileBounds = new Phaser.Geom.Rectangle(
          missile.x - missileDisplayWidth / 2,
          missile.y - missileDisplayHeight / 2,
          missileDisplayWidth,
          missileDisplayHeight
        )

        const itemDisplayWidth = item.displayWidth
        const itemDisplayHeight = item.displayHeight
        const itemBounds = new Phaser.Geom.Rectangle(
          item.x - itemDisplayWidth / 2,
          item.y - itemDisplayHeight / 2,
          itemDisplayWidth,
          itemDisplayHeight
        )

        if (Phaser.Geom.Intersects.RectangleToRectangle(missileBounds, itemBounds)) {
          if (!itemsToRemove.includes(item)) {
            itemsToRemove.push(item)
          }
        }
      })

      // Check collision with player
      if (!this.isInvincible) {
        const playerBounds = this.player.getBounds()
        const margin = playerBounds.width * 0.15
        const forgivingBounds = new Phaser.Geom.Rectangle(
          playerBounds.x + margin,
          playerBounds.y + margin,
          playerBounds.width - margin * 2,
          playerBounds.height - margin * 2
        )

        const missileDisplayWidth = missile.displayWidth
        const missileDisplayHeight = missile.displayHeight
        const missileMargin = missileDisplayWidth * 0.1
        const missileBounds = new Phaser.Geom.Rectangle(
          missile.x - missileDisplayWidth / 2 + missileMargin,
          missile.y - missileDisplayHeight / 2 + missileMargin,
          missileDisplayWidth - missileMargin * 2,
          missileDisplayHeight - missileMargin * 2
        )

        if (Phaser.Geom.Intersects.RectangleToRectangle(forgivingBounds, missileBounds)) {
          this.hitObstacle()
          missilesToRemove.push(missile)
        }
      }
    })

    // Remove items eaten by shark
    itemsToRemove.forEach(item => {
      this.removeItem(item)
    })

    missilesToRemove.forEach(missile => {
      this.missiles = this.missiles.filter(m => m !== missile)
      missile.destroy()
    })
  }

  private gameOver() {
    // TODO: Integrate with Remix SDK game over
    console.log('Game Over! Final Score:', this.score)

    // For now, restart
    this.time.delayedCall(2000, () => {
      this.scene.start('StartScene')
    })
  }
}
