import Phaser from 'phaser'

const OBSTACLE_TYPES = [
  {
    id: 'spike',
    width: 22,
    height: 34,
    color: 0xff2244,
    accentColor: 0xff6666,
    particleColor: 0xff4466,
    draw(g, w, h) {
      g.fillStyle(this.color, 1)
      g.fillTriangle(-w / 2, 0, 0, -h, w / 2, 0)
      g.fillStyle(this.accentColor, 0.6)
      g.fillTriangle(-w / 4, 0, 0, -h * 0.55, w / 4, 0)
      g.fillStyle(0xffffff, 0.3)
      g.fillTriangle(-w / 8, -h * 0.2, 0, -h * 0.65, w / 8, -h * 0.2)
    }
  },
  {
    id: 'block',
    width: 36,
    height: 36,
    color: 0xff4400,
    accentColor: 0xff8844,
    particleColor: 0xff6600,
    draw(g, w, h) {
      g.fillStyle(this.color, 1)
      g.fillRect(-w / 2, -h, w, h)
      g.fillStyle(0x000000, 0.3)
      g.fillRect(-w / 2 + 3, -h + 3, w - 6, h - 6)
      g.lineStyle(2, this.accentColor, 0.9)
      g.strokeRect(-w / 2, -h, w, h)
      g.lineStyle(1.5, 0xffffff, 0.4)
      g.strokeRect(-w / 2 + 4, -h + 4, w - 8, h - 8)
    }
  },
  {
    id: 'tall',
    width: 26,
    height: 60,
    color: 0xaa00ff,
    accentColor: 0xdd44ff,
    particleColor: 0xcc44ff,
    draw(g, w, h) {
      g.fillStyle(this.color, 1)
      g.fillRect(-w / 2, -h, w, h)
      g.lineStyle(2, this.accentColor, 0.8)
      for (let i = 1; i < 5; i++) {
        const y = -h + (h / 5) * i
        g.beginPath()
        g.moveTo(-w / 2, y); g.lineTo(w / 2, y)
        g.strokePath()
      }
      g.fillStyle(this.accentColor, 0.9)
      g.fillRect(-w / 2, -h, w, 4)
      g.fillStyle(0xffffff, 0.5)
      g.fillRect(-w / 2, -h + 4, w, 2)
    }
  },
  {
    id: 'double',
    width: 38,
    height: 32,
    color: 0xff2244,
    accentColor: 0xff6666,
    particleColor: 0xff4466,
    draw(g, w, h) {
      const sw = w / 3
      g.fillStyle(this.color, 1)
      g.fillTriangle(-w / 2, 0, -w / 2 + sw, -h, -w / 2 + sw * 2, 0)
      g.fillTriangle(sw, 0, sw + sw, -h, sw * 2, 0)
      g.fillStyle(this.accentColor, 0.5)
      g.fillTriangle(-w / 2 + sw, 0, -w / 2 + sw, -h * 0.6, -w / 2 + sw * 2, 0)
      g.fillTriangle(sw + sw / 2, 0, sw + sw, -h * 0.6, sw + sw * 2, 0)
    }
  },
  {
    id: 'crystal',
    width: 18,
    height: 44,
    color: 0x00ffcc,
    accentColor: 0x66ffdd,
    particleColor: 0x00ffcc,
    draw(g, w, h) {
      g.fillStyle(this.color, 1)
      g.fillTriangle(0, -h, -w / 2, 0, w / 2, 0)
      g.fillStyle(this.accentColor, 0.7)
      g.fillTriangle(0, -h, -w / 4, 0, w / 4, 0)
      g.fillStyle(0xffffff, 0.5)
      g.fillTriangle(0, -h * 0.7, -w / 6, -h * 0.1, w / 6, -h * 0.1)
      g.fillStyle(this.color, 0.3)
      g.fillRect(-w, -2, w * 2, 4)
    }
  },
  {
    id: 'barrel',
    width: 30,
    height: 30,
    color: 0xff8800,
    accentColor: 0xffaa44,
    particleColor: 0xff6600,
    draw(g, w, h) {
      g.fillStyle(this.color, 1)
      g.fillCircle(0, -h / 2, w / 2)
      g.fillStyle(0x222222, 0.4)
      g.fillCircle(0, -h / 2, w / 2 - 4)
      g.lineStyle(2, this.accentColor, 0.8)
      g.strokeCircle(0, -h / 2, w / 2)
      g.lineStyle(1, this.accentColor, 0.5)
      g.strokeCircle(0, -h / 2, w / 2 - 5)
      g.fillStyle(this.accentColor, 0.9)
      g.fillRect(-w / 4, -h / 2 - 2, w / 2, 4)
    }
  },
  {
    id: 'saw',
    width: 40,
    height: 40,
    color: 0x888899,
    accentColor: 0xffffff,
    particleColor: 0xffaa00,
    draw(g, w, h) {
      const teeth = 8
      const innerR = w / 2 - 6
      g.fillStyle(this.color, 1)
      g.beginPath()
      for (let i = 0; i < teeth; i++) {
        const angle = (i / teeth) * Math.PI * 2
        const nextAngle = ((i + 0.5) / teeth) * Math.PI * 2
        const outerR = w / 2
        if (i === 0) {
          g.moveTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR - h / 2)
        } else {
          g.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR - h / 2)
        }
        g.lineTo(Math.cos(nextAngle) * innerR, Math.sin(nextAngle) * innerR - h / 2)
      }
      g.closePath()
      g.fillPath()
      g.fillStyle(0x333344, 1)
      g.fillCircle(0, -h / 2, w / 4)
      g.fillStyle(this.accentColor, 0.6)
      g.fillCircle(0, -h / 2, w / 6)
    }
  },
  {
    id: 'flame',
    width: 28,
    height: 48,
    color: 0xff4400,
    accentColor: 0xffaa00,
    particleColor: 0xff6600,
    draw(g, w, h) {
      g.fillStyle(this.color, 0.9)
      g.fillTriangle(0, -h, -w / 2, 0, w / 2, 0)
      g.fillStyle(this.accentColor, 0.8)
      g.fillTriangle(0, -h * 0.7, -w / 3, -h * 0.1, w / 3, -h * 0.1)
      g.fillStyle(0xffff00, 0.6)
      g.fillTriangle(0, -h * 0.5, -w / 5, -h * 0.1, w / 5, -h * 0.1)
      g.fillStyle(0xffffff, 0.4)
      g.fillTriangle(0, -h * 0.4, -w / 8, -h * 0.15, w / 8, -h * 0.15)
    }
  }
]

