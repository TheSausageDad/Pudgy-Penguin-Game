// Item types
enum ItemType {
  BLUE_FISH = 'blue_fish',
  RED_FISH = 'red_fish',
  GOLDEN_FISH = 'golden_fish',
  TRASH = 'trash',
  HEART = 'heart',
  REVIVE = 'revive',
  BIRD = 'bird',
  FALLING_BIRD = 'falling_bird'
}

interface FallingItem extends Phaser.GameObjects.Sprite {
  itemType: ItemType
  velocity: number
  isSpinning?: boolean
}

export class PudgyGameScene extends Phaser.Scene {
  // Player
  private player!: Phaser.GameObjects.Sprite
  private playerSpeed: number = 400
  private basePlayerSpeed: number = 400

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

  // Spawning
  private spawnTimer: number = 0
  private currentSpawnInterval: number = 3 // seconds

  // UI
  private scoreText!: Phaser.GameObjects.Text
  private livesText!: Phaser.GameObjects.Text
  private frenzyBar!: Phaser.GameObjects.Graphics
  private frenzyMultiplierText!: Phaser.GameObjects.Text
  private goldenMultiplierText!: Phaser.GameObjects.Text
  private reviveIcon!: Phaser.GameObjects.Text
  private frenzyPopup!: Phaser.GameObjects.Text

  // Game bounds
  private playableLeft: number = 50
  private playableRight: number = 670
  private playableBottom: number = 1020

  constructor() {
    super({ key: 'PudgyGameScene' })
  }

  preload() {
    // Create temporary placeholder textures
    this.createPlaceholderTextures()
  }

