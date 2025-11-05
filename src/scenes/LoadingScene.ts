export class LoadingScene extends Phaser.Scene {
  private loadingBar!: Phaser.GameObjects.Graphics
  private progressBar!: Phaser.GameObjects.Graphics
  private loadingText!: Phaser.GameObjects.Text
  private percentText!: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'LoadingScene' })
  }

  preload() {
    const { width, height } = this.cameras.main

    // Create loading UI
    this.createLoadingUI(width, height)

    // Listen to load progress events
    this.load.on('progress', (value: number) => {
      this.progressBar.clear()
      this.progressBar.fillStyle(0xffd700, 1)
      this.progressBar.fillRect(width / 2 - 200, height / 2, 400 * value, 30)

      this.percentText.setText(`${Math.floor(value * 100)}%`)
    })

    this.load.on('complete', () => {
      this.loadingBar.destroy()
      this.progressBar.destroy()
      this.loadingText.destroy()
      this.percentText.destroy()
    })

    // Preload all assets that are used across multiple scenes
    // This ensures they're loaded before the game starts
    this.load.image('start-background', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Start%20Background-gSizUnjA64DLDNhlmbHnZidHpFEDe7.png')
    this.load.image('play-button', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Play%20Button-X5USnXd1Txy3OTCu6GnT53hy1hsZIR.png')
    this.load.image('title', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Title-tSrD0FGJ5XY10zTcC861JjzwxQJbom.png')

    // Level selection background
    this.load.image('level-select-background', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Level%20Select%20background-sQfcbRpxy52JSNffXW0oFSgLnJUXVx.png')

    // Level selection buttons
    this.load.image('meadow-button', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Meadow%20Button-xQwhB86avE9fBYYt4xdUxTyeoASBIK.png')
    this.load.image('jungle-button', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Jungle%20Button-GOd3cqiNoU0bbPQXJRMQRrZXLRF6Mk.png')
    this.load.image('desert-button', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Desert%20Button-B0ULkixQ2cLkRgxIVbMwJ7im2wDdPU.png')
    this.load.image('mountain-button', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Mountain%20Button-sycFIXT2JZPVpSdAmPufYjsh3Hdeqq.png')
    this.load.image('lava-button', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Lava%20Button-dCSWgRoYu5EotyIdAd2PiAHiquxb8o.png')
    this.load.image('ice-button', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Ice%20button-JpODQ9jHLtnhqxQjn5Tc2Q3XR3VMkc.png')

    // Load background music
    this.load.audio('bgMusic', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a2619040-d4c3-4748-986a-483e56486a72/Music%20Loop-yPYC7cMLmOtbATLHj8PF8HxkCyoDqo.mp3')
  }

  create() {
    // Add a small delay to show "100%" before transitioning
    this.time.delayedCall(300, () => {
      this.scene.start('StartScene')
    })
  }

  private createLoadingUI(width: number, height: number) {
    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a1a)

    // Loading title
    this.loadingText = this.add.text(width / 2, height / 2 - 80, 'LOADING...', {
      fontSize: '48px',
      color: '#ffd700',
      fontStyle: 'bold',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5)

    // Loading bar background (border)
    this.loadingBar = this.add.graphics()
    this.loadingBar.fillStyle(0x222222, 1)
    this.loadingBar.fillRect(width / 2 - 205, height / 2 - 5, 410, 40)
    this.loadingBar.lineStyle(3, 0xffd700, 1)
    this.loadingBar.strokeRect(width / 2 - 205, height / 2 - 5, 410, 40)

    // Loading bar fill (progress)
    this.progressBar = this.add.graphics()

    // Percentage text
    this.percentText = this.add.text(width / 2, height / 2 + 60, '0%', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Arial'
    }).setOrigin(0.5)

    // Optional: Add a tip or message
    this.add.text(width / 2, height / 2 + 120, 'Preparing your tower defense adventure...', {
      fontSize: '18px',
      color: '#aaaaaa',
      fontStyle: 'italic',
      fontFamily: 'Arial'
    }).setOrigin(0.5)
  }
}