export class Obstacle extends Phaser.GameObjects.Container {
  constructor(scene, x, y, typeId = null) {
    super(scene, x, y)
    this.particleEvent = null

    const availableTypes = OBSTACLE_TYPES
    let type = null
    
    if (typeId) {
      for (let i = 0; i < availableTypes.length; i++) {
        if (availableTypes[i].id === typeId) {
          type = availableTypes[i]
          break
        }
      }
    }
    
    if (!type) {
      type = availableTypes[Math.floor(Math.random() * availableTypes.length)]
    }

    this.obstacleType = type
    this.rotationAngle = 0
    this.alive = true

    this.createVisual(type)

    if (this.mainGraphic) {
      this.width = type.width
      this.height = type.height
      
      this.scene.add.existing(this)
      
      this.body = this.scene.physics.add.sprite(x, y, '__DEFAULT')
      this.body.setVisible(false)
      this.body.setEnable(true)
      this.body.setImmovable(true)
      this.body.setAllowGravity(false)
      this.body.setVelocity(0, 0)
      this.body.setSize(type.width * 0.75, type.height * 0.8)
      this.body.setOffset(-type.width * 0.375, -type.height)
      
      this.createEffects(type)
    }
  }

  createVisual(type) {
    if (!type || !type.draw) return
    
    const g = this.scene.add.graphics()
    try {
      type.draw.call(type, g, type.width, type.height)
      this.add(g)
      this.mainGraphic = g
    } catch (e) {
      console.warn('createVisual error:', e)
    }
  }

  createEffects(type) {
    if (!type || !this.scene) return
    
    try {
      const glow = this.scene.add.graphics()
      glow.fillStyle(type.color, 0.08)
      glow.fillEllipse(0, -type.height / 2, type.width * 2.2, type.height * 1.3)
      this.add(glow)

      this.scene.tweens.add({
        targets: glow,
        alpha: { from: 0.5, to: 1 },
        scaleX: { from: 0.95, to: 1.05 },
        scaleY: { from: 0.95, to: 1.05 },
        duration: 400 + Math.random() * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })

      this.particleEvent = this.scene.time.addEvent({
        delay: 150,
        callback: () => {
          if (!this.alive || !this.scene || !this.obstacleType) return
          try {
            const size = Math.floor(Math.random() * 3) + 2
            const px = this.x + (Math.random() * type.width - type.width / 2)
            const py = this.y + (Math.random() * -type.height)
            const p = this.scene.add.circle(px, py, size, type.particleColor, 0.8)

            this.scene.tweens.add({
              targets: p,
              y: py - 30 - Math.random() * 30,
              x: px + (Math.random() * 40 - 20),
              alpha: 0,
              scaleX: 0.2,
              scaleY: 0.2,
              duration: 400,
              ease: 'Power2',
              onComplete: () => {
                if (p && p.destroy) p.destroy()
              }
            })
          } catch (e) {}
        },
        loop: true
      })
    } catch (e) {
      console.warn('createEffects error:', e)
    }
  }

  update(speed, delta) {
    if (!this.alive) return false
    
    try {
      const dt = delta / 1000
      this.x -= speed * dt

      if (this.body) {
        this.body.x = this.x
      }

      if (this.obstacleType && this.obstacleType.id === 'saw' && this.mainGraphic) {
        this.mainGraphic.rotation += dt * 3
      }

      if (this.x < -100) {
        this.destroy()
        return false
      }
    } catch (e) {}
    
    return true
  }

  destroy() {
    this.alive = false
    
    if (this.particleEvent) {
      try {
        this.particleEvent.remove()
      } catch (e) {}
      this.particleEvent = null
    }
    
    if (this.body) {
      try {
        this.body.destroy()
      } catch (e) {}
      this.body = null
    }
    
    try {
      super.destroy()
    } catch (e) {}
  }
}

export const OBSTACLE_POOL = OBSTACLE_TYPES

export function getRandomObstacleType() {
  const idx = Math.floor(Math.random() * OBSTACLE_TYPES.length)
  return OBSTACLE_TYPES[idx]
}

export function getObstacleById(id) {
  for (let i = 0; i < OBSTACLE_TYPES.length; i++) {
    if (OBSTACLE_TYPES[i].id === id) {
      return OBSTACLE_TYPES[i]
    }
  }
  return null
}