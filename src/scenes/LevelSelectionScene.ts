export class LevelSelectionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelSelectionScene' })
  }

  create() {
    const { width, height } = this.cameras.main

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x2a2a2a)

    // Title
    const title = this.add.text(width / 2, 100, 'VEEFRIENDS DEFENSE', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    })
    title.setOrigin(0.5)

    // Map data
    const maps = [
      { id: 1, name: 'Meadow Spiral', difficulty: 'EASY', color: 0x4CAF50 },
      { id: 2, name: 'Forest Loop', difficulty: 'EASY', color: 0x8BC34A },
      { id: 3, name: 'Desert Winds', difficulty: 'MEDIUM', color: 0xFF9800 },
      { id: 4, name: 'Mountain Zigzag', difficulty: 'MEDIUM', color: 0xFF5722 },
      { id: 5, name: 'Volcanic Rush', difficulty: 'HARD', color: 0xF44336 },
      { id: 6, name: 'Ice Highway', difficulty: 'HARD', color: 0x9C27B0 }
    ]

    // Create level buttons in a 2-column grid
    const startY = 250
    const buttonWidth = 300
    const buttonHeight = 120
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
    map: { id: number, name: string, difficulty: string, color: number }
  ) {
    const container = this.add.container(x, y)

    // Background
    const bg = this.add.rectangle(0, 0, width, height, map.color)
    bg.setStrokeStyle(4, 0xffffff)

    // Difficulty badge
    const difficultyBadge = this.add.rectangle(-width / 2 + 60, -height / 2 + 20, 100, 30, 0x000000, 0.7)
    const difficultyText = this.add.text(0, 0, map.difficulty, {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold'
    })
    difficultyText.setOrigin(0.5)
    difficultyText.setPosition(difficultyBadge.x, difficultyBadge.y)

    // Map name
    const nameText = this.add.text(0, 10, map.name, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    })
    nameText.setOrigin(0.5)

    // Map number
    const numberText = this.add.text(0, -20, `MAP ${map.id}`, {
      fontSize: '18px',
      color: '#ffffff',
      alpha: 0.8
    })
    numberText.setOrigin(0.5)

    container.add([bg, difficultyBadge, difficultyText, nameText, numberText])
    container.setSize(width, height)

    // Make interactive
    bg.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        container.setScale(1.05)
        bg.setFillStyle(Phaser.Display.Color.GetColor(
          Math.min(255, Phaser.Display.Color.IntegerToColor(map.color).red + 30),
          Math.min(255, Phaser.Display.Color.IntegerToColor(map.color).green + 30),
          Math.min(255, Phaser.Display.Color.IntegerToColor(map.color).blue + 30)
        ))
      })
      .on('pointerout', () => {
        container.setScale(1)
        bg.setFillStyle(map.color)
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
    console.log(`Starting map ${mapId}`)
    this.scene.start('TowerDefenseScene', { mapId })
  }
}
