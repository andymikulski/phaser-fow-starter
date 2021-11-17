import Phaser from 'phaser';
import MainScene from './MainScene';

const game = new Phaser.Game({
  width: 1024,
  height: 768,
  backgroundColor: 0xA1E064,
  scale: {
    mode: Phaser.Scale.FIT,
  },
  // Entry point
  scene: MainScene
})