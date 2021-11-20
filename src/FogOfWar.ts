import Phaser from "phaser";

export default class FogOfWar {
  public fogTexture: Phaser.GameObjects.RenderTexture;
  private ratio: number;
  private eraserCursor: Phaser.GameObjects.Image;

  private _alpha: number;
  public get alpha(): number {
    return this._alpha;
  }
  public set alpha(v: number) {
    this._alpha = v;
    this.fogTexture.alpha = v;
  }

  constructor(
    scene: Phaser.Scene,
    private worldWidth: number,
    private worldHeight: number,
    private fidelity: number = 128,
    public fogDecayRate: number = 0.0025,
    private revealTexture?: string
  ) {
    const ratio = worldWidth / worldHeight;
    this.ratio = ratio;
    this.fogTexture = scene.add
      .renderTexture(0, 0, Math.ceil(this.fidelity * ratio), this.fidelity)
      .setFlipY(true)
      .fill(0, 1)
      .setDisplaySize(worldWidth, worldHeight)
      .setDepth(1000);

    this.fogTexture.saveTexture("fog-of-war");

    this.eraserCursor = scene.add
      .image(0, 0, "fog-dot") // this texture is preloaded in `MainScene`
      .setDisplaySize(32 * (this.fidelity / 128), 32 * (this.fidelity / 128))
      .setOrigin(0.5, 0.5)
      .setVisible(false);

    // Fill the texture so it starts out as pure black. (Not sure why this needs to be done twice.)
    this.fogTexture.fill(0, 1);

    // If we want to reveal a texture in 'explored' areas...
    if (this.revealTexture) {
      this._mask = this.fogTexture.createBitmapMask();
      const fg = scene.add
        .image(0, 0, this.revealTexture)
        .setOrigin(0, 0)
        .setDisplaySize(worldWidth, worldHeight)
        .setDepth(5000);
      fg.setMask(this._mask);
    }
  }

  private _mask: Phaser.Display.Masks.BitmapMask;
  public get bitmapMask(): Phaser.Display.Masks.BitmapMask {
    return this._mask;
  }

  reveal(worldX: number, worldY: number) {
    this.eraserCursor.x =
      (worldX / this.worldWidth) * this.fidelity * this.ratio;
    this.eraserCursor.y = (1 - worldY / this.worldHeight) * this.fidelity;
    this.fogTexture.erase(this.eraserCursor);
  }

  revealShape(
    obj: Phaser.GameObjects.GameObject &
      Phaser.GameObjects.Components.Transform,
    worldX?: number,
    worldY?: number
  ) {
    // Default to the given object's coordinates if none are given
    worldX = worldX === undefined ? obj.x : worldX;
    worldY = worldY === undefined ? obj.y : worldY;

    const x = (worldX / this.worldWidth) * this.fidelity * this.ratio;
    const y = (worldY / this.worldHeight) * this.fidelity;
    this.fogTexture.erase(obj, x, y);
  }

  growFog(amount: number) {
    this.fogTexture.fill(0, amount * this.fogDecayRate);
  }
}
