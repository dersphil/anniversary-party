import Phaser from "phaser";

export class ChatBubble {
  private readonly text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, message: string) {
    this.text = scene.add.text(x, y - 55, message, {
      fontFamily: "monospace", fontSize: "14px", color: "#251d36",
      backgroundColor: "#fff6fb", padding: { x: 9, y: 7 },
      wordWrap: { width: 190 }, align: "center",
    }).setOrigin(0.5).setDepth(20);
    scene.time.delayedCall(5000, () => this.destroy());
  }

  destroy() { this.text.destroy(); }
}