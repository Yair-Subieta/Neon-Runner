import Phaser from 'phaser'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    // Generamos todos los assets por código, no necesitamos cargar imágenes
    this.createLoadingBar()
  }

  createLoadingBar() {
    const { width, height } = this.scale

    // Fondo
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a0f)

    // Texto de carga
    this.add.text(width / 2, height / 2 - 40, 'CARGANDO...', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#00ffcc',
      letterSpacing: 8
    }).setOrigin(0.5)

    // Barra de progreso - fondo
    const barBg = this.add.rectangle(width / 2, height / 2 + 10, 300, 4, 0x1a1a2e)
    // Barra de progreso - relleno
    const bar = this.add.rectangle(width / 2 - 150, height / 2 + 10, 0, 4, 0x00ffcc)
    bar.setOrigin(0, 0.5)

    // Animación de la barra
    this.tweens.add({
      targets: bar,
      width: 300,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        this.cameras.main.fadeOut(400, 0, 0, 0)
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('MenuScene')
        })
      }
    })
  }

  create() {}
}