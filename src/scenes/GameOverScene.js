import Phaser from 'phaser'

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' })
  }

  init(data) {
    this.finalScore = data.score || 0
    this.bestScore = data.bestScore || 0
  }

  create() {
    const W = this.scale.width
    const H = this.scale.height

    // Fondo oscuro semi-transparente
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a0a0f, 0.95)

    // Líneas decorativas
    const g = this.add.graphics()
    g.lineStyle(1, 0xff2244, 0.3)
    g.beginPath()
    g.moveTo(0, H * 0.3); g.lineTo(W, H * 0.3)
    g.moveTo(0, H * 0.75); g.lineTo(W, H * 0.75)
    g.strokePath()

    // Título GAME OVER
    const title = this.add.text(W / 2, H * 0.22, 'GAME OVER', {
      fontFamily: 'monospace',
      fontSize: '52px',
      color: '#ff2244',
      stroke: '#ff2244',
      strokeThickness: 1,
      fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0)

    // Score final
    const scoreLabel = this.add.text(W / 2, H * 0.42, 'DISTANCIA', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#ffffff',
      alpha: 0.5,
      letterSpacing: 6
    }).setOrigin(0.5).setAlpha(0)

    const scoreVal = this.add.text(W / 2, H * 0.52, `${Math.floor(this.finalScore)} m`, {
      fontFamily: 'monospace',
      fontSize: '40px',
      color: '#00ffcc',
      fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0)

    // Mejor score
    const isNewBest = this.finalScore >= this.bestScore
    const bestLabel = this.add.text(W / 2, H * 0.63, isNewBest ? '★  NUEVO RÉCORD  ★' : `MEJOR: ${Math.floor(this.bestScore)} m`, {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: isNewBest ? '#ffdd00' : '#888888',
      letterSpacing: 3
    }).setOrigin(0.5).setAlpha(0)

    // Botones
    const btnRestart = this.createButton(W / 2 - 90, H * 0.82, 'REINTENTAR', 0x00ffcc)
    const btnMenu = this.createButton(W / 2 + 90, H * 0.82, 'MENÚ', 0xff00aa)

    btnRestart.setAlpha(0)
    btnMenu.setAlpha(0)

    // Animaciones entrada
    this.tweens.add({ targets: title, alpha: 1, y: H * 0.22 - 5, duration: 600, ease: 'Power3' })
    this.tweens.add({ targets: scoreLabel, alpha: 0.5, duration: 400, delay: 300 })
    this.tweens.add({ targets: scoreVal, alpha: 1, duration: 500, delay: 450 })
    this.tweens.add({ targets: bestLabel, alpha: 1, duration: 400, delay: 650 })
    this.tweens.add({ targets: [btnRestart, btnMenu], alpha: 1, duration: 400, delay: 850 })

    // Glitch en título
    if (isNewBest) {
      this.tweens.add({
        targets: bestLabel,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })
    }

    // Inputs
    btnRestart.getAt(0).on('pointerdown', () => this.restart())
    btnMenu.getAt(0).on('pointerdown', () => this.goMenu())
    this.input.keyboard.once('keydown-SPACE', () => this.restart())
    this.input.keyboard.once('keydown-R', () => this.restart())

    this.cameras.main.fadeIn(400, 0, 0, 0)
  }

  createButton(x, y, label, color) {
    const container = this.add.container(x, y)

    const bg = this.add.rectangle(0, 0, 150, 40, color, 0)
      .setStrokeStyle(1.5, color, 0.9)
      .setInteractive({ useHandCursor: true })

    const text = this.add.text(0, 0, label, {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: `#${color.toString(16).padStart(6, '0')}`,
      letterSpacing: 3
    }).setOrigin(0.5)

    bg.on('pointerover', () => { bg.setFillStyle(color, 0.15); text.setStyle({ color: '#ffffff' }) })
    bg.on('pointerout', () => { bg.setFillStyle(color, 0); text.setStyle({ color: `#${color.toString(16).padStart(6, '0')}` }) })

    container.add([bg, text])
    return container
  }

  restart() {
    this.cameras.main.fadeOut(300, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene')
    })
  }

  goMenu() {
    this.cameras.main.fadeOut(300, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MenuScene')
    })
  }
}