  private createPlaceholderTextures() {
    // Player (penguin)
    const playerGraphics = this.add.graphics()
    playerGraphics.fillStyle(0x000000, 1)
    playerGraphics.fillCircle(40, 40, 35)
    playerGraphics.fillStyle(0xFFFFFF, 1)
    playerGraphics.fillCircle(30, 30, 10) // eye
    playerGraphics.fillCircle(50, 30, 10) // eye
    playerGraphics.fillStyle(0xFFA500, 1)
    playerGraphics.fillTriangle(35, 45, 45, 45, 40, 55) // beak
    playerGraphics.generateTexture('player', 80, 80)
    playerGraphics.destroy()

    // Blue fish
    const blueFishGraphics = this.add.graphics()
    blueFishGraphics.fillStyle(0x0000FF, 1)
    blueFishGraphics.fillEllipse(25, 25, 40, 25)
    blueFishGraphics.fillTriangle(45, 25, 55, 15, 55, 35) // tail
    blueFishGraphics.fillStyle(0xFFFFFF, 1)
    blueFishGraphics.fillCircle(15, 20, 5) // eye
    blueFishGraphics.generateTexture('blue_fish', 50, 50)
    blueFishGraphics.destroy()

    // Red fish
    const redFishGraphics = this.add.graphics()
    redFishGraphics.fillStyle(0xFF0000, 1)
    redFishGraphics.fillEllipse(25, 25, 40, 25)
    redFishGraphics.fillTriangle(45, 25, 55, 15, 55, 35) // tail
    redFishGraphics.fillStyle(0xFFFFFF, 1)
    redFishGraphics.fillCircle(15, 20, 5) // eye
    redFishGraphics.generateTexture('red_fish', 50, 50)
    redFishGraphics.destroy()

    // Golden fish
    const goldenFishGraphics = this.add.graphics()
    goldenFishGraphics.fillStyle(0xFFD700, 1)
    goldenFishGraphics.fillEllipse(25, 25, 40, 25)
    goldenFishGraphics.fillTriangle(45, 25, 55, 15, 55, 35) // tail
    goldenFishGraphics.fillStyle(0xFFFFFF, 1)
    goldenFishGraphics.fillCircle(15, 20, 5) // eye
    goldenFishGraphics.lineStyle(2, 0xFFFF00, 1)
    goldenFishGraphics.strokeCircle(25, 25, 28) // sparkle
    goldenFishGraphics.generateTexture('golden_fish', 50, 50)
    goldenFishGraphics.destroy()

    // Trash
    const trashGraphics = this.add.graphics()
    trashGraphics.fillStyle(0x8B4513, 1)
    trashGraphics.fillRect(10, 15, 30, 25)
    trashGraphics.fillStyle(0x654321, 1)
    trashGraphics.fillRect(15, 10, 20, 5) // lid
    trashGraphics.lineStyle(2, 0x000000, 1)
    trashGraphics.strokeRect(10, 15, 30, 25)
    trashGraphics.generateTexture('trash', 50, 50)
    trashGraphics.destroy()

    // Heart
    const heartGraphics = this.add.graphics()
    heartGraphics.fillStyle(0xFF69B4, 1)
    heartGraphics.fillCircle(18, 20, 12)
    heartGraphics.fillCircle(32, 20, 12)
    heartGraphics.fillTriangle(8, 25, 42, 25, 25, 45)
    heartGraphics.generateTexture('heart', 50, 50)
    heartGraphics.destroy()

    // Revive
    const reviveGraphics = this.add.graphics()
    reviveGraphics.fillStyle(0x00FF00, 1)
    reviveGraphics.fillCircle(25, 25, 20)
    reviveGraphics.fillStyle(0xFFFFFF, 1)
    reviveGraphics.fillRect(22, 10, 6, 30) // cross vertical
    reviveGraphics.fillRect(10, 22, 30, 6) // cross horizontal
    reviveGraphics.generateTexture('revive', 50, 50)
    reviveGraphics.destroy()

    // Bird
    const birdGraphics = this.add.graphics()
    birdGraphics.fillStyle(0x654321, 1)
    birdGraphics.fillEllipse(30, 30, 35, 25) // body
    birdGraphics.fillCircle(20, 25, 12) // head
    birdGraphics.fillStyle(0xFFA500, 1)
    birdGraphics.fillTriangle(10, 25, 5, 23, 5, 27) // beak
    birdGraphics.fillStyle(0x654321, 1)
    birdGraphics.fillTriangle(40, 25, 55, 15, 55, 25) // wing top
    birdGraphics.fillTriangle(40, 30, 55, 30, 55, 40) // wing bottom
    birdGraphics.generateTexture('bird', 60, 60)
    birdGraphics.destroy()

    // Falling bird (same but can be different pose later)
    if (!this.textures.exists('falling_bird')) {
      const fallingBirdGraphics = this.add.graphics()
      fallingBirdGraphics.fillStyle(0x654321, 1)
      fallingBirdGraphics.fillEllipse(30, 30, 35, 25)
      fallingBirdGraphics.fillCircle(20, 25, 12)
      fallingBirdGraphics.fillStyle(0xFFA500, 1)
      fallingBirdGraphics.fillTriangle(10, 25, 5, 23, 5, 27)
      fallingBirdGraphics.generateTexture('falling_bird', 60, 60)
      fallingBirdGraphics.destroy()
    }
  }

