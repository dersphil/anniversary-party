import { PlayerManager } from "./PlayerManager.js";

export class GameRoom {
  readonly players = new PlayerManager();
  readonly sockets = new Set<string>();

  constructor(readonly code: string) {}

  isFull() { return this.sockets.size >= 2; }
}