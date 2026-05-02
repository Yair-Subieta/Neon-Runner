import Phaser from 'phaser'

const OBSTACLE_TYPES = [
  {
    id: 'spike',
    width: 22,
    height: 34,
    color: 0xff2244,
    accentColor: 0xff6666,
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
    draw(g, w, h) {
      g.fillStyle(this.color, 1)
      g.fillRect(-w / 2, -h, w, h)
      g.lineStyle(2, this.accentColor, 0.8)
      for (var i = 1; i < 5; i++) {
        var y = -h + (h / 5) * i
        g.beginPath()
        g.moveTo(-w / 2, y)
        g.lineTo(w / 2, y)
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
    draw(g, w, h) {
      var sw = w / 3
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
    draw(g, w, h) {
      g.fillStyle(this.color, 1)
      g.fillTriangle(0, -h, -w / 2, 0, w / 2, 0)
      g.fillStyle(this.accentColor, 0.7)
      g.fillTriangle(0, -h, -w / 4, 0, w / 4, 0)
      g.fillStyle(0xffffff, 0.5)
      g.fillTriangle(0, -h * 0.7, -w / 6, -h * 0.1, w / 6, -h * 0.1)
    }
  },
  {
    id: 'barrel',
    width: 30,
    height: 30,
    color: 0xff8800,
    accentColor: 0xffaa44,
    draw(g, w, h) {
      g.fillStyle(this.color, 1)
      g.fillCircle(0, -h / 2, w / 2)
      g.fillStyle(0x222222, 0.4)
      g.fillCircle(0, -h / 2, w / 2 - 4)
      g.lineStyle(2, this.accentColor, 0.8)
      g.strokeCircle(0, -h / 2, w / 2)
    }
  },
  {
    id: 'saw',
    width: 40,
    height: 40,
    color: 0x888899,
    accentColor: 0xffffff,
    draw(g, w, h) {
      var teeth = 8
      var innerR = w / 2 - 6
      g.fillStyle(this.color, 1)
      g.beginPath()
      for (var i = 0; i < teeth; i++) {
        var angle = (i / teeth) * Math.PI * 2
        var nextAngle = ((i + 0.5) / teeth) * Math.PI * 2
        var outerR = w / 2
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
    }
  },
  {
    id: 'flame',
    width: 28,
    height: 48,
    color: 0xff4400,
    accentColor: 0xffaa00,
    draw(g, w, h) {
      g.fillStyle(this.color, 0.9)
      g.fillTriangle(0, -h, -w / 2, 0, w / 2, 0)
      g.fillStyle(this.accentColor, 0.8)
      g.fillTriangle(0, -h * 0.7, -w / 3, -h * 0.1, w / 3, -h * 0.1)
      g.fillStyle(0xffff00, 0.6)
      g.fillTriangle(0, -h * 0.5, -w / 5, -h * 0.1, w / 5, -h * 0.1)
    }
  }
]

export class Obstacle {
  constructor(scene, x, y, typeId) {
    this.scene = scene
    this.x = x
    this.y = y
    this.alive = true
    this.rotationAngle = 0
    
    var type = null
    if (typeId) {
      for (var i = 0; i < OBSTACLE_TYPES.length; i++) {
        if (OBSTACLE_TYPES[i].id === typeId) {
          type = OBSTACLE_TYPES[i]
          break
        }
      }
    }
    
    if (!type) {
      type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)]
    }

    this.obstacleType = type
    this.width = type.width
    this.height = type.height

    this.graphics = scene.add.graphics()
    this.graphics.x = x
    this.graphics.y = y
    type.draw.call(type, this.graphics, type.width, type.height)

    scene.physics.add.existing(this.graphics)
    this.body = this.graphics.body
    this.body.setImmovable(true)
    this.body.allowGravity = false
    this.body.setVelocity(0, 0)
    this.body.setSize(type.width * 0.75, type.height * 0.8)
    this.body.setOffset(-type.width * 0.375, -type.height)
  }

  update(speed, delta) {
    if (!this.alive) return false
    
    var dt = delta / 1000
    this.x -= speed * dt
    this.graphics.x = this.x
    
    if (this.body) {
      this.body.x = this.x
    }

    if (this.obstacleType && this.obstacleType.id === 'saw') {
      this.rotationAngle += dt * 3
      this.graphics.rotation = this.rotationAngle
    }

    if (this.x < -100) {
      this.destroy()
      return false
    }
    return true
  }

  destroy() {
    this.alive = false
    if (this.graphics) {
      this.graphics.destroy()
      this.graphics = null
    }
  }
}

export function getRandomObstacleType() {
  return OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)]
}

export function getObstacleById(id) {
  for (var i = 0; i < OBSTACLE_TYPES.length; i++) {
    if (OBSTACLE_TYPES[i].id === id) {
      return OBSTACLE_TYPES[i]
    }
  }
  return null
}