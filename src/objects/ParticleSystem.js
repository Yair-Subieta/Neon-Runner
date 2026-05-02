import Phaser from 'phaser'

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene
  }

  // Explosión al morir
  explosion(x, y, color = 0xff2244, count = 20) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const speed = Phaser.Math.Between(80, 220)
      const size = Phaser.Math.Between(2, 6)
      const p = this.scene.add.rectangle(x, y, size, size, color, 1)

      this.scene.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed + Phaser.Math.Between(20, 80),
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        angle: Phaser.Math.Between(0, 360),
        duration: Phaser.Math.Between(400, 800),
        ease: 'Power2',
        onComplete: () => p.destroy()
      })
    }

    // Ring de onda expansiva
    const ring = this.scene.add.graphics()
    ring.lineStyle(2, color, 0.8)
    ring.strokeCircle(0, 0, 10)
    ring.x = x
    ring.y = y

    this.scene.tweens.add({
      targets: ring,
      scaleX: 4,
      scaleY: 4,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => ring.destroy()
    })
  }

  // Trail de corrida
  runTrail(x, y, color = 0x00ffcc) {
    const p = this.scene.add.rectangle(
      x + Phaser.Math.Between(-5, 5),
      y - Phaser.Math.Between(5, 20),
      Phaser.Math.Between(2, 4),
      Phaser.Math.Between(2, 4),
      color, 0.5
    )

    this.scene.tweens.add({
      targets: p,
      x: p.x - Phaser.Math.Between(20, 50),
      y: p.y + Phaser.Math.Between(-5, 10),
      alpha: 0,
      scaleX: 0,
      scaleY: 0,
      duration: Phaser.Math.Between(150, 300),
      ease: 'Power1',
      onComplete: () => p.destroy()
    })
  }

  // Estela de velocidad
  speedLines(scene, W, H, groundY, intensity = 1) {
    const count = Math.floor(3 * intensity)
    for (let i = 0; i < count; i++) {
      const y = Phaser.Math.Between(10, groundY - 10)
      const len = Phaser.Math.Between(30, 100) * intensity
      const x = W + 10
      const line = scene.add.rectangle(x, y, len, 1, 0x00ffcc,
        Phaser.Math.FloatBetween(0.05, 0.2))

      scene.tweens.add({
        targets: line,
        x: -len,
        duration: Phaser.Math.Between(150, 350),
        ease: 'Linear',
        onComplete: () => line.destroy()
      })
    }
  }

  // Impacto en el suelo al aterrizar
  landDust(x, y, color = 0x00ffcc) {
    for (let i = 0; i < 8; i++) {
      const angle = Math.PI + (i / 8) * Math.PI
      const speed = Phaser.Math.Between(30, 80)
      const p = this.scene.add.circle(x, y, Phaser.Math.Between(1, 3), color, 0.6)

      this.scene.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed * 0.3,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: Phaser.Math.Between(200, 400),
        ease: 'Power2',
        onComplete: () => p.destroy()
      })
    }
  }
}