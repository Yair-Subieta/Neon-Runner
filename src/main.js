import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT } from './config/gameConfig.js'
import { BootScene } from './scenes/BootScene.js'
import { MenuScene } from './scenes/MenuScene.js'
import { GameScene } from './scenes/GameScene.js'
import { GameOverScene } from './scenes/GameOverScene.js'

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#0a0a0f',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: [BootScene, MenuScene, GameScene, GameOverScene]
}

new Phaser.Game(config)