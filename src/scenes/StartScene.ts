export class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' })
  }

  preload() {
    // TODO: Load background image and UI assets when provided
  }

  create() {
    const { width, height } = this.cameras.main

    // Temporary background
    this.add.rectangle(0, 0, width, height, 0x87CEEB).setOrigin(0, 0)

    // Title
    const title = this.add.text(width / 2, height * 0.3, 'Pudgy Penguins\nFish Catch', {
      fontSize: '64px',
      color: '#ffffff',
      align: 'center',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    })
    title.setOrigin(0.5)

    // Play Button
    const playButton = this.createButton(width / 2, height * 0.55, 'PLAY', () => {
      // Check if tutorial has been completed
      const tutorialCompleted = localStorage.getItem('pudgy_tutorial_completed')
      if (tutorialCompleted === 'true') {
        this.scene.start('PudgyGameScene')
      } else {
        this.scene.start('TutorialScene')
      }
    })

    // How to Play Button
    const howToPlayButton = this.createButton(width / 2, height * 0.7, 'HOW TO PLAY', () => {
      this.scene.start('TutorialScene')
    })
  }

  private createButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
    const button = this.add.container(x, y)

    // Button background
    const bg = this.add.rectangle(0, 0, 300, 80, 0xFF6B35)
    bg.setStrokeStyle(4, 0xffffff)

    // Button text
    const buttonText = this.add.text(0, 0, text, {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    })
    buttonText.setOrigin(0.5)

    button.add([bg, buttonText])
    button.setSize(300, 80)

    // Make interactive
    bg.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        bg.setFillStyle(0xFF8C5A)
        button.setScale(1.05)
      })
      .on('pointerout', () => {
        bg.setFillStyle(0xFF6B35)
        button.setScale(1)
      })
      .on('pointerdown', () => {
        button.setScale(0.95)
      })
      .on('pointerup', () => {
        button.setScale(1.05)
        callback()
      })

    return button
  }
}
