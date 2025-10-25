export interface EnemyStats {
  type: number
  name: string
  health: number
  speed: number  // pixels per second
  reward: number  // coins earned when defeated
  damage: number  // lives lost if reaches end
  color: number
}

export class Enemy extends Phaser.GameObjects.Container {
  public stats: EnemyStats
  public currentHealth: number
  public damage: number

  private path: Phaser.Math.Vector2[]
  private pathIndex: number = 0
  private enemyGraphic: Phaser.GameObjects.Shape
  private healthBar: Phaser.GameObjects.Graphics

  constructor(
    scene: Phaser.Scene,
    path: Phaser.Math.Vector2[],
    stats: EnemyStats
  ) {
    super(scene, path[0].x, path[0].y)

    this.stats = stats
    this.currentHealth = stats.health
    this.damage = stats.damage
    this.path = path

    scene.add.existing(this)

    // Create enemy visual based on strength
    this.createEnemyVisual(scene)

    // Health bar
    this.healthBar = scene.add.graphics()
    this.add(this.healthBar)
    this.updateHealthBar()
  }

  private createEnemyVisual(scene: Phaser.Scene) {
    // Scale enemy size based on health (stronger = bigger)
    const baseSize = Math.min(8 + Math.sqrt(this.stats.health) * 0.8, 25)
    const glowSize = baseSize + 5

    // Outer glow
    const glow = scene.add.circle(0, 0, glowSize, this.stats.color, 0.3)
    this.add(glow)

    // Create different shapes based on enemy type
    // Types 1-5: Basic circles
    if (this.stats.type <= 5) {
      this.enemyGraphic = scene.add.circle(0, 0, baseSize, this.stats.color)
      this.add(this.enemyGraphic)

      const highlight = scene.add.circle(-baseSize * 0.3, -baseSize * 0.3, baseSize * 0.3, 0xffffff, 0.4)
      this.add(highlight)
    }
    // Types 6-10: Triangles (aggressive look)
    else if (this.stats.type <= 10) {
      const triangle = scene.add.triangle(0, 0, 0, -baseSize, -baseSize, baseSize, baseSize, baseSize, this.stats.color)
      this.add(triangle)
      this.enemyGraphic = triangle

      const innerTriangle = scene.add.triangle(0, baseSize * 0.15, 0, -baseSize * 0.6, -baseSize * 0.6, baseSize * 0.6, baseSize * 0.6, baseSize * 0.6, this.stats.color)
      innerTriangle.setAlpha(0.6)
      this.add(innerTriangle)

      const highlight = scene.add.circle(0, -baseSize * 0.3, baseSize * 0.2, 0xffffff, 0.5)
      this.add(highlight)
    }
    // Types 11-15: Squares (armored look)
    else if (this.stats.type <= 15) {
      const square = scene.add.rectangle(0, 0, baseSize * 2, baseSize * 2, this.stats.color)
      square.setRotation(Math.PI / 4)
      square.setStrokeStyle(2, 0x000000, 0.8)
      this.add(square)
      this.enemyGraphic = square

      const innerSquare = scene.add.rectangle(0, 0, baseSize * 1.2, baseSize * 1.2, this.stats.color)
      innerSquare.setRotation(Math.PI / 4)
      innerSquare.setAlpha(0.5)
      this.add(innerSquare)

      const highlight = scene.add.rectangle(-baseSize * 0.4, -baseSize * 0.4, baseSize * 0.6, baseSize * 0.6, 0xffffff, 0.4)
      highlight.setRotation(Math.PI / 4)
      this.add(highlight)
    }
    // Types 16-20: Stars (boss-like)
    else {
      const star = scene.add.star(0, 0, 5, baseSize * 0.6, baseSize * 1.4, this.stats.color)
      star.setStrokeStyle(3, 0xffff00, 0.8)
      this.add(star)
      this.enemyGraphic = star

      const innerStar = scene.add.star(0, 0, 5, baseSize * 0.3, baseSize * 0.8, this.stats.color)
      innerStar.setAlpha(0.6)
      this.add(innerStar)

      const core = scene.add.circle(0, 0, baseSize * 0.4, 0xffffff, 0.9)
      core.setStrokeStyle(2, 0xffff00, 1)
      this.add(core)

      // Add orbiting particles for boss enemies
      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI * 2 * i) / 4
        const orb = scene.add.circle(
          Math.cos(angle) * (baseSize + 8),
          Math.sin(angle) * (baseSize + 8),
          3,
          this.stats.color,
          0.8
        )
        this.add(orb)

        // Rotate the orbiting particles
        scene.tweens.add({
          targets: orb,
          angle: 360,
          duration: 3000,
          repeat: -1,
          ease: 'Linear'
        })
      }
    }

    // Border
    const border = scene.add.circle(0, 0, baseSize)
    border.setStrokeStyle(2, 0x000000, 0.6)
    this.add(border)

    // Animate with pulse effect
    scene.tweens.add({
      targets: glow,
      scale: { from: 1, to: 1.2 },
      alpha: { from: 0.3, to: 0.1 },
      duration: 800,
      yoyo: true,
      repeat: -1
    })
  }

  update(time: number, delta: number) {
    if (this.pathIndex >= this.path.length - 1) {
      return // Reached end
    }

    // Get current target point
    const target = this.path[this.pathIndex + 1]

    // Move towards target
    const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y)
    const moveDistance = this.stats.speed * (delta / 1000)

    this.x += Math.cos(angle) * moveDistance
    this.y += Math.sin(angle) * moveDistance

    // Check if reached current target
    const dist = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y)
    if (dist < 5) {
      this.pathIndex++
    }
  }

  takeDamage(amount: number): void {
    this.currentHealth -= amount
    this.updateHealthBar()

    // Flash white when hit - create temporary white overlay
    const flashOverlay = this.scene.add.circle(this.x, this.y, 20, 0xffffff, 0.7)
    flashOverlay.setDepth(this.depth + 1)

    this.scene.tweens.add({
      targets: flashOverlay,
      alpha: 0,
      duration: 150,
      onComplete: () => flashOverlay.destroy()
    })

    // Screen shake effect
    this.scene.cameras.main.shake(50, 0.002)

    if (this.currentHealth <= 0) {
      this.die()
    }
  }

  private updateHealthBar() {
    this.healthBar.clear()

    const barWidth = 30
    const barHeight = 4
    const healthPercent = this.currentHealth / this.stats.health

    // Background
    this.healthBar.fillStyle(0x000000)
    this.healthBar.fillRect(-barWidth / 2, -25, barWidth, barHeight)

    // Health
    const healthColor = healthPercent > 0.5 ? 0x00ff00 : healthPercent > 0.25 ? 0xffff00 : 0xff0000
    this.healthBar.fillStyle(healthColor)
    this.healthBar.fillRect(-barWidth / 2, -25, barWidth * healthPercent, barHeight)
  }

  private die() {
    // Create explosion effect
    const particles = this.scene.add.particles(this.x, this.y, 'particle', {
      speed: { min: 50, max: 150 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 600,
      quantity: 15,
      tint: this.stats.color,
      blendMode: 'ADD'
    })

    // If particle texture doesn't exist, create simple circles instead
    if (!this.scene.textures.exists('particle')) {
      particles.destroy()
      // Create circle explosion manually
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 * i) / 12
        const speed = 100 + Math.random() * 50
        const particle = this.scene.add.circle(this.x, this.y, 3, this.stats.color)

        this.scene.tweens.add({
          targets: particle,
          x: this.x + Math.cos(angle) * speed,
          y: this.y + Math.sin(angle) * speed,
          alpha: 0,
          scale: 0,
          duration: 600,
          onComplete: () => particle.destroy()
        })
      }
    }

    // Flash effect
    const flash = this.scene.add.circle(this.x, this.y, 30, 0xffffff, 0.8)
    this.scene.tweens.add({
      targets: flash,
      scale: 2,
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy()
    })

    // Emit event for coin reward
    this.scene.events.emit('enemyKilled', this.stats.reward)

    this.destroy()
  }

  hasReachedEnd(): boolean {
    return this.pathIndex >= this.path.length - 1
  }
}
