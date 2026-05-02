import Phaser from 'phaser'

export class HUD {
  constructor(scene, W, H) {
    this.scene = scene
    this.W = W
    this.H = H
    this.lastMilestone = 0
    this.create()
  }

  create() {
    const { W, H } = this

    // Panel score
    this.panelBg = this.scene.add.graphics()
    this.panelBg.fillStyle(0x0a0a0f, 0.7)
    this.panelBg.fillRoundedRect(W - 145, 8, 137, 60, 8)
    this.panelBg.lineStyle(1, 0x00ffcc, 0.25)
    this.panelBg.strokeRoundedRect(W - 145, 8, 137, 60, 8)

    this.scoreText = this.scene.add.text(W - 18, 18, '0 m', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#00ffcc',
      fontStyle: 'bold'
    }).setOrigin(1, 0)

    this.speedText = this.scene.add.text(W - 18, 50, 'VEL  x1.0', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#ff00aa'
    }).setOrigin(1, 0)

    // Barra de velocidad
    this.speedBarBg = this.scene.add.rectangle(W - 145 + 10, 72, 117, 3, 0x111122)
      .setOrigin(0, 0.5)
    this.speedBar = this.scene.add.rectangle(W - 145 + 10, 72, 0, 3, 0xff00aa)
      .setOrigin(0, 0.5)

    // Hint
    this.hint = this.scene.add.text(W / 2, 18, 'ESPACIO / ↑ / CLICK  para saltar', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#ffffff',
      alpha: 0.4
    }).setOrigin(0.5, 0)

    this.scene.time.delayedCall(3000, () => {
      this.scene.tweens.add({ targets: this.hint, alpha: 0, duration: 800 })
    })

    // Milestone flash (oculto por defecto)
    this.milestoneText = this.scene.add.text(W / 2, H * 0.35, '', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#ffdd00',
      fontStyle: 'bold',
      stroke: '#aa8800',
      strokeThickness: 3
    }).setOrigin(0.5).setAlpha(0)
  }

  update(score, worldSpeed, baseSpeed, maxSpeed = 800) {
    this.scoreText.setText(`${Math.floor(score)} m`)

    const mult = (worldSpeed / baseSpeed).toFixed(1)
    this.speedText.setText(`VEL  x${mult}`)

    // Barra de velocidad
    const pct = Math.min((worldSpeed - baseSpeed) / (maxSpeed - baseSpeed), 1)
    this.speedBar.width = 117 * pct

    // Color de barra según velocidad
    const col = pct < 0.5
      ? Phaser.Display.Color.Interpolate.ColorWithColor(
          { r: 255, g: 0, b: 170 }, { r: 255, g: 200, b: 0 }, 100, pct * 200)
      : Phaser.Display.Color.Interpolate.ColorWithColor(
          { r: 255, g: 200, b: 0 }, { r: 255, g: 50, b: 0 }, 100, (pct - 0.5) * 200)

    this.speedBar.setFillStyle(
      Phaser.Display.Color.GetColor(col.r, col.g, col.b)
    )

    // Milestone cada 100m
    const milestone = Math.floor(score / 100) * 100
    if (milestone > 0 && milestone !== this.lastMilestone) {
      this.lastMilestone = milestone
      this.showMilestone(milestone)
      return true // señal de milestone
    }
    return false
  }

  showMilestone(score) {
    this.milestoneText.setText(`${score} m`)
    this.milestoneText.setAlpha(1).setScale(0.5)

    this.scene.tweens.add({
      targets: this.milestoneText,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: 'Back.Out',
      onComplete: () => {
        this.scene.tweens.add({
          targets: this.milestoneText,
          alpha: 0,
          y: this.milestoneText.y - 20,
          duration: 600,
          delay: 600,
          ease: 'Power2',
          onComplete: () => {
            this.milestoneText.setY(this.H * 0.35)
          }
        })
      }
    })
  }
}