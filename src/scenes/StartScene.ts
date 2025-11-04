export class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' })
  }

  preload() {
    // Load start screen assets
    this.load.image('start-background', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Start%20Background-gSizUnjA64DLDNhlmbHnZidHpFEDe7.png')
    this.load.image('play-button', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Play%20Button-X5USnXd1Txy3OTCu6GnT53hy1hsZIR.png')
    this.load.image('title', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Title-tSrD0FGJ5XY10zTcC861JjzwxQJbom.png')
  }

  create() {
    const { width, height } = this.cameras.main

    // Add background image
    const background = this.add.image(width / 2, height / 2, 'start-background')
    background.setDisplaySize(width, height)

    // Position elements in lower middle portion of screen
    // Play button positioned in lower middle
    const playButton = this.add.image(width / 2, height * 0.7, 'play-button')
    playButton.setOrigin(0.5, 0.5)
    playButton.setInteractive({ cursor: 'pointer' })

    // Make play button clickable
    playButton.on('pointerdown', () => {
      this.scene.start('LevelSelectionScene')
    })

    // Add hover effect
    playButton.on('pointerover', () => {
      playButton.setScale(1.1)
    })

    playButton.on('pointerout', () => {
      playButton.setScale(1.0)
    })

    // Title positioned right above play button
    const title = this.add.image(width / 2, height * 0.7 - 150, 'title')
    title.setOrigin(0.5, 0.5)
  }
}
