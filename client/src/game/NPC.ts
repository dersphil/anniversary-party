import Phaser from "phaser";

export class NPC extends Phaser.GameObjects.Container {
  private readonly homeX: number;
  private readonly homeY: number;
  private readonly phase: number;
  private readonly behavior: "dance" | "sway" | "idle";

  constructor(scene: Phaser.Scene, x: number, y: number, color: number, behavior: "dance" | "sway" | "idle") {
    super(scene, x, y);
    this.homeX = x;
    this.homeY = y;
    this.phase = Math.random() * Math.PI * 2;
    this.behavior = behavior;
    const body = scene.add.rectangle(0, 8, 22, 26, color).setStrokeStyle(3, 0x261d3a);
    const head = scene.add.rectangle(0, -12, 18, 16, 0xf1bd9d).setStrokeStyle(2, 0x5c3549);
    const hair = scene.add.rectangle(0, -20, 20, 7, 0x512d4a);
    this.add([body, head, hair]);
    scene.add.existing(this);
  }

  update(time: number) {
    const wave = Math.sin(time / (this.behavior === "dance" ? 170 : 600) + this.phase);
    this.y = this.homeY + (this.behavior === "dance" ? wave * 2 : 0);
    this.x = this.behavior === "sway" ? this.homeX + wave * 8 : this.homeX;
    this.setScale(1, this.behavior === "dance" ? 1 + Math.abs(wave) * 0.04 : 1);
  }
}