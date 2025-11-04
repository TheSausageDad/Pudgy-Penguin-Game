export class LevelSelectionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelSelectionScene' })
  }

  preload() {
    // Load map background images for preview
    this.load.image('meadow-map-bg', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Meadow%20Map-jgDQzJNQmX1jeqFdews23JXHhdRNyE.png')
    this.load.image('jungle-map-bg', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Jungle%20path-rZBIekbd1UvXB4I3zndaghbXwZUBlm.png')
    this.load.image('sand-map-bg', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Sand%20Map-pN86hXgXGFP4S5PhrqTJAgwi8r9wE4.png')
    this.load.image('mountain-map-bg', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Mountain%20MAp-N5MfCtrKm0Yy8ivp0rbjdB2h8tGdRc.png')
    this.load.image('lava-map-bg', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Lava%20map-jUpQQ95jaogKpiZ6teG4tPnP7uvbkQ.png')
    this.load.image('ice-map-bg', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Ice%20Level-XLgGa9w5UFsvJpGi1UIxlvOOvAvJfu.png')
  }

  create() {
    const { width, height } = this.cameras.main

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x2a2a2a)

    // Title
    const title = this.add.text(width / 2, 100, 'LEVEL SELECT', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    })
    title.setOrigin(0.5)

    // How to Play button (top right)
    const howToPlayBtn = this.createButton(width - 150, 50, 250, 60, 'HOW TO PLAY', 0x2196F3, () => {
      // TODO: Show how to play instructions
      console.log('How to Play clicked')
    })

    // Map data
    const maps = [
      { id: 1, name: 'Meadow Spiral', difficulty: 'EASY', color: 0x4CAF50, imageKey: 'meadow-map-bg' },
      { id: 2, name: 'Forest Loop', difficulty: 'EASY', color: 0x8BC34A, imageKey: 'jungle-map-bg' },
      { id: 3, name: 'Desert Winds', difficulty: 'MEDIUM', color: 0xFF9800, imageKey: 'sand-map-bg' },
      { id: 4, name: 'Mountain Zigzag', difficulty: 'MEDIUM', color: 0xFF5722, imageKey: 'mountain-map-bg' },
      { id: 5, name: 'Volcanic Rush', difficulty: 'HARD', color: 0xF44336, imageKey: 'lava-map-bg' },
      { id: 6, name: 'Ice Highway', difficulty: 'HARD', color: 0x9C27B0, imageKey: 'ice-map-bg' }
    ]

    // Create level buttons in a 2-column grid
    const startY = 250
    const buttonWidth = 200
    const buttonHeight = 200
    const gap = 80
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
    map: { id: number, name: string, difficulty: string, color: number, imageKey: string }
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
      color: '#ffffff'
    })
    numberText.setOrigin(0.5)
    numberText.setAlpha(0.8)

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
