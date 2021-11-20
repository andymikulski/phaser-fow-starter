import Phaser from 'phaser';
import MainScene from './MainScene';
import { DisplacementPipeline, DisplacementPostFX } from './DisplacementShaders';

const game = new Phaser.Game({
  width: 1024,
  height: 768,
  backgroundColor: 0xA1E064,
  scale: {
    mode: Phaser.Scale.FIT,
  },
  pipeline: {
    'displacement': DisplacementPipeline,
    'displacementPostFX': DisplacementPostFX,
  } as any,
  // Entry point
  scene: MainScene
})