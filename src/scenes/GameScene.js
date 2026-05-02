import Phaser from 'phaser'
import { Player } from '../objects/Player.js'
import { Background } from '../objects/Background.js'
import { Obstacle } from '../objects/Obstacle.js'
import { ScoreEffect } from '../objects/ScoreEffect.js'
import { ParticleSystem } from '../objects/ParticleSystem.js'
import { SoundEngine } from '../audio/SoundEngine.js'
import { HUD } from '../ui/HUD.js'
import { GAME_WIDTH, GAME_HEIGHT, WORLD_SPEED, SPEED_INCREMENT } from '../config/gameConfig.js'

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' })
  }

  create() {
    const W = GAME_WIDTH
    const H = GAME_HEIGHT

    this.worldSpeed = WORLD_SPEED
    this.score = 0
    this.bestScore = this.registry.get('bestScore') || 0
    this.isGameOver = false
    this.obstacles = []
    this.obstacleTimer = 0
    this.nextObstacleDelay = 1800
    this.survived = 0
    this.groundY = Math.floor(H * 0.78)
    this.speedLineTimer = 0

    // Sistemas
    this.sound = new SoundEngine()
    this.particles = new ParticleSystem(this)

    this.background = new Background(this, W, H)
    this.createGround(W, H)

    this.player = new Player(this, 120, this.groundY, this.sound, this.particles)
    this.physics.add.collider(this.player, this.groundGroup)

    this.physics.add.overlap(
      this.player,
      this.obstacleGroup,
      this.onHitObstacle,
      null,
      this
    )

    this.hud = new HUD(this, W, H)

    // Sonido ambiente
    this.sound.startAmbient()

    // Velocidad creciente
    this.time.addEvent({
      delay: 5000,
      callback: () => {
        if (!this.isGameOver) {
          this.worldSpeed += SPEED_INCREMENT
        }
      },
      loop: true
    })

    this.cameras.main.fadeIn(500, 0, 0, 0)
  }

  createGround(W, H) {
    const groundY = this.groundY

    this.obstacleGroup = this.physics.add.group({
      allowGravity: false,
      immovable: true
    })

    this.groundGroup = this.physics.add.staticGroup()
    const groundBody = this.add.rectangle(W / 2, groundY + 20, W, 40, 0x000000, 0)
    this.physics.add.existing(groundBody, true)
    this.groundGroup.add(groundBody)

    const g = this.add.graphics()
    g.fillStyle(0x0d1520, 1)
    g.fillRect(0, groundY, W, H - groundY)
    g.lineStyle(2, 0x00ffcc, 1)
    g.beginPath()
    g.moveTo(0, groundY); g.lineTo(W, groundY)
    g.strokePath()
    g.lineStyle(1, 0x00ffcc, 0.2)
    g.beginPath()
    g.moveTo(0, groundY + 4); g.lineTo(W, groundY + 4)
    g.strokePath()

    this.laneGraphics = this.add.graphics()
    this.laneOffset = 0
  }

  spawnObstacle() {
    const obs = new Obstacle(this, GAME_WIDTH + 60, this.groundY)
    this.obstacleGroup.add(obs)
    this.obstacles.push(obs)

    const minDelay = 850
    const baseDelay = 1800
    this.nextObstacleDelay = Math.max(
      minDelay,
      baseDelay - (this.worldSpeed - WORLD_SPEED) * 1.5
    )
  }

  onHitObstacle() {
    if (this.isGameOver) return
    this.isGameOver = true

    this.sound.stopAmbient()

    if (this.score > this.bestScore) {
      this.bestScore = this.score
      this.registry.set('bestScore', this.bestScore)
    }

    this.cameras.main.shake(350, 0.015)
    this.cameras.main.flash(200, 255, 0, 0, false)

    // Partículas de impacto en el obstáculo
    this.particles.explosion(this.player.x, this.player.y - 30, 0xff2244, 20)
    this.particles.explosion(this.player.x, this.player.y - 30, 0x00ffcc, 10)

    const flash = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2,
      GAME_WIDTH, GAME_HEIGHT, 0xff0000, 0.3
    )
    this.tweens.add({ targets: flash, alpha: 0, duration: 500 })

    this.player.die()

    this.time.delayedCall(1000, () => {
      this.cameras.main.fadeOut(400, 0, 0, 0)
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameOverScene', {
          score: this.score,
          bestScore: this.bestScore
        })
      })
    })
  }

  updateLaneLines(W, H, dt) {
    const g = this.laneGraphics
    g.clear()
    const groundY = this.groundY
    this.laneOffset = (this.laneOffset + this.worldSpeed * dt) % 60
    g.lineStyle(1, 0x00ffcc, 0.1)
    for (let x = -this.laneOffset; x < W + 60; x += 60) {
      g.beginPath()
      g.moveTo(x, groundY + 10)
      g.lineTo(x + 30, groundY + 10)
      g.strokePath()
    }
  }

  update(time, delta) {
    if (this.isGameOver) return

    const dt = delta / 1000

    this.score += dt * (this.worldSpeed / 100)

    // HUD — detecta milestones
    const milestone = this.hud.update(this.score, this.worldSpeed, WORLD_SPEED)
    if (milestone) this.sound.milestone()

    // Speed lines cuando va rápido
    this.speedLineTimer += delta
    const speedFactor = (this.worldSpeed - WORLD_SPEED) / 200
    if (speedFactor > 0 && this.speedLineTimer > 200 / speedFactor) {
      this.speedLineTimer = 0
      this.particles.speedLines(this, GAME_WIDTH, GAME_HEIGHT, this.groundY, speedFactor)
    }

    // Spawn obstáculos
    this.obstacleTimer += delta
    if (this.obstacleTimer >= this.nextObstacleDelay) {
      this.obstacleTimer = 0
      this.spawnObstacle()
    }

    // Mover y limpiar obstáculos
    this.obstacles = this.obstacles.filter(obs => {
      if (!obs.active) return false
      const alive = obs.update(this.worldSpeed, delta)
      if (!alive) {
        this.obstacleGroup.remove(obs)
        this.survived++
        if (this.survived % 3 === 0) {
          new ScoreEffect(this, this.player.x + 50, this.player.y - 40, this.survived * 5)
        }
        return false
      }
      return true
    })

    this.player.update(delta)
    this.background.update(this.worldSpeed, delta)
    this.updateLaneLines(GAME_WIDTH, GAME_HEIGHT, dt)
  }

  shutdown() {
    if (this.sound) this.sound.stopAmbient()
  }
}