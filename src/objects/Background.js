import Phaser from 'phaser'

export class Background {
  constructor(scene, width, height) {
    this.scene = scene
    this.width = width
    this.height = height
    this.layers = []

    this.createSky()
    this.createGrid()
    this.createCityLayers()
  }

  createSky() {
    // Fondo base
    this.scene.add.rectangle(
      this.width / 2, this.height / 2,
      this.width, this.height, 0x0a0a0f
    )

    // Estrellas
    for (let i = 0; i < 60; i++) {
      const x = Phaser.Math.Between(0, this.width)
      const y = Phaser.Math.Between(0, this.height * 0.6)
      const r = Phaser.Math.FloatBetween(0.5, 1.8)
      const star = this.scene.add.circle(x, y, r, 0xffffff,
        Phaser.Math.FloatBetween(0.15, 0.6))

      this.scene.tweens.add({
        targets: star,
        alpha: 0.05,
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true, repeat: -1,
        delay: Phaser.Math.Between(0, 2000)
      })
    }
  }

  createGrid() {
    // Grid de perspectiva animado (se mueve con el juego)
    this.gridGraphics = this.scene.add.graphics()
    this.gridOffset = 0
    this.drawGrid()
  }

  drawGrid() {
    const g = this.gridGraphics
    g.clear()

    const groundY = this.height * 0.78
    const vanishY = this.height * 0.48
    const vanishX = this.width / 2

    // Líneas verticales
    for (let i = -14; i <= 14; i++) {
      const alpha = 0.06 + Math.abs(i) * 0.003
      g.lineStyle(1, 0x00ffcc, Math.min(alpha, 0.15))
      g.beginPath()
      g.moveTo(vanishX + i * 12, vanishY)
      g.lineTo(vanishX + i * 260, this.height + 10)
      g.strokePath()
    }

    // Líneas horizontales con offset de movimiento
    const lineCount = 10
    for (let i = 0; i < lineCount; i++) {
      const t = ((i / lineCount) + this.gridOffset) % 1
      const easedT = t * t
      const y = Phaser.Math.Linear(vanishY, this.height + 10, easedT)
      const alpha = 0.03 + easedT * 0.12
      g.lineStyle(1, 0x00ffcc, alpha)
      g.beginPath()
      g.moveTo(0, y)
      g.lineTo(this.width, y)
      g.strokePath()
    }
  }

  createCityLayers() {
    this.cityFar = this.createCityStrip(0x111122, 0.6, 8, 20, 40, 80, 0.15)
    this.cityMid = this.createCityStrip(0x0d1520, 0.75, 6, 30, 50, 100, 0.3)
    this.scene.add.rectangle(
      this.width / 2, this.height * 0.78,
      this.width, 1.5, 0x00ffcc, 0.4
    )
  }

  createCityStrip(color, yRatio, count, minW, maxW, maxH, speedFactor) {
    const stripWidth = this.width * 2.5
    const g1 = this.scene.add.graphics()
    const g2 = this.scene.add.graphics()
    const groundY = this.height * 0.78
    const buildingsY = groundY * yRatio
    const buildings1 = this.generateBuildings(stripWidth, buildingsY, minW, maxW, maxH)
    const buildings2 = this.generateBuildings(stripWidth, buildingsY, minW, maxW, maxH)

    this.drawBuildings(g1, buildings1, color)
    this.drawBuildings(g2, buildings2, color)

    g2.setX(stripWidth)

    return {
      g1, g2,
      buildings1, buildings2,
      color, groundY,
      stripWidth,
      speedFactor,
      offset: 0
    }
  }

  generateBuildings(stripWidth, buildingsY, minW, maxW, maxH) {
    const buildings = []
    let x = 0
    while (x < stripWidth) {
      const w = Phaser.Math.Between(minW, maxW)
      const h = Phaser.Math.Between(30, maxH)
      buildings.push({ x, y: buildingsY - h, w, h })
      x += w + Phaser.Math.Between(2, 10)
    }
    return buildings
  }

  drawBuildings(graphics, buildings, color) {
    graphics.clear()
    buildings.forEach(b => {
      graphics.fillStyle(color, 1)
      graphics.fillRect(b.x, b.y, b.w, b.h)

      if (b.w > 25) {
        const cols = Math.floor(b.w / 12)
        const rows = Math.floor(b.h / 12)
        for (let c = 0; c < cols; c++) {
          for (let r = 0; r < rows; r++) {
            if (Math.random() > 0.55) {
              graphics.fillStyle(0xffff88, Phaser.Math.FloatBetween(0.1, 0.4))
              graphics.fillRect(b.x + 4 + c * 12, b.y + 4 + r * 12, 5, 5)
            }
          }
        }
      }
    })
  }

  updateCityStrip(strip, speed, dt) {
    const moveAmount = speed * strip.speedFactor * dt
    strip.offset += moveAmount

    if (strip.offset >= strip.stripWidth) {
      strip.offset -= strip.stripWidth
    }

    strip.g1.setX(-strip.offset)
    strip.g2.setX(strip.stripWidth - strip.offset)
  }

  update(speed, delta) {
    const dt = delta / 1000

    this.gridOffset = (this.gridOffset + dt * 0.4) % 1
    this.drawGrid()

    this.updateCityStrip(this.cityFar, speed, dt)
    this.updateCityStrip(this.cityMid, speed, dt)
  }
}