import Phaser from "phaser";
export class NPC extends Phaser.GameObjects.Container {
    constructor(scene, x, y, color, behavior) {
        super(scene, x, y);
        Object.defineProperty(this, "homeX", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "homeY", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "phase", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "behavior", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
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
    update(time) {
        const wave = Math.sin(time / (this.behavior === "dance" ? 170 : 600) + this.phase);
        this.y = this.homeY + (this.behavior === "dance" ? wave * 2 : 0);
        this.x = this.behavior === "sway" ? this.homeX + wave * 8 : this.homeX;
        this.setScale(1, this.behavior === "dance" ? 1 + Math.abs(wave) * 0.04 : 1);
    }
}
