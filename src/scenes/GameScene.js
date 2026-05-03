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

    // Estado de oleadas
    this.wavePhase = 'ramp'  // 'ramp' | 'rest'
    this.waveTimer = 0

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

    // Velocidad creciente con oleadas
    this.time.addEvent({
      delay: 5000,
      callback: () => {
        if (this.isGameOver) return

        this.waveTimer += 5000

        if (this.wavePhase === 'ramp') {
          this.worldSpeed += SPEED_INCREMENT

          // Cada 30 segundos, momento de respiro de 8 segundos
          if (this.waveTimer >= 30000) {
            this.waveTimer = 0
            this.wavePhase = 'rest'
            this.nextObstacleDelay = 3000

            // Aviso visual al jugador
            const txt = this.add.text(
              GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60,
              '✦ RESPIRO ✦',
              {
                fontSize: '22px',
                fill: '#00ffcc',
                fontFamily: 'monospace',
                stroke: '#003322',
                strokeThickness: 4
              }
            ).setOrigin(0.5).setAlpha(0)

            this.tweens.add({
              targets: txt,
              alpha: 1,
              y: txt.y - 20,
              duration: 400,
              yoyo: true,
              hold: 1200,
              onComplete: () => txt.destroy()
            })

            // Vuelve a modo ramp tras 8 segundos
            this.time.delayedCall(8000, () => {
              if (!this.isGameOver) this.wavePhase = 'ramp'
            })
          }
        }
        // En 'rest' no aumenta velocidad ni modifica el delay
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
    const speedLevel = Math.floor((this.worldSpeed - WORLD_SPEED) / 60)
    const pattern = this.chooseSpawnPattern(speedLevel)

    let baseX = GAME_WIDTH + 60

    pattern.forEach((typeId) => {
      if (!typeId) return

      const obs = new Obstacle(this, baseX, this.groundY, typeId)

      if (!obs || !obs.obstacleType) return

      this.obstacleGroup.add(obs.graphics)

      this.obstacles.push(obs)
      baseX += obs.width + 30
    })

    // Solo recalcula el delay si no estamos en fase de respiro
    if (this.wavePhase !== 'rest') {
      const minDelay = 700 - speedLevel * 30
      const baseDelay = 1800
      this.nextObstacleDelay = Math.max(
        Math.max(minDelay, 400),
        baseDelay - (this.worldSpeed - WORLD_SPEED) * 1.5
      )
    }
  }

  chooseSpawnPattern(speedLevel) {
    const low  = ['spike', 'block', 'barrel', 'double']  // saltables con salto normal
    const tall = ['tall', 'crystal', 'flame']             // requieren salto alto o doble
    const rare = ['saw']                                   // especiales

    const roll = Math.random()

    // Nivel 0: solo obstáculos simples para aprender
    if (speedLevel === 0) {
      return [Phaser.Utils.Array.GetRandom(low)]
    }

    // Nivel 2+: aparece la sierra
    if (speedLevel >= 2 && roll < 0.08) {
      return [Phaser.Utils.Array.GetRandom(rare)]
    }

    // Patrón BAJO + ALTO: el jugador debe decidir si saltar o usar doble salto
    if (speedLevel >= 2 && roll < 0.25) {
      return [
        Phaser.Utils.Array.GetRandom(low),
        Phaser.Utils.Array.GetRandom(tall)
      ]
    }

    // Patrón doble del mismo tipo (nivel 3+)
    if (speedLevel >= 3 && roll < 0.40) {
      const type = Phaser.Utils.Array.GetRandom(low)
      return [type, type]
    }

    // Patrón triple muy apretado (nivel 5+, poco frecuente)
    if (speedLevel >= 5 && roll < 0.15) {
      return [
        Phaser.Utils.Array.GetRandom(low),
        Phaser.Utils.Array.GetRandom(low),
        Phaser.Utils.Array.GetRandom(tall)
      ]
    }

    // Obstáculo alto solo
    if (roll < 0.35) {
      return [Phaser.Utils.Array.GetRandom(tall)]
    }

    // Obstáculo bajo solo (default)
    return [Phaser.Utils.Array.GetRandom(low)]
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
          bestScore: this.bestScore,
          survived: this.survived,
          maxSpeed: this.worldSpeed
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
      if (!obs || !obs.alive) return false

      const alive = obs.update(this.worldSpeed, delta)
      if (!alive) {
        this.obstacleGroup.remove(obs.graphics)
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