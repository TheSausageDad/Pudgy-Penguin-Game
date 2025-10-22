export class TutorialScene extends Phaser.Scene {
  private currentPage: number = 0
  private readonly totalPages: number = 3
  private skipButton!: Phaser.GameObjects.Text
  private nextButton!: Phaser.GameObjects.Container
  private prevButton!: Phaser.GameObjects.Container
  private pageContent!: Phaser.GameObjects.Container

  constructor() {
    super({ key: 'TutorialScene' })
  }

  preload() {
    // Load game start sound
    this.load.audio('game_start', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/game%20start-RHdnzRKrjI9adHseJbv8QJP8KT1Ajy.wav?sXuB')

    // Load game background
    this.load.image('tutorial_bg', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/Background-3EIPuXBlKw45qHiCmeh2PccLohitwr.jpg?y9qA')

    // Load game sprites for tutorial
    this.load.image('blue_fish', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/Blue%20Fish-sg15xOysFaz1zmk5kkMJeDCEqC6xOn.png?MSgz')
    this.load.image('red_fish', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/Red%20Fish-F03ziigEosFvisjUrY7Sa3DzGmqD16.png?NZce')
    this.load.image('golden_fish', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/Gold%20Fish-HNiwNVRRu8mbsE2NLMJNGDdyKsAEMu.png?I4n9')
    this.load.image('trash', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/Red%20can-co5Cdw1tnJEPIXbInrcNi5jR5WhHWQ.png?puEM')
    this.load.image('heart', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/Heart%20Icon-fc39joAk7HCFWigWLk58XSNhGBgCnS.png?oUeF')
    this.load.image('shield', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/Shield-VZ6oLsks0cW74YTVKp4V2cdoTptTAW.png?e3nn')
    this.load.image('bird', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/Bird%20Wings%20down-o11NxDC63bJz45FovR83rXaI63VLgE.png')
    this.load.image('shark', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/Shark-fqx2CahgWiWMW2C7sjxkFNYtKoGDMc.png?tldy')
  }

  create() {
    const { width, height } = this.cameras.main

    // Background - same as game
    const background = this.add.image(width / 2, height / 2, 'tutorial_bg')
    const scaleX = width / background.width
    const scaleY = height / background.height
    const scale = Math.max(scaleX, scaleY)
    background.setScale(scale)

    // Semi-transparent overlay for readability
    this.add.rectangle(0, 0, width, height, 0x000000, 0.5).setOrigin(0, 0)

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
        // Resume AudioContext if suspended
        if (this.sound.context && this.sound.context.state === 'suspended') {
          this.sound.context.resume().then(() => {
            console.log('[Audio] AudioContext resumed on skip')
          })
        }

        localStorage.setItem('pudgy_tutorial_completed', 'true')
        // Play game start sound
        this.sound.play('game_start', { volume: 0.7 })
        // Stop tutorial scene
        this.scene.stop('TutorialScene')
        // Make sure game scene is fresh
        if (this.scene.get('PudgyGameScene')) {
          this.scene.stop('PudgyGameScene')
        }
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
    this.pageContent.add(pageIndicator)

    // Page content based on current page
    switch (pageNum) {
      case 0:
        this.showControlsPage()
        break
      case 1:
        this.showCollectiblesPage()
        break
      case 2:
        this.showDangersPage()
        break
    }

    // Update navigation buttons
    this.prevButton.setVisible(pageNum > 0)
    this.nextButton.setVisible(pageNum < this.totalPages - 1)

    // Show "START" button on last page
    if (pageNum === this.totalPages - 1) {
      const startButton = this.createNavButton(width - 100, height - 100, 'START!', () => {
        // Resume AudioContext if suspended
        if (this.sound.context && this.sound.context.state === 'suspended') {
          this.sound.context.resume().then(() => {
            console.log('[Audio] AudioContext resumed on start')
          })
        }

        localStorage.setItem('pudgy_tutorial_completed', 'true')
        // Play game start sound
        this.sound.play('game_start', { volume: 0.7 })
        // Stop tutorial scene
        this.scene.stop('TutorialScene')
        // Make sure game scene is fresh
        if (this.scene.get('PudgyGameScene')) {
          this.scene.stop('PudgyGameScene')
        }
        this.scene.start('PudgyGameScene')
      })
      this.pageContent.add(startButton)
    }
  }

  private showControlsPage() {
    const { width } = this.cameras.main

    const box = this.add.rectangle(width / 2, 480, 620, 750, 0x1a1a2e, 0.9)
    box.setStrokeStyle(4, 0xFFD700)
    this.pageContent.add(box)

    const title = this.add.text(width / 2, 140, 'HOW TO PLAY', {
      fontFamily: '"Rubik Bubbles"',
      fontSize: '48px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 6
    })
    title.setOrigin(0.5)
    this.pageContent.add(title)

    // Controls text - larger and more prominent
    const controlsText = this.add.text(width / 2, 250,
      'DESKTOP: A/D or Arrow Keys\nMOBILE: Tap & hold left/right side',
      {
        fontFamily: '"Rubik Bubbles"',
        fontSize: '28px',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 12,
        stroke: '#000000',
        strokeThickness: 3
      }
    )
    controlsText.setOrigin(0.5)
    this.pageContent.add(controlsText)

    // Game objectives with icons - better spacing and larger icons
    let startY = 380
    const lineHeight = 95
    const iconSize = 65
    const leftOffset = 100 // Starting position from left edge of box

    // Fish icon + text
    const fishIcon = this.add.image(leftOffset, startY, 'blue_fish')
    fishIcon.setDisplaySize(iconSize, iconSize)
    this.pageContent.add(fishIcon)
    const fishText = this.add.text(leftOffset + 80, startY, 'Catch fish to score points', {
      fontFamily: '"Rubik Bubbles"',
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    })
    fishText.setOrigin(0, 0.5)
    this.pageContent.add(fishText)

    // Trash icon + text
    startY += lineHeight
    const trashIcon = this.add.image(leftOffset, startY, 'trash')
    trashIcon.setDisplaySize(iconSize, iconSize)
    this.pageContent.add(trashIcon)
    const trashText = this.add.text(leftOffset + 80, startY, 'Avoid trash & obstacles', {
      fontFamily: '"Rubik Bubbles"',
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    })
    trashText.setOrigin(0, 0.5)
    this.pageContent.add(trashText)

    // Frenzy text (with lightning emoji as "icon")
    startY += lineHeight
    const frenzyText = this.add.text(leftOffset, startY, '⚡', {
      fontSize: '60px'
    })
    frenzyText.setOrigin(0.5)
    this.pageContent.add(frenzyText)
    const frenzyInfo = this.add.text(leftOffset + 80, startY, 'Fill bar for Frenzy Mode', {
      fontFamily: '"Rubik Bubbles"',
      fontSize: '32px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 4
    })
    frenzyInfo.setOrigin(0, 0.5)
    this.pageContent.add(frenzyInfo)

    // Shark icon + text
    startY += lineHeight
    const sharkIcon = this.add.image(leftOffset, startY, 'shark')
    sharkIcon.setDisplaySize(iconSize, iconSize)
    this.pageContent.add(sharkIcon)
    const sharkText = this.add.text(leftOffset + 80, startY, 'Watch out for sharks!', {
      fontFamily: '"Rubik Bubbles"',
      fontSize: '32px',
      color: '#FF4444',
      stroke: '#000000',
      strokeThickness: 4
    })
    sharkText.setOrigin(0, 0.5)
    this.pageContent.add(sharkText)
  }

  private showCollectiblesPage() {
    const { width } = this.cameras.main

    const box = this.add.rectangle(width / 2, 480, 620, 750, 0x1a1a2e, 0.9)
    box.setStrokeStyle(4, 0x4A90E2)
    this.pageContent.add(box)

    const title = this.add.text(width / 2, 140, 'COLLECTIBLES', {
      fontFamily: '"Rubik Bubbles"',
      fontSize: '42px',
      color: '#4A90E2',
      stroke: '#000000',
      strokeThickness: 5
    })
    title.setOrigin(0.5)
    this.pageContent.add(title)

    let startY = 270
    const lineHeight = 70

    // Blue fish
    const blueFish = this.add.image(width / 2 - 210, startY, 'blue_fish')
    blueFish.setDisplaySize(50, 50)
    this.pageContent.add(blueFish)
    const blueFishText = this.add.text(width / 2 - 150, startY, 'BLUE FISH: +10 points', {
      fontFamily: '"Rubik Bubbles"',
      fontSize: '26px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    })
    blueFishText.setOrigin(0, 0.5)
    this.pageContent.add(blueFishText)

    // Red fish
    startY += lineHeight
    const redFish = this.add.image(width / 2 - 210, startY, 'red_fish')
    redFish.setDisplaySize(50, 50)
    this.pageContent.add(redFish)
    const redFishText = this.add.text(width / 2 - 150, startY, 'RED FISH: +15 points', {
      fontFamily: '"Rubik Bubbles"',
      fontSize: '26px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    })
    redFishText.setOrigin(0, 0.5)
    this.pageContent.add(redFishText)

    // Golden fish
    startY += lineHeight
    const goldenFish = this.add.image(width / 2 - 210, startY, 'golden_fish')
    goldenFish.setDisplaySize(50, 50)
    this.pageContent.add(goldenFish)
    const goldenFishText = this.add.text(width / 2 - 150, startY, 'GOLDEN: +50 + 3x multi', {
      fontFamily: '"Rubik Bubbles"',
      fontSize: '26px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 3
    })
    goldenFishText.setOrigin(0, 0.5)
    this.pageContent.add(goldenFishText)

    // Heart
    startY += lineHeight
    const heartIcon = this.add.image(width / 2 - 210, startY, 'heart')
    heartIcon.setDisplaySize(50, 50)
    this.pageContent.add(heartIcon)
    const heartText = this.add.text(width / 2 - 150, startY, 'HEART: Restore 1 life', {
      fontFamily: '"Rubik Bubbles"',
      fontSize: '26px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    })
    heartText.setOrigin(0, 0.5)
    this.pageContent.add(heartText)

    // Shield
    startY += lineHeight
    const shieldIcon = this.add.image(width / 2 - 210, startY, 'shield')
    shieldIcon.setDisplaySize(50, 50)
    this.pageContent.add(shieldIcon)
    const shieldText = this.add.text(width / 2 - 150, startY, 'SHIELD: 5 sec invincible', {
      fontFamily: '"Rubik Bubbles"',
      fontSize: '26px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    })
    shieldText.setOrigin(0, 0.5)
    this.pageContent.add(shieldText)

    // Frenzy mode info
    startY += lineHeight + 10
    const frenzyInfo = this.add.text(width / 2, startY,
      '⚡ FRENZY MODE ⚡\nCatch 20 fish to activate!\nFast fish + bonus multipliers',
      {
        fontFamily: '"Rubik Bubbles"',
        fontSize: '24px',
        color: '#FFD700',
        align: 'center',
        lineSpacing: 8,
        stroke: '#000000',
        strokeThickness: 3
      }
    )
    frenzyInfo.setOrigin(0.5, 0)
    this.pageContent.add(frenzyInfo)
  }

  private showDangersPage() {
    const { width } = this.cameras.main

    const box = this.add.rectangle(width / 2, 480, 620, 750, 0x1a1a2e, 0.9)
    box.setStrokeStyle(4, 0xFF4444)
    this.pageContent.add(box)

    const title = this.add.text(width / 2, 140, 'DANGERS', {
      fontFamily: '"Rubik Bubbles"',
      fontSize: '42px',
      color: '#FF4444',
      stroke: '#000000',
      strokeThickness: 5
    })
    title.setOrigin(0.5)
    this.pageContent.add(title)

    let startY = 250
    const lineHeight = 95

    // Trash
    const trashIcon = this.add.image(width / 2 - 210, startY, 'trash')
    trashIcon.setDisplaySize(50, 50)
    this.pageContent.add(trashIcon)
    const trashText = this.add.text(width / 2 - 150, startY, 'TRASH: -1 life\nResets multiplier', {
      fontFamily: '"Rubik Bubbles"',
      fontSize: '26px',
      color: '#ffffff',
      lineSpacing: 5,
      stroke: '#000000',
      strokeThickness: 3
    })
    trashText.setOrigin(0, 0.5)
    this.pageContent.add(trashText)

    // Birds
    startY += lineHeight
    const birdIcon = this.add.image(width / 2 - 210, startY, 'bird')
    birdIcon.setDisplaySize(50, 50)
    this.pageContent.add(birdIcon)
    const birdText = this.add.text(width / 2 - 150, startY, 'BIRDS: -1 life\nResets multiplier', {
      fontFamily: '"Rubik Bubbles"',
      fontSize: '26px',
      color: '#ffffff',
      lineSpacing: 5,
      stroke: '#000000',
      strokeThickness: 3
    })
    birdText.setOrigin(0, 0.5)
    this.pageContent.add(birdText)

    // Sharks
    startY += lineHeight
    const sharkIcon = this.add.image(width / 2 - 210, startY, 'shark')
    sharkIcon.setDisplaySize(50, 50)
    this.pageContent.add(sharkIcon)
    const sharkText = this.add.text(width / 2 - 150, startY, 'SHARKS: -1 life\nWatch for warnings!', {
      fontFamily: '"Rubik Bubbles"',
      fontSize: '26px',
      color: '#ffffff',
      lineSpacing: 5,
      stroke: '#000000',
      strokeThickness: 3
    })
    sharkText.setOrigin(0, 0.5)
    this.pageContent.add(sharkText)

    // Warning section
    startY += lineHeight + 30
    const warningTitle = this.add.text(width / 2, startY, '⚠️ HITTING OBSTACLES ⚠️', {
      fontFamily: '"Rubik Bubbles"',
      fontSize: '28px',
      color: '#FF4444',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 3
    })
    warningTitle.setOrigin(0.5, 0.5)
    this.pageContent.add(warningTitle)

    startY += 60
    const warningText = this.add.text(width / 2, startY, '• Lose 1 life\n• Reset frenzy & multiplier', {
      fontFamily: '"Rubik Bubbles"',
      fontSize: '26px',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 10,
      stroke: '#000000',
      strokeThickness: 3
    })
    warningText.setOrigin(0.5, 0)
    this.pageContent.add(warningText)
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
