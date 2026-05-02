import Phaser from 'phaser'

export class Player extends Phaser.GameObjects.Container {
  constructor(scene, x, y, sound, particles) {
    super(scene, x, y)
    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.isAlive = true
    this.isOnGround = false
    this.wasOnGround = false
    this.jumpCount = 0
    this.maxJumps = 2
    this.sound = sound
    this.particles = particles
    this.trailTimer = 0

    this.createGraphics()
    this.setupPhysics()
    this.setupInput(scene)
    this.createRunAnimation(scene)
  }

  createGraphics() {
    const g = this.scene.add.graphics()

    g.fillStyle(0x00ffcc, 1)
    g.fillRect(-14, -58, 28, 30)

    g.fillStyle(0x0a0a0f, 1)
    g.fillRect(-10, -56, 20, 12)

    g.fillStyle(0xff00aa, 1)
    g.fillRect(-7, -53, 5, 6)
    g.fillRect(2, -53, 5, 6)

    g.fillStyle(0x00ffcc, 0.4)
    g.fillRect(-10, -42, 20, 2)

    g.fillStyle(0x00ccaa, 1)
    g.fillRect(-12, -28, 10, 28)
    g.fillRect(2, -28, 10, 28)

    g.fillStyle(0xff00aa, 0.6)
    g.fillRect(14, -50, 3, 8)
    g.fillRect(-17, -50, 3, 8)

    this.bodyGraphic = g
    this.add(g)

    const glow = this.scene.add.graphics()
    glow.fillStyle(0x00ffcc, 0.06)
    glow.fillEllipse(0, -30, 60, 70)
    this.glowGraphic = glow
    this.add(glow)
    this.moveTo(glow, 0)
  }

  setupPhysics() {
    const body = this.body
    body.setSize(26, 58)
    body.setOffset(-13, -58)
    body.setMaxVelocityY(900)
    body.setGravityY(200)
  }

  setupInput(scene) {
    this.cursors = scene.input.keyboard.createCursorKeys()
    this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    this.wKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
    scene.input.on('pointerdown', () => this.jump())
  }

  createRunAnimation(scene) {
    this.legOffset = 0
    this.legDirection = 1
    this.runTimer = scene.time.addEvent({
      delay: 80,
      callback: this.animateLegs,
      callbackScope: this,
      loop: true
    })
  }

  animateLegs() {
    if (!this.isAlive) return
    if (this.isOnGround) {
      this.legOffset += 5 * this.legDirection
      if (Math.abs(this.legOffset) >= 6) this.legDirection *= -1
    } else {
      this.legOffset = 0
    }
    this.bodyGraphic.fillStyle(0x00ccaa, 1)
    this.bodyGraphic.fillRect(-12, -28, 10, 28 + this.legOffset)
    this.bodyGraphic.fillRect(2, -28, 10, 28 - this.legOffset)
  }

  jump() {
    if (!this.isAlive) return
    if (this.jumpCount < this.maxJumps) {
      const isDouble = this.jumpCount === 1
      this.body.setVelocityY(-620)
      this.jumpCount++

      if (this.sound) this.sound.jump(isDouble)

      this.scene.tweens.add({
        targets: this,
        scaleX: 0.85,
        scaleY: 1.15,
        duration: 80,
        yoyo: true,
        ease: 'Power2'
      })

      this.spawnJumpParticles()
    }
  }

  spawnJumpParticles() {
    if (!this.particles) return
    for (let i = 0; i < 8; i++) {
      const px = this.x + Phaser.Math.Between(-10, 10)
      const py = this.y
      const p = this.scene.add.rectangle(px, py, 3, 3, 0x00ffcc, 0.8)
      this.scene.tweens.add({
        targets: p,
        x: px + Phaser.Math.Between(-30, 30),
        y: py + Phaser.Math.Between(10, 35),
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: Phaser.Math.Between(250, 450),
        ease: 'Power2',
        onComplete: () => p.destroy()
      })
    }
  }

  die() {
    if (!this.isAlive) return
    this.isAlive = false
    this.body.setVelocity(0, -300)
    this.runTimer.remove()

    if (this.sound) this.sound.die()
    if (this.particles) this.particles.explosion(this.x, this.y - 30, 0x00ffcc, 25)

    this.scene.tweens.add({
      targets: this,
      angle: 180,
      alpha: 0,
      y: this.y - 60,
      duration: 700,
      ease: 'Power2'
    })
  }

  update(delta) {
    if (!this.isAlive) return

    const dt = delta / 1000
    const onGround = this.body.blocked.down

    // Aterrizaje
    if (onGround && !this.wasOnGround) {
      if (this.sound) this.sound.land()
      if (this.particles) this.particles.landDust(this.x, this.y, 0x00ffcc)
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.2,
        scaleY: 0.85,
        duration: 60,
        yoyo: true,
        ease: 'Power2'
      })
    }

    this.wasOnGround = onGround
    this.isOnGround = onGround
    if (onGround) this.jumpCount = 0

    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
      Phaser.Input.Keyboard.JustDown(this.wKey)

    if (jumpPressed) this.jump()

    // Squash al caer rápido
    if (this.body.velocity.y > 400 && !onGround) {
      this.scaleX = 1.1
      this.scaleY = 0.9
    } else if (onGround) {
      this.scaleX = 1
      this.scaleY = 1
    }

    // Trail de corrida
    this.trailTimer += delta
    if (this.trailTimer > 60 && this.isOnGround) {
      this.trailTimer = 0
      if (this.particles) this.particles.runTrail(this.x, this.y - 10)
    }

    // Pulso glow
    const t = this.scene.time.now / 800
    this.glowGraphic.setAlpha(0.04 + Math.sin(t) * 0.02)
  }
}