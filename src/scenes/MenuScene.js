import Phaser from 'phaser'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' })
    this.stars = []
    this.particles = []
  }

  create() {
    const { width, height } = this.scale

    this.createBackground(width, height)
    this.createStars(width, height)
    this.createGrid(width, height)
    this.createTitle(width, height)
    this.createUI(width, height)
    this.createAnimations()

    this.cameras.main.fadeIn(600, 0, 0, 0)
  }

  createBackground(width, height) {
    // Gradiente de fondo simulado con rectángulos
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a0f)

    // Glow en la parte inferior (suelo futuro)
    const glow = this.add.rectangle(width / 2, height, width, 80, 0x00ffcc, 0.03)

    // Línea de horizonte
    this.add.rectangle(width / 2, height * 0.72, width, 1, 0x00ffcc, 0.3)
  }

  createStars(width, height) {
    // Estrellas de fondo
    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(0, width)
      const y = Phaser.Math.Between(0, height * 0.7)
      const size = Phaser.Math.FloatBetween(0.5, 2)
      const alpha = Phaser.Math.FloatBetween(0.2, 0.8)
      const star = this.add.circle(x, y, size, 0xffffff, alpha)
      this.stars.push(star)

      // Parpadeo
      this.tweens.add({
        targets: star,
        alpha: { from: alpha, to: alpha * 0.2 },
        duration: Phaser.Math.Between(800, 2500),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000)
      })
    }
  }

  createGrid(width, height) {
    const graphics = this.add.graphics()

    // Líneas verticales de perspectiva (efecto retro grid)
    graphics.lineStyle(1, 0x00ffcc, 0.08)
    const vanishX = width / 2
    const vanishY = height * 0.72
    const groundY = height + 20

    for (let i = -12; i <= 12; i++) {
      const startX = vanishX + i * 18
      const endX = vanishX + i * 220
      graphics.beginPath()
      graphics.moveTo(startX, vanishY)
      graphics.lineTo(endX, groundY)
      graphics.strokePath()
    }

    // Líneas horizontales
    for (let i = 0; i < 8; i++) {
      const t = i / 8
      const y = Phaser.Math.Linear(vanishY, groundY, t * t)
      const alpha = 0.04 + t * 0.08
      graphics.lineStyle(1, 0x00ffcc, alpha)
      graphics.beginPath()
      graphics.moveTo(0, y)
      graphics.lineTo(width, y)
      graphics.strokePath()
    }
  }

  createTitle(width, height) {
    // Sombra del título
    this.add.text(width / 2 + 3, height * 0.2 + 3, 'NEON', {
      fontFamily: 'monospace',
      fontSize: '72px',
      color: '#003322',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    this.add.text(width / 2 + 3, height * 0.2 + 75, 'RUNNER', {
      fontFamily: 'monospace',
      fontSize: '72px',
      color: '#003322',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    // Título principal
    const titleTop = this.add.text(width / 2, height * 0.2, 'NEON', {
      fontFamily: 'monospace',
      fontSize: '72px',
      color: '#00ffcc',
      fontStyle: 'bold',
      stroke: '#00ffcc',
      strokeThickness: 1
    }).setOrigin(0.5).setAlpha(0)

    const titleBot = this.add.text(width / 2, height * 0.2 + 75, 'RUNNER', {
      fontFamily: 'monospace',
      fontSize: '72px',
      color: '#ff00aa',
      fontStyle: 'bold',
      stroke: '#ff00aa',
      strokeThickness: 1
    }).setOrigin(0.5).setAlpha(0)

    // Subtítulo
    const subtitle = this.add.text(width / 2, height * 0.2 + 140, '— ENDLESS —', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#ffffff',
      letterSpacing: 12,
      alpha: 0
    }).setOrigin(0.5).setAlpha(0)

    // Animación de entrada
    this.tweens.add({ targets: titleTop, alpha: 1, y: height * 0.2 - 5, duration: 700, ease: 'Power3', delay: 200 })
    this.tweens.add({ targets: titleBot, alpha: 1, y: height * 0.2 + 70, duration: 700, ease: 'Power3', delay: 350 })
    this.tweens.add({ targets: subtitle, alpha: 0.6, duration: 600, delay: 700 })

    // Glitch ocasional en el título
    this.time.addEvent({
      delay: 3000,
      callback: () => this.glitchEffect(titleTop, titleBot),
      loop: true
    })
  }

  createUI(width, height) {
    // Botón de jugar
    const btnY = height * 0.72 - 60

    const btnBg = this.add.rectangle(width / 2, btnY, 220, 44, 0x00ffcc, 0)
      .setStrokeStyle(1.5, 0x00ffcc, 0.8)
      .setAlpha(0)
      .setInteractive({ useHandCursor: true })

    const btnText = this.add.text(width / 2, btnY, '▶  JUGAR', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#00ffcc',
      letterSpacing: 4
    }).setOrigin(0.5).setAlpha(0)

    // Instrucción teclado
    const spaceText = this.add.text(width / 2, btnY + 52, 'o presiona  ESPACIO', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#ffffff',
      alpha: 0.35
    }).setOrigin(0.5).setAlpha(0)

    // Score más alto (placeholder)
    const highScore = this.add.text(width / 2, height - 28, 'MEJOR: 0 m', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ff00aa',
      letterSpacing: 3
    }).setOrigin(0.5).setAlpha(0)

    // Animaciones de entrada
    this.tweens.add({ targets: [btnBg, btnText], alpha: 1, duration: 500, delay: 900 })
    this.tweens.add({ targets: spaceText, alpha: 0.35, duration: 500, delay: 1100 })
    this.tweens.add({ targets: highScore, alpha: 0.7, duration: 500, delay: 1200 })

    // Hover del botón
    btnBg.on('pointerover', () => {
      btnBg.setFillStyle(0x00ffcc, 0.15)
      btnText.setStyle({ color: '#ffffff' })
    })
    btnBg.on('pointerout', () => {
      btnBg.setFillStyle(0x00ffcc, 0)
      btnText.setStyle({ color: '#00ffcc' })
    })
    btnBg.on('pointerdown', () => this.startGame())

    // Teclado
    this.input.keyboard.once('keydown-SPACE', () => this.startGame())

    // Pulsación del botón
    this.tweens.add({
      targets: btnBg,
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }

  createAnimations() {
    // Línea de horizonte pulsante
  }

  glitchEffect(t1, t2) {
    const originalX1 = t1.x
    const originalX2 = t2.x
    let flashes = 0

    const glitch = this.time.addEvent({
      delay: 50,
      repeat: 5,
      callback: () => {
        t1.setX(originalX1 + Phaser.Math.Between(-3, 3))
        t2.setX(originalX2 + Phaser.Math.Between(-3, 3))
        t1.setAlpha(flashes % 2 === 0 ? 0.4 : 1)
        flashes++
      }
    })

    this.time.delayedCall(350, () => {
      t1.setX(originalX1).setAlpha(1)
      t2.setX(originalX2).setAlpha(1)
    })
  }

  startGame() {
    this.cameras.main.fadeOut(400, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene')
    })
  }
}