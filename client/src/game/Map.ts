import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "./config";

export class RooftopMap {
  readonly obstacles: Phaser.Physics.Arcade.StaticGroup;

  constructor(private readonly scene: Phaser.Scene) {
    this.obstacles = scene.physics.add.staticGroup();
    this.draw();
  }

  private draw() {
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0x182435).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    graphics.fillStyle(0x22334a).fillRect(18, 18, 924, 604);
    graphics.lineStyle(8, 0x0c1320).strokeRect(18, 18, 924, 604);

    graphics.fillStyle(0x314965).fillRect(55, 62, 850, 145);
    graphics.lineStyle(6, 0x101b2a).strokeRect(55, 62, 850, 145);
    graphics.fillStyle(0x111c2b);
    for (let x = 75; x < 890; x += 52) {
      const height = 28 + Phaser.Math.Between(0, 66);
      graphics.fillRect(x, 190 - height, 36, height);
      graphics.fillStyle(0xf7c95e, 0.6);
      graphics.fillRect(x + 9, 174 - height, 5, 5);
      graphics.fillRect(x + 23, 154 - height, 5, 5);
      graphics.fillStyle(0x111c2b);
    }

    const sign = this.scene.add.rectangle(480, 43, 270, 46, 0xdb5a9b);
    sign.setStrokeStyle(5, 0xffb8df);
    this.scene.add.text(480, 43, "TUSHITAS", {
      fontFamily: "monospace", fontSize: "27px", color: "#fff4fb",
      stroke: "#682957", strokeThickness: 5,
    }).setOrigin(0.5);

    graphics.fillStyle(0x5a2c75).fillRect(245, 265, 465, 220);
    graphics.lineStyle(7, 0xb64bd1).strokeRect(245, 265, 465, 220);
    graphics.lineStyle(2, 0xe47be5);
    for (let x = 245; x <= 710; x += 58) graphics.lineBetween(x, 265, x, 485);
    for (let y = 265; y <= 485; y += 55) graphics.lineBetween(245, y, 710, y);

    graphics.fillStyle(0x8d5b43).fillRect(750, 312, 135, 180);
    graphics.lineStyle(7, 0x41281f).strokeRect(750, 312, 135, 180);
    graphics.fillStyle(0xc18560).fillRect(730, 298, 175, 34);
    this.scene.add.text(817, 350, "BAR", {
      fontFamily: "monospace", fontSize: "18px", color: "#ffe7c2",
    }).setOrigin(0.5);

    for (let x = 84; x < 890; x += 61) {
      this.scene.add.circle(x, 232, 5, x % 2 ? 0x67e8e4 : 0xffd166);
    }
    this.addPlant(95, 275); this.addPlant(150, 535); this.addPlant(852, 550);
    this.addTable(105, 405); this.addTable(105, 500); this.addTable(825, 220);

    this.addObstacle(18, 18, 924, 12);
    this.addObstacle(18, 610, 924, 12);
    this.addObstacle(18, 18, 12, 604);
    this.addObstacle(930, 18, 12, 604);
    this.addObstacle(55, 202, 850, 12);
    this.addObstacle(750, 312, 135, 180);
    this.addObstacle(105, 405, 70, 70);
    this.addObstacle(105, 500, 70, 70);
    this.addObstacle(825, 220, 70, 70);
  }

  private addPlant(x: number, y: number) {
    this.scene.add.circle(x, y, 25, 0x28704f);
    this.scene.add.rectangle(x, y + 30, 20, 25, 0x935f47);
  }

  private addTable(x: number, y: number) {
    this.scene.add.circle(x, y, 35, 0x935f47);
    this.scene.add.rectangle(x, y + 30, 8, 30, 0x4a3022);
  }

  private addObstacle(x: number, y: number, width: number, height: number) {
    const obstacle = this.scene.add.rectangle(x + width / 2, y + height / 2, width, height);
    obstacle.setVisible(false);
    this.obstacles.add(obstacle);
  }
}