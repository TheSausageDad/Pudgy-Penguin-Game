// Sunset Reef palette
const C = {
  coral: 0xff6b6b,
  coralDark: 0xd8474f,
  teal: 0x1fb6a6,
  tealDark: 0x128b7e,
  tealLight: 0x3fd0c0,
  deep: 0x16413c,
  white: 0xffffff,
}

// Pastel row-chip fills
const ROW_MINT = 0xeef9f7
const ROW_PEACH = 0xfff3ea
const ROW_ROSE = 0xfdeeee

export class TutorialScene extends Phaser.Scene {
  private currentPage: number = 0
  private readonly totalPages: number = 3
  private skipButton!: Phaser.GameObjects.Container
  private nextButton!: Phaser.GameObjects.Container
  private prevButton!: Phaser.GameObjects.Container
  private pageContent!: Phaser.GameObjects.Container

  constructor() {
    super({ key: 'TutorialScene' })
  }

  preload() {
    // Load game start sound
    this.load.audio('game_start', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/game%20start-RHdnzRKrjI9adHseJbv8QJP8KT1Ajy.wav?sXuB')

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

    // Drawn water gradient background (matches the game)
    const bg = this.add.graphics()
    bg.fillGradientStyle(0x7fd6cd, 0x7fd6cd, 0x2a8f88, 0x2a8f88, 1)
    bg.fillRect(0, 0, width, height)

    // Soft teal dim for focus
    this.add.rectangle(0, 0, width, height, 0x16413c, 0.42).setOrigin(0, 0)

    // Skip button (top right) - rounded pill
    this.skipButton = this.createRoundedButton(width - 110, 56, 170, 56, 'SKIP  ✕', C.white, 0xcfe3df, '#1f8e87', 22, () => {
      this.resumeAudio()
      this.registry.set('pudgy_tutorial_completed', true)
      this.sound.play('game_start', { volume: 0.7 })
      this.scene.stop('TutorialScene')
      if (this.scene.get('PudgyGameScene')) {
        this.scene.stop('PudgyGameScene')
      }
      this.scene.start('PudgyGameScene')
    })

    // Page container
    this.pageContent = this.add.container(0, 0)

    // Navigation buttons
    this.prevButton = this.createRoundedButton(130, height - 110, 170, 70, '‹  PREV', C.white, 0xcfe3df, '#1f8e87', 24, () => this.previousPage())
    this.nextButton = this.createRoundedButton(width - 130, height - 110, 170, 70, 'NEXT  ›', C.tealLight, C.tealDark, '#ffffff', 24, () => this.nextPage())

    // Show first page
    this.showPage(0)
  }

  private resumeAudio() {
    if (this.sound.context && this.sound.context.state === 'suspended') {
      this.sound.context.resume().catch(() => {})
    }
  }

  private showPage(pageNum: number) {
    this.currentPage = pageNum
    this.pageContent.removeAll(true)

    const { width, height } = this.cameras.main

    // White sheet
    this.drawSheet()

    // Page dots indicator
    this.drawDots(width / 2, height - 250, pageNum)

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
      const startButton = this.createRoundedButton(width - 130, height - 110, 180, 70, 'START  ▶', C.coral, C.coralDark, '#ffffff', 24, () => {
        this.resumeAudio()
        this.registry.set('pudgy_tutorial_completed', true)
        this.sound.play('game_start', { volume: 0.7 })
        this.scene.stop('TutorialScene')
        if (this.scene.get('PudgyGameScene')) {
          this.scene.stop('PudgyGameScene')
        }
        this.scene.start('PudgyGameScene')
      })
      this.pageContent.add(startButton)
    }
  }

  // ---- Shared chrome ----

