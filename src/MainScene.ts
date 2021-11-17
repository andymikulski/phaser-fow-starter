import Phaser from "phaser";
import FogOfWar from "./FogOfWar";

const NUM_MARIOS = 10;
export default class MainScene extends Phaser.Scene {
  private marios: Phaser.GameObjects.Image[] = [];

  private fow: FogOfWar;

  preload = () => {
    // ---THIS IS THE IMAGE THAT IS USED TO CLEAR SECTIONS OF THE FOW TEXTURE---
    this.load.image("fog-dot", "https://i.imgur.com/tehnIVH.png");
    // ---

    this.load.image("mario", "https://i.imgur.com/nKgMvuj.png");
    this.load.image("background", "https://i.imgur.com/dzpw15B.jpg");
    this.load.image('background-drawn', 'https://i.imgur.com/IQSuIl7.png');
  };
  create = () => {
    // Creates the necessary render texture etc.
    this.fow = new FogOfWar(this, 1024, 768, 128, 0.0025/*, 'background-drawn'*/);

    this.add.text(0, 0, "Main Scene - no physics", {
      color: "#fff",
      fontSize: "16px",
    });

    this.add
      .image(0, 0, "background")
      .setOrigin(0, 0) // Anchor to top left so (0,0) is flush against the corner
      .setDisplaySize(1024, 768) // Fit background image to window
      .setDepth(-1); // Behind everything

    let mario;
    for (let i = 0; i < NUM_MARIOS; i++) {
      mario = this.add
        .image(32, 32, "mario")
        .setData("velocity", { x: Math.random() * 500, y: Math.random() * 500 })
        .setDisplaySize(32, 32);

      this.marios.push(mario);
    }
  };

  update = (time: number, delta: number) => {
    // Expand the fog
    this.fow.growFog(delta);

    // do something every tick here
    let mario;
    let velocity;
    for (let i = 0; i < this.marios.length; i++) {
      mario = this.marios[i];
      velocity = mario.getData("velocity") as { x: number; y: number };

      // Move the thing
      mario.x += velocity.x * delta * 0.001;
      mario.y += velocity.y * delta * 0.001;

      // Clear the hole in the fog
      this.fow.reveal(mario.x, mario.y);

      // Check if we hit a boundary and bounce
      if (mario.x > 1024 || mario.x < 0) {
        velocity.x *= -1;
      }
      if (mario.y > 768 || mario.y < 0) {
        velocity.y *= -1;
      }
      mario.setData("velocity", velocity);
    }
  };
}
