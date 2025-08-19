import GameSettings from "../config/GameSettings"

interface Ball {
  sprite: Phaser.GameObjects.Arc
  velocityX: number
  velocityY: number
  radius: number
}

export class DemoScene extends Phaser.Scene {
  private balls: Ball[] = []
  private clickCount: number = 0
  private clickText?: Phaser.GameObjects.Text
  private gameOver: boolean = false
  private time: number = 0

  constructor() {
    super({ key: "DemoScene" })
  }

  preload(): void {}

  create(): void {

    // Add instructional text
    const title = this.add.text(GameSettings.canvas.width / 2, GameSettings.canvas.height / 2 - 100, 'Remix SDK Demo', {
      fontSize: '64px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(100)

    const instruction = this.add.text(GameSettings.canvas.width / 2, GameSettings.canvas.height / 2 - 20, 'Click anywhere 3 times to trigger Game Over!', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5).setDepth(100)

    // Add click counter text (centered at top)
    this.clickText = this.add.text(GameSettings.canvas.width / 2, 50, 'Score: 0/3', {
      fontSize: '36px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(100)

    // Add removal instructions at bottom
    const removeInstructions = this.add.text(
      GameSettings.canvas.width / 2,
      GameSettings.canvas.height - 60,
      'To remove this demo, ask your AI:\n"Remove the demo and create a minimal GameScene"',
      {
        fontSize: '24px',
        color: '#cccccc',
        fontFamily: 'Arial',
        align: 'center',
        wordWrap: { width: GameSettings.canvas.width - 40 }
      }
    ).setOrigin(0.5).setDepth(100)

    // Create bouncing balls
    this.createBalls(15)

    // Add global click listener
    this.input.on('pointerdown', () => {
      if (!this.gameOver) {
        this.handleClick()
      }
    })

    // Listen for SDK play_again event
    if ('FarcadeSDK' in window && (window as any).FarcadeSDK) {
      (window as any).FarcadeSDK.on('play_again', () => {
        this.restartGame()
      })
    }
  }

  private createBalls(count: number): void {
    for (let i = 0; i < count; i++) {
      const radius = Phaser.Math.Between(25, 60)
      const x = Phaser.Math.Between(radius, GameSettings.canvas.width - radius)
      const y = Phaser.Math.Between(radius, GameSettings.canvas.height - radius)
      
      // Remix green color
      const color = 0x33ff00
      const ball = this.add.circle(x, y, radius, color)
      ball.setStrokeStyle(2, 0x000000)
      ball.setInteractive()
      
      
      const ballData: Ball = {
        sprite: ball,
        velocityX: Phaser.Math.Between(-300, 300),
        velocityY: Phaser.Math.Between(-300, 300),
        radius: radius
      }
      
      this.balls.push(ballData)
    }
  }


  update(_time: number, deltaTime: number): void {
    const dt = deltaTime / 1000


    this.balls.forEach(ball => {
      // Update position
      ball.sprite.x += ball.velocityX * dt
      ball.sprite.y += ball.velocityY * dt

      // Bounce off edges
      if (ball.sprite.x - ball.radius <= 0 || ball.sprite.x + ball.radius >= GameSettings.canvas.width) {
        ball.velocityX *= -1
        ball.sprite.x = Phaser.Math.Clamp(ball.sprite.x, ball.radius, GameSettings.canvas.width - ball.radius)
      }
      
      if (ball.sprite.y - ball.radius <= 0 || ball.sprite.y + ball.radius >= GameSettings.canvas.height) {
        ball.velocityY *= -1
        ball.sprite.y = Phaser.Math.Clamp(ball.sprite.y, ball.radius, GameSettings.canvas.height - ball.radius)
      }
    })

    // Check ball-to-ball collisions
    this.checkBallCollisions()
  }

  private checkBallCollisions(): void {
    for (let i = 0; i < this.balls.length; i++) {
      for (let j = i + 1; j < this.balls.length; j++) {
        const ball1 = this.balls[i]
        const ball2 = this.balls[j]
        
        const dx = ball2.sprite.x - ball1.sprite.x
        const dy = ball2.sprite.y - ball1.sprite.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const minDistance = ball1.radius + ball2.radius
        
        if (distance < minDistance) {
          // Collision detected - separate balls
          const overlap = minDistance - distance
          const separationX = (dx / distance) * (overlap / 2)
          const separationY = (dy / distance) * (overlap / 2)
          
          ball1.sprite.x -= separationX
          ball1.sprite.y -= separationY
          ball2.sprite.x += separationX
          ball2.sprite.y += separationY
          
          // Calculate collision response
          const angle = Math.atan2(dy, dx)
          const sin = Math.sin(angle)
          const cos = Math.cos(angle)
          
          // Rotate velocities to collision normal
          const vx1 = ball1.velocityX * cos + ball1.velocityY * sin
          const vy1 = ball1.velocityY * cos - ball1.velocityX * sin
          const vx2 = ball2.velocityX * cos + ball2.velocityY * sin
          const vy2 = ball2.velocityY * cos - ball2.velocityX * sin
          
          // Apply conservation of momentum (assuming equal mass)
          const newVx1 = vx2
          const newVx2 = vx1
          
          // Rotate velocities back
          ball1.velocityX = newVx1 * cos - vy1 * sin
          ball1.velocityY = vy1 * cos + newVx1 * sin
          ball2.velocityX = newVx2 * cos - vy2 * sin
          ball2.velocityY = vy2 * cos + newVx2 * sin
        }
      }
    }
  }

  private handleClick(): void {
    this.clickCount++
    if (this.clickText) {
      this.clickText.setText(`Score: ${this.clickCount}/3`)
    }
    
    // Trigger game over at 3 clicks
    if (this.clickCount >= 3) {
      this.triggerGameOver()
    }
  }

  private triggerGameOver(): void {
    this.gameOver = true
    
    // Use SDK to trigger game over
    if ('FarcadeSDK' in window && (window as any).FarcadeSDK) {
      try {
        (window as any).FarcadeSDK.singlePlayer.actions.gameOver({ score: this.clickCount })
      } catch (error) {
        // SDK error - silently handle
      }
    }
  }

  private restartGame(): void {
    this.clickCount = 0
    this.gameOver = false
    
    if (this.clickText) {
      this.clickText.setText('Score: 0/3')
    }
    
    // Reset all balls to new positions
    this.balls.forEach(ball => {
      ball.sprite.x = Phaser.Math.Between(ball.radius, GameSettings.canvas.width - ball.radius)
      ball.sprite.y = Phaser.Math.Between(ball.radius, GameSettings.canvas.height - ball.radius)
      ball.velocityX = Phaser.Math.Between(-300, 300)
      ball.velocityY = Phaser.Math.Between(-300, 300)
    })
    
    // Focus the canvas to enable keyboard input
    this.game.canvas.focus()
  }

  // --- Scene Shutdown Logic ---
  shutdown() {}
}