  private drawSheet() {
    const { width } = this.cameras.main
    const sheetX = 40, sheetY = 130, sheetW = width - 80, sheetH = 760
    const g = this.add.graphics()
    g.fillStyle(0x000000, 0.18)
    g.fillRoundedRect(sheetX, sheetY + 10, sheetW, sheetH, 36)
    g.fillStyle(0xffffff, 1)
    g.fillRoundedRect(sheetX, sheetY, sheetW, sheetH, 36)
    this.pageContent.add(g)
  }

  private headerPill(label: string, accent: number) {
    const { width } = this.cameras.main
    const y = 188
    const text = this.add.text(width / 2, y, label, {
      fontFamily: 'Nunito',
      fontStyle: '900',
      fontSize: '20px',
      color: this.hex(accent),
    })
    text.setOrigin(0.5)
    const w = text.width + 44
    const h = 40
    const pill = this.add.graphics()
    pill.fillStyle(accent, 0.12)
    pill.fillRoundedRect(width / 2 - w / 2, y - h / 2, w, h, h / 2)
    this.pageContent.add(pill)
    this.pageContent.add(text)
  }

  // A pastel "legend" row: chip background + icon + title + subtitle
  private legendRow(y: number, chip: number, iconKey: string, iconSize: number, title: string, subtitle: string, subColor: number) {
    const { width } = this.cameras.main
    const rowX = 76, rowW = width - 152, rowH = 86

    const g = this.add.graphics()
    g.fillStyle(chip, 1)
    g.fillRoundedRect(rowX, y - rowH / 2, rowW, rowH, 22)
    this.pageContent.add(g)

    const icon = this.add.image(rowX + 50, y, iconKey)
    icon.setDisplaySize(iconSize, iconSize)
    this.pageContent.add(icon)

    const titleText = this.add.text(rowX + 100, y - 16, title, {
      fontFamily: 'Fredoka',
      fontStyle: '600',
      fontSize: '26px',
      color: '#16413c',
    })
    titleText.setOrigin(0, 0.5)
    this.pageContent.add(titleText)

    const subText = this.add.text(rowX + 100, y + 16, subtitle, {
      fontFamily: 'Nunito',
      fontStyle: '700',
      fontSize: '18px',
      color: this.hex(subColor),
    })
    subText.setOrigin(0, 0.5)
    this.pageContent.add(subText)
  }

  private drawDots(x: number, y: number, active: number) {
    const gap = 24
    for (let i = 0; i < this.totalPages; i++) {
      const dot = this.add.circle(x + (i - (this.totalPages - 1) / 2) * gap, y, 7, i === active ? C.coral : 0xd3e3f0)
      this.pageContent.add(dot)
    }
  }

  // ---- Pages ----

  private showControlsPage() {
    const { width } = this.cameras.main

    this.headerPill('HOW TO PLAY', C.teal)

    const title = this.add.text(width / 2, 250, 'Catch the fish', {
      fontFamily: 'Fredoka',
      fontStyle: '700',
      fontSize: '46px',
      color: '#16413c',
    })
    title.setOrigin(0.5)
    this.pageContent.add(title)

    const controlsText = this.add.text(width / 2, 312,
      'Desktop: A / D or Arrow Keys\nMobile: tap & hold left / right',
      {
        fontFamily: 'Nunito',
        fontStyle: '700',
        fontSize: '24px',
        color: '#7b94a6',
        align: 'center',
        lineSpacing: 8,
      }
    )
    controlsText.setOrigin(0.5)
    this.pageContent.add(controlsText)

    let y = 430
    const step = 102
    this.legendRow(y, ROW_MINT, 'blue_fish', 56, 'Catch fish', 'Score points', C.teal)
    y += step
    this.legendRow(y, ROW_PEACH, 'golden_fish', 56, 'Fill the bar', 'Trigger Frenzy Mode', 0xcf9a16)
    y += step
    this.legendRow(y, ROW_ROSE, 'trash', 50, 'Avoid trash', '−1 life', C.coral)
    y += step
    this.legendRow(y, ROW_ROSE, 'shark', 58, 'Watch for sharks!', 'They strike from above', C.coral)
  }

