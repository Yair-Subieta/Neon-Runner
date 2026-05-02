export class SoundEngine {
  constructor() {
    this.ctx = null
    this.enabled = true
    this.init()
  }

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)()
    } catch (e) {
      this.enabled = false
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  // Tono base
  playTone(freq, type, duration, volume = 0.3, delay = 0) {
    if (!this.enabled || !this.ctx) return
    const t = this.ctx.currentTime + delay
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.type = type
    osc.frequency.setValueAtTime(freq, t)

    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(volume, t + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration)

    osc.start(t)
    osc.stop(t + duration)
  }

  // Sonido de salto
  jump(isDoubleJump = false) {
    this.resume()
    if (isDoubleJump) {
      this.playTone(300, 'sine', 0.12, 0.2)
      this.playTone(500, 'sine', 0.12, 0.15, 0.05)
      this.playTone(700, 'sine', 0.10, 0.10, 0.10)
    } else {
      this.playTone(200, 'sine', 0.08, 0.2)
      this.playTone(400, 'sine', 0.15, 0.15, 0.04)
    }
  }

  // Sonido de muerte
  die() {
    this.resume()
    this.playTone(440, 'sawtooth', 0.1, 0.3)
    this.playTone(330, 'sawtooth', 0.15, 0.3, 0.1)
    this.playTone(220, 'sawtooth', 0.2, 0.3, 0.2)
    this.playTone(110, 'square', 0.3, 0.4, 0.3)
  }

  // Sonido de aterrizaje
  land() {
    this.resume()
    this.playTone(150, 'sine', 0.06, 0.15)
    this.playTone(80, 'sine', 0.08, 0.1, 0.03)
  }

  // Sonido de milestone (cada 100m)
  milestone() {
    this.resume()
    const notes = [523, 659, 784, 1047]
    notes.forEach((freq, i) => {
      this.playTone(freq, 'sine', 0.15, 0.2, i * 0.08)
    })
  }

  // Loop de fondo (beat ambient)
  startAmbient() {
    this.resume()
    this.ambientInterval = setInterval(() => {
      if (!this.enabled) return
      this.playTone(55, 'sine', 0.3, 0.04)
      setTimeout(() => this.playTone(73, 'sine', 0.2, 0.03), 250)
      setTimeout(() => this.playTone(55, 'sine', 0.15, 0.03), 500)
      setTimeout(() => this.playTone(82, 'sine', 0.2, 0.03), 750)
    }, 1000)
  }

  stopAmbient() {
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval)
      this.ambientInterval = null
    }
  }
}