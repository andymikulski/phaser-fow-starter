import Phaser from 'phaser';
import MainScene from './MainScene';
import { SurfacePipeline, SurfacePostFX } from './SurfaceShader';

const game = new Phaser.Game({
  width: 1024,
  height: 768,
  backgroundColor: 0xA1E064,
  scale: {
    mode: Phaser.Scale.FIT,
  },
  pipeline: {
    'waterSurface': SurfacePipeline,
    'waterSurfacePostFX': SurfacePostFX,
  } as any,
  // Entry point
  scene: MainScene
})