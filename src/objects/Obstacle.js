import Phaser from 'phaser'

const OBSTACLE_TYPES = [
  {
    id: 'spike',
    width: 20,
    height: 30,
    color: 0xff2244,
    accentColor: 0xff6666,
    draw(g, w, h) {
      g.fillStyle(this.color, 1)
      g.fillTriangle(-w / 2, 0, 0, -h, w / 2, 0)
      g.fillStyle(this.accentColor, 0.5)
      g.fillTriangle(-w / 4, 0, 0, -h * 0.6, w / 4, 0)
    }
  },
  {
    id: 'block',
    width: 32,
    height: 32,
    color: 0xff4400,
    accentColor: 0xff8844,
    draw(g, w, h) {
      g.fillStyle(this.color, 1)
      g.fillRect(-w / 2, -h, w, h)
      g.lineStyle(1.5, this.accentColor, 0.8)
      g.strokeRect(-w / 2, -h, w, h)
      g.lineStyle(1, this.accentColor, 0.3)
      g.beginPath()
      g.moveTo(0, -h); g.lineTo(0, 0)
      g.moveTo(-w / 2, -h / 2); g.lineTo(w / 2, -h / 2)
      g.strokePath()
    }
  },
  {
    id: 'tall',
    width: 22,
    height: 52,
    color: 0xaa00ff,
    accentColor: 0xdd44ff,
    draw(g, w, h) {
      g.fillStyle(this.color, 1)
      g.fillRect(-w / 2, -h, w, h)
      g.lineStyle(1, this.accentColor, 0.6)
      for (let i = 1; i < 4; i++) {
        const y = -h + (h / 4) * i
        g.beginPath()
        g.moveTo(-w / 2, y); g.lineTo(w / 2, y)
        g.strokePath()
      }
      g.fillStyle(this.accentColor, 0.8)
      g.fillRect(-w / 2, -h, w, 3)
    }
  },
  {
    id: 'double',
    width: 20,
    height: 28,
    color: 0xff2244,
    accentColor: 0xff6666,
    draw(g, w, h) {
      g.fillStyle(this.color, 1)
      g.fillTriangle(-w, 0, -w / 2, -h, 0, 0)
      g.fillTriangle(0, 0, w / 2, -h, w, 0)
      g.fillStyle(this.accentColor, 0.4)
      g.fillTriangle(-w * 0.75, 0, -w / 2, -h * 0.6, -w * 0.25, 0)
      g.fillTriangle(w * 0.25, 0, w / 2, -h * 0.6, w * 0.75, 0)
    }
  }
]

export class Obstacle extends Phaser.GameObjects.Container {
  constructor(scene, x, y, typeId = null) {
    super(scene, x, y)
    scene.add.existing(this)
    scene.physics.add.existing(this)

    const type = typeId
      ? OBSTACLE_TYPES.find(t => t.id === typeId)
      : Phaser.Utils.Array.GetRandom(OBSTACLE_TYPES)

    this.obstacleType = type
    this.createVisual(type)
    this.setupPhysics(type)
    this.createGlow(type)
  }

  createVisual(type) {
    const g = this.scene.add.graphics()
    type.draw.call(type, g, type.width, type.height)
    this.add(g)
    this.mainGraphic = g
  }

  createGlow(type) {
    const glow = this.scene.add.graphics()
    glow.fillStyle(type.color, 0.07)
    glow.fillEllipse(0, -type.height / 2, type.width * 2.5, type.height * 1.5)
    this.add(glow)
    this.moveTo(glow, 0)

    this.scene.tweens.add({
      targets: glow,
      alpha: { from: 0.5, to: 1 },
      duration: 600,
      yoyo: true,
      repeat: -1
    })
  }

  setupPhysics(type) {
    const body = this.body
    body.setSize(type.width * 0.8, type.height * 0.85)
    body.setOffset(-type.width * 0.4, -type.height)
    body.setImmovable(true)
    body.setAllowGravity(false)
    body.setVelocity(0, 0)
  }

  update(speed, delta) {
    const dt = delta / 1000
    this.x -= speed * dt

    if (this.x < -100) {
      this.destroy()
      return false
    }
    return true
  }
}