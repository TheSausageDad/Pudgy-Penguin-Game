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
      color: '#cccccc',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5).setDepth(100)

    // Add click counter text
    this.clickText = this.add.text(30, 30, 'Score: 0/3', {
      fontSize: '36px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setDepth(100)

    // Add removal instructions at bottom
    const removeInstructions = this.add.text(
      GameSettings.canvas.width / 2,
      GameSettings.canvas.height - 60,
      'To remove this demo, ask your AI:\n"Remove the demo and create a minimal GameScene"',
      {
        fontSize: '18px',
        color: '#888888',
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
      const radius = Phaser.Math.Between(15, 40)
      const x = Phaser.Math.Between(radius, GameSettings.canvas.width - radius)
      const y = Phaser.Math.Between(radius, GameSettings.canvas.height - radius)
      
      const ball = this.add.circle(x, y, radius, Phaser.Math.Between(0x000000, 0xffffff))
      ball.setStrokeStyle(2, 0xffffff)
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
        console.error('[Game] Error calling gameOver:', error)
      }
    } else {
      console.warn('[Game] FarcadeSDK not found in window')
      console.log('[Game] Available in window:', Object.keys(window).filter(k => k.includes('SDK') || k.includes('remix') || k.includes('Remix')))
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
  }

  // --- Scene Shutdown Logic ---
  shutdown() {}
}