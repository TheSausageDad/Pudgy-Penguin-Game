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
    // Load background image
    this.load.image('menu_background', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/Background%20MM-xtHJKuiJfqpn1DKSmc3i4b0KzQXHr4.png?KUwm')

    // Load banner image (official Pudgy "Fish Catch" title art)
    this.load.image('banner', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/Banner-xHrdywi3QBFz4lB4Sg2aOBdvzJW9f2.png?dJQT')

    // Load game start sound
    this.load.audio('game_start', 'https://lqy3lriiybxcejon.public.blob.vercel-storage.com/a419a4e5-9cbc-4586-8ef3-fde74c7c187e/game%20start-RHdnzRKrjI9adHseJbv8QJP8KT1Ajy.wav?sXuB')
  }

  create() {
    const { width, height } = this.cameras.main

    // Background image (cover)
    const background = this.add.image(width / 2, height / 2, 'menu_background')
    const scaleX = width / background.width
    const scaleY = height / background.height
    const scale = Math.max(scaleX, scaleY)
    background.setScale(scale)

    // Soft warm-to-cool wash so the UI reads cleanly over any background art
    const wash = this.add.graphics()
    wash.fillStyle(0xffc69f, 0.18)
    wash.fillRect(0, 0, width, height * 0.5)
    wash.fillStyle(0x1fb6a6, 0.12)
    wash.fillRect(0, height * 0.5, width, height * 0.5)

    // Banner / title art
    const banner = this.add.image(width / 2, height * 0.30, 'banner')
    const bannerTargetWidth = 560
    banner.setScale(bannerTargetWidth / banner.width)

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
