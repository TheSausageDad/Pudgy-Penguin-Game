export class TutorialScene extends Phaser.Scene {
  private currentPage: number = 0
  private readonly totalPages: number = 5
  private skipButton!: Phaser.GameObjects.Text
  private nextButton!: Phaser.GameObjects.Container
  private prevButton!: Phaser.GameObjects.Container
  private pageContent!: Phaser.GameObjects.Container

  constructor() {
    super({ key: 'TutorialScene' })
  }

  create() {
    const { width, height } = this.cameras.main

    // Background
    this.add.rectangle(0, 0, width, height, 0x87CEEB).setOrigin(0, 0)

    // Skip button (top right)
    this.skipButton = this.add.text(width - 20, 20, 'SKIP TUTORIAL', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#FF6B35',
      padding: { x: 15, y: 10 }
    })
    this.skipButton.setOrigin(1, 0)
    this.skipButton.setInteractive({ useHandCursor: true })
      .on('pointerup', () => {
        localStorage.setItem('pudgy_tutorial_completed', 'true')
        this.scene.start('PudgyGameScene')
      })

    // Page container
    this.pageContent = this.add.container(0, 0)

    // Navigation buttons
    this.prevButton = this.createNavButton(100, height - 100, '< PREV', () => this.previousPage())
    this.nextButton = this.createNavButton(width - 100, height - 100, 'NEXT >', () => this.nextPage())

    // Show first page
    this.showPage(0)
  }

  private showPage(pageNum: number) {
    this.currentPage = pageNum
    this.pageContent.removeAll(true)

    const { width, height } = this.cameras.main

    // Page indicator
    const pageIndicator = this.add.text(width / 2, height - 50, `${pageNum + 1} / ${this.totalPages}`, {
      fontSize: '20px',
      color: '#ffffff'
    })
    pageIndicator.setOrigin(0.5)

    // Page content based on current page
    switch (pageNum) {
      case 0:
        this.showControlsPage()
        break
      case 1:
        this.showFishTypesPage()
        break
      case 2:
        this.showObstaclesPage()
        break
      case 3:
        this.showFrenzyPage()
        break
      case 4:
        this.showMultiplierPage()
        break
    }

    // Update navigation buttons
    this.prevButton.setVisible(pageNum > 0)
    this.nextButton.setVisible(pageNum < this.totalPages - 1)

    // Show "START" button on last page
    if (pageNum === this.totalPages - 1) {
      const startButton = this.createNavButton(width - 100, height - 100, 'START!', () => {
        localStorage.setItem('pudgy_tutorial_completed', 'true')
        this.scene.start('PudgyGameScene')
      })
      this.pageContent.add(startButton)
    }
  }

  private showControlsPage() {
    const { width } = this.cameras.main

    const title = this.add.text(width / 2, 150, 'CONTROLS', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    })
    title.setOrigin(0.5)
    this.pageContent.add(title)

    const instructions = this.add.text(width / 2, 350,
      'Desktop: Use A/D or Arrow Keys\nto move left and right\n\nMobile: Touch and hold\nleft side to move left,\nright side to move right',
      {
        fontSize: '28px',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 10
      }
    )
    instructions.setOrigin(0.5)
    this.pageContent.add(instructions)
  }

  private showFishTypesPage() {
    const { width } = this.cameras.main

    const title = this.add.text(width / 2, 150, 'FISH TYPES', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    })
    title.setOrigin(0.5)
    this.pageContent.add(title)

    const content = this.add.text(width / 2, 400,
      'Blue Fish: 10 points\n\n' +
      'Red Fish: 15 points\n\n' +
      'Golden Fish: 3x multiplier for 7 seconds!\n\n' +
      'Heart: Restores 1 life (75 pts if full)\n\n' +
      'Revive: Brings you back from 0 lives!',
      {
        fontSize: '24px',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 15
      }
    )
    content.setOrigin(0.5)
    this.pageContent.add(content)
  }

  private showObstaclesPage() {
    const { width } = this.cameras.main

    const title = this.add.text(width / 2, 150, 'OBSTACLES', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    })
    title.setOrigin(0.5)
    this.pageContent.add(title)

    const content = this.add.text(width / 2, 400,
      'Trash: Lose 1 life and reset your\nfrenzy progress!\n\n' +
      'Birds: Fly at the top. When hit by fish,\nthey fall down as obstacles.\n\n' +
      'You have 3 lives and 1 second\nof invincibility after being hit.',
      {
        fontSize: '26px',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 15
      }
    )
    content.setOrigin(0.5)
    this.pageContent.add(content)
  }

  private showFrenzyPage() {
    const { width } = this.cameras.main

    const title = this.add.text(width / 2, 150, 'FRENZY MODE', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    })
    title.setOrigin(0.5)
    this.pageContent.add(title)

    const content = this.add.text(width / 2, 450,
      'Catch 20 fish in a row without missing\nto fill the Frenzy Bar!\n\n' +
      'When activated:\n' +
      '• Fish rain down for 5 seconds\n' +
      '• No obstacles\n' +
      '• Faster movement\n' +
      '• Massive points!',
      {
        fontSize: '26px',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 15
      }
    )
    content.setOrigin(0.5)
    this.pageContent.add(content)
  }

  private showMultiplierPage() {
    const { width } = this.cameras.main

    const title = this.add.text(width / 2, 150, 'FRENZY MULTIPLIER', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    })
    title.setOrigin(0.5)
    this.pageContent.add(title)

    const content = this.add.text(width / 2, 450,
      'Each time you complete the Frenzy Bar,\nyour multiplier increases:\n\n' +
      '1x → 2x → 3x → 4x → 5x (MAX)\n\n' +
      'Hit trash or a bird?\nMultiplier resets to 1x!\n\n' +
      'Keep your streak alive for huge scores!',
      {
        fontSize: '26px',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 15
      }
    )
    content.setOrigin(0.5)
    this.pageContent.add(content)
  }

  private nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.showPage(this.currentPage + 1)
    }
  }

  private previousPage() {
    if (this.currentPage > 0) {
      this.showPage(this.currentPage - 1)
    }
  }

  private createNavButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
    const button = this.add.container(x, y)

    const bg = this.add.rectangle(0, 0, 150, 60, 0xFF6B35)
    bg.setStrokeStyle(3, 0xffffff)

    const buttonText = this.add.text(0, 0, text, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    })
    buttonText.setOrigin(0.5)

    button.add([bg, buttonText])
    button.setSize(150, 60)

    bg.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        bg.setFillStyle(0xFF8C5A)
        button.setScale(1.05)
      })
      .on('pointerout', () => {
        bg.setFillStyle(0xFF6B35)
        button.setScale(1)
      })
      .on('pointerdown', () => button.setScale(0.95))
      .on('pointerup', () => {
        button.setScale(1.05)
        callback()
      })

    return button
  }
}
