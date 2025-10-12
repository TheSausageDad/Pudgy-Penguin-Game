export class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' })
  }

  preload() {
    // Load background image
    this.load.image('menu_background', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/Background%20MM-xtHJKuiJfqpn1DKSmc3i4b0KzQXHr4.png?KUwm')

    // Load banner image
    this.load.image('banner', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/Banner-xHrdywi3QBFz4lB4Sg2aOBdvzJW9f2.png?dJQT')

    // Load button images
    this.load.image('play_button', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/Play%20button-lzfzT3xxwS4Jey7fRJSw74WOPBu0qY.png?AQ2w')
    this.load.image('howtoplay_button', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/How%20to%20play-PcDDzkmXDn50tb3za8WV0zGq8UkfTo.png?fz3u')
  }

  create() {
    const { width, height } = this.cameras.main

    // Background image
    const background = this.add.image(width / 2, height / 2, 'menu_background')
    const scaleX = width / background.width
    const scaleY = height / background.height
    const scale = Math.max(scaleX, scaleY)
    background.setScale(scale)

    // Play Button (with image)
    const playButton = this.createImageButton(width / 2, height * 0.60, 'play_button', () => {
      // Check if tutorial has been completed
      const tutorialCompleted = localStorage.getItem('pudgy_tutorial_completed')
      if (tutorialCompleted === 'true') {
        this.scene.start('PudgyGameScene')
      } else {
        this.scene.start('TutorialScene')
      }
    })

    // How to Play Button (with image)
    const howToPlayButton = this.createImageButton(width / 2, height * 0.78, 'howtoplay_button', () => {
      this.scene.start('TutorialScene')
    })
  }

  private createImageButton(x: number, y: number, imageKey: string, callback: () => void): Phaser.GameObjects.Image {
    const button = this.add.image(x, y, imageKey)

    // Scale proportionally to a target width while maintaining aspect ratio
    const targetWidth = 350
    const scaleRatio = targetWidth / button.width
    button.setScale(scaleRatio)

    // Make interactive
    button.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        button.setScale(scaleRatio * 1.05)
      })
      .on('pointerout', () => {
        button.setScale(scaleRatio)
      })
      .on('pointerdown', () => {
        button.setScale(scaleRatio * 0.95)
      })
      .on('pointerup', () => {
        button.setScale(scaleRatio * 1.05)
        callback()
      })

    return button
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
