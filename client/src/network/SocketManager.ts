import { io, Socket } from "socket.io-client";
import { SERVER_URL } from "../game/config";

export interface NetworkPlayer {
  id: string;
  x: number;
  y: number;
  direction: string;
  name: string;
  isMoving: boolean;
}

export class SocketManager {
  socket: Socket;

  constructor() {
    this.socket = io(SERVER_URL);
  }

  createRoom(name: string) { this.socket.emit("createRoom", { name }); }
  joinRoom(roomCode: string, name: string) { this.socket.emit("joinRoom", { roomCode, name }); }

  sendMovement(
    x: number,
    y: number,
    direction: string,
    isMoving = false
  ) {
    this.socket.emit("playerMovement", {
      x,
      y,
      direction,
      isMoving,
    });
  }

  sendMessage(message: string) {
    this.socket.emit("chatMessage", message);
  }
}