  create() {
    const { width, height } = this.cameras.main

    // Background
    this.add.rectangle(0, 0, width, height, 0x87CEEB).setOrigin(0, 0)

    // Create player with placeholder
    this.player = this.add.sprite(width / 2, this.playableBottom - 40, 'player')
    this.player.setDisplaySize(80, 80)

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
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    })

    // Lives
    this.livesText = this.add.text(20, 60, '❤️ 3', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    })

    // Frenzy bar background
    this.add.rectangle(width / 2 - 150, 120, 300, 30, 0x333333).setOrigin(0, 0)

    // Frenzy bar
    this.frenzyBar = this.add.graphics()

    // Frenzy multiplier
    this.frenzyMultiplierText = this.add.text(width / 2 + 160, 125, '1x', {
      fontSize: '32px',
      color: '#FFD700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    })

    // Golden multiplier (shown when active)
    this.goldenMultiplierText = this.add.text(width / 2, 180, '', {
      fontSize: '28px',
      color: '#FFD700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    })
    this.goldenMultiplierText.setOrigin(0.5)

    // Revive icon (hidden initially)
    this.reviveIcon = this.add.text(width - 20, 60, '🔄', {
      fontSize: '32px'
    })
    this.reviveIcon.setOrigin(1, 0)
    this.reviveIcon.setVisible(false)

    // Frenzy popup (hidden initially)
    this.frenzyPopup = this.add.text(width / 2, 400, 'FRENZY MODE!!', {
      fontSize: '72px',
      color: '#FFD700',
      fontStyle: 'bold',
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
      fontSize: '128px',
      color: '#ffffff',
      fontStyle: 'bold',
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

    // Update UI
    this.updateUI()
  }

  private updatePlayer(delta: number) {
    let moveX = 0

    // Keyboard input
    if (this.cursors.left.isDown || this.aKey.isDown || this.touchLeft) {
      moveX = -1
    } else if (this.cursors.right.isDown || this.dKey.isDown || this.touchRight) {
      moveX = 1
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

        // Check if fish hits bird
        this.activeItems.forEach(item => {
          if ((item.itemType === ItemType.BLUE_FISH ||
               item.itemType === ItemType.RED_FISH ||
               item.itemType === ItemType.GOLDEN_FISH) &&
              Phaser.Geom.Intersects.RectangleToRectangle(
                item.getBounds(),
                bird.getBounds()
              )) {
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
        })
      }
    })

    // Remove items
    itemsToRemove.forEach(item => {
      this.removeItem(item)
    })
  }

  private checkCollisions() {
    if (this.isInvincible) return

    const playerBounds = this.player.getBounds()
    // Make hitbox more forgiving (80% size)
    const margin = playerBounds.width * 0.1
    const forgivingBounds = new Phaser.Geom.Rectangle(
      playerBounds.x + margin,
      playerBounds.y + margin,
      playerBounds.width - margin * 2,
      playerBounds.height - margin * 2
    )

    this.activeItems.forEach(item => {
      if (Phaser.Geom.Intersects.RectangleToRectangle(forgivingBounds, item.getBounds())) {
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
        this.collectFish(0) // No base points, but activates multiplier
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
      case ItemType.TRASH:
      case ItemType.FALLING_BIRD:
        this.hitObstacle()
        break
    }

    this.removeItem(item)
  }

  private collectFish(points: number) {
    this.addScore(points)
    this.consecutiveFish++
    this.frenzyProgress = Math.min(20, this.consecutiveFish)

    // Check if frenzy bar is full
    if (this.frenzyProgress >= 20 && !this.isFrenzyMode) {
      this.activateFrenzyMode()
    }
  }

  private hitObstacle() {
    // Reset frenzy
    this.consecutiveFish = 0
    this.frenzyProgress = 0
    this.frenzyMultiplier = 1

    // Take damage
    this.lives--

    // Become invincible
    this.isInvincible = true
    this.player.setAlpha(0.5)

    this.time.delayedCall(1000, () => {
      this.isInvincible = false
      this.player.setAlpha(1)
    })

    // Check game over
    if (this.lives <= 0) {
      if (this.hasRevive) {
        this.hasRevive = false
        this.lives = 1
        this.reviveIcon.setVisible(false)
      } else {
        this.gameOver()
      }
    }
  }

  private activateGoldenMultiplier() {
    this.goldenMultiplier = 3
    this.goldenTimeLeft = 7
  }

  private activateFrenzyMode() {
    this.isFrenzyMode = true
    this.frenzyTimeLeft = 5
    this.consecutiveFish = 0
    this.frenzyProgress = 0
    this.frenzyMultiplier = Math.min(5, this.frenzyMultiplier + 1)

    // Increase player speed
    this.playerSpeed = this.basePlayerSpeed * 1.5

    // Clear obstacles
    this.activeItems = this.activeItems.filter(item => {
      if (item.itemType === ItemType.TRASH || item.itemType === ItemType.FALLING_BIRD) {
        this.removeItem(item)
        return false
      }
      return true
    })

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
    // Update spawn interval based on game time
    const maxDifficulty = 5 * 60 // 5 minutes in seconds
    const difficulty = Math.min(1, this.gameTime / maxDifficulty)
    this.currentSpawnInterval = Phaser.Math.Linear(3, 1, difficulty)

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
    const canSpawnRevive = this.score >= 1000

    // Calculate trash percentage based on game time
    const maxDifficulty = 5 * 60
    const difficulty = Math.min(1, this.gameTime / maxDifficulty)
    const trashPercentage = Phaser.Math.Linear(0.1, 0.4, difficulty)

    // Spawn 1-3 items per wave (not during frenzy for trash)
    const itemCount = this.isFrenzyMode ? Phaser.Math.Between(3, 5) : Phaser.Math.Between(1, 3)

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
        } else if (rand < trashPercentage + 0.07 && canSpawnRevive) {
          itemType = ItemType.REVIVE
        } else {
          const fishTypes = [ItemType.BLUE_FISH]
          if (canSpawnRed) fishTypes.push(ItemType.RED_FISH)
          if (canSpawnGolden) fishTypes.push(ItemType.GOLDEN_FISH)
          itemType = Phaser.Utils.Array.GetRandom(fishTypes)
        }
      }

      this.spawnItem(itemType)
    }

    // Occasionally spawn birds (not during frenzy)
    if (!this.isFrenzyMode && Math.random() < 0.2) {
      this.spawnBird()
    }
  }

  private spawnItem(itemType: ItemType) {
    const { width } = this.cameras.main
    const x = Phaser.Math.Between(this.playableLeft, this.playableRight)
    const y = -50

    const item = this.add.sprite(x, y, itemType) as FallingItem
    item.itemType = itemType
    item.velocity = this.isFrenzyMode ? 400 : 200
    item.setDisplaySize(50, 50)

    this.activeItems.push(item)
  }

  private spawnBird() {
    const { width } = this.cameras.main
    const startFromLeft = Math.random() < 0.5
    const x = startFromLeft ? -50 : width + 50
    const y = 150 // Near top of screen
    const velocity = startFromLeft ? 100 : -100

    const bird = this.add.sprite(x, y, 'bird') as FallingItem
    bird.itemType = ItemType.BIRD
    bird.velocity = velocity
    bird.setDisplaySize(60, 60)

    // Flip bird if flying right to left
    if (!startFromLeft) {
      bird.setFlipX(true)
    }

    this.birds.push(bird)
  }

  private removeItem(item: FallingItem) {
    this.activeItems = this.activeItems.filter(i => i !== item)
    item.destroy()
  }

  private updateUI() {
    this.scoreText.setText(`Score: ${this.score}`)
    this.livesText.setText(`❤️ ${this.lives}`)
    this.frenzyMultiplierText.setText(`${this.frenzyMultiplier}x`)

    // Update frenzy bar
    this.frenzyBar.clear()
    this.frenzyBar.fillStyle(0xFFD700, 1)
    const barWidth = (this.frenzyProgress / 20) * 300
    this.frenzyBar.fillRect(this.cameras.main.width / 2 - 150, 120, barWidth, 30)

    // Update golden multiplier text
    if (this.goldenTimeLeft > 0) {
      this.goldenMultiplierText.setText(`Golden 3x: ${Math.ceil(this.goldenTimeLeft)}s`)
      this.goldenMultiplierText.setVisible(true)
    } else {
      this.goldenMultiplierText.setVisible(false)
    }
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
