import Phaser from 'phaser'

export class ScoreEffect extends Phaser.GameObjects.Text {
  constructor(scene, x, y, value) {
    super(scene, x, y, `+${value}`, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#00ffcc',
      stroke: '#003322',
      strokeThickness: 3
    })
    scene.add.existing(this)
    this.setOrigin(0.5)

    scene.tweens.add({
      targets: this,
      y: y - 50,
      alpha: 0,
      duration: 700,
      ease: 'Power2',
      onComplete: () => this.destroy()
    })
  }
}