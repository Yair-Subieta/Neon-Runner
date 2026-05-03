import Phaser from 'phaser'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' })
    this.stars = []
  }

  create() {
    const { width: W, height: H } = this.scale

    this.createBackground(W, H)
    this.createStars(W, H)
    this.createGrid(W, H)
    this.createTitle(W, H)
    this.createCharacterPreview(W, H)
    this.createUI(W, H)

    this.cameras.main.fadeIn(600, 0, 0, 0)
  }

  createBackground(W, H) {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a0a0f)
    this.add.rectangle(W / 2, H, W, 80, 0x00ffcc, 0.03)
    this.add.rectangle(W / 2, H * 0.72, W, 1, 0x00ffcc, 0.3)
  }

  createStars(W, H) {
    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(0, W)
      const y = Phaser.Math.Between(0, H * 0.7)
      const size = Phaser.Math.FloatBetween(0.5, 2)
      const alpha = Phaser.Math.FloatBetween(0.2, 0.8)
      const star = this.add.circle(x, y, size, 0xffffff, alpha)
      this.stars.push(star)
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

  createGrid(W, H) {
    const g = this.add.graphics()
    const vanishX = W / 2
    const vanishY = H * 0.72
    const groundY = H + 20

    g.lineStyle(1, 0x00ffcc, 0.08)
    for (let i = -12; i <= 12; i++) {
      const startX = vanishX + i * 18
      const endX = vanishX + i * 220
      g.beginPath()
      g.moveTo(startX, vanishY)
      g.lineTo(endX, groundY)
      g.strokePath()
    }

    for (let i = 0; i < 8; i++) {
      const t = i / 8
      const y = Phaser.Math.Linear(vanishY, groundY, t * t)
      g.lineStyle(1, 0x00ffcc, 0.04 + t * 0.08)
      g.beginPath()
      g.moveTo(0, y)
      g.lineTo(W, y)
      g.strokePath()
    }
  }

  createTitle(W, H) {
    // Sombras
    this.add.text(W / 2 + 3, H * 0.18 + 3, 'NEON', {
      fontFamily: 'monospace', fontSize: '72px', color: '#003322', fontStyle: 'bold'
    }).setOrigin(0.5)
    this.add.text(W / 2 + 3, H * 0.18 + 78, 'RUNNER', {
      fontFamily: 'monospace', fontSize: '72px', color: '#220022', fontStyle: 'bold'
    }).setOrigin(0.5)

    // Títulos
    const titleTop = this.add.text(W / 2, H * 0.18, 'NEON', {
      fontFamily: 'monospace', fontSize: '72px', color: '#00ffcc',
      fontStyle: 'bold', stroke: '#00ffcc', strokeThickness: 1
    }).setOrigin(0.5).setAlpha(0)

    const titleBot = this.add.text(W / 2, H * 0.18 + 78, 'RUNNER', {
      fontFamily: 'monospace', fontSize: '72px', color: '#ff00aa',
      fontStyle: 'bold', stroke: '#ff00aa', strokeThickness: 1
    }).setOrigin(0.5).setAlpha(0)

    const subtitle = this.add.text(W / 2, H * 0.18 + 145, '— ENDLESS —', {
      fontFamily: 'monospace', fontSize: '13px', color: '#ffffff', letterSpacing: 12
    }).setOrigin(0.5).setAlpha(0)

    this.tweens.add({ targets: titleTop, alpha: 1, y: H * 0.18 - 5, duration: 700, ease: 'Power3', delay: 200 })
    this.tweens.add({ targets: titleBot, alpha: 1, y: H * 0.18 + 73, duration: 700, ease: 'Power3', delay: 350 })
    this.tweens.add({ targets: subtitle, alpha: 0.6, duration: 600, delay: 700 })

    this.time.addEvent({
      delay: 3500,
      callback: () => this.glitchEffect(titleTop, titleBot),
      loop: true
    })
  }

  createCharacterPreview(W, H) {
    // Mini personaje animado en el suelo del menú
    const cx = W * 0.18
    const cy = H * 0.72 - 2
    const g = this.add.graphics().setAlpha(0)
    g.x = cx
    g.y = cy

    this.charGraphic = g
    this.charLegOffset = 0
    this.charLegDir = 1

    this._drawMenuChar(0)

    // Aparece con delay
    this.tweens.add({ targets: g, alpha: 1, duration: 400, delay: 900 })

    // Anima las piernas
    this.time.addEvent({
      delay: 80,
      loop: true,
      callback: () => {
        this.charLegOffset += 5 * this.charLegDir
        if (Math.abs(this.charLegOffset) >= 6) this.charLegDir *= -1
        this._drawMenuChar(this.charLegOffset)
      }
    })

    // Trail de partículas corriendo
    this.time.addEvent({
      delay: 120,
      loop: true,
      callback: () => {
        const p = this.add.rectangle(cx - 14, cy - 8, 3, 3, 0x00ffcc, 0.6)
        this.tweens.add({
          targets: p,
          x: p.x - Phaser.Math.Between(15, 35),
          y: p.y + Phaser.Math.Between(2, 8),
          alpha: 0,
          scaleX: 0, scaleY: 0,
          duration: Phaser.Math.Between(200, 380),
          onComplete: () => p.destroy()
        })
      }
    })
  }

  _drawMenuChar(legOffset) {
    const g = this.charGraphic
    g.clear()
    // Cuerpo
    g.fillStyle(0x00ffcc, 1)
    g.fillRect(-10, -52, 20, 22)
    // Visor
    g.fillStyle(0x0a0a0f, 1)
    g.fillRect(-7, -50, 14, 9)
    g.fillStyle(0xff00aa, 1)
    g.fillRect(-5, -48, 4, 5)
    g.fillRect(1, -48, 4, 5)
    // Torso
    g.fillStyle(0x00ccaa, 1)
    g.fillRect(-9, -30, 8, 22 + legOffset)
    g.fillRect(1, -30, 8, 22 - legOffset)
    // Glow suave
    g.fillStyle(0x00ffcc, 0.05)
    g.fillEllipse(0, -26, 44, 58)
  }

  createUI(W, H) {
    const btnY = H * 0.72 - 55

    const btnBg = this.add.rectangle(W / 2, btnY, 220, 44, 0x00ffcc, 0)
      .setStrokeStyle(1.5, 0x00ffcc, 0.8)
      .setAlpha(0)
      .setInteractive({ useHandCursor: true })

    const btnText = this.add.text(W / 2, btnY, '▶  JUGAR', {
      fontFamily: 'monospace', fontSize: '16px', color: '#00ffcc', letterSpacing: 4
    }).setOrigin(0.5).setAlpha(0)

    // Instrucciones de controles
    const ctrlText = this.add.text(W / 2, btnY + 55, '↑  /  ESPACIO  /  W  /  TAP  — saltar', {
      fontFamily: 'monospace', fontSize: '10px', color: '#ffffff'
    }).setOrigin(0.5).setAlpha(0)

    const ctrlText2 = this.add.text(W / 2, btnY + 70, 'doble salto disponible en el aire', {
      fontFamily: 'monospace', fontSize: '10px', color: '#00ffcc'
    }).setOrigin(0.5).setAlpha(0)

    // Mejor score real desde el registry
    const best = this.registry.get('bestScore') || 0
    const highScore = this.add.text(W / 2, H - 24, `MEJOR: ${Math.floor(best)} m`, {
      fontFamily: 'monospace', fontSize: '12px', color: '#ff00aa', letterSpacing: 3
    }).setOrigin(0.5).setAlpha(0)

    // Versión
    this.add.text(W - 10, H - 10, 'v1.0', {
      fontFamily: 'monospace', fontSize: '9px', color: '#ffffff'
    }).setOrigin(1, 1).setAlpha(0.2)

    // Entradas
    this.tweens.add({ targets: [btnBg, btnText], alpha: 1, duration: 500, delay: 900 })
    this.tweens.add({ targets: ctrlText, alpha: 0.35, duration: 500, delay: 1100 })
    this.tweens.add({ targets: ctrlText2, alpha: 0.5, duration: 500, delay: 1200 })
    this.tweens.add({ targets: highScore, alpha: 0.7, duration: 500, delay: 1300 })

    btnBg.on('pointerover', () => {
      btnBg.setFillStyle(0x00ffcc, 0.15)
      btnText.setStyle({ color: '#ffffff' })
    })
    btnBg.on('pointerout', () => {
      btnBg.setFillStyle(0x00ffcc, 0)
      btnText.setStyle({ color: '#00ffcc' })
    })
    btnBg.on('pointerdown', () => this.startGame())

    this.input.keyboard.once('keydown-SPACE', () => this.startGame())
    this.input.keyboard.once('keydown-UP', () => this.startGame())
    this.input.keyboard.once('keydown-W', () => this.startGame())

    // Pulso del botón
    this.tweens.add({
      targets: [btnBg, btnText],
      scaleX: 1.02, scaleY: 1.02,
      duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    })
  }

  glitchEffect(t1, t2) {
    const ox1 = t1.x
    const ox2 = t2.x
    let flashes = 0
    this.time.addEvent({
      delay: 50, repeat: 5,
      callback: () => {
        t1.setX(ox1 + Phaser.Math.Between(-3, 3))
        t2.setX(ox2 + Phaser.Math.Between(-3, 3))
        t1.setAlpha(flashes % 2 === 0 ? 0.4 : 1)
        flashes++
      }
    })
    this.time.delayedCall(350, () => {
      t1.setX(ox1).setAlpha(1)
      t2.setX(ox2).setAlpha(1)
    })
  }

  startGame() {
    this.cameras.main.fadeOut(400, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene')
    })
  }
}