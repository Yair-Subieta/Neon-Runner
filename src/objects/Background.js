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
    // Capa 1: edificios lejanos (mueven lento)
    this.cityFar = this.createCityStrip(0x111122, 0.6, 8, 20, 40, 80)
    // Capa 2: edificios medios
    this.cityMid = this.createCityStrip(0x0d1520, 0.75, 6, 30, 50, 100)
    // Línea de horizonte
    this.scene.add.rectangle(
      this.width / 2, this.height * 0.78,
      this.width, 1.5, 0x00ffcc, 0.4
    )
  }

  createCityStrip(color, yRatio, count, minW, maxW, maxH) {
    const graphics = this.scene.add.graphics()
    const buildings = []
    let x = 0

    while (x < this.width * 2.5) {
      const w = Phaser.Math.Between(minW, maxW)
      const h = Phaser.Math.Between(30, maxH)
      const bY = this.height * yRatio
      buildings.push({ x, y: bY - h, w, h })
      x += w + Phaser.Math.Between(2, 10)
    }

    this.drawBuildings(graphics, buildings, color, yRatio)

    return { graphics, buildings, color, yRatio, offset: 0 }
  }

  drawBuildings(graphics, buildings, color, yRatio) {
    graphics.clear()
    buildings.forEach(b => {
      graphics.fillStyle(color, 1)
      graphics.fillRect(b.x, b.y, b.w, b.h)

      // Ventanas
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

  update(speed, delta) {
    const dt = delta / 1000

    // Mover grid
    this.gridOffset = (this.gridOffset + dt * 0.4) % 1
    this.drawGrid()

    // Mover edificios lejanos (parallax lento)
    this.cityFar.offset += speed * 0.15 * dt
    if (this.cityFar.offset > 200) {
      this.cityFar.offset = 0
    }
    this.cityFar.graphics.setX(-this.cityFar.offset)

    // Mover edificios medios
    this.cityMid.offset += speed * 0.3 * dt
    if (this.cityMid.offset > 200) {
      this.cityMid.offset = 0
    }
    this.cityMid.graphics.setX(-this.cityMid.offset)
  }
}