  private showCollectiblesPage() {
    const { width } = this.cameras.main

    this.headerPill('COLLECTIBLES', C.teal)

    const title = this.add.text(width / 2, 250, 'Good stuff', {
      fontFamily: 'Fredoka',
      fontStyle: '700',
      fontSize: '46px',
      color: '#16413c',
    })
    title.setOrigin(0.5)
    this.pageContent.add(title)

    let y = 360
    const step = 102
    this.legendRow(y, ROW_MINT, 'blue_fish', 54, 'Blue fish', '+10 points', C.teal)
    y += step
    this.legendRow(y, ROW_MINT, 'red_fish', 54, 'Red fish', '+15 points', C.teal)
    y += step
    this.legendRow(y, ROW_PEACH, 'golden_fish', 54, 'Golden fish', '+50 & 3× for 7s', 0xcf9a16)
    y += step
    this.legendRow(y, ROW_MINT, 'heart', 50, 'Heart', 'Restore 1 life', C.teal)
    y += step
    this.legendRow(y, ROW_MINT, 'shield', 50, 'Shield', '5s invincibility', C.teal)
  }

  private showDangersPage() {
    const { width } = this.cameras.main

    this.headerPill('DANGERS', C.coral)

    const title = this.add.text(width / 2, 250, 'Watch out', {
      fontFamily: 'Fredoka',
      fontStyle: '700',
      fontSize: '46px',
      color: '#16413c',
    })
    title.setOrigin(0.5)
    this.pageContent.add(title)

    let y = 380
    const step = 110
    this.legendRow(y, ROW_ROSE, 'trash', 50, 'Trash', '−1 life · resets multiplier', C.coral)
    y += step
    this.legendRow(y, ROW_ROSE, 'bird', 52, 'Birds', '−1 life · resets multiplier', C.coral)
    y += step
    this.legendRow(y, ROW_ROSE, 'shark', 58, 'Sharks', '−1 life · watch the warning!', C.coral)

    const note = this.add.text(width / 2, y + 96,
      'Hitting any obstacle resets your\nFrenzy bar and multiplier.',
      {
        fontFamily: 'Nunito',
        fontStyle: '700',
        fontSize: '20px',
        color: '#7b94a6',
        align: 'center',
        lineSpacing: 6,
      }
    )
    note.setOrigin(0.5)
    this.pageContent.add(note)
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

  // ---- Helpers ----

  private hex(color: number): string {
    return '#' + color.toString(16).padStart(6, '0')
  }

  private createRoundedButton(
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    fill: number,
    shadow: number,
    textColor: string,
    fontSize: number,
    callback: () => void,
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y)
    const r = Math.min(h / 2, 22)

    const g = this.add.graphics()
    const draw = (offset: number) => {
      g.clear()
      g.fillStyle(shadow, 1)
      g.fillRoundedRect(-w / 2, -h / 2 + 6, w, h, r)
      g.fillStyle(fill, 1)
      g.fillRoundedRect(-w / 2, -h / 2 + offset, w, h - 4, r)
      g.lineStyle(3, 0xffffff, 1)
      g.strokeRoundedRect(-w / 2, -h / 2 + offset, w, h - 4, r)
    }
    draw(0)

    const text = this.add.text(0, -2, label, {
      fontFamily: 'Fredoka',
      fontStyle: '600',
      fontSize: `${fontSize}px`,
      color: textColor,
    })
    text.setOrigin(0.5)

    container.add([g, text])
    container.setSize(w, h)

    const hit = this.add.zone(0, 0, w, h).setOrigin(0.5)
    hit.setInteractive({ useHandCursor: true })
    container.add(hit)

    hit
      .on('pointerover', () => container.setScale(1.04))
      .on('pointerout', () => {
        container.setScale(1)
        draw(0)
      })
      .on('pointerdown', () => draw(4))
      .on('pointerup', () => {
        draw(0)
        container.setScale(1.04)
        callback()
      })

    return container
  }
}
