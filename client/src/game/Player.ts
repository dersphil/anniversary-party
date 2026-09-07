import Phaser from "phaser";
import { PLAYER_SPEED } from "./config";

export class Player extends Phaser.Physics.Arcade.Sprite {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  wasd: any;

  direction = "down";
  isMoving = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string
  ) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);

    this.cursors = scene.input.keyboard!.createCursorKeys();

    this.wasd = scene.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
  }

  update(controlsEnabled = true) {
    const body = this.body as Phaser.Physics.Arcade.Body;

    body.setVelocity(0);

    if (!controlsEnabled) {
      this.isMoving = false;
      return;
    }

    let moving = false;

    if (
      this.cursors.left.isDown ||
      this.wasd.left.isDown
    ) {
      body.setVelocityX(-PLAYER_SPEED);
      this.direction = "left";
      moving = true;
    }

    if (
      this.cursors.right.isDown ||
      this.wasd.right.isDown
    ) {
      body.setVelocityX(PLAYER_SPEED);
      this.direction = "right";
      moving = true;
    }

    if (
      this.cursors.up.isDown ||
      this.wasd.up.isDown
    ) {
      body.setVelocityY(-PLAYER_SPEED);
      this.direction = "up";
      moving = true;
    }

    if (
      this.cursors.down.isDown ||
      this.wasd.down.isDown
    ) {
      body.setVelocityY(PLAYER_SPEED);
      this.direction = "down";
      moving = true;
    }

    if (moving) {
      this.setScale(1.05);
    } else {
      this.setScale(1);
    }
    this.isMoving = moving;
  }
}