export class LevelSelectionScene extends Phaser.Scene {
  private isTransitioning: boolean = false

  constructor() {
    super({ key: 'LevelSelectionScene' })
  }

  init() {
    // Reset transition flag when scene starts
    this.isTransitioning = false
  }

  preload() {
    // Assets are preloaded in LoadingScene
  }

  create() {
    const { width, height } = this.cameras.main

    // Background
    const background = this.add.image(width / 2, height / 2, 'level-select-background')
    background.setDisplaySize(width, height)

    // Title
    const title = this.add.text(width / 2, 160, 'LEVEL SELECT', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    })
    title.setOrigin(0.5)

    // Map data
    const maps = [
      { id: 1, name: 'Meadow Spiral', difficulty: 'EASY', buttonImage: 'meadow-button' },
      { id: 2, name: 'Forest Loop', difficulty: 'EASY', buttonImage: 'jungle-button' },
      { id: 3, name: 'Desert Winds', difficulty: 'MEDIUM', buttonImage: 'desert-button' },
      { id: 4, name: 'Mountain Zigzag', difficulty: 'MEDIUM', buttonImage: 'mountain-button' },
      { id: 5, name: 'Volcanic Rush', difficulty: 'HARD', buttonImage: 'lava-button' },
      { id: 6, name: 'Ice Highway', difficulty: 'HARD', buttonImage: 'ice-button' }
    ]

    // Create level buttons in a 2-column grid
    const startY = 360 // Adjusted positioning
    const buttonWidth = 320
    const buttonHeight = 200
    const gap = 40
    const cols = 2

    maps.forEach((map, index) => {
      const col = index % cols
      const row = Math.floor(index / cols)
      const x = width / 2 - (buttonWidth + gap) / 2 + col * (buttonWidth + gap)
      const y = startY + row * (buttonHeight + gap)

      this.createLevelButton(x, y, buttonWidth, buttonHeight, map)
    })
  }

  private createLevelButton(
    x: number,
    y: number,
    width: number,
    height: number,
    map: { id: number, name: string, difficulty: string, buttonImage: string }
  ) {
    const container = this.add.container(x, y)

    // Button image - set to exact dimensions
    const buttonImg = this.add.image(0, 0, map.buttonImage)

    // Special sizing for specific buttons
    if (map.buttonImage === 'meadow-button') {
      // Make meadow button shorter and wider
      buttonImg.setDisplaySize(width * 1.15, height * 0.85)
    } else if (map.buttonImage === 'jungle-button') {
      // Make jungle button shorter and adjust position
      buttonImg.setDisplaySize(width, height * 0.80)
      buttonImg.y = 7 // Move down by 7 pixels
    } else {
      // Force all other buttons to the same size
      buttonImg.setDisplaySize(width, height)
    }

    container.add([buttonImg])
    container.setSize(width, height)

    // Make interactive
    buttonImg.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        container.setScale(1.05)
        buttonImg.setTint(0xdddddd) // Slight brighten effect
      })
      .on('pointerout', () => {
        container.setScale(1)
        buttonImg.clearTint()
      })
      .on('pointerdown', () => {
        container.setScale(0.95)
      })
      .on('pointerup', () => {
        container.setScale(1.05)
        this.startGame(map.id)
      })
  }

  private startGame(mapId: number) {
    // Prevent multiple clicks during transition
    if (this.isTransitioning) {
      return
    }

    this.isTransitioning = true
    console.log(`Starting map ${mapId}`)

    // Stop this scene and start the game
    this.scene.stop('LevelSelectionScene')
    this.scene.start('TowerDefenseScene', { mapId })
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

    // Make interactive
    bg.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        container.setScale(1.05)
      })
      .on('pointerout', () => {
        container.setScale(1)
      })
      .on('pointerdown', () => {
        container.setScale(0.95)
      })
      .on('pointerup', () => {
        container.setScale(1.05)
        callback()
      })

    return container
  }
}
