import Phaser from "phaser";
import { GameScene } from "./game/GameScene";
import {
  GAME_WIDTH,
  GAME_HEIGHT,
} from "./game/config";

const config: Phaser.Types.Core.GameConfig =
  {
    type: Phaser.AUTO,

    width: GAME_WIDTH,

    height: GAME_HEIGHT,

    parent: "game",

    backgroundColor: "#18202b",

    pixelArt: true,

    physics: {
      default: "arcade",

      arcade: {
        debug: false,
        gravity: { x: 0, y: 0 },
      },
    },

    scene: [GameScene],

    scale: {
      mode: Phaser.Scale.FIT,

      autoCenter:
        Phaser.Scale.CENTER_BOTH,
    },
  };

new Phaser.Game(config);