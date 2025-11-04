export default class HowToPlayScene extends Phaser.Scene {
  private currentPage: number = 0;
  private readonly totalPages: number = 3;
  private contentContainer!: Phaser.GameObjects.Container;
  private leftArrow!: Phaser.GameObjects.Container;
  private rightArrow!: Phaser.GameObjects.Container;
  private pageIndicator!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'HowToPlayScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0f0c29, 0x0f0c29, 0x302b63, 0x24243e, 1);
    bg.fillRect(0, 0, width, height);

    // Decorative elements
    this.createDecorativeElements();

    // Title with glow effect
    const titleBg = this.add.rectangle(width / 2, 60, 400, 70, 0x000000, 0.3);
    titleBg.setStrokeStyle(2, 0xffd700);

    const title = this.add.text(width / 2, 60, 'HOW TO PLAY', {
      fontSize: '48px',
      fontFamily: 'Arial Black',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Content container
    this.contentContainer = this.add.container(0, 0);

    // Navigation arrows
    this.createArrows();

    // Page indicator with background
    const indicatorBg = this.add.rectangle(width / 2, height - 40, 120, 35, 0x000000, 0.5);
    indicatorBg.setStrokeStyle(2, 0xffd700);

    this.pageIndicator = this.add.text(width / 2, height - 40, '', {
      fontSize: '18px',
      fontFamily: 'Arial Black',
      color: '#ffd700'
    }).setOrigin(0.5);

    // Back button with better styling
    const backButtonBg = this.add.rectangle(100, 60, 150, 50, 0x8b0000)
      .setStrokeStyle(2, 0xff6b6b)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        backButtonBg.setFillStyle(0xb22222);
        backButtonBg.setScale(1.05);
      })
      .on('pointerout', () => {
        backButtonBg.setFillStyle(0x8b0000);
        backButtonBg.setScale(1);
      })
      .on('pointerdown', () => this.scene.start('LevelSelectionScene'));

    this.add.text(100, 60, 'BACK', {
      fontSize: '24px',
      fontFamily: 'Arial Black',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Display first page
    this.displayPage(0);
  }

  private createDecorativeElements(): void {
    const { width, height } = this.cameras.main;

    // Corner decorations
    const cornerGraphics = this.add.graphics();
    cornerGraphics.lineStyle(3, 0xffd700, 0.3);

    // Top left
    cornerGraphics.strokeRect(20, 20, 80, 80);
    // Top right
    cornerGraphics.strokeRect(width - 100, 20, 80, 80);
    // Bottom left
    cornerGraphics.strokeRect(20, height - 100, 80, 80);
    // Bottom right
    cornerGraphics.strokeRect(width - 100, height - 100, 80, 80);
  }

  private createArrows(): void {
    const { width, height } = this.cameras.main;
    const arrowY = height / 2;
    const arrowSize = 40;

    // Left arrow container
    this.leftArrow = this.add.container(60, arrowY);

    const leftBg = this.add.circle(0, 0, arrowSize, 0x000000, 0.5);
    leftBg.setStrokeStyle(2, 0xffd700);

    const leftArrowGraphic = this.add.graphics();
    leftArrowGraphic.fillStyle(0xffd700, 1);
    leftArrowGraphic.fillTriangle(10, 0, -10, -15, -10, 15);

    this.leftArrow.add([leftBg, leftArrowGraphic]);
    this.leftArrow.setSize(arrowSize * 2, arrowSize * 2);
    this.leftArrow.setInteractive({ useHandCursor: true });
    this.leftArrow.on('pointerover', () => this.leftArrow.setScale(1.1));
    this.leftArrow.on('pointerout', () => this.leftArrow.setScale(1));
    this.leftArrow.on('pointerdown', () => this.previousPage());

    // Right arrow container
    this.rightArrow = this.add.container(width - 60, arrowY);

    const rightBg = this.add.circle(0, 0, arrowSize, 0x000000, 0.5);
    rightBg.setStrokeStyle(2, 0xffd700);

    const rightArrowGraphic = this.add.graphics();
    rightArrowGraphic.fillStyle(0xffd700, 1);
    rightArrowGraphic.fillTriangle(-10, 0, 10, -15, 10, 15);

    this.rightArrow.add([rightBg, rightArrowGraphic]);
    this.rightArrow.setSize(arrowSize * 2, arrowSize * 2);
    this.rightArrow.setInteractive({ useHandCursor: true });
    this.rightArrow.on('pointerover', () => this.rightArrow.setScale(1.1));
    this.rightArrow.on('pointerout', () => this.rightArrow.setScale(1));
    this.rightArrow.on('pointerdown', () => this.nextPage());
  }

  private previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.displayPage(this.currentPage);
    }
  }

  private nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.displayPage(this.currentPage);
    }
  }

  private displayPage(pageNumber: number): void {
    // Clear previous content
    this.contentContainer.removeAll(true);

    const { width, height } = this.cameras.main;
    const contentX = width / 2;
    const startY = 140;

    // Content background panel
    const panelWidth = 680; // Fits within 720px canvas with margins
    const panelHeight = 500;
    const panel = this.add.rectangle(contentX, height / 2 + 20, panelWidth, panelHeight, 0x000000, 0.6);
    panel.setStrokeStyle(3, 0xffd700, 0.8);
    this.contentContainer.add(panel);

    switch (pageNumber) {
      case 0: // Basics
        this.createSection('HOW TO PLAY', startY, contentX, '#ffd700', '32px');

        this.addSimpleText('Stop the carrots from reaching the end!', startY + 60, contentX, '#ffffff', '20px');

        this.addSimpleText('STARTING:', startY + 120, contentX, '#ffd700', '24px');
        this.addBulletPoint('100 Lives', startY + 155, contentX);
        this.addBulletPoint('650 Coins', startY + 185, contentX);
        this.addBulletPoint('Survive 118 waves', startY + 215, contentX);

        this.addSimpleText('GAMEPLAY:', startY + 270, contentX, '#ffd700', '24px');
        this.addBulletPoint('Place towers off the path', startY + 305, contentX);
        this.addBulletPoint('Towers auto-attack enemies', startY + 335, contentX);
        this.addBulletPoint('Kill enemies to earn coins', startY + 365, contentX);
        this.addBulletPoint('Don\'t let them escape!', startY + 395, contentX);

        break;

      case 1: // Towers & Upgrades
        this.createSection('TOWERS & UPGRADES', startY, contentX, '#ffd700', '32px');

        this.addSimpleText('TOWER TYPES:', startY + 60, contentX, '#ffd700', '24px');
        this.addBulletPoint('Basic: $90-$120', startY + 95, contentX, '#7cfc00');
        this.addBulletPoint('Medium: $200-$300', startY + 125, contentX, '#4a90e2');
        this.addBulletPoint('Advanced: $350-$420', startY + 155, contentX, '#9b59b6');
        this.addBulletPoint('Elite: $500-$800', startY + 185, contentX, '#ffd700');

        this.addSimpleText('UPGRADES:', startY + 240, contentX, '#ffd700', '24px');
        this.addBulletPoint('Click tower to upgrade', startY + 275, contentX);
        this.addBulletPoint('Choose 1 of 2-3 paths', startY + 305, contentX);
        this.addBulletPoint('Each path is unique', startY + 335, contentX);
        this.addBulletPoint('Sell for 70% refund', startY + 365, contentX);

        break;

      case 2: // Tips
        this.createSection('WINNING TIPS', startY, contentX, '#ffd700', '32px');

        this.addSimpleText('EARLY GAME:', startY + 60, contentX, '#7cfc00', '24px');
        this.addBulletPoint('Buy 3-5 basic towers', startY + 95, contentX);
        this.addBulletPoint('Place at chokepoints', startY + 125, contentX);

        this.addSimpleText('MID GAME:', startY + 175, contentX, '#4a90e2', '24px');
        this.addBulletPoint('Start upgrading towers', startY + 210, contentX);
        this.addBulletPoint('Add medium towers', startY + 240, contentX);

        this.addSimpleText('LATE GAME:', startY + 290, contentX, '#ff6b6b', '24px');
        this.addBulletPoint('Max out best towers', startY + 325, contentX);
        this.addBulletPoint('Save for elite towers', startY + 355, contentX);

        this.addSimpleText('PRO TIP: Use 2x/3x speed!', startY + 410, contentX, '#ffaa00', '20px', true);

        break;
    }

    // Update page indicator
    this.pageIndicator.setText(`${pageNumber + 1} / ${this.totalPages}`);

    // Update arrow visibility
    this.leftArrow.setAlpha(pageNumber > 0 ? 1 : 0.3);
    this.rightArrow.setAlpha(pageNumber < this.totalPages - 1 ? 1 : 0.3);
  }

  // Helper methods for creating visual elements
  private createSection(text: string, y: number, x: number, color: string, size: string): void {
    const sectionText = this.add.text(x, y, text, {
      fontSize: size,
      fontFamily: 'Arial Black',
      color: color,
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center'
    }).setOrigin(0.5);
    this.contentContainer.add(sectionText);
  }

  private addSimpleText(text: string, y: number, x: number, color: string, size: string, italic: boolean = false): void {
    const textObj = this.add.text(x, y, text, {
      fontSize: size,
      fontFamily: italic ? 'Arial' : 'Arial Black',
      color: color,
      fontStyle: italic ? 'italic' : 'normal',
      align: 'center'
    }).setOrigin(0.5);
    this.contentContainer.add(textObj);
  }

  private addBulletPoint(text: string, y: number, x: number, color: string = '#ffffff'): void {
    const bullet = this.add.text(x - 280, y, '•', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffd700'
    });
    const bulletText = this.add.text(x - 260, y, text, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: color
    });
    this.contentContainer.add([bullet, bulletText]);
  }
}
