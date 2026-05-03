import Phaser from 'phaser'

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' })
  }

  init(data) {
    this.finalScore  = data.score      || 0
    this.bestScore   = data.bestScore  || 0
    this.survived    = data.survived   || 0
    this.maxSpeed    = data.maxSpeed   || 0
  }

  create() {
    const W = this.scale.width
    const H = this.scale.height
    const isNewBest = this.finalScore >= this.bestScore && this.finalScore > 0

    this.add.rectangle(W / 2, H / 2, W, H, 0x0a0a0f, 0.97)

    this._createParticlesBg(W, H)
    this._createLines(W, H, isNewBest)
    this._createTitle(W, H, isNewBest)
    this._createStats(W, H, isNewBest)
    this._createButtons(W, H)

    this.cameras.main.fadeIn(400, 0, 0, 0)
  }

  _createParticlesBg(W, H) {
    // Partículas flotantes de fondo para dar vida
    for (let i = 0; i < 18; i++) {
      const p = this.add.rectangle(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H),
        Phaser.Math.Between(1, 3),
        Phaser.Math.Between(1, 3),
        Phaser.Utils.Array.GetRandom([0x00ffcc, 0xff00aa, 0xff2244]),
        Phaser.Math.FloatBetween(0.1, 0.3)
      )
      this.tweens.add({
        targets: p,
        y: p.y - Phaser.Math.Between(40, 100),
        alpha: 0,
        duration: Phaser.Math.Between(2000, 4000),
        delay: Phaser.Math.Between(0, 2000),
        repeat: -1,
        repeatDelay: Phaser.Math.Between(500, 1500),
        onRepeat: () => {
          p.x = Phaser.Math.Between(0, W)
          p.y = H + 10
          p.alpha = Phaser.Math.FloatBetween(0.1, 0.3)
        }
      })
    }
  }

  _createLines(W, H, isNewBest) {
    const color = isNewBest ? 0xffdd00 : 0xff2244
    const g = this.add.graphics()
    g.lineStyle(1, color, 0.25)
    g.beginPath()
    g.moveTo(0, H * 0.3); g.lineTo(W, H * 0.3)
    g.moveTo(0, H * 0.78); g.lineTo(W, H * 0.78)
    g.strokePath()

    // Decoración lateral izquierda y derecha
    g.lineStyle(1, 0x00ffcc, 0.15)
    g.beginPath()
    g.moveTo(30, H * 0.3); g.lineTo(30, H * 0.78)
    g.moveTo(W - 30, H * 0.3); g.lineTo(W - 30, H * 0.78)
    g.strokePath()
  }

  _createTitle(W, H, isNewBest) {
    const titleColor = isNewBest ? '#ffdd00' : '#ff2244'
    const titleStroke = isNewBest ? '#ffdd00' : '#ff2244'
    const titleText  = isNewBest ? 'RÉCORD ★' : 'GAME OVER'

    const title = this.add.text(W / 2, H * 0.20, titleText, {
      fontFamily: 'monospace',
      fontSize: isNewBest ? '46px' : '52px',
      color: titleColor,
      stroke: titleStroke,
      strokeThickness: 1,
      fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0)

    this.tweens.add({
      targets: title,
      alpha: 1,
      y: H * 0.20 - 5,
      duration: 600,
      ease: 'Power3'
    })

    // Pulso extra si es nuevo récord
    if (isNewBest) {
      this.tweens.add({
        targets: title,
        scaleX: 1.04, scaleY: 1.04,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: 700
      })
      // Flash dorado
      this.time.delayedCall(300, () => {
        const flash = this.add.rectangle(W / 2, H / 2, W, H, 0xffdd00, 0.12)
        this.tweens.add({ targets: flash, alpha: 0, duration: 500, onComplete: () => flash.destroy() })
      })
    }
  }

  _createStats(W, H, isNewBest) {
    // --- Score con conteo animado ---
    this.add.text(W / 2, H * 0.36, 'DISTANCIA', {
      fontFamily: 'monospace', fontSize: '11px',
      color: '#ffffff', letterSpacing: 6
    }).setOrigin(0.5).setAlpha(0.5)

    const scoreVal = this.add.text(W / 2, H * 0.44, '0 m', {
      fontFamily: 'monospace', fontSize: '42px',
      color: '#00ffcc', fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0)

    this.tweens.add({ targets: scoreVal, alpha: 1, duration: 400, delay: 350 })

    // Conteo animado del score
    const target = Math.floor(this.finalScore)
    this.time.delayedCall(400, () => {
      let current = 0
      const step = Math.max(1, Math.floor(target / 40))
      const counter = this.time.addEvent({
        delay: 30,
        repeat: Math.ceil(target / step),
        callback: () => {
          current = Math.min(current + step, target)
          scoreVal.setText(`${current} m`)
        }
      })
    })

    // --- Mejor score ---
    const bestColor = isNewBest ? '#ffdd00' : '#666666'
    const bestTxt   = isNewBest
      ? `★  NUEVO RÉCORD  ★`
      : `MEJOR: ${Math.floor(this.bestScore)} m`

    const bestLabel = this.add.text(W / 2, H * 0.555, bestTxt, {
      fontFamily: 'monospace', fontSize: '13px',
      color: bestColor, letterSpacing: 3
    }).setOrigin(0.5).setAlpha(0)

    this.tweens.add({ targets: bestLabel, alpha: 1, duration: 400, delay: 600 })

    // --- Stats secundarias ---
    const statsY = H * 0.645
    const statsData = [
      { label: 'OBSTÁCULOS', value: this.survived || '—' },
      { label: 'VEL. MÁX', value: this.maxSpeed ? `${Math.floor(this.maxSpeed)}` : '—' }
    ]

    const statsCont = this.add.container(W / 2, statsY).setAlpha(0)

    statsData.forEach((s, i) => {
      const offsetX = i === 0 ? -100 : 100
      this.add.text(offsetX, -10, s.label, {
        fontFamily: 'monospace', fontSize: '9px',
        color: '#888888', letterSpacing: 3
      }).setOrigin(0.5).setAlpha(0.8)

      const valTxt = this.add.text(offsetX, 10, `${s.value}`, {
        fontFamily: 'monospace', fontSize: '18px',
        color: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5)

      statsCont.add([
        this.add.text(offsetX, -10, s.label, {
          fontFamily: 'monospace', fontSize: '9px',
          color: '#888888', letterSpacing: 3
        }).setOrigin(0.5),
        valTxt
      ])
    })

    // Separador vertical entre stats
    const sep = this.add.rectangle(0, 0, 1, 38, 0x444444, 0.6)
    statsCont.add(sep)

    this.tweens.add({ targets: statsCont, alpha: 1, duration: 400, delay: 750 })
  }

  _createButtons(W, H) {
    const btnRestart = this._createButton(W / 2 - 90, H * 0.875, 'REINTENTAR', 0x00ffcc)
    const btnMenu    = this._createButton(W / 2 + 90, H * 0.875, 'MENÚ', 0xff00aa)

    btnRestart.setAlpha(0)
    btnMenu.setAlpha(0)

    this.tweens.add({ targets: [btnRestart, btnMenu], alpha: 1, duration: 400, delay: 900 })

    // Hint de teclado
    const hint = this.add.text(W / 2, H * 0.875 + 34, 'R — reintentar   /   M — menú', {
      fontFamily: 'monospace', fontSize: '9px', color: '#ffffff'
    }).setOrigin(0.5).setAlpha(0)
    this.tweens.add({ targets: hint, alpha: 0.3, duration: 400, delay: 1100 })

    btnRestart.getAt(0).on('pointerdown', () => this.restart())
    btnMenu.getAt(0).on('pointerdown', () => this.goMenu())

    this.input.keyboard.once('keydown-SPACE', () => this.restart())
    this.input.keyboard.once('keydown-R', () => this.restart())
    this.input.keyboard.once('keydown-M', () => this.goMenu())
  }

  _createButton(x, y, label, color) {
    const container = this.add.container(x, y)
    const hex = `#${color.toString(16).padStart(6, '0')}`

    const bg = this.add.rectangle(0, 0, 155, 40, color, 0)
      .setStrokeStyle(1.5, color, 0.9)
      .setInteractive({ useHandCursor: true })

    const text = this.add.text(0, 0, label, {
      fontFamily: 'monospace', fontSize: '13px',
      color: hex, letterSpacing: 3
    }).setOrigin(0.5)

    bg.on('pointerover', () => { bg.setFillStyle(color, 0.15); text.setStyle({ color: '#ffffff' }) })
    bg.on('pointerout',  () => { bg.setFillStyle(color, 0);    text.setStyle({ color: hex }) })
    bg.on('pointerdown', () => { bg.setFillStyle(color, 0.3) })

    container.add([bg, text])
    return container
  }

  restart() {
    this.cameras.main.fadeOut(300, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('GameScene'))
  }

  goMenu() {
    this.cameras.main.fadeOut(300, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MenuScene'))
  }
}