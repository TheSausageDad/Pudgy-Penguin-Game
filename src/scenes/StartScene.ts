export class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' })
  }

  preload() {
    // Assets are preloaded in LoadingScene
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
    playButton.on('pointerup', async (pointer: Phaser.Input.Pointer) => {
      // Stop event propagation
      if (pointer.event) {
        pointer.event.stopPropagation()
      }

      // Disable the button and input to prevent multiple clicks
      playButton.disableInteractive()
      this.input.enabled = false

      // Call Remix SDK ready() to signal the game is ready to play
      if (window.FarcadeSDK?.singlePlayer?.actions?.ready) {
        try {
          await window.FarcadeSDK.singlePlayer.actions.ready()
          console.log('Remix SDK ready() called')
        } catch (error) {
          console.error('Failed to call SDK ready():', error)
        }
      }

      // Small delay before transitioning to prevent event bleed-through
      setTimeout(() => {
        this.scene.stop('StartScene')
        this.scene.start('LevelSelectionScene')
      }, 100)
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
