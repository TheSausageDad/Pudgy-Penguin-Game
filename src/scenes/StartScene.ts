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

export class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' })
  }

  preload() {
    // Hero + fish sprites for the drawn Sunset Reef home screen
    this.load.image('penguin', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/Penguin-pa081jGQgZll7Q8pPekZuLmbJ71fms.png?8KmQ')
    this.load.image('blue_fish', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/Blue%20Fish-sg15xOysFaz1zmk5kkMJeDCEqC6xOn.png?MSgz')
    this.load.image('gold_fish', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/Gold%20Fish-HNiwNVRRu8mbsE2NLMJNGDdyKsAEMu.png?I4n9')

    // Load game start sound
    this.load.audio('game_start', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/game%20start-RHdnzRKrjI9adHseJbv8QJP8KT1Ajy.wav?sXuB')
  }

  create() {
    const { width, height } = this.cameras.main

    // Drawn Sunset Reef scene (replaces the old photo background)
    this.drawScenery(width, height)
    this.drawTitleAndHero(width, height)

    // Play Button (coral)
    this.createRoundedButton(width / 2, height * 0.605, 430, 116, '▶  PLAY', C.coral, C.coralDark, '#ffffff', 50, () => {
      this.resumeAudio()
      this.sound.play('game_start', { volume: 0.7 })

      const tutorialCompleted = localStorage.getItem('pudgy_tutorial_completed')
      this.scene.stop('StartScene')
      if (this.scene.get('PudgyGameScene')) {
        this.scene.stop('PudgyGameScene')
      }
      if (tutorialCompleted === 'true') {
        this.scene.start('PudgyGameScene')
      } else {
        this.scene.start('TutorialScene')
      }
    })

    // How to Play Button (teal)
    this.createRoundedButton(width / 2, height * 0.735, 380, 96, 'How to Play', C.tealLight, C.tealDark, '#ffffff', 38, () => {
      this.resumeAudio()
      this.sound.play('game_start', { volume: 0.7 })
      this.scene.stop('StartScene')
      if (this.scene.get('TutorialScene')) {
        this.scene.stop('TutorialScene')
      }
      this.scene.start('TutorialScene')
    })

    // Best score pill
    this.createBestPill(width / 2, height * 0.85)
  }

  private drawScenery(width: number, height: number) {
    const g = this.add.graphics()
    // Sky-to-water gradient: peach at top, teal at the bottom
    g.fillGradientStyle(0xffe1c6, 0xffe1c6, 0x6fcec4, 0x6fcec4, 1)
    g.fillRect(0, 0, width, height * 0.58)
    g.fillGradientStyle(0x6fcec4, 0x6fcec4, 0x2fa79f, 0x2fa79f, 1)
    g.fillRect(0, height * 0.58, width, height * 0.42)
    // Warm sun glow (top-right)
    g.fillStyle(0xfff0d8, 0.5)
    g.fillCircle(width - 150, 150, 150)
    g.fillStyle(0xfff0d8, 0.3)
    g.fillCircle(width - 150, 150, 230)
    // Reef base dome at the bottom
    g.fillStyle(0x1f8e87, 1)
    g.fillEllipse(width / 2, height + 80, width * 1.5, 500)
  }

  private drawTitleAndHero(width: number, height: number) {
    // Eyebrow pill
    const eb = this.add.text(width / 2, 80, 'PUDGY PENGUINS', {
      fontFamily: 'Nunito', fontStyle: '900', fontSize: '22px', color: '#c2683f',
    }).setOrigin(0.5)
    const ew = eb.width + 56
    const ebg = this.add.graphics()
    ebg.fillStyle(0xffffff, 0.8)
    ebg.fillRoundedRect(width / 2 - ew / 2, 80 - 22, ew, 44, 22)
    eb.setDepth(1)

    // Title
    this.add.text(width / 2, 122, 'FISH', {
      fontFamily: 'Fredoka', fontStyle: '700', fontSize: '120px', color: '#ffffff',
    }).setOrigin(0.5, 0).setShadow(0, 4, '#e8845a', 0, true, false)
    this.add.text(width / 2, 232, 'CATCH', {
      fontFamily: 'Fredoka', fontStyle: '700', fontSize: '120px', color: '#ffffff',
    }).setOrigin(0.5, 0).setShadow(0, 4, '#e8845a', 0, true, false)

    // Floating fish
    const blue = this.add.image(120, 500, 'blue_fish')
    blue.setScale(120 / blue.width).setAngle(6)
    this.tweens.add({ targets: blue, y: 478, duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })

    const gold = this.add.image(width - 110, 580, 'gold_fish')
    gold.setScale(112 / gold.width).setAngle(-8)
    this.tweens.add({ targets: gold, y: 560, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })

    // Penguin hero (buttons are created after this, so they render on top)
    const penguin = this.add.image(width / 2, 470, 'penguin')
    penguin.setScale(270 / penguin.width)
    this.tweens.add({ targets: penguin, y: 450, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
  }

  private resumeAudio() {
    if (this.sound.context && this.sound.context.state === 'suspended') {
      this.sound.context.resume().catch((error) => {
        console.error('[Audio] Failed to resume AudioContext:', error)
      })
    }
  }

  private createBestPill(x: number, y: number) {
    const best = parseInt(localStorage.getItem('pudgy_best_score') || '0', 10)
    const label = `★ BEST   ${best.toLocaleString()}`

    const text = this.add.text(x, y, label, {
      fontFamily: 'Nunito',
      fontStyle: '800',
      fontSize: '30px',
      color: '#16413c',
    })
    text.setOrigin(0.5)

    const padX = 30
    const w = text.width + padX * 2
    const h = 58

    const pill = this.add.graphics()
    pill.fillStyle(0xffffff, 0.78)
    pill.fillRoundedRect(x - w / 2, y - h / 2, w, h, h / 2)
    pill.lineStyle(2, 0xffffff, 1)
    pill.strokeRoundedRect(x - w / 2, y - h / 2, w, h, h / 2)

    // Keep text above the pill background
    text.setDepth(1)
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
    const r = Math.min(h / 2, 26)

    const g = this.add.graphics()
    const draw = (offset: number) => {
      g.clear()
      // 3D drop shadow
      g.fillStyle(shadow, 1)
      g.fillRoundedRect(-w / 2, -h / 2 + 8, w, h, r)
      // Face
      g.fillStyle(fill, 1)
      g.fillRoundedRect(-w / 2, -h / 2 + offset, w, h - 4, r)
      // White rim
      g.lineStyle(4, 0xffffff, 1)
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
      .on('pointerdown', () => {
        draw(6) // press the face down toward the shadow
      })
      .on('pointerup', () => {
        draw(0)
        container.setScale(1.04)
        callback()
      })

    return container
  }
}
