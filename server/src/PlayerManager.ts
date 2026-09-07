export interface PlayerState {
  id: string;
  x: number;
  y: number;
  direction: string;
  isMoving: boolean;
  name: string;
}

export class PlayerManager {
  private readonly players = new Map<string, PlayerState>();

  add(id: string, name: string): PlayerState {
    const player = { id, x: 480, y: 540, direction: "up", isMoving: false, name };
    this.players.set(id, player);
    return player;
  }

  get(id: string) { return this.players.get(id); }
  remove(id: string) { this.players.delete(id); }
  all() { return Object.fromEntries(this.players); }

  update(id: string, data: { x: number; y: number; direction: string; isMoving: boolean }) {
    const player = this.players.get(id);
    if (!player) return undefined;
    player.x = Math.max(30, Math.min(930, Number(data.x) || player.x));
    player.y = Math.max(30, Math.min(590, Number(data.y) || player.y));
    player.direction = ["up", "down", "left", "right"].includes(data.direction) ? data.direction : player.direction;
    player.isMoving = Boolean(data.isMoving);
    return player;
